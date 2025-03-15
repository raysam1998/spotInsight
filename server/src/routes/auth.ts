import express from 'express';
import { generateSpotifyAuthUrl, handleSpotifyCallback } from '../controllers/auth';

const router = express.Router();

// Spotify authentication routes
router.get('/spotify', generateSpotifyAuthUrl);
router.get('/callback', handleSpotifyCallback);
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect(process.env.CLIENT_REDIRECT_URI || 'http://localhost:3000');
  });
});

export default router;
