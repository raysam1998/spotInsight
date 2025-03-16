// client/src/components/playlist-converter/PlaylistSelectionStep.tsx

import React from 'react';
import styled from 'styled-components';
import { SpotifyPlaylist } from '../../services/spotifyService';
import PlaylistCard from '../PlaylistCard';

interface PlaylistSelectionStepProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylists: SpotifyPlaylist[];
  isMultiSelect: boolean;
  isLoading: boolean;
  hasMore: boolean;
  onPlaylistSelect: (playlist: SpotifyPlaylist) => void;
  onLoadMore: () => void;
}

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const LoadMoreButton = styled.button`
  background: none;
  border: 1px solid #1DB954;
  color: #1DB954;
  border-radius: 30px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: block;
  margin: 20px auto 0;
  
  &:hover {
    background-color: rgba(29, 185, 84, 0.1);
  }
  
  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const NoPlaylistsMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
`;

const PlaylistSelectionStep: React.FC<PlaylistSelectionStepProps> = ({
  playlists,
  selectedPlaylists,
  isMultiSelect,
  isLoading,
  hasMore,
  onPlaylistSelect,
  onLoadMore
}) => {
  // Function to check if a playlist is selected
  const isPlaylistSelected = (playlist: SpotifyPlaylist) => {
    return selectedPlaylists.some(p => p.id === playlist.id);
  };

  if (isLoading && playlists.length === 0) {
    return <LoadingMessage>Loading your playlists...</LoadingMessage>;
  }

  if (playlists.length === 0) {
    return (
      <NoPlaylistsMessage>
        You don't have any playlists yet. Create a playlist on Spotify first.
      </NoPlaylistsMessage>
    );
  }

  return (
    <>
      <PlaylistGrid>
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            selected={isPlaylistSelected(playlist)}
            onClick={() => onPlaylistSelect(playlist)}
          />
        ))}
      </PlaylistGrid>
      
      {hasMore && (
        <LoadMoreButton
          onClick={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load More Playlists'}
        </LoadMoreButton>
      )}
    </>
  );
};

export default PlaylistSelectionStep;