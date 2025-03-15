// client/src/components/playlist-converter/PlaylistCreationForm.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { PlaylistCreationOptions } from '../../services/playlistConverterService'

interface PlaylistCreationFormProps {
  isConverting: boolean;
  conversionMode: 'convert' | 'merge';
  isValid: boolean;
  onSubmit: () => void;
  onChange: (options: Partial<PlaylistCreationOptions>) => void;
  options: PlaylistCreationOptions;
}

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #1DB954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #1DB954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  
  input {
    margin-right: 8px;
  }
`;

const ImagePreview = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 4px;
  margin-top: 10px;
  background-color: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Button = styled.button`
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #19a54a;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const PlaylistCreationForm: React.FC<PlaylistCreationFormProps> = ({
  isConverting,
  conversionMode,
  isValid,
  onSubmit,
  onChange,
  options
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange({ [name]: checked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      onChange({ imageBase64: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <FormGroup>
        <Label htmlFor="name">Playlist Name *</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={options.name}
          onChange={handleInputChange}
          placeholder="Enter a name for your new playlist"
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={options.description || ''}
          onChange={handleInputChange}
          placeholder="Add an optional description"
        />
      </FormGroup>
      
      <Checkbox>
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={options.isPublic || false}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="isPublic">Make playlist public</label>
      </Checkbox>
      
      <FormGroup>
        <Label htmlFor="image">Cover Image (Optional)</Label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageUpload}
        />
        
        {imagePreview && (
          <ImagePreview>
            <img src={imagePreview} alt="Playlist cover preview" />
          </ImagePreview>
        )}
      </FormGroup>
      
      <Button
        onClick={onSubmit}
        disabled={isConverting || !isValid}
      >
        {isConverting 
          ? 'Creating Playlist...' 
          : conversionMode === 'convert' 
            ? 'Create Converted Playlist' 
            : 'Create Merged Playlist'
        }
      </Button>
    </>
  );
};

export default PlaylistCreationForm;