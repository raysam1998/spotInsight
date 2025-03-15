// client/src/components/PlaylistCard.tsx

import React from 'react';
import { SpotifyPlaylist } from '../services/spotifyService';
import styled from 'styled-components';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onClick?: (playlistId: string) => void;
  selected?: boolean;
}

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const PlaylistImage = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 180px;
  background-color: ${props => props.hasImage ? 'transparent' : '#1DB954'};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaylistDetails = styled.div`
  padding: 15px;
`;

const PlaylistName = styled.h3`
  margin: 0 0 5px;
  color: #191414;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaylistInfo = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 10px;
`;

const PlaylistCreator = styled.div`
  font-size: 0.8rem;
  color: #888;
`;

const TrackPreview = styled.div`
  margin-top: 10px;
  border-top: 1px solid #eee;
  padding-top: 10px;
`;

const TrackItem = styled.div`
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(playlist.id);
    }
  };

  return (
    <Card onClick={handleClick}>
      <PlaylistImage hasImage={playlist.images && playlist.images.length > 0}>
        {playlist.images && playlist.images.length > 0 ? (
          <img src={playlist.images[0].url} alt={playlist.name} />
        ) : (
          <span>{playlist.name.charAt(0).toUpperCase()}</span>
        )}
      </PlaylistImage>
      
      <PlaylistDetails>
        <PlaylistName>{playlist.name}</PlaylistName>
        <PlaylistInfo>
          {playlist.tracks.total} tracks • {playlist.public ? 'Public' : 'Private'}
        </PlaylistInfo>
        <PlaylistCreator>
          By {playlist.owner.display_name}
        </PlaylistCreator>
        
        {playlist.tracks.preview && playlist.tracks.preview.length > 0 && (
          <TrackPreview>
            {playlist.tracks.preview.map((item, index) => (
              <TrackItem key={index}>
                {item.track.name} • {item.track.artists[0].name}
              </TrackItem>
            ))}
          </TrackPreview>
        )}
      </PlaylistDetails>
    </Card>
  );
};

export default PlaylistCard;