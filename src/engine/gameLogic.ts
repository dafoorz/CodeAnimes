// Pure game logic. No React, no side effects, no I/O — everything here is a
// deterministic function of its inputs (given a shuffle source). This is the
// single source of truth for board construction and win/lose evaluation.

import {
  ASSASSIN_CARDS,
  BLUE_CARDS,
  BOARD_SIZE,
  NEUTRAL_CARDS,
  RED_CARDS,
} from '../data/config';
import type { Card, CardColor, Character, GuessResult, Team } from '../types';

/** Fisher–Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Coin flip for which team goes first (and thus gets the extra card). */
export function coinFlip(): Team {
  return Math.random() < 0.5 ? 'red' : 'blue';
}

/**
 * Pick BOARD_SIZE unique characters from the pool and return them shuffled.
 * De-duplicates by malId+name so the same character can't appear twice even if
 * two selected animes share a crossover character.
 */
export function buildDeck(characterPool: readonly Character[]): Character[] {
  const seen = new Set<string>();
  const unique: Character[] = [];
  for (const c of characterPool) {
    const id = `${c.malId}:${c.name}`;
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(c);
    }
  }
  return shuffle(unique).slice(0, BOARD_SIZE);
}

/** How many cards each color gets, given which team starts. */
export function colorCounts(firstTeam: Team): Record<CardColor, number> {
  const starterCount = RED_CARDS; // the larger bucket
  const otherCount = BLUE_CARDS;
  return {
    red: firstTeam === 'red' ? starterCount : otherCount,
    blue: firstTeam === 'blue' ? starterCount : otherCount,
    neutral: NEUTRAL_CARDS,
    assassin: ASSASSIN_CARDS,
  };
}

/**
 * Assign a color to each character in the (already chosen) deck. The starting
 * team gets RED_CARDS, the other BLUE_CARDS, plus neutrals and the assassin.
 * Colors are shuffled across the deck positions.
 */
export function assignColors(
  deck: readonly Character[],
  firstTeam: Team
): Card[] {
  const counts = colorCounts(firstTeam);
  const colorBag: CardColor[] = [
    ...Array<CardColor>(counts.red).fill('red'),
    ...Array<CardColor>(counts.blue).fill('blue'),
    ...Array<CardColor>(counts.neutral).fill('neutral'),
    ...Array<CardColor>(counts.assassin).fill('assassin'),
  ];

  const colors = shuffle(colorBag);
  return deck.map((character, i) => ({
    character,
    assignedColor: colors[i],
    isRevealed: false,
  }));
}

/** Build a complete, color-assigned board plus the starting team in one call. */
export function createBoard(characterPool: readonly Character[]): {
  cards: Card[];
  firstTeam: Team;
} {
  const firstTeam = coinFlip();
  const deck = buildDeck(characterPool);
  const cards = assignColors(deck, firstTeam);
  return { cards, firstTeam };
}

/** Count how many cards of a color are still face-down. */
export function remainingForColor(
  cards: readonly Card[],
  color: CardColor
): number {
  return cards.filter((c) => c.assignedColor === color && !c.isRevealed).length;
}

/**
 * Determine the winner, or null if the game continues.
 *
 * - If the assassin is revealed, the team that just guessed (currentTeam) loses,
 *   so the opponent wins immediately.
 * - Otherwise, whichever team has revealed all of its cards wins.
 */
export function checkWin(
  cards: readonly Card[],
  currentTeam: Team
): Team | null {
  const assassinRevealed = cards.some(
    (c) => c.assignedColor === 'assassin' && c.isRevealed
  );
  if (assassinRevealed) {
    return currentTeam === 'red' ? 'blue' : 'red';
  }

  if (remainingForColor(cards, 'red') === 0) return 'red';
  if (remainingForColor(cards, 'blue') === 0) return 'blue';
  return null;
}

/** The opposing team. */
export function otherTeam(team: Team): Team {
  return team === 'red' ? 'blue' : 'red';
}

/** Result of applying a single operative guess to the board. */
export interface GuessOutcome {
  /** New cards array with the guessed card revealed. */
  cards: Card[];
  /** What kind of card was hit, for UI feedback. */
  result: GuessResult;
  /** Whether this guess forces the current team's turn to end. */
  turnEnds: boolean;
  /** Winner if the game is now decided, else null. */
  winner: Team | null;
}

/**
 * Apply an operative's guess at `index` for `currentTeam`. Pure: returns a new
 * board and the consequences without mutating the input. Callers are
 * responsible for ignoring already-revealed cards / finished games before
 * calling.
 *
 * Turn-ending rules (standard Codenames): hitting your own color keeps the turn
 * alive; hitting a neutral, the opponent's color, or the assassin ends it. The
 * assassin also loses the game for the guessing team.
 */
export function applyGuess(
  cards: readonly Card[],
  index: number,
  currentTeam: Team
): GuessOutcome {
  const color = cards[index].assignedColor;
  const newCards = cards.map((c, i) =>
    i === index ? { ...c, isRevealed: true } : c
  );

  let result: GuessResult;
  let turnEnds: boolean;
  if (color === 'assassin') {
    result = 'assassin';
    turnEnds = true;
  } else if (color === currentTeam) {
    result = 'correct';
    turnEnds = false;
  } else if (color === 'neutral') {
    result = 'neutral';
    turnEnds = true;
  } else {
    result = 'wrong-team';
    turnEnds = true;
  }

  return {
    cards: newCards,
    result,
    turnEnds,
    winner: checkWin(newCards, currentTeam),
  };
}
