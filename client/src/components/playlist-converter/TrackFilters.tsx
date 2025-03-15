// client/src/components/playlist-converter/TrackFilters.tsx (renamed from AudioFeaturesFilter.tsx)

import React from 'react';
import styled from 'styled-components';
import { FilterOptions } from '../../services/playlistConverterService';

interface TrackFiltersProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
}

const FilterSection = styled.div`
  margin-top: 20px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
  
  input {
    margin-right: 8px;
  }
`;

const TrackFilters: React.FC<TrackFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <FilterSection>
      {/* Explicit Content Filter */}
      <FilterRow>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={filters.excludeExplicit || false}
            onChange={e => onFilterChange({ excludeExplicit: e.target.checked })}
          />
          Exclude explicit tracks
        </CheckboxLabel>
      </FilterRow>
      
      {/* Note: All the audio feature sliders have been removed */}
    </FilterSection>
  );
};

export default TrackFilters;