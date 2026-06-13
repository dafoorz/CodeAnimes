import { useEffect, useState } from 'react';
import { useAnimeStore } from '../store/animeStore';
import { useGameStore } from '../store/gameStore';
import { FAMOUS_ANIME } from '../data/famousAnime';
import { searchAnime } from '../api/jikan';
import {
  BOARD_SIZE,
  CHARACTER_FLOOR,
  DEFAULT_PRESELECT,
  MAX_ANIMES,
  MIN_ANIMES,
  MIN_POOL,
} from '../data/config';
import type { AnimeOption } from '../types';
import { shuffle } from '../engine/gameLogic';
import { decideContributions } from '../game/selection';
import SelectableAnimeCard from '../components/SelectableAnimeCard';
import Spinner from '../components/Spinner';

type Tab = 'quick' | 'custom';

interface AnimeSelectProps {
  /**
   * Called with the built pool when the board is ready. If omitted, the screen
   * proceeds to the local Role Select. Used by the online host to hand the pool
   * to the multiplayer store instead.
   */
  onBuilt?: (poolSize: number, selectedCount: number) => void;
  /** Override the back action (defaults to going Home). */
  onBack?: () => void;
}

export default function AnimeSelectScreen({ onBuilt, onBack }: AnimeSelectProps) {
  const {
    selected,
    counts,
    isSelected,
    toggleAnime,
    removeAnime,
    setSelection,
    loadCounts,
    fetchCharacters,
    loading,
    loadingMessage,
    error,
    clearError,
  } = useAnimeStore();
  const goToRole = useGameStore((s) => s.goToRole);
  const goHome = useGameStore((s) => s.goHome);
  const back = onBack ?? goHome;

  const [tab, setTab] = useState<Tab>('quick');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [poolError, setPoolError] = useState<string | null>(null);

  // Pre-select DEFAULT_PRESELECT random famous animes on first arrival.
  useEffect(() => {
    if (selected.length === 0) {
      setSelection(shuffle(FAMOUS_ANIME).slice(0, DEFAULT_PRESELECT));
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazily fetch exact character counts whenever the selection changes.
  useEffect(() => {
    loadCounts();
  }, [selected, loadCounts]);

  const selectedCount = selected.length;
  const atMax = selectedCount >= MAX_ANIMES;

  // Exact per-anime contributions (unknown counts treated as 0 until loaded).
  const detailItems = selected.map(
    (a) => counts[a.malId] ?? { fifteen: 0, available: 0 }
  );
  const { contributions, total: exactTotal } = decideContributions(
    detailItems,
    BOARD_SIZE,
    CHARACTER_FLOOR
  );
  const allLoaded = selected.every((a) => counts[a.malId]);
  const enoughChars = exactTotal >= BOARD_SIZE;

  const canBuild =
    selectedCount >= MIN_ANIMES && !loading && (!allLoaded || enoughChars);

  const randomize = () => {
    setSelection(shuffle(FAMOUS_ANIME).slice(0, DEFAULT_PRESELECT));
  };

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      setResults(await searchAnime(q));
    } catch {
      setSearchError('Search failed. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleBuild = async () => {
    setPoolError(null);
    clearError();
    const ok = await fetchCharacters();
    if (!ok) return; // store-level error rendered below
    const pool = useAnimeStore.getState().pool;
    if (pool.length < MIN_POOL) {
      setPoolError(
        `Only ${pool.length} characters were found — at least ${MIN_POOL} are needed to fill the board. Add more animes.`
      );
      return;
    }
    if (onBuilt) onBuilt(pool.length, selected.length);
    else goToRole();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner message={loadingMessage || 'Summoning characters...'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={back}
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          Choose Your Animes
        </h1>
        <span className="w-12" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-xl bg-navy-light p-1">
        <button
          onClick={() => setTab('quick')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'quick' ? 'bg-team-blue text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Quick Play (Famous Animes)
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'custom' ? 'bg-team-blue text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Custom Animes
        </button>
      </div>

      <div className="lg:flex lg:gap-6">
        {/* Left: selection grids */}
        <div className="min-w-0 lg:flex-1">
          {tab === 'quick' && (
            <div className="animate-fade-in">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white/70">
                  Pick any animes — you just need {MIN_POOL}+ characters to start.
                </p>
                <button
                  onClick={randomize}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                >
                  🎲 Randomize Selection
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {FAMOUS_ANIME.map((anime) => {
                  const sel = isSelected(anime.malId);
                  return (
                    <SelectableAnimeCard
                      key={anime.malId}
                      anime={anime}
                      selected={sel}
                      disabled={!sel && atMax}
                      onToggle={() => toggleAnime(anime)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'custom' && (
            <div className="animate-fade-in">
              <div className="mb-4 flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  placeholder="Search any anime (e.g. Chainsaw Man)..."
                  className="flex-1 rounded-lg border border-white/15 bg-navy-light px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-team-blue"
                />
                <button
                  onClick={runSearch}
                  disabled={searching || !query.trim()}
                  className="rounded-lg bg-team-blue px-5 py-2.5 font-semibold text-white transition-opacity disabled:opacity-50"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </div>

              {searchError && <p className="mb-4 text-sm text-team-red">{searchError}</p>}

              {searching ? (
                <Spinner message="Searching MyAnimeList..." />
              ) : results.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {results.map((anime) => {
                    const sel = isSelected(anime.malId);
                    return (
                      <SelectableAnimeCard
                        key={anime.malId}
                        anime={anime}
                        selected={sel}
                        disabled={!sel && atMax}
                        onToggle={() => toggleAnime(anime)}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-white/40">
                  Search for any anime by title to add it to your selection.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: selected list with exact character counts */}
        <aside className="mt-6 lg:mt-0 lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-4 rounded-2xl border border-white/10 bg-navy-light p-4">
            <h3 className="mb-3 font-serif text-lg font-bold text-white">
              Selected ({selectedCount})
            </h3>

            {selectedCount === 0 ? (
              <p className="text-sm text-white/40">
                Tap animes on the left to add them here.
              </p>
            ) : (
              <ul className="max-h-[45vh] space-y-1.5 overflow-auto pr-1">
                {selected.map((a, i) => {
                  const known = !!counts[a.malId];
                  return (
                    <li
                      key={a.malId}
                      className="flex items-center gap-2 rounded-lg bg-navy-card px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-white">
                        {a.title}
                      </span>
                      <span
                        className="shrink-0 text-xs font-semibold text-team-blue"
                        title="Characters from this anime"
                      >
                        {known ? `${contributions[i]} chars` : '…'}
                      </span>
                      <button
                        onClick={() => removeAnime(a.malId)}
                        className="shrink-0 text-white/40 transition-colors hover:text-team-red"
                        title="Remove"
                        aria-label={`Remove ${a.title}`}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {selectedCount > 0 && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Total characters</span>
                  <span
                    className={`font-serif text-lg font-black ${
                      allLoaded && !enoughChars ? 'text-team-red' : 'text-white'
                    }`}
                  >
                    {allLoaded ? exactTotal : '…'}
                  </span>
                </div>
                {!allLoaded ? (
                  <p className="mt-1 text-xs text-white/40">Counting characters…</p>
                ) : (
                  !enoughChars && (
                    <p className="mt-1 text-xs text-team-red">
                      Need {BOARD_SIZE}+ characters — add more animes.
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footer: build button */}
      <div className="sticky bottom-0 mt-8 -mx-4 border-t border-white/10 bg-navy/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-white">
            {selectedCount} anime{selectedCount === 1 ? '' : 's'} ·{' '}
            {allLoaded ? exactTotal : '…'} characters
          </p>
          <button
            onClick={handleBuild}
            disabled={!canBuild}
            className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Build Board →
          </button>
        </div>

        {(error || poolError) && (
          <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-3 rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-sm text-team-red">
            <span>{error || poolError}</span>
            <button
              onClick={handleBuild}
              className="rounded-md bg-team-red px-3 py-1 font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
