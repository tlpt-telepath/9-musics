'use client';

import { useEffect, useMemo, useState } from 'react';
import { SongCellEditor } from '@/components/SongCellEditor';
import { SongGrid } from '@/components/SongGrid';
import { SharePanel } from '@/components/SharePanel';
import { getSongDisplayTitle, searchSongs } from '@/lib/itunesApi';
import { SongSlot, SongSummary } from '@/types/song';

const SLOT_COUNT = 9;
const DEBOUNCE_MS = 400;
const STORAGE_KEY = 'my-best-9-songs-state-v1';
const SHARE_HASHTAG = '#MyBest9Songs';
const SHARE_URL = process.env.NEXT_PUBLIC_SHARE_URL || 'https://tlpt-telepath.github.io/9-musics/';

type PersistedSlot = {
  id: number;
  selectedSong: SongSummary | null;
};

type PersistedState = {
  title: string;
  slots: PersistedSlot[];
};

function createInitialSlots(): SongSlot[] {
  return Array.from({ length: SLOT_COUNT }, (_, i) => ({
    id: i + 1,
    selectedSong: null,
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    error: null
  }));
}

function toPersistedState(title: string, slots: SongSlot[]): PersistedState {
  return {
    title,
    slots: slots.map((slot) => ({
      id: slot.id,
      selectedSong: slot.selectedSong
    }))
  };
}

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase();
}

function composeShareText(lines: string[]): string {
  const heading = `${SHARE_HASHTAG} を作りました！`;
  if (!lines.length) {
    return `${heading}\n${SHARE_URL}`;
  }

  return `${heading}\n${lines.join(' / ')}\n${SHARE_URL}`;
}

function buildShareLines(slots: SongSlot[]): string[] {
  return slots
    .filter((slot) => Boolean(slot.selectedSong))
    .slice(0, 4)
    .map((slot) => getSongDisplayTitle(slot.selectedSong as SongSummary));
}

export default function HomePage() {
  const [title, setTitle] = useState('#MyBest9Songs');
  const [slots, setSlots] = useState<SongSlot[]>(createInitialSlots());
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed.title) setTitle(parsed.title);

      if (Array.isArray(parsed.slots)) {
        setSlots((current) =>
          current.map((slot) => {
            const found = parsed.slots.find((p) => p.id === slot.id);
            if (!found) return slot;
            return {
              ...slot,
              selectedSong: found.selectedSong
            };
          })
        );
      }
    } catch {
      // ignore restore errors
    }
  }, []);

  useEffect(() => {
    const state = toPersistedState(title, slots);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [title, slots]);

  useEffect(() => {
    const timers = slots.map((slot) => {
      const selectedTitle = slot.selectedSong ? getSongDisplayTitle(slot.selectedSong) : '';
      const isSelectedTitleQuery =
        Boolean(slot.selectedSong) &&
        normalizeQuery(slot.searchQuery) === normalizeQuery(selectedTitle);

      if (isSelectedTitleQuery || !slot.searchQuery.trim()) {
        if (slot.searchResults.length || slot.error || slot.isSearching) {
          setSlots((current) =>
            current.map((s) =>
              s.id === slot.id ? { ...s, searchResults: [], error: null, isSearching: false } : s
            )
          );
        }
        return null;
      }

      const timer = window.setTimeout(async () => {
        setSlots((current) =>
          current.map((s) => (s.id === slot.id ? { ...s, isSearching: true, error: null } : s))
        );

        try {
          const results = await searchSongs(slot.searchQuery);
          setSlots((current) =>
            current.map((s) =>
              s.id === slot.id
                ? {
                    ...s,
                    searchResults: results,
                    isSearching: false,
                    error: results.length ? null : '候補が見つかりませんでした。別キーワードでも試してください。'
                  }
                : s
            )
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : '検索に失敗しました。時間を空けて再試行してください。';
          setSlots((current) =>
            current.map((s) =>
              s.id === slot.id ? { ...s, isSearching: false, error: message, searchResults: [] } : s
            )
          );
        }
      }, DEBOUNCE_MS);

      return timer;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, [slots]);

  const shareText = useMemo(() => composeShareText(buildShareLines(slots)), [slots]);

  const updateSlot = (slotId: number, updater: (prev: SongSlot) => SongSlot): void => {
    setSlots((current) => current.map((slot) => (slot.id === slotId ? updater(slot) : slot)));
  };

  const handleQueryChange = (slotId: number, value: string): void => {
    updateSlot(slotId, (slot) => ({ ...slot, searchQuery: value }));
  };

  const handleSelectSong = (slotId: number, song: SongSummary): void => {
    updateSlot(slotId, (slot) => ({
      ...slot,
      selectedSong: song,
      searchQuery: getSongDisplayTitle(song),
      searchResults: [],
      isSearching: false,
      error: null
    }));
  };

  const handleClearSong = (slotId: number): void => {
    updateSlot(slotId, (slot) => ({
      ...slot,
      selectedSong: null,
      searchQuery: '',
      searchResults: [],
      error: null,
      isSearching: false
    }));
  };

  const handleCopyShareText = async (): Promise<void> => {
    setCopyError(null);

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      setCopyError('クリップボードへのコピーに失敗しました。ブラウザ設定をご確認ください。');
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">My Best 9 Songs Builder</p>
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">#MyBest9Songs</h1>
        <p className="text-sm text-slate-300">
          iTunes Search API で9曲を選び、3x3グリッドを作れます。
          <br />
          作者：
          <a
            href="https://x.com/tlpt_telepath"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-cyan-300 underline decoration-cyan-400/60 underline-offset-2 hover:text-cyan-200"
          >
            @tlpt_telepath
          </a>
          <br />
          アニメ版は
          <a
            href="https://tlpt-telepath.github.io/9-animes/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-cyan-300 underline decoration-cyan-400/60 underline-offset-2 hover:text-cyan-200"
          >
            こちら
          </a>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-100">ページタイトル</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <SongCellEditor
                key={slot.id}
                slot={slot}
                onQueryChange={handleQueryChange}
                onSelectSong={handleSelectSong}
                onClearSong={handleClearSong}
              />
            ))}
          </div>

          <SharePanel onCopyShareText={handleCopyShareText} shareText={shareText} copyError={copyError} />
        </section>

        <SongGrid title={title} slots={slots} />
      </div>
    </main>
  );
}
