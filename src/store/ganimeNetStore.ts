import { create } from 'zustand';
import { NetClient, NetHost } from '../net/peer';
import type { LeaderRow } from '../net/quizProtocol';
import type {
  GAnimeClientMsg,
  GAnimeHostMsg,
  GAnimeOnlineScreen,
  GAnimePlayerInfo,
  GAnimeRevealInfo,
  GAnimeRoundRow,
} from '../net/ganimeProtocol';
import type { CharMatch, GAnimeItem, GAnimeMode } from '../types';
import { GA_DEFAULT_ROUNDS } from '../data/config';
import { getItems } from '../data/guessAnime';
import { gaPoints, pickItems } from '../ganime/ganimeLogic';
import { matchTitle } from '../char/matching';

const HOST_ID = 'host';

interface GAnimeNetState {
  active: boolean;
  isHost: boolean;
  connecting: boolean;
  error: string | null;
  roomCode: string;
  selfId: string;
  selfName: string;
  screen: GAnimeOnlineScreen;
  players: GAnimePlayerInfo[];

  mode: GAnimeMode;
  rounds: number;
  available: number;

  // current round view
  roundIndex: number;
  total: number;
  prompt: GAnimeItem | null;
  startedAt: number;
  myAnswered: boolean;
  myMatch: CharMatch | 'skip' | null;
  wrongNonce: number;

  reveal: GAnimeRevealInfo | null;
  endLeaderboard: LeaderRow[];

  enter: () => void;
  hostRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => void;
  leave: () => void;
  clearError: () => void;

  setMode: (m: GAnimeMode) => void;
  setRounds: (n: number) => void;
  hostStart: () => void;
  hostNext: () => void;

  submitGuess: (text: string) => void;
  skip: () => void;
}

let netHost: NetHost<GAnimeClientMsg, GAnimeHostMsg> | null = null;
let netClient: NetClient<GAnimeClientMsg, GAnimeHostMsg> | null = null;
let hostItems: GAnimeItem[] = [];
let roundStart = 0;
let doneSet = new Set<string>();
let roundRows = new Map<string, { name: string; match: CharMatch | 'skip'; points: number; seconds: number }>();

const FRESH = {
  players: [] as GAnimePlayerInfo[],
  available: 0,
  roundIndex: 0,
  total: 0,
  prompt: null as GAnimeItem | null,
  startedAt: 0,
  myAnswered: false,
  myMatch: null as CharMatch | 'skip' | null,
  wrongNonce: 0,
  reveal: null as GAnimeRevealInfo | null,
  endLeaderboard: [] as LeaderRow[],
};

