// client/src/components/charts/DecadeDistributionChart.tsx

import React, { useMemo } from 'react';
import { PlaylistTrackItem } from '../../services/spotifyService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

interface DecadeDistributionChartProps {
  tracks: PlaylistTrackItem[];
}

const DecadeDistributionChart: React.FC<DecadeDistributionChartProps> = ({ tracks }) => {
  const decadeData = useMemo(() => {
    if (!tracks || tracks.length === 0) {
      return [];
    }

    // Initialize decades to track
    const decades: Record<string, { name: string, count: number, decade: number }> = {
      '1950s': { name: '1950s', count: 0, decade: 1950 },
      '1960s': { name: '1960s', count: 0, decade: 1960 },
      '1970s': { name: '1970s', count: 0, decade: 1970 },
      '1980s': { name: '1980s', count: 0, decade: 1980 },
      '1990s': { name: '1990s', count: 0, decade: 1990 },
      '2000s': { name: '2000s', count: 0, decade: 2000 },
      '2010s': { name: '2010s', count: 0, decade: 2010 },
      '2020s': { name: '2020s', count: 0, decade: 2020 },
    };
    
    // Count tracks by decade
    tracks.forEach(item => {
      const releaseDate = item.track.album.release_date;
      if (!releaseDate) return;
      
      // Extract year from release date
      const year = parseInt(releaseDate.substring(0, 4), 10);
      if (isNaN(year)) return;
      
      // Determine decade (e.g., 1990s, 2000s)
      const decade = Math.floor(year / 10) * 10;
      const decadeKey = `${decade}s`;
      
      // Count the track in its decade
      if (decades[decadeKey]) {
        decades[decadeKey].count++;
      } else {
        // For decades not pre-initialized, add them dynamically
        decades[decadeKey] = { name: decadeKey, count: 1, decade };
      }
    });
    
    // Convert to array and sort by decade
    return Object.values(decades)
      .filter(decade => decade.count > 0) // Only include decades with tracks
      .sort((a, b) => a.decade - b.decade);
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
  
  if (decadeData.length === 0) {
    return (
      <ChartWrapper>
        <EmptyMessage>No release date data available</EmptyMessage>
      </ChartWrapper>
    );
  }
  
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={decadeData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#1DB954" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default DecadeDistributionChart;