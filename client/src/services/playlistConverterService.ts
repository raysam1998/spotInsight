// client/src/services/playlistConverterService.ts

import spotifyService, { 
  SpotifyPlaylist, 
  PlaylistTrackItem,
  SpotifyTrack,
  SpotifyArtist
} from './spotifyService';

export interface FilterOptions {
  excludeArtists?: string[]; // Artist IDs to exclude
  excludeGenres?: string[]; // Genres to exclude
  excludeExplicit?: boolean; // Exclude explicit tracks
  minEnergy?: number; // 0.0 to 1.0
  maxEnergy?: number; // 0.0 to 1.0
  minDanceability?: number; // 0.0 to 1.0
  maxDanceability?: number; // 0.0 to 1.0
  minValence?: number; // 0.0 to 1.0 (mood - higher is happier)
  maxValence?: number; // 0.0 to 1.0 (mood - lower is sadder)
  excludeDecades?: string[]; // e.g. ["1980s", "1990s"]
}

export interface PlaylistCreationOptions {
  name: string;
  description?: string;
  isPublic?: boolean;
  imageBase64?: string; // Base64 encoded image
}

// Defining genres for filtering playlists
export const SpotifyGenres = [
  "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "blues",
  "classical", "country", "dance", "disco", "electronic", "folk", "funk",
  "hip-hop", "house", "indie", "indie-pop", "jazz", "k-pop", "latin",
  "metal", "pop", "punk", "r-n-b", "rap", "reggae", "reggaeton",
  "rock", "soul", "techno", "trance"
];

class PlaylistConverterService {
  /**
   * Filter tracks based on provided filter options
   */
  filterTracks(tracks: PlaylistTrackItem[], options: FilterOptions): PlaylistTrackItem[] {
    return tracks.filter(track => {
      // Skip tracks without valid data
      if (!track.track) return false;
      
      // Filter by explicit content
      if (options.excludeExplicit && track.track.explicit) {
        return false;
      }
      
      // Filter by artists
      if (options.excludeArtists && options.excludeArtists.length > 0) {
        const artistIds = track.track.artists.map(artist => artist.id);
        if (artistIds.some(id => options.excludeArtists?.includes(id))) {
          return false;
        }
      }
      
      // Filter by decades if release date is available
      if (options.excludeDecades && options.excludeDecades.length > 0 && track.track.album.release_date) {
        const year = parseInt(track.track.album.release_date.substring(0, 4), 10);
        if (!isNaN(year)) {
          const decade = `${Math.floor(year / 10) * 10}s`;
          if (options.excludeDecades.includes(decade)) {
            return false;
          }
        }
      }
      
      // Remove the audio features filtering section completely
      
      // If we've made it this far, the track passes all filters
      return true;
    });
  }
  
  /**
   * Create a new playlist based on a source playlist and filter options
   */
  async convertPlaylist(
    playlistId: string, 
    filters: FilterOptions, 
    playlistOptions: PlaylistCreationOptions
  ): Promise<SpotifyPlaylist> {
    try {
      // Get all tracks from the source playlist with audio features
      const response = await spotifyService.getPlaylistTracks(
        playlistId, 
        100, // Limit - should be increased for larger playlists
        0, 
        true // Include audio features
      );
      
      // Apply filters
      const filteredTracks = this.filterTracks(response.items, filters);
      
      // Create a new playlist
      const newPlaylist = await spotifyService.createPlaylist(
        playlistOptions.name,
        playlistOptions.description || '',
        playlistOptions.isPublic || false
      );
      
      // Add filtered tracks to the new playlist
      if (filteredTracks.length > 0) {
        const trackUris = filteredTracks.map(item => item.track.uri);
        
        // Spotify API has a limit of 100 tracks per request, so we need to chunk them
        for (let i = 0; i < trackUris.length; i += 100) {
          const chunk = trackUris.slice(i, i + 100);
          await spotifyService.addTracksToPlaylist(newPlaylist.id, chunk);
        }
      }
      
      // Update playlist image if provided
      if (playlistOptions.imageBase64) {
        await spotifyService.uploadPlaylistCoverImage(newPlaylist.id, playlistOptions.imageBase64);
      }
      
      return newPlaylist;
    } catch (error) {
      console.error('Error converting playlist:', error);
      throw error;
    }
  }
  
