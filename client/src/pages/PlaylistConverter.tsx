// client/src/pages/PlaylistConverter.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import spotifyService, {
  SpotifyPlaylist,
  PlaylistTrackItem,
} from "../services/spotifyService";
import playlistConverterService, {
  FilterOptions,
  PlaylistCreationOptions,
} from "../services/playlistConverterService";

// Import components
import PlaylistSelectionStep from "../components/playlist-converter/PlaylistSelectionStep";
import FilterCheckboxGroup from "../components/playlist-converter/FilterCheckBoxGroup";
import PlaylistCreationForm from "../components/playlist-converter/PlaylistCreationForm";
import TrackFilters from "components/playlist-converter/TrackFilters";

// Styled components
const ConverterContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
  margin-bottom: 15px;

  &:hover {
    color: #1db954;
  }

  svg {
    margin-right: 5px;
  }
`;

const Title = styled.h1`
  margin: 0 0 10px;
  color: #191414;
`;

const Subtitle = styled.p`
  margin: 0 0 20px;
  color: #666;
  font-size: 1.1rem;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Step = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StepTitle = styled.h2`
  margin: 0;
  color: #191414;
  font-size: 1.4rem;
`;

const StepNumber = styled.div`
  background-color: #1db954;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`;

const ModeSelector = styled.div`
  margin-top: 10px;

  label {
    margin-right: 20px;
    cursor: pointer;

    input {
      margin-right: 8px;
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;

  button {
    margin-left: 10px;
    background-color: #2e7d32;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;

    &:hover {
      background-color: #1b5e20;
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const FilterSummary = styled.p`
  margin-bottom: 20px;
  font-size: 1rem;
