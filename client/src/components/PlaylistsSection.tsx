// client/src/components/PlaylistsSection.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import spotifyService, { SpotifyPlaylist } from '../services/spotifyService';
import PlaylistCard from './PlaylistCard';

const SectionContainer = styled.div`
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #191414;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #1DB954;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const LoadMoreButton = styled.button`
  background-color: #1DB954;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  margin: 20px auto;
  display: block;
  
  &:hover {
    background-color: #1ed760;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface PlaylistsSectionProps {
  limit?: number;
  showViewAll?: boolean;
  onPlaylistClick?: (playlistId: string) => void;
}

const PlaylistsSection: React.FC<PlaylistsSectionProps> = ({ 
  limit = 8, 
  showViewAll = true,
  onPlaylistClick 
}) => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const loadPlaylists = async (initialLoad = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentOffset = initialLoad ? 0 : offset;
      const response = await spotifyService.getUserPlaylists(limit, currentOffset);
      
      setTotal(response.total);
      setHasMore(Boolean(response.next));
      
      if (initialLoad) {
        setPlaylists(response.items);
      } else {
        setPlaylists(prevPlaylists => [...prevPlaylists, ...response.items]);
      }
      
      setOffset(currentOffset + limit);
    } catch (err) {
      setError('Failed to load playlists. Please try again later.');
      console.error('Error loading playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPlaylists(true);
  }, []);
  
  const handleLoadMore = () => {
    loadPlaylists();
  };
  
  const handlePlaylistClick = (playlistId: string) => {
    if (onPlaylistClick) {
      onPlaylistClick(playlistId);
    } else {
      // Navigate to playlist detail page
      navigate(`/playlist/${playlistId}`);
    }
  };
  
  const handleViewAll = () => {
    // For now, just load all playlists
    // In the future, this could navigate to a dedicated playlists page
    loadPlaylists(true);
  };
  
  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Your Playlists</SectionTitle>
        {showViewAll && playlists.length > 0 && (
          <ViewAllButton onClick={handleViewAll}>View All ({total})</ViewAllButton>
        )}
      </SectionHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {isLoading && playlists.length === 0 ? (
        <LoadingMessage>Loading your playlists...</LoadingMessage>
      ) : playlists.length === 0 ? (
        <p>You don't have any playlists yet.</p>
      ) : (
        <>
          <PlaylistsGrid>
            {playlists.map(playlist => (
              <PlaylistCard 
                key={playlist.id} 
                playlist={playlist} 
                onClick={handlePlaylistClick}
              />
            ))}
          </PlaylistsGrid>
          
          {hasMore && (
            <LoadMoreButton 
              onClick={handleLoadMore} 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </LoadMoreButton>
          )}
        </>
      )}
    </SectionContainer>
  );
};

export default PlaylistsSection;