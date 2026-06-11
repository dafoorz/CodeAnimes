import { useEffect, useRef, useState } from 'react';
import { useQuizNetStore } from '../../../store/quizNetStore';
import { useGameStore } from '../../../store/gameStore';
import ClipPlayer, { type ClipPlayerHandle } from '../../../components/quiz/ClipPlayer';

function Stars({ difficulty }: { difficulty: number }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(difficulty)}
      <span className="text-white/20">{'★'.repeat(4 - difficulty)}</span>
    </span>
  );
}

function Leaderboard() {
  const reveal = useQuizNetStore((s) => s.reveal);
  if (!reveal) return null;
  return (
    <ul className="mx-auto w-full max-w-xs space-y-1">
      {reveal.leaderboard.map((row, i) => (
        <li
          key={i}
          className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${
            row.isSelf ? 'bg-team-blue/20 text-white' : 'bg-navy-card text-white/80'
          }`}
        >
          <span>
            <span className="mr-2 text-white/40">{i + 1}.</span>
            {row.name}
            {row.isSelf && <span className="text-white/40"> (you)</span>}
          </span>
          <span className="font-serif font-bold">{row.score}</span>
        </li>
      ))}
    </ul>
  );
}

export default function QuizMultiPlay() {
  const screen = useQuizNetStore((s) => s.screen);
  const clipUrls = useQuizNetStore((s) => s.clipUrls);
  const roundIndex = useQuizNetStore((s) => s.roundIndex);
  const total = useQuizNetStore((s) => s.total);
  const difficulty = useQuizNetStore((s) => s.difficulty);
  const clipSeconds = useQuizNetStore((s) => s.clipSeconds);
  const showVideo = useQuizNetStore((s) => s.showVideo);
  const myAnswered = useQuizNetStore((s) => s.myAnswered);
  const myCorrect = useQuizNetStore((s) => s.myCorrect);
  const myPoints = useQuizNetStore((s) => s.myPoints);
  const wrongNonce = useQuizNetStore((s) => s.wrongNonce);
  const reveal = useQuizNetStore((s) => s.reveal);
  const submitGuess = useQuizNetStore((s) => s.submitGuess);
  const leave = useQuizNetStore((s) => s.leave);
  const goQuiz = useGameStore((s) => s.goQuiz);

  const playerRef = useRef<ClipPlayerHandle>(null);
  const [secondsLeft, setSecondsLeft] = useState(clipSeconds);
  const [guess, setGuess] = useState('');
  const [shake, setShake] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [needGesture, setNeedGesture] = useState(false);

  const isReveal = screen === 'reveal';
  const localEnded = secondsLeft <= 0;
  const clipUrl = clipUrls[roundIndex];

  // Reset the typed guess each round.
  useEffect(() => {
    setGuess('');
    setSecondsLeft(clipSeconds);
  }, [roundIndex, clipSeconds]);

  // Shake on a rejected guess.
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
    goQuiz();
  };

  const canType = !isReveal && !myAnswered && !localEnded;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={quit} className="text-white/50 hover:text-white">
          ← Quit
        </button>
        <span className="font-semibold text-white">
          Round {roundIndex + 1} / {total} &nbsp;<Stars difficulty={difficulty} />
        </span>
        {!isReveal && (
          <span className="rounded-lg bg-navy-light px-3 py-1 font-serif font-bold text-white">
            {Math.ceil(secondsLeft)}s
          </span>
        )}
      </div>

      {/* Video */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-white/15 bg-black shadow-xl">
        <div className="aspect-video w-full">
          <ClipPlayer
            ref={playerRef}
            url={clipUrl}
            clipSeconds={clipSeconds}
            volume={volume}
            onTick={setSecondsLeft}
            onNeedGesture={setNeedGesture}
          />
        </div>
        {!showVideo && !isReveal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-navy-light to-navy-card">
            <div className="flex items-end gap-1.5" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-2 rounded-full bg-team-blue"
                  style={{ height: 16 + (i % 2 === 0 ? 22 : 8), animation: `eq 0.8s ease-in-out ${i * 0.12}s infinite` }}
                />
              ))}
            </div>
            <p className="font-serif text-lg font-bold text-white/80">🎧 Audio only</p>
          </div>
        )}
        {needGesture && !isReveal && (
          <button
            onClick={() => playerRef.current?.play()}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 text-lg font-bold text-white"
          >
            ▶ Tap to play
          </button>
        )}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
          <span className="text-base leading-none">{volume === 0 ? '🔇' : '🔊'}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-20 accent-team-blue"
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Interaction */}
      <div className="mt-5 flex flex-1 flex-col">
        {isReveal && reveal ? (
          <div className="animate-pop-in flex flex-col items-center gap-3 text-center">
            <div className={`text-2xl font-black ${reveal.youCorrect ? 'text-team-blue' : 'text-team-red'}`}>
              {reveal.youCorrect ? `✓ +${reveal.youPoints}` : '✗ Missed'}
            </div>
            <div className="rounded-xl bg-navy-light px-6 py-3">
              <p className="font-serif text-xl font-bold text-white">{reveal.correctDisplay}</p>
              {reveal.songTitle && <p className="text-sm text-white/60">♪ {reveal.songTitle}</p>}
            </div>
            <Leaderboard />
            <p className="text-xs text-white/40">
              {reveal.index + 1 >= reveal.total ? 'Final results coming…' : 'Next round soon…'}
            </p>
          </div>
        ) : myAnswered && myCorrect ? (
          <div className="animate-pop-in text-center">
            <p className="text-2xl font-black text-team-blue">✓ Correct! +{myPoints}</p>
            <p className="mt-1 text-sm text-white/50">Waiting for the round to end…</p>
          </div>
        ) : localEnded ? (
          <p className="text-center text-sm text-white/50">Time's up — waiting for results…</p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={!canType}
              placeholder="Type the anime name…"
              className={`w-full rounded-xl border-2 bg-navy-light px-4 py-3 text-center text-lg text-white placeholder-white/40 outline-none focus:border-team-blue ${
                shake ? 'animate-shake border-team-red' : 'border-white/15'
              }`}
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="rounded-xl bg-team-blue py-3 font-bold text-white disabled:opacity-40"
            >
              Guess
            </button>
            <p className="text-center text-xs text-white/40">
              Fastest correct answers score the most. Keep trying until you get it!
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
