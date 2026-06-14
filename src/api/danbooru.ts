// Danbooru image client for the "Guess the Anime" image modes.
//
// Free, CORS-enabled JSON API. Anonymous searches are limited to 2 tags, so we
// query `<copyright> <theme>` and filter to the safe `rating:g` client-side
// (general-audience). Returns a direct image URL or null.

const BASE = 'https://danbooru.donmai.us';

// Gentle shared throttle so a burst of look-ups stays polite.
let chain: Promise<unknown> = Promise.resolve();
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const out = await task();
    await delay(250);
    return out;
  });
  chain = run.catch(() => undefined);
  return run;
}

interface Post {
  rating?: string;
  large_file_url?: string;
  file_url?: string;
}

/**
 * Fetch a random safe image for `<copyrightTag> <themeTag>`. A random page adds
 * variety across games. Returns null if nothing safe/usable was found.
 */
export async function fetchScene(
  copyrightTag: string,
  themeTag: string
): Promise<string | null> {
  return throttled(async () => {
    const page = 1 + Math.floor(Math.random() * 3);
    const params = new URLSearchParams({
      tags: `${copyrightTag} ${themeTag}`,
      limit: '40',
      page: String(page),
    });
    try {
      const res = await fetch(`${BASE}/posts.json?${params.toString()}`);
      if (!res.ok) return null;
      const posts = (await res.json()) as Post[];
      const safe = posts.filter(
        (p) => p.rating === 'g' && (p.large_file_url || p.file_url)
      );
      if (safe.length === 0) return null;
      const pick = safe[Math.floor(Math.random() * safe.length)];
      return pick.large_file_url || pick.file_url || null;
    } catch {
      return null;
    }
  });
}
