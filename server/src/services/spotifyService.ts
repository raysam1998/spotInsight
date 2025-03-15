import { Request } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';

// Create a new SpotifyWebApi instance
export const getSpotifyApi = () => {
  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
  });
};

// Get a SpotifyWebApi instance with the current user's tokens
export const getSpotifyApiWithTokens = (req: Request) => {
  const spotifyApi = getSpotifyApi();
  
  if (req.session.spotifyTokens) {
    spotifyApi.setAccessToken(req.session.spotifyTokens.accessToken);
    spotifyApi.setRefreshToken(req.session.spotifyTokens.refreshToken);
  }
  
  return spotifyApi;
};

// Refresh the Spotify access token if it's expired or about to expire
export const refreshSpotifyTokenIfNeeded = async (req: Request): Promise<void> => {
  if (!req.session.spotifyTokens) {
    throw new Error('No Spotify tokens in session');
  }
  
  // Check if the token is expired or about to expire (within 5 minutes)
  const isExpired = Date.now() > req.session.spotifyTokens.expiresAt - 5 * 60 * 1000;
  
  if (isExpired) {
    const spotifyApi = getSpotifyApi();
    spotifyApi.setRefreshToken(req.session.spotifyTokens.refreshToken);
    
    try {
      const data = await spotifyApi.refreshAccessToken();
      
      // Update the tokens in session
      req.session.spotifyTokens = {
        accessToken: data.body.access_token,
        refreshToken: req.session.spotifyTokens.refreshToken, // Keep the refresh token
        expiresAt: Date.now() + data.body.expires_in * 1000
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh Spotify token');
    }
  }
};
