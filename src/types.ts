// Shared domain types for Anime Codenames.

/** A card's team/role color on the board. */
export type CardColor = 'red' | 'blue' | 'neutral' | 'assassin';

/** A playable team. */
export type Team = 'red' | 'blue';

/** Player role in a game. */
export type Role = 'spymaster' | 'operative';

/** A single anime character used to populate a board card. */
export interface Character {
  name: string;
  anime: string;
  imageUrl: string;
  malId: number;
}

/** A board card: a character plus its hidden assigned color and reveal state. */
export interface Card {
  character: Character;
  assignedColor: CardColor;
  isRevealed: boolean;
}

/** An anime that can be selected to source characters from. */
export interface AnimeOption {
  malId: number;
  title: string;
  coverImage?: string;
  year?: number;
  /** Marks entries that came from the hardcoded famous list. */
  isFamous?: boolean;
  /** Number of characters fetched (filled in after fetching). */
  characterCount?: number;
}

/** High-level screen the app is currently showing. */
export type Phase = 'home' | 'select' | 'role' | 'game' | 'end';

/** Outcome of a guess, for UI feedback. */
export type GuessResult = 'correct' | 'wrong-team' | 'neutral' | 'assassin';
