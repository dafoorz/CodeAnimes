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

## Misc
- If a famous anime's cover image fails to load, a gradient placeholder with the
  title is shown. If a character card image fails, the character's initials are
  shown on a colored tile.
