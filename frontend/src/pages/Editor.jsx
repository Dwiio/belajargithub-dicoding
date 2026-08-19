import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipPreview } from "@/components/ClipPreview";
import { ContentPackPanel } from "@/components/ContentPackPanel";
import { ExportModal } from "@/components/ExportModal";
import { ScoreBadge, scoreTier } from "@/components/ScoreBadge";
import { fmtDur } from "@/components/ClipCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft, Type, Crop, Zap, Package, Download, Check, Loader2, Subtitles,
} from "lucide-react";

const CAPTION_STYLES = ["Clean", "Bold", "Highlight", "Viral", "Minimal"];
const ASPECTS = [
  { id: "9:16", label: "9:16 · Reels/Shorts" },
  { id: "1:1", label: "1:1 · Square" },
  { id: "16:9", label: "16:9 · Landscape" },
];
const BREAKDOWN = [["Hook", "hook"], ["Engagement", "engagement"], ["Clarity", "clarity"], ["Emotion", "emotion"], ["Shareability", "shareability"]];

export default function Editor() {
  const { clipId } = useParams();
  const nav = useNavigate();
  const [clip, setClip] = useState(null);
  const [captionStyle, setCaptionStyle] = useState("Bold");
  const [aspect, setAspect] = useState("9:16");
  const [captions, setCaptions] = useState([]);
  const [saveState, setSaveState] = useState("saved"); // saved | saving | unsaved
  const [showExport, setShowExport] = useState(false);
  const [regen, setRegen] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    api.get(`/clips/${clipId}`).then(({ data }) => {
      setClip(data);
      setCaptionStyle(data.caption_style || "Bold");
      setAspect(data.aspect_ratio || "9:16");
      setCaptions(data.captions || []);
    }).catch(() => toast.error("Couldn't load clip."));
  }, [clipId]);

  const save = useCallback(async (patch) => {
    setSaveState("saving");
    try {
      const { data } = await api.patch(`/clips/${clipId}`, patch);
      setClip(data);
      setSaveState("saved");
    } catch { setSaveState("unsaved"); toast.error("Couldn't save changes."); }
  }, [clipId]);

  // autosave on style/aspect/caption edits (debounced)
  useEffect(() => {
    if (!clip) return;
    if (first.current) { first.current = false; return; }
    setSaveState("unsaved");
    const t = setTimeout(() => save({ caption_style: captionStyle, aspect_ratio: aspect, captions }), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captionStyle, aspect, captions]);

  const regenPack = async () => {
    setRegen(true);
    try {
      const { data } = await api.post(`/clips/${clipId}/content-pack`);
      setClip((c) => ({ ...c, content_pack: data }));
      toast.success("Fresh content pack generated");
    } catch { toast.error("Couldn't regenerate."); }
    setRegen(false);
  };

  if (!clip) {
    return <div className="grid lg:grid-cols-[280px_1fr_340px] gap-4"><Skeleton className="h-96 rounded-2xl bg-white/[0.04]" /><Skeleton className="h-96 rounded-2xl bg-white/[0.04]" /><Skeleton className="h-96 rounded-2xl bg-white/[0.04]" /></div>;
  }

  const tier = scoreTier(clip.score);

  return (
    <div data-testid="editor-page">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => nav(-1)} className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs inline-flex items-center gap-1.5 text-slate-400" data-testid="autosave-indicator">
            {saveState === "saving" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              : saveState === "unsaved" ? <>Unsaved changes</>
              : <><Check className="w-3.5 h-3.5 text-emerald-400" /> Saved</>}
          </span>
          <button onClick={() => setShowExport(true)} data-testid="editor-export-btn"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr_360px] gap-4">
        {/* LEFT: tools */}
        <div className="surface-1 border border-white/[0.08] rounded-2xl p-4 order-2 lg:order-1">
          <Tabs defaultValue="captions">
            <TabsList className="grid grid-cols-4 bg-white/[0.04] mb-4">
              <TabsTrigger value="captions" data-testid="tool-captions"><Subtitles className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="reframe" data-testid="tool-reframe"><Crop className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="text" data-testid="tool-text"><Type className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="score" data-testid="tool-score"><Zap className="w-4 h-4" /></TabsTrigger>
            </TabsList>

            <TabsContent value="captions" className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Caption Style</p>
              {CAPTION_STYLES.map((s) => (
                <button key={s} onClick={() => setCaptionStyle(s)} data-testid={`caption-style-${s}`}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${captionStyle === s ? "border-violet-500 bg-violet-500/15 text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>{s}</button>
              ))}
            </TabsContent>

            <TabsContent value="reframe" className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Aspect Ratio</p>
              {ASPECTS.map((a) => (
                <button key={a.id} onClick={() => setAspect(a.id)} data-testid={`aspect-${a.id}`}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${aspect === a.id ? "border-violet-500 bg-violet-500/15 text-white" : "border-white/10 text-slate-400 hover:text-white"}`}>{a.label}</button>
              ))}
              <p className="text-xs text-slate-500 mt-3">Smart reframe keeps the active speaker centered.</p>
            </TabsContent>

            <TabsContent value="text" className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Caption Lines</p>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {captions.map((c, i) => (
                  <input key={i} value={c.text} data-testid={`caption-line-${i}`}
                         onChange={(e) => setCaptions((cs) => cs.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                         className="w-full surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-3 py-2 text-sm outline-none" />
                ))}
                {captions.length === 0 && <p className="text-sm text-slate-500">No caption lines.</p>}
              </div>
            </TabsContent>

            <TabsContent value="score" className="space-y-3">
              <div className="flex items-center gap-3">
                <ScoreBadge score={clip.score} size={56} showLabel />
              </div>
              <p className="text-[11px] text-slate-500">Based on content characteristics, not guaranteed performance.</p>
              <div className="space-y-2.5 mt-3">
                {BREAKDOWN.map(([label, key]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{label}</span><span className="font-mono text-white">{clip.score_breakdown?.[key] ?? 0}</span></div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${clip.score_breakdown?.[key] ?? 0}%`, background: tier.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* CENTER: preview + timeline */}
        <div className="order-1 lg:order-2 space-y-4">
          <div className="surface-1 border border-white/[0.08] rounded-2xl p-4">
            <div className="mx-auto" style={{ maxWidth: aspect === "16:9" ? "100%" : aspect === "1:1" ? 420 : 300 }}>
              <ClipPreview videoId={clip.video_id} start={clip.start} end={clip.end}
                           captions={captions} captionStyle={captionStyle} aspectRatio={aspect} testId="editor-preview" />
            </div>
          </div>
          {/* Timeline */}
          <div className="surface-1 border border-white/[0.08] rounded-2xl p-4" data-testid="editor-timeline">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-slate-500">Timeline</span>
              <span className="font-mono text-xs text-slate-400">{fmtDur(clip.start)} – {fmtDur(clip.end)} · {fmtDur(clip.duration)}</span>
            </div>
            <div className="relative h-8 rounded-lg bg-white/[0.04] overflow-hidden mb-2">
              <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-violet-600/40 to-indigo-600/30" />
              <span className="absolute inset-0 grid place-items-center text-[10px] font-mono text-white/70">VIDEO TRACK</span>
            </div>
            <div className="relative h-6 rounded-lg bg-white/[0.03] overflow-hidden">
              {captions.map((c, i) => {
                const total = clip.duration || 1;
                return <div key={i} className="absolute top-1 bottom-1 rounded bg-violet-500/50 border border-violet-400/40"
                            style={{ left: `${(c.start / total) * 100}%`, width: `${Math.max(1.5, ((c.end - c.start) / total) * 100)}%` }} />;
              })}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/50 pointer-events-none">CAPTIONS</span>
            </div>
          </div>
        </div>

        {/* RIGHT: details + content pack */}
        <div className="order-3 space-y-4">
          <div className="surface-1 border border-white/[0.08] rounded-2xl p-5">
            <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-semibold ${tier.bg} ${tier.text} border ${tier.border}`}>{clip.category}</span>
            <h2 className="font-display font-semibold text-lg mt-3">{clip.title}</h2>
            {clip.hook && <p className="text-sm text-slate-400 mt-2 italic">"{clip.hook}"</p>}
            {clip.reason && <p className="text-xs text-slate-500 mt-3">{clip.reason}</p>}
          </div>
          <div className="surface-1 border border-white/[0.08] rounded-2xl p-5">
            <ContentPackPanel clip={clip} onRegenerate={regenPack} regenerating={regen} />
          </div>
        </div>
      </div>

      <ExportModal open={showExport} onOpenChange={setShowExport} clip={{ ...clip, aspect_ratio: aspect, caption_style: captionStyle }} />
    </div>
  );
}
