import { useEffect, useState } from 'react';
import { useGAnimeNetStore } from '../../../store/ganimeNetStore';
import { useGAnimeStore } from '../../../store/ganimeStore';
import GAnimeView from '../../../components/ganime/GAnimeView';
import { speedBonus } from '../../../char/charLogic';
import { GA_BASE_POINTS } from '../../../data/config';

const color = (m: string) =>
  m === 'perfect' ? 'text-team-blue' : m === 'close' ? 'text-amber-400' : 'text-team-red';
const icon = (m: string) => (m === 'perfect' ? '✓' : m === 'close' ? '◓' : '✗');

export default function GAnimeMultiPlay() {
  const screen = useGAnimeNetStore((s) => s.screen);
  const prompt = useGAnimeNetStore((s) => s.prompt);
  const roundIndex = useGAnimeNetStore((s) => s.roundIndex);
  const total = useGAnimeNetStore((s) => s.total);
  const startedAt = useGAnimeNetStore((s) => s.startedAt);
  const myAnswered = useGAnimeNetStore((s) => s.myAnswered);
  const myMatch = useGAnimeNetStore((s) => s.myMatch);
  const wrongNonce = useGAnimeNetStore((s) => s.wrongNonce);
  const reveal = useGAnimeNetStore((s) => s.reveal);
  const isHost = useGAnimeNetStore((s) => s.isHost);
  const submitGuess = useGAnimeNetStore((s) => s.submitGuess);
  const skip = useGAnimeNetStore((s) => s.skip);
  const hostNext = useGAnimeNetStore((s) => s.hostNext);
  const leave = useGAnimeNetStore((s) => s.leave);
  const goSetup = useGAnimeStore((s) => s.goSetup);

  const isReveal = screen === 'reveal';
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

  if (isReveal && reveal) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
        <p className="mb-3 text-center text-sm font-semibold text-white">
          Round {reveal.index + 1} / {reveal.total}
        </p>
        <div className="rounded-2xl bg-navy-light px-6 py-5 text-center">
          <p className="text-xs uppercase tracking-wide text-white/40">The anime was</p>
          <p className="font-serif text-2xl font-bold text-white">{reveal.anime}</p>
          <p className={`mt-1 font-bold ${color(reveal.youMatch)}`}>
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
                  <span className={color(r.match)}>
                    {icon(r.match)} <span className="text-white">{r.name}</span>
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
              {reveal.index + 1 >= reveal.total ? 'See Results →' : 'Next →'}
            </button>
          ) : (
            <p className="text-sm text-white/50">Waiting for the host to continue…</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={quit} className="text-white/50 hover:text-white">
          ← Quit
        </button>
        <span className="font-semibold text-white">
          {roundIndex + 1} / {total}
        </span>
        <span className="rounded-lg bg-navy-light px-3 py-1 font-serif font-bold text-white">
          {Math.floor(seconds)}s
        </span>
      </div>

      {prompt && <GAnimeView item={prompt} />}

      {!myAnswered && (
        <p className="mt-2 text-center text-xs text-white/50">
          Worth {GA_BASE_POINTS} pts + {speedBonus(seconds)} speed
        </p>
      )}

      <div className="mt-4 flex flex-1 flex-col">
        {myAnswered ? (
          <div className="animate-pop-in text-center">
            <p className={`text-2xl font-black ${color(myMatch ?? 'no')}`}>
              {myMatch === 'perfect' ? '✓ Correct!' : myMatch === 'close' ? 'Close enough! ✓' : 'Skipped'}
            </p>
            <p className="mt-1 text-sm text-white/50">Waiting for others…</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
