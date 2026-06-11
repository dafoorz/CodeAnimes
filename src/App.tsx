import { useGameStore } from './store/gameStore';
import HomeScreen from './screens/HomeScreen';
import AnimeSelectScreen from './screens/AnimeSelectScreen';
import RoleSelectScreen from './screens/RoleSelectScreen';
import GameBoard from './screens/GameBoard';
import EndScreen from './screens/EndScreen';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="min-h-screen bg-navy text-white">
      {phase === 'home' && <HomeScreen />}
      {phase === 'select' && <AnimeSelectScreen />}
      {phase === 'role' && <RoleSelectScreen />}
      {phase === 'game' && <GameBoard />}
      {phase === 'end' && <EndScreen />}
    </div>
  );
}
