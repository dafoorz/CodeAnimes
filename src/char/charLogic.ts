// Pure logic for Guess the Character: pool building, scoring, and the random
// crop used by Extreme Zoom.

import {
  CHAR_BASE_POINTS,
  CHAR_LEVEL_POINTS,
  CHAR_SPEED_INTERVAL,
  CHAR_SPEED_START,
  CHAR_SPEED_STEP,
} from '../data/config';
import { shuffle } from '../engine/gameLogic';
import type { CharChallenge, Character } from '../types';

/** Cap each anime's characters (favorites order preserved) and flatten. */
export function buildCharPool(
  pool: readonly Character[],
  capPerAnime: number
): Character[] {
  const byAnime = new Map<string, Character[]>();
  for (const c of pool) {
    const list = byAnime.get(c.anime) ?? [];
    list.push(c);
    byAnime.set(c.anime, list);
  }
  const out: Character[] = [];
  for (const list of byAnime.values()) out.push(...list.slice(0, capPerAnime));
  return out;
}

/** Pick `n` random characters for the rounds (no repeats). */
export function pickRoundCharacters(
  pool: readonly Character[],
  n: number
): Character[] {
  return shuffle(pool).slice(0, n);
}

/** Speed bonus: starts at START, drops STEP every INTERVAL seconds, min 0. */
export function speedBonus(seconds: number): number {
  const drops = Math.floor(Math.max(0, seconds) / CHAR_SPEED_INTERVAL);
  return Math.max(0, CHAR_SPEED_START - drops * CHAR_SPEED_STEP);
}

/** Base points for a correct answer at a given hint level (0-based). */
export function basePoints(challenge: CharChallenge, level: number): number {
  if (challenge === 'zoom' || challenge === 'blur') {
    return CHAR_LEVEL_POINTS[Math.min(level, CHAR_LEVEL_POINTS.length - 1)];
  }
  return CHAR_BASE_POINTS;
}

/** Total points for a correct answer: base (by mode/level) + speed bonus. */
export function roundPoints(
  challenge: CharChallenge,
  level: number,
  seconds: number
): number {
  return basePoints(challenge, level) + speedBonus(seconds);
}

/**
 * A random background-position (percent) for Extreme Zoom that avoids the
 * centre of the face, so the first view is genuinely hard.
 */
export function randomCrop(): { x: number; y: number } {
  const inFace = (x: number, y: number) =>
    x > 35 && x < 65 && y > 12 && y < 45;
  for (let i = 0; i < 20; i++) {
    const x = Math.round(Math.random() * 100);
    const y = Math.round(Math.random() * 100);
    if (!inFace(x, y)) return { x, y };
  }
  return { x: 90, y: 90 };
}
