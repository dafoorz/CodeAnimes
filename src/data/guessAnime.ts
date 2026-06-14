import type { GAnimeItem, GAnimeMode } from '../types';

// Data for "Guess the Anime".
//
// 💬 Dialogue is fully populated below with famous, recognizable lines (no
// character/anime name inside the quote). The image modes need anime SCENE
// screenshots categorized by type, which no free API provides — so they read
// from the curated arrays below. Add entries like:
//   { anime: 'Naruto', answers: ['naruto'], mode: 'background', imageUrl: 'https://…' }
// and that mode lights up automatically. Until then those modes show as
// "coming soon" on the setup screen.

export const ANIME_QUOTES: GAnimeItem[] = [
  { anime: 'Naruto', answers: ['naruto'], mode: 'dialogue', quote: "I never go back on my word, because that's my ninja way!" },
  { anime: 'One Piece', answers: ['one piece'], mode: 'dialogue', quote: "I'm gonna be King of the Pirates!" },
  { anime: 'Dragon Ball Z', answers: ['dragon ball z', 'dbz', 'dragon ball'], mode: 'dialogue', quote: "It's over 9000!" },
  { anime: 'Death Note', answers: ['death note'], mode: 'dialogue', quote: "I'll take a potato chip… and eat it!" },
  { anime: 'Attack on Titan', answers: ['attack on titan', 'aot', 'snk', 'shingeki no kyojin'], mode: 'dialogue', quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win!" },
  { anime: 'Fullmetal Alchemist: Brotherhood', answers: ['fullmetal alchemist brotherhood', 'fmab', 'fullmetal alchemist'], mode: 'dialogue', quote: 'A lesson without pain is meaningless.' },
  { anime: "JoJo's Bizarre Adventure", answers: ['jojo', "jojo's bizarre adventure", 'jojos bizarre adventure'], mode: 'dialogue', quote: 'Yare yare daze…' },
  { anime: 'Code Geass', answers: ['code geass'], mode: 'dialogue', quote: 'The only ones who should kill are those prepared to be killed!' },
  { anime: 'One Punch Man', answers: ['one punch man', 'opm'], mode: 'dialogue', quote: "I'm just a guy who's a hero for fun." },
  { anime: 'Demon Slayer', answers: ['demon slayer', 'kimetsu no yaiba'], mode: 'dialogue', quote: 'Set your heart ablaze.' },
  { anime: 'My Hero Academia', answers: ['my hero academia', 'mha', 'boku no hero academia'], mode: 'dialogue', quote: 'It’s fine now. Why? Because I am here!' },
  { anime: 'Tokyo Ghoul', answers: ['tokyo ghoul'], mode: 'dialogue', quote: "It's not the world that's messed up; it's those of us in it." },
  { anime: 'Steins;Gate', answers: ['steins gate', 'steinsgate'], mode: 'dialogue', quote: 'El Psy Kongroo.' },
  { anime: 'Sword Art Online', answers: ['sword art online', 'sao'], mode: 'dialogue', quote: 'This may be a game, but it’s not something you play.' },
  { anime: 'Jujutsu Kaisen', answers: ['jujutsu kaisen', 'jjk'], mode: 'dialogue', quote: 'Throughout heaven and earth, I alone am the honored one.' },
  { anime: 'Cowboy Bebop', answers: ['cowboy bebop'], mode: 'dialogue', quote: 'Whatever happens, happens.' },
  { anime: 'Neon Genesis Evangelion', answers: ['evangelion', 'neon genesis evangelion', 'nge'], mode: 'dialogue', quote: 'I mustn’t run away. I mustn’t run away.' },
  { anime: 'Bleach', answers: ['bleach'], mode: 'dialogue', quote: 'If miracles only happen once, what are they called the second time?' },
  { anime: 'Fairy Tail', answers: ['fairy tail'], mode: 'dialogue', quote: 'Fear is not evil. It tells you what your weakness is.' },
  { anime: 'Hunter x Hunter', answers: ['hunter x hunter', 'hxh'], mode: 'dialogue', quote: 'If you’re going to insult someone, at least do it where they can hear you.' },
  { anime: 'Re:Zero', answers: ['re zero', 'rezero', 're:zero'], mode: 'dialogue', quote: 'I love you more than anyone else in this world.' },
  { anime: 'Naruto Shippuden', answers: ['naruto shippuden', 'naruto shippuuden', 'naruto'], mode: 'dialogue', quote: 'When a person has something important they want to protect, that’s when they can become truly strong.' },
  { anime: 'Mob Psycho 100', answers: ['mob psycho 100', 'mob psycho'], mode: 'dialogue', quote: 'Everyone has the potential to be great — you’re not special, and neither is anyone else.' },
  { anime: 'Chainsaw Man', answers: ['chainsaw man', 'csm'], mode: 'dialogue', quote: 'I want to eat your heart… and live an ordinary life.' },
  { anime: 'Vinland Saga', answers: ['vinland saga'], mode: 'dialogue', quote: 'You have no enemies. Nobody has any enemies.' },
  { anime: 'Gurren Lagann', answers: ['gurren lagann', 'tengen toppa gurren lagann'], mode: 'dialogue', quote: 'Who the hell do you think I am?!' },
];

/**
 * Image modes pull real per-anime images from Danbooru at runtime (filtered to
 * the safe `rating:g`). Each entry maps a display name to its Danbooru copyright
 * tag. Add a line to include more anime in the image modes.
 */
export interface GAImageAnime {
  anime: string;
  answers: string[];
  tag: string; // Danbooru copyright tag
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
  { anime: 'Jojo’s Bizarre Adventure', answers: ['jojo', 'jojos bizarre adventure'], tag: 'jojo_no_kimyou_na_bouken_(series)' },
  { anime: 'Pokémon', answers: ['pokemon', 'pokémon'], tag: 'pokemon_(anime)' },
];

/** Danbooru theme tag combined with the copyright tag per image mode. */
export const GA_CATEGORY_TAG: Record<'background' | 'attack' | 'food', string> = {
  background: 'scenery',
  attack: 'glowing',
  food: 'food',
};

export function getItems(mode: GAnimeMode): GAnimeItem[] {
  // Only Dialogue is bundled; image modes are fetched at runtime.
  return mode === 'dialogue' ? ANIME_QUOTES : [];
}
