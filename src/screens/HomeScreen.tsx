import { useGameStore } from '../store/gameStore';
import { useAnimeStore } from '../store/animeStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useQuizStore } from '../store/quizStore';

export default function HomeScreen() {
  const goToSelect = useGameStore((s) => s.goToSelect);
  const goOnline = useGameStore((s) => s.goOnline);
  const goQuiz = useGameStore((s) => s.goQuiz);
  const resetAnime = useAnimeStore((s) => s.reset);
  const leaveOnline = useMultiplayerStore((s) => s.leave);
  const resetQuiz = useQuizStore((s) => s.reset);

  const handleNewGame = () => {
    resetAnime();
    goToSelect();
  };

  const handlePlayOnline = () => {
    resetAnime();
    leaveOnline();
    goOnline();
  };

  const handleQuiz = () => {
    resetQuiz();
    goQuiz();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="animate-fade-in">
        <p className="font-serif text-xl tracking-widest text-team-red">アニメ</p>
        <h1 className="font-serif text-5xl font-black leading-tight text-white sm:text-6xl">
          Anime <span className="text-team-blue">Code</span>
          <span className="text-team-red">names</span>
        </h1>
        <p className="mt-3 text-white/60">
          The classic word game — reimagined with anime characters from
          MyAnimeList.
        </p>
      </div>

      <div className="flex animate-pop-in flex-col items-center gap-3 sm:flex-row">
        <button
          onClick={handleNewGame}
          className="rounded-xl bg-gradient-to-r from-team-red to-team-blue px-10 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          New Game
          <span className="block text-xs font-normal text-white/70">
            Local · pass &amp; play
          </span>
        </button>
        <button
          onClick={handlePlayOnline}
          className="rounded-xl border border-white/25 bg-navy-light px-10 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
        >
          Play Online
          <span className="block text-xs font-normal text-white/60">
            Create or join a room
          </span>
        </button>
      </div>

      <button
        onClick={handleQuiz}
        className="-mt-2 flex animate-pop-in items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
      >
        🎵 Guess the Opening
        <span className="text-xs font-normal text-white/60">
          Name the anime from its OP
        </span>
      </button>

      <div className="mt-4 w-full animate-fade-in rounded-2xl border border-white/10 bg-navy-light/60 p-6 text-left text-sm text-white/70">
        <h2 className="mb-3 font-serif text-lg font-bold text-white">
          How to play
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Two teams — Red and Blue — race to identify their characters.</li>
          <li>
            Each team's <strong className="text-white">Spymaster</strong> sees
            every card's color and gives a one-word clue plus a number.
          </li>
          <li>
            <strong className="text-white">Operatives</strong> tap the
            characters they think belong to their team. A correct guess lets
            them keep going.
          </li>
          <li>
            Guess a neutral or the enemy's card and your turn ends. Reveal the{' '}
            <span className="text-white">☠️ assassin</span> and you lose
            instantly.
          </li>
          <li>First team to reveal all of its characters wins.</li>
        </ul>
      </div>
    </div>
  );
}
