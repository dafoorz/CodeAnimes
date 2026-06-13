import { useCharNetStore } from '../../../store/charNetStore';
import CharConnect from './CharConnect';
import CharLobby from './CharLobby';
import CharMultiPlay from './CharMultiPlay';
import CharMultiEnd from './CharMultiEnd';

export default function CharOnlineRouter() {
  const screen = useCharNetStore((s) => s.screen);
  if (screen === 'lobby') return <CharLobby />;
  if (screen === 'play' || screen === 'reveal') return <CharMultiPlay />;
  if (screen === 'end') return <CharMultiEnd />;
  return <CharConnect />;
}
