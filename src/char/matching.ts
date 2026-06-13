// Fuzzy character-name matching using fuse.js.
//
// MyAnimeList names are usually "Lastname, Firstname" (e.g. "Uzumaki, Naruto",
// "Roronoa, Zoro"). We build a set of acceptable strings — the raw name, the
// "First Last" / "Last First" orderings, and each individual name part (so a
// given-name nickname like "Zoro" or a single-name character like "Saitama"
// works) — then fuzzy-match the guess against them.

import Fuse from 'fuse.js';
import type { CharMatch } from '../types';
import { normalize } from '../quiz/quizLogic';

/** Accepted answer strings for a character name. */
export function nameCandidates(name: string): string[] {
  const parts = name
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const out = new Set<string>();
  out.add(name.replace(',', ' '));
  if (parts.length === 2) {
    out.add(`${parts[1]} ${parts[0]}`); // First Last
    out.add(`${parts[0]} ${parts[1]}`); // Last First
  }
  for (const p of parts) {
    out.add(p);
    // individual tokens (handles middle names / initials)
    for (const tok of p.split(/\s+/)) if (tok.length >= 3) out.add(tok);
  }
  return [...out].filter(Boolean);
}

/**
 * Classify a guess against a character name:
 *  - 'perfect' if it matches a candidate exactly (after normalizing),
 *  - 'close'   if fuse.js finds a near match,
 *  - 'no'      otherwise.
 */
export function matchName(guess: string, name: string): CharMatch {
  const g = normalize(guess);
  if (g.length < 2) return 'no';

  const candidates = nameCandidates(name);
  if (candidates.some((c) => normalize(c) === g)) return 'perfect';

  // Match on normalized candidates so punctuation/spacing don't matter.
  const fuse = new Fuse(
    candidates.map((c) => ({ raw: c, norm: normalize(c) })),
    { keys: ['norm'], includeScore: true, threshold: 0.34, ignoreLocation: true }
  );
  const res = fuse.search(g);
  if (res.length && (res[0].score ?? 1) <= 0.34) return 'close';
  return 'no';
}
