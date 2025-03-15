// client/src/components/TrackList.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { PlaylistTrackItem } from '../services/spotifyService';

const TrackListContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const TrackListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TrackListTitle = styled.h2`
  margin: 0;
  color: #191414;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  width: 250px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #1DB954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 10px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  border-bottom: 1px solid #eaeaea;
  
  th {
    text-align: left;
    padding: 12px 15px;
    color: #666;
    font-weight: 600;
    font-size: 0.85rem;
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #f5f5f5;
    
    &:hover {
      background-color: #f9f9f9;
    }
  }
  
  td {
    padding: 12px 15px;
    color: #333;
    font-size: 0.9rem;
  }
`;

const TrackNumber = styled.td`
  width: 50px;
  color: #999;
  font-size: 0.8rem;
`;

const TrackInfo = styled.td`
  display: flex;
  align-items: center;
`;

const AlbumImage = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #eee;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TrackDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TrackName = styled.div`
  font-weight: 500;
  margin-bottom: 3px;
`;

const TrackArtist = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const TrackAlbum = styled.td`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const TrackDuration = styled.td`
  text-align: right;
  width: 80px;
  color: #666;
`;

const LoadMoreButton = styled.button`
  background-color: transparent;
  color: #1DB954;
  border: 1px solid #1DB954;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  margin: 20px auto 10px;
  display: block;
  
  &:hover {
    background-color: rgba(29, 185, 84, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
`;

interface TrackListProps {
  tracks: PlaylistTrackItem[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const filteredTracks = tracks.filter(item => {
    const query = searchQuery.toLowerCase();
    const trackName = item.track.name.toLowerCase();
    const artistNames = item.track.artists.map(artist => artist.name.toLowerCase()).join(' ');
    const albumName = item.track.album.name.toLowerCase();
    
    return trackName.includes(query) || artistNames.includes(query) || albumName.includes(query);
  });
  
  const displayTracks = filteredTracks.slice(0, displayCount);
  
  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 20);
  };
  
  if (tracks.length === 0) {
    return (
      <TrackListContainer>
        <TrackListHeader>
          <TrackListTitle>Tracks</TrackListTitle>
        </TrackListHeader>
        <EmptyState>This playlist doesn't have any tracks yet.</EmptyState>
      </TrackListContainer>
    );
  }
  
  return (
    <TrackListContainer>
      <TrackListHeader>
        <TrackListTitle>Tracks</TrackListTitle>
        <SearchInput
          type="text"
          placeholder="Search in playlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </TrackListHeader>
      
      <Table>
        <TableHead>
          <tr>
            <th>#</th>
            <th>Track</th>
            <th>Album</th>
            <th>Duration</th>
          </tr>
        </TableHead>
        <TableBody>
          {displayTracks.map((item, index) => (
            <tr key={`${item.track.id}-${index}`}>
              <TrackNumber>{index + 1}</TrackNumber>
              <TrackInfo>
                <AlbumImage>
                  {item.track.album.images && item.track.album.images.length > 0 && (
                    <img 
                      src={item.track.album.images[item.track.album.images.length - 1].url} 
                      alt={item.track.album.name} 
                    />
                  )}
                </AlbumImage>
                <TrackDetails>
                  <TrackName>{item.track.name}</TrackName>
                  <TrackArtist>
                    {item.track.artists.map(artist => artist.name).join(', ')}
                  </TrackArtist>
                </TrackDetails>
              </TrackInfo>
              <TrackAlbum>{item.track.album.name}</TrackAlbum>
              <TrackDuration>{formatDuration(item.track.duration_ms)}</TrackDuration>
            </tr>
          ))}
        </TableBody>
      </Table>
      
      {filteredTracks.length > displayCount && (
        <LoadMoreButton onClick={handleLoadMore}>
          Show More
        </LoadMoreButton>
      )}
    </TrackListContainer>
  );
};

export default TrackList;