import { useState } from 'react';
import { useQuizNetStore } from '../../../store/quizNetStore';
import { useGameStore } from '../../../store/gameStore';
import {
  QUIZ_CLIP_MAX,
  QUIZ_CLIP_MIN,
  QUIZ_CLIP_STEP,
  QUIZ_SONG_OPTIONS,
} from '../../../data/config';

export default function QuizLobby() {
  const {
    roomCode,
    players,
    selfId,
    isHost,
    numSongs,
    clipSeconds,
    showVideo,
    setNumSongs,
    setClipSeconds,
    setShowVideo,
    hostStart,
    leave,
  } = useQuizNetStore();
  const goQuiz = useGameStore((s) => s.goQuiz);

  const [copied, setCopied] = useState(false);
  const connected = players.filter((p) => p.connected);

  const handleLeave = () => {
    leave();
    goQuiz();
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
        <h1 className="font-serif text-2xl font-bold text-white">Quiz Lobby</h1>
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
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Songs</p>
            <div className="grid grid-cols-4 gap-2">
              {QUIZ_SONG_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumSongs(n)}
                  className={`rounded-lg border-2 py-2 font-bold transition-all ${
                    numSongs === n
                      ? 'border-team-blue bg-team-blue/20 text-white'
                      : 'border-white/15 text-white/70 hover:border-white/40'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">Clip mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowVideo(true)}
                className={`rounded-lg border-2 py-2 font-bold transition-all ${
                  showVideo
                    ? 'border-team-blue bg-team-blue/20 text-white'
                    : 'border-white/15 text-white/70 hover:border-white/40'
                }`}
              >
                🎬 Video
              </button>
              <button
                onClick={() => setShowVideo(false)}
                className={`rounded-lg border-2 py-2 font-bold transition-all ${
                  !showVideo
                    ? 'border-team-blue bg-team-blue/20 text-white'
                    : 'border-white/15 text-white/70 hover:border-white/40'
                }`}
              >
                🎧 Audio only
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-white/50">Clip length</p>
              <span className="font-serif font-bold text-team-blue">
                {clipSeconds.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={QUIZ_CLIP_MIN}
              max={QUIZ_CLIP_MAX}
              step={QUIZ_CLIP_STEP}
              value={clipSeconds}
              onChange={(e) => setClipSeconds(Number(e.target.value))}
              className="w-full accent-team-blue"
            />
          </div>

          <button
            onClick={hostStart}
            disabled={connected.length < 1}
            className="w-full rounded-xl bg-gradient-to-r from-team-red to-team-blue py-3 font-bold text-white shadow-lg transition-transform enabled:hover:scale-105 disabled:opacity-40"
          >
            Start Quiz
          </button>
          <p className="text-center text-xs text-white/40">
            Everyone downloads the clips first, then rounds begin automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-navy-light p-5 text-center text-sm text-white/60">
          <p>
            {numSongs} songs · {showVideo ? 'video' : 'audio only'} ·{' '}
            {clipSeconds.toFixed(1)}s clips
          </p>
          <p className="mt-2">Waiting for the host to start…</p>
        </div>
      )}
    </div>
  );
}
