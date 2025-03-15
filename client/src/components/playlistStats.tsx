// client/src/components/PlaylistStats.tsx

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PlaylistTrackItem } from '../services/spotifyService';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  color: #191414;
  font-size: 2rem;
  font-weight: 600;
`;

const StatSubValue = styled.div`
  color: #999;
  font-size: 0.85rem;
  margin-top: 5px;
`;

interface PlaylistStatsProps {
  tracks: PlaylistTrackItem[];
}

const PlaylistStats: React.FC<PlaylistStatsProps> = ({ tracks }) => {
  const stats = useMemo(() => {
    // Skip calculation if no tracks
    if (!tracks.length) {
      return {
        totalDuration: 0,
        formattedDuration: '0h 0m',
        uniqueArtists: 0,
        explicitTracks: 0,
        explicitPercentage: 0,
        releaseDates: { oldest: '', newest: '', averageYear: 0 },
        popularityScore: 0,
        energyScore: 0,
        danceabilityScore: 0
      };
    }
    
    // Total duration
    const totalMs = tracks.reduce((sum, item) => sum + item.track.duration_ms, 0);
    const totalMinutes = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Unique artists
    const artistIds = new Set<string>();
    tracks.forEach(item => {
      item.track.artists.forEach(artist => {
        artistIds.add(artist.id);
      });
    });
    
    // Explicit tracks
    const explicitTracks = tracks.filter(item => item.track.explicit || false).length;
    const explicitPercentage = (explicitTracks / tracks.length) * 100;
    
    // Release dates
    const years: number[] = [];
    let oldestYear = 3000;
    let newestYear = 0;
    let oldestTrack = '';
    let newestTrack = '';
    
    tracks.forEach(item => {
      // Extract release date information
      const albumReleaseDate = item.track.album.release_date || '';
      const year = parseInt(albumReleaseDate.substring(0, 4), 10);
      
      if (!isNaN(year)) {
        years.push(year);
        
        if (year < oldestYear) {
          oldestYear = year;
          oldestTrack = item.track.name;
        }
        
        if (year > newestYear) {
          newestYear = year;
          newestTrack = item.track.name;
        }
      }
    });
    
    const averageYear = years.length 
      ? Math.round(years.reduce((sum, year) => sum + year, 0) / years.length) 
      : 0;
    
    // Audio features (if available)
    let energyScore = 0;
    let danceabilityScore = 0;
    let featuresCount = 0;
    
    tracks.forEach(item => {
      if (item.audio_features) {
        energyScore += item.audio_features.energy || 0;
        danceabilityScore += item.audio_features.danceability || 0;
        featuresCount++;
      }
    });
    
    if (featuresCount > 0) {
      energyScore = Math.round((energyScore / featuresCount) * 100);
      danceabilityScore = Math.round((danceabilityScore / featuresCount) * 100);
    }
    
    return {
      totalDuration: totalMs,
      formattedDuration: `${hours}h ${minutes}m`,
      uniqueArtists: artistIds.size,
      explicitTracks,
      explicitPercentage,
      releaseDates: {
        oldest: oldestYear !== 3000 ? `${oldestYear} (${oldestTrack})` : 'Unknown',
        newest: newestYear !== 0 ? `${newestYear} (${newestTrack})` : 'Unknown',
        averageYear: averageYear || 0
      },
      energyScore,
      danceabilityScore
    };
  }, [tracks]);
  
  return (
    <StatsContainer>
      <StatCard>
        <StatLabel>Duration</StatLabel>
        <StatValue>{stats.formattedDuration}</StatValue>
        <StatSubValue>{Math.floor(stats.totalDuration / 1000).toLocaleString()} seconds</StatSubValue>
      </StatCard>
      
      <StatCard>
        <StatLabel>Artists</StatLabel>
        <StatValue>{stats.uniqueArtists}</StatValue>
        <StatSubValue>{Math.round((stats.uniqueArtists / tracks.length) * 100)}% artist diversity</StatSubValue>
      </StatCard>
      
      <StatCard>
        <StatLabel>Average Release Year</StatLabel>
        <StatValue>{stats.releaseDates.averageYear || 'N/A'}</StatValue>
        <StatSubValue>
          From {stats.releaseDates.oldest} to {stats.releaseDates.newest}
        </StatSubValue>
      </StatCard>
      
      <StatCard>
        <StatLabel>Explicit Tracks</StatLabel>
        <StatValue>{stats.explicitTracks}</StatValue>
        <StatSubValue>{Math.round(stats.explicitPercentage)}% of the playlist</StatSubValue>
      </StatCard>
      
      {stats.energyScore > 0 && (
        <StatCard>
          <StatLabel>Energy Score</StatLabel>
          <StatValue>{stats.energyScore}%</StatValue>
          <StatSubValue>How energetic the tracks feel</StatSubValue>
        </StatCard>
      )}
      
      {stats.danceabilityScore > 0 && (
        <StatCard>
          <StatLabel>Danceability</StatLabel>
          <StatValue>{stats.danceabilityScore}%</StatValue>
          <StatSubValue>How suitable the tracks are for dancing</StatSubValue>
        </StatCard>
      )}
    </StatsContainer>
  );
};

export default PlaylistStats;