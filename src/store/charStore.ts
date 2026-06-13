import { create } from 'zustand';
import type { CharChallenge, CharMatch, CharResult, Character } from '../types';
import {
  CHAR_CAP_PER_ANIME,
  CHAR_DEFAULT_ROUNDS,
  CHAR_STEPS,
} from '../data/config';
import {
  buildCharPool,
  pickRoundCharacters,
  randomCrop,
  roundPoints,
} from '../char/charLogic';
import { matchName } from '../char/matching';

type Screen = 'setup' | 'select' | 'play' | 'end';
type Status = 'guessing' | 'revealed';

interface CharState {
  screen: Screen;
  challenge: CharChallenge;
  rounds: number;

  characters: Character[];
  index: number;
  level: number;
  crop: { x: number; y: number };
  status: Status;
  startedAt: number;

  lastMatch: CharMatch | 'skip';
  lastPoints: number;
  totalScore: number;
  results: CharResult[];

  setChallenge: (c: CharChallenge) => void;
  setRounds: (n: number) => void;
  goSelect: () => void;
  goSetup: () => void;
  startSolo: (pool: Character[]) => void;
  /** Returns the match outcome ('no' = wrong, stays in round). */
  submitGuess: (text: string) => CharMatch;
  /** "I don't know" — zoom/unblur a step, or skip for eyes/silhouette. */
  idk: () => void;
  nextRound: () => void;
  reset: () => void;
}

const FRESH = {
  characters: [] as Character[],
  index: 0,
  level: 0,
  crop: { x: 50, y: 50 },
  status: 'guessing' as Status,
  startedAt: 0,
  lastMatch: 'no' as CharMatch | 'skip',
  lastPoints: 0,
  totalScore: 0,
  results: [] as CharResult[],
};

export const useCharStore = create<CharState>((set, get) => {
  function beginRound(index: number) {
    set({
      index,
      level: 0,
      crop: randomCrop(),
      status: 'guessing',
      startedAt: Date.now(),
      lastMatch: 'no',
      lastPoints: 0,
    });
  }

  function reveal(match: CharMatch | 'skip', points: number) {
    const s = get();
    const c = s.characters[s.index];
    const seconds = (Date.now() - s.startedAt) / 1000;
    const result: CharResult = {
      name: c.name,
      imageUrl: c.imageUrl,
      anime: c.anime,
      match,
      points,
      seconds,
    };
    set({
      status: 'revealed',
      lastMatch: match,
      lastPoints: points,
      totalScore: s.totalScore + points,
      results: [...s.results, result],
    });
  }

  return {
    screen: 'setup',
    challenge: 'eyes',
    rounds: CHAR_DEFAULT_ROUNDS,
    ...FRESH,

    setChallenge: (c) => set({ challenge: c }),
    setRounds: (n) => set({ rounds: n }),
    goSelect: () => set({ screen: 'select' }),
    goSetup: () => set({ screen: 'setup' }),

    startSolo: (pool) => {
      const charPool = buildCharPool(pool, CHAR_CAP_PER_ANIME);
      const characters = pickRoundCharacters(charPool, get().rounds);
      set({ ...FRESH, characters, screen: 'play' });
      beginRound(0);
    },

    submitGuess: (text) => {
      const s = get();
      if (s.status !== 'guessing') return 'no';
      const c = s.characters[s.index];
      const match = matchName(text, c.name);
      if (match === 'no') return 'no';
      const seconds = (Date.now() - s.startedAt) / 1000;
      reveal(match, roundPoints(s.challenge, s.level, seconds));
      return match;
    },

    idk: () => {
      const s = get();
      if (s.status !== 'guessing') return;
      const stepped = s.challenge === 'zoom' || s.challenge === 'blur';
      if (stepped && s.level < CHAR_STEPS - 1) {
        set({ level: s.level + 1 });
      } else {
        reveal('skip', 0);
      }
    },

    nextRound: () => {
      const s = get();
      const next = s.index + 1;
      if (next >= s.characters.length) set({ screen: 'end' });
      else beginRound(next);
    },

    reset: () => set({ screen: 'setup', ...FRESH }),
  };
});
