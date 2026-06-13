import { useState } from 'react';
import { useCharNetStore } from '../../../store/charNetStore';
import { useCharStore } from '../../../store/charStore';
import Spinner from '../../../components/Spinner';

export default function CharConnect() {
  const hostRoom = useCharNetStore((s) => s.hostRoom);
  const joinRoom = useCharNetStore((s) => s.joinRoom);
  const connecting = useCharNetStore((s) => s.connecting);
  const error = useCharNetStore((s) => s.error);
  const clearError = useCharNetStore((s) => s.clearError);
  const leave = useCharNetStore((s) => s.leave);
  const goSetup = useCharStore((s) => s.goSetup);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');
  const trimmed = name.trim();

  const back = () => {
    leave();
    goSetup();
  };

  if (connecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner message="Connecting…" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <button onClick={back} className="self-start text-sm text-white/50 hover:text-white">
        ← Back
      </button>
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-white">Guess the Character · Online</h1>
        <p className="mt-2 text-sm text-white/60">Create a room and share the code, or join one.</p>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-white/50">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="e.g. Yuki"
          className="w-full rounded-lg border border-white/15 bg-navy-light px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-team-blue"
        />
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-team-red/40 bg-team-red/10 px-4 py-2 text-sm text-team-red">
          <span>{error}</span>
          <button onClick={clearError} className="font-semibold">✕</button>
        </div>
      )}

      {mode === 'choose' ? (
        <div className="flex flex-col gap-3">
          <button
            disabled={!trimmed}
            onClick={() => hostRoom(trimmed)}
            className="rounded-xl bg-gradient-to-r from-team-red to-team-blue py-4 text-lg font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            Create Room
          </button>
          <button
            disabled={!trimmed}
            onClick={() => setMode('join')}
            className="rounded-xl border border-white/20 py-4 text-lg font-semibold text-white/90 transition-colors enabled:hover:bg-white/10 disabled:opacity-40"
          >
            Join Room
          </button>
          {!trimmed && <p className="text-center text-xs text-white/40">Enter a name to continue.</p>}
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
            disabled={!code.trim() || !trimmed}
            onClick={() => joinRoom(code, trimmed)}
            className="rounded-xl bg-team-blue py-4 text-lg font-bold text-white transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            Join
          </button>
          <button onClick={() => setMode('choose')} className="text-sm text-white/50 hover:text-white">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
