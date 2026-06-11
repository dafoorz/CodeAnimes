import { create } from 'zustand';
import type { Character, GuessResult, Role, Team } from '../types';
import {
  applyGuess,
  createBoard,
  otherTeam,
  remainingForColor,
} from '../engine/gameLogic';
import {
  maskCardsFor,
  type ClientMessage,
  type GameView,
  type LobbySnapshot,
  type OnlineScreen,
  type PlayerSeat,
} from '../net/protocol';
import { NetClient, NetHost } from '../net/peer';

const HOST_ID = 'host';

/** Authoritative game state, owned only by the host. */
interface HostGame {
  cards: ReturnType<typeof createBoard>['cards'];
  firstTeam: Team;
  currentTeam: Team;
  clue: string;
  clueNumber: number;
  guessesLeft: number;
  winner: Team | null;
  lastResult: GuessResult | null;
}

interface MultiplayerState {
  active: boolean;
  isHost: boolean;
  connecting: boolean;
  error: string | null;

  roomCode: string;
  selfId: string;
  selfName: string;
  screen: OnlineScreen;

  // Shared lobby info (mirrored on every peer)
  players: PlayerSeat[];
  poolReady: boolean;
  poolSize: number;
  selectedCount: number;

  // This peer's current game view + seat (driven by host messages)
  view: GameView | null;
  you: { team: Team | null; role: Role | null };

  // Host-only authoritative state (undefined on clients)
  pool: Character[];
  host: HostGame | null;

  // Lifecycle
  hostRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => void;
  leave: () => void;
  clearError: () => void;

  // Seat / setup
  setSeat: (team: Team | null, role: Role | null) => void;
  hostSetPool: (pool: Character[], selectedCount: number) => void;
  hostStartGame: () => void;

  // Play (dispatch — works for host and client)
  submitClue: (word: string, count: number) => void;
  revealCard: (index: number) => void;
  endTurn: () => void;
  playAgain: () => void;
}

// Network handles live outside React state (non-serializable, non-reactive).
let netHost: NetHost | null = null;
let netClient: NetClient | null = null;

