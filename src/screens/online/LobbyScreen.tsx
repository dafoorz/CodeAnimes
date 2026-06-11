import { useState } from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameStore } from '../../store/gameStore';
import { useAnimeStore } from '../../store/animeStore';
import AnimeSelectScreen from '../AnimeSelectScreen';
import { teamBg, teamLabel, teamText } from '../../components/colors';
import type { Role, Team } from '../../types';

const TEAMS: Team[] = ['red', 'blue'];
const ROLES: Role[] = ['spymaster', 'operative'];

export default function LobbyScreen() {
  const {
    roomCode,
    players,
    selfId,
    isHost,
    you,
    poolReady,
    poolSize,
    selectedCount,
    setSeat,
    hostSetPool,
    hostStartGame,
    leave,
  } = useMultiplayerStore();
  const goHome = useGameStore((s) => s.goHome);

  const [picking, setPicking] = useState(false);
  const [copied, setCopied] = useState(false);

  const connected = players.filter((p) => p.connected);
  const teamHas = (t: Team) => connected.some((p) => p.team === t);
  const bothTeamsFilled = teamHas('red') && teamHas('blue');
  const canStart = poolReady && bothTeamsFilled && connected.length >= 2;

  const handleLeave = () => {
    leave();
    goHome();
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  if (picking && isHost) {
    return (
      <AnimeSelectScreen
        onBack={() => setPicking(false)}
        onBuilt={(_size, count) => {
          hostSetPool(useAnimeStore.getState().pool, count);
          setPicking(false);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          ← Leave
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">Lobby</h1>
        <span className="w-12" />
      </div>

      {/* Room code */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-navy-light p-5 text-center">
        <p className="text-xs uppercase tracking-wide text-white/40">Room code</p>
        <button
          onClick={copyCode}
          className="mt-1 font-serif text-4xl font-black tracking-[0.4em] text-white transition-colors hover:text-team-blue"
          title="Click to copy"
        >
          {roomCode}
        </button>
        <p className="mt-1 text-xs text-white/40">
          {copied ? 'Copied!' : 'Share this code so friends can join.'}
        </p>
      </div>

      {/* Players */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">
        Players ({connected.length})
      </p>
      <ul className="mb-6 space-y-2">
        {players.map((p) => (
          <li
            key={p.id}
            className={`flex items-center justify-between rounded-lg bg-navy-card px-4 py-2.5 ${
              p.connected ? '' : 'opacity-40'
            }`}
          >
            <span className="font-medium text-white">
              {p.name}
              {p.id === selfId && <span className="text-white/40"> (you)</span>}
              {p.isHost && <span className="ml-1 text-xs text-white/40">★ host</span>}
            </span>
            <span className="text-sm">
              {p.team ? (
                <span className={teamText(p.team)}>
                  {teamLabel(p.team)} · {p.role ?? 'no role'}
                </span>
              ) : (
                <span className="text-white/30">choosing…</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Seat picker */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">
        Your seat
      </p>
      <div className="mb-3 grid grid-cols-2 gap-3">
        {TEAMS.map((t) => (
          <button
            key={t}
            onClick={() => setSeat(t, you.role)}
            className={`rounded-lg py-3 font-bold text-white transition-all ${teamBg(
              t
            )} ${
              you.team === t
                ? 'scale-105 ring-2 ring-white'
                : 'opacity-60 hover:opacity-90'
            }`}
          >
            {teamLabel(t)}
          </button>
        ))}
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setSeat(you.team, r)}
            className={`rounded-lg border-2 py-3 font-semibold capitalize transition-all ${
              you.role === r
                ? 'border-team-blue text-white'
                : 'border-white/15 text-white/70 hover:border-white/40'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Host controls */}
      {isHost ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-navy-light p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Board</p>
              <p className="text-sm text-white/50">
                {poolReady
                  ? `${selectedCount} animes · ${poolSize} characters ready`
                  : 'No animes selected yet'}
              </p>
            </div>
            <button
              onClick={() => setPicking(true)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {poolReady ? 'Change animes' : 'Select animes'}
            </button>
          </div>

          <button
            onClick={hostStartGame}
            disabled={!canStart}
            className="w-full rounded-xl bg-gradient-to-r from-team-red to-team-blue py-3 font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Game
          </button>
          {!canStart && (
            <p className="text-center text-xs text-white/50">
              {!poolReady
                ? 'Select animes and build the board first.'
                : !bothTeamsFilled
                  ? 'Each team needs at least one player.'
                  : 'Need at least 2 players.'}
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-white/50">
          Waiting for the host to start the game…
        </p>
      )}
    </div>
  );
}
