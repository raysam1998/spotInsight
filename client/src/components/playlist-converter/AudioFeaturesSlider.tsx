// client/src/components/playlist-converter/AudioFeatureSlider.tsx

import React from 'react';
import styled from 'styled-components';

interface AudioFeatureSliderProps {
  title: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  description?: string;
}

const RangeContainer = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const RangeSlider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  input {
    flex: 1;
  }
`;

const RangeValue = styled.span`
  width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: #666;
`;

const SliderDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
`;

const AudioFeatureSlider: React.FC<AudioFeatureSliderProps> = ({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  description
}) => {
  return (
    <RangeContainer>
      <FilterLabel>{title}:</FilterLabel>
      <RangeSlider>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={minValue}
          onChange={e => onMinChange(parseFloat(e.target.value))}
        />
        <RangeValue>{Math.round(minValue * 100)}%</RangeValue>
      </RangeSlider>
      <RangeSlider>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={maxValue}
          onChange={e => onMaxChange(parseFloat(e.target.value))}
        />
        <RangeValue>{Math.round(maxValue * 100)}%</RangeValue>
      </RangeSlider>
      {description && <SliderDescription>{description}</SliderDescription>}
    </RangeContainer>
  );
};

export default AudioFeatureSlider;