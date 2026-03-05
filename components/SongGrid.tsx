'use client';

import { useEffect, useState } from 'react';
import { SongSlot } from '@/types/song';
import { toSafeImageSrc } from '@/lib/imageProxy';

type SongGridProps = {
  title: string;
  slots: SongSlot[];
};

export function SongGrid({ title, slots }: SongGridProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFailedImages((current) => {
      const next: Record<string, boolean> = {};
      for (const slot of slots) {
        const imageUrl = slot.selectedSong?.artworkUrlHighRes || slot.selectedSong?.artworkUrl100 || '';
        const key = `${slot.id}:${imageUrl}`;
        if (current[key]) next[key] = true;
      }
      return next;
    });
  }, [slots]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl shadow-cyan-900/20">
      <div className="mx-auto w-full max-w-[760px] rounded-xl border border-slate-600 bg-slate-950 p-4">
        <h1 className="mb-4 text-center text-xl font-bold tracking-wide text-slate-100 sm:text-2xl">
          {title || '#MyBest9Songs'}
        </h1>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {slots.map((slot, index) => {
            const song = slot.selectedSong;
            const artwork = toSafeImageSrc(song?.artworkUrlHighRes || song?.artworkUrl100 || null);
            const imageKey = `${slot.id}:${artwork || ''}`;
            const shouldShowImage = Boolean(artwork) && !failedImages[imageKey];

            return (
              <article
                key={slot.id}
                className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800"
              >
                <div className="aspect-square">
                  {shouldShowImage ? (
                    <img
                      src={artwork || ''}
                      alt={song ? `${song.trackName} / ${song.artistName}` : `Slot ${slot.id}`}
                      className="h-full w-full object-cover"
                      onError={() => {
                        setFailedImages((current) => ({ ...current, [imageKey]: true }));
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-700 px-2 text-center text-xs text-slate-300 sm:text-sm">
                      未選択
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-black/20 p-2">
                  <p className="line-clamp-1 text-xs font-semibold text-slate-100 sm:text-sm">
                    {index + 1}. {song?.trackName || '未選択'}
                  </p>
                  <p className="line-clamp-1 text-[10px] text-slate-200 sm:text-xs">
                    {song?.artistName || '曲を選択してください'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
