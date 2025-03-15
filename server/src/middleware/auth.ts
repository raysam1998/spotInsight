import { Request, Response, NextFunction } from 'express';
import { refreshSpotifyTokenIfNeeded } from '../services/spotifyService';

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.spotifyTokens) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  
  try {
    // Check if token needs refreshing
    await refreshSpotifyTokenIfNeeded(req);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Clear session and redirect to login
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.status(401).json({ error: 'Authentication failed - Please log in again' });
    });
  }
};
