import { create } from 'zustand';
import type { AnimeOption, Character } from '../types';
import { fetchCharacters, type RankedCharacters } from '../api/jikan';
import { BOARD_SIZE, CHARACTER_FLOOR, MAX_ANIMES } from '../data/config';
import { decideContributions, type RankedCount } from '../game/selection';

interface AnimeState {
  /** Animes currently selected to source characters from. */
  selected: AnimeOption[];
  /** Flattened pool of characters fetched from all selected animes. */
  pool: Character[];
  /** Exact ranked counts per selected anime (malId -> counts), filled lazily. */
  counts: Record<number, RankedCount>;
  /** malIds whose counts are currently being fetched. */
  countLoading: number[];
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
  /** Lazily fetch exact character counts for any selected anime missing them. */
  loadCounts: () => Promise<void>;
  /** Fetch characters for all selected animes into `pool`. Resolves true on success. */
  fetchCharacters: () => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useAnimeStore = create<AnimeState>((set, get) => ({
  selected: [],
  pool: [],
  counts: {},
  countLoading: [],
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

  setSelection: (animes) => set({ selected: animes.slice(0, MAX_ANIMES) }),

  loadCounts: async () => {
    for (const anime of get().selected) {
      const { counts, countLoading } = get();
      if (counts[anime.malId] || countLoading.includes(anime.malId)) continue;
      set((s) => ({ countLoading: [...s.countLoading, anime.malId] }));
      try {
        const r = await fetchCharacters(anime.malId, anime.title);
        set((s) => ({
          counts: {
            ...s.counts,
            [anime.malId]: { fifteen: r.fifteen, available: r.characters.length },
          },
        }));
      } catch {
        // Leave it unknown; the build step will surface any real failure.
      } finally {
        set((s) => ({
          countLoading: s.countLoading.filter((id) => id !== anime.malId),
        }));
      }
    }
  },

  fetchCharacters: async () => {
    const { selected } = get();
    set({ loading: true, error: null, loadingMessage: 'Summoning characters...' });

    try {
      const pool: Character[] = [];
      const updatedSelected = [...selected];

      // Fetch each anime's favorites-ranked characters (+ its 15% count).
      const ranked: RankedCharacters[] = [];
      for (let i = 0; i < selected.length; i++) {
        const anime = selected[i];
        set({
          loadingMessage: `Summoning characters from ${anime.title}... (${i + 1}/${selected.length})`,
        });
        ranked.push(await fetchCharacters(anime.malId, anime.title));
      }

      // Decide each anime's contribution across the whole selection (top-15%, or
      // 25-each fallback when the combined 15% can't fill a board).
      const { contributions } = decideContributions(
        ranked.map((r) => ({ fifteen: r.fifteen, available: r.characters.length })),
        BOARD_SIZE,
        CHARACTER_FLOOR
      );

      ranked.forEach((r, i) => {
        const chosen = r.characters.slice(0, contributions[i]);
        pool.push(...chosen);
        updatedSelected[i] = { ...selected[i], characterCount: chosen.length };
      });

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
    set({
      selected: [],
      pool: [],
      counts: {},
      countLoading: [],
      loading: false,
      loadingMessage: '',
      error: null,
    }),
}));
