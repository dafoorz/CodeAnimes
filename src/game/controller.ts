// A presentation-facing interface over the game, implemented by both the local
// (single-device) store and the online (networked) store. GameBoard and
// EndScreen render against this so the same UI serves both modes.

import type { Card, GuessResult, Role, Team } from '../types';

/** A player shown in the on-board team roster (online play only). */
export interface RosterEntry {
  name: string;
  team: Team | null;
  role: Role | null;
  isHost: boolean;
  isSelf: boolean;
  connected: boolean;
}

export interface BoardController {
  cards: Card[];
  currentTeam: Team;
  clue: string;
  clueNumber: number;
  guessesLeft: number;
  winner: Team | null;
  scores: { red: number; blue: number };

  playerTeam: Team | null;
  playerRole: Role | null;
  lastResult: GuessResult | null;

  /** Whether colors are visible to this viewer (spymaster or local peek). */
  showColors: boolean;
  /** Operative peek toggle is available (local hotseat only). */
  canPeek: boolean;
  spymasterView: boolean;

  /** This viewer may tap a card right now. */
  canGuess: boolean;
  /** This viewer may submit a clue right now. */
  canClue: boolean;
  /** This viewer may end the current turn right now. */
  canEndTurn: boolean;

  /** Status text shown when no action is available (e.g. "Waiting for clue"). */
  waitingText: string | null;

  /** Connected players grouped for the on-board roster (undefined = local play). */
  roster?: RosterEntry[];

  submitClue: (word: string, count: number) => void;
  revealCard: (index: number) => void;
  endTurn: () => void;
  togglePeek: () => void;

  /** Restart flow (Play Again / Back to Lobby). */
  playAgain: () => void;
  /** Label for the restart button. */
  restartLabel: string;
  /** Whether this player may trigger the restart (online: host only). */
  canRestart: boolean;
  /** Leave to the home screen. */
  goHome: () => void;
}
