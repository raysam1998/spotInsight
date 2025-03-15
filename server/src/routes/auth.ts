// server/src/routes/auth.ts

import express from 'express';
import { 
  generateSpotifyAuthUrl, 
  handleSpotifyCallback,
  getAuthUrl,
  processCallbackCode,
  logout
} from '../controllers/auth';

const router = express.Router();

// Get Spotify authentication URL (for frontend to redirect)
router.get('/spotify/url', getAuthUrl);

// Direct redirect to Spotify authentication
router.get('/spotify', generateSpotifyAuthUrl);

// Handle the callback from Spotify OAuth
router.get('/callback', handleSpotifyCallback);

// Process authorization code from client
router.post('/callback', processCallbackCode);

// Logout route
router.get('/logout', logout);

export default router;