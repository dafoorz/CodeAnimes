// Danbooru image client for the themed "Guess the Anime" image modes.
//
// Danbooru has categorizable tags (scenery / food / effects) but its API isn't
// CORS-enabled, so the JSON request is routed through a public CORS proxy. The
// returned image URLs are loaded directly (images don't need CORS). Results are
// filtered to the safe `rating:g` (general audiences). Anonymous searches allow
// only 2 tags, so we query `<copyright> <theme>` and filter rating client-side.

// Gentle shared throttle.
let chain: Promise<unknown> = Promise.resolve();
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const out = await task();
    await delay(350);
    return out;
  });
  chain = run.catch(() => undefined);
  return run;
}

const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
];

interface Post {
  rating?: string;
  large_file_url?: string;
  file_url?: string;
}

async function proxiedPosts(url: string): Promise<Post[] | null> {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url));
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) return data as Post[];
    } catch {
      /* try next proxy */
    }
  }
  return null;
}

/** Fetch a random safe image for `<copyrightTag> <themeTag>`, or null. */
export async function fetchScene(
  copyrightTag: string,
  themeTag: string
): Promise<string | null> {
  return throttled(async () => {
    const page = 1 + Math.floor(Math.random() * 3);
    const danbooru =
      `https://danbooru.donmai.us/posts.json?` +
      `tags=${encodeURIComponent(`${copyrightTag} ${themeTag}`)}&limit=40&page=${page}`;
    const posts = await proxiedPosts(danbooru);
    if (!posts) return null;
    const safe = posts.filter(
      (p) => p.rating === 'g' && (p.large_file_url || p.file_url)
    );
    if (safe.length === 0) return null;
    const pick = safe[Math.floor(Math.random() * safe.length)];
    return pick.large_file_url || pick.file_url || null;
  });
}
