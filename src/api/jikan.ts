// Jikan REST API client (https://docs.api.jikan.moe/).
//
// Free, no API key. Rate limited to 3 req/s, so every request goes through a
// single shared throttle queue that spaces calls JIKAN_THROTTLE_MS apart.
// Character lists and cover images are cached in localStorage.

import {
  JIKAN_BASE,
  JIKAN_THROTTLE_MS,
  SEARCH_LIMIT,
  CHARACTER_TOP_PERCENT,
  CHARACTER_CAP,
} from '../data/config';
import type { AnimeOption, Character } from '../types';
import { cacheGet, cacheSet, charactersKey, coverKey } from './cache';

// --- Shared throttle queue ---------------------------------------------------

let chain: Promise<unknown> = Promise.resolve();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Queue a fetch so that all Jikan requests are spaced out, keeping us under the
 * 3 req/s limit regardless of how many callers fire at once.
 */
function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const result = await task();
    await delay(JIKAN_THROTTLE_MS);
    return result;
  });
  // Keep the chain going even if a task rejects.
  chain = run.catch(() => undefined);
  return run;
}

// --- Low-level fetch with one retry on 429 -----------------------------------

async function jikanFetch<T>(path: string): Promise<T> {
  return throttled(async () => {
    let res = await fetch(`${JIKAN_BASE}${path}`);
    if (res.status === 429) {
      // Rate limited despite throttling — back off once and retry.
      await delay(1000);
      res = await fetch(`${JIKAN_BASE}${path}`);
    }
    if (!res.ok) {
      throw new Error(`Jikan request failed (${res.status}) for ${path}`);
    }
    return (await res.json()) as T;
  });
}

// --- Response shapes (only the fields we use) --------------------------------

interface AnimeData {
  mal_id: number;
  title: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  aired?: { prop?: { from?: { year?: number } } };
  year?: number | null;
}

interface CharactersResponse {
  data: Array<{
    character: {
      mal_id: number;
      name: string;
      images?: { jpg?: { image_url?: string } };
    };
    /** MyAnimeList favorite count, used to rank by popularity. */
    favorites?: number;
  }>;
}

// --- Public API --------------------------------------------------------------

/** Fetch a single anime's large cover image URL, cached by malId. */
export async function fetchCoverImage(malId: number): Promise<string> {
  const cached = cacheGet<string>(coverKey(malId));
  if (cached) return cached;

  const json = await jikanFetch<{ data: AnimeData }>(`/anime/${malId}`);
  const url =
    json.data.images?.jpg?.large_image_url ??
    json.data.images?.jpg?.image_url ??
    '';
  if (url) cacheSet(coverKey(malId), url);
  return url;
}

/**
 * An anime's characters ranked by MyAnimeList favorites (most-favorited first,
 * capped at CHARACTER_CAP), plus `fifteen`: how many of them make up the top
 * CHARACTER_TOP_PERCENT of the full roster. The caller decides whether to use
 * `fifteen` or a flat fallback count, based on the whole selection.
 */
export interface RankedCharacters {
  characters: Character[];
  fifteen: number;
}

/**
 * Fetch an anime's characters ranked by MyAnimeList favorites (top CHARACTER_CAP)
 * along with its 15% count, so the board can show recognizable faces. The final
 * per-anime count is decided by the caller across the whole selection. Cached.
 */
export async function fetchCharacters(
  malId: number,
  animeTitle: string
): Promise<RankedCharacters> {
  const cached = cacheGet<RankedCharacters>(charactersKey(malId));
  if (cached) return cached;

  const json = await jikanFetch<CharactersResponse>(
    `/anime/${malId}/characters`
  );

  const ranked = json.data
    .filter((c) => c.character?.name && c.character.images?.jpg?.image_url)
    .sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));

  const fifteen = Math.min(
    Math.ceil(ranked.length * CHARACTER_TOP_PERCENT),
    CHARACTER_CAP
  );

  const characters: Character[] = ranked.slice(0, CHARACTER_CAP).map((c) => ({
    malId: c.character.mal_id,
    name: c.character.name,
    anime: animeTitle,
    imageUrl: c.character.images!.jpg!.image_url!,
  }));

  const result: RankedCharacters = { characters, fifteen };
  if (characters.length > 0) cacheSet(charactersKey(malId), result);
  return result;
}

/** Search anime by title for the "Custom Animes" tab. */
export async function searchAnime(query: string): Promise<AnimeOption[]> {
  const q = query.trim();
  if (!q) return [];

  const json = await jikanFetch<{ data: AnimeData[] }>(
    `/anime?q=${encodeURIComponent(q)}&type=tv&limit=${SEARCH_LIMIT}`
  );

  return json.data.map((a) => ({
    malId: a.mal_id,
    title: a.title,
    coverImage: a.images?.jpg?.large_image_url ?? a.images?.jpg?.image_url,
    year: a.year ?? a.aired?.prop?.from?.year ?? undefined,
    isFamous: false,
  }));
}
