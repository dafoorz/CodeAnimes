// Pure logic for Guess the Anime: round selection and scoring.

import { GA_BASE_POINTS } from '../data/config';
import { shuffle } from '../engine/gameLogic';
import { speedBonus } from '../char/charLogic';
import type { GAnimeItem } from '../types';

/** Pick `n` random prompts for the rounds (no repeats). */
export function pickItems(items: readonly GAnimeItem[], n: number): GAnimeItem[] {
  return shuffle(items).slice(0, n);
}

/** Points for a correct anime guess: base + the shared speed bonus. */
export function gaPoints(seconds: number): number {
  return GA_BASE_POINTS + speedBonus(seconds);
}
