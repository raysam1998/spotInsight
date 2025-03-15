import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import { 
  getUserProfile, 
  getUserPlaylists, 
  getPlaylistTracks,
  createPlaylist,
  modifyPlaylist
} from '../controllers/spotify';

const router = express.Router();

// Spotify API routes (all protected with authentication)
router.get('/me', isAuthenticated, getUserProfile);
router.get('/playlists', isAuthenticated, getUserPlaylists);
router.get('/playlists/:id/tracks', isAuthenticated, getPlaylistTracks);
router.post('/playlists', isAuthenticated, createPlaylist);
router.put('/playlists/:id', isAuthenticated, modifyPlaylist);

export default router;
