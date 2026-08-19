import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipCard, fmtDur } from "@/components/ClipCard";
import { ContentPackPanel } from "@/components/ContentPackPanel";
import { ExportModal } from "@/components/ExportModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Clock, Film, Download } from "lucide-react";

const FILTERS = ["All", "High Potential", "Viral", "Educational", "Funny", "Emotional", "Business", "Storytelling"];

export default function Results() {
  const { projectId } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("score");
  const [packClip, setPackClip] = useState(null);
  const [regen, setRegen] = useState(false);
  const [exportClip, setExportClip] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`).then(({ data }) => setProject(data)),
      api.get(`/projects/${projectId}/clips`).then(({ data }) => setClips(data)),
    ]).catch(() => toast.error("Couldn't load results.")).finally(() => setLoading(false));
  }, [projectId]);

  const shown = useMemo(() => {
    let list = [...clips];
    if (filter === "High Potential") list = list.filter((c) => c.score >= 85);
    else if (filter !== "All") list = list.filter((c) => c.category === filter);
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    else if (sort === "duration") list.sort((a, b) => b.duration - a.duration);
    else if (sort === "time") list.sort((a, b) => a.start - b.start);
    return list;
  }, [clips, filter, sort]);

  const regenPack = async () => {
    if (!packClip) return;
    setRegen(true);
    try {
      const { data } = await api.post(`/clips/${packClip.id}/content-pack`);
      const updated = { ...packClip, content_pack: data };
      setPackClip(updated);
      setClips((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
      toast.success("Fresh content pack generated");
    } catch { toast.error("Couldn't regenerate."); }
    setRegen(false);
  };

  return (
    <div data-testid="results-page">
      <button onClick={() => nav("/app/projects")} className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1.5 mb-5">
        <ArrowLeft className="w-4 h-4" /> Projects
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display font-extrabold text-2xl lg:text-3xl">Your clips are ready.</motion.h1>
          <p className="text-slate-400 mt-2">
            We found <span className="text-white font-semibold">{clips.length}</span> moments worth turning into short-form content
            {project && <span className="text-slate-500"> · {fmtDur(project.duration_seconds)} source</span>}.
          </p>
        </div>
        <button onClick={() => shown[0] && setExportClip(shown[0])} data-testid="export-all-btn"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm transition-colors self-start sm:self-auto">
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`filter-${f}`}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-violet-600 text-white" : "bg-white/[0.05] text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px] surface-2 border-white/10" data-testid="sort-select"><SelectValue /></SelectTrigger>
          <SelectContent className="surface-1 border-white/10 text-white">
            <SelectItem value="score">Highest Score</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="time">Time in Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.04]" />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><Film className="w-8 h-8 mx-auto mb-3" />No clips match this filter.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((c, i) => (
            <ClipCard key={c.id} clip={c} index={i}
                      onOpen={(cl) => nav(`/app/editor/${cl.id}`)}
                      onContentPack={(cl) => setPackClip(cl)}
                      onExport={(cl) => setExportClip(cl)} />
          ))}
        </div>
      )}

      <Dialog open={!!packClip} onOpenChange={(o) => !o && setPackClip(null)}>
        <DialogContent className="surface-1 border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><Clock className="w-4 h-4 text-violet-400" /> {packClip?.title}</DialogTitle></DialogHeader>
          {packClip && <ContentPackPanel clip={packClip} onRegenerate={regenPack} regenerating={regen} />}
        </DialogContent>
      </Dialog>

      <ExportModal open={!!exportClip} onOpenChange={(o) => !o && setExportClip(null)} clip={exportClip} />
    </div>
  );
}
