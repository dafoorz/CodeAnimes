import { useState } from 'react';
import { useCharNetStore } from '../../../store/charNetStore';
import { useCharStore } from '../../../store/charStore';
import { useAnimeStore } from '../../../store/animeStore';
import AnimeSelectScreen from '../../AnimeSelectScreen';
import { CHALLENGES } from '../CharSetup';
import { CHAR_MAX_ROUNDS, CHAR_MIN_ROUNDS } from '../../../data/config';

export default function CharLobby() {
  const {
    roomCode,
    players,
    selfId,
    isHost,
    challenge,
    rounds,
    poolReady,
    poolSize,
    setChallenge,
    setRounds,
    hostSetPool,
    hostStart,
    leave,
  } = useCharNetStore();
  const goSetup = useCharStore((s) => s.goSetup);

  const [picking, setPicking] = useState(false);
  const [copied, setCopied] = useState(false);
  const connected = players.filter((p) => p.connected);
  const canStart = poolReady && connected.length >= 1;

  const handleLeave = () => {
    leave();
    goSetup();
  };

  const copyCode = () =>
    navigator.clipboard?.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });

  if (picking && isHost) {
    return (
      <AnimeSelectScreen
        onBack={() => setPicking(false)}
        onBuilt={() => {
          hostSetPool(useAnimeStore.getState().pool);
          setPicking(false);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={handleLeave} className="text-sm text-white/50 hover:text-white">
          ← Leave
        </button>
        <h1 className="font-serif text-2xl font-bold text-white">Character Lobby</h1>
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
        <p className="mt-1 text-xs text-white/40">
          {copied ? 'Copied!' : 'Share this code so friends can join.'}
        </p>
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
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Challenge</p>
            <div className="grid grid-cols-2 gap-2">
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChallenge(c.id)}
                  className={`rounded-lg border-2 px-3 py-2 text-left text-sm transition-all ${
                    challenge === c.id
                      ? 'border-team-blue bg-team-blue/15 text-white'
                      : 'border-white/15 text-white/70 hover:border-white/40'
                  }`}
                >
                  {c.icon} {c.label}
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
              min={CHAR_MIN_ROUNDS}
              max={CHAR_MAX_ROUNDS}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-team-blue"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">
              {poolReady ? `${poolSize} characters ready` : 'No animes selected yet'}
            </p>
            <button
              onClick={() => setPicking(true)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {poolReady ? 'Change animes' : 'Select animes'}
            </button>
          </div>

          <button
            onClick={hostStart}
            disabled={!canStart}
            className="w-full rounded-xl bg-gradient-to-r from-team-red to-team-blue py-3 font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            Start Game
          </button>
          {!poolReady && (
            <p className="text-center text-xs text-white/40">Select animes to build the pool first.</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-navy-light p-5 text-center text-sm text-white/60">
          <p>
            {CHALLENGES.find((c) => c.id === challenge)?.label} · {rounds} rounds
          </p>
          <p className="mt-2">Waiting for the host to start…</p>
        </div>
      )}
    </div>
  );
}
