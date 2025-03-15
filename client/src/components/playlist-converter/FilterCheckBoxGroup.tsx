// client/src/components/playlist-converter/FilterCheckboxGroup.tsx

import React from 'react';
import styled from 'styled-components';

interface CheckboxItem {
  id: string;
  name: string;
}

interface FilterCheckboxGroupProps {
  title: string;
  items: CheckboxItem[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  maxItemsToShow?: number;
}

const Container = styled.div`
  margin-bottom: 20px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const CheckboxRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 8px;
  }
`;

const FilterCheckboxGroup: React.FC<FilterCheckboxGroupProps> = ({
  title,
  items,
  selectedIds,
  onChange,
  maxItemsToShow = 20
}) => {
  const handleCheckboxChange = (itemId: string, isChecked: boolean) => {
    const newSelectedIds = isChecked
      ? [...selectedIds, itemId]
      : selectedIds.filter(id => id !== itemId);
    
    onChange(newSelectedIds);
  };

  // Limit the number of items shown if needed
  const displayItems = maxItemsToShow && items.length > maxItemsToShow
    ? items.slice(0, maxItemsToShow)
    : items;

  return (
    <Container>
      <FilterLabel>{title}:</FilterLabel>
      <CheckboxRow>
        {displayItems.map(item => (
          <CheckboxLabel key={item.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={e => handleCheckboxChange(item.id, e.target.checked)}
            />
            {item.name}
          </CheckboxLabel>
        ))}
      </CheckboxRow>
      {maxItemsToShow && items.length > maxItemsToShow && (
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
          Showing {maxItemsToShow} of {items.length} items
        </div>
      )}
    </Container>
  );
};

export default FilterCheckboxGroup;