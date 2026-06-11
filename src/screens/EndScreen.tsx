import type { BoardController } from '../game/controller';
import Card from '../components/Card';
import { teamLabel, teamText } from '../components/colors';
import type { Team } from '../types';

export default function EndScreen({ controller }: { controller: BoardController }) {
  const ctrl = controller;
  const winner = ctrl.winner;
  const wonByAssassin = ctrl.lastResult === 'assassin';
  const isOnline = ctrl.roster !== undefined;

  const teamNames = (team: Team) =>
    (ctrl.roster ?? []).filter((r) => r.team === team);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center">
      <p className="font-serif text-lg tracking-widest text-white/40">
        勝利 · VICTORY
      </p>
      <h1 className="animate-pop-in font-serif text-4xl font-black sm:text-5xl">
        {winner ? (
          <span className={teamText(winner)}>{teamLabel(winner)} Team Wins!</span>
        ) : (
          'Game Over'
        )}
      </h1>

      <p className="mt-2 text-sm text-white/60">
        {wonByAssassin
          ? 'The opposing team revealed the ☠️ assassin — instant loss.'
          : `${winner ? teamLabel(winner) : ''} revealed all of their characters first.`}
      </p>

      {/* Scores + rosters */}
      <div className="mx-auto mt-5 flex max-w-md justify-center gap-10 text-sm">
        {(['red', 'blue'] as Team[]).map((team) => (
          <div key={team}>
            <p className={`font-serif text-3xl font-black ${teamText(team)}`}>
              {ctrl.scores[team]}
            </p>
            <p className="text-white/50">{teamLabel(team)} left</p>
            {isOnline && (
              <ul className="mt-1 space-y-0.5 text-xs text-white/70">
                {teamNames(team).map((p, i) => (
                  <li key={i} className={p.isSelf ? 'font-bold text-white' : ''}>
                    {p.role === 'spymaster' ? '🕵 ' : ''}
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Recap board with the full solution revealed */}
      <p className="mb-2 mt-7 text-xs uppercase tracking-wide text-white/40">
        Full board
      </p>
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
        {ctrl.cards.map((card, i) => (
          <div key={i} className="aspect-[3/4]">
            <Card card={card} showColors interactive={false} onReveal={() => {}} />
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col items-center gap-2">
        {ctrl.canRestart ? (
          <button
            onClick={ctrl.playAgain}
            className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            {ctrl.restartLabel}
          </button>
        ) : (
          <p className="rounded-xl border border-white/15 px-6 py-3 text-sm text-white/60">
            Waiting for the host to return everyone to the lobby…
          </p>
        )}
        {isOnline && ctrl.canRestart && (
          <p className="text-xs text-white/40">
            Back in the lobby everyone can switch teams before the next round.
          </p>
        )}
        <button
          onClick={ctrl.goHome}
          className="rounded-xl border border-white/20 px-8 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
