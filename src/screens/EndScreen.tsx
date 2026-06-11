import type { BoardController } from '../game/controller';
import Card from '../components/Card';
import { teamLabel, teamText } from '../components/colors';

export default function EndScreen({
  controller,
  playAgainLabel = 'Play Again',
}: {
  controller: BoardController;
  playAgainLabel?: string;
}) {
  const ctrl = controller;
  const winner = ctrl.winner;
  const wonByAssassin = ctrl.lastResult === 'assassin';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-center">
      <p className="font-serif text-lg tracking-widest text-white/40">
        勝利 · VICTORY
      </p>
      <h1 className="animate-pop-in font-serif text-5xl font-black sm:text-6xl">
        {winner ? (
          <span className={teamText(winner)}>{teamLabel(winner)} Team Wins!</span>
        ) : (
          'Game Over'
        )}
      </h1>

      <p className="mt-3 text-white/60">
        {wonByAssassin
          ? 'The opposing team revealed the ☠️ assassin — instant loss.'
          : `${winner ? teamLabel(winner) : ''} revealed all of their characters first.`}
      </p>

      <div className="mx-auto mt-6 flex max-w-xs justify-center gap-8 text-sm">
        <div>
          <p className={`font-serif text-3xl font-black ${teamText('red')}`}>
            {ctrl.scores.red}
          </p>
          <p className="text-white/50">Red left</p>
        </div>
        <div>
          <p className={`font-serif text-3xl font-black ${teamText('blue')}`}>
            {ctrl.scores.blue}
          </p>
          <p className="text-white/50">Blue left</p>
        </div>
      </div>

      {/* Recap board with the full solution revealed */}
      <p className="mb-3 mt-8 text-xs uppercase tracking-wide text-white/40">
        Full board
      </p>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {ctrl.cards.map((card, i) => (
          <Card key={i} card={card} showColors interactive={false} onReveal={() => {}} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={ctrl.playAgain}
          className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          {playAgainLabel}
        </button>
        <button
          onClick={ctrl.goHome}
          className="rounded-xl border border-white/20 px-8 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          Home
        </button>
      </div>
    </div>
  );
}
