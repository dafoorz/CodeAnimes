import { useQuizStore } from '../../store/quizStore';
import { useQuizNetStore } from '../../store/quizNetStore';
import Spinner from '../../components/Spinner';
import QuizSetup from './QuizSetup';
import QuizPlay from './QuizPlay';
import QuizEnd from './QuizEnd';
import QuizOnlineRouter from './online/QuizOnlineRouter';

export default function QuizRouter() {
  const screen = useQuizStore((s) => s.screen);
  const loadingMessage = useQuizStore((s) => s.loadingMessage);
  const onlineActive = useQuizNetStore((s) => s.active);

  // Online multiplayer flow takes over when a session is active.
  if (onlineActive) return <QuizOnlineRouter />;

  if (screen === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner message={loadingMessage || 'Tuning in…'} />
      </div>
    );
  }
  if (screen === 'play') return <QuizPlay />;
  if (screen === 'end') return <QuizEnd />;
  return <QuizSetup />;
}
