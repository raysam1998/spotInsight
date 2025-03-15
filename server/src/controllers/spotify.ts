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

// Get the current user's playlists
export const getUserPlaylists = async (req: Request, res: Response) => {
  try {
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getUserPlaylists();
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    res.status(500).json({ error: 'Failed to fetch user playlists' });
  }
};

// Get tracks from a playlist
export const getPlaylistTracks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const spotifyApi = getSpotifyApiWithTokens(req);
    const data = await spotifyApi.getPlaylistTracks(id);
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
    
    const data = await spotifyApi.createPlaylist(name, { 
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
