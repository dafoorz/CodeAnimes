import { useEffect, useMemo, useState } from 'react';
import { useAnimeStore } from '../store/animeStore';
import { useGameStore } from '../store/gameStore';
import { FAMOUS_ANIME } from '../data/famousAnime';
import { searchAnime } from '../api/jikan';
import {
  BOARD_SIZE,
  DEFAULT_PRESELECT,
  EST_CHARS_PER_ANIME,
  MAX_ANIMES,
  MIN_ANIMES,
  MIN_POOL,
} from '../data/config';
import type { AnimeOption } from '../types';
import { shuffle } from '../engine/gameLogic';
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
    isSelected,
    toggleAnime,
    setSelection,
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

  const selectedCount = selected.length;
  const estChars = useMemo(
    () =>
      selected.reduce(
        (sum, a) => sum + (a.characterCount ?? EST_CHARS_PER_ANIME),
        0
      ),
    [selected]
  );
  const tooFewChars = estChars < BOARD_SIZE;
  const atMax = selectedCount >= MAX_ANIMES;
  const canBuild = selectedCount >= MIN_ANIMES && !loading;

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
    <div className="mx-auto max-w-5xl px-4 py-8">
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
            tab === 'quick'
              ? 'bg-team-blue text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Quick Play (Famous Animes)
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'custom'
              ? 'bg-team-blue text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Custom Animes
        </button>
      </div>

      {tab === 'quick' && (
        <div className="animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/70">
              Pick {MIN_ANIMES}–{MAX_ANIMES} animes to source characters from.
            </p>
            <button
              onClick={randomize}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              🎲 Randomize Selection
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
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

          {searchError && (
            <p className="mb-4 text-sm text-team-red">{searchError}</p>
          )}

          {searching ? (
            <Spinner message="Searching MyAnimeList..." />
          ) : results.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
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

          {selected.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
                Currently selected
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((a) => (
                  <button
                    key={a.malId}
                    onClick={() => toggleAnime(a)}
                    className="rounded-full bg-navy-card px-3 py-1 text-xs text-white/80 transition-colors hover:bg-team-red/30"
                    title="Click to remove"
                  >
                    {a.title} ✕
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer: counter, warnings, build button */}
      <div className="sticky bottom-0 mt-8 -mx-4 border-t border-white/10 bg-navy/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-white">
              {selectedCount} anime{selectedCount === 1 ? '' : 's'} selected — ~
              {estChars} characters available
            </p>
            {tooFewChars && selectedCount > 0 && (
              <p className="text-team-red">
                ⚠ May be fewer than {BOARD_SIZE} characters — add more animes.
              </p>
            )}
            {selectedCount < MIN_ANIMES && (
              <p className="text-white/50">
                Select at least {MIN_ANIMES} animes to build a board.
              </p>
            )}
          </div>

          <button
            onClick={handleBuild}
            disabled={!canBuild}
            className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Build Board →
          </button>
        </div>

        {(error || poolError) && (
          <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between gap-3 rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-sm text-team-red">
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
