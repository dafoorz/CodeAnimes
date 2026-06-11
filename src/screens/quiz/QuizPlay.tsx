import { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '../../store/quizStore';
import { useGameStore } from '../../store/gameStore';

/** Circular countdown ring around the video. */
function TimerRing({ secondsLeft, max }: { secondsLeft: number; max: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, secondsLeft / max));
  const color =
    frac > 0.6 ? '#4361ee' : frac > 0.3 ? '#f4a261' : '#e63946';
  return (
    <div className="relative h-16 w-16">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#ffffff20" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: 'stroke 0.3s' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif text-xl font-black text-white">
        {secondsLeft >= 1 ? Math.ceil(secondsLeft) : secondsLeft.toFixed(1)}
      </span>
    </div>
  );
}

function Stars({ difficulty }: { difficulty: number }) {
  return (
    <span className="text-amber-400" title={`Difficulty ${difficulty}/4`}>
      {'★'.repeat(difficulty)}
      <span className="text-white/20">{'★'.repeat(4 - difficulty)}</span>
    </span>
  );
}

/** Animated panel shown over the (hidden) video in audio-only mode. */
function AudioCover({ playing }: { playing: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-navy-light to-navy-card">
      <div className="flex items-end gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-team-blue"
            style={{
              height: 16 + (i % 2 === 0 ? 22 : 8),
              animation: playing ? `eq 0.8s ease-in-out ${i * 0.12}s infinite` : 'none',
            }}
          />
        ))}
      </div>
      <p className="font-serif text-lg font-bold text-white/80">🎧 Audio only</p>
    </div>
  );
}

export default function QuizPlay() {
  const songs = useQuizStore((s) => s.songs);
  const index = useQuizStore((s) => s.index);
  const songStatus = useQuizStore((s) => s.songStatus);
  const totalScore = useQuizStore((s) => s.totalScore);
  const showVideo = useQuizStore((s) => s.showVideo);
  const clipSeconds = useQuizStore((s) => s.clipSeconds);
  const volume = useQuizStore((s) => s.volume);
  const muted = useQuizStore((s) => s.muted);
  const setVolume = useQuizStore((s) => s.setVolume);
  const toggleMute = useQuizStore((s) => s.toggleMute);
  const lastCorrect = useQuizStore((s) => s.lastCorrect);
  const lastMethod = useQuizStore((s) => s.lastMethod);
  const lastPoints = useQuizStore((s) => s.lastPoints);
  const submitGuess = useQuizStore((s) => s.submitGuess);
  const clipEnded = useQuizStore((s) => s.clipEnded);
  const chooseOption = useQuizStore((s) => s.chooseOption);
  const giveUp = useQuizStore((s) => s.giveUp);
  const nextSong = useQuizStore((s) => s.nextSong);
  const goMenu = useGameStore((s) => s.goMenu);

  const song = songs[index];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [secondsLeft, setSecondsLeft] = useState(clipSeconds);
  const [guess, setGuess] = useState('');
  const [shake, setShake] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [needGesture, setNeedGesture] = useState(false);

  // Reset and start playback when the song changes.
  useEffect(() => {
    setSecondsLeft(clipSeconds);
    setGuess('');
    setChosen(null);
    setNeedGesture(false);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => setNeedGesture(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Apply volume/mute to the video element whenever they change or the song loads.
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.volume = volume;
      v.muted = muted;
    }
  }, [volume, muted, index]);

  // Smooth countdown + clip cutoff while guessing.
  useEffect(() => {
    if (songStatus !== 'guessing') return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) {
        const left = clipSeconds - v.currentTime;
        setSecondsLeft(Math.max(0, left));
        if (v.currentTime >= clipSeconds) {
          v.pause();
          clipEnded();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [songStatus, index, clipSeconds, clipEnded]);

  const startManually = () => {
    setNeedGesture(false);
    videoRef.current?.play().catch(() => setNeedGesture(true));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    const correct = submitGuess(guess, secondsLeft);
    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 320);
    }
  };

  const pick = (option: string) => {
    setChosen(option);
    chooseOption(option);
    videoRef.current?.play().catch(() => {});
  };

  const revealed = songStatus === 'revealed';

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <button
          onClick={goMenu}
          className="text-white/50 transition-colors hover:text-white"
        >
          ← Quit
        </button>
        <span className="font-semibold text-white">
          Song {index + 1} / {songs.length} &nbsp;<Stars difficulty={song.difficulty} />
        </span>
        <span className="rounded-lg bg-navy-light px-3 py-1 font-serif font-bold text-white">
          {totalScore}
        </span>
      </div>

      {/* Video + timer */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-white/15 bg-black shadow-xl">
        <div className="aspect-video w-full">
          <video
            ref={videoRef}
            src={song.playUrl}
            preload="auto"
            playsInline
            className="h-full w-full object-cover"
          />
        </div>

        {/* Audio-only cover (video still plays underneath for sound) */}
        {!showVideo && !revealed && <AudioCover playing={!needGesture} />}

        {/* Countdown while guessing */}
        {songStatus === 'guessing' && (
          <div className="absolute right-3 top-3">
            <TimerRing secondsLeft={secondsLeft} max={clipSeconds} />
          </div>
        )}

        {needGesture && songStatus === 'guessing' && (
          <button
            onClick={startManually}
            className="absolute inset-0 flex items-center justify-center bg-black/70 text-lg font-bold text-white"
          >
            ▶ Tap to play the clip
          </button>
        )}

        {/* Volume control */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
          <button
            onClick={toggleMute}
            className="text-lg leading-none"
            title={muted ? 'Unmute' : 'Mute'}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-20 accent-team-blue sm:w-28"
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Interaction area */}
      <div className="mt-5 flex flex-1 flex-col">
        {songStatus === 'guessing' && (
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
                onClick={giveUp}
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10"
              >
                Give up
              </button>
            </div>
            <p className="text-center text-xs text-white/40">
              Faster answers score more. Aliases &amp; minor typos are accepted.
            </p>
          </form>
        )}

        {songStatus === 'choices' && (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm font-semibold text-white/70">
              Time's up! Pick the anime:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {song.choices.map((opt) => (
                <button
                  key={opt}
                  onClick={() => pick(opt)}
                  className="rounded-xl border-2 border-white/15 bg-navy-card px-4 py-3 font-semibold text-white transition-all hover:border-team-blue hover:bg-team-blue/15"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {revealed && (
          <div className="animate-pop-in flex flex-col items-center gap-3 text-center">
            <div
              className={`rounded-xl px-6 py-3 text-2xl font-black ${
                lastCorrect ? 'text-team-blue' : 'text-team-red'
              }`}
            >
              {lastCorrect ? '✓ Correct!' : lastMethod === 'none' ? 'Skipped' : '✗ Wrong'}
              {lastPoints > 0 && (
                <span className="ml-2 text-white">+{lastPoints}</span>
              )}
            </div>
            <div className="rounded-xl bg-navy-light px-6 py-3">
              <p className="font-serif text-xl font-bold text-white">
                {song.display}
              </p>
              {song.songTitle && (
                <p className="text-sm text-white/60">♪ {song.songTitle}</p>
              )}
            </div>
            {chosen && !lastCorrect && (
              <p className="text-sm text-white/50">You picked: {chosen}</p>
            )}
            <button
              onClick={nextSong}
              className="mt-2 rounded-xl bg-gradient-to-r from-team-red to-team-blue px-10 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              {index + 1 >= songs.length ? 'See Results →' : 'Next Song →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
