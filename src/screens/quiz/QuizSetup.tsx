import { useQuizStore } from '../../store/quizStore';
import { useGameStore } from '../../store/gameStore';
import { QUIZ_SONG_OPTIONS } from '../../data/config';

export default function QuizSetup() {
  const numSongs = useQuizStore((s) => s.numSongs);
  const setNumSongs = useQuizStore((s) => s.setNumSongs);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const error = useQuizStore((s) => s.error);
  const goHome = useGameStore((s) => s.goHome);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-12">
      <button
        onClick={goHome}
        className="self-start text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Home
      </button>

      <div className="text-center">
        <p className="font-serif text-lg tracking-widest text-team-red">オープニング</p>
        <h1 className="font-serif text-4xl font-black text-white sm:text-5xl">
          Guess the <span className="text-team-blue">Opening</span>
        </h1>
        <p className="mt-3 text-white/60">
          A 10-second clip plays — type the anime as fast as you can. Faster
          answers score more, and the openings get harder as you go. Miss it and
          you'll get four choices.
        </p>
      </div>

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

      {error && (
        <p className="rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-center text-sm text-team-red">
          {error}
        </p>
      )}

      <button
        onClick={startQuiz}
        className="rounded-xl bg-gradient-to-r from-team-red to-team-blue py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        ▶ Start Quiz
      </button>

      <p className="text-center text-xs text-white/30">
        Clips stream from AnimeThemes.moe. Best in Chrome/Edge/Firefox; some
        browsers play webm with limited support.
      </p>
    </div>
  );
}
