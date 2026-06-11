// Jikan REST API client (https://docs.api.jikan.moe/).
//
// Free, no API key. Rate limited to 3 req/s, so every request goes through a
// single shared throttle queue that spaces calls JIKAN_THROTTLE_MS apart.
// Character lists and cover images are cached in localStorage.

import { JIKAN_BASE, JIKAN_THROTTLE_MS, SEARCH_LIMIT } from '../data/config';
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
 * Fetch every character for an anime (all roles). Returns characters tagged with
 * the anime's title. Cached by malId.
 */
export async function fetchCharacters(
  malId: number,
  animeTitle: string
): Promise<Character[]> {
  const cached = cacheGet<Character[]>(charactersKey(malId));
  if (cached) return cached;

  const json = await jikanFetch<CharactersResponse>(
    `/anime/${malId}/characters`
  );

  const characters: Character[] = json.data
    .filter((c) => c.character?.name && c.character.images?.jpg?.image_url)
    .map((c) => ({
      malId: c.character.mal_id,
      name: c.character.name,
      anime: animeTitle,
      imageUrl: c.character.images!.jpg!.image_url!,
    }));

  if (characters.length > 0) cacheSet(charactersKey(malId), characters);
  return characters;
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
