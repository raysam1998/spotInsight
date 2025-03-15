// server/src/controllers/auth.ts

import { Request, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { getSpotifyApi } from '../services/spotifyService';

// Generate the Spotify authorization URL and return it to the client
export const getAuthUrl = (req: Request, res: Response) => {
  try {
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
    res.json({ url: authorizeURL });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
};

// Directly redirect to Spotify for authentication
export const generateSpotifyAuthUrl = (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error during Spotify auth redirect:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Handle the callback from Spotify
export const handleSpotifyCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const storedState = req.session.spotifyAuthState;
  
  console.log('Callback received:', { 
    code: code ? 'present' : 'missing',
    state,
    storedState,
    match: state === storedState,
    session: req.session.id // Log session ID to track session persistence
  });
  
  if (state !== storedState) {
    console.warn('State mismatch:', { received: state, stored: storedState });
    return res.redirect(`${process.env.CLIENT_REDIRECT_URI || 'http://localhost:3000/callback'}?error=state_mismatch`);
  }
  
  try {
    const spotifyApi = getSpotifyApi();
    console.log('Exchanging code for tokens...');
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    
    // Log token info (without exposing the actual tokens)
    console.log('Tokens received:', { 
      access_token: data.body.access_token ? 'present' : 'missing',
      refresh_token: data.body.refresh_token ? 'present' : 'missing',
      expires_in: data.body.expires_in
    });
    
    // Save the tokens in session
    req.session.spotifyTokens = {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresAt: Date.now() + data.body.expires_in * 1000
    };
    
    // Force session save to make sure tokens are stored
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.redirect(`${process.env.CLIENT_REDIRECT_URI}?error=session_error`);
      }
      
      console.log('Session saved successfully, redirecting to client');
      const redirectUrl = `${process.env.CLIENT_REDIRECT_URI}?success=true`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    });
  } catch (error) {
    console.error('Error during Spotify callback:', error);
    res.redirect(`${process.env.CLIENT_REDIRECT_URI}?error=authentication_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
};

// Process callback from the client side when using the API approach
export const processCallbackCode = async (req: Request, res: Response) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    const spotifyApi = getSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    // Save the tokens in session
    req.session.spotifyTokens = {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresAt: Date.now() + data.body.expires_in * 1000
    };
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing callback code:', error);
    res.status(500).json({ error: 'Failed to process authorization code' });
  }
};

// Log out the user
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.status(200).json({ success: true });
  });
};