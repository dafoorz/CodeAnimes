import { create } from 'zustand';
import type { CharMatch, GAnimeItem, GAnimeMode, GAnimeResult } from '../types';
import { GA_DEFAULT_ROUNDS } from '../data/config';
import { gaPoints } from '../ganime/ganimeLogic';
import { buildItems } from '../ganime/ganimeSource';
import { matchTitle } from '../char/matching';

type Screen = 'setup' | 'loading' | 'play' | 'end';
type Status = 'guessing' | 'revealed';

interface GAnimeState {
  screen: Screen;
  mode: GAnimeMode;
  rounds: number;
  loadingMessage: string;
  error: string | null;

  items: GAnimeItem[];
  index: number;
  status: Status;
  startedAt: number;

  lastMatch: CharMatch | 'skip';
  lastPoints: number;
  totalScore: number;
  results: GAnimeResult[];

  setMode: (m: GAnimeMode) => void;
  setRounds: (n: number) => void;
  goSetup: () => void;
  startSolo: () => Promise<void>;
  submitGuess: (text: string) => CharMatch;
  skip: () => void;
  nextRound: () => void;
  reset: () => void;
}

const FRESH = {
  items: [] as GAnimeItem[],
  index: 0,
  status: 'guessing' as Status,
  startedAt: 0,
  lastMatch: 'no' as CharMatch | 'skip',
  lastPoints: 0,
  totalScore: 0,
  results: [] as GAnimeResult[],
};

export const useGAnimeStore = create<GAnimeState>((set, get) => {
  function reveal(match: CharMatch | 'skip', points: number) {
    const s = get();
    const item = s.items[s.index];
    const seconds = (Date.now() - s.startedAt) / 1000;
    set({
      status: 'revealed',
      lastMatch: match,
      lastPoints: points,
      totalScore: s.totalScore + points,
      results: [...s.results, { anime: item.anime, match, points, seconds }],
    });
  }

  return {
    screen: 'setup',
    mode: 'dialogue',
    rounds: GA_DEFAULT_ROUNDS,
    loadingMessage: '',
    error: null,
    ...FRESH,

    setMode: (m) => set({ mode: m }),
    setRounds: (n) => set({ rounds: n }),
    goSetup: () => set({ screen: 'setup', error: null }),

    startSolo: async () => {
      const { mode, rounds } = get();
      set({ ...FRESH, screen: 'loading', error: null, loadingMessage: 'Gathering rounds…' });
      let items: GAnimeItem[] = [];
      try {
        items = await buildItems(mode, rounds, (done, total) =>
          set({ loadingMessage: `Loading images… (${done}/${total})` })
        );
      } catch {
        items = [];
      }
      if (items.length === 0) {
        set({
          screen: 'setup',
          error: 'Could not reach MyAnimeList for images. Check your connection and try again.',
        });
        return;
      }
      set({ items, index: 0, status: 'guessing', screen: 'play', startedAt: Date.now() });
    },

    submitGuess: (text) => {
      const s = get();
      if (s.status !== 'guessing') return 'no';
      const item = s.items[s.index];
      const match = matchTitle(text, item.answers);
      if (match === 'no') return 'no';
      const seconds = (Date.now() - s.startedAt) / 1000;
      reveal(match, gaPoints(seconds));
      return match;
    },

    skip: () => {
      if (get().status === 'guessing') reveal('skip', 0);
    },

    nextRound: () => {
      const s = get();
      const next = s.index + 1;
      if (next >= s.items.length) set({ screen: 'end' });
      else set({ index: next, status: 'guessing', startedAt: Date.now(), lastMatch: 'no', lastPoints: 0 });
    },

    reset: () => set({ screen: 'setup', error: null, ...FRESH }),
  };
});
