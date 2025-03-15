import { Request, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { getSpotifyApi } from '../services/spotifyService';

// Generate the Spotify authorization URL
export const generateSpotifyAuthUrl = (req: Request, res: Response) => {
  const spotifyApi = getSpotifyApi();
  
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-top-read',
    'user-read-recently-played'
  ];
  
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in session to prevent CSRF attacks
  req.session.spotifyAuthState = state;
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
};

// Handle the callback from Spotify
export const handleSpotifyCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const storedState = req.session.spotifyAuthState;
  
  if (state !== storedState) {
    return res.status(400).json({ error: 'State mismatch' });
  }
  
  try {
    const spotifyApi = getSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    
    // Save the tokens in session
    req.session.spotifyTokens = {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresAt: Date.now() + data.body.expires_in * 1000
    };
    
    // Redirect to the client application
    res.redirect(`${process.env.CLIENT_REDIRECT_URI || 'http://localhost:3000/callback'}`);
  } catch (error) {
    console.error('Error during Spotify callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
};
