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
          backgroundSize: '300%',
          backgroundPosition: '50% 38%',
          backgroundRepeat: 'no-repeat',
        }}
        aria-label="A character's eyes"
      />
    );
  }

  if (challenge === 'silhouette') {
    // MAL images are opaque JPEGs, so `brightness(0)` would just blacken the
    // whole rectangle. Instead render the character's outline with an SVG
    // edge-detection filter — shows the shape/outline, hides colour & detail,
    // and works on any image (CSS/SVG filters don't taint cross-origin images).
    return (
      <div className={`${FRAME} flex items-center justify-center bg-black`}>
        <svg width="0" height="0" className="absolute">
          <filter id="char-edges" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"
            />
            <feConvolveMatrix
              order="3"
              preserveAlpha="true"
              kernelMatrix="1 1 1 1 -8 1 1 1 1"
            />
          </filter>
        </svg>
        <img
          src={imageUrl}
          alt="character outline"
          className="h-full w-full object-contain"
          style={{ filter: 'url(#char-edges) brightness(2.2) contrast(1.4)' }}
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
