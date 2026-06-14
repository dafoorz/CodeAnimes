import { useEffect, useState } from 'react';
import { useCharStore } from '../../store/charStore';
import { useGameStore } from '../../store/gameStore';
import ChallengeView from '../../components/char/ChallengeView';
import { basePoints, speedBonus } from '../../char/charLogic';
import { CHAR_STEPS } from '../../data/config';

export default function CharPlay() {
  const characters = useCharStore((s) => s.characters);
  const index = useCharStore((s) => s.index);
  const challenge = useCharStore((s) => s.challenge);
  const level = useCharStore((s) => s.level);
  const crop = useCharStore((s) => s.crop);
  const status = useCharStore((s) => s.status);
  const startedAt = useCharStore((s) => s.startedAt);
  const lastMatch = useCharStore((s) => s.lastMatch);
  const lastPoints = useCharStore((s) => s.lastPoints);
  const totalScore = useCharStore((s) => s.totalScore);
  const submitGuess = useCharStore((s) => s.submitGuess);
  const idk = useCharStore((s) => s.idk);
  const nextRound = useCharStore((s) => s.nextRound);
  const goMenu = useGameStore((s) => s.goMenu);

  const char = characters[index];
  const revealed = status === 'revealed';
  const stepped = challenge === 'zoom' || challenge === 'blur';

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

  if (!char) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    const m = submitGuess(guess);
    if (m === 'no') {
      setShake(true);
      setTimeout(() => setShake(false), 320);
    }
  };

  const idkLabel = stepped
    ? level < CHAR_STEPS - 1
      ? challenge === 'zoom'
        ? '🔍 Zoom out'
        : '🌫 Unblur'
      : 'Give up'
    : 'Skip';

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={goMenu} className="text-white/50 hover:text-white">
          ← Quit
        </button>
        <span className="font-semibold text-white">
          Character {index + 1} / {characters.length}
        </span>
        <span className="rounded-lg bg-navy-light px-3 py-1 font-serif font-bold text-white">
          {totalScore}
        </span>
      </div>

      <ChallengeView
        challenge={challenge}
        imageUrl={char.imageUrl}
        name={char.name}
        level={level}
        crop={crop}
        revealed={revealed}
        quote={char.quote}
      />

      {!revealed && (
        <p className="mt-2 text-center text-xs text-white/50">
          Worth {basePoints(challenge, level)} pts + {speedBonus(seconds)} speed ·{' '}
          <span className="text-white/70">{Math.floor(seconds)}s</span>
          {stepped ? ` · level ${level + 1}/${CHAR_STEPS}` : ''}
        </p>
      )}

      <div className="mt-4 flex flex-1 flex-col">
        {!revealed ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type the character's name…"
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
                onClick={idk}
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10"
              >
                {idkLabel}
              </button>
            </div>
            <p className="text-center text-xs text-white/40">
              First/last name or nickname works — typos are forgiven.
            </p>
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
              <p className="font-serif text-xl font-bold text-white">
                {char.name.replace(',', ' ')}
              </p>
              <p className="text-sm text-white/60">{char.anime}</p>
            </div>
            <button
              onClick={nextRound}
              className="mt-2 rounded-xl bg-gradient-to-r from-team-red to-team-blue px-10 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              {index + 1 >= characters.length ? 'See Results →' : 'Next Character →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
