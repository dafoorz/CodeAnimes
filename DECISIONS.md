# Decisions Log

Choices made while building **Anime Codenames**, since the task said to ask no
clarifying questions and log decisions here.

## Project layout
- The Vite project lives at the **repository root** rather than in a nested
  `anime-codenames/` folder. The repo (CodeAnimes) *is* the project, so nesting
  would just add a redundant directory. The npm package is still named
  `anime-codenames`.

## Tooling versions
- **Tailwind CSS v3.4** (classic `tailwind.config.js` + PostCSS) rather than v4.
  v3 has the most predictable setup for custom theme colors and broad tooling
  compatibility.
- **Zustand v4** for state.
- **Vite 5 + React 18 + TypeScript** as requested.

## API / fetching
- All Jikan fetching happens **client-side in the browser at runtime**. The dev
  sandbox blocks outbound network, but that does not affect the shipped app,
  which runs in the player's browser.
- Cover images for the famous-anime list are fetched lazily on the selection
  screen (one request per anime, throttled) rather than hardcoded, because image
  URLs on MAL/Jikan are not stable enough to hardcode. They are cached in
  localStorage. The `famousAnime.ts` entries therefore carry only `mal_id` +
  `title`; `coverImage` is filled in at runtime and cached.
- **Rate limiting:** a single shared throttle queue enforces ~400ms between all
  Jikan requests (≈2.5 req/s, under the 3 req/s limit), covering both cover-image
  and character fetches.
- **Caching:** character lists and cover images are cached in localStorage keyed
  by `mal_id`, with a 7-day TTL so stale data eventually refreshes.

## Character count estimate
- The selection screen estimates **~15 characters per anime** for the "~Y
  characters available" counter (spec said 10–20). Actual counts replace the
  estimate once fetched.

## Game setup
- Starting team is chosen by coin flip; the starting team gets 9 cards, the other
  8, plus 7 neutral and 1 assassin (25 total).
- The player picks their own team + role on the Role Select screen. The opposing
  side is not AI-controlled — this is a pass-and-play / hotseat style board where
  one device shows the board (standard for a Codenames helper). Spymaster view is
  toggleable.

## Online multiplayer (added after initial build)
- **Transport: host-authoritative WebRTC via PeerJS.** Chosen over a hosted
  backend (Supabase/Firebase) or a custom WebSocket server because it needs
  **zero backend, zero accounts, and zero environment variables** — the app
  stays a pure static site that the user can deploy anywhere. PeerJS's free
  public broker is used only for signaling; game messages travel directly
  peer-to-peer over WebRTC DataConnections.
- **Why host-authoritative:** Codenames is a hidden-information game (operatives
  must not see the colour key). One peer (the room creator) holds the
  authoritative board and runs all rules through the existing pure engine. It
  sends each player a **masked view**: spymasters get the true colours;
  operatives get colours only for already-revealed cards. The solution therefore
  never travels to operative clients, so it can't be sniffed from network traffic
  or memory. A shared database (Supabase) would have made this materially harder
  (every client holding the anon key could query the key unless guarded by
  careful row-level security).
- **Trade-off:** the host's tab is the authority — if the host leaves, the room
  ends. That's the standard limitation of P2P host-authority and is acceptable
  for casual play. If always-on hosting or reconnection becomes a requirement,
  the same protocol (`src/net/protocol.ts`) could be re-pointed at a relay
  (Supabase Broadcast channel or a small WebSocket server) without touching the
  engine or UI.
- **Reuse:** both modes render the same `GameBoard`/`EndScreen` through a shared
  `BoardController` interface (`src/game/controller.ts`); the local store and the
  multiplayer store each provide an adapter. The pure engine is the single source
  of truth in both modes.
- **Rooms:** short 4-char codes (ambiguous characters removed) map to a
  namespaced PeerJS id. Players pick team + role in the lobby; the host picks the
  animes and starts the game. The operative "Peek" toggle is disabled online
  (it would be cheating).

## Opening Quiz — "Guess the Opening" (added later)
- **Clip source: AnimeThemes.moe.** Free, no API key, CORS-enabled API at
  `api.animethemes.moe`, and it hosts the real opening **video** files (`.webm`,
  which carry both video and audio) on its CDN at `v.animethemes.moe`. This is
  the standard source for anime-music-quiz style apps and the only good free
  option that provides actual OP video rather than just cover art.
- **Mode scope: single-player / local.** The quiz is a solo (or shared-screen)
  mode reached from Home. Networked multiplayer for the quiz (buzzer races) is a
  much bigger build and is left for later.
- **Difficulty ramp:** a curated pool in `data/openingQuiz.ts` is tagged into 4
  tiers (popular → obscure). Songs are drawn tier-by-tier so early rounds are
  easy and later ones get harder. Clips that fail to fetch are skipped and
  replaced from the next tier so the round still fills.
- **Answer matching** is fuzzy (normalize + small Levenshtein tolerance) with
  several accepted aliases per anime (English, romaji, common abbreviations like
  "aot"/"jjk"), so typos and alternate names still count.
- **Scoring** rewards speed: a correct typed answer early in the 10s clip scores
  near the base points, decaying to a floor; if the clip ends unanswered the
  player gets 4 multiple-choice options worth fewer points. Harder tiers carry a
  score multiplier.
- All quiz constants live in `data/config.ts`.
- **Preloading:** the AnimeThemes CDN doesn't allow cross-origin `fetch()`, so
  clips are buffered into reusable `<video>` elements on the loading screen
  (CORS-free) and that same buffered element is reused for playback — no
  re-download, no mid-clip stall. The smallest video resolution is chosen.
- **Audio-only mode** buffers/plays the small `.ogg` audio file (from
  AnimeThemes' `audio` relation) instead of the video, so it loads much faster.
- **Why not YouTube:** its ToS forbids ripping audio, the embed exposes the
  video title (spoiling the answer), and there's no reliable way to fetch a
  clean "opening, first N seconds" clip. AnimeThemes is purpose-built for this.
- **Online multiplayer (quiz):** a host-authoritative buzzer race over the same
  generic PeerJS layer (`net/peer.ts` is now generic over message types). The
  host owns the answers + clock; it tells everyone which clips to preload, starts
  each round, judges typed guesses, scores by speed, and broadcasts per-round
  reveals + a leaderboard. Clients preload and play their own local copies.
  Trade-off: clip URLs (filenames) can hint at the answer to anyone inspecting
  dev tools — acceptable for casual play; a future version could relay the media
  as an opaque WebRTC stream.

## Guess the Character (added later)
- **Fuzzy matching via fuse.js.** MyAnimeList names are "Last, First", so accepted
  answers are built from the raw name, both orderings, and each name part (so a
  given-name nickname like "Zoro" or a single-name character works). Exact
  normalized match = "perfect"; a fuse near-match = "Close enough!".
- **CSS-only disguises.** Eyes Only / Extreme Zoom use a `background-image` with
  `background-size`/`background-position`; Silhouette uses `filter: brightness(0)`
  on a light panel; Progressive Blur uses `filter: blur()`. No canvas/server.
- **Character pool** reuses the Codenames anime selection + `animeStore.pool`,
  then caps to the top 35 favorites per anime (`buildCharPool`).
- **Online** reuses the generic PeerJS layer with its own protocol
  (`net/charProtocol.ts` + `store/charNetStore.ts`), host-authoritative: the host
  sends the disguised image (never the name), judges guesses, and reveals once
  every player has answered or skipped (no time limit), then advances manually.
  Per-player zoom/blur level is client-side and reported on guess.
- All tunables (rounds, points, speed bonus, zoom/blur steps) live in
  `data/config.ts`.

## Guess the Anime (added later)
- **Image modes via Jikan pictures.** Danbooru's API isn't CORS-enabled (browser
  fetches were blocked), and no free CORS-enabled API tags anime images by theme.
  So the three image modes fetch official artwork from Jikan's
  `/anime/{id}/pictures` (same CORS-friendly API the rest of the app uses, mapped
  by mal_id). Trade-off: the images are recognizable official art but not
  theme-specific, so background/attack/food currently share the same source.
  **Dialogue** stays bundled (famous quotes, no API).
- Players guess the **anime title**; fuzzy-matched (`matchTitle`, fuse.js) against
  per-item aliases. Scoring = flat base + the shared char speed bonus. Solo +
  host-authoritative online (`net/ganimeProtocol.ts` + `store/ganimeNetStore.ts`),
  round reveals once all answer/skip; host advances. No anime selection needed —
  the pool is the bundled dataset for the chosen mode.

## Misc
- If a famous anime's cover image fails to load, a gradient placeholder with the
  title is shown. If a character card image fails, the character's initials are
  shown on a colored tile.
