// AnimeThemes.moe API client for the opening quiz.
//
// Free, no API key, CORS-enabled. We query an anime by name, then dig out one
// of its opening (OP) themes and the direct URL to the opening video file
// (a .webm on the AnimeThemes CDN that carries both video and audio).

import { ANIMETHEMES_BASE } from '../data/config';

export interface OpeningMeta {
  animeName: string;
  songTitle: string | null;
  /** Direct webm URL (video + audio). */
  videoUrl: string;
  /** Direct audio-only URL (small .ogg), if available. */
  audioUrl: string | null;
}

// Minimal shapes for the fields we read.
interface VideoT {
  link?: string;
  resolution?: number;
  size?: number;
  audio?: { link?: string };
}
interface EntryT {
  videos?: VideoT[];
}
interface ThemeT {
  type?: string; // "OP" | "ED"
  song?: { title?: string } | null;
  animethemeentries?: EntryT[];
}
interface AnimeT {
  name: string;
  animethemes?: ThemeT[];
}

// Gentle shared throttle so a burst of look-ups stays well under any limit.
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

/** Pick the smallest (lowest-resolution) video with a link, to keep downloads light. */
function smallestVideo(videos: VideoT[] = []): VideoT | undefined {
  return videos
    .filter((v) => v.link)
    .sort(
      (a, b) =>
        (a.resolution ?? a.size ?? 1e9) - (b.resolution ?? b.size ?? 1e9)
    )[0];
}

/** Pull a playable OP video (+ audio) URL out of an anime record, if any. */
function extractOpening(anime: AnimeT): OpeningMeta | null {
  const ops = (anime.animethemes ?? []).filter((t) => t.type === 'OP');
  for (const theme of ops) {
    for (const entry of theme.animethemeentries ?? []) {
      const video = smallestVideo(entry.videos);
      if (video?.link) {
        return {
          animeName: anime.name,
          songTitle: theme.song?.title ?? null,
          videoUrl: video.link,
          audioUrl: video.audio?.link ?? null,
        };
      }
    }
  }
  return null;
}

/**
 * Find an opening clip for a search query. Returns null if nothing playable is
 * found or the request fails (callers skip/replace failed songs).
 */
export async function fetchOpening(query: string): Promise<OpeningMeta | null> {
  return throttled(async () => {
    const params = new URLSearchParams({
      q: query,
      include: 'animethemes.animethemeentries.videos.audio,animethemes.song',
      'page[size]': '4',
      'fields[anime]': 'name,slug',
    });
    try {
      const res = await fetch(`${ANIMETHEMES_BASE}/anime?${params.toString()}`);
      if (!res.ok) return null;
      const json = (await res.json()) as { anime?: AnimeT[] };
      for (const anime of json.anime ?? []) {
        const op = extractOpening(anime);
        if (op) return op;
      }
      return null;
    } catch {
      return null;
    }
  });
}
