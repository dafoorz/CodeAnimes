import { useEffect, useState } from 'react';
import type { AnimeOption } from '../types';
import { fetchCoverImage } from '../api/jikan';
import { initialsGradient } from './colors';

interface Props {
  anime: AnimeOption;
  selected: boolean;
  /** Disabled when the max selection is reached and this card isn't selected. */
  disabled?: boolean;
  onToggle: () => void;
}

/**
 * A toggleable anime tile showing its cover + title. For famous-list entries
 * (which ship without a cover URL) the cover is lazily fetched from Jikan and
 * cached; search results already include their cover.
 */
export default function SelectableAnimeCard({
  anime,
  selected,
  disabled,
  onToggle,
}: Props) {
  const [cover, setCover] = useState<string | undefined>(anime.coverImage);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!cover) {
      fetchCoverImage(anime.malId)
        .then((url) => {
          if (active && url) setCover(url);
        })
        .catch(() => {
          /* fall back to gradient */
        });
    }
    return () => {
      active = false;
    };
  }, [anime.malId, cover]);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`group relative aspect-[2/3] overflow-hidden rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-team-blue shadow-[0_0_16px_rgba(67,97,238,0.5)]'
          : 'border-white/10 hover:border-white/40'
      } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      {cover && !imgFailed ? (
        <img
          src={cover}
          alt={anime.title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br p-2 ${initialsGradient(
            anime.title
          )}`}
        >
          <span className="text-center font-serif text-sm font-bold text-white">
            {anime.title}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-6">
        <p className="truncate text-xs font-semibold text-white">
          {anime.title}
        </p>
        {anime.year ? (
          <p className="text-[0.65rem] text-white/60">{anime.year}</p>
        ) : null}
      </div>

      {selected && (
        <div className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-team-blue text-sm font-bold text-white shadow">
          ✓
        </div>
      )}
    </button>
  );
}
