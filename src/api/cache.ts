// Thin localStorage cache with TTL, used for fetched character lists and cover
// images so repeated games don't re-hit the Jikan API.

import { CACHE_PREFIX, CACHE_TTL_MS } from '../data/config';

interface CacheEntry<T> {
  value: T;
  storedAt: number;
}

function key(name: string): string {
  return `${CACHE_PREFIX}${name}`;
}

/** Read a cached value, or null if missing/expired/unparseable. */
export function cacheGet<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(key(name));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key(name));
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

/** Write a value to the cache. Silently ignores quota/serialization errors. */
export function cacheSet<T>(name: string, value: T): void {
  try {
    const entry: CacheEntry<T> = { value, storedAt: Date.now() };
    localStorage.setItem(key(name), JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — caching is best-effort, so ignore.
  }
}

// Cache key builders, centralized so producers and consumers stay in sync.
// The version on characters invalidates older caches whenever the selection
// rules change (full roster -> top 15% -> top 15% with a 25 floor).
export const charactersKey = (malId: number) => `characters:v3:${malId}`;
export const coverKey = (malId: number) => `cover:${malId}`;
