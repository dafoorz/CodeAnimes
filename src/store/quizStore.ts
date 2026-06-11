import { create } from 'zustand';
import type {
  QuizAnswerMethod,
  QuizResult,
  QuizSong,
} from '../types';
import { OPENING_QUIZ } from '../data/openingQuiz';
import { fetchOpening } from '../api/animethemes';
import { QUIZ_DEFAULT_SONGS } from '../data/config';
import {
  isCorrectGuess,
  makeChoices,
  orderByDifficulty,
  scoreChoice,
  scoreTyped,
} from '../quiz/quizLogic';

/** Per-song phase: typing, picking from choices, or showing the answer. */
export type SongStatus = 'guessing' | 'choices' | 'revealed';

interface QuizState {
  screen: 'setup' | 'loading' | 'play' | 'end';
  numSongs: number;
  loadingMessage: string;
  error: string | null;

  songs: QuizSong[];
  index: number;
  songStatus: SongStatus;

  // Feedback for the just-revealed song
  lastCorrect: boolean;
  lastMethod: QuizAnswerMethod;
  lastPoints: number;

  totalScore: number;
  results: QuizResult[];

  setNumSongs: (n: number) => void;
  startQuiz: () => Promise<void>;
  /** Returns true if the typed guess was correct. */
  submitGuess: (text: string, secondsLeft: number) => boolean;
  clipEnded: () => void;
  chooseOption: (option: string) => void;
  giveUp: () => void;
  nextSong: () => void;
  reset: () => void;
}

const FRESH = {
  songs: [] as QuizSong[],
  index: 0,
  songStatus: 'guessing' as SongStatus,
  lastCorrect: false,
  lastMethod: 'none' as QuizAnswerMethod,
  lastPoints: 0,
  totalScore: 0,
  results: [] as QuizResult[],
  error: null as string | null,
  loadingMessage: '',
};

export const useQuizStore = create<QuizState>((set, get) => {
  /** Record the outcome of the current song and flip to the revealed state. */
  function reveal(method: QuizAnswerMethod, correct: boolean, points: number) {
    const s = get();
    const song = s.songs[s.index];
    const result: QuizResult = {
      display: song.display,
      songTitle: song.songTitle,
      difficulty: song.difficulty,
      correct,
      method,
      points,
    };
    set({
      songStatus: 'revealed',
      lastCorrect: correct,
      lastMethod: method,
      lastPoints: points,
      totalScore: s.totalScore + points,
      results: [...s.results, result],
    });
  }

  return {
    screen: 'setup',
    numSongs: QUIZ_DEFAULT_SONGS,
    ...FRESH,

    setNumSongs: (n) => set({ numSongs: n }),

    startQuiz: async () => {
      const { numSongs } = get();
      set({ ...FRESH, screen: 'loading', loadingMessage: 'Tuning in…' });

      const ordered = orderByDifficulty(OPENING_QUIZ);
      const songs: QuizSong[] = [];
      for (const entry of ordered) {
        if (songs.length >= numSongs) break;
        set({
          loadingMessage: `Loading openings… (${songs.length}/${numSongs})`,
        });
        const meta = await fetchOpening(entry.query);
        if (meta) {
          songs.push({
            display: entry.display,
            answers: entry.answers,
            difficulty: entry.difficulty,
            videoUrl: meta.videoUrl,
            songTitle: meta.songTitle,
            choices: makeChoices(entry.display, OPENING_QUIZ),
          });
        }
      }

      if (songs.length === 0) {
        set({
          screen: 'setup',
          error:
            'Could not load any openings (AnimeThemes may be unreachable). Please try again.',
        });
        return;
      }

      set({ songs, index: 0, songStatus: 'guessing', screen: 'play' });
    },

    submitGuess: (text, secondsLeft) => {
      const s = get();
      if (s.songStatus !== 'guessing') return false;
      const song = s.songs[s.index];
      if (!isCorrectGuess(text, song.answers)) return false;
      reveal('typed', true, scoreTyped(secondsLeft, song.difficulty));
      return true;
    },

    clipEnded: () => {
      if (get().songStatus === 'guessing') set({ songStatus: 'choices' });
    },

    chooseOption: (option) => {
      const s = get();
      if (s.songStatus !== 'choices') return;
      const song = s.songs[s.index];
      const correct = option === song.display;
      reveal('choice', correct, correct ? scoreChoice(song.difficulty) : 0);
    },

    giveUp: () => {
      const s = get();
      if (s.songStatus === 'revealed') return;
      reveal('none', false, 0);
    },

    nextSong: () => {
      const s = get();
      const next = s.index + 1;
      if (next >= s.songs.length) {
        set({ screen: 'end' });
      } else {
        set({
          index: next,
          songStatus: 'guessing',
          lastCorrect: false,
          lastMethod: 'none',
          lastPoints: 0,
        });
      }
    },

    reset: () => set({ screen: 'setup', ...FRESH }),
  };
});
