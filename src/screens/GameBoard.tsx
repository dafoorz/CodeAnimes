import { useState } from 'react';
import type { BoardController, RosterEntry } from '../game/controller';
import type { Team } from '../types';
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
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <span className={`text-sm font-semibold ${teamText(ctrl.currentTeam)}`}>
          {teamLabel(ctrl.currentTeam)} clue:
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
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-lg bg-navy-light px-4 py-1.5">
          <span className="text-[0.65rem] uppercase tracking-wide text-white/40">
            Clue
          </span>
          <p className="font-serif text-lg font-bold leading-tight text-white">
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
    <p className="text-center text-sm text-white/50">
      {ctrl.waitingText ?? 'Waiting for the spymaster…'}
    </p>
  );
}

/** Compact list of a team's players (online roster). */
function RosterList({ entries }: { entries: RosterEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-[0.6rem] italic text-white/30">no players</p>;
  }
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-0.5 text-[0.65rem] leading-tight">
      {entries.map((p, i) => (
        <li
          key={i}
          className={`${p.connected ? '' : 'text-white/30 line-through'} ${
            p.isSelf ? 'font-bold text-white' : 'text-white/80'
          }`}
          title={p.role ?? undefined}
        >
          {p.role === 'spymaster' ? '🕵 ' : ''}
          {p.name}
        </li>
      ))}
    </ul>
  );
}

/** A team's score pill plus its roster, on one side of the header. */
function TeamPanel({
  team,
  remaining,
  active,
  roster,
  align,
}: {
  team: Team;
  remaining: number;
  active: boolean;
  roster?: RosterEntry[];
  align: 'left' | 'right';
}) {
  const entries = roster?.filter((r) => r.team === team) ?? [];
  return (
    <div
      className={`flex flex-1 flex-col gap-1 ${
        align === 'right' ? 'items-end text-right' : 'items-start text-left'
      }`}
    >
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-white transition-all ${teamBg(
          team
        )} ${active ? 'scale-105 ring-2 ring-white/70' : 'opacity-70'}`}
      >
        <span className="text-xs font-semibold">{teamLabel(team)}</span>
        <span className="font-serif text-xl font-black leading-none">
          {remaining}
        </span>
      </div>
      {roster && (
        <div className={align === 'right' ? 'flex justify-end' : ''}>
          <RosterList entries={entries} />
        </div>
      )}
    </div>
  );
}

export default function GameBoard({ controller }: { controller: BoardController }) {
  const ctrl = controller;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden px-2 py-2 sm:px-3">
      {/* Header: team panels + turn/seat */}
      <div className="mx-auto flex w-full max-w-4xl shrink-0 items-start justify-between gap-2">
        <TeamPanel
          team="red"
          remaining={ctrl.scores.red}
          active={ctrl.currentTeam === 'red'}
          roster={ctrl.roster}
          align="left"
        />
        <div className="flex shrink-0 flex-col items-center gap-1 px-1">
          <p className="text-[0.6rem] uppercase tracking-widest text-white/40">
            Turn
          </p>
          <p className={`font-serif text-lg font-bold leading-none ${teamText(ctrl.currentTeam)}`}>
            {teamLabel(ctrl.currentTeam)}
          </p>
          {ctrl.playerTeam && (
            <p className="text-[0.6rem] text-white/50">
              you: <span className={teamText(ctrl.playerTeam)}>{ctrl.playerRole}</span>
            </p>
          )}
          {ctrl.canPeek && (
            <button
              onClick={ctrl.togglePeek}
              className="rounded-md border border-white/20 px-2 py-1 text-[0.65rem] font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              {ctrl.spymasterView ? '🙈 Hide' : '👁 Peek'}
            </button>
          )}
        </div>
        <TeamPanel
          team="blue"
          remaining={ctrl.scores.blue}
          active={ctrl.currentTeam === 'blue'}
          roster={ctrl.roster}
          align="right"
        />
      </div>

      {/* Board: a square grid sized to fit the remaining height */}
      <div className="flex min-h-0 flex-1 items-center justify-center py-2">
        <div className="grid aspect-square w-full max-w-[min(100%,calc(100dvh_-_13rem))] grid-cols-5 grid-rows-5 gap-1.5 sm:gap-2">
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
      </div>

      {/* Clue bar */}
      <div className="shrink-0 border-t border-white/10 pt-2">
        <ClueBar ctrl={ctrl} />
      </div>
    </div>
  );
}
