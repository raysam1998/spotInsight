// client/src/components/charts/AudioFeaturesChart.tsx

import React, { useMemo } from 'react';
import { PlaylistTrackItem } from '../../services/spotifyService';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
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

interface AudioFeaturesChartProps {
  tracks: PlaylistTrackItem[];
}

const AudioFeaturesChart: React.FC<AudioFeaturesChartProps> = ({ tracks }) => {
  const audioFeatureData = useMemo(() => {
    if (!tracks || tracks.length === 0) {
      return [];
    }

    // Filter tracks that have audio features
    return tracks
      .filter(item => item.audio_features)
      .map(item => ({
        name: item.track.name,
        artist: item.track.artists[0].name,
        energy: item.audio_features?.energy || 0,
        danceability: item.audio_features?.danceability || 0,
        valence: item.audio_features?.valence || 0,
        // Scaling the popularity to be used for dot size (1-10 range)
        popularity: ((item.track.popularity || 50) / 10) + 1
      }));
  }, [tracks]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <p style={{ margin: 0 }}><strong>{data.name}</strong></p>
          <p style={{ margin: 0 }}>Artist: {data.artist}</p>
          <p style={{ margin: 0 }}>Energy: {Math.round(data.energy * 100)}%</p>
          <p style={{ margin: 0 }}>Danceability: {Math.round(data.danceability * 100)}%</p>
          <p style={{ margin: 0 }}>Mood: {Math.round(data.valence * 100)}% positive</p>
        </div>
      );
    }
    
    return null;
  };
  
  if (audioFeatureData.length === 0) {
    return (
      <ChartWrapper>
        <EmptyMessage>No audio features data available</EmptyMessage>
      </ChartWrapper>
    );
  }
  
  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="energy" 
            name="Energy" 
            domain={[0, 1]} 
            label={{ value: 'Energy', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis 
            type="number" 
            dataKey="danceability" 
            name="Danceability" 
            domain={[0, 1]}
            label={{ value: 'Danceability', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis type="number" dataKey="popularity" range={[20, 60]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Scatter 
            name="Energy vs Danceability" 
            data={audioFeatureData} 
            fill="#1DB954" 
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default AudioFeaturesChart;