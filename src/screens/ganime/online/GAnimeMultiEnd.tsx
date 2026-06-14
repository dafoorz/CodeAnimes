import { useGAnimeNetStore } from '../../../store/ganimeNetStore';
import { useGAnimeStore } from '../../../store/ganimeStore';

export default function GAnimeMultiEnd() {
  const board = useGAnimeNetStore((s) => s.endLeaderboard);
  const isHost = useGAnimeNetStore((s) => s.isHost);
  const leave = useGAnimeNetStore((s) => s.leave);
  const goSetup = useGAnimeStore((s) => s.goSetup);
  const winner = board[0];

  const quit = () => {
    leave();
    goSetup();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-center">
      <p className="font-serif text-lg tracking-widest text-white/40">結果 · RESULTS</p>
      {winner && (
        <h1 className="animate-pop-in font-serif text-4xl font-black text-white">🏆 {winner.name} wins!</h1>
      )}
      <ul className="mx-auto mt-7 space-y-2">
        {board.map((row, i) => (
          <li
            key={i}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              i === 0 ? 'bg-amber-400/20 text-white' : row.isSelf ? 'bg-team-blue/20 text-white' : 'bg-navy-card text-white/80'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="font-serif text-lg font-black text-white/50">{i + 1}</span>
              <span className="font-medium">
                {row.name}
                {row.isSelf && <span className="text-white/40"> (you)</span>}
              </span>
            </span>
            <span className="font-serif text-xl font-black">{row.score}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center">
        <button
          onClick={quit}
          className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          {isHost ? 'New Game' : 'Leave'}
        </button>
      </div>
    </div>
  );
}
