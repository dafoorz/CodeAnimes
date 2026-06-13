import { useCharStore } from '../../store/charStore';
import { useCharNetStore } from '../../store/charNetStore';
import { useAnimeStore } from '../../store/animeStore';
import CharSetup from './CharSetup';
import CharPlay from './CharPlay';
import CharEnd from './CharEnd';
import CharOnlineRouter from './online/CharOnlineRouter';
import AnimeSelectScreen from '../AnimeSelectScreen';

export default function CharRouter() {
  const onlineActive = useCharNetStore((s) => s.active);
  const screen = useCharStore((s) => s.screen);
  const startSolo = useCharStore((s) => s.startSolo);
  const goSetup = useCharStore((s) => s.goSetup);

  if (onlineActive) return <CharOnlineRouter />;

  if (screen === 'select') {
    return (
      <AnimeSelectScreen
        onBack={goSetup}
        onBuilt={() => startSolo(useAnimeStore.getState().pool)}
      />
    );
  }
  if (screen === 'play') return <CharPlay />;
  if (screen === 'end') return <CharEnd />;
  return <CharSetup />;
}
