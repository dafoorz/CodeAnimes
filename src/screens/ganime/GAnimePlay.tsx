import { useEffect, useState } from 'react';
import { useGAnimeStore } from '../../store/ganimeStore';
import { useGameStore } from '../../store/gameStore';
import GAnimeView from '../../components/ganime/GAnimeView';
import { speedBonus } from '../../char/charLogic';
import { GA_BASE_POINTS } from '../../data/config';

export default function GAnimePlay() {
  const items = useGAnimeStore((s) => s.items);
  const index = useGAnimeStore((s) => s.index);
  const status = useGAnimeStore((s) => s.status);
  const startedAt = useGAnimeStore((s) => s.startedAt);
  const lastMatch = useGAnimeStore((s) => s.lastMatch);
  const lastPoints = useGAnimeStore((s) => s.lastPoints);
  const totalScore = useGAnimeStore((s) => s.totalScore);
  const submitGuess = useGAnimeStore((s) => s.submitGuess);
  const skip = useGAnimeStore((s) => s.skip);
  const nextRound = useGAnimeStore((s) => s.nextRound);
  const goMenu = useGameStore((s) => s.goMenu);

  const item = items[index];
  const revealed = status === 'revealed';

  const [guess, setGuess] = useState('');
  const [shake, setShake] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setGuess('');
    setSeconds(0);
  }, [index]);

  useEffect(() => {
    if (status !== 'guessing') return;
    const t = setInterval(() => setSeconds((Date.now() - startedAt) / 1000), 250);
    return () => clearInterval(t);
  }, [status, startedAt]);

  if (!item) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    if (submitGuess(guess) === 'no') {
      setShake(true);
      setTimeout(() => setShake(false), 320);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={goMenu} className="text-white/50 hover:text-white">
          ← Quit
        </button>
        <span className="font-semibold text-white">
          {index + 1} / {items.length}
        </span>
        <span className="rounded-lg bg-navy-light px-3 py-1 font-serif font-bold text-white">
          {totalScore}
        </span>
      </div>

      <GAnimeView item={item} />

      {!revealed && (
        <p className="mt-2 text-center text-xs text-white/50">
          Worth {GA_BASE_POINTS} pts + {speedBonus(seconds)} speed ·{' '}
          <span className="text-white/70">{Math.floor(seconds)}s</span>
        </p>
      )}

      <div className="mt-4 flex flex-1 flex-col">
        {!revealed ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type the anime name…"
              className={`w-full rounded-xl border-2 bg-navy-light px-4 py-3 text-center text-lg text-white placeholder-white/40 outline-none focus:border-team-blue ${
                shake ? 'animate-shake border-team-red' : 'border-white/15'
              }`}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!guess.trim()}
                className="flex-1 rounded-xl bg-team-blue py-3 font-bold text-white disabled:opacity-40"
              >
                Guess
              </button>
              <button
                type="button"
                onClick={skip}
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10"
              >
                Skip
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-pop-in flex flex-col items-center gap-3 text-center">
            <div
              className={`text-2xl font-black ${
                lastMatch === 'perfect'
                  ? 'text-team-blue'
                  : lastMatch === 'close'
                    ? 'text-amber-400'
                    : 'text-team-red'
              }`}
            >
              {lastMatch === 'perfect'
                ? '✓ Correct!'
                : lastMatch === 'close'
                  ? 'Close enough! ✓'
                  : 'Skipped'}
              {lastPoints > 0 && <span className="ml-2 text-white">+{lastPoints}</span>}
            </div>
            <div className="rounded-xl bg-navy-light px-6 py-3">
              <p className="font-serif text-xl font-bold text-white">{item.anime}</p>
              {item.character && <p className="text-sm text-white/60">— {item.character}</p>}
            </div>
            <button
              onClick={nextRound}
              className="mt-2 rounded-xl bg-gradient-to-r from-team-red to-team-blue px-10 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              {index + 1 >= items.length ? 'See Results →' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
