import { SongSummary } from '@/types/song';

type SongSearchInputProps = {
  query: string;
  onQueryChange: (value: string) => void;
  results: SongSummary[];
  isSearching: boolean;
  error: string | null;
  onSelect: (song: SongSummary) => void;
};

export function SongSearchInput({
  query,
  onQueryChange,
  results,
  isSearching,
  error,
  onSelect
}: SongSearchInputProps) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="曲名・アーティスト名で検索（日本語OK）"
        className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400"
      />

      {isSearching && <p className="text-xs text-cyan-300">検索中...</p>}
      {error && <p className="text-xs text-rose-300">{error}</p>}

      {results.length > 0 && (
        <ul className="max-h-56 overflow-auto rounded-md border border-slate-700 bg-slate-900/90">
          {results.map((song) => (
            <li key={song.trackId}>
              <button
                type="button"
                onClick={() => onSelect(song)}
                className="w-full border-b border-slate-800 px-3 py-2 text-left text-xs hover:bg-slate-800/80"
              >
                <p className="font-semibold text-slate-100">{song.trackName}</p>
                <p className="text-slate-300">{song.artistName}</p>
                {song.collectionName && <p className="text-slate-400">{song.collectionName}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
