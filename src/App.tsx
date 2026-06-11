import { useGameStore } from './store/gameStore';
import { useMultiplayerStore } from './store/multiplayerStore';
import { useLocalController } from './game/useLocalController';
import { useOnlineController } from './game/useOnlineController';
import HomeScreen from './screens/HomeScreen';
import AnimeSelectScreen from './screens/AnimeSelectScreen';
import RoleSelectScreen from './screens/RoleSelectScreen';
import GameBoard from './screens/GameBoard';
import EndScreen from './screens/EndScreen';
import ConnectScreen from './screens/online/ConnectScreen';
import LobbyScreen from './screens/online/LobbyScreen';
import Spinner from './components/Spinner';

/** Local (single-device) game + end screens, bound to the local controller. */
function LocalGame() {
  return <GameBoard controller={useLocalController()} />;
}
function LocalEnd() {
  return <EndScreen controller={useLocalController()} />;
}

/** Online flow router, driven by the multiplayer store's screen. */
function OnlineRouter() {
  const screen = useMultiplayerStore((s) => s.screen);
  const active = useMultiplayerStore((s) => s.active);
  const controller = useOnlineController();

  if (!active) return <ConnectScreen />;
  // Connected to the host but the first lobby snapshot hasn't arrived yet.
  if (screen === 'connect')
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner message="Joining room…" />
      </div>
    );
  if (screen === 'lobby') return <LobbyScreen />;
  if (screen === 'end')
    return <EndScreen controller={controller} playAgainLabel="Back to Lobby" />;
  return <GameBoard controller={controller} />;
}

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="min-h-screen bg-navy text-white">
      {phase === 'home' && <HomeScreen />}
      {phase === 'select' && <AnimeSelectScreen />}
      {phase === 'role' && <RoleSelectScreen />}
      {phase === 'game' && <LocalGame />}
      {phase === 'end' && <LocalEnd />}
      {phase === 'online' && <OnlineRouter />}
    </div>
  );
}
