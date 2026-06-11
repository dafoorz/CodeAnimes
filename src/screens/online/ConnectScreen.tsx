import { useState } from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameStore } from '../../store/gameStore';
import Spinner from '../../components/Spinner';

export default function ConnectScreen() {
  const hostRoom = useMultiplayerStore((s) => s.hostRoom);
  const joinRoom = useMultiplayerStore((s) => s.joinRoom);
  const connecting = useMultiplayerStore((s) => s.connecting);
  const error = useMultiplayerStore((s) => s.error);
  const clearError = useMultiplayerStore((s) => s.clearError);
  const goHome = useGameStore((s) => s.goHome);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');

  const trimmedName = name.trim();

  if (connecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner message="Connecting…" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <button
        onClick={goHome}
        className="self-start text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Home
      </button>

      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-white">Play Online</h1>
        <p className="mt-2 text-sm text-white/60">
          Create a room and share the code, or join a friend's room.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-white/50">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="e.g. Sakura"
          className="w-full rounded-lg border border-white/15 bg-navy-light px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-team-blue"
        />
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-sm text-team-red">
          <span>{error}</span>
          <button onClick={clearError} className="font-semibold">
            ✕
          </button>
        </div>
      )}

      {mode === 'choose' ? (
        <div className="flex flex-col gap-3">
          <button
            disabled={!trimmedName}
            onClick={() => hostRoom(trimmedName)}
            className="rounded-xl bg-gradient-to-r from-team-red to-team-blue py-4 text-lg font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            Create Room
          </button>
          <button
            disabled={!trimmedName}
            onClick={() => setMode('join')}
            className="rounded-xl border border-white/20 py-4 text-lg font-semibold text-white/90 transition-colors enabled:hover:bg-white/10 disabled:opacity-40"
          >
            Join Room
          </button>
          {!trimmedName && (
            <p className="text-center text-xs text-white/40">
              Enter a name to continue.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ROOM CODE"
            className="w-full rounded-lg border border-white/15 bg-navy-light px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-white placeholder-white/30 outline-none focus:border-team-blue"
          />
          <button
            disabled={!code.trim() || !trimmedName}
            onClick={() => joinRoom(code, trimmedName)}
            className="rounded-xl bg-team-blue py-4 text-lg font-bold text-white transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            Join
          </button>
          <button
            onClick={() => setMode('choose')}
            className="text-sm text-white/50 transition-colors hover:text-white"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
