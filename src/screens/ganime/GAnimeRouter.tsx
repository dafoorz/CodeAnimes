import { useGAnimeStore } from '../../store/ganimeStore';
import { useGAnimeNetStore } from '../../store/ganimeNetStore';
import GAnimeSetup from './GAnimeSetup';
import GAnimePlay from './GAnimePlay';
import GAnimeEnd from './GAnimeEnd';
import GAnimeOnlineRouter from './online/GAnimeOnlineRouter';

export default function GAnimeRouter() {
  const onlineActive = useGAnimeNetStore((s) => s.active);
  const screen = useGAnimeStore((s) => s.screen);

  if (onlineActive) return <GAnimeOnlineRouter />;
  if (screen === 'play') return <GAnimePlay />;
  if (screen === 'end') return <GAnimeEnd />;
  return <GAnimeSetup />;
}
