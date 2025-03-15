// client/src/hooks/useSpotify.ts

import { useState, useEffect } from 'react';
import spotifyService, { 
  SpotifyPlaylist, 
  PlaylistsResponse,
  PlaylistTracksResponse
} from '../services/spotifyService';

export function usePlaylists(initialLimit = 20, initialOffset = 0) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const loadPlaylists = async (limit = initialLimit, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const response = await spotifyService.getUserPlaylists(limit, currentOffset);
      
      setTotal(response.total);
      setHasMore(Boolean(response.next));
      
      if (reset) {
        setPlaylists(response.items);
        setOffset(limit);
      } else {
        setPlaylists(prevPlaylists => [...prevPlaylists, ...response.items]);
        setOffset(currentOffset + limit);
      }
    } catch (err) {
      setError('Failed to load playlists. Please try again later.');
      console.error('Error loading playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPlaylists(initialLimit, true);
  }, [initialLimit]);
  
  const loadMore = () => loadPlaylists();
  const refresh = () => loadPlaylists(initialLimit, true);
  
  return {
    playlists,
    isLoading,
    error,
    hasMore,
    total,
    loadMore,
    refresh
  };
}

export function usePlaylistTracks(
  playlistId: string | null, 
  initialLimit = 100, 
  includeAudioFeatures = false
) {
  const [tracks, setTracks] = useState<PlaylistTracksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTracks = async () => {
      if (!playlistId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await spotifyService.getPlaylistTracks(
          playlistId, 
          initialLimit, 
          0, 
          includeAudioFeatures
        );
        
        setTracks(response);
      } catch (err) {
        setError('Failed to load playlist tracks. Please try again later.');
        console.error('Error loading playlist tracks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTracks();
  }, [playlistId, initialLimit, includeAudioFeatures]);
  
  return {
    tracks,
    isLoading,
    error
  };
}