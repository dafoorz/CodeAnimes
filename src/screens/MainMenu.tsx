import { useGameStore } from '../store/gameStore';
import { useAnimeStore } from '../store/animeStore';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useQuizStore } from '../store/quizStore';
import { useCharStore } from '../store/charStore';
import { useCharNetStore } from '../store/charNetStore';

export default function MainMenu() {
  const goHome = useGameStore((s) => s.goHome);
  const goQuiz = useGameStore((s) => s.goQuiz);
  const goChar = useGameStore((s) => s.goChar);
  const resetAnime = useAnimeStore((s) => s.reset);
  const leaveOnline = useMultiplayerStore((s) => s.leave);
  const resetQuiz = useQuizStore((s) => s.reset);
  const resetChar = useCharStore((s) => s.reset);
  const leaveCharNet = useCharNetStore((s) => s.leave);

  const openCodenames = () => {
    resetAnime();
    leaveOnline();
    goHome();
  };

  const openQuiz = () => {
    resetQuiz();
    goQuiz();
  };

  const openChar = () => {
    resetAnime();
    resetChar();
    leaveCharNet();
    goChar();
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-center gap-10 px-6 py-12">
      <div className="animate-fade-in text-center">
        <p className="font-serif text-xl tracking-[0.3em] text-team-red">アニメ ゲーム</p>
        <h1 className="font-serif text-5xl font-black leading-tight text-white sm:text-6xl">
          Anime <span className="text-team-blue">Game</span> Hub
        </h1>
        <p className="mt-3 text-white/60">Pick a game to play.</p>
      </div>

      <div className="grid w-full animate-pop-in gap-5 sm:grid-cols-3">
        {/* Codenames */}
        <button
          onClick={openCodenames}
          className="group flex flex-col items-center gap-3 rounded-3xl border-2 border-white/10 bg-gradient-to-br from-team-red/20 to-team-blue/20 p-8 text-center transition-all hover:scale-[1.03] hover:border-white/40"
        >
          <div className="grid grid-cols-3 gap-1">
            {['bg-team-red', 'bg-team-blue', 'bg-white', 'bg-team-blue', 'bg-black', 'bg-team-red', 'bg-white', 'bg-team-red', 'bg-team-blue'].map(
              (c, i) => (
                <span key={i} className={`h-4 w-4 rounded-sm ${c}`} />
              )
            )}
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Anime Codenames</h2>
          <p className="text-sm text-white/60">
            The 5×5 spy word game with anime characters. Local pass-and-play or
            online multiplayer.
          </p>
          <span className="mt-1 text-sm font-semibold text-team-blue group-hover:underline">
            Play →
          </span>
        </button>

        {/* Guess the Opening */}
        <button
          onClick={openQuiz}
          className="group flex flex-col items-center gap-3 rounded-3xl border-2 border-white/10 bg-gradient-to-br from-amber-400/20 to-team-red/20 p-8 text-center transition-all hover:scale-[1.03] hover:border-white/40"
        >
          <div className="text-5xl">🎵</div>
          <h2 className="font-serif text-2xl font-bold text-white">Guess the Opening</h2>
          <p className="text-sm text-white/60">
            A clip of an anime opening plays — name it as fast as you can. Pick
            video or audio-only, clip length, and round size.
          </p>
          <span className="mt-1 text-sm font-semibold text-amber-400 group-hover:underline">
            Play →
          </span>
        </button>

        {/* Guess the Character */}
        <button
          onClick={openChar}
          className="group flex flex-col items-center gap-3 rounded-3xl border-2 border-white/10 bg-gradient-to-br from-team-blue/20 to-team-red/20 p-8 text-center transition-all hover:scale-[1.03] hover:border-white/40"
        >
          <div className="text-5xl">🕵</div>
          <h2 className="font-serif text-2xl font-bold text-white">Guess the Character</h2>
          <p className="text-sm text-white/60">
            Name the disguised anime character — eyes only, silhouette, extreme
            zoom, or blur. Solo or online.
          </p>
          <span className="mt-1 text-sm font-semibold text-team-blue group-hover:underline">
            Play →
          </span>
        </button>
      </div>
    </div>
  );
}