`;

// Interface for combined source playlists
interface SourcePlaylists {
  convert: SpotifyPlaylist | null;
  merge: SpotifyPlaylist[];
}

// Main component
const PlaylistConverter: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // State for playlists
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [hasMorePlaylists, setHasMorePlaylists] = useState(true);
  const [playlistsOffset, setPlaylistsOffset] = useState(0);

  // State for selected playlists
  const [sourcePlaylists, setSourcePlaylists] = useState<SourcePlaylists>({
    convert: null,
    merge: [],
  });

  // State for conversion mode
  const [conversionMode, setConversionMode] = useState<"convert" | "merge">(
    "convert"
  );

  // State for track previews
  const [previewTracks, setPreviewTracks] = useState<PlaylistTrackItem[]>([]);
  const [filteredPreviewTracks, setFilteredPreviewTracks] = useState<
    PlaylistTrackItem[]
  >([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    excludeExplicit: false,
    excludeArtists: [],
    excludeGenres: [],
    excludeDecades: [],
  });

  // State for new playlist options
  const [newPlaylistOptions, setNewPlaylistOptions] =
    useState<PlaylistCreationOptions>({
      name: "",
      description: "",
      isPublic: false,
    });

  // State for conversion process
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [conversionSuccess, setConversionSuccess] =
    useState<SpotifyPlaylist | null>(null);

  // State for available filter data
  const [availableArtists, setAvailableArtists] = useState<
    { id: string; name: string }[]
  >([]);
  const [availableDecades, setAvailableDecades] = useState<string[]>([]);

  // Load user playlists
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/login");
      return;
    }

    const loadPlaylists = async () => {
      try {
        setIsLoading(true);
        setPlaylistsError(null);

        const response = await spotifyService.getUserPlaylists(20, 0);
        setUserPlaylists(response.items);
        setHasMorePlaylists(response.next !== null);
        setPlaylistsOffset(20);
      } catch (err) {
        console.error("Error loading playlists:", err);
        setPlaylistsError(
          "Failed to load your playlists. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadPlaylists();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load more playlists
  const handlePlaylistSelect = (playlist: SpotifyPlaylist) => {
    console.log("Selecting playlist:", playlist.name);

    if (conversionMode === "convert") {
      // Select a single playlist for conversion
      setSourcePlaylists({
        convert: playlist,
        merge: [],
      });

      // Load tracks for preview and filtering
      loadTracksForPreview([playlist]);
    } else {
      // Toggle selection for merging multiple playlists
      const isSelected = sourcePlaylists.merge.some(
        (p) => p.id === playlist.id
      );
      console.log("Is already selected:", isSelected);

      let updatedMergePlaylists: SpotifyPlaylist[];
      if (isSelected) {
        // Remove from selection
        updatedMergePlaylists = sourcePlaylists.merge.filter(
          (p) => p.id !== playlist.id
        );
      } else {
        // Add to selection
        updatedMergePlaylists = [...sourcePlaylists.merge, playlist];
      }

      console.log("Updated selection count:", updatedMergePlaylists.length);

      setSourcePlaylists({
        convert: null,
        merge: updatedMergePlaylists,
      });

      // Load tracks for preview and filtering if we have selections
      if (updatedMergePlaylists.length > 0) {
        loadTracksForPreview(updatedMergePlaylists);
      } else {
        setPreviewTracks([]);
        setFilteredPreviewTracks([]);
        setAvailableArtists([]);
        setAvailableDecades([]);
      }
    }
  };

  // Load more playlists
  const handleLoadMorePlaylists = async () => {
    try {
      setIsLoading(true);

      const response = await spotifyService.getUserPlaylists(
        20,
        playlistsOffset
      );
      setUserPlaylists((prev) => [...prev, ...response.items]);
      setHasMorePlaylists(response.next !== null);
      setPlaylistsOffset((prev) => prev + 20);
    } catch (err) {
      console.error("Error loading more playlists:", err);
      setPlaylistsError("Failed to load more playlists.");
    } finally {
      setIsLoading(false);
    }
  };
  // Handle conversion mode change
  const handleConversionModeChange = (mode: "convert" | "merge") => {
    setConversionMode(mode);

    // Reset selected playlists
    setSourcePlaylists({
      convert: null,
      merge: [],
    });

    // Reset preview data
    setPreviewTracks([]);
    setFilteredPreviewTracks([]);
    setAvailableArtists([]);
    setAvailableDecades([]);
  };

  // Load tracks for preview and extract filter options
  const loadTracksForPreview = async (playlists: SpotifyPlaylist[]) => {
    
    try {
      setIsLoadingTracks(true);

      // Load tracks from each selected playlist
      let allTracks: PlaylistTrackItem[] = [];

      for (const playlist of playlists) {
        console.log(`Requesting tracks for playlist: ${playlist.name} (ID: ${playlist.id})`);
        const tracksResponse = await spotifyService.getPlaylistTracks(
          playlist.id,
          100, // Limit to 100 for preview
          0,
          false // Set to false to avoid audio features permission issues
        );

        allTracks = [...allTracks, ...tracksResponse.items];
      }

      // Remove duplicates
      const uniqueTracks = removeDuplicateTracks(allTracks);

      // Set tracks for preview
      setPreviewTracks(uniqueTracks);

      // Create initial filtered preview
      applyFiltersToPreview(uniqueTracks, filters);

      // Extract available artists for filtering
      const artists = extractUniqueArtistsFromTracks(uniqueTracks);
      setAvailableArtists(artists);

      // Extract available decades for filtering
      const decades =
        playlistConverterService.getDecadesFromTracks(uniqueTracks);
      setAvailableDecades(decades);

      console.log("Preview tracks loaded:", uniqueTracks.length);
      console.log("Available artists:", artists.length);
      console.log("Available decades:", decades);

      if (uniqueTracks.length === 0) {
        console.log('No tracks found, setting test data');
        setAvailableArtists([
          { id: 'test1', name: 'Test Artist 1' },
          { id: 'test2', name: 'Test Artist 2' }
        ]);
        setAvailableDecades(['1990s', '2000s', '2010s']);
      }
    } catch (err) {
      console.error("Error loading tracks for preview:", err);
    } 
    
    
    finally {
      setIsLoadingTracks(false);
    }
    console.log(
      "Loading tracks for playlist(s):",
      playlists.map((p) => p.name).join(", ")
    );
  };

  // Apply filters to preview tracks
  const applyFiltersToPreview = (
    tracks: PlaylistTrackItem[],
    filterOptions: FilterOptions
  ) => {
    const filtered = playlistConverterService.filterTracks(
      tracks,
      filterOptions
    );
    setFilteredPreviewTracks(filtered);
  };

  // Update filters and apply to preview
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFiltersToPreview(previewTracks, updatedFilters);
  };

  // Update new playlist options
  const handlePlaylistOptionsChange = (
    options: Partial<PlaylistCreationOptions>
  ) => {
    setNewPlaylistOptions((prev) => ({
      ...prev,
      ...options,
    }));
  };

  // Create the new playlist
  const handleCreatePlaylist = async () => {
    try {
      setIsConverting(true);
      setConversionError(null);
      setConversionSuccess(null);

      // Validate required fields
      if (!newPlaylistOptions.name.trim()) {
        setConversionError("Please enter a name for your new playlist.");
        setIsConverting(false);
        return;
      }

      // Select the right playlist IDs based on mode
      const playlistIds =
        conversionMode === "convert"
          ? [sourcePlaylists.convert?.id!]
          : sourcePlaylists.merge.map((p) => p.id);

      if (playlistIds.length === 0) {
        setConversionError("Please select at least one playlist.");
        setIsConverting(false);
        return;
      }

      // Call the right service method based on mode
      let newPlaylist: SpotifyPlaylist;

      if (conversionMode === "convert" && playlistIds.length === 1) {
        newPlaylist = await playlistConverterService.convertPlaylist(
          playlistIds[0],
          filters,
          newPlaylistOptions
        );
      } else {
        newPlaylist = await playlistConverterService.mergePlaylists(
          playlistIds,
          filters,
          newPlaylistOptions
        );
      }

      // Set success state
      setConversionSuccess(newPlaylist);

      // Reset form
      setNewPlaylistOptions({
        name: "",
        description: "",
        isPublic: false,
      });
    } catch (err) {
      console.error("Error creating playlist:", err);
      setConversionError(
        "Failed to create the new playlist. Please try again."
      );
    } finally {
      setIsConverting(false);
    }
  };

  // Helper function to remove duplicate tracks
  const removeDuplicateTracks = (
    tracks: PlaylistTrackItem[]
  ): PlaylistTrackItem[] => {
    const uniqueTrackMap = new Map<string, PlaylistTrackItem>();

    tracks.forEach((item) => {
      if (item.track && item.track.uri) {
        uniqueTrackMap.set(item.track.uri, item);
      }
    });

    return Array.from(uniqueTrackMap.values());
  };

  // Helper function to extract unique artists from tracks
  const extractUniqueArtistsFromTracks = (
    tracks: PlaylistTrackItem[]
  ): { id: string; name: string }[] => {
    const artistMap = new Map<string, { id: string; name: string }>();

    tracks.forEach((item) => {
      if (item.track && item.track.artists) {
        item.track.artists.forEach((artist) => {
          if (!artistMap.has(artist.id)) {
            artistMap.set(artist.id, { id: artist.id, name: artist.name });
          }
        });
      }
    });

    return Array.from(artistMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  // Navigate back to dashboard
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Navigate to the created playlist
  const viewCreatedPlaylist = () => {
    if (conversionSuccess) {
      navigate(`/playlist/${conversionSuccess.id}`);
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!newPlaylistOptions.name.trim()) {
      return false;
    }

    if (conversionMode === "convert" && !sourcePlaylists.convert) {
      return false;
    }

    if (conversionMode === "merge" && sourcePlaylists.merge.length === 0) {
      return false;
    }

    return true;
  };

  // Render the component
  return (
    <ConverterContainer>
      <Header>
        <BackButton onClick={handleBack}>← Back to Dashboard</BackButton>
        <Title>Playlist Converter</Title>
        <Subtitle>
          Create a new playlist by converting or merging existing playlists with
          custom filters
        </Subtitle>
      </Header>

      {playlistsError && <ErrorMessage>{playlistsError}</ErrorMessage>}

      {conversionError && <ErrorMessage>{conversionError}</ErrorMessage>}

      {conversionSuccess && (
        <SuccessMessage>
          Successfully created playlist "{conversionSuccess.name}"!{" "}
          <button onClick={viewCreatedPlaylist}>View Playlist</button>
        </SuccessMessage>
      )}

      <StepsContainer>
        {/* Step 1: Choose conversion mode */}
        <Step>
          <StepHeader>
            <StepTitle>Choose Mode</StepTitle>
            <StepNumber>1</StepNumber>
          </StepHeader>

          <ModeSelector>
            <label>
              <input
                type="radio"
                name="conversionMode"
                value="convert"
                checked={conversionMode === "convert"}
                onChange={() => handleConversionModeChange("convert")}
              />
              Convert a single playlist with filters
            </label>

            <label>
              <input
                type="radio"
                name="conversionMode"
                value="merge"
                checked={conversionMode === "merge"}
                onChange={() => handleConversionModeChange("merge")}
              />
              Merge multiple playlists with filters
            </label>
          </ModeSelector>
        </Step>

        {/* Step 2: Select playlist(s) */}
        <Step>
          <StepHeader>
            <StepTitle>
              {conversionMode === "convert"
                ? "Select Playlist to Convert"
                : "Select Playlists to Merge"}
            </StepTitle>
            <StepNumber>2</StepNumber>
          </StepHeader>

          <PlaylistSelectionStep
            playlists={userPlaylists}
            selectedPlaylists={
              conversionMode === "convert"
                ? sourcePlaylists.convert
                  ? [sourcePlaylists.convert]
                  : []
                : sourcePlaylists.merge
            }
            isMultiSelect={conversionMode === "merge"}
            isLoading={isLoading}
            hasMore={hasMorePlaylists}
            onPlaylistSelect={handlePlaylistSelect}
            onLoadMore={handleLoadMorePlaylists}
          />
        </Step>

        {/* Step 3: Filter options */}
        <Step>
          <StepHeader>
            <StepTitle>Filter Options</StepTitle>
            <StepNumber>3</StepNumber>
          </StepHeader>

          {isLoadingTracks ? (
            <LoadingMessage>Loading track data for filtering...</LoadingMessage>
          ) : previewTracks.length === 0 ? (
            <p>Select a playlist first to see filter options</p>
          ) : (
            <>
              <FilterSummary>
                {filteredPreviewTracks.length} of {previewTracks.length} tracks
                will be included in your new playlist.
              </FilterSummary>

              <TrackFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />

              {/* Artists Filter */}
              {availableArtists.length > 0 && (
                <FilterCheckboxGroup
                  title="Exclude Artists"
                  items={availableArtists}
                  selectedIds={filters.excludeArtists || []}
                  onChange={(selectedIds) =>
                    handleFilterChange({ excludeArtists: selectedIds })
                  }
                  maxItemsToShow={20}
                />
              )}

              {/* Decades Filter */}
              {availableDecades.length > 0 && (
                <FilterCheckboxGroup
                  title="Exclude Decades"
                  items={availableDecades.map((decade) => ({
                    id: decade,
                    name: decade,
                  }))}
                  selectedIds={filters.excludeDecades || []}
                  onChange={(selectedIds) =>
                    handleFilterChange({ excludeDecades: selectedIds })
                  }
                />
              )}
            </>
          )}
        </Step>

        {/* Step 4: New Playlist Details */}
        <Step>
          <StepHeader>
            <StepTitle>New Playlist Details</StepTitle>
            <StepNumber>4</StepNumber>
          </StepHeader>

          <PlaylistCreationForm
            isConverting={isConverting}
            conversionMode={conversionMode}
            isValid={isFormValid()}
            onSubmit={handleCreatePlaylist}
            onChange={handlePlaylistOptionsChange}
            options={newPlaylistOptions}
          />
        </Step>
      </StepsContainer>
    </ConverterContainer>
  );
};

export default PlaylistConverter;
