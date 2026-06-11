import type { AnimeOption } from '../types';

// The default "Quick Play" roster of famous animes.
//
// To add more anime to this list later, just add a new line with the anime's
// `malId` (the number in its MyAnimeList URL, e.g. myanimelist.net/anime/20/)
// and `title`. Nothing else needs to change — cover images and character lists
// are fetched from Jikan at runtime and cached.

export const FAMOUS_ANIME: AnimeOption[] = [
  { malId: 20, title: 'Naruto' },
  { malId: 1735, title: 'Naruto Shippuden' },
  { malId: 21, title: 'One Piece' },
  { malId: 813, title: 'Dragon Ball Z' },
  { malId: 16498, title: 'Attack on Titan' },
  { malId: 38000, title: 'Demon Slayer' },
  { malId: 31964, title: 'My Hero Academia' },
  { malId: 1535, title: 'Death Note' },
  { malId: 5114, title: 'Fullmetal Alchemist: Brotherhood' },
  { malId: 11061, title: 'Hunter x Hunter (2011)' },
  { malId: 40748, title: 'Jujutsu Kaisen' },
  { malId: 11757, title: 'Sword Art Online' },
  { malId: 269, title: 'Bleach' },
  { malId: 22319, title: 'Tokyo Ghoul' },
  { malId: 30276, title: 'One Punch Man' },
].map((a) => ({ ...a, isFamous: true }));
