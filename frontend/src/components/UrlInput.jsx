import { useState } from "react";
import { Youtube, Sparkles, ClipboardPaste, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SAMPLES = [
  { label: "Startup Podcast", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "AI & Content 2026", url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ" },
  { label: "Creator Growth", url: "https://www.youtube.com/watch?v=L_LUpnjgPso" },
];

export function UrlInput({ onGenerate, loading, showOptions = false, ctaLabel = "Generate Clips", initialUrl = "" }) {
  const [url, setUrl] = useState(initialUrl);
  const [numClips, setNumClips] = useState(6);
  const [duration, setDuration] = useState("auto");

  const paste = async () => {
    try { const t = await navigator.clipboard.readText(); setUrl(t); toast.success("Pasted from clipboard"); }
    catch { toast.error("Couldn't read clipboard"); }
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!url.trim()) { toast.error("Please paste a YouTube URL first."); return; }
    onGenerate(url.trim(), { num_clips: numClips, clip_duration: duration });
  };

  return (
    <form onSubmit={submit} className="w-full" data-testid="url-input-form">
      <div className="relative flex items-center gap-2 surface-1 border border-violet-500/30 rounded-2xl p-2 shadow-[0_0_40px_rgba(124,58,237,0.12)] focus-within:border-violet-500 transition-colors">
        <Youtube className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
        <input
          value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL..." data-testid="youtube-url-input"
          className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none py-2.5 text-base min-w-0"
        />
        <button type="button" onClick={paste} data-testid="paste-btn" title="Paste"
                className="hidden sm:grid place-items-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0">
          <ClipboardPaste className="w-4 h-4" />
        </button>
        <button type="submit" disabled={loading} data-testid="generate-clips-button"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition-all shrink-0 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="hidden sm:inline">{ctaLabel}</span>
        </button>
      </div>

      {showOptions && (
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500">Clips</span>
            {[5, 10, 20].map((n) => (
              <button type="button" key={n} onClick={() => setNumClips(n)} data-testid={`num-clips-${n}`}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${numClips === n ? "bg-violet-600 text-white" : "bg-white/[0.06] text-slate-400 hover:text-white"}`}>{n}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500">Length</span>
            {["auto", "15", "30", "60"].map((d) => (
              <button type="button" key={d} onClick={() => setDuration(d)} data-testid={`duration-${d}`}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${duration === d ? "bg-violet-600 text-white" : "bg-white/[0.06] text-slate-400 hover:text-white"}`}>{d === "auto" ? "Auto" : `${d}s`}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-xs text-slate-500">Try:</span>
        {SAMPLES.map((s) => (
          <button type="button" key={s.url} onClick={() => setUrl(s.url)} data-testid={`sample-${s.label}`}
                  className="px-3 py-1 rounded-full border border-white/10 text-xs text-slate-300 hover:border-violet-500/50 hover:text-white transition-colors">
            {s.label}
          </button>
        ))}
      </div>
    </form>
  );
}
