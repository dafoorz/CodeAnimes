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

  // --- More characters from shows already covered ---
  { character: 'Kakashi Hatake', answers: ['kakashi', 'kakashi hatake', 'hatake'], anime: 'Naruto', quote: 'Those who break the rules are scum — but those who abandon their friends are worse than scum.' },
  { character: 'Itachi Uchiha', answers: ['itachi', 'itachi uchiha'], anime: 'Naruto', quote: 'People live their lives bound by what they accept as correct and true. That is how they define reality.' },
  { character: 'Jiraiya', answers: ['jiraiya'], anime: 'Naruto', quote: 'A place where someone still thinks about you is a place you can call home.' },
  { character: 'Rock Lee', answers: ['rock lee', 'lee'], anime: 'Naruto', quote: 'A dropout will beat a genius through hard work.' },
  { character: 'Madara Uchiha', answers: ['madara', 'madara uchiha'], anime: 'Naruto Shippuden', quote: 'Wake up to reality! Nothing ever goes as planned in this accursed world.' },
  { character: 'Roronoa Zoro', answers: ['zoro', 'roronoa zoro', 'roronoa'], anime: 'One Piece', quote: 'A wound on the back is a swordsman’s shame.' },
  { character: 'Portgas D. Ace', answers: ['ace', 'portgas d ace', 'portgas d. ace', 'portgas'], anime: 'One Piece', quote: 'Thank you… for loving me!' },
  { character: 'Son Goku', answers: ['goku', 'son goku', 'kakarot'], anime: 'Dragon Ball Z', quote: 'Power comes in response to a need, not a desire.' },
  { character: 'Levi Ackerman', answers: ['levi', 'levi ackerman', 'ackerman'], anime: 'Attack on Titan', quote: 'The only thing we’re allowed to do is believe that we won’t regret the choice we made.' },
  { character: 'Armin Arlert', answers: ['armin', 'armin arlert', 'arlert'], anime: 'Attack on Titan', quote: 'Those who can’t sacrifice anything can never change anything.' },
  { character: 'Ryomen Sukuna', answers: ['sukuna', 'ryomen sukuna'], anime: 'Jujutsu Kaisen', quote: 'Stand proud. You’re strong.' },
  { character: 'Yuji Itadori', answers: ['yuji', 'itadori', 'yuji itadori'], anime: 'Jujutsu Kaisen', quote: 'I don’t want to regret the way I lived.' },
  { character: 'Tanjiro Kamado', answers: ['tanjiro', 'tanjiro kamado', 'kamado'], anime: 'Demon Slayer', quote: 'No matter how many people you may lose, you have no choice but to go on living.' },
  { character: 'Sosuke Aizen', answers: ['aizen', 'sosuke aizen', 'sousuke aizen'], anime: 'Bleach', quote: 'Admiration is the emotion farthest from understanding.' },
  { character: 'Izuku Midoriya', answers: ['deku', 'izuku', 'izuku midoriya', 'midoriya'], anime: 'My Hero Academia', quote: 'Sometimes I feel like a failure — but I’ll never stop moving forward.' },

  // --- New anime ---
  { character: 'Hisoka Morow', answers: ['hisoka', 'hisoka morow'], anime: 'Hunter x Hunter', quote: 'The stronger my opponent, the more thrilled I become.' },
  { character: 'Natsu Dragneel', answers: ['natsu', 'natsu dragneel', 'dragneel'], anime: 'Fairy Tail', quote: 'Using your power for someone else and expecting nothing in return — that’s true strength.' },
  { character: 'Asta', answers: ['asta'], anime: 'Black Clover', quote: 'My magic is never giving up!' },
  { character: 'Denji', answers: ['denji'], anime: 'Chainsaw Man', quote: 'I just want to live a normal, happy life — even if it kills me.' },
  { character: 'Anya Forger', answers: ['anya', 'anya forger', 'forger'], anime: 'Spy x Family', quote: 'Waku waku!' },
  { character: 'Shoyo Hinata', answers: ['hinata', 'shoyo hinata', 'shouyou hinata'], anime: 'Haikyuu!!', quote: 'I’ll keep jumping until I can see the view from the very top!' },
  { character: 'Senku Ishigami', answers: ['senku', 'senku ishigami', 'ishigami'], anime: 'Dr. Stone', quote: 'Ten billion percent — this is gonna be exhilarating!' },
  { character: 'Emma', answers: ['emma'], anime: 'The Promised Neverland', quote: 'I’m not leaving a single one of you behind!' },
  { character: 'Korosensei', answers: ['korosensei', 'koro sensei', 'koro-sensei'], anime: 'Assassination Classroom', quote: 'Find joy even in the tasks you dread — that’s how you truly grow.' },
  { character: 'Alucard', answers: ['alucard'], anime: 'Hellsing', quote: 'The bird of Hermes is my name, eating my wings to make me tame.' },
  { character: 'Migi', answers: ['migi'], anime: 'Parasyte', quote: 'Is there any other species on Earth that harms its own kind as much as humans do?' },
  { character: 'Archer', answers: ['archer', 'emiya', 'shirou', 'shirou emiya'], anime: 'Fate/stay night', quote: 'I am the bone of my sword.' },
];
