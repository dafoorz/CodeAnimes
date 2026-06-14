import { useState } from 'react';
import { useGAnimeNetStore } from '../../../store/ganimeNetStore';
import { useGAnimeStore } from '../../../store/ganimeStore';
import { GA_MODES } from '../GAnimeSetup';
import { GA_MAX_ROUNDS, GA_MIN_ROUNDS } from '../../../data/config';
import Spinner from '../../../components/Spinner';

export default function GAnimeLobby() {
  const {
    roomCode,
    players,
    selfId,
    isHost,
    mode,
    rounds,
    preparing,
    setMode,
    setRounds,
    hostStart,
    leave,
  } = useGAnimeNetStore();
  const goSetup = useGAnimeStore((s) => s.goSetup);

  const [copied, setCopied] = useState(false);
  const connected = players.filter((p) => p.connected);
  const canStart = connected.length >= 1 && !preparing;

  const handleLeave = () => {
    leave();
    goSetup();
  };
  const copyCode = () =>
    navigator.clipboard?.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={handleLeave} className="text-sm text-white/50 hover:text-white">
          ← Leave
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">Anime Lobby</h1>
        <span className="w-12" />
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-navy-light p-5 text-center">
        <p className="text-xs uppercase tracking-wide text-white/40">Room code</p>
        <button
          onClick={copyCode}
          className="mt-1 font-serif text-4xl font-black tracking-[0.4em] text-white hover:text-team-blue"
        >
          {roomCode}
        </button>
        <p className="mt-1 text-xs text-white/40">{copied ? 'Copied!' : 'Share this code to invite friends.'}</p>
      </div>

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
          </li>
        ))}
      </ul>

      {isHost ? (
        <div className="space-y-5 rounded-2xl border border-white/10 bg-navy-light p-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              {GA_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-all ${
                    mode === m.id
                      ? 'border-team-blue bg-team-blue/15 text-white'
                      : 'border-white/15 text-white/70 hover:border-white/40'
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-white/50">Rounds</p>
              <span className="font-serif font-bold text-team-blue">{rounds}</span>
            </div>
            <input
              type="range"
              min={GA_MIN_ROUNDS}
              max={GA_MAX_ROUNDS}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-team-blue"
            />
          </div>

          <button
            onClick={hostStart}
            disabled={!canStart}
            className="w-full rounded-xl bg-gradient-to-r from-team-red to-team-blue py-3 font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            {preparing ? 'Loading images…' : 'Start Game'}
          </button>
          {preparing && <Spinner message="Gathering rounds…" />}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-navy-light p-5 text-center text-sm text-white/60">
          <p>
            {GA_MODES.find((m) => m.id === mode)?.label} · {rounds} rounds
          </p>
          <p className="mt-2">Waiting for the host to start…</p>
        </div>
      )}
    </div>
  );
}
