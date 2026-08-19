import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipCard } from "@/components/ClipCard";
import { ContentPackPanel } from "@/components/ContentPackPanel";
import { ExportModal } from "@/components/ExportModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/pages/Dashboard";
import api from "@/lib/api";
import { toast } from "sonner";
import { Search, Film } from "lucide-react";

export default function AllClips() {
  const nav = useNavigate();
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [packClip, setPackClip] = useState(null);
  const [exportClip, setExportClip] = useState(null);
  const [regen, setRegen] = useState(false);

  useEffect(() => { api.get("/clips").then(({ data }) => setClips(data)).finally(() => setLoading(false)); }, []);

  const regenPack = async () => {
    if (!packClip) return;
    setRegen(true);
    try {
      const { data } = await api.post(`/clips/${packClip.id}/content-pack`);
      setPackClip({ ...packClip, content_pack: data });
      setClips((cs) => cs.map((c) => c.id === packClip.id ? { ...c, content_pack: data } : c));
      toast.success("Fresh content pack generated");
    } catch { toast.error("Couldn't regenerate."); }
    setRegen(false);
  };

  const filtered = clips.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()) || (c.category || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div data-testid="all-clips-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl">All Clips</h1>
          <p className="text-slate-400 mt-1">Your entire clip library, scored and ready to publish.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clips..." data-testid="clips-search"
                 className="surface-2 border border-white/10 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2 text-sm outline-none w-full sm:w-64" />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.04] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Film} title="Your best moments will appear here." desc="Generate clips from a project to build your library." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <ClipCard key={c.id} clip={c} index={i}
                      onOpen={(cl) => nav(`/app/editor/${cl.id}`)}
                      onContentPack={(cl) => setPackClip(cl)}
                      onExport={(cl) => setExportClip(cl)} />
          ))}
        </div>
      )}

      <Dialog open={!!packClip} onOpenChange={(o) => !o && setPackClip(null)}>
        <DialogContent className="surface-1 border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{packClip?.title}</DialogTitle></DialogHeader>
          {packClip && <ContentPackPanel clip={packClip} onRegenerate={regenPack} regenerating={regen} />}
        </DialogContent>
      </Dialog>
      <ExportModal open={!!exportClip} onOpenChange={(o) => !o && setExportClip(null)} clip={exportClip} />
    </div>
  );
}
