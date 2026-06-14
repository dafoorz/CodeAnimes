import type { GAnimeItem } from '../../types';

/** Renders a round prompt: a scene image for the anime. */
export default function GAnimeView({ item }: { item: GAnimeItem }) {
  return (
    <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/15 bg-black/40 sm:h-80">
      <img src={item.imageUrl} alt="anime scene" className="h-full w-full object-contain" />
    </div>
  );
}
