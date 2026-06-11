import { create } from 'zustand';
import type { AnimeOption, Character } from '../types';
import { fetchCharacters } from '../api/jikan';
import { MAX_ANIMES } from '../data/config';

interface AnimeState {
  /** Animes currently selected to source characters from. */
  selected: AnimeOption[];
  /** Flattened pool of characters fetched from all selected animes. */
  pool: Character[];
  /** True while characters are being fetched for the board. */
  loading: boolean;
  /** Progress string shown under the loading spinner. */
  loadingMessage: string;
  /** Error message if fetching failed, else null. */
  error: string | null;

  isSelected: (malId: number) => boolean;
  selectAnime: (anime: AnimeOption) => void;
  removeAnime: (malId: number) => void;
  toggleAnime: (anime: AnimeOption) => void;
  setSelection: (animes: AnimeOption[]) => void;
  /** Fetch characters for all selected animes into `pool`. Resolves true on success. */
  fetchCharacters: () => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useAnimeStore = create<AnimeState>((set, get) => ({
  selected: [],
  pool: [],
  loading: false,
  loadingMessage: '',
  error: null,

  isSelected: (malId) => get().selected.some((a) => a.malId === malId),

  selectAnime: (anime) =>
    set((state) => {
      if (
        state.selected.some((a) => a.malId === anime.malId) ||
        state.selected.length >= MAX_ANIMES
      ) {
        return state;
      }
      return { selected: [...state.selected, anime] };
    }),

  removeAnime: (malId) =>
    set((state) => ({
      selected: state.selected.filter((a) => a.malId !== malId),
    })),

  toggleAnime: (anime) => {
    const { isSelected, removeAnime, selectAnime } = get();
    if (isSelected(anime.malId)) removeAnime(anime.malId);
    else selectAnime(anime);
  },

  setSelection: (animes) =>
    set({ selected: animes.slice(0, MAX_ANIMES) }),

  fetchCharacters: async () => {
    const { selected } = get();
    set({ loading: true, error: null, loadingMessage: 'Summoning characters...' });

    try {
      const pool: Character[] = [];
      const updatedSelected = [...selected];

      for (let i = 0; i < selected.length; i++) {
        const anime = selected[i];
        set({
          loadingMessage: `Summoning characters from ${anime.title}... (${i + 1}/${selected.length})`,
        });
        const chars = await fetchCharacters(anime.malId, anime.title);
        pool.push(...chars);
        updatedSelected[i] = { ...anime, characterCount: chars.length };
      }

      set({ pool, selected: updatedSelected, loading: false });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reach the Jikan API.';
      set({
        loading: false,
        error: `Could not summon characters. ${message}`,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({ selected: [], pool: [], loading: false, loadingMessage: '', error: null }),
}));
