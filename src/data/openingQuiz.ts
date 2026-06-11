import type { QuizAnime } from '../types';

// Curated pool for the "Guess the Opening" quiz, tagged into 4 difficulty
// tiers (1 = very popular / easy, 4 = obscure / hard). `query` is sent to the
// AnimeThemes search API; `answers` are the accepted typed guesses (matched
// case/punctuation-insensitively and with a small typo tolerance), so include
// common English/romaji names and abbreviations.
//
// To add more: drop in another entry with a findable `query`, a nice `display`
// name, a few accepted `answers`, and a difficulty tier.

export const OPENING_QUIZ: QuizAnime[] = [
  // --- Tier 1: everybody knows these ---
  { query: 'Naruto', display: 'Naruto', answers: ['naruto'], difficulty: 1 },
  { query: 'One Piece', display: 'One Piece', answers: ['one piece'], difficulty: 1 },
  { query: 'Bleach', display: 'Bleach', answers: ['bleach'], difficulty: 1 },
  {
    query: 'Shingeki no Kyojin',
    display: 'Attack on Titan',
    answers: ['attack on titan', 'aot', 'snk', 'shingeki no kyojin'],
    difficulty: 1,
  },
  {
    query: 'Kimetsu no Yaiba',
    display: 'Demon Slayer',
    answers: ['demon slayer', 'kimetsu no yaiba'],
    difficulty: 1,
  },
  {
    query: 'Boku no Hero Academia',
    display: 'My Hero Academia',
    answers: ['my hero academia', 'mha', 'boku no hero academia'],
    difficulty: 1,
  },
  { query: 'Death Note', display: 'Death Note', answers: ['death note'], difficulty: 1 },
  {
    query: 'Dragon Ball Z',
    display: 'Dragon Ball Z',
    answers: ['dragon ball z', 'dbz', 'dragon ball'],
    difficulty: 1,
  },
  {
    query: 'Jujutsu Kaisen',
    display: 'Jujutsu Kaisen',
    answers: ['jujutsu kaisen', 'jjk'],
    difficulty: 1,
  },
  {
    query: 'One Punch Man',
    display: 'One Punch Man',
    answers: ['one punch man', 'opm'],
    difficulty: 1,
  },
  {
    query: 'Sword Art Online',
    display: 'Sword Art Online',
    answers: ['sword art online', 'sao'],
    difficulty: 1,
  },
  { query: 'Tokyo Ghoul', display: 'Tokyo Ghoul', answers: ['tokyo ghoul'], difficulty: 1 },

  // --- Tier 2: well-known to most fans ---
  {
    query: 'Fullmetal Alchemist Brotherhood',
    display: 'Fullmetal Alchemist: Brotherhood',
    answers: ['fullmetal alchemist brotherhood', 'fmab', 'fullmetal alchemist'],
    difficulty: 2,
  },
  {
    query: 'Hunter x Hunter',
    display: 'Hunter x Hunter',
    answers: ['hunter x hunter', 'hxh'],
    difficulty: 2,
  },
  { query: 'Code Geass', display: 'Code Geass', answers: ['code geass'], difficulty: 2 },
  {
    query: 'Steins Gate',
    display: 'Steins;Gate',
    answers: ['steins gate', 'steinsgate'],
    difficulty: 2,
  },
  {
    query: 'Mob Psycho 100',
    display: 'Mob Psycho 100',
    answers: ['mob psycho 100', 'mob psycho'],
    difficulty: 2,
  },
  {
    query: 'Re:Zero kara Hajimeru Isekai Seikatsu',
    display: 'Re:Zero',
    answers: ['re zero', 'rezero', 're:zero'],
    difficulty: 2,
  },
  { query: 'Fairy Tail', display: 'Fairy Tail', answers: ['fairy tail'], difficulty: 2 },
  { query: 'Black Clover', display: 'Black Clover', answers: ['black clover'], difficulty: 2 },
  {
    query: 'JoJo no Kimyou na Bouken',
    display: "JoJo's Bizarre Adventure",
    answers: ['jojo', 'jojos bizarre adventure', "jojo's bizarre adventure"],
    difficulty: 2,
  },
  {
    query: 'Chainsaw Man',
    display: 'Chainsaw Man',
    answers: ['chainsaw man', 'csm'],
    difficulty: 2,
  },
  {
    query: 'Spy x Family',
    display: 'Spy x Family',
    answers: ['spy x family', 'spy family', 'spyxfamily'],
    difficulty: 2,
  },
  { query: 'Haikyuu', display: 'Haikyuu!!', answers: ['haikyuu', 'haikyu'], difficulty: 2 },

  // --- Tier 3: solid fan knowledge ---
  {
    query: 'Tengen Toppa Gurren Lagann',
    display: 'Gurren Lagann',
    answers: ['gurren lagann', 'tengen toppa gurren lagann'],
    difficulty: 3,
  },
  { query: 'Cowboy Bebop', display: 'Cowboy Bebop', answers: ['cowboy bebop'], difficulty: 3 },
  {
    query: 'Mahou Shoujo Madoka Magica',
    display: 'Puella Magi Madoka Magica',
    answers: ['madoka magica', 'madoka', 'puella magi madoka magica'],
    difficulty: 3,
  },
  { query: 'Made in Abyss', display: 'Made in Abyss', answers: ['made in abyss'], difficulty: 3 },
  { query: 'Vinland Saga', display: 'Vinland Saga', answers: ['vinland saga'], difficulty: 3 },
  {
    query: 'Yakusoku no Neverland',
    display: 'The Promised Neverland',
    answers: ['promised neverland', 'the promised neverland', 'yakusoku no neverland'],
    difficulty: 3,
  },
  {
    query: 'Kono Subarashii Sekai ni Shukufuku wo',
    display: 'KonoSuba',
    answers: ['konosuba', 'kono subarashii sekai ni shukufuku wo'],
    difficulty: 3,
  },
  { query: 'Overlord', display: 'Overlord', answers: ['overlord'], difficulty: 3 },
  { query: 'Dr. Stone', display: 'Dr. Stone', answers: ['dr stone', 'doctor stone'], difficulty: 3 },
  { query: 'Toradora', display: 'Toradora!', answers: ['toradora'], difficulty: 3 },
  {
    query: 'Boku dake ga Inai Machi',
    display: 'Erased',
    answers: ['erased', 'boku dake ga inai machi'],
    difficulty: 3,
  },

  // --- Tier 4: deep cuts ---
  {
    query: 'Bakemonogatari',
    display: 'Bakemonogatari',
    answers: ['bakemonogatari', 'monogatari'],
    difficulty: 4,
  },
  { query: 'Clannad', display: 'Clannad', answers: ['clannad'], difficulty: 4 },
  { query: 'Mushishi', display: 'Mushishi', answers: ['mushishi'], difficulty: 4 },
  {
    query: 'Serial Experiments Lain',
    display: 'Serial Experiments Lain',
    answers: ['serial experiments lain', 'lain'],
    difficulty: 4,
  },
  { query: 'Nichijou', display: 'Nichijou', answers: ['nichijou'], difficulty: 4 },
  {
    query: 'Akame ga Kill',
    display: 'Akame ga Kill!',
    answers: ['akame ga kill'],
    difficulty: 4,
  },
  {
    query: 'Kiseijuu',
    display: 'Parasyte',
    answers: ['parasyte', 'kiseijuu', 'parasyte the maxim'],
    difficulty: 4,
  },
  { query: 'Ergo Proxy', display: 'Ergo Proxy', answers: ['ergo proxy'], difficulty: 4 },
  {
    query: 'Houseki no Kuni',
    display: 'Land of the Lustrous',
    answers: ['land of the lustrous', 'houseki no kuni'],
    difficulty: 4,
  },
  { query: 'Hajime no Ippo', display: 'Hajime no Ippo', answers: ['hajime no ippo', 'ippo'], difficulty: 4 },
];
