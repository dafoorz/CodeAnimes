import { useQuizStore } from '../../store/quizStore';
import { useGameStore } from '../../store/gameStore';

export default function QuizEnd() {
  const results = useQuizStore((s) => s.results);
  const totalScore = useQuizStore((s) => s.totalScore);
  const reset = useQuizStore((s) => s.reset);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const goMenu = useGameStore((s) => s.goMenu);

  const correct = results.filter((r) => r.correct).length;
  const typed = results.filter((r) => r.method === 'typed' && r.correct).length;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <p className="font-serif text-lg tracking-widest text-white/40">結果 · RESULTS</p>
      <h1 className="animate-pop-in font-serif text-5xl font-black text-white">
        {totalScore}
        <span className="ml-2 text-lg font-normal text-white/50">pts</span>
      </h1>
      <p className="mt-2 text-white/60">
        {correct} / {results.length} correct · {typed} guessed by name
      </p>

      <ul className="mx-auto mt-7 space-y-1.5 text-left">
        {results.map((r, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg bg-navy-card px-4 py-2.5"
          >
            <span className="flex items-center gap-2">
              <span
                className={
                  r.correct
                    ? r.method === 'typed'
                      ? 'text-team-blue'
                      : 'text-amber-400'
                    : 'text-team-red'
                }
              >
                {r.correct ? (r.method === 'typed' ? '✓' : '◐') : '✗'}
              </span>
              <span className="font-medium text-white">{r.display}</span>
              <span className="text-amber-400/70 text-xs">
                {'★'.repeat(r.difficulty)}
              </span>
            </span>
            <span className="font-serif font-bold text-white/80">
              {r.points > 0 ? `+${r.points}` : '—'}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={startQuiz}
          className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          Play Again
        </button>
        <button
          onClick={reset}
          className="rounded-xl border border-white/20 px-8 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          Change Settings
        </button>
        <button
          onClick={goMenu}
          className="rounded-xl border border-white/20 px-8 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          Menu
        </button>
      </div>
    </div>
  );
}
