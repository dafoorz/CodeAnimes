// A cache of preloaded <video> elements, keyed by URL.
//
// Why elements instead of fetch()+blob: the AnimeThemes video CDN doesn't send
// permissive CORS headers, so fetching the bytes fails and we'd fall back to
// streaming (which stalls mid-clip). A media element, however, can load
// cross-origin freely (CORS only restricts *reading* pixels/bytes, not
// playback). So we buffer the portion we actually play into a real <video>
// during the loading screen, then reuse that same buffered element to play —
// no re-download, no mid-clip stall.

const cache = new Map<string, HTMLVideoElement>();

/** Get a preloaded element for a URL, if one was buffered. */
export function getClip(url: string): HTMLVideoElement | undefined {
  return cache.get(url);
}

/**
 * Buffer the first ~clipSeconds of a clip into a reusable <video>. Resolves once
 * enough is buffered (or on canplaythrough / timeout). Paused media elements
 * buffer very little, so we briefly play muted to force the browser to download
 * ahead, then pause and rewind.
 */
export function preloadClip(url: string, clipSeconds: number): Promise<void> {
  if (cache.has(url)) return Promise.resolve();

  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.src = url;
    v.preload = 'auto';
    v.playsInline = true;
    v.muted = true; // muted lets us auto-play to force buffering without a gesture

    // We only ever play the first clipSeconds, so that's all we need buffered.
    const target = clipSeconds + 1.5;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
      try {
        v.pause();
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
      v.muted = false;
      cache.set(url, v);
      resolve();
    };

    const check = () => {
      try {
        const b = v.buffered;
        if (b.length) {
          const end = b.end(b.length - 1);
          if (end >= target || (v.duration && end >= v.duration - 0.25)) finish();
        }
      } catch {
        /* ignore */
      }
    };

    const onMeta = () => {
      // Nudge the browser into buffering ahead by playing (muted) briefly.
      v.play().catch(() => {});
    };

    const cleanup = () => {
      v.removeEventListener('progress', check);
      v.removeEventListener('timeupdate', check);
      v.removeEventListener('canplaythrough', finish);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('error', finish);
      clearTimeout(timer);
    };

    v.addEventListener('progress', check);
    v.addEventListener('timeupdate', check);
    v.addEventListener('canplaythrough', finish);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('error', finish); // cache anyway; playback will try streaming

    // Safety net so a slow/blocked clip never hangs the loading screen forever.
    const timer = setTimeout(finish, 25000);
    v.load();
  });
}

/** Release all cached elements (call when leaving the quiz). */
export function clearClips(): void {
  for (const v of cache.values()) {
    try {
      v.pause();
      v.removeAttribute('src');
      v.load();
    } catch {
      /* ignore */
    }
  }
  cache.clear();
}
