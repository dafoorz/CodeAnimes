import { useQuizNetStore } from '../../../store/quizNetStore';
import QuizOnlineConnect from './QuizOnlineConnect';
import QuizLobby from './QuizLobby';
import QuizPreparing from './QuizPreparing';
import QuizMultiPlay from './QuizMultiPlay';
import QuizMultiEnd from './QuizMultiEnd';

export default function QuizOnlineRouter() {
  const screen = useQuizNetStore((s) => s.screen);

  if (screen === 'lobby') return <QuizLobby />;
  if (screen === 'preparing') return <QuizPreparing />;
  if (screen === 'play' || screen === 'reveal') return <QuizMultiPlay />;
  if (screen === 'end') return <QuizMultiEnd />;
  return <QuizOnlineConnect />;
}
