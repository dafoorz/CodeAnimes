// Builds the round items for "Guess the Anime": bundled quotes for Dialogue, or
// runtime official artwork (Jikan pictures) for the image modes. Shared by solo
// and online.
//
// Note: no free CORS-enabled API tags anime images by theme (background / attack
// / food), so all three image modes draw from official anime artwork — real and
// recognizable, just not theme-specific.

import type { GAnimeItem, GAnimeMode } from '../types';
import { GA_IMAGE_ANIME, getItems } from '../data/guessAnime';
import { fetchAnimePictures } from '../api/jikan';
import { shuffle } from '../engine/gameLogic';
import { pickItems } from './ganimeLogic';

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
    const pics = await fetchAnimePictures(a.malId);
    if (pics.length > 0) {
      const url = pics[Math.floor(Math.random() * pics.length)];
      items.push({ anime: a.anime, answers: a.answers, mode, imageUrl: url });
      onProgress?.(items.length, n);
    }
  }
  return items;
}