export const useMultiplayerStore = create<MultiplayerState>((set, get) => {
  // --- Host helpers ---------------------------------------------------------

  function buildView(role: Role | null, revealAll: boolean): GameView {
    const h = get().host!;
    return {
      cards: maskCardsFor(h.cards, role, revealAll),
      currentTeam: h.currentTeam,
      firstTeam: h.firstTeam,
      clue: h.clue,
      clueNumber: h.clueNumber,
      guessesLeft: h.guessesLeft,
      winner: h.winner,
      lastResult: h.lastResult,
      scores: {
        red: remainingForColor(h.cards, 'red'),
        blue: remainingForColor(h.cards, 'blue'),
      },
    };
  }

  function lobbySnapshot(): LobbySnapshot {
    const s = get();
    return {
      roomCode: s.roomCode,
      players: s.players,
      screen: s.screen,
      poolReady: s.poolReady,
      poolSize: s.poolSize,
      selectedCount: s.selectedCount,
    };
  }

  /** Push current authoritative state to every peer (and update host's own UI). */
  function distribute(): void {
    const s = get();
    if (!s.isHost) return;

    if (s.screen === 'lobby' || s.screen === 'connect') {
      const snap = lobbySnapshot();
      netHost?.broadcast({ t: 'lobby', snapshot: snap });
      return;
    }

    // game / end: per-recipient masked view
    const revealAll = s.screen === 'end';
    for (const p of s.players) {
      const view = buildView(p.role, revealAll);
      if (p.id === HOST_ID) {
        set({ view, you: { team: p.team, role: p.role }, screen: s.screen });
      } else {
        netHost?.send(p.id, {
          t: 'game',
          screen: s.screen,
          view,
          you: { team: p.team, role: p.role },
        });
      }
    }
  }

  function updatePlayers(
    mutate: (players: PlayerSeat[]) => PlayerSeat[]
  ): void {
    set({ players: mutate(get().players.slice()) });
  }

  function updateHost(partial: Partial<HostGame>): void {
    set({ host: { ...get().host!, ...partial } });
  }

  /** Apply a validated guess to the authoritative board. */
  function hostApplyGuess(index: number): void {
    const h = get().host;
    if (!h) return;
    const card = h.cards[index];
    if (h.winner || !card || card.isRevealed || h.guessesLeft <= 0) return;

    const outcome = applyGuess(h.cards, index, h.currentTeam);
    if (outcome.winner) {
      updateHost({
        cards: outcome.cards,
        lastResult: outcome.result,
        winner: outcome.winner,
        guessesLeft: 0,
      });
      set({ screen: 'end' });
    } else if (outcome.turnEnds) {
      updateHost({
        cards: outcome.cards,
        lastResult: outcome.result,
        currentTeam: otherTeam(h.currentTeam),
        clue: '',
        clueNumber: 0,
        guessesLeft: 0,
      });
    } else {
      const remaining = h.guessesLeft - 1;
      updateHost(
        remaining <= 0
          ? {
              cards: outcome.cards,
              lastResult: outcome.result,
              currentTeam: otherTeam(h.currentTeam),
              clue: '',
              clueNumber: 0,
              guessesLeft: 0,
            }
          : {
              cards: outcome.cards,
              lastResult: outcome.result,
              guessesLeft: remaining,
            }
      );
    }
    distribute();
  }

  function hostEndTurn(): void {
    const h = get().host;
    if (!h || h.winner) return;
    updateHost({
      currentTeam: otherTeam(h.currentTeam),
      clue: '',
      clueNumber: 0,
      guessesLeft: 0,
      lastResult: null,
    });
    distribute();
  }

  function hostSubmitClue(team: Team, word: string, count: number): void {
    const h = get().host;
    const clue = word.trim();
    if (!h || h.winner || h.guessesLeft > 0 || team !== h.currentTeam || !clue)
      return;
    updateHost({ clue, clueNumber: count, guessesLeft: count + 1, lastResult: null });
    distribute();
  }

  /** Handle an intent message arriving from a client `id`. */
  function onClientMessage(id: string, msg: ClientMessage): void {
    const players = get().players;
    const player = players.find((p) => p.id === id);

    switch (msg.t) {
      case 'join':
        updatePlayers((ps) => {
          const existing = ps.find((p) => p.id === id);
          if (existing) {
            existing.name = msg.name;
            existing.connected = true;
            return ps;
          }
          return [
            ...ps,
            {
              id,
              name: msg.name,
              team: null,
              role: null,
              isHost: false,
              connected: true,
            },
          ];
        });
        distribute();
        break;

      case 'seat':
        updatePlayers((ps) => {
          const p = ps.find((x) => x.id === id);
          if (p) {
            p.team = msg.team;
            p.role = msg.role;
          }
          return ps;
        });
        distribute();
        break;

      case 'clue':
        if (player?.team) hostSubmitClue(player.team, msg.word, msg.count);
        break;

      case 'guess':
        if (
          player?.role === 'operative' &&
          player.team === get().host?.currentTeam
        ) {
          hostApplyGuess(msg.index);
        }
        break;

      case 'endTurn':
        if (
          player?.role === 'operative' &&
          player.team === get().host?.currentTeam
        ) {
          hostEndTurn();
        }
        break;

      case 'playAgain':
        // Only meaningful from host UI; clients just wait for the lobby push.
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
    players: [],
    poolReady: false,
    poolSize: 0,
    selectedCount: 0,
    view: null,
    you: { team: null, role: null },
    pool: [],
    host: null,

    hostRoom: async (name) => {
      set({ connecting: true, error: null });
      try {
        netHost = new NetHost({
          onConnect: () => {
            // Wait for the client's `join` before listing them.
          },
          onMessage: (id, msg) => onClientMessage(id, msg),
          onDisconnect: (id) => {
            updatePlayers((ps) =>
              ps.map((p) => (p.id === id ? { ...p, connected: false } : p))
            );
            distribute();
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
            {
              id: HOST_ID,
              name,
              team: null,
              role: null,
              isHost: true,
              connected: true,
            },
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
      netClient = new NetClient(code.trim().toUpperCase(), {
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
        onMessage: (msg) => {
          if (msg.t === 'lobby') {
            const { snapshot } = msg;
            set({
              players: snapshot.players,
              screen: snapshot.screen,
              roomCode: snapshot.roomCode,
              poolReady: snapshot.poolReady,
              poolSize: snapshot.poolSize,
              selectedCount: snapshot.selectedCount,
            });
          } else if (msg.t === 'game') {
            set({ view: msg.view, you: msg.you, screen: msg.screen });
          } else if (msg.t === 'kick') {
            set({ error: msg.reason });
            get().leave();
          }
        },
        onClose: () =>
          set({ error: 'Disconnected from the host.', connecting: false }),
        onError: (message) => set({ error: message, connecting: false }),
      });
    },

    leave: () => {
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
        players: [],
        poolReady: false,
        poolSize: 0,
        selectedCount: 0,
        view: null,
        you: { team: null, role: null },
        pool: [],
        host: null,
      });
    },

    clearError: () => set({ error: null }),

    setSeat: (team, role) => {
      if (get().isHost) {
        updatePlayers((ps) =>
          ps.map((p) => (p.id === HOST_ID ? { ...p, team, role } : p))
        );
        set({ you: { team, role } });
        distribute();
      } else {
        set({ you: { team, role } });
        netClient?.send({ t: 'seat', team, role });
      }
    },

    hostSetPool: (pool, selectedCount) => {
      set({
        pool,
        poolReady: pool.length > 0,
        poolSize: pool.length,
        selectedCount,
      });
      distribute();
    },

    hostStartGame: () => {
      const { pool } = get();
      const { cards, firstTeam } = createBoard(pool);
      set({
        host: {
          cards,
          firstTeam,
          currentTeam: firstTeam,
          clue: '',
          clueNumber: 0,
          guessesLeft: 0,
          winner: null,
          lastResult: null,
        },
        screen: 'game',
      });
      distribute();
    },

    submitClue: (word, count) => {
      const s = get();
      if (s.isHost) hostSubmitClue(s.you.team!, word, count);
      else netClient?.send({ t: 'clue', word, count });
    },

    revealCard: (index) => {
      const s = get();
      if (s.isHost) hostApplyGuess(index);
      else netClient?.send({ t: 'guess', index });
    },

    endTurn: () => {
      const s = get();
      if (s.isHost) hostEndTurn();
      else netClient?.send({ t: 'endTurn' });
    },

    playAgain: () => {
      const s = get();
      if (s.isHost) {
        set({ host: null, view: null, screen: 'lobby' });
        distribute();
      } else {
        netClient?.send({ t: 'playAgain' });
      }
    },
  };
});
