import { create } from 'zustand';
import { NetClient, NetHost } from '../net/peer';
import type {
  LeaderRow,
  QuizClientMsg,
  QuizHostMsg,
  QuizOnlineScreen,
  QuizPlayerInfo,
  QuizRevealInfo,
} from '../net/quizProtocol';
import { OPENING_QUIZ } from '../data/openingQuiz';
import { fetchOpening, preloadClip } from '../api/animethemes';
import {
  QUIZ_CLIP_SECONDS,
  QUIZ_DEFAULT_SONGS,
} from '../data/config';
import { isCorrectGuess, orderByDifficulty, scoreTyped } from '../quiz/quizLogic';
import type { QuizTier } from '../types';

const HOST_ID = 'host';
/** Pause on the reveal between rounds (ms). */
const REVEAL_MS = 4500;

interface HostSong {
  videoUrl: string;
  answers: string[];
  display: string;
  songTitle: string | null;
  difficulty: QuizTier;
}

interface QuizNetState {
  active: boolean;
  isHost: boolean;
  connecting: boolean;
  error: string | null;

  roomCode: string;
  selfId: string;
  selfName: string;
  screen: QuizOnlineScreen;

  players: QuizPlayerInfo[];

  // Settings (host-controlled, mirrored to clients)
  numSongs: number;
  clipSeconds: number;
  showVideo: boolean;

  // Preload progress (this peer)
  preloadDone: number;
  preloadTotal: number;
  /** Locally playable clip URLs (preloaded blobs), one per round. */
  clipUrls: string[];

  // Current round (this peer's view)
  roundIndex: number;
  total: number;
  difficulty: QuizTier;
  myAnswered: boolean;
  myCorrect: boolean;
  myPoints: number;
  /** Bumped whenever a guess is judged wrong, to trigger a shake. */
  wrongNonce: number;

  reveal: QuizRevealInfo | null;
  endLeaderboard: LeaderRow[];

  // Lifecycle
  enter: () => void;
  hostRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => void;
  leave: () => void;
  clearError: () => void;

  // Host settings
  setNumSongs: (n: number) => void;
  setClipSeconds: (s: number) => void;
  setShowVideo: (v: boolean) => void;
  hostStart: () => Promise<void>;
  hostToLobby: () => void;

  // Play
  submitGuess: (text: string) => void;
}

// Non-reactive handles / host-only mutable bits.
let netHost: NetHost<QuizClientMsg, QuizHostMsg> | null = null;
let netClient: NetClient<QuizClientMsg, QuizHostMsg> | null = null;
let hostSongs: HostSong[] = [];
let roundStart = 0;
let answeredThisRound = new Set<string>();
let roundPoints = new Map<string, number>();
let roundTimer: ReturnType<typeof setTimeout> | null = null;
let revealTimer: ReturnType<typeof setTimeout> | null = null;
const blobUrls: string[] = [];

function revokeBlobs() {
  while (blobUrls.length) URL.revokeObjectURL(blobUrls.pop()!);
}
function clearTimers() {
  if (roundTimer) clearTimeout(roundTimer);
  if (revealTimer) clearTimeout(revealTimer);
  roundTimer = null;
  revealTimer = null;
}

