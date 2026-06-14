// All tunable game counts and constants live here so balance changes never
// require touching game logic or components.

/** Total cards on the board (5x5). */
export const BOARD_SIZE = 25;

/** Cards belonging to the team that goes first. */
export const RED_CARDS = 9;

/** Cards belonging to the team that goes second. */
export const BLUE_CARDS = 8;

/** Neutral (tan) bystander cards. */
export const NEUTRAL_CARDS = 7;

/** Instant-loss assassin cards. */
export const ASSASSIN_CARDS = 1;

/** Grid dimension (BOARD_SIZE should equal GRID_DIM^2). */
export const GRID_DIM = 5;

/** Anime-selection constraints. The real gate to start is MIN_POOL characters. */
export const MIN_ANIMES = 1;
export const MAX_ANIMES = 50;

/** How many famous animes to pre-select / randomize to. */
export const DEFAULT_PRESELECT = 5;

/** Rough characters-per-anime estimate for the pre-fetch counter. */
export const EST_CHARS_PER_ANIME = 25;

/**
 * Character selection (most-favorited first, so the board shows recognizable
 * faces). Each anime contributes its top CHARACTER_TOP_PERCENT by MyAnimeList
 * favorites, capped at CHARACTER_CAP. If the selection's combined 15% can't fill
 * a board, every anime instead contributes its most-favorited CHARACTER_FLOOR.
 */
export const CHARACTER_TOP_PERCENT = 0.15;
export const CHARACTER_FLOOR = BOARD_SIZE; // fallback count per anime
export const CHARACTER_CAP = 100;

/** Minimum characters required in the pool before a board can be built. */
export const MIN_POOL = BOARD_SIZE;

// --- Jikan API ---

export const JIKAN_BASE = 'https://api.jikan.moe/v4';

/** Delay between Jikan requests (ms). 400ms keeps us under 3 req/s. */
export const JIKAN_THROTTLE_MS = 400;

/** Max custom-anime search results to request. */
export const SEARCH_LIMIT = 8;

// --- Caching ---

export const CACHE_PREFIX = 'anime-codenames:';

/** Cache time-to-live (ms). 7 days. */
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// --- Opening Quiz ("Guess the Opening") ---

/** AnimeThemes API — free, no key, hosts the real OP video/webm clips. */
export const ANIMETHEMES_BASE = 'https://api.animethemes.moe';

/** How many seconds of the opening play before the clip pauses for choices. */
export const QUIZ_CLIP_SECONDS = 10;

/** Selectable clip-length bounds (seconds). */
export const QUIZ_CLIP_MIN = 0.5;
export const QUIZ_CLIP_MAX = 10;
export const QUIZ_CLIP_STEP = 0.5;

/** Max time to wait while downloading a single clip before falling back to streaming. */
export const QUIZ_PRELOAD_TIMEOUT_MS = 25000;

/** Selectable round lengths and the default. */
export const QUIZ_SONG_OPTIONS = [5, 10, 15, 20];
export const QUIZ_DEFAULT_SONGS = 10;

/** Number of difficulty tiers in the curated pool. */
export const QUIZ_MAX_TIER = 4;

/** Scoring. */
export const QUIZ_BASE_POINTS = 1000; // a near-instant typed answer
export const QUIZ_MIN_TYPED_POINTS = 200; // a typed answer at the buzzer
export const QUIZ_CHOICE_POINTS = 150; // a correct multiple-choice pick
/** Extra score weight per difficulty tier above 1 (tier 4 => x1.6). */
export const QUIZ_TIER_BONUS = 0.2;

// --- Guess the Character ---

export const CHAR_DEFAULT_ROUNDS = 10;
export const CHAR_MIN_ROUNDS = 1;
export const CHAR_MAX_ROUNDS = 100;
/** Most-favorited characters kept per anime for this game. */
export const CHAR_CAP_PER_ANIME = 35;

/** Base points for Eyes Only / Silhouette (Zoom/Blur use CHAR_LEVEL_POINTS). */
export const CHAR_BASE_POINTS = 300;

/** Speed bonus: starts at START, drops STEP every INTERVAL seconds, min 0. */
export const CHAR_SPEED_START = 100;
export const CHAR_SPEED_STEP = 10;
export const CHAR_SPEED_INTERVAL = 5;

/** Number of reveal steps for Zoom/Blur and the points per level (1..5). */
export const CHAR_STEPS = 5;
export const CHAR_LEVEL_POINTS = [500, 400, 300, 200, 100];
/** CSS background-size (%) per Extreme Zoom level (most → least zoomed). */
export const CHAR_ZOOM_SIZES = [800, 650, 500, 350, 200];
/** CSS blur (px) per Progressive Blur level (most → least blurred). */
export const CHAR_BLUR_PX = [40, 30, 20, 10, 4];

// --- Guess the Anime ---

export const GA_DEFAULT_ROUNDS = 10;
export const GA_MIN_ROUNDS = 1;
export const GA_MAX_ROUNDS = 50;
/** Base points for a correct anime guess (plus the shared speed bonus). */
export const GA_BASE_POINTS = 300;

// Sanity check kept as a runtime assertion in dev: the four buckets must fill
// exactly one board.
if (RED_CARDS + BLUE_CARDS + NEUTRAL_CARDS + ASSASSIN_CARDS !== BOARD_SIZE) {
  // eslint-disable-next-line no-console
  console.warn(
    '[config] card buckets do not sum to BOARD_SIZE — check data/config.ts'
  );
}
