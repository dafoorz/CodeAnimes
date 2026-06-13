import { CHAR_BLUR_PX, CHAR_ZOOM_SIZES } from '../../data/config';
import type { CharChallenge } from '../../types';
import CharacterImage from '../CharacterImage';

interface Props {
  challenge: CharChallenge;
  imageUrl: string;
  name: string;
  /** Hint level (0-based) for zoom/blur. */
  level: number;
  /** Background position (percent) for the zoom crop. */
  crop: { x: number; y: number };
  /** Show the full, clear image (after answering/revealing). */
  revealed: boolean;
}

const FRAME = 'h-64 w-full overflow-hidden rounded-2xl border-2 border-white/15 sm:h-80';

/** Renders a character in its disguised form per the chosen challenge type. */
export default function ChallengeView({
  challenge,
  imageUrl,
  name,
  level,
  crop,
  revealed,
}: Props) {
  if (revealed) {
    return (
      <div className={`${FRAME} flex items-center justify-center bg-black/40`}>
        <CharacterImage src={imageUrl} name={name} fit="contain" className="h-full w-full" />
      </div>
    );
  }

  if (challenge === 'eyes') {
    return (
      <div
        className="mx-auto aspect-[16/6] w-full max-w-md rounded-2xl border-2 border-white/15 bg-black"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: '320%',
          backgroundPosition: '50% 22%',
          backgroundRepeat: 'no-repeat',
        }}
        aria-label="A character's eyes"
      />
    );
  }

  if (challenge === 'silhouette') {
    return (
      <div className={`${FRAME} flex items-center justify-center bg-white/85`}>
        <img
          src={imageUrl}
          alt="character silhouette"
          className="h-full w-full object-contain"
          style={{ filter: 'brightness(0)' }}
        />
      </div>
    );
  }

  if (challenge === 'zoom') {
    return (
      <div
        className={`${FRAME} bg-black`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${CHAR_ZOOM_SIZES[Math.min(level, CHAR_ZOOM_SIZES.length - 1)]}%`,
          backgroundPosition: `${crop.x}% ${crop.y}%`,
          backgroundRepeat: 'no-repeat',
        }}
        aria-label="A zoomed-in part of a character"
      />
    );
  }

  // blur
  return (
    <div className={`${FRAME} flex items-center justify-center bg-black/40`}>
      <img
        src={imageUrl}
        alt="blurred character"
        className="h-full w-full object-contain"
        style={{ filter: `blur(${CHAR_BLUR_PX[Math.min(level, CHAR_BLUR_PX.length - 1)]}px)` }}
      />
    </div>
  );
}
