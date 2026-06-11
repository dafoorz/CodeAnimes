// Pure logic for the opening quiz: answer matching, scoring, difficulty
// ordering, and multiple-choice generation. No I/O, no React.

import {
  QUIZ_BASE_POINTS,
  QUIZ_CHOICE_POINTS,
  QUIZ_CLIP_SECONDS,
  QUIZ_MIN_TYPED_POINTS,
  QUIZ_TIER_BONUS,
} from '../data/config';
import { shuffle } from '../engine/gameLogic';
import type { QuizAnime, QuizTier } from '../types';

/** Lowercase, strip punctuation/diacritics-ish, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** Classic Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Whether a typed guess matches any accepted answer. Exact after normalizing,
 * or within a small edit-distance tolerance that scales with length (so longer
 * titles forgive more typos). Very short guesses must match exactly.
 */
export function isCorrectGuess(guess: string, answers: readonly string[]): boolean {
  const g = normalize(guess);
  if (!g) return false;
  for (const ans of answers) {
    const a = normalize(ans);
    if (!a) continue;
    if (g === a) return true;
    const tolerance = a.length <= 4 ? 0 : Math.floor(a.length / 6);
    if (tolerance > 0 && levenshtein(g, a) <= tolerance) return true;
  }
  return false;
}

/** Difficulty multiplier for scoring (tier 1 => 1.0, tier 4 => 1.6 by default). */
export function tierMultiplier(difficulty: QuizTier): number {
  return 1 + (difficulty - 1) * QUIZ_TIER_BONUS;
}

/**
 * Points for a typed answer given the seconds remaining on the clip. Linearly
 * decays from base (instant) to a floor (at the buzzer), times the tier bonus.
 * `clipLength` is the configured clip duration so scoring is fair at any length.
 */
export function scoreTyped(
  secondsLeft: number,
  difficulty: QuizTier,
  clipLength: number = QUIZ_CLIP_SECONDS
): number {
  const frac = Math.max(0, Math.min(1, secondsLeft / clipLength));
  const raw = QUIZ_MIN_TYPED_POINTS + (QUIZ_BASE_POINTS - QUIZ_MIN_TYPED_POINTS) * frac;
  return Math.round(raw * tierMultiplier(difficulty));
}

/** Points for a correct multiple-choice pick after the clip ended. */
export function scoreChoice(difficulty: QuizTier): number {
  return Math.round(QUIZ_CHOICE_POINTS * tierMultiplier(difficulty));
}

/**
 * Order the pool easy -> hard: shuffle within each tier, then concatenate tiers
 * ascending. The fetcher walks this list, so early songs are popular and later
 * ones get obscure, and any that fail to load are simply skipped.
 */
export function orderByDifficulty(pool: readonly QuizAnime[]): QuizAnime[] {
  const tiers: QuizTier[] = [1, 2, 3, 4];
  return tiers.flatMap((t) => shuffle(pool.filter((p) => p.difficulty === t)));
}

/** Build 4 shuffled options: the correct display plus 3 distractors. */
export function makeChoices(
  correct: string,
  pool: readonly QuizAnime[]
): string[] {
  const others = shuffle(
    pool.map((p) => p.display).filter((d) => d !== correct)
  ).slice(0, 3);
  return shuffle([correct, ...others]);
}
