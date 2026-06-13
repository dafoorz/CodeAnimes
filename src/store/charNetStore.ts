import { create } from 'zustand';
import { NetClient, NetHost } from '../net/peer';
import type { LeaderRow } from '../net/quizProtocol';
import type {
  CharClientMsg,
  CharHostMsg,
  CharOnlineScreen,
  CharPlayerInfo,
  CharRevealInfo,
  CharRoundRow,
} from '../net/charProtocol';
import type { CharChallenge, CharMatch, Character } from '../types';
import { CHAR_CAP_PER_ANIME, CHAR_DEFAULT_ROUNDS, CHAR_STEPS } from '../data/config';
import {
  buildCharPool,
  pickRoundCharacters,
  randomCrop,
  roundPoints,
} from '../char/charLogic';
import { matchName } from '../char/matching';

const HOST_ID = 'host';

interface CharNetState {
  active: boolean;
  isHost: boolean;
  connecting: boolean;
  error: string | null;

  roomCode: string;
  selfId: string;
  selfName: string;
  screen: CharOnlineScreen;
  players: CharPlayerInfo[];

  // Host settings (mirrored to clients)
  challenge: CharChallenge;
  rounds: number;
  poolReady: boolean;
  poolSize: number;

  // Current round view (this peer)
  roundIndex: number;
  total: number;
  imageUrl: string;
  crop: { x: number; y: number };
  level: number;
  startedAt: number;
  myAnswered: boolean;
  myMatch: CharMatch | 'skip' | null;
  wrongNonce: number;

  reveal: CharRevealInfo | null;
  endLeaderboard: LeaderRow[];

  // Lifecycle
  enter: () => void;
  hostRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => void;
  leave: () => void;
  clearError: () => void;

  // Host setup
  setChallenge: (c: CharChallenge) => void;
  setRounds: (n: number) => void;
  hostSetPool: (pool: Character[]) => void;
  hostStart: () => void;
  hostNext: () => void;

  // Play
  submitGuess: (text: string) => void;
  idk: () => void;
}

let netHost: NetHost<CharClientMsg, CharHostMsg> | null = null;
let netClient: NetClient<CharClientMsg, CharHostMsg> | null = null;
let hostChars: Character[] = [];
let charPool: Character[] = [];
let roundStart = 0;
let doneSet = new Set<string>();
let roundRows = new Map<string, { name: string; match: CharMatch | 'skip'; points: number; seconds: number }>();

const FRESH = {
  players: [] as CharPlayerInfo[],
  poolReady: false,
  poolSize: 0,
  roundIndex: 0,
  total: 0,
  imageUrl: '',
  crop: { x: 50, y: 50 },
  level: 0,
  startedAt: 0,
  myAnswered: false,
  myMatch: null as CharMatch | 'skip' | null,
  wrongNonce: 0,
  reveal: null as CharRevealInfo | null,
  endLeaderboard: [] as LeaderRow[],
};

