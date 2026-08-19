import { useEffect, useState } from "react";
import { ContentPackPanel } from "@/components/ContentPackPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/pages/Dashboard";
import api from "@/lib/api";
import { toast } from "sonner";
import { Package, Download, Hash } from "lucide-react";

export default function ContentPacks() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [regen, setRegen] = useState(false);

  useEffect(() => { api.get("/clips").then(({ data }) => setClips(data)).finally(() => setLoading(false)); }, []);

  const exportAll = () => {
    if (clips.length === 0) return;
    const text = clips.map((c, i) => {
      const cp = c.content_pack || {};
      return `=== CLIP ${i + 1}: ${c.title} ===\nTITLE: ${cp.title}\nHOOK: ${cp.hook}\nCAPTION:\n${cp.social_caption}\nHASHTAGS: ${(cp.hashtags || []).join(" ")}\nTHUMBNAIL: ${cp.thumbnail_text}\nCTA: ${cp.cta}\n`;
    }).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "clapclip-content-packs.txt"; a.click();
    toast.success("All content packs exported");
  };

  const regenPack = async () => {
    if (!active) return;
    setRegen(true);
    try {
      const { data } = await api.post(`/clips/${active.id}/content-pack`);
      setActive({ ...active, content_pack: data });
      setClips((cs) => cs.map((c) => c.id === active.id ? { ...c, content_pack: data } : c));
      toast.success("Fresh content pack generated");
    } catch { toast.error("Couldn't regenerate."); }
    setRegen(false);
  };

  return (
    <div data-testid="content-packs-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl">Content Packs</h1>
          <p className="text-slate-400 mt-1">Ready-to-post titles, captions, hashtags & thumbnails for every clip.</p>
        </div>
        {clips.length > 0 && (
          <button onClick={exportAll} data-testid="export-all-packs"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors">
            <Download className="w-4 h-4" /> Export All
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/[0.04] animate-pulse" />)}</div>
      ) : clips.length === 0 ? (
        <EmptyState icon={Package} title="Your content packs will appear here." desc="Generate clips to unlock ready-to-post content packs." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((c, i) => {
            const cp = c.content_pack || {};
            return (
              <button key={c.id} onClick={() => setActive(c)} data-testid={`pack-card-${i}`}
                      className="text-left rounded-2xl border border-white/[0.08] surface-1 p-5 hover:border-violet-500/40 transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold mb-2"><Package className="w-3.5 h-3.5" /> Content Pack</div>
                <h3 className="font-display font-semibold line-clamp-2">{cp.title || c.title}</h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{cp.social_caption}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(cp.hashtags || []).slice(0, 3).map((h, j) => (
                    <span key={j} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 text-[11px]"><Hash className="w-2.5 h-2.5" />{h.replace("#", "")}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="surface-1 border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{active?.title}</DialogTitle></DialogHeader>
          {active && <ContentPackPanel clip={active} onRegenerate={regenPack} regenerating={regen} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
