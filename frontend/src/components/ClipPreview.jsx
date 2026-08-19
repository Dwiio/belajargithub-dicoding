import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

let ytApiPromise = null;
function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
  });
  return ytApiPromise;
}

const CAPTION_STYLES = {
  Clean: "text-white font-semibold",
  Bold: "text-white font-extrabold uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]",
  Highlight: "text-white font-bold",
  Viral: "text-yellow-300 font-extrabold uppercase tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]",
  Minimal: "text-white/90 font-medium",
};

const ASPECTS = { "9:16": 9 / 16, "1:1": 1, "16:9": 16 / 9 };

export function ClipPreview({
  videoId, start = 0, end = 30, captions = [], captionStyle = "Bold",
  aspectRatio = "9:16", className, autoplay = false, showCaptions = true, testId,
}) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const rafRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [rel, setRel] = useState(0);
  const uid = useRef(`yt-${Math.random().toString(36).slice(2)}`);

  const tick = useCallback(() => {
    const p = playerRef.current;
    if (p && p.getCurrentTime) {
      const t = p.getCurrentTime();
      if (t >= end - 0.05) { p.seekTo(start, true); }
      setRel(Math.max(0, t - start));
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [start, end]);

  useEffect(() => {
    let cancelled = false;
    loadYT().then((YT) => {
      if (cancelled || !hostRef.current) return;
      playerRef.current = new YT.Player(uid.current, {
        videoId,
        playerVars: {
          start: Math.floor(start), end: Math.ceil(end), autoplay: autoplay ? 1 : 0,
          controls: 0, modestbranding: 1, rel: 0, playsinline: 1, disablekb: 1, iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            setReady(true);
            e.target.mute();
            if (autoplay) { e.target.playVideo(); setPlaying(true); }
            rafRef.current = requestAnimationFrame(tick);
          },
          onStateChange: (e) => {
            setPlaying(e.data === 1);
            if (e.data === 0) { e.target.seekTo(start, true); e.target.playVideo(); }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, start, end]);

  const toggle = () => {
    const p = playerRef.current; if (!p) return;
    if (playing) { p.pauseVideo(); } else { p.seekTo(start, true); p.playVideo(); }
  };
  const toggleMute = () => {
    const p = playerRef.current; if (!p) return;
    if (muted) { p.unMute(); setMuted(false); } else { p.mute(); setMuted(true); }
  };

  const active = captions.find((c) => rel >= c.start && rel <= c.end);
  const ratio = ASPECTS[aspectRatio] || 9 / 16;
  const pct = end > start ? Math.min(100, (rel / (end - start)) * 100) : 0;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-black border border-white/10 group", className)}
         style={{ aspectRatio: ratio }} data-testid={testId || "clip-preview"}>
      {/* cropped 16:9 iframe -> reframed */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
           style={{ height: "100%", width: `calc(100% * ${(16 / 9) / ratio})`, minWidth: "100%" }}>
        <div id={uid.current} ref={hostRef} className="w-full h-full pointer-events-none" />
      </div>

      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-[#0B0C10]">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* captions */}
      {showCaptions && active && (
        <div className="absolute left-0 right-0 bottom-[16%] px-4 flex justify-center pointer-events-none">
          <span key={active.text + active.start}
                className={cn("caption-pop text-center leading-tight px-2 text-[clamp(1rem,4.5vw,1.6rem)]", CAPTION_STYLES[captionStyle] || CAPTION_STYLES.Bold)}>
            {active.text}
          </span>
        </div>
      )}

      {/* controls */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={toggle} data-testid="clip-play-toggle"
                className="grid place-items-center w-14 h-14 rounded-full bg-black/50 backdrop-blur text-white hover:bg-violet-600 transition-colors">
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>
      <button onClick={toggleMute} data-testid="clip-mute-toggle"
              className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white hover:bg-white/20 transition-colors">
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* progress */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div className="h-full bg-violet-500 transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
