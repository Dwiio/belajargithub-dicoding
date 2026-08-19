import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { Check } from "lucide-react";

const TEMPLATES = [
  { id: "hormozi", name: "Hormozi Style", desc: "Bold yellow/green, heavy stroke, emphasized keywords.", style: "Viral", grad: "from-yellow-400/30 to-emerald-500/20", accent: "#EAB308", caption: "MOST PEOPLE QUIT" },
  { id: "abdaal", name: "Clean Studio", desc: "Clean white/blue, subtle animations, elegant sans.", style: "Clean", grad: "from-sky-400/20 to-indigo-500/20", accent: "#38BDF8", caption: "Here's the system" },
  { id: "neon", name: "Neon Pulse", desc: "Neon purple gradient, dynamic bouncing words.", style: "Highlight", grad: "from-violet-500/30 to-fuchsia-500/20", accent: "#A855F7", caption: "This changes everything" },
  { id: "podcast", name: "Podcast Spotlight", desc: "Dark backdrop, waveform bar, speaker highlight.", style: "Bold", grad: "from-slate-700/40 to-slate-900/40", accent: "#94A3B8", caption: "THE REAL STORY" },
  { id: "minimal", name: "Minimal Elegant", desc: "Small elegant captions, generous spacing.", style: "Minimal", grad: "from-zinc-500/20 to-zinc-700/20", accent: "#E4E4E7", caption: "less is more" },
  { id: "business", name: "Boardroom", desc: "Corporate blue, confident typography.", style: "Bold", grad: "from-blue-500/25 to-cyan-500/15", accent: "#3B82F6", caption: "SCALE FASTER" },
];

export default function Templates() {
  const [selected, setSelected] = useState(null);

  const apply = async (t) => {
    setSelected(t.id);
    try { await api.put("/brand-kit", { caption_style: t.style }); toast.success(`${t.name} applied as your default caption style`); }
    catch { toast.error("Couldn't apply template."); }
  };

  return (
    <div data-testid="templates-page">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-2xl lg:text-3xl">Templates</h1>
        <p className="text-slate-400 mt-1">Pick a look — captions, typography and animation, styled in one click.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl border surface-1 overflow-hidden transition-all ${selected === t.id ? "border-violet-500" : "border-white/[0.08] hover:border-violet-500/40"}`}
                      data-testid={`template-card-${t.id}`}>
            <div className={`relative aspect-video bg-gradient-to-br ${t.grad} grid place-items-center`}>
              <span className="font-extrabold uppercase text-lg text-white text-center px-4 drop-shadow" style={{ color: t.accent }}>{t.caption}</span>
            </div>
            <div className="p-4">
              <h3 className="font-display font-semibold">{t.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{t.desc}</p>
              <button onClick={() => apply(t)} data-testid={`apply-template-${t.id}`}
                      className={`mt-4 w-full py-2 rounded-lg font-semibold text-sm transition-colors inline-flex items-center justify-center gap-1.5 ${selected === t.id ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] hover:bg-white/[0.12] text-white"}`}>
                {selected === t.id ? <><Check className="w-4 h-4" /> Applied</> : "Use Template"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
