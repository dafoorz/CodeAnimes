# Anime Codenames

A browser-based anime game hub. From the **main menu** you can pick one of four
games: **Anime Codenames**, **Guess the Opening**, **Guess the Character**, or
**Guess the Anime**.

### Guess the Anime

Name the anime from a clue (no title given) — solo or online, four modes:
**💬 Dialogue** (a bundled set of famous quotes), and three image modes — **🌄
Background**, **⚔️ Attack effect**, **🍜 Food scene** — which pull real per-anime
images at runtime from [Danbooru](https://danbooru.donmai.us), filtered to the
safe `rating:g` (general audiences). Anime titles are fuzzy-matched (fuse.js) and
scored by speed. The anime↔Danbooru tag map lives in `src/data/guessAnime.ts`.

### Guess the Character

Name a disguised anime character as fast as you can — solo or online. Pick a
challenge type: **Eyes Only**, **Silhouette**, **Extreme Zoom** (zoom out for
fewer points), or **Progressive Blur** (unblur for fewer points). Faster answers
earn a bigger speed bonus. Answers are fuzzy-matched with
[fuse.js](https://www.fusejs.io/) — first name, last name, full name, or a
name-part nickname all count, and a near-miss shows "Close enough! ✓". Online is
a host-authoritative race where the round ends once everyone has answered or
skipped, then the host advances. Characters come from the same anime selection
(famous list + custom search, top-favorites, capped at 35 per anime). All image
disguising is pure CSS (crop/zoom/`filter`).

The first is an anime-themed take on the classic party game **Codenames**.
Every card on the 5×5 board is an anime character — portrait, character name,
and series — pulled live from [MyAnimeList](https://myanimelist.net/) via the
free [Jikan API](https://docs.api.jikan.moe/). Build a board from famous shows
or search for any anime, then play Spymaster or Operative on a dark, neon-lit
board.

![Teams: Red & Blue · 9 / 8 / 7 neutral / 1 assassin](public/vite.svg)

## Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (v3) for styling
- **Zustand** for state management
- **Jikan REST API** for anime/character data (no API key required)
- **PeerJS / WebRTC** for online multiplayer (no backend, no API key)

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

Other scripts:

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
npm run lint      # type-check only (tsc --noEmit)
```

## How to play

1. **Home → New Game.**
2. **Choose your animes.** Two tabs:
   - *Quick Play* — pick from 15 famous animes (5 are pre-selected at random).
   - *Custom* — search MyAnimeList for any series and add it.
   - Select **3–10** animes. The footer shows how many characters are available
     and warns if there aren't enough to fill the 25-card board.
3. **Build Board →** fetches and caches the characters ("Summoning
   characters...").
4. **Pick your seat** — a team (Red / Blue) and a role:
   - **Spymaster** sees every card's color and gives a one-word clue + a number.
   - **Operative** sees only face-down cards and taps to guess. (Operatives get
     a "Peek" toggle for hotseat play.)
5. **Play.** A correct guess lets you keep going; a neutral or enemy card ends
   your turn. Revealing the **☠️ assassin** loses the game instantly. First team
   to reveal all of its characters wins.

### Guess the Opening (music quiz)

A second game mode, reached from **🎵 Guess the Opening** on the home screen.
A 10-second clip of an anime opening plays (real **video + audio**) and you
type the anime's name as fast as you can:

- **Faster answers score more** — points decay from the start of the clip to a
  floor at the buzzer.
- **Difficulty scales up** as you go — early openings are popular, later ones get
  obscure (4 tiers), and harder tiers carry a score bonus.
- **Setup options:** round length (5–20 songs), **show video or audio-only**
  (a harder mode), and **clip length** from 0.5s to 10s.
- **Miss it?** If the clip ends unanswered you get **4 multiple-choice options**
  (worth fewer points).
- Typed answers are matched leniently — common aliases and minor typos count
  (e.g. `aot`, `jjk`).

Clips come from [AnimeThemes.moe](https://animethemes.moe) (free, no key) and
are **downloaded in full before the round starts**, so playback never stalls.
They're `.webm`, so they play best in Chrome, Edge, and Firefox; some browsers
have limited webm support.

**Online multiplayer:** the quiz setup has a **🌐 Play Online** button — create a
room, share the code, and race friends to name each opening. Everyone downloads
the clips first, then the host runs synchronized rounds; the fastest correct
typed answer scores the most, and a leaderboard shows after each round.

### Two ways to play (Codenames)

- **New Game (Local / pass-and-play):** one device, one shared board. Pass it
  around — the Spymaster gives a clue, then Operatives tap to guess. Operatives
  have a "Peek" toggle for hotseat play.
- **Play Online:** real multiplayer across devices.
  - One player picks **Create Room** and shares the 4-character room code.
  - Others pick **Join Room** and enter the code.
  - Everyone chooses a team + role in the lobby; the host selects the animes and
    presses **Start Game**.
  - Each player only sees what their role should: Spymasters see all colors,
    Operatives see only revealed cards.

#### How online multiplayer works

Online play uses **host-authoritative WebRTC via PeerJS** — there is **no
server to run and no API keys**. PeerJS's free public broker is used only to
introduce peers; the actual game data flows directly peer-to-peer. The room
creator (host) holds the authoritative board and rules, and sends every other
player a view masked to their role, so the color key can't be cheated. The
trade-off: if the host closes their tab, the room ends. See
[`DECISIONS.md`](DECISIONS.md) for the full reasoning and how to swap the
transport for an always-on relay later.

> Online play needs WebRTC connectivity to the public PeerJS broker. On very
> restrictive networks a TURN server may be required; none is configured by
> default.

## Game setup (standard Codenames)

| Cards | Count |
| ----- | ----- |
| Starting team | 9 |
| Second team | 8 |
| Neutral (tan) | 7 |
| Assassin (black) | 1 |
| **Total** | **25** |

The starting team is decided by a coin flip. All of these counts live in
[`src/data/config.ts`](src/data/config.ts) and can be tuned without touching any
game logic.

## API info

- Base URL: `https://api.jikan.moe/v4` — free, no key.
- Characters for an anime: `GET /anime/{mal_id}/characters` — each entry gives
  `character.name`, `character.images.jpg.image_url`, `character.mal_id`, and a
  `favorites` count. Characters are ranked by `favorites`: each anime
  contributes its **top 15%** (capped at 100). If the whole selection's combined
  top-15% can't fill the 25-card board, every anime instead contributes its
  **25 most-favorited**. Either way you get recognizable faces, not obscure
  minor characters. Tunable in `data/config.ts`.
- Cover image for an anime: `GET /anime/{mal_id}` →
  `images.jpg.large_image_url`.
- Custom search: `GET /anime?q={query}&type=tv&limit=8`.
- **Rate limit:** Jikan allows ~3 requests/second. All requests go through a
  shared throttle queue spacing them ~400ms apart (with one automatic retry on
  HTTP 429).
- **Caching:** fetched character lists and cover images are cached in
  `localStorage` (7-day TTL) so repeated games don't re-fetch.

If the API is unreachable the selection screen shows a friendly error with a
**Retry** button, and the game never starts with fewer than 25 characters in the
pool.

## Adding more anime to the Quick Play list

Open [`src/data/famousAnime.ts`](src/data/famousAnime.ts) and add one line with
the anime's `malId` (the number in its MyAnimeList URL,
e.g. `myanimelist.net/anime/20/` → `20`) and its `title`:

```ts
{ malId: 9253, title: 'Steins;Gate' },
```

Nothing else needs to change — the cover image and character list are fetched
and cached automatically.

## Project structure

```
src/
  api/         Jikan client (throttled) + localStorage cache
  components/  Card, Spinner, images, color helpers
  data/        config.ts (tunable counts) + famousAnime.ts
  engine/      gameLogic.ts — pure deck/color/win functions
  game/        BoardController interface + local/online adapters
  net/         protocol.ts (wire types + masking) + peer.ts (PeerJS)
  screens/     Home, AnimeSelect, RoleSelect, GameBoard, End
    online/    ConnectScreen, LobbyScreen
  store/       Zustand stores (animeStore, gameStore, multiplayerStore)
```

Both the local and online modes render the same board UI through a shared
`BoardController` interface, and both resolve all rules through the pure
`engine/` functions — the single source of truth.

All game logic lives in pure functions under `engine/`; components and stores
only orchestrate. See [`DECISIONS.md`](DECISIONS.md) for design choices made
along the way.
