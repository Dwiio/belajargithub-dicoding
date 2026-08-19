import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { EmptyState } from "@/pages/Dashboard";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreVertical, Search, Trash2, Pencil, FolderOpen, FolderKanban } from "lucide-react";

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function Projects() {
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [del, setDel] = useState(null);
  const [rename, setRename] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  const load = () => api.get("/projects").then(({ data }) => setProjects(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const doDelete = async () => {
    try { await api.delete(`/projects/${del.id}`); setProjects((p) => p.filter((x) => x.id !== del.id)); toast.success("Project deleted"); }
    catch { toast.error("Couldn't delete."); }
    setDel(null);
  };
  const doRename = async () => {
    try { await api.patch(`/projects/${rename.id}`, { title: renameVal }); setProjects((p) => p.map((x) => x.id === rename.id ? { ...x, title: renameVal } : x)); toast.success("Renamed"); }
    catch { toast.error("Couldn't rename."); }
    setRename(null);
  };

  const filtered = projects.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div data-testid="projects-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl">My Projects</h1>
          <p className="text-slate-400 mt-1">Every video you turn into content lives here.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." data-testid="projects-search"
                 className="surface-2 border border-white/10 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2 text-sm outline-none w-full sm:w-64" />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-2xl bg-white/[0.04] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Your first clip is one paste away." desc="Create a project from the dashboard to see it here."
                    action={<button onClick={() => nav("/app/create")} className="mt-5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold transition-colors">Create Your First Clip</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                        className="group rounded-2xl border border-white/[0.08] surface-1 overflow-hidden hover:border-violet-500/40 transition-all" data-testid={`project-card-${i}`}>
              <button onClick={() => nav(p.status === "completed" ? `/app/results/${p.id}` : `/app/processing/${p.id}`)} className="block w-full text-left">
                <div className="aspect-video overflow-hidden bg-black relative">
                  <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold ${p.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : p.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>{p.status}</span>
                </div>
              </button>
              <div className="p-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{p.clip_count || 0} clips · {timeAgo(p.created_at)}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button className="text-slate-500 hover:text-white p-1" data-testid={`project-menu-${i}`}><MoreVertical className="w-4 h-4" /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="surface-1 border-white/10 text-white">
                    <DropdownMenuItem onClick={() => nav(`/app/results/${p.id}`)} className="focus:bg-white/10 cursor-pointer"><FolderOpen className="w-4 h-4 mr-2" /> Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setRename(p); setRenameVal(p.title); }} className="focus:bg-white/10 cursor-pointer"><Pencil className="w-4 h-4 mr-2" /> Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDel(p)} className="focus:bg-white/10 cursor-pointer text-red-400"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent className="surface-1 border-white/10 text-white">
          <AlertDialogHeader><AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">This removes "{del?.title}" and all its clips. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.12]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} data-testid="confirm-delete-project" className="bg-red-600 hover:bg-red-500 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!rename} onOpenChange={(o) => !o && setRename(null)}>
        <DialogContent className="surface-1 border-white/10 text-white">
          <DialogHeader><DialogTitle>Rename project</DialogTitle></DialogHeader>
          <input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} data-testid="rename-input"
                 className="surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-4 py-2.5 outline-none" />
          <DialogFooter>
            <button onClick={doRename} data-testid="confirm-rename" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
