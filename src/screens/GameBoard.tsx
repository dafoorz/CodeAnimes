import { useState } from 'react';
import type { BoardController } from '../game/controller';
import Card from '../components/Card';
import { teamBg, teamLabel, teamText } from '../components/colors';

function ClueBar({ ctrl }: { ctrl: BoardController }) {
  const [word, setWord] = useState('');
  const [num, setNum] = useState(1);

  const hasActiveClue = ctrl.guessesLeft > 0;

  if (!hasActiveClue && ctrl.canClue) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (word.trim()) {
            ctrl.submitClue(word, num);
            setWord('');
            setNum(1);
          }
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className={`text-sm font-semibold ${teamText(ctrl.currentTeam)}`}>
          {teamLabel(ctrl.currentTeam)} Spymaster's clue:
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

  if (hasActiveClue) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-lg bg-navy-light px-4 py-2">
          <span className="text-xs uppercase tracking-wide text-white/40">
            Clue
          </span>
          <p className="font-serif text-lg font-bold text-white">
            {ctrl.clue}{' '}
            <span className={teamText(ctrl.currentTeam)}>· {ctrl.clueNumber}</span>
          </p>
        </div>
        <span className="text-sm text-white/70">
          Guesses left: <strong className="text-white">{ctrl.guessesLeft}</strong>
        </span>
        {ctrl.canEndTurn && (
          <button
            onClick={ctrl.endTurn}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            End Turn
          </button>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-white/50">
      {ctrl.waitingText ?? 'Waiting for the spymaster…'}
    </p>
  );
}

export default function GameBoard({ controller }: { controller: BoardController }) {
  const ctrl = controller;

  return (
    <div className="mx-auto max-w-4xl px-3 py-6">
      {/* Header: scores + turn */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <ScorePill
          team="red"
          remaining={ctrl.scores.red}
          active={ctrl.currentTeam === 'red'}
        />
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Now playing
          </p>
          <p className={`font-serif text-xl font-bold ${teamText(ctrl.currentTeam)}`}>
            {teamLabel(ctrl.currentTeam)}
          </p>
        </div>
        <ScorePill
          team="blue"
          remaining={ctrl.scores.blue}
          active={ctrl.currentTeam === 'blue'}
        />
      </div>

      {/* Player seat + spymaster toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-white/50">
          You:{' '}
          {ctrl.playerTeam && (
            <span className={teamText(ctrl.playerTeam)}>
              {teamLabel(ctrl.playerTeam)}
            </span>
          )}{' '}
          {ctrl.playerRole}
        </span>
        {ctrl.canPeek && (
          <button
            onClick={ctrl.togglePeek}
            className="rounded-lg border border-white/20 px-3 py-1.5 font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            {ctrl.spymasterView ? '🙈 Hide colors' : '👁 Peek (Spymaster view)'}
          </button>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
        {ctrl.cards.map((card, i) => (
          <Card
            key={i}
            card={card}
            showColors={ctrl.showColors}
            interactive={ctrl.canGuess}
            onReveal={() => ctrl.revealCard(i)}
          />
        ))}
      </div>

      {/* Clue bar */}
      <div className="sticky bottom-0 mt-5 -mx-3 border-t border-white/10 bg-navy/95 px-3 py-4 backdrop-blur">
        <ClueBar ctrl={ctrl} />
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
