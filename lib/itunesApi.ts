import { SongSummary } from '@/types/song';

type ITunesSongItem = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

type ITunesSearchResponse = {
  results?: ITunesSongItem[];
};

const API_BASE = 'https://itunes.apple.com/search';
const CACHE_KEY = 'itunes-song-search-cache-v1';
const SEARCH_LIMIT = 15;
const memoryCache = new Map<string, SongSummary[]>();

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function upscaleArtwork(url: string | undefined): string | null {
  if (!url) return null;

  const replaced = url
    .replace(/\/[0-9]+x[0-9]+bb\./, '/600x600bb.')
    .replace(/\/[0-9]+x[0-9]+-75\./, '/600x600-75.');

  return replaced || url;
}

function normalizeSong(item: ITunesSongItem): SongSummary | null {
  if (!item.trackId || !item.trackName || !item.artistName) return null;

  return {
    trackId: item.trackId,
    trackName: item.trackName,
    artistName: item.artistName,
    collectionName: item.collectionName || null,
    artworkUrl100: item.artworkUrl100 || null,
    artworkUrlHighRes: upscaleArtwork(item.artworkUrl100),
    trackViewUrl: item.trackViewUrl || null
  };
}

function loadSessionCache(): Record<string, SongSummary[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SongSummary[]>;
  } catch {
    return {};
  }
}

function saveSessionCache(cache: Record<string, SongSummary[]>): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore session storage write errors
  }
}

export async function searchSongs(query: string): Promise<SongSummary[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const key = normalizeQuery(trimmed);
  if (memoryCache.has(key)) {
    return memoryCache.get(key) || [];
  }

  const sessionCache = loadSessionCache();
  if (sessionCache[key]) {
    memoryCache.set(key, sessionCache[key]);
    return sessionCache[key];
  }

  const params = new URLSearchParams({
    term: trimmed,
    country: 'JP',
    entity: 'song',
    limit: String(SEARCH_LIMIT)
  });

  const response = await fetch(`${API_BASE}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('iTunes検索に失敗しました。時間を空けて再試行してください。');
  }

  const json = (await response.json()) as ITunesSearchResponse;
  const normalized = (json.results || [])
    .map(normalizeSong)
    .filter((song): song is SongSummary => Boolean(song));

  memoryCache.set(key, normalized);
  sessionCache[key] = normalized;
  saveSessionCache(sessionCache);

  return normalized;
}

export function getSongDisplayTitle(song: SongSummary): string {
  return song.trackName || 'タイトル不明';
}