  /**
   * Merge multiple playlists into a new one with filter options
   */
  async mergePlaylists(
    playlistIds: string[], 
    filters: FilterOptions, 
    playlistOptions: PlaylistCreationOptions
  ): Promise<SpotifyPlaylist> {
    try {
      let allTracks: PlaylistTrackItem[] = [];
      
      // Get tracks from all playlists
      for (const id of playlistIds) {
        const response = await spotifyService.getPlaylistTracks(id, 100, 0, true);
        allTracks = [...allTracks, ...response.items];
      }
      
      // Remove duplicate tracks (based on track URI)
      const uniqueTracks = this.removeDuplicateTracks(allTracks);
      
      // Apply filters
      const filteredTracks = this.filterTracks(uniqueTracks, filters);
      
      // Create a new playlist
      const newPlaylist = await spotifyService.createPlaylist(
        playlistOptions.name,
        playlistOptions.description || '',
        playlistOptions.isPublic || false
      );
      
      // Add filtered tracks to the new playlist
      if (filteredTracks.length > 0) {
        const trackUris = filteredTracks.map(item => item.track.uri);
        
        // Spotify API has a limit of 100 tracks per request, so we need to chunk them
        for (let i = 0; i < trackUris.length; i += 100) {
          const chunk = trackUris.slice(i, i + 100);
          await spotifyService.addTracksToPlaylist(newPlaylist.id, chunk);
        }
      }
      
      // Update playlist image if provided
      if (playlistOptions.imageBase64) {
        await spotifyService.uploadPlaylistCoverImage(newPlaylist.id, playlistOptions.imageBase64);
      }
      
      return newPlaylist;
    } catch (error) {
      console.error('Error merging playlists:', error);
      throw error;
    }
  }
  
  /**
   * Remove duplicate tracks from an array of tracks
   */
  private removeDuplicateTracks(tracks: PlaylistTrackItem[]): PlaylistTrackItem[] {
    const uniqueTrackMap = new Map<string, PlaylistTrackItem>();
    
    tracks.forEach(item => {
      if (item.track && item.track.uri) {
        uniqueTrackMap.set(item.track.uri, item);
      }
    });
    
    return Array.from(uniqueTrackMap.values());
  }
  
  /**
   * Get unique artists from tracks
   */
  getUniqueArtistsFromTracks(tracks: PlaylistTrackItem[]): SpotifyArtist[] {
    const artistMap = new Map<string, SpotifyArtist>();
    
    tracks.forEach(item => {
      if (item.track && item.track.artists) {
        item.track.artists.forEach(artist => {
          if (!artistMap.has(artist.id)) {
            artistMap.set(artist.id, artist);
          }
        });
      }
    });
    
    return Array.from(artistMap.values());
  }
  
  /**
   * Get all decades represented in the tracks
   */
  getDecadesFromTracks(tracks: PlaylistTrackItem[]): string[] {
    const decades = new Set<string>();
    
    tracks.forEach(item => {
      if (item.track && item.track.album.release_date) {
        const year = parseInt(item.track.album.release_date.substring(0, 4), 10);
        if (!isNaN(year)) {
          const decade = `${Math.floor(year / 10) * 10}s`;
          decades.add(decade);
        }
      }
    });
    
    return Array.from(decades).sort();
  }
  
  /**
   * Calculate the approximate genre distribution for a playlist
   * This is an approximation since Spotify doesn't provide genre data directly for tracks
   */
  async calculateGenreDistribution(tracks: PlaylistTrackItem[]): Promise<Map<string, number>> {
    // This would require additional API calls to get artist genres
    // For now, this is a simplified version based on artist data
    const genreCount = new Map<string, number>();
    
    // Ideally, we would fetch genre data for each artist from Spotify API
    // This would require additional implementation and API calls
    
    return genreCount;
  }
  
  /**
   * Check if the source playlist is owned by the current user
   */
  isPlaylistOwnedByUser(playlist: SpotifyPlaylist, userId: string): boolean {
    return playlist.owner.id === userId;
  }
}

export default new PlaylistConverterService();