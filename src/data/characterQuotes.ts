// Famous anime quotes attributed to the CHARACTER who said them, for the
// "Dialogue" challenge in Guess the Character. `answers` lists accepted guesses
// (full name, given/family name, common nickname). No character/anime name
// appears inside the quote itself.

export interface CharacterQuote {
  character: string; // display name
  answers: string[];
  anime: string;
  quote: string;
}

export const CHARACTER_QUOTES: CharacterQuote[] = [
  { character: 'Naruto Uzumaki', answers: ['naruto', 'naruto uzumaki', 'uzumaki'], anime: 'Naruto', quote: "I never go back on my word, because that's my ninja way!" },
  { character: 'Monkey D. Luffy', answers: ['luffy', 'monkey d luffy', 'monkey d. luffy'], anime: 'One Piece', quote: "I'm gonna be King of the Pirates!" },
  { character: 'Vegeta', answers: ['vegeta'], anime: 'Dragon Ball Z', quote: "It's over 9000!" },
  { character: 'Light Yagami', answers: ['light', 'light yagami', 'yagami', 'kira'], anime: 'Death Note', quote: "I'll take a potato chip… and eat it!" },
  { character: 'Eren Yeager', answers: ['eren', 'eren yeager', 'eren jaeger', 'yeager'], anime: 'Attack on Titan', quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win!" },
  { character: 'Edward Elric', answers: ['edward', 'edward elric', 'ed', 'elric', 'fullmetal'], anime: 'Fullmetal Alchemist: Brotherhood', quote: 'A lesson without pain is meaningless.' },
  { character: 'Jotaro Kujo', answers: ['jotaro', 'jotaro kujo', 'kujo'], anime: "JoJo's Bizarre Adventure", quote: 'Yare yare daze…' },
  { character: 'Lelouch Lamperouge', answers: ['lelouch', 'lelouch lamperouge', 'zero', 'lamperouge'], anime: 'Code Geass', quote: 'The only ones who should kill are those who are prepared to be killed!' },
  { character: 'Saitama', answers: ['saitama', 'one punch man', 'caped baldy'], anime: 'One Punch Man', quote: "I'm just a guy who's a hero for fun." },
  { character: 'Kyojuro Rengoku', answers: ['rengoku', 'kyojuro', 'kyojuro rengoku'], anime: 'Demon Slayer', quote: 'Set your heart ablaze.' },
  { character: 'All Might', answers: ['all might', 'toshinori', 'toshinori yagi'], anime: 'My Hero Academia', quote: 'It’s fine now. Why? Because I am here!' },
  { character: 'Ken Kaneki', answers: ['kaneki', 'ken kaneki', 'kaneki ken'], anime: 'Tokyo Ghoul', quote: "It's not the world that's messed up; it's those of us in it." },
  { character: 'Rintarou Okabe', answers: ['okabe', 'rintarou okabe', 'okarin', 'hououin kyouma'], anime: 'Steins;Gate', quote: 'El Psy Kongroo.' },
  { character: 'Kirito', answers: ['kirito', 'kazuto', 'kazuto kirigaya', 'kirigaya'], anime: 'Sword Art Online', quote: 'This may be a game, but it’s not something you play.' },
  { character: 'Satoru Gojo', answers: ['gojo', 'satoru gojo', 'satoru'], anime: 'Jujutsu Kaisen', quote: 'Throughout heaven and earth, I alone am the honored one.' },
  { character: 'Spike Spiegel', answers: ['spike', 'spike spiegel', 'spiegel'], anime: 'Cowboy Bebop', quote: 'Whatever happens, happens.' },
  { character: 'Shinji Ikari', answers: ['shinji', 'shinji ikari', 'ikari'], anime: 'Neon Genesis Evangelion', quote: 'I mustn’t run away. I mustn’t run away.' },
  { character: 'Ichigo Kurosaki', answers: ['ichigo', 'ichigo kurosaki', 'kurosaki'], anime: 'Bleach', quote: 'If miracles only happen once, what are they called the second time?' },
  { character: 'Subaru Natsuki', answers: ['subaru', 'subaru natsuki', 'natsuki'], anime: 'Re:Zero', quote: 'I love you more than anyone else in this world.' },
  { character: 'Kamina', answers: ['kamina'], anime: 'Gurren Lagann', quote: 'Who the hell do you think I am?!' },
  { character: 'Thorfinn', answers: ['thorfinn'], anime: 'Vinland Saga', quote: 'I have no enemies. Nobody has any enemies.' },
  { character: 'Reigen Arataka', answers: ['reigen', 'reigen arataka', 'arataka'], anime: 'Mob Psycho 100', quote: 'If you’re a wonderful person, then so is everyone else.' },
];
