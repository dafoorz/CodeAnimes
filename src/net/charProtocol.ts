// Wire protocol for online "Guess the Character" (host-authoritative).
//
// The host owns the answers and scoring. Each round it sends everyone the same
// disguised character (image URL + challenge + crop — never the name). Players
// guess independently with no time limit; the host judges, tracks who's done,
// and reveals once everyone has answered or skipped. Character image URLs are
// numeric filenames, so they don't leak the name.

import type { CharChallenge, CharMatch } from '../types';
import type { LeaderRow } from './quizProtocol';

export type CharOnlineScreen = 'connect' | 'lobby' | 'play' | 'reveal' | 'end';

export interface CharPlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  score: number;
}

export interface CharLobbySnapshot {
  roomCode: string;
  players: CharPlayerInfo[];
  screen: CharOnlineScreen;
  challenge: CharChallenge;
  rounds: number;
  poolReady: boolean;
  poolSize: number;
}

/** One player's outcome for a round (shown on the reveal screen). */
export interface CharRoundRow {
  name: string; // player name
  match: CharMatch | 'skip';
  points: number;
}

export interface CharRevealInfo {
  index: number;
  total: number;
  correctName: string;
  correctImage: string;
  anime: string;
  youMatch: CharMatch | 'skip';
  youPoints: number;
  youSeconds: number;
  rows: CharRoundRow[];
  leaderboard: LeaderRow[];
}

// --- Client -> Host ----------------------------------------------------------

export type CharClientMsg =
  | { t: 'join'; name: string }
  | { t: 'guess'; text: string; level: number }
  | { t: 'skip' };

// --- Host -> Client ----------------------------------------------------------

export type CharHostMsg =
  | { t: 'lobby'; snapshot: CharLobbySnapshot }
  | {
      t: 'round';
      index: number;
      total: number;
      challenge: CharChallenge;
      imageUrl: string;
      crop: { x: number; y: number };
    }
  | { t: 'judge'; match: CharMatch; points: number }
  | { t: 'reveal'; info: CharRevealInfo }
  | { t: 'end'; leaderboard: LeaderRow[] };
