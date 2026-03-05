export type SongSummary = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string | null;
  artworkUrl100: string | null;
  artworkUrlHighRes: string | null;
  trackViewUrl: string | null;
};

export type SongSlot = {
  id: number;
  selectedSong: SongSummary | null;
  searchQuery: string;
  searchResults: SongSummary[];
  isSearching: boolean;
  error: string | null;
};
