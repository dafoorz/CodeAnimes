import { useState } from 'react';
import { useGameStore, selectScores, selectShowColors } from '../store/gameStore';
import Card from '../components/Card';
import { teamBg, teamLabel, teamText } from '../components/colors';

function ClueBar() {
  const {
    clue,
    clueNumber,
    guessesLeft,
    currentTeam,
    submitClue,
    endTurn,
  } = useGameStore();
  const [word, setWord] = useState('');
  const [num, setNum] = useState(1);

  const hasActiveClue = guessesLeft > 0;

  if (!hasActiveClue) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (word.trim()) {
            submitClue(word, num);
            setWord('');
            setNum(1);
          }
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className={`text-sm font-semibold ${teamText(currentTeam)}`}>
          {teamLabel(currentTeam)} Spymaster's clue:
        </span>
        <input
          value={word}
          onChange={(e) => setWord(e.target.value.replace(/\s/g, ''))}
          placeholder="one word"
          className="w-32 rounded-lg border border-white/15 bg-navy-light px-3 py-1.5 text-white outline-none focus:border-team-blue"
        />
        <select
          value={num}
          onChange={(e) => setNum(Number(e.target.value))}
          className="rounded-lg border border-white/15 bg-navy-light px-2 py-1.5 text-white outline-none focus:border-team-blue"
        >
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!word.trim()}
          className="rounded-lg bg-team-blue px-4 py-1.5 font-semibold text-white disabled:opacity-40"
        >
          Give Clue
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-lg bg-navy-light px-4 py-2">
        <span className="text-xs uppercase tracking-wide text-white/40">
          Clue
        </span>
        <p className="font-serif text-lg font-bold text-white">
          {clue} <span className={teamText(currentTeam)}>· {clueNumber}</span>
        </p>
      </div>
      <span className="text-sm text-white/70">
        Guesses left: <strong className="text-white">{guessesLeft}</strong>
      </span>
      <button
        onClick={endTurn}
        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        End Turn
      </button>
    </div>
  );
}

export default function GameBoard() {
  const cards = useGameStore((s) => s.cards);
  const currentTeam = useGameStore((s) => s.currentTeam);
  const guessesLeft = useGameStore((s) => s.guessesLeft);
  const winner = useGameStore((s) => s.winner);
  const playerRole = useGameStore((s) => s.playerRole);
  const playerTeam = useGameStore((s) => s.playerTeam);
  const spymasterView = useGameStore((s) => s.spymasterView);
  const toggleSpymasterView = useGameStore((s) => s.toggleSpymasterView);
  const revealCard = useGameStore((s) => s.revealCard);

  const scores = useGameStore(selectScores);
  const showColors = useGameStore(selectShowColors);
  const canGuess = guessesLeft > 0 && !winner;

  return (
    <div className="mx-auto max-w-4xl px-3 py-6">
      {/* Header: scores + turn */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <ScorePill team="red" remaining={scores.red} active={currentTeam === 'red'} />
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Now playing
          </p>
          <p className={`font-serif text-xl font-bold ${teamText(currentTeam)}`}>
            {teamLabel(currentTeam)}
          </p>
        </div>
        <ScorePill team="blue" remaining={scores.blue} active={currentTeam === 'blue'} />
      </div>

      {/* Player seat + spymaster toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-white/50">
          You:{' '}
          {playerTeam && (
            <span className={teamText(playerTeam)}>{teamLabel(playerTeam)}</span>
          )}{' '}
          {playerRole}
        </span>
        {playerRole === 'operative' && (
          <button
            onClick={toggleSpymasterView}
            className="rounded-lg border border-white/20 px-3 py-1.5 font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            {spymasterView ? '🙈 Hide colors' : '👁 Peek (Spymaster view)'}
          </button>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
        {cards.map((card, i) => (
          <Card
            key={i}
            card={card}
            showColors={showColors}
            interactive={canGuess}
            onReveal={() => revealCard(i)}
          />
        ))}
      </div>

      {/* Clue bar */}
      <div className="sticky bottom-0 mt-5 -mx-3 border-t border-white/10 bg-navy/95 px-3 py-4 backdrop-blur">
        <ClueBar />
      </div>
    </div>
  );
}

function ScorePill({
  team,
  remaining,
  active,
}: {
  team: 'red' | 'blue';
  remaining: number;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-white transition-all ${teamBg(
        team
      )} ${active ? 'scale-105 ring-2 ring-white/70' : 'opacity-70'}`}
    >
      <span className="text-sm font-semibold">{teamLabel(team)}</span>
      <span className="font-serif text-2xl font-black leading-none">
        {remaining}
      </span>
    </div>
  );
}
