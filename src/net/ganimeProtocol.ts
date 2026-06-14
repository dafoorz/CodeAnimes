// Wire protocol for online "Guess the Anime" (host-authoritative).
// The host sends each round's prompt (quote or image) WITHOUT the answer,
// judges guesses, and reveals once everyone has answered or skipped.

import type { CharMatch, GAnimeMode } from '../types';
import type { LeaderRow } from './quizProtocol';

export type GAnimeOnlineScreen = 'connect' | 'lobby' | 'play' | 'reveal' | 'end';

export interface GAnimePlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  score: number;
}

export interface GAnimeLobbySnapshot {
  roomCode: string;
  players: GAnimePlayerInfo[];
  screen: GAnimeOnlineScreen;
  mode: GAnimeMode;
  rounds: number;
  available: number;
}

export interface GAnimeRoundRow {
  name: string;
  match: CharMatch | 'skip';
  points: number;
}

export interface GAnimeRevealInfo {
  index: number;
  total: number;
  anime: string;
  character?: string;
  youMatch: CharMatch | 'skip';
  youPoints: number;
  youSeconds: number;
  rows: GAnimeRoundRow[];
  leaderboard: LeaderRow[];
}

export type GAnimeClientMsg =
  | { t: 'join'; name: string }
  | { t: 'guess'; text: string }
  | { t: 'skip' };

export type GAnimeHostMsg =
  | { t: 'lobby'; snapshot: GAnimeLobbySnapshot }
  | { t: 'round'; index: number; total: number; mode: GAnimeMode; quote?: string; imageUrl?: string }
  | { t: 'judge'; match: CharMatch; points: number }
  | { t: 'reveal'; info: GAnimeRevealInfo }
  | { t: 'end'; leaderboard: LeaderRow[] };
