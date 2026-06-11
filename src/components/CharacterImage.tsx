import { useState } from 'react';
import { getInitials, initialsGradient } from './colors';

interface CharacterImageProps {
  src: string;
  name: string;
  className?: string;
  /** How the image fills its box. 'cover' crops to fill; 'contain' shows it whole. */
  fit?: 'cover' | 'contain';
}

/**
 * Character portrait that falls back to a styled initials tile if the image
 * fails to load (Jikan image URLs occasionally 404).
 */
export default function CharacterImage({
  src,
  name,
  className = '',
  fit = 'cover',
}: CharacterImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${initialsGradient(
          name
        )} ${className}`}
      >
        <span className="font-serif text-2xl font-bold text-white drop-shadow">
          {getInitials(name)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}
