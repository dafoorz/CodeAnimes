import { useState } from 'react';
import type { Role, Team } from '../types';
import { useGameStore } from '../store/gameStore';
import { useAnimeStore } from '../store/animeStore';
import { teamBg, teamLabel } from '../components/colors';

const TEAMS: Team[] = ['red', 'blue'];
const ROLES: { value: Role; label: string; blurb: string }[] = [
  {
    value: 'spymaster',
    label: 'Spymaster',
    blurb: 'See every card color and give clues.',
  },
  {
    value: 'operative',
    label: 'Operative',
    blurb: 'See only face-down cards and make guesses.',
  },
];

export default function RoleSelectScreen() {
  const goToSelect = useGameStore((s) => s.goToSelect);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const startGame = useGameStore((s) => s.startGame);
  const pool = useAnimeStore((s) => s.pool);

  const [team, setTeam] = useState<Team>('red');
  const [role, setRole] = useState<Role>('operative');

  const handleStart = () => {
    setPlayer(team, role);
    startGame(pool);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <button
        onClick={goToSelect}
        className="mb-8 self-start text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Change animes
      </button>

      <h1 className="mb-2 font-serif text-3xl font-bold text-white">
        Pick Your Seat
      </h1>
      <p className="mb-8 text-white/60">
        Board ready with {pool.length} characters. Choose a team and role.
      </p>

      {/* Team */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">
        Team
      </p>
      <div className="mb-8 grid grid-cols-2 gap-4">
        {TEAMS.map((t) => (
          <button
            key={t}
            onClick={() => setTeam(t)}
            className={`rounded-xl border-2 py-6 text-xl font-bold text-white transition-all ${teamBg(
              t
            )} ${
              team === t
                ? 'scale-105 border-white shadow-lg'
                : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            {teamLabel(t)} Team
          </button>
        ))}
      </div>

      {/* Role */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">
        Role
      </p>
      <div className="mb-10 grid grid-cols-2 gap-4">
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={`rounded-xl border-2 bg-navy-card p-5 text-left transition-all ${
              role === r.value
                ? 'border-team-blue shadow-lg'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <p className="text-lg font-bold text-white">{r.label}</p>
            <p className="mt-1 text-sm text-white/60">{r.blurb}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="rounded-xl bg-gradient-to-r from-team-red to-team-blue py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  );
}
