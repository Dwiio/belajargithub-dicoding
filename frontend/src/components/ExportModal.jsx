import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Download, Link2, Check, Film, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { fmtDur } from "@/components/ClipCard";

const QUALITIES = ["720p", "1080p"];
const ASPECTS = [
  { id: "9:16", label: "9:16", sub: "TikTok / Reels / Shorts" },
  { id: "1:1", label: "1:1", sub: "Instagram Square" },
  { id: "16:9", label: "16:9", sub: "Landscape" },
];

export function ExportModal({ open, onOpenChange, clip }) {
  const [quality, setQuality] = useState("1080p");
  const [aspect, setAspect] = useState("9:16");
  const [burn, setBurn] = useState(true);
  const [phase, setPhase] = useState("idle"); // idle | rendering | done
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) { setPhase("idle"); setProgress(0); setResult(null); setAspect(clip?.aspect_ratio || "9:16"); }
  }, [open, clip]);

  const startExport = async () => {
    setPhase("rendering"); setProgress(6);
    const timer = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 14, 92)), 350);
    try {
      const { data } = await api.post(`/clips/${clip.id}/render`, { quality, aspect_ratio: aspect, burn_captions: burn });
      setResult(data);
      clearInterval(timer); setProgress(100);
      setTimeout(() => setPhase("done"), 500);
    } catch {
      clearInterval(timer);
      toast.error("Rendering failed. Please try again.");
      setPhase("idle");
    }
  };

  const downloadPack = () => {
    const cp = clip.content_pack || {};
    const text = `ClapClip Export — ${clip.title}\nAspect: ${aspect} · Quality: ${quality} · Captions: ${burn ? "burn-in" : "off"}\nClip: ${fmtDur(clip.start)}–${fmtDur(clip.end)}\nWatch: ${result?.share_url}\n\n--- CONTENT PACK ---\nTITLE: ${cp.title}\nHOOK: ${cp.hook}\nCAPTION:\n${cp.social_caption}\nHASHTAGS: ${(cp.hashtags||[]).join(" ")}\nTHUMBNAIL: ${cp.thumbnail_text}\nCTA: ${cp.cta}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${clip.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-clapclip.txt`;
    a.click();
    toast.success("Clip package downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-1 border-white/10 text-white max-w-md" data-testid="export-modal">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Film className="w-5 h-5 text-violet-400" /> Export Clip
          </DialogTitle>
        </DialogHeader>

        {phase === "idle" && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quality</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {QUALITIES.map((q) => (
                  <button key={q} onClick={() => setQuality(q)} data-testid={`export-quality-${q}`}
                          className={`py-2.5 rounded-lg border text-sm font-semibold transition-colors ${quality === q ? "border-violet-500 bg-violet-500/15 text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>{q}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {ASPECTS.map((a) => (
                  <button key={a.id} onClick={() => setAspect(a.id)} data-testid={`export-aspect-${a.id}`}
                          className={`py-2.5 px-1 rounded-lg border text-center transition-colors ${aspect === a.id ? "border-violet-500 bg-violet-500/15" : "border-white/10 hover:border-white/25"}`}>
                    <div className="font-semibold text-sm text-white">{a.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setBurn(!burn)} data-testid="export-burn-toggle"
                    className="flex items-center justify-between w-full rounded-lg border border-white/10 px-4 py-3 hover:border-white/25 transition-colors">
              <span className="text-sm text-white">Burn-in captions</span>
              <span className={`relative w-10 h-5.5 rounded-full transition-colors ${burn ? "bg-violet-600" : "bg-white/15"}`} style={{ height: 22 }}>
                <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${burn ? "left-[20px]" : "left-0.5"}`} />
              </span>
            </button>
            <button onClick={startExport} data-testid="export-start-button"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition-all">
              Export Clip
            </button>
          </div>
        )}

        {phase === "rendering" && (
          <div className="py-6 text-center space-y-4" data-testid="export-rendering">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
            <h3 className="font-display font-semibold text-lg">Rendering your clip...</h3>
            <p className="text-sm text-slate-400">Reframing to {aspect} · {quality} {burn ? "· burning captions" : ""}</p>
            <Progress value={progress} className="h-2 bg-white/10" />
            <span className="font-mono text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
        )}

        {phase === "done" && (
          <div className="py-4 text-center space-y-5" data-testid="export-done">
            <div className="grid place-items-center w-14 h-14 rounded-full bg-emerald-500/15 mx-auto">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Your clip is ready.</h3>
              <p className="text-sm text-slate-400 mt-1">{aspect} · {quality} · {burn ? "captions burned in" : "no captions"}</p>
            </div>
            <div className="grid gap-2">
              <button onClick={downloadPack} data-testid="export-download-button"
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold inline-flex items-center justify-center gap-2 transition-all">
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={() => { navigator.clipboard.writeText(result?.share_url || ""); toast.success("Link copied"); }}
                      data-testid="export-copy-link"
                      className="w-full py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium inline-flex items-center justify-center gap-2 transition-colors">
                <Link2 className="w-4 h-4" /> Copy Link
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
