import { useMultiplayerStore } from '../store/multiplayerStore';
import { useGameStore } from '../store/gameStore';
import { teamLabel } from '../components/colors';
import type { BoardController } from './controller';
import type { Card } from '../types';

const EMPTY: Card[] = [];

/** BoardController backed by the networked multiplayer store (host or client). */
export function useOnlineController(): BoardController {
  const view = useMultiplayerStore((s) => s.view);
  const you = useMultiplayerStore((s) => s.you);
  const submitClue = useMultiplayerStore((s) => s.submitClue);
  const revealCard = useMultiplayerStore((s) => s.revealCard);
  const endTurn = useMultiplayerStore((s) => s.endTurn);
  const playAgain = useMultiplayerStore((s) => s.playAgain);
  const leave = useMultiplayerStore((s) => s.leave);
  const goHome = useGameStore((s) => s.goHome);

  const currentTeam = view?.currentTeam ?? 'red';
  const guessesLeft = view?.guessesLeft ?? 0;
  const winner = view?.winner ?? null;
  const myTurn = you.team === currentTeam && !winner;
  const active = !winner;

  const canGuess = myTurn && you.role === 'operative' && guessesLeft > 0;
  const canClue =
    myTurn && you.role === 'spymaster' && guessesLeft === 0 && active;
  const canEndTurn = myTurn && you.role === 'operative' && guessesLeft > 0;

  let waitingText: string | null = null;
  if (!winner) {
    if (!myTurn) {
      waitingText = `${teamLabel(currentTeam)} team is playing…`;
    } else if (guessesLeft === 0 && you.role === 'operative') {
      waitingText = 'Waiting for your spymaster’s clue…';
    } else if (guessesLeft > 0 && you.role === 'spymaster') {
      waitingText = 'Your operatives are guessing…';
    }
  }

  return {
    cards: view?.cards ?? EMPTY,
    currentTeam,
    clue: view?.clue ?? '',
    clueNumber: view?.clueNumber ?? 0,
    guessesLeft,
    winner,
    scores: view?.scores ?? { red: 0, blue: 0 },
    playerTeam: you.team,
    playerRole: you.role,
    lastResult: view?.lastResult ?? null,

    showColors: you.role === 'spymaster',
    canPeek: false,
    spymasterView: false,

    canGuess,
    canClue,
    canEndTurn,
    waitingText,

    submitClue,
    revealCard,
    endTurn,
    togglePeek: () => {},
    playAgain,
    goHome: () => {
      leave();
      goHome();
    },
  };
}
