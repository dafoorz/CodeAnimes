import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getClip } from '../../quiz/clipCache';

export interface ClipPlayerHandle {
  /** Force playback (used by a tap-to-play fallback). */
  play: () => void;
}

interface Props {
  /** Clip URL; used as the cache key for the preloaded element. */
  url: string;
  /** Seconds to play before pausing (the quiz clip length). */
  clipSeconds: number;
  /** Effective volume 0–1 (already accounts for mute). */
  volume: number;
  /** Called each frame with seconds remaining on the clip. */
  onTick?: (secondsLeft: number) => void;
  /** Fired once when the clip reaches clipSeconds. */
  onCap?: () => void;
  /** Reports whether playback needs a user gesture (autoplay blocked). */
  onNeedGesture?: (need: boolean) => void;
}

/**
 * Mounts the preloaded <video> for `url` (from clipCache) and plays its first
 * clipSeconds. Reusing the buffered element means playback starts instantly and
 * never stalls to download.
 */
const ClipPlayer = forwardRef<ClipPlayerHandle, Props>(function ClipPlayer(
  { url, clipSeconds, volume, onTick, onCap, onNeedGesture },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current
        ?.play()
        .then(() => onNeedGesture?.(false))
        .catch(() => onNeedGesture?.(true));
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !url) return;

    // Reuse the preloaded element, or create one as a fallback (will stream).
    let v = getClip(url);
    if (!v) {
      v = document.createElement('video');
      v.src = url;
      v.preload = 'auto';
    }
    v.playsInline = true;
    v.muted = false;
    v.volume = volume;
    v.className = 'h-full w-full object-cover';

    container.replaceChildren(v);
    videoRef.current = v;

    let capped = false;
    try {
      v.currentTime = 0;
    } catch {
      /* ignore */
    }
    v.play()
      .then(() => onNeedGesture?.(false))
      .catch(() => onNeedGesture?.(true));

    let raf = 0;
    const tick = () => {
      const cur = v!.currentTime;
      onTick?.(Math.max(0, clipSeconds - cur));
      if (cur >= clipSeconds && !capped) {
        capped = true;
        v!.pause();
        onCap?.();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      try {
        v!.pause();
      } catch {
        /* ignore */
      }
      if (container.contains(v!)) container.removeChild(v!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, clipSeconds]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  return <div ref={containerRef} className="h-full w-full" />;
});

export default ClipPlayer;
