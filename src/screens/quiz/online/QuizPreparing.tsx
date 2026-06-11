import { useQuizNetStore } from '../../../store/quizNetStore';
import Spinner from '../../../components/Spinner';

export default function QuizPreparing() {
  const preloadDone = useQuizNetStore((s) => s.preloadDone);
  const preloadTotal = useQuizNetStore((s) => s.preloadTotal);
  const players = useQuizNetStore((s) => s.players);

  const pct = preloadTotal > 0 ? Math.round((preloadDone / preloadTotal) * 100) : 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12 text-center">
      {preloadTotal === 0 ? (
        <Spinner message="Waiting for the host to pick songs…" />
      ) : (
        <>
          <h1 className="font-serif text-2xl font-bold text-white">
            Downloading clips…
          </h1>
          <div className="h-3 w-full overflow-hidden rounded-full bg-navy-light">
            <div
              className="h-full bg-gradient-to-r from-team-red to-team-blue transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-white/60">
            {preloadDone} / {preloadTotal} ready
          </p>
        </>
      )}

      <div className="mt-2">
        <p className="mb-2 text-xs uppercase tracking-wide text-white/40">Players</p>
        <ul className="space-y-1.5 text-left">
          {players
            .filter((p) => p.connected)
            .map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-navy-card px-4 py-2 text-sm"
              >
                <span className="text-white">{p.name}</span>
                <span>{p.ready ? '✅ ready' : '⏳ loading…'}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
