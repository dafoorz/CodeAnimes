import { useQuizStore } from '../../store/quizStore';
import Spinner from '../../components/Spinner';
import QuizSetup from './QuizSetup';
import QuizPlay from './QuizPlay';
import QuizEnd from './QuizEnd';

export default function QuizRouter() {
  const screen = useQuizStore((s) => s.screen);
  const loadingMessage = useQuizStore((s) => s.loadingMessage);

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
