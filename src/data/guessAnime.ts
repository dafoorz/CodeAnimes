import type { GAnimeMode } from '../types';

// Data for "Guess the Anime" — three image modes pull themed images at runtime.
// (The Dialogue mode moved to "Guess the Character"; see data/characterQuotes.ts.)

/**
 * Image modes pull real per-anime themed images from Danbooru at runtime
 * (filtered to safe rating:g). Each entry maps a display name to its Danbooru
 * copyright `tag`. Add a line to include more anime in the image modes.
 */
export interface GAImageAnime {
  anime: string;
  answers: string[];
  tag: string;
}

export const GA_IMAGE_ANIME: GAImageAnime[] = [
  { anime: 'Naruto', answers: ['naruto'], tag: 'naruto' },
  { anime: 'One Piece', answers: ['one piece'], tag: 'one_piece' },
  { anime: 'Bleach', answers: ['bleach'], tag: 'bleach' },
  { anime: 'Attack on Titan', answers: ['attack on titan', 'aot', 'snk', 'shingeki no kyojin'], tag: 'shingeki_no_kyojin' },
  { anime: 'Demon Slayer', answers: ['demon slayer', 'kimetsu no yaiba'], tag: 'kimetsu_no_yaiba' },
  { anime: 'My Hero Academia', answers: ['my hero academia', 'mha', 'boku no hero academia'], tag: 'boku_no_hero_academia' },
  { anime: 'Death Note', answers: ['death note'], tag: 'death_note' },
  { anime: 'Dragon Ball Z', answers: ['dragon ball z', 'dbz', 'dragon ball'], tag: 'dragon_ball' },
  { anime: 'Jujutsu Kaisen', answers: ['jujutsu kaisen', 'jjk'], tag: 'jujutsu_kaisen' },
  { anime: 'One Punch Man', answers: ['one punch man', 'opm'], tag: 'one-punch_man' },
  { anime: 'Tokyo Ghoul', answers: ['tokyo ghoul'], tag: 'tokyo_ghoul' },
  { anime: 'Fullmetal Alchemist: Brotherhood', answers: ['fullmetal alchemist brotherhood', 'fmab', 'fullmetal alchemist'], tag: 'fullmetal_alchemist' },
  { anime: 'Hunter x Hunter', answers: ['hunter x hunter', 'hxh'], tag: 'hunter_x_hunter' },
  { anime: 'Sword Art Online', answers: ['sword art online', 'sao'], tag: 'sword_art_online' },
  { anime: 'Chainsaw Man', answers: ['chainsaw man', 'csm'], tag: 'chainsaw_man' },
  { anime: 'Spy x Family', answers: ['spy x family', 'spy family'], tag: 'spy_x_family' },
  { anime: 'Code Geass', answers: ['code geass'], tag: 'code_geass' },
  { anime: 'Neon Genesis Evangelion', answers: ['evangelion', 'neon genesis evangelion', 'nge'], tag: 'neon_genesis_evangelion' },
  { anime: 'Mob Psycho 100', answers: ['mob psycho 100', 'mob psycho'], tag: 'mob_psycho_100' },
  { anime: 'Cowboy Bebop', answers: ['cowboy bebop'], tag: 'cowboy_bebop' },
];

/** Danbooru theme tag combined with the copyright tag per image mode. */
export const GA_CATEGORY_TAG: Record<GAnimeMode, string> = {
  background: 'scenery',
  attack: 'glowing',
  food: 'food',
};
