import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Mic, Brain, Crop, Sparkles, Check, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

const STAGES = [
  { icon: Download, label: "Fetching video & metadata" },
  { icon: Mic, label: "Transcribing audio" },
  { icon: Brain, label: "AI highlight & hook detection" },
  { icon: Crop, label: "Smart reframe & captions" },
  { icon: Sparkles, label: "Content pack synthesis" },
];

export default function Processing() {
  const { projectId } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setProject(data);
        if (data.status === "completed") { clearInterval(timer.current); setTimeout(() => nav(`/app/results/${projectId}`), 700); }
        if (data.status === "failed") { clearInterval(timer.current); setError(data.error || "We couldn't process this video. Please try again."); }
      } catch {
        clearInterval(timer.current); setError("Connection interrupted. Your project is safe. Try again.");
      }
    };
    poll();
    timer.current = setInterval(poll, 1500);
    return () => clearInterval(timer.current);
  }, [projectId, nav]);

  const stage = project?.progress_stage || 0;

  if (error) {
    return (
      <div className="max-w-md mx-auto py-24 text-center" data-testid="processing-error">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 mx-auto"><AlertTriangle className="w-6 h-6" /></span>
        <h2 className="font-display font-semibold text-xl mt-5">Something went wrong</h2>
        <p className="text-slate-400 mt-2">{error}</p>
        <button onClick={() => nav("/app/create")} data-testid="processing-retry"
                className="mt-6 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold transition-colors">Try another video</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-16 text-center" data-testid="processing-page">
      <div className="relative w-28 h-28 mx-auto mb-8">
        <div className="pulse-ring absolute inset-0 rounded-full" />
        <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" style={{ animationDuration: "1.2s" }} />
        <div className="absolute inset-0 grid place-items-center">
          <Sparkles className="w-9 h-9 text-violet-400" />
        </div>
      </div>

      <h1 className="font-display font-extrabold text-2xl lg:text-3xl">ClapClip is finding your best moments...</h1>
      <p className="text-slate-400 mt-2">{project?.title && project.title !== "Untitled Project" ? project.title : "Analyzing your video"}</p>

      <div className="mt-10 text-left space-y-2 max-w-sm mx-auto">
        {STAGES.map((s, i) => {
          const idx = i + 1;
          const done = stage > idx || project?.status === "completed";
          const active = stage === idx && project?.status !== "completed";
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${
                          active ? "border-violet-500/40 bg-violet-500/10" : done ? "border-white/[0.06] bg-white/[0.02]" : "border-white/[0.05] opacity-50"}`}
                        data-testid={`stage-${i}`}>
              <span className={`grid place-items-center w-7 h-7 rounded-full shrink-0 ${done ? "bg-emerald-500/20 text-emerald-400" : active ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-500"}`}>
                {done ? <Check className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <s.icon className="w-3.5 h-3.5" />}
              </span>
              <span className={`text-sm font-medium ${done || active ? "text-white" : "text-slate-500"}`}>{s.label}</span>
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs text-slate-600 mt-8">This usually takes 20–40 seconds. Please keep this tab open.</p>
    </div>
  );
}
