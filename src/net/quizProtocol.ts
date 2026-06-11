// Wire protocol for the online song quiz (buzzer race), host-authoritative.
//
// The host owns the answers and the clock. Clients preload the same clips by
// URL and play them locally; the host says when each round starts, judges typed
// guesses, scores by speed, and broadcasts reveals + the leaderboard. Answers
// are never sent to clients before the reveal.
//
// Note: a clip's video URL (filename) can hint at the anime, so a determined
// player could peek via dev tools. That's an accepted trade-off for a casual
// friends game; a future version could relay the media as an opaque stream.

export type QuizOnlineScreen =
  | 'connect'
  | 'lobby'
  | 'preparing'
  | 'play'
  | 'reveal'
  | 'end';

export interface QuizPlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  score: number;
  ready: boolean;
}

export interface LeaderRow {
  name: string;
  score: number;
  isSelf: boolean;
}

export interface QuizLobbySnapshot {
  roomCode: string;
  players: QuizPlayerInfo[];
  screen: QuizOnlineScreen;
  numSongs: number;
  clipSeconds: number;
  showVideo: boolean;
}

export interface QuizRevealInfo {
  index: number;
  total: number;
  correctDisplay: string;
  songTitle: string | null;
  youCorrect: boolean;
  youPoints: number;
  leaderboard: LeaderRow[];
}

// --- Client -> Host ----------------------------------------------------------

export type QuizClientMsg =
  | { t: 'join'; name: string }
  | { t: 'ready' }
  | { t: 'guess'; text: string };

// --- Host -> Client ----------------------------------------------------------

export type QuizHostMsg =
  | { t: 'lobby'; snapshot: QuizLobbySnapshot }
  | { t: 'prepare'; videoUrls: string[]; clipSeconds: number; showVideo: boolean }
  | { t: 'round'; index: number; total: number; difficulty: number }
  | { t: 'judge'; correct: boolean; points: number }
  | { t: 'reveal'; info: QuizRevealInfo }
  | { t: 'end'; leaderboard: LeaderRow[] };
