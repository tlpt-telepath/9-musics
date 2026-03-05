import { SongSlot, SongSummary } from '@/types/song';
import { SongSearchInput } from './SongSearchInput';

type SongCellEditorProps = {
  slot: SongSlot;
  onQueryChange: (slotId: number, value: string) => void;
  onSelectSong: (slotId: number, song: SongSummary) => void;
  onClearSong: (slotId: number) => void;
};

export function SongCellEditor({
  slot,
  onQueryChange,
  onSelectSong,
  onClearSong
}: SongCellEditorProps) {
  return (
    <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">#{slot.id}</h3>
        {slot.selectedSong && (
          <button
            type="button"
            onClick={() => onClearSong(slot.id)}
            className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
          >
            解除
          </button>
        )}
      </div>

      <SongSearchInput
        query={slot.searchQuery}
        onQueryChange={(value) => onQueryChange(slot.id, value)}
        results={slot.searchResults}
        isSearching={slot.isSearching}
        error={slot.error}
        onSelect={(song) => onSelectSong(slot.id, song)}
      />

      <p className="mt-3 text-xs text-slate-300">
        選択中: {slot.selectedSong ? `${slot.selectedSong.trackName} - ${slot.selectedSong.artistName}` : 'なし'}
      </p>
    </article>
  );
}
