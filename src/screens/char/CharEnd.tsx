import { useCharStore } from '../../store/charStore';
import { useGameStore } from '../../store/gameStore';

export default function CharEnd() {
  const results = useCharStore((s) => s.results);
  const totalScore = useCharStore((s) => s.totalScore);
  const reset = useCharStore((s) => s.reset);
  const goMenu = useGameStore((s) => s.goMenu);

  const correct = results.filter((r) => r.match === 'perfect' || r.match === 'close');
  const best = correct.reduce<(typeof correct)[number] | null>(
    (b, r) => (!b || r.seconds < b.seconds ? r : b),
    null
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <p className="font-serif text-lg tracking-widest text-white/40">結果 · RESULTS</p>
      <h1 className="animate-pop-in font-serif text-5xl font-black text-white">
        {totalScore}
        <span className="ml-2 text-lg font-normal text-white/50">pts</span>
      </h1>
      <p className="mt-2 text-white/60">
        {correct.length} / {results.length} guessed
      </p>

      {best && (
        <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-xl bg-navy-light px-5 py-3">
          <span className="text-2xl">⚡</span>
          <div className="text-left">
            <p className="text-xs uppercase tracking-wide text-white/40">Fastest guess</p>
            <p className="font-semibold text-white">
              {best.name.replace(',', ' ')}{' '}
              <span className="text-white/50">in {best.seconds.toFixed(1)}s</span>
            </p>
          </div>
        </div>
      )}

      <ul className="mx-auto mt-7 space-y-1.5 text-left">
        {results.map((r, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg bg-navy-card px-4 py-2.5"
          >
            <span className="flex items-center gap-2">
              <span
                className={
                  r.match === 'perfect'
                    ? 'text-team-blue'
                    : r.match === 'close'
                      ? 'text-amber-400'
                      : 'text-team-red'
                }
              >
                {r.match === 'perfect' ? '✓' : r.match === 'close' ? '◓' : '✗'}
              </span>
              <span className="font-medium text-white">{r.name.replace(',', ' ')}</span>
            </span>
            <span className="font-serif font-bold text-white/80">
              {r.points > 0 ? `+${r.points}` : '—'}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          Play Again
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