export const useCharNetStore = create<CharNetState>((set, get) => {
  function patchPlayers(fn: (ps: CharPlayerInfo[]) => CharPlayerInfo[]) {
    set({ players: fn(get().players.slice()) });
  }

  function leaderboardFor(id: string): LeaderRow[] {
    return get()
      .players.map((p) => ({ name: p.name, score: p.score, isSelf: p.id === id }))
      .sort((a, b) => b.score - a.score);
  }

  function lobbyMsg(): CharHostMsg {
    const s = get();
    return {
      t: 'lobby',
      snapshot: {
        roomCode: s.roomCode,
        players: s.players,
        screen: s.screen,
        challenge: s.challenge,
        rounds: s.rounds,
        poolReady: s.poolReady,
        poolSize: s.poolSize,
      },
    };
  }

  function broadcastLobby() {
    if (get().isHost) netHost?.broadcast(lobbyMsg());
  }

  function hostStartRound(i: number) {
    const char = hostChars[i];
    roundStart = Date.now();
    doneSet = new Set();
    roundRows = new Map();
    const crop = randomCrop();
    set({
      screen: 'play',
      roundIndex: i,
      total: hostChars.length,
      imageUrl: char.imageUrl,
      crop,
      level: 0,
      startedAt: roundStart,
      myAnswered: false,
      myMatch: null,
      reveal: null,
    });
    netHost?.broadcast({
      t: 'round',
      index: i,
      total: hostChars.length,
      challenge: get().challenge,
      imageUrl: char.imageUrl,
      crop,
    });
  }

  function hostReveal() {
    const i = get().roundIndex;
    const char = hostChars[i];
    const rows: CharRoundRow[] = get().players.map((p) => {
      const r = roundRows.get(p.id);
      return { name: p.name, match: r?.match ?? 'skip', points: r?.points ?? 0 };
    });
    for (const p of get().players) {
      const r = roundRows.get(p.id);
      const info: CharRevealInfo = {
        index: i,
        total: hostChars.length,
        correctName: char.name,
        correctImage: char.imageUrl,
        anime: char.anime,
        youMatch: r?.match ?? 'skip',
        youPoints: r?.points ?? 0,
        youSeconds: r?.seconds ?? 0,
        rows,
        leaderboard: leaderboardFor(p.id),
      };
      if (p.id === HOST_ID) set({ reveal: info, screen: 'reveal' });
      else netHost?.send(p.id, { t: 'reveal', info });
    }
  }

  function checkAllDone() {
    const connected = get().players.filter((p) => p.connected);
    if (connected.length > 0 && connected.every((p) => doneSet.has(p.id))) {
      hostReveal();
    }
  }

  function hostJudge(id: string, text: string, level: number) {
    if (get().screen !== 'play' || doneSet.has(id)) return;
    const char = hostChars[get().roundIndex];
    const match = matchName(text, char.name);
    if (match === 'no') {
      if (id === HOST_ID) set((s) => ({ wrongNonce: s.wrongNonce + 1 }));
      else netHost?.send(id, { t: 'judge', match: 'no', points: 0 });
      return;
    }
    const seconds = (Date.now() - roundStart) / 1000;
    const points = roundPoints(get().challenge, level, seconds);
    const playerName = get().players.find((p) => p.id === id)?.name ?? '?';
    doneSet.add(id);
    roundRows.set(id, { name: playerName, match, points, seconds });
    patchPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, score: p.score + points } : p)));
    if (id === HOST_ID) set({ myAnswered: true, myMatch: match });
    else netHost?.send(id, { t: 'judge', match, points });
    checkAllDone();
  }

  function hostSkip(id: string) {
    if (get().screen !== 'play' || doneSet.has(id)) return;
    const playerName = get().players.find((p) => p.id === id)?.name ?? '?';
    const seconds = (Date.now() - roundStart) / 1000;
    doneSet.add(id);
    roundRows.set(id, { name: playerName, match: 'skip', points: 0, seconds });
    if (id === HOST_ID) set({ myAnswered: true, myMatch: 'skip' });
    checkAllDone();
  }

  function onClientMessage(id: string, msg: CharClientMsg) {
    switch (msg.t) {
      case 'join':
        patchPlayers((ps) => {
          const existing = ps.find((p) => p.id === id);
          if (existing) {
            existing.name = msg.name;
            existing.connected = true;
            return ps;
          }
          return [...ps, { id, name: msg.name, isHost: false, connected: true, score: 0 }];
        });
        broadcastLobby();
        break;
      case 'guess':
        hostJudge(id, msg.text, msg.level);
        break;
      case 'skip':
        hostSkip(id);
        break;
    }
  }

  function onHostMessage(msg: CharHostMsg) {
    switch (msg.t) {
      case 'lobby': {
        const pre = ['connect', 'lobby', 'end'];
        const cur = get().screen;
        set({
          players: msg.snapshot.players,
          roomCode: msg.snapshot.roomCode,
          challenge: msg.snapshot.challenge,
          rounds: msg.snapshot.rounds,
          poolReady: msg.snapshot.poolReady,
          poolSize: msg.snapshot.poolSize,
          screen: pre.includes(cur) ? msg.snapshot.screen : cur,
        });
        break;
      }
      case 'round':
        set({
          screen: 'play',
          roundIndex: msg.index,
          total: msg.total,
          challenge: msg.challenge,
          imageUrl: msg.imageUrl,
          crop: msg.crop,
          level: 0,
          startedAt: Date.now(),
          myAnswered: false,
          myMatch: null,
          reveal: null,
        });
        break;
      case 'judge':
        if (msg.match === 'no') set((s) => ({ wrongNonce: s.wrongNonce + 1 }));
        else set({ myAnswered: true, myMatch: msg.match });
        break;
      case 'reveal':
        set({ reveal: msg.info, screen: 'reveal' });
        break;
      case 'end':
        set({ endLeaderboard: msg.leaderboard, screen: 'end' });
        break;
    }
  }

  return {
    active: false,
    isHost: false,
    connecting: false,
    error: null,
    roomCode: '',
    selfId: '',
    selfName: '',
    screen: 'connect',
    challenge: 'eyes',
    rounds: CHAR_DEFAULT_ROUNDS,
    ...FRESH,

    enter: () => {
      hostChars = [];
      charPool = [];
      set({ active: true, screen: 'connect', error: null, connecting: false, ...FRESH });
    },

    hostRoom: async (name) => {
      set({ connecting: true, error: null });
      try {
        netHost = new NetHost<CharClientMsg, CharHostMsg>({
          onConnect: () => {},
          onMessage: (id, msg) => onClientMessage(id, msg),
          onDisconnect: (id) => {
            patchPlayers((ps) =>
              ps.map((p) => (p.id === id ? { ...p, connected: false } : p))
            );
            broadcastLobby();
            if (get().screen === 'play') checkAllDone();
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
          players: [{ id: HOST_ID, name, isHost: true, connected: true, score: 0 }],
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
      netClient = new NetClient<CharClientMsg, CharHostMsg>(code.trim().toUpperCase(), {
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
      netHost?.destroy();
      netClient?.destroy();
      netHost = null;
      netClient = null;
      hostChars = [];
      charPool = [];
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

    setChallenge: (c) => {
      set({ challenge: c });
      broadcastLobby();
    },
    setRounds: (n) => {
      set({ rounds: n });
      broadcastLobby();
    },

    hostSetPool: (pool) => {
      charPool = buildCharPool(pool, CHAR_CAP_PER_ANIME);
      set({ poolReady: charPool.length > 0, poolSize: charPool.length });
      broadcastLobby();
    },

    hostStart: () => {
      const chars = pickRoundCharacters(charPool, get().rounds);
      if (chars.length === 0) {
        set({ error: 'No characters available. Pick animes first.' });
        return;
      }
      hostChars = chars;
      patchPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
      hostStartRound(0);
    },

    hostNext: () => {
      const next = get().roundIndex + 1;
      if (next < hostChars.length) {
        hostStartRound(next);
      } else {
        for (const p of get().players) {
          if (p.id === HOST_ID) set({ endLeaderboard: leaderboardFor(HOST_ID), screen: 'end' });
          else netHost?.send(p.id, { t: 'end', leaderboard: leaderboardFor(p.id) });
        }
      }
    },

    submitGuess: (text) => {
      const s = get();
      if (s.myAnswered || s.screen !== 'play') return;
      if (s.isHost) hostJudge(HOST_ID, text, s.level);
      else netClient?.send({ t: 'guess', text, level: s.level });
    },

    idk: () => {
      const s = get();
      if (s.myAnswered || s.screen !== 'play') return;
      const stepped = s.challenge === 'zoom' || s.challenge === 'blur';
      if (stepped && s.level < CHAR_STEPS - 1) {
        set({ level: s.level + 1 });
        return;
      }
      // Give up / skip.
      if (s.isHost) hostSkip(HOST_ID);
      else {
        netClient?.send({ t: 'skip' });
        set({ myAnswered: true, myMatch: 'skip' });
      }
    },
  };
});