export const useGAnimeNetStore = create<GAnimeNetState>((set, get) => {
  function patchPlayers(fn: (ps: GAnimePlayerInfo[]) => GAnimePlayerInfo[]) {
    set({ players: fn(get().players.slice()) });
  }
  function leaderboardFor(id: string): LeaderRow[] {
    return get()
      .players.map((p) => ({ name: p.name, score: p.score, isSelf: p.id === id }))
      .sort((a, b) => b.score - a.score);
  }
  function lobbyMsg(): GAnimeHostMsg {
    const s = get();
    return {
      t: 'lobby',
      snapshot: {
        roomCode: s.roomCode,
        players: s.players,
        screen: s.screen,
        mode: s.mode,
        rounds: s.rounds,
        available: getItems(s.mode).length,
      },
    };
  }
  function broadcastLobby() {
    if (get().isHost) netHost?.broadcast(lobbyMsg());
  }

  function hostStartRound(i: number) {
    const item = hostItems[i];
    roundStart = Date.now();
    doneSet = new Set();
    roundRows = new Map();
    set({
      screen: 'play',
      roundIndex: i,
      total: hostItems.length,
      prompt: { anime: '', answers: [], mode: item.mode, quote: item.quote, imageUrl: item.imageUrl },
      startedAt: roundStart,
      myAnswered: false,
      myMatch: null,
      reveal: null,
    });
    netHost?.broadcast({
      t: 'round',
      index: i,
      total: hostItems.length,
      mode: item.mode,
      quote: item.quote,
      imageUrl: item.imageUrl,
    });
  }

  function hostReveal() {
    const i = get().roundIndex;
    const item = hostItems[i];
    const rows: GAnimeRoundRow[] = get().players.map((p) => {
      const r = roundRows.get(p.id);
      return { name: p.name, match: r?.match ?? 'skip', points: r?.points ?? 0 };
    });
    for (const p of get().players) {
      const r = roundRows.get(p.id);
      const info: GAnimeRevealInfo = {
        index: i,
        total: hostItems.length,
        anime: item.anime,
        character: item.character,
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
    if (connected.length > 0 && connected.every((p) => doneSet.has(p.id))) hostReveal();
  }

  function hostJudge(id: string, text: string) {
    if (get().screen !== 'play' || doneSet.has(id)) return;
    const item = hostItems[get().roundIndex];
    const match = matchTitle(text, item.answers);
    if (match === 'no') {
      if (id === HOST_ID) set((s) => ({ wrongNonce: s.wrongNonce + 1 }));
      else netHost?.send(id, { t: 'judge', match: 'no', points: 0 });
      return;
    }
    const seconds = (Date.now() - roundStart) / 1000;
    const points = gaPoints(seconds);
    const name = get().players.find((p) => p.id === id)?.name ?? '?';
    doneSet.add(id);
    roundRows.set(id, { name, match, points, seconds });
    patchPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, score: p.score + points } : p)));
    if (id === HOST_ID) set({ myAnswered: true, myMatch: match });
    else netHost?.send(id, { t: 'judge', match, points });
    checkAllDone();
  }

  function hostSkip(id: string) {
    if (get().screen !== 'play' || doneSet.has(id)) return;
    const name = get().players.find((p) => p.id === id)?.name ?? '?';
    doneSet.add(id);
    roundRows.set(id, { name, match: 'skip', points: 0, seconds: (Date.now() - roundStart) / 1000 });
    if (id === HOST_ID) set({ myAnswered: true, myMatch: 'skip' });
    checkAllDone();
  }

  function onClientMessage(id: string, msg: GAnimeClientMsg) {
    switch (msg.t) {
      case 'join':
        patchPlayers((ps) => {
          const e = ps.find((p) => p.id === id);
          if (e) {
            e.name = msg.name;
            e.connected = true;
            return ps;
          }
          return [...ps, { id, name: msg.name, isHost: false, connected: true, score: 0 }];
        });
        broadcastLobby();
        break;
      case 'guess':
        hostJudge(id, msg.text);
        break;
      case 'skip':
        hostSkip(id);
        break;
    }
  }

  function onHostMessage(msg: GAnimeHostMsg) {
    switch (msg.t) {
      case 'lobby': {
        const pre = ['connect', 'lobby', 'end'];
        const cur = get().screen;
        set({
          players: msg.snapshot.players,
          roomCode: msg.snapshot.roomCode,
          mode: msg.snapshot.mode,
          rounds: msg.snapshot.rounds,
          available: msg.snapshot.available,
          screen: pre.includes(cur) ? msg.snapshot.screen : cur,
        });
        break;
      }
      case 'round':
        set({
          screen: 'play',
          roundIndex: msg.index,
          total: msg.total,
          prompt: { anime: '', answers: [], mode: msg.mode, quote: msg.quote, imageUrl: msg.imageUrl },
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
    mode: 'dialogue',
    rounds: GA_DEFAULT_ROUNDS,
    ...FRESH,

    enter: () => {
      hostItems = [];
      set({ active: true, screen: 'connect', error: null, connecting: false, ...FRESH });
    },

    hostRoom: async (name) => {
      set({ connecting: true, error: null });
      try {
        netHost = new NetHost<GAnimeClientMsg, GAnimeHostMsg>({
          onConnect: () => {},
          onMessage: (id, msg) => onClientMessage(id, msg),
          onDisconnect: (id) => {
            patchPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, connected: false } : p)));
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
        set({ connecting: false, error: e instanceof Error ? e.message : 'Could not create room.' });
      }
    },

    joinRoom: (code, name) => {
      set({ connecting: true, error: null, selfName: name });
      netClient = new NetClient<GAnimeClientMsg, GAnimeHostMsg>(code.trim().toUpperCase(), {
        onOpen: (selfId) => {
          set({ active: true, isHost: false, connecting: false, roomCode: code.trim().toUpperCase(), selfId });
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
      hostItems = [];
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

    setMode: (m) => {
      set({ mode: m, available: getItems(m).length });
      broadcastLobby();
    },
    setRounds: (n) => {
      set({ rounds: n });
      broadcastLobby();
    },

    hostStart: () => {
      const items = pickItems(getItems(get().mode), get().rounds);
      if (items.length === 0) {
        set({ error: 'This mode has no content yet.' });
        return;
      }
      hostItems = items;
      patchPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
      hostStartRound(0);
    },

    hostNext: () => {
      const next = get().roundIndex + 1;
      if (next < hostItems.length) hostStartRound(next);
      else {
        for (const p of get().players) {
          if (p.id === HOST_ID) set({ endLeaderboard: leaderboardFor(HOST_ID), screen: 'end' });
          else netHost?.send(p.id, { t: 'end', leaderboard: leaderboardFor(p.id) });
        }
      }
    },

    submitGuess: (text) => {
      const s = get();
      if (s.myAnswered || s.screen !== 'play') return;
      if (s.isHost) hostJudge(HOST_ID, text);
      else netClient?.send({ t: 'guess', text });
    },

    skip: () => {
      const s = get();
      if (s.myAnswered || s.screen !== 'play') return;
      if (s.isHost) hostSkip(HOST_ID);
      else {
        netClient?.send({ t: 'skip' });
        set({ myAnswered: true, myMatch: 'skip' });
      }
    },
  };
});
