import {
  useGameStore,
  selectScores,
  selectShowColors,
} from '../store/gameStore';
import type { BoardController } from './controller';

/** BoardController backed by the single-device (hotseat) game store. */
export function useLocalController(): BoardController {
  const s = useGameStore();
  const scores = selectScores(s);
  const showColors = selectShowColors(s);
  const active = !s.winner;

  return {
    cards: s.cards,
    currentTeam: s.currentTeam,
    clue: s.clue,
    clueNumber: s.clueNumber,
    guessesLeft: s.guessesLeft,
    winner: s.winner,
    scores,
    playerTeam: s.playerTeam,
    playerRole: s.playerRole,
    lastResult: s.lastResult,

    showColors,
    canPeek: s.playerRole === 'operative',
    spymasterView: s.spymasterView,

    canGuess: s.guessesLeft > 0 && active,
    canClue: s.guessesLeft === 0 && active,
    canEndTurn: s.guessesLeft > 0 && active,
    waitingText: null,

    submitClue: s.submitClue,
    revealCard: s.revealCard,
    endTurn: s.endTurn,
    togglePeek: s.toggleSpymasterView,
    playAgain: s.resetGame,
    goHome: s.goHome,
  };
}
