// Wire protocol for host-authoritative online play.
//
// One peer is the HOST: it owns the authoritative game state (the real card
// colors) and runs all rules via the pure engine. Every other peer is a CLIENT
// that sends intents and renders the masked view the host sends back. Because
// face-down colors never leave the host for operatives, clients cannot cheat by
// inspecting network traffic or memory.

import type { Card, CardColor, GuessResult, Role, Team } from '../types';

/** Where an online session is in its lifecycle (host-driven). */
export type OnlineScreen = 'connect' | 'lobby' | 'game' | 'end';

/** A connected player's lobby/seat info (shared with everyone). */
export interface PlayerSeat {
  id: string;
  name: string;
  team: Team | null;
  role: Role | null;
  isHost: boolean;
  connected: boolean;
}

/** The per-recipient game snapshot the host sends to each client. */
export interface GameView {
  cards: Card[]; // face-down colors masked for operatives
  currentTeam: Team;
  firstTeam: Team;
  clue: string;
  clueNumber: number;
  guessesLeft: number;
  winner: Team | null;
  lastResult: GuessResult | null;
  scores: { red: number; blue: number };
}

/** Lobby snapshot broadcast to everyone. */
export interface LobbySnapshot {
  roomCode: string;
  players: PlayerSeat[];
  screen: OnlineScreen;
  poolReady: boolean;
  poolSize: number;
  selectedCount: number;
}

// --- Client -> Host -----------------------------------------------------------

export type ClientMessage =
  | { t: 'join'; name: string }
  | { t: 'seat'; team: Team | null; role: Role | null }
  | { t: 'clue'; word: string; count: number }
  | { t: 'guess'; index: number }
  | { t: 'endTurn' }
  | { t: 'playAgain' };

// --- Host -> Client -----------------------------------------------------------

export type HostMessage =
  | { t: 'lobby'; snapshot: LobbySnapshot }
  | { t: 'game'; screen: OnlineScreen; view: GameView; you: { team: Team | null; role: Role | null } }
  | { t: 'kick'; reason: string };

/**
 * Mask a board for a recipient's role. Spymasters (and the recap/end state) get
 * true colors; operatives get true colors only for already-revealed cards and a
 * neutral placeholder for face-down ones, so the solution can't be sniffed.
 */
export function maskCardsFor(
  cards: readonly Card[],
  role: Role | null,
  revealAll: boolean
): Card[] {
  if (revealAll || role === 'spymaster') {
    return cards.map((c) => ({ ...c }));
  }
  return cards.map((c) => ({
    ...c,
    assignedColor: c.isRevealed ? c.assignedColor : ('neutral' as CardColor),
  }));
}
