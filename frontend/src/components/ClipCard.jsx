import { motion } from "framer-motion";
import { Play, Package, Download, Pencil, Clock } from "lucide-react";
import { ScoreBadge, scoreTier } from "@/components/ScoreBadge";

export function fmtDur(sec) {
  const s = Math.round(sec || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function ClipCard({ clip, index = 0, onOpen, onContentPack, onExport }) {
  const tier = scoreTier(clip.score);
  const thumb = `https://i.ytimg.com/vi/${clip.video_id}/hqdefault.jpg`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group relative surface-1 border border-white/[0.08] hover:border-violet-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      data-testid={`clip-card-${index}`}
    >
      <div className="relative aspect-video overflow-hidden bg-black cursor-pointer" onClick={() => onOpen?.(clip)}>
        <img src={thumb} alt={clip.title} loading="lazy"
             className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="grid place-items-center w-12 h-12 rounded-full bg-violet-600/90 backdrop-blur text-white">
            <Play className="w-5 h-5 ml-0.5" />
          </span>
        </div>
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-xs font-mono text-white">
          <Clock className="w-3 h-3" /> {fmtDur(clip.duration)}
        </span>
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[11px] font-semibold ${tier.bg} ${tier.text} border ${tier.border}`}>
          {clip.category}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-white leading-snug line-clamp-2">{clip.title}</h3>
            {clip.hook && <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">"{clip.hook}"</p>}
          </div>
          <ScoreBadge score={clip.score} size={48} testId={`clip-score-${index}`} />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button onClick={() => onOpen?.(clip)} data-testid={`clip-edit-${index}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Editor
          </button>
          <button onClick={() => onContentPack?.(clip)} data-testid={`clip-pack-${index}`}
                  title="Content Pack"
                  className="grid place-items-center w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors">
            <Package className="w-4 h-4" />
          </button>
          <button onClick={() => onExport?.(clip)} data-testid={`clip-export-${index}`}
                  title="Export"
                  className="grid place-items-center w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
