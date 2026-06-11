import { useQuizStore } from '../../store/quizStore';
import { useQuizNetStore } from '../../store/quizNetStore';
import { useGameStore } from '../../store/gameStore';
import {
  QUIZ_CLIP_MAX,
  QUIZ_CLIP_MIN,
  QUIZ_CLIP_STEP,
  QUIZ_SONG_OPTIONS,
} from '../../data/config';

export default function QuizSetup() {
  const enterOnline = useQuizNetStore((s) => s.enter);
  const numSongs = useQuizStore((s) => s.numSongs);
  const setNumSongs = useQuizStore((s) => s.setNumSongs);
  const showVideo = useQuizStore((s) => s.showVideo);
  const setShowVideo = useQuizStore((s) => s.setShowVideo);
  const clipSeconds = useQuizStore((s) => s.clipSeconds);
  const setClipSeconds = useQuizStore((s) => s.setClipSeconds);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const error = useQuizStore((s) => s.error);
  const goMenu = useGameStore((s) => s.goMenu);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-7 px-6 py-12">
      <button
        onClick={goMenu}
        className="self-start text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Menu
      </button>

      <div className="text-center">
        <p className="font-serif text-lg tracking-widest text-team-red">オープニング</p>
        <h1 className="font-serif text-4xl font-black text-white sm:text-5xl">
          Guess the <span className="text-team-blue">Opening</span>
        </h1>
        <p className="mt-3 text-sm text-white/60">
          A short clip plays — type the anime as fast as you can. Faster answers
          score more, and the openings get harder as you go. Miss it and you'll
          get four choices.
        </p>
      </div>

      {/* Number of songs */}
      <div>
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-white/50">
          How many songs?
        </p>
        <div className="grid grid-cols-4 gap-3">
          {QUIZ_SONG_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setNumSongs(n)}
              className={`rounded-xl border-2 py-4 text-xl font-bold transition-all ${
                numSongs === n
                  ? 'border-team-blue bg-team-blue/20 text-white'
                  : 'border-white/15 text-white/70 hover:border-white/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Video vs audio-only */}
      <div>
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-white/50">
          Clip mode
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowVideo(true)}
            className={`rounded-xl border-2 py-4 font-bold transition-all ${
              showVideo
                ? 'border-team-blue bg-team-blue/20 text-white'
                : 'border-white/15 text-white/70 hover:border-white/40'
            }`}
          >
            🎬 Show video
          </button>
          <button
            onClick={() => setShowVideo(false)}
            className={`rounded-xl border-2 py-4 font-bold transition-all ${
              !showVideo
                ? 'border-team-blue bg-team-blue/20 text-white'
                : 'border-white/15 text-white/70 hover:border-white/40'
            }`}
          >
            🎧 Audio only
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-white/40">
          {showVideo
            ? 'The opening video plays — easier, but the visuals give it away.'
            : 'Only the song plays — harder mode for true fans.'}
        </p>
      </div>

      {/* Clip length */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Clip length
          </p>
          <span className="font-serif text-lg font-bold text-team-blue">
            {clipSeconds.toFixed(1)}s
          </span>
        </div>
        <input
          type="range"
          min={QUIZ_CLIP_MIN}
          max={QUIZ_CLIP_MAX}
          step={QUIZ_CLIP_STEP}
          value={clipSeconds}
          onChange={(e) => setClipSeconds(Number(e.target.value))}
          className="w-full accent-team-blue"
        />
        <div className="flex justify-between text-xs text-white/40">
          <span>{QUIZ_CLIP_MIN}s (brutal)</span>
          <span>{QUIZ_CLIP_MAX}s</span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-center text-sm text-team-red">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={startQuiz}
          className="flex-1 rounded-xl bg-gradient-to-r from-team-red to-team-blue py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          ▶ Start Solo
        </button>
        <button
          onClick={enterOnline}
          className="flex-1 rounded-xl border border-white/25 bg-navy-light py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          🌐 Play Online
        </button>
      </div>

      <p className="text-center text-xs text-white/30">
        Clips stream from AnimeThemes.moe. Best in Chrome/Edge/Firefox; some
        browsers play webm with limited support.
      </p>
    </div>
  );
}
