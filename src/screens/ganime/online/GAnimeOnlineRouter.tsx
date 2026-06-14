import { useGAnimeNetStore } from '../../../store/ganimeNetStore';
import GAnimeConnect from './GAnimeConnect';
import GAnimeLobby from './GAnimeLobby';
import GAnimeMultiPlay from './GAnimeMultiPlay';
import GAnimeMultiEnd from './GAnimeMultiEnd';

export default function GAnimeOnlineRouter() {
  const screen = useGAnimeNetStore((s) => s.screen);
  if (screen === 'lobby') return <GAnimeLobby />;
  if (screen === 'play' || screen === 'reveal') return <GAnimeMultiPlay />;
  if (screen === 'end') return <GAnimeMultiEnd />;
  return <GAnimeConnect />;
}
