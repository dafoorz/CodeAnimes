import { useCharStore } from '../../store/charStore';
import { useCharNetStore } from '../../store/charNetStore';
import { useGameStore } from '../../store/gameStore';
import { CHAR_MAX_ROUNDS, CHAR_MIN_ROUNDS } from '../../data/config';
import type { CharChallenge } from '../../types';

export const CHALLENGES: {
  id: CharChallenge;
  icon: string;
  label: string;
  desc: string;
}[] = [
  { id: 'eyes', icon: '👁', label: 'Eyes Only', desc: 'Just a sliver of the eyes.' },
  { id: 'silhouette', icon: '🌑', label: 'Silhouette', desc: 'Only the black outline.' },
  { id: 'zoom', icon: '🔍', label: 'Extreme Zoom', desc: 'Zoomed in — zoom out for fewer points.' },
  { id: 'blur', icon: '🌫', label: 'Progressive Blur', desc: 'Blurred — unblur for fewer points.' },
  { id: 'dialogue', icon: '💬', label: 'Dialogue', desc: 'Who said this famous line?' },
];

export default function CharSetup() {
  const challenge = useCharStore((s) => s.challenge);
  const setChallenge = useCharStore((s) => s.setChallenge);
  const rounds = useCharStore((s) => s.rounds);
  const setRounds = useCharStore((s) => s.setRounds);
  const goSelect = useCharStore((s) => s.goSelect);
  const startDialogue = useCharStore((s) => s.startDialogue);
  const enterOnline = useCharNetStore((s) => s.enter);
  const goMenu = useGameStore((s) => s.goMenu);

  // Dialogue uses bundled quotes (no anime selection); other modes pick animes.
  const playSolo = () => (challenge === 'dialogue' ? startDialogue() : goSelect());

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-7 px-6 py-12">
      <button onClick={goMenu} className="self-start text-sm text-white/50 hover:text-white">
        ← Menu
      </button>

      <div className="text-center">
        <p className="font-serif text-lg tracking-widest text-team-red">キャラ当て</p>
        <h1 className="font-serif text-4xl font-black text-white sm:text-5xl">
          Guess the <span className="text-team-blue">Character</span>
        </h1>
        <p className="mt-3 text-sm text-white/60">
          A disguised anime character appears — name them as fast as you can.
        </p>
      </div>

      <div>
        <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-white/50">
          Challenge
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => setChallenge(c.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                challenge === c.id
                  ? 'border-team-blue bg-team-blue/15'
                  : 'border-white/15 hover:border-white/40'
              }`}
            >
              <div className="text-2xl">{c.icon}</div>
              <p className="mt-1 font-bold text-white">{c.label}</p>
              <p className="text-xs text-white/60">{c.desc}</p>
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
          min={CHAR_MIN_ROUNDS}
          max={CHAR_MAX_ROUNDS}
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          className="w-full accent-team-blue"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={playSolo}
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
    </div>
  );
}
