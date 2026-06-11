// Centralized color->class mapping for cards and team UI, so styling stays
// consistent and components carry no color logic of their own.

import type { CardColor, Team } from '../types';

/** Background + text classes for a revealed card of the given color. */
export function revealedClasses(color: CardColor): string {
  switch (color) {
    case 'red':
      return 'bg-team-red text-white border-4 border-red-200';
    case 'blue':
      return 'bg-team-blue text-white border-4 border-blue-200';
    case 'neutral':
      return 'bg-white text-navy border-4 border-slate-300';
    case 'assassin':
      return 'bg-black text-white border-4 border-white';
  }
}

/** Border/tint classes shown in spymaster view on face-down cards. */
export function spymasterTintClasses(color: CardColor): string {
  switch (color) {
    case 'red':
      return 'border-4 border-team-red bg-team-red/20';
    case 'blue':
      return 'border-4 border-team-blue bg-team-blue/20';
    case 'neutral':
      return 'border-4 border-white bg-white/15';
    case 'assassin':
      return 'border-4 border-white bg-black/70';
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
