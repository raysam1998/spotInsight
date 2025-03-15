// client/src/services/spotifyService.ts

import axios from 'axios';

// Define our interfaces based on Spotify API response structure
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date?: string;
  release_date_precision?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  preview_url: string | null;
  explicit?: boolean;
  popularity?: number;
}

export interface AudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
}

export interface PlaylistTrackItem {
  added_at: string;
  track: SpotifyTrack;
  audio_features?: AudioFeatures;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  owner: {
    id: string;
    display_name: string;
  };
  images: SpotifyImage[];
  tracks: {
    total: number;
    href: string;
    preview?: PlaylistTrackItem[];
  };
  uri: string;
  followers?: {
    total: number;
  };
}

export interface PlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

export interface PlaylistTracksResponse {
  items: PlaylistTrackItem[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

class SpotifyService {
  private api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
  });

  async getUserPlaylists(limit = 20, offset = 0): Promise<PlaylistsResponse> {
    try {
      const response = await this.api.get(`/api/spotify/playlists?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user playlists:', error);
      throw error;
    }
  }

  async getPlaylistTracks(
    playlistId: string,
    limit = 100,
    offset = 0,
    includeAudioFeatures = false
  ): Promise<PlaylistTracksResponse> {
    try {
      const response = await this.api.get(
        `/api/spotify/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&includeAudioFeatures=${includeAudioFeatures}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to get tracks for playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async getRecentlyPlayed(limit = 20): Promise<{ items: any[] }> {
    try {
      const response = await this.api.get(`/api/spotify/recently-played?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get recently played tracks:', error);
      throw error;
    }
  }

  async getTopArtists(limit = 10, timeRange = 'medium_term'): Promise<{ items: any[] }> {
    try {
      const response = await this.api.get(
        `/api/spotify/top-artists?limit=${limit}&time_range=${timeRange}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get top artists:', error);
      throw error;
    }
  }

  async getTopTracks(limit = 10, timeRange = 'medium_term'): Promise<{ items: any[] }> {
    try {
      const response = await this.api.get(
        `/api/spotify/top-tracks?limit=${limit}&time_range=${timeRange}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get top tracks:', error);
      throw error;
    }
  }

  async createPlaylist(name: string, description = '', isPublic = false): Promise<SpotifyPlaylist> {
    try {
      const response = await this.api.post('/api/spotify/playlists', {
        name,
        description,
        isPublic
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  }
}

export default new SpotifyService();