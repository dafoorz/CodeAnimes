// Centralized color->class mapping for cards and team UI, so styling stays
// consistent and components carry no color logic of their own.

import type { CardColor, Team } from '../types';

/** Background + text classes for a revealed card of the given color. */
export function revealedClasses(color: CardColor): string {
  switch (color) {
    case 'red':
      return 'bg-team-red text-white border-team-red-dark';
    case 'blue':
      return 'bg-team-blue text-white border-team-blue-dark';
    case 'neutral':
      return 'bg-neutral-tan text-navy border-neutral-tan-dark';
    case 'assassin':
      return 'bg-assassin text-white border-black';
  }
}

/** Border/tint classes shown in spymaster view on face-down cards. */
export function spymasterTintClasses(color: CardColor): string {
  switch (color) {
    case 'red':
      return 'ring-2 ring-team-red/80 bg-team-red/15';
    case 'blue':
      return 'ring-2 ring-team-blue/80 bg-team-blue/15';
    case 'neutral':
      return 'ring-2 ring-neutral-tan/70 bg-neutral-tan/10';
    case 'assassin':
      return 'ring-2 ring-white/80 bg-black/60';
  }
}

/** Team accent text color. */
export function teamText(team: Team): string {
  return team === 'red' ? 'text-team-red' : 'text-team-blue';
}

/** Team solid background. */
export function teamBg(team: Team): string {
  return team === 'red' ? 'bg-team-red' : 'bg-team-blue';
}

/** Team label. */
export function teamLabel(team: Team): string {
  return team === 'red' ? 'Red' : 'Blue';
}

/** Deterministic gradient for image fallbacks, based on a string seed. */
export function initialsGradient(seed: string): string {
  const palettes = [
    'from-pink-600 to-purple-700',
    'from-indigo-600 to-blue-700',
    'from-emerald-600 to-teal-700',
    'from-amber-600 to-orange-700',
    'from-rose-600 to-red-700',
    'from-violet-600 to-fuchsia-700',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return palettes[Math.abs(hash) % palettes.length];
}

/** First letters of up to two words in a name. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
