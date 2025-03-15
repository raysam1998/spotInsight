// client/src/components/charts/ArtistDistributionChart.tsx

import React, { useMemo } from 'react';
import { PlaylistTrackItem } from '../../services/spotifyService';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from 'recharts';
import styled from 'styled-components';

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
`;

const EmptyMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
`;

interface ArtistDistributionChartProps {
  tracks: PlaylistTrackItem[];
}

// Define some pleasant color scheme for the chart
const COLORS = [
  '#1DB954', // Spotify green
  '#1E5128', // Dark green
  '#4E9F3D', // Medium green
  '#8DCE71', // Light green
  '#D8F3DC', // Very light green
  '#191414', // Spotify black
  '#383838', // Dark gray
  '#727272', // Medium gray
  '#B9B9B9', // Light gray
  '#F3F3F3', // Very light gray
];

const ArtistDistributionChart: React.FC<ArtistDistributionChartProps> = ({ tracks }) => {
  const artistData = useMemo(() => {
    if (!tracks || tracks.length === 0) {
      return [];
    }

    // Count tracks by artist
    const artistCounts: Record<string, { name: string, count: number }> = {};
    
    tracks.forEach(item => {
      // Use the first artist as the primary one for this track
      if (item.track.artists.length > 0) {
        const primaryArtist = item.track.artists[0];
        
        if (artistCounts[primaryArtist.id]) {
          artistCounts[primaryArtist.id].count++;
        } else {
          artistCounts[primaryArtist.id] = {
            name: primaryArtist.name,
            count: 1
          };
        }
      }
    });
    
    // Convert to array and sort by count (descending)
    const artistArray = Object.values(artistCounts).sort((a, b) => b.count - a.count);
    
    // Take top 8 artists and group the rest as "Others"
    const topArtists = artistArray.slice(0, 8);
    
    // Calculate "Others" category
    const othersCount = artistArray.slice(8).reduce((sum, artist) => sum + artist.count, 0);
    
    // Only add "Others" if there are any
    if (othersCount > 0) {
      topArtists.push({ name: 'Others', count: othersCount });
    }
    
    return topArtists;
  }, [tracks]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.count / tracks.length) * 100).toFixed(1);
      
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <p style={{ margin: 0 }}><strong>{data.name}</strong></p>
          <p style={{ margin: 0 }}>{data.count} tracks ({percentage}%)</p>
        </div>
      );
    }
    
    return null;
  };
  
  if (artistData.length === 0) {
    return (
      <ChartWrapper>
        <EmptyMessage>No artist data available</EmptyMessage>
      </ChartWrapper>
    );
  }
  
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={artistData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {artistData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default ArtistDistributionChart;