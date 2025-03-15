// server/src/controllers/spotify.ts

import { Request, Response } from 'express';
import { getSpotifyApiWithTokens } from '../services/spotifyService';

// Get the current user's profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getMe();
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get the current user's playlists with additional metadata
export const getUserPlaylists = async (req: Request, res: Response) => {
  try {
    const spotifyApi = getSpotifyApiWithTokens(req);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Get playlists with pagination support
    const data = await spotifyApi.getUserPlaylists({ limit, offset });
    
    // For each playlist, get a few tracks to display as preview
    const enhancedPlaylists = await Promise.all(
      data.body.items.map(async (playlist) => {
        try {
          // Get first 3 tracks for preview
          const trackData = await spotifyApi.getPlaylistTracks(playlist.id, {
            limit: 3,
            offset: 0,
            fields: 'items(track(id,name,artists,album(name,images)))'
          });
          
          return {
            ...playlist,
            tracks: {
              ...playlist.tracks,
              preview: trackData.body.items
            }
          };
        } catch (error) {
          console.error(`Error fetching preview tracks for playlist ${playlist.id}:`, error);
          return playlist;
        }
      })
    );
    
    res.json({
      ...data.body,
      items: enhancedPlaylists
    });
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    res.status(500).json({ error: 'Failed to fetch user playlists' });
  }
};

// Get tracks from a playlist with detailed audio features
export const getPlaylistTracks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeAudioFeatures = req.query.includeAudioFeatures === 'true';
    
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getPlaylistTracks(id, { 
      limit, 
      offset,
      fields: 'items(added_at,track(id,name,artists,album,duration_ms,explicit,popularity,preview_url)),total,limit,offset,href,next,previous'
    });
    
    // Get audio features for all tracks if requested
    if (includeAudioFeatures) {
      // Extract track IDs, filtering out any null tracks
      const trackIds = data.body.items
        .filter(item => item.track && item.track.id)
        .map(item => item.track.id);
      
      if (trackIds.length > 0) {
        try {
          // Split into batches of 100 (Spotify API limit)
          const audioFeaturesBatches = [];
          for (let i = 0; i < trackIds.length; i += 100) {
            const batchIds = trackIds.slice(i, i + 100);
            const batchFeatures = await spotifyApi.getAudioFeaturesForTracks(batchIds);
            audioFeaturesBatches.push(...batchFeatures.body.audio_features);
          }
          
          // Create a map of track ID to audio features
          const audioFeaturesMap = audioFeaturesBatches.reduce((map, features) => {
            if (features && features.id) {
              map[features.id] = features;
            }
            return map;
          }, {});
          
          // Merge audio features with track data
          const tracksWithFeatures = data.body.items.map(item => {
            if (item.track && item.track.id && audioFeaturesMap[item.track.id]) {
              return {
                ...item,
                audio_features: audioFeaturesMap[item.track.id]
              };
            }
            return item;
          });
          
          return res.json({
            ...data.body,
            items: tracksWithFeatures
          });
        } catch (featuresError) {
          console.error('Error fetching audio features:', featuresError);
          // Continue without audio features if there's an error
        }
      }
    }
    
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
};

// Create a new playlist
export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { name, description, isPublic } = req.body;
    const spotifyApi = getSpotifyApiWithTokens(req);
    
    // Get user ID
    const user = await spotifyApi.getMe();
    const userId = user.body.id;
    
    const data = await spotifyApi.createPlaylist(userId, name, { 
      description, 
      public: isPublic || false 
    });
    
    res.status(201).json(data.body);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

// Modify an existing playlist
export const modifyPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, addTracks, removeTracks } = req.body;
    
    const spotifyApi = getSpotifyApiWithTokens(req);
    
    // Update playlist details if provided
    if (name || description || isPublic !== undefined) {
      await spotifyApi.changePlaylistDetails(id, { 
        name, 
        description,
        public: isPublic
      });
    }
    
    // Add tracks if provided
    if (addTracks && addTracks.length > 0) {
      await spotifyApi.addTracksToPlaylist(id, addTracks);
    }
    
    // Remove tracks if provided
    if (removeTracks && removeTracks.length > 0) {
      await spotifyApi.removeTracksFromPlaylist(id, removeTracks.map((uri: string) => ({ uri })));
    }
    
    // Get the updated playlist
    const data = await spotifyApi.getPlaylist(id);
    res.json(data.body);
  } catch (error) {
    console.error('Error modifying playlist:', error);
    res.status(500).json({ error: 'Failed to modify playlist' });
  }
};

// Get recently played tracks
export const getRecentlyPlayed = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit });
    
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
};

// Get user's top artists
export const getTopArtists = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const timeRange = (req.query.time_range as string) || 'medium_term'; // short_term, medium_term, long_term
    
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getMyTopArtists({ limit, time_range: timeRange });
    
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching top artists:', error);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
};

// Get user's top tracks
export const getTopTracks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const timeRange = (req.query.time_range as string) || 'medium_term'; // short_term, medium_term, long_term
    
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getMyTopTracks({ limit, time_range: timeRange });
    
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
};