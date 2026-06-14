// Character / title name matching.
//
// MyAnimeList names are usually "Lastname, Firstname" (e.g. "Uzumaki, Naruto",
// "Roronoa, Zoro"). We build acceptable strings — the raw name, the
// "First Last" / "Last First" orderings, and each individual name part — then
// match the guess against them with a STRICT edit-distance rule: exact, or a
// small typo tolerance that scales with length, and the guess must be close to
// the candidate's length (so a 3-letter fragment can't match a long name).

import type { CharMatch } from '../types';
import { levenshtein, normalize } from '../quiz/quizLogic';

/** Accepted answer strings for a "Lastname, Firstname" style character name. */
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
    // individual tokens (handles middle names / initials); 3+ letters only
    for (const tok of p.split(/\s+/)) if (tok.length >= 3) out.add(tok);
  }
  return [...out].filter(Boolean);
}

/**
 * Classify a normalized guess against one normalized candidate.
 * - exact -> perfect
 * - within a length-scaled edit tolerance (and similar length) -> close
 * - otherwise -> no
 */
function classify(g: string, c: string): CharMatch {
  if (!c) return 'no';
  if (g === c) return 'perfect';
  // Tolerance for real typos, scaled to the word length. Short names: exact only.
  const tol = c.length <= 4 ? 0 : c.length <= 7 ? 1 : 2;
  if (tol === 0) return 'no';
  // Reject guesses that differ a lot in length (prefixes / fragments).
  if (Math.abs(g.length - c.length) > tol) return 'no';
  return levenshtein(g, c) <= tol ? 'close' : 'no';
}

function matchCandidates(guess: string, candidates: readonly string[]): CharMatch {
  const g = normalize(guess);
  if (g.length < 2) return 'no';
  let best: CharMatch = 'no';
  for (const cand of candidates) {
    const r = classify(g, normalize(cand));
    if (r === 'perfect') return 'perfect';
    if (r === 'close') best = 'close';
  }
  return best;
}

/** Match a guess against a character name ("Lastname, Firstname"). */
export function matchName(guess: string, name: string): CharMatch {
  return matchCandidates(guess, nameCandidates(name));
}

/** Match a guess against an explicit list of accepted answers (titles/aliases). */
export function matchTitle(guess: string, answers: readonly string[]): CharMatch {
  return matchCandidates(guess, answers);
}
