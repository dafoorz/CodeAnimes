import type { GAnimeItem } from '../../types';

/** Renders a round prompt: a quote card (dialogue) or a scene image. */
export default function GAnimeView({ item }: { item: GAnimeItem }) {
  if (item.mode === 'dialogue') {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border-2 border-white/15 bg-navy-light p-6 sm:min-h-[16rem]">
        <p className="text-center font-serif text-2xl font-bold leading-snug text-white sm:text-3xl">
          “{item.quote}”
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/15 bg-black/40 sm:h-80">
      <img src={item.imageUrl} alt="anime scene" className="h-full w-full object-contain" />
    </div>
  );
}
