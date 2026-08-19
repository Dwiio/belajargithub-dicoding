import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UrlInput } from "@/components/UrlInput";
import { UsageMeter } from "@/components/UsageMeter";
import { ClipCard } from "@/components/ClipCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Film, FolderKanban, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [projects, setProjects] = useState([]);
  const [clips, setClips] = useState([]);
  const [pending, setPending] = useState("");

  useEffect(() => {
    const p = localStorage.getItem("clapclip_pending_url");
    if (p) { setPending(p); localStorage.removeItem("clapclip_pending_url"); }
    api.get("/usage").then(({ data }) => setUsage(data)).catch(() => {});
    api.get("/projects").then(({ data }) => setProjects(data)).catch(() => {});
    api.get("/clips").then(({ data }) => setClips(data.slice(0, 4))).catch(() => {});
  }, []);

  const generate = async (url, opts) => {
    setLoading(true);
    try {
      const { data } = await api.post("/projects/analyze", { url, ...opts });
      nav(`/app/processing/${data.project_id}`);
    } catch (e) {
      toast.error(apiError(e.response?.data?.detail) || "Couldn't start analysis.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10" data-testid="dashboard-page">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-white/[0.08] surface-1 grid-noise p-8 lg:p-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Welcome back, {user?.name?.split(" ")[0]}
          </div>
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl leading-tight">Turn your next video into content.</h1>
          <p className="text-slate-400 mt-3">Paste a YouTube URL and let ClapClip find the moments worth sharing.</p>
          <div className="mt-6">
            <UrlInput onGenerate={generate} loading={loading} showOptions initialUrl={pending} ctaLabel="Generate Clips" />
          </div>
        </div>
      </motion.section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">Recent projects</h2>
            <Link to="/app/projects" className="text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState icon={FolderKanban} title="Your first clip is one paste away." desc="Paste a YouTube URL above to create your first project." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p) => (
                <button key={p.id} onClick={() => nav(p.status === "completed" ? `/app/results/${p.id}` : `/app/processing/${p.id}`)}
                        data-testid={`dash-project-${p.id}`}
                        className="text-left group rounded-2xl border border-white/[0.08] surface-1 overflow-hidden hover:border-violet-500/40 transition-all hover:-translate-y-0.5">
                  <div className="aspect-video overflow-hidden bg-black relative">
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold ${p.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : p.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>{p.status}</span>
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm truncate">{p.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{p.clip_count || 0} clips</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <UsageMeter usage={usage} />
          <div className="rounded-2xl border border-white/[0.08] surface-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Top clips</h3>
              <Link to="/app/clips" className="text-xs text-violet-400 hover:text-violet-300">All</Link>
            </div>
            {clips.length === 0 ? (
              <p className="text-sm text-slate-500">Your best moments will appear here.</p>
            ) : (
              <div className="space-y-3">
                {clips.map((c) => (
                  <button key={c.id} onClick={() => nav(`/app/editor/${c.id}`)} className="w-full flex items-center gap-3 text-left group" data-testid={`dash-clip-${c.id}`}>
                    <img src={`https://i.ytimg.com/vi/${c.video_id}/default.jpg`} className="w-16 h-10 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-violet-300 transition-colors">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.category}</div>
                    </div>
                    <ScoreBadge score={c.score} size={34} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Film, title, desc, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.12] surface-1 p-12 text-center" data-testid="empty-state">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-violet-500/15 text-violet-300 mx-auto"><Icon className="w-6 h-6" /></span>
      <h3 className="font-display font-semibold text-lg mt-4">{title}</h3>
      {desc && <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">{desc}</p>}
      {action}
    </div>
  );
}
