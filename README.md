# Anime Codenames

A browser-based, anime-themed take on the classic party game **Codenames**.
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

The board is designed for **hotseat / pass-and-play** on a single device — see
[`DECISIONS.md`](DECISIONS.md) for the reasoning.

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
  `character.name`, `character.images.jpg.image_url`, and `character.mal_id`.
  All roles (Main, Supporting, …) are included.
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
  screens/     Home, AnimeSelect, RoleSelect, GameBoard, End
  store/       Zustand stores (animeStore, gameStore)
```

All game logic lives in pure functions under `engine/`; components and stores
only orchestrate. See [`DECISIONS.md`](DECISIONS.md) for design choices made
along the way.
