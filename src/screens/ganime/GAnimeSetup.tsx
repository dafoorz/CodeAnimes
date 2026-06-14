import { useGAnimeStore } from '../../store/ganimeStore';
import { useGAnimeNetStore } from '../../store/ganimeNetStore';
import { useGameStore } from '../../store/gameStore';
import { GA_MAX_ROUNDS, GA_MIN_ROUNDS } from '../../data/config';
import type { GAnimeMode } from '../../types';

export const GA_MODES: { id: GAnimeMode; icon: string; label: string; desc: string }[] = [
  { id: 'background', icon: '🌄', label: 'Background only', desc: 'A scenery shot, no characters.' },
  { id: 'attack', icon: '⚔️', label: 'Attack effect', desc: 'A glowing power / effect.' },
  { id: 'food', icon: '🍜', label: 'Food scene', desc: 'Guess from the food.' },
];

export default function GAnimeSetup() {
  const mode = useGAnimeStore((s) => s.mode);
  const setMode = useGAnimeStore((s) => s.setMode);
  const rounds = useGAnimeStore((s) => s.rounds);
  const setRounds = useGAnimeStore((s) => s.setRounds);
  const startSolo = useGAnimeStore((s) => s.startSolo);
  const error = useGAnimeStore((s) => s.error);
  const enterOnline = useGAnimeNetStore((s) => s.enter);
  const goMenu = useGameStore((s) => s.goMenu);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-7 px-6 py-12">
      <button onClick={goMenu} className="self-start text-sm text-white/50 hover:text-white">
        ← Menu
      </button>

      <div className="text-center">
        <p className="font-serif text-lg tracking-widest text-team-red">どのアニメ？</p>
        <h1 className="font-serif text-4xl font-black text-white sm:text-5xl">
          Guess the <span className="text-team-blue">Anime</span>
        </h1>
        <p className="mt-3 text-sm text-white/60">Name the anime from a clue — no titles given.</p>
      </div>

      <div>
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-white/50">
          Mode
        </p>
        <div className="grid grid-cols-2 gap-3">
          {GA_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                mode === m.id
                  ? 'border-team-blue bg-team-blue/15'
                  : 'border-white/15 hover:border-white/40'
              }`}
            >
              <div className="text-2xl">{m.icon}</div>
              <p className="mt-1 font-bold text-white">{m.label}</p>
              <p className="text-xs text-white/60">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/50">Rounds</p>
          <span className="font-serif text-lg font-bold text-team-blue">{rounds}</span>
        </div>
        <input
          type="range"
          min={GA_MIN_ROUNDS}
          max={GA_MAX_ROUNDS}
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          className="w-full accent-team-blue"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-center text-sm text-team-red">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={startSolo}
          className="flex-1 rounded-xl bg-gradient-to-r from-team-red to-team-blue py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          ▶ Play Solo
        </button>
        <button
          onClick={enterOnline}
          className="flex-1 rounded-xl border border-white/25 bg-navy-light py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          🌐 Play Online
        </button>
      </div>
      <p className="text-center text-xs text-white/30">
        Dialogue uses bundled quotes; image modes pull safe (rating:g) themed
        images from Danbooru.
      </p>
    </div>
  );
}
