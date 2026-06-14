// Builds the round items for "Guess the Anime": bundled quotes for Dialogue, or
// runtime official artwork (Jikan) for the image modes. Shared by solo & online.
//
// No free CORS-enabled API tags anime images by theme (background / attack /
// food), so the image modes draw from official anime artwork — real and
// recognizable, just not theme-specific. We try the pictures endpoint first and
// fall back to the cover image so a round always has something to show.

import type { GAnimeItem, GAnimeMode } from '../types';
import { GA_IMAGE_ANIME, getItems } from '../data/guessAnime';
import { fetchAnimePictures, fetchCoverImage } from '../api/jikan';
import { shuffle } from '../engine/gameLogic';
import { pickItems } from './ganimeLogic';

async function imagesFor(malId: number): Promise<string[]> {
  try {
    const pics = await fetchAnimePictures(malId);
    if (pics.length > 0) return pics;
  } catch {
    /* fall through to cover */
  }
  try {
    const cover = await fetchCoverImage(malId);
    if (cover) return [cover];
  } catch {
    /* give up on this anime */
  }
  return [];
}

export async function buildItems(
  mode: GAnimeMode,
  n: number,
  onProgress?: (done: number, total: number) => void
): Promise<GAnimeItem[]> {
  if (mode === 'dialogue') {
    return pickItems(getItems('dialogue'), n);
  }

  const animes = shuffle(GA_IMAGE_ANIME);
  const items: GAnimeItem[] = [];
  onProgress?.(0, n);

  let i = 0;
  const maxTries = Math.max(n * 3, 24);
  while (items.length < n && i < maxTries) {
    const a = animes[i % animes.length];
    i++;
    const urls = await imagesFor(a.malId);
    if (urls.length > 0) {
      const url = urls[Math.floor(Math.random() * urls.length)];
      items.push({ anime: a.anime, answers: a.answers, mode, imageUrl: url });
      onProgress?.(items.length, n);
    }
  }
  return items;
}
