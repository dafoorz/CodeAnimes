import { create } from 'zustand';
import type { Card, Character, GuessResult, Phase, Role, Team } from '../types';
import {
  applyGuess,
  createBoard,
  otherTeam,
  remainingForColor,
} from '../engine/gameLogic';

interface GameState {
  phase: Phase;

  // Board
  cards: Card[];
  firstTeam: Team;
  currentTeam: Team;

  // Player identity (this device's seat)
  playerTeam: Team | null;
  playerRole: Role | null;
  /** Operative peeking at the spymaster view (toggle). */
  spymasterView: boolean;

  // Active clue
  clue: string;
  clueNumber: number;
  guessesLeft: number;

  // Feedback / outcome
  lastResult: GuessResult | null;
  winner: Team | null;

  // Navigation
  goMenu: () => void;
  goHome: () => void;
  goToSelect: () => void;
  goToRole: () => void;
  goOnline: () => void;
  goQuiz: () => void;
  goChar: () => void;
  goGAnime: () => void;

  // Setup
  setPlayer: (team: Team, role: Role) => void;
  startGame: (pool: Character[]) => void;

  // Play
  submitClue: (word: string, count: number) => void;
  revealCard: (index: number) => void;
  endTurn: () => void;
  toggleSpymasterView: () => void;

  // Lifecycle
  resetGame: () => void;
}

const initialBoard = {
  cards: [] as Card[],
  firstTeam: 'red' as Team,
  currentTeam: 'red' as Team,
  clue: '',
  clueNumber: 0,
  guessesLeft: 0,
  lastResult: null as GuessResult | null,
  winner: null as Team | null,
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  playerTeam: null,
  playerRole: null,
  spymasterView: false,
  ...initialBoard,

  goMenu: () => set({ phase: 'menu' }),
  goHome: () => set({ phase: 'home' }),
  goToSelect: () => set({ phase: 'select' }),
  goToRole: () => set({ phase: 'role' }),
  goOnline: () => set({ phase: 'online' }),
  goQuiz: () => set({ phase: 'quiz' }),
  goChar: () => set({ phase: 'char' }),
  goGAnime: () => set({ phase: 'ganime' }),

  setPlayer: (team, role) => set({ playerTeam: team, playerRole: role }),

  startGame: (pool) => {
    const { cards, firstTeam } = createBoard(pool);
    set({
      ...initialBoard,
      cards,
      firstTeam,
      currentTeam: firstTeam,
      phase: 'game',
      spymasterView: false,
    });
  },

  submitClue: (word, count) => {
    const clue = word.trim();
    if (!clue || get().winner) return;
    // Operatives get one extra guess beyond the clue number (standard rules).
    set({ clue, clueNumber: count, guessesLeft: count + 1, lastResult: null });
  },

  revealCard: (index) => {
    const state = get();
    const card = state.cards[index];
    if (
      state.winner ||
      !card ||
      card.isRevealed ||
      state.guessesLeft <= 0 // no active clue / out of guesses
    ) {
      return;
    }

    const outcome = applyGuess(state.cards, index, state.currentTeam);

    if (outcome.winner) {
      set({
        cards: outcome.cards,
        lastResult: outcome.result,
        winner: outcome.winner,
        guessesLeft: 0,
        phase: 'end',
      });
      return;
    }

    if (outcome.turnEnds) {
      set({
        cards: outcome.cards,
        lastResult: outcome.result,
        currentTeam: otherTeam(state.currentTeam),
        clue: '',
        clueNumber: 0,
        guessesLeft: 0,
      });
      return;
    }

    // Correct guess, turn continues. End the turn automatically if out of guesses.
    const remaining = state.guessesLeft - 1;
    if (remaining <= 0) {
      set({
        cards: outcome.cards,
        lastResult: outcome.result,
        currentTeam: otherTeam(state.currentTeam),
        clue: '',
        clueNumber: 0,
        guessesLeft: 0,
      });
    } else {
      set({
        cards: outcome.cards,
        lastResult: outcome.result,
        guessesLeft: remaining,
      });
    }
  },

  endTurn: () => {
    const state = get();
    if (state.winner) return;
    set({
      currentTeam: otherTeam(state.currentTeam),
      clue: '',
      clueNumber: 0,
      guessesLeft: 0,
      lastResult: null,
    });
  },

  toggleSpymasterView: () =>
    set((state) => ({ spymasterView: !state.spymasterView })),

  resetGame: () =>
    set({
      ...initialBoard,
      phase: 'select',
      playerTeam: null,
      playerRole: null,
      spymasterView: false,
    }),
}));

// --- Selectors (derived state; keep components free of logic) ---------------

/** Remaining face-down cards for each team, for the score tracker. */
export function selectScores(state: GameState): { red: number; blue: number } {
  return {
    red: remainingForColor(state.cards, 'red'),
    blue: remainingForColor(state.cards, 'blue'),
  };
}

/**
 * Whether the board should be shown in spymaster view: either the player is a
 * spymaster, or an operative has toggled the peek.
 */
export function selectShowColors(state: GameState): boolean {
  return state.playerRole === 'spymaster' || state.spymasterView;
}
