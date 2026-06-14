// Builds the round items for "Guess the Anime": bundled quotes for Dialogue, or
// runtime Danbooru images for the image modes. Shared by solo and online.

import type { GAnimeItem, GAnimeMode } from '../types';
import { GA_CATEGORY_TAG, GA_IMAGE_ANIME, getItems } from '../data/guessAnime';
import { fetchScene } from '../api/danbooru';
import { shuffle } from '../engine/gameLogic';
import { pickItems } from './ganimeLogic';

/**
 * Produce `n` round items for a mode. Dialogue is instant (bundled); image modes
 * fetch real safe images from Danbooru, reporting progress as they arrive.
 */
export async function buildItems(
  mode: GAnimeMode,
  n: number,
  onProgress?: (done: number, total: number) => void
): Promise<GAnimeItem[]> {
  if (mode === 'dialogue') {
    return pickItems(getItems('dialogue'), n);
  }

  const theme = GA_CATEGORY_TAG[mode];
  const animes = shuffle(GA_IMAGE_ANIME);
  const items: GAnimeItem[] = [];
  onProgress?.(0, n);

  // Cycle through animes until we have n images (or give up after enough tries).
  let i = 0;
  const maxTries = Math.max(n * 4, 20);
  while (items.length < n && i < maxTries) {
    const a = animes[i % animes.length];
    i++;
    const url = await fetchScene(a.tag, theme);
    if (url) {
      items.push({ anime: a.anime, answers: a.answers, mode, imageUrl: url });
      onProgress?.(items.length, n);
    }
  }
  return items;
}