export const useQuizNetStore = create<QuizNetState>((set, get) => {
  // --- Shared helpers -------------------------------------------------------

  function patchPlayers(fn: (ps: QuizPlayerInfo[]) => QuizPlayerInfo[]) {
    set({ players: fn(get().players.slice()) });
  }

  function leaderboardFor(selfId: string): LeaderRow[] {
    return get()
      .players.map((p) => ({ name: p.name, score: p.score, isSelf: p.id === selfId }))
      .sort((a, b) => b.score - a.score);
  }

  function lobbyFor(): QuizHostMsg {
    const s = get();
    return {
      t: 'lobby',
      snapshot: {
        roomCode: s.roomCode,
        players: s.players,
        screen: s.screen,
        numSongs: s.numSongs,
        clipSeconds: s.clipSeconds,
        showVideo: s.showVideo,
      },
    };
  }

  function broadcastLobby() {
    if (get().isHost) netHost?.broadcast(lobbyFor());
  }

  /** Preload all clip URLs locally (host or client), updating progress. */
  async function preloadAll(urls: string[]) {
    set({ preloadTotal: urls.length, preloadDone: 0, clipUrls: [], screen: 'preparing' });
    const out: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const play = await preloadClip(urls[i]);
      if (play.startsWith('blob:')) blobUrls.push(play);
      out.push(play);
      set({ preloadDone: i + 1, clipUrls: [...out] });
    }
    set({ clipUrls: out });
  }

  // --- Host: round flow -----------------------------------------------------

  function hostStartRound(i: number) {
    const s = get();
    answeredThisRound = new Set();
    roundPoints = new Map();
    roundStart = Date.now();
    const song = hostSongs[i];
    set({
      screen: 'play',
      roundIndex: i,
      total: hostSongs.length,
      difficulty: song.difficulty,
      myAnswered: false,
      myCorrect: false,
      myPoints: 0,
      reveal: null,
    });
    netHost?.broadcast({
      t: 'round',
      index: i,
      total: hostSongs.length,
      difficulty: song.difficulty,
    });
    if (roundTimer) clearTimeout(roundTimer);
    roundTimer = setTimeout(() => hostEndRound(i), s.clipSeconds * 1000 + 250);
  }

  function hostEndRound(i: number) {
    const song = hostSongs[i];
    const total = hostSongs.length;
    for (const p of get().players) {
      const youPoints = roundPoints.get(p.id) ?? 0;
      const info: QuizRevealInfo = {
        index: i,
        total,
        correctDisplay: song.display,
        songTitle: song.songTitle,
        youCorrect: answeredThisRound.has(p.id),
        youPoints,
        leaderboard: leaderboardFor(p.id),
      };
      if (p.id === HOST_ID) {
        set({ reveal: info, screen: 'reveal' });
      } else {
        netHost?.send(p.id, { t: 'reveal', info });
      }
    }
    if (revealTimer) clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      if (i + 1 < total) hostStartRound(i + 1);
      else hostEndGame();
    }, REVEAL_MS);
  }

  function hostEndGame() {
    for (const p of get().players) {
      if (p.id === HOST_ID) {
        set({ endLeaderboard: leaderboardFor(HOST_ID), screen: 'end' });
      } else {
        netHost?.send(p.id, { t: 'end', leaderboard: leaderboardFor(p.id) });
      }
    }
  }

  /** Judge a guess from player `id` (also used for the host's own guesses). */
  function hostJudge(id: string, text: string) {
    if (get().screen !== 'play') return;
    if (answeredThisRound.has(id)) return;
    const song = hostSongs[get().roundIndex];
    const correct = isCorrectGuess(text, song.answers);
    let points = 0;
    if (correct) {
      const elapsed = (Date.now() - roundStart) / 1000;
      const secondsLeft = get().clipSeconds - elapsed;
      points = scoreTyped(secondsLeft, song.difficulty, get().clipSeconds);
      answeredThisRound.add(id);
      roundPoints.set(id, points);
      patchPlayers((ps) =>
        ps.map((p) => (p.id === id ? { ...p, score: p.score + points } : p))
      );
    }
    if (id === HOST_ID) {
      if (correct) set({ myAnswered: true, myCorrect: true, myPoints: points });
      else set((s) => ({ wrongNonce: s.wrongNonce + 1 }));
    } else {
      netHost?.send(id, { t: 'judge', correct, points });
    }
  }

  function onClientMessage(id: string, msg: QuizClientMsg) {
    switch (msg.t) {
      case 'join':
        patchPlayers((ps) => {
          const existing = ps.find((p) => p.id === id);
          if (existing) {
            existing.name = msg.name;
            existing.connected = true;
            return ps;
          }
          return [
            ...ps,
            { id, name: msg.name, isHost: false, connected: true, score: 0, ready: false },
          ];
        });
        broadcastLobby();
        break;
      case 'ready':
        patchPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, ready: true } : p)));
        maybeBeginRounds();
        break;
      case 'guess':
        hostJudge(id, msg.text);
        break;
    }
  }

  /** Start round 0 once every connected player has preloaded. */
  function maybeBeginRounds() {
    const s = get();
    if (s.screen !== 'preparing') return;
    const everyoneReady = s.players.every((p) => !p.connected || p.ready);
    if (everyoneReady && hostSongs.length > 0) hostStartRound(0);
  }

  // --- Public store ---------------------------------------------------------

  const FRESH = {
    players: [] as QuizPlayerInfo[],
    preloadDone: 0,
    preloadTotal: 0,
    clipUrls: [] as string[],
    roundIndex: 0,
    total: 0,
    difficulty: 1 as QuizTier,
    myAnswered: false,
    myCorrect: false,
    myPoints: 0,
    wrongNonce: 0,
    reveal: null as QuizRevealInfo | null,
    endLeaderboard: [] as LeaderRow[],
  };

  return {
    active: false,
    isHost: false,
    connecting: false,
    error: null,
    roomCode: '',
    selfId: '',
    selfName: '',
    screen: 'connect',
    numSongs: QUIZ_DEFAULT_SONGS,
    clipSeconds: QUIZ_CLIP_SECONDS,
    showVideo: true,
    ...FRESH,

    enter: () => {
      clearTimers();
      revokeBlobs();
      hostSongs = [];
      set({ active: true, screen: 'connect', error: null, connecting: false, ...FRESH });
    },

    hostRoom: async (name) => {
      set({ connecting: true, error: null });
      try {
        netHost = new NetHost<QuizClientMsg, QuizHostMsg>({
          onConnect: () => {},
          onMessage: (id, msg) => onClientMessage(id, msg),
          onDisconnect: (id) => {
            patchPlayers((ps) =>
              ps.map((p) => (p.id === id ? { ...p, connected: false } : p))
            );
            broadcastLobby();
            maybeBeginRounds();
          },
          onError: (message) => set({ error: message, connecting: false }),
        });
        await netHost.ready();
        set({
          active: true,
          isHost: true,
          connecting: false,
          roomCode: netHost.code,
          selfId: HOST_ID,
          selfName: name,
          screen: 'lobby',
          players: [
            { id: HOST_ID, name, isHost: true, connected: true, score: 0, ready: false },
          ],
        });
      } catch (e) {
        set({
          connecting: false,
          error: e instanceof Error ? e.message : 'Could not create room.',
        });
      }
    },

    joinRoom: (code, name) => {
      set({ connecting: true, error: null, selfName: name });
      netClient = new NetClient<QuizClientMsg, QuizHostMsg>(code.trim().toUpperCase(), {
        onOpen: (selfId) => {
          set({
            active: true,
            isHost: false,
            connecting: false,
            roomCode: code.trim().toUpperCase(),
            selfId,
          });
          netClient?.send({ t: 'join', name });
        },
        onMessage: (msg) => onHostMessage(msg),
        onClose: () => set({ error: 'Disconnected from the host.' }),
        onError: (message) => set({ error: message, connecting: false }),
      });
    },

    leave: () => {
      clearTimers();
      revokeBlobs();
      hostSongs = [];
      netHost?.destroy();
      netClient?.destroy();
      netHost = null;
      netClient = null;
      set({
        active: false,
        isHost: false,
        connecting: false,
        error: null,
        roomCode: '',
        selfId: '',
        screen: 'connect',
        ...FRESH,
      });
    },

    clearError: () => set({ error: null }),

    setNumSongs: (n) => {
      set({ numSongs: n });
      broadcastLobby();
    },
    setClipSeconds: (s) => {
      set({ clipSeconds: s });
      broadcastLobby();
    },
    setShowVideo: (v) => {
      set({ showVideo: v });
      broadcastLobby();
    },

    hostStart: async () => {
      const { numSongs } = get();
      set({ screen: 'preparing', error: null });
      // Reset scores/ready for a fresh game.
      patchPlayers((ps) => ps.map((p) => ({ ...p, score: 0, ready: false })));
      broadcastLobby();

      // 1) Find songs (host keeps the answers secret).
      const ordered = orderByDifficulty(OPENING_QUIZ);
      const found: HostSong[] = [];
      for (const entry of ordered) {
        if (found.length >= numSongs) break;
        const meta = await fetchOpening(entry.query);
        if (meta) {
          found.push({
            videoUrl: meta.videoUrl,
            answers: entry.answers,
            display: entry.display,
            songTitle: meta.songTitle,
            difficulty: entry.difficulty,
          });
        }
      }
      if (found.length === 0) {
        set({ screen: 'lobby', error: 'Could not load any openings. Try again.' });
        broadcastLobby();
        return;
      }
      hostSongs = found;

      // 2) Tell clients which clips to preload, then preload locally too.
      netHost?.broadcast({
        t: 'prepare',
        videoUrls: found.map((f) => f.videoUrl),
        clipSeconds: get().clipSeconds,
        showVideo: get().showVideo,
      });
      await preloadAll(found.map((f) => f.videoUrl));
      // Mark host ready and start when everyone is ready.
      patchPlayers((ps) => ps.map((p) => (p.id === HOST_ID ? { ...p, ready: true } : p)));
      maybeBeginRounds();
    },

    hostToLobby: () => {
      clearTimers();
      patchPlayers((ps) => ps.map((p) => ({ ...p, score: 0, ready: false })));
      set({ screen: 'lobby', reveal: null, endLeaderboard: [] });
      broadcastLobby();
    },

    submitGuess: (text) => {
      const s = get();
      if (s.myAnswered || s.screen !== 'play') return;
      if (s.isHost) hostJudge(HOST_ID, text);
      else netClient?.send({ t: 'guess', text });
    },
  };

  // --- Client message handling (declared after store for hoisting) ----------
  function onHostMessage(msg: QuizHostMsg) {
    switch (msg.t) {
      case 'lobby': {
        // Adopt the host's screen only while we're still in the pre-game flow;
        // never let a stray lobby ping (e.g. a disconnect) yank us out of an
        // active round/reveal/end.
        const pre = ['connect', 'lobby', 'preparing', 'end'];
        const cur = get().screen;
        set({
          players: msg.snapshot.players,
          roomCode: msg.snapshot.roomCode,
          numSongs: msg.snapshot.numSongs,
          clipSeconds: msg.snapshot.clipSeconds,
          showVideo: msg.snapshot.showVideo,
          screen: pre.includes(cur) ? msg.snapshot.screen : cur,
        });
        break;
      }
      case 'prepare':
        set({ clipSeconds: msg.clipSeconds, showVideo: msg.showVideo });
        preloadAll(msg.videoUrls).then(() => netClient?.send({ t: 'ready' }));
        break;
      case 'round':
        set({
          screen: 'play',
          roundIndex: msg.index,
          total: msg.total,
          difficulty: msg.difficulty as QuizTier,
          myAnswered: false,
          myCorrect: false,
          myPoints: 0,
          reveal: null,
        });
        break;
      case 'judge':
        if (msg.correct) {
          set({ myAnswered: true, myCorrect: true, myPoints: msg.points });
        } else {
          set((s) => ({ wrongNonce: s.wrongNonce + 1 }));
        }
        break;
      case 'reveal':
        set({ reveal: msg.info, screen: 'reveal' });
        break;
      case 'end':
        set({ endLeaderboard: msg.leaderboard, screen: 'end' });
        break;
    }
  }
});
