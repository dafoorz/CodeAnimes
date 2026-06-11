import type { Card as CardModel } from '../types';
import CharacterImage from './CharacterImage';
import { revealedClasses, spymasterTintClasses } from './colors';

interface CardProps {
  card: CardModel;
  /** Show the assigned color (spymaster or peek view). */
  showColors: boolean;
  /** True when the card can be tapped to guess. */
  interactive: boolean;
  onReveal: () => void;
}

function CharacterContent({ card }: { card: CardModel }) {
  const { character } = card;
  return (
    <>
      <CharacterImage
        src={character.imageUrl}
        name={character.name}
        className="h-full w-full"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-1.5 pb-1.5 pt-5 text-center">
        <p className="truncate text-[0.7rem] font-bold leading-tight text-white sm:text-sm">
          {character.name}
        </p>
        <p className="truncate text-[0.6rem] leading-tight text-white/70 sm:text-xs">
          {character.anime}
        </p>
      </div>
    </>
  );
}

/** A single board card with a 3D flip reveal animation. */
export default function Card({
  card,
  showColors,
  interactive,
  onReveal,
}: CardProps) {
  const { isRevealed, assignedColor } = card;
  const isAssassin = assignedColor === 'assassin';

  const handleClick = () => {
    if (interactive && !isRevealed) onReveal();
  };

  return (
    <div className="perspective h-full w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={!interactive || isRevealed}
        aria-label={`${card.character.name} from ${card.character.anime}`}
        className={`preserve-3d relative h-full w-full rounded-lg transition-transform duration-500 ${
          isRevealed ? 'rotate-y-180' : ''
        } ${
          interactive && !isRevealed
            ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(67,97,238,0.55)]'
            : 'cursor-default'
        }`}
      >
        {/* Face-down face */}
        <div
          className={`backface-hidden absolute inset-0 overflow-hidden rounded-lg shadow-md ${
            showColors
              ? spymasterTintClasses(assignedColor)
              : 'border-2 border-white/25 bg-navy-card'
          }`}
        >
          <CharacterContent card={card} />
          {showColors && isAssassin && (
            <div className="absolute right-1 top-1 text-lg">☠️</div>
          )}
        </div>

        {/* Revealed face */}
        <div
          className={`backface-hidden rotate-y-180 absolute inset-0 overflow-hidden rounded-lg shadow-lg ${revealedClasses(
            assignedColor
          )}`}
        >
          <div className={isAssassin ? 'opacity-40' : 'opacity-90'}>
            <CharacterContent card={card} />
          </div>
          {isAssassin && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="text-4xl sm:text-5xl">☠️</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
