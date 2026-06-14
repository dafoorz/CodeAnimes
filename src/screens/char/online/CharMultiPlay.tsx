import { useEffect, useState } from 'react';
import { useCharNetStore } from '../../../store/charNetStore';
import { useCharStore } from '../../../store/charStore';
import ChallengeView from '../../../components/char/ChallengeView';
import CharacterImage from '../../../components/CharacterImage';
import { basePoints, speedBonus } from '../../../char/charLogic';
import { CHAR_STEPS } from '../../../data/config';

function matchIcon(m: string) {
  return m === 'perfect' ? '✓' : m === 'close' ? '◓' : '✗';
}
function matchColor(m: string) {
  return m === 'perfect' ? 'text-team-blue' : m === 'close' ? 'text-amber-400' : 'text-team-red';
}

export default function CharMultiPlay() {
  const screen = useCharNetStore((s) => s.screen);
  const challenge = useCharNetStore((s) => s.challenge);
  const imageUrl = useCharNetStore((s) => s.imageUrl);
  const quote = useCharNetStore((s) => s.quote);
  const crop = useCharNetStore((s) => s.crop);
  const level = useCharNetStore((s) => s.level);
  const roundIndex = useCharNetStore((s) => s.roundIndex);
  const total = useCharNetStore((s) => s.total);
  const startedAt = useCharNetStore((s) => s.startedAt);
  const myAnswered = useCharNetStore((s) => s.myAnswered);
  const myMatch = useCharNetStore((s) => s.myMatch);
  const wrongNonce = useCharNetStore((s) => s.wrongNonce);
  const reveal = useCharNetStore((s) => s.reveal);
  const isHost = useCharNetStore((s) => s.isHost);
  const submitGuess = useCharNetStore((s) => s.submitGuess);
  const idk = useCharNetStore((s) => s.idk);
  const hostNext = useCharNetStore((s) => s.hostNext);
  const leave = useCharNetStore((s) => s.leave);
  const goSetup = useCharStore((s) => s.goSetup);

  const isReveal = screen === 'reveal';
  const stepped = challenge === 'zoom' || challenge === 'blur';

  const [guess, setGuess] = useState('');
  const [shake, setShake] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setGuess('');
    setSeconds(0);
  }, [roundIndex]);

  useEffect(() => {
    if (isReveal || myAnswered) return;
    const t = setInterval(() => setSeconds((Date.now() - startedAt) / 1000), 250);
    return () => clearInterval(t);
  }, [isReveal, myAnswered, startedAt]);

  useEffect(() => {
    if (wrongNonce === 0) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 320);
    return () => clearTimeout(t);
  }, [wrongNonce]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    submitGuess(guess);
    setGuess('');
  };

  const quit = () => {
    leave();
    goSetup();
  };

  const idkLabel = stepped
    ? level < CHAR_STEPS - 1
      ? challenge === 'zoom'
        ? '🔍 Zoom out'
        : '🌫 Unblur'
      : 'Give up'
    : 'Skip';

  // --- Reveal screen ---
  if (isReveal && reveal) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
        <div className="mb-3 text-center text-sm font-semibold text-white">
          Round {reveal.index + 1} / {reveal.total}
        </div>
        <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/15 bg-black/40 sm:h-64">
          <CharacterImage src={reveal.correctImage} name={reveal.correctName} fit="contain" className="h-full w-full" />
        </div>
        <div className="mt-3 text-center">
          <p className="font-serif text-2xl font-bold text-white">{reveal.correctName.replace(',', ' ')}</p>
          <p className="text-sm text-white/60">{reveal.anime}</p>
          <p className={`mt-1 font-bold ${matchColor(reveal.youMatch)}`}>
            {reveal.youMatch === 'perfect'
              ? `✓ Correct! +${reveal.youPoints}`
              : reveal.youMatch === 'close'
                ? `Close enough! ✓ +${reveal.youPoints}`
                : 'You missed this one'}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-white/40">This round</p>
            <ul className="space-y-1">
              {reveal.rows.map((r, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-navy-card px-3 py-1.5 text-sm">
                  <span className={matchColor(r.match)}>
                    {matchIcon(r.match)} <span className="text-white">{r.name}</span>
                  </span>
                  <span className="font-semibold text-white/80">{r.points > 0 ? `+${r.points}` : '—'}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-white/40">Leaderboard</p>
            <ul className="space-y-1">
              {reveal.leaderboard.map((row, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                    row.isSelf ? 'bg-team-blue/20 text-white' : 'bg-navy-card text-white/80'
                  }`}
                >
                  <span>
                    <span className="mr-1 text-white/40">{i + 1}.</span>
                    {row.name}
                  </span>
                  <span className="font-serif font-bold">{row.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 text-center">
          {isHost ? (
            <button
              onClick={hostNext}
              className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-10 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              {reveal.index + 1 >= reveal.total ? 'See Results →' : 'Next Character →'}
            </button>
          ) : (
            <p className="text-sm text-white/50">Waiting for the host to continue…</p>
          )}
        </div>
      </div>
    );
  }

  // --- Play screen ---
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={quit} className="text-white/50 hover:text-white">
          ← Quit
        </button>
        <span className="font-semibold text-white">
          Character {roundIndex + 1} / {total}
        </span>
        <span className="rounded-lg bg-navy-light px-3 py-1 font-serif font-bold text-white">
          {Math.floor(seconds)}s
        </span>
      </div>

      <ChallengeView
        challenge={challenge}
        imageUrl={imageUrl}
        name=""
        level={level}
        crop={crop}
        revealed={false}
        quote={quote}
      />

      {!myAnswered && (
        <p className="mt-2 text-center text-xs text-white/50">
          Worth {basePoints(challenge, level)} pts + {speedBonus(seconds)} speed
          {stepped ? ` · level ${level + 1}/${CHAR_STEPS}` : ''}
        </p>
      )}

      <div className="mt-4 flex flex-1 flex-col">
        {myAnswered ? (
          <div className="animate-pop-in text-center">
            <p className={`text-2xl font-black ${matchColor(myMatch ?? 'no')}`}>
              {myMatch === 'perfect'
                ? '✓ Correct!'
                : myMatch === 'close'
                  ? 'Close enough! ✓'
                  : 'Skipped'}
            </p>
            <p className="mt-1 text-sm text-white/50">Waiting for others…</p>
          </div>
        ) : (
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
          </form>
        )}
      </div>
    </div>
  );
}
