import { useGAnimeStore } from '../../store/ganimeStore';
import { useGAnimeNetStore } from '../../store/ganimeNetStore';
import Spinner from '../../components/Spinner';
import GAnimeSetup from './GAnimeSetup';
import GAnimePlay from './GAnimePlay';
import GAnimeEnd from './GAnimeEnd';
import GAnimeOnlineRouter from './online/GAnimeOnlineRouter';

export default function GAnimeRouter() {
  const onlineActive = useGAnimeNetStore((s) => s.active);
  const screen = useGAnimeStore((s) => s.screen);
  const loadingMessage = useGAnimeStore((s) => s.loadingMessage);

  if (onlineActive) return <GAnimeOnlineRouter />;
  if (screen === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner message={loadingMessage || 'Gathering rounds…'} />
      </div>
    );
  }
  if (screen === 'play') return <GAnimePlay />;
  if (screen === 'end') return <GAnimeEnd />;
  return <GAnimeSetup />;
}
