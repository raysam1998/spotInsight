// client/src/pages/PlaylistDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import spotifyService, { SpotifyPlaylist, PlaylistTrackItem } from '../services/spotifyService';
import ArtistDistributionChart from '../components/charts/ArtistDistributionChart';
import { useAuth } from 'contexts/AuthContext';
import PlaylistStats from 'components/playlistStats';
import DecadeDistributionChart from 'components/charts/DecadeDistributionChart';
import AudioFeaturesChart from 'components/charts/AudioFeaturesChart';
import TrackList from 'components/trackList';

// Styled components
const PlaylistDetailContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlaylistImage = styled.div<{ hasImage: boolean }>`
  width: 250px;
  height: 250px;
  flex-shrink: 0;
  margin-right: 30px;
  background-color: ${props => props.hasImage ? 'transparent' : '#1DB954'};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 4rem;
  font-weight: bold;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
    width: 200px;
    height: 200px;
  }
`;

const PlaylistInfo = styled.div`
  flex: 1;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
  margin-bottom: 15px;
  
  &:hover {
    color: #1DB954;
  }
  
  svg {
    margin-right: 5px;
  }
`;

const PlaylistTitle = styled.h1`
  margin: 0 0 10px;
  font-size: 2.5rem;
  color: #191414;
`;

const PlaylistDescription = styled.p`
  margin: 0 0 15px;
  color: #666;
  font-size: 1rem;
  white-space: pre-wrap;
`;

const PlaylistMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
  
  > div {
    margin-right: 20px;
    margin-bottom: 10px;
    color: #666;
    font-size: 0.9rem;
  }
  
  strong {
    color: #191414;
  }
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin: 30px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #191414;
    font-size: 1.2rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 10px;
  margin: 30px 0;
`;

const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch playlist details and tracks
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }
    
    if (!playlistId) return;
    
    const fetchPlaylistData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First get the playlist details
        const playlistsResponse = await spotifyService.getUserPlaylists(50);
        const targetPlaylist = playlistsResponse.items.find(p => p.id === playlistId);
        
        if (!targetPlaylist) {
          throw new Error('Playlist not found');
        }
        
        setPlaylist(targetPlaylist);
        
        // Then get all tracks with audio features
        const tracksResponse = await spotifyService.getPlaylistTracks(
          playlistId,
          100, // Limit to 100 tracks for now
          0,
          true // Include audio features
        );
        
        setTracks(tracksResponse.items);
      } catch (err) {
        console.error('Error fetching playlist data:', err);
        setError('Failed to load playlist. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylistData();
  }, [playlistId, navigate, isAuthenticated, authLoading]);
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  if (isLoading || authLoading) {
    return (
      <PlaylistDetailContainer>
        <LoadingContainer>
          Loading playlist data...
        </LoadingContainer>
      </PlaylistDetailContainer>
    );
  }
  
  if (error) {
    return (
      <PlaylistDetailContainer>
        <BackButton onClick={handleBack}>
          <span>← Back to Dashboard</span>
        </BackButton>
        <ErrorContainer>
          <h3>Error</h3>
          <p>{error}</p>
        </ErrorContainer>
      </PlaylistDetailContainer>
    );
  }
  
  if (!playlist) {
    return (
      <PlaylistDetailContainer>
        <BackButton onClick={handleBack}>
          <span>← Back to Dashboard</span>
        </BackButton>
        <ErrorContainer>
          <h3>Playlist Not Found</h3>
          <p>The playlist you're looking for doesn't exist or you don't have access to it.</p>
        </ErrorContainer>
      </PlaylistDetailContainer>
    );
  }
  
  return (
    <PlaylistDetailContainer>
      <BackButton onClick={handleBack}>
        <span>← Back to Dashboard</span>
      </BackButton>
      
      <Header>
        <PlaylistImage hasImage={playlist.images && playlist.images.length > 0}>
          {playlist.images && playlist.images.length > 0 ? (
            <img src={playlist.images[0].url} alt={playlist.name} />
          ) : (
            <span>{playlist.name.charAt(0).toUpperCase()}</span>
          )}
        </PlaylistImage>
        
        <PlaylistInfo>
          <PlaylistTitle>{playlist.name}</PlaylistTitle>
          
          {playlist.description && (
            <PlaylistDescription>{playlist.description}</PlaylistDescription>
          )}
          
          <PlaylistMeta>
            <div>
              <strong>{tracks.length}</strong> tracks
            </div>
            <div>
              Created by <strong>{playlist.owner.display_name}</strong>
            </div>
            <div>
              <strong>{playlist.public ? 'Public' : 'Private'}</strong> playlist
            </div>
            <div>
              <strong>{playlist.followers?.total || 0}</strong> followers
            </div>
          </PlaylistMeta>
        </PlaylistInfo>
      </Header>
      
      <PlaylistStats tracks={tracks} />
      
      <ChartsContainer>
        <ChartCard>
          <h3>Artist Distribution</h3>
          <ArtistDistributionChart tracks={tracks} />
        </ChartCard>
        
        <ChartCard>
          <h3>Tracks by Decade</h3>
          <DecadeDistributionChart tracks={tracks} />
        </ChartCard>
        
        <ChartCard>
          <h3>Energy vs. Danceability</h3>
          <AudioFeaturesChart tracks={tracks} />
        </ChartCard>
      </ChartsContainer>
      
      <TrackList tracks={tracks} />
    </PlaylistDetailContainer>
  );
};

export default PlaylistDetail;