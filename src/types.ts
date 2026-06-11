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
export type Phase =
  | 'home'
  | 'select'
  | 'role'
  | 'game'
  | 'end'
  | 'online'
  | 'quiz';

// --- Opening Quiz ---

export type QuizTier = 1 | 2 | 3 | 4;

/** A curated quiz entry: how to find its opening and what answers count. */
export interface QuizAnime {
  /** Search query sent to AnimeThemes. */
  query: string;
  /** Canonical name shown on reveal and used as a multiple-choice option. */
  display: string;
  /** Accepted typed answers (matched fuzzily, case/punctuation-insensitive). */
  answers: string[];
  difficulty: QuizTier;
}

/** A fetched, ready-to-play quiz song. */
export interface QuizSong {
  display: string;
  answers: string[];
  difficulty: QuizTier;
  /** Direct URL to the opening video (webm, includes audio). */
  videoUrl: string;
  songTitle: string | null;
  /** Four shuffled multiple-choice options including the correct display name. */
  choices: string[];
}

/** How a player answered a given song. */
export type QuizAnswerMethod = 'typed' | 'choice' | 'none';

/** Per-song outcome for the end recap. */
export interface QuizResult {
  display: string;
  songTitle: string | null;
  difficulty: QuizTier;
  correct: boolean;
  method: QuizAnswerMethod;
  points: number;
}

/** Outcome of a guess, for UI feedback. */
export type GuessResult = 'correct' | 'wrong-team' | 'neutral' | 'assassin';
