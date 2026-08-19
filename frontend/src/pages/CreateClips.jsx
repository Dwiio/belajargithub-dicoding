import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UrlInput } from "@/components/UrlInput";
import api, { apiError } from "@/lib/api";
import { toast } from "sonner";
import { Brain, Crop, Subtitles, Package, Download } from "lucide-react";

const PIPELINE = [
  { icon: Brain, t: "Highlight & hook detection", d: "AI reads the transcript to find shareable moments." },
  { icon: Crop, t: "Smart 9:16 reframe", d: "Landscape auto-converted to vertical." },
  { icon: Subtitles, t: "Dynamic captions", d: "Word-by-word animated captions." },
  { icon: Package, t: "Content pack", d: "Titles, captions, hashtags & thumbnails." },
  { icon: Download, t: "Export ready", d: "Download or copy — post everywhere." },
];

export default function CreateClips() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-3xl mx-auto py-6" data-testid="create-page">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl">Create Clips</h1>
        <p className="text-slate-400 mt-3">Paste any YouTube URL. AI does the hard part — you just review and export.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <UrlInput onGenerate={generate} loading={loading} showOptions ctaLabel="Generate Clips" />
      </motion.div>

      <div className="mt-14 grid gap-3">
        {PIPELINE.map((s, i) => (
          <motion.div key={s.t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                      className="flex items-center gap-4 rounded-xl border border-white/[0.07] surface-1 p-4">
            <span className="grid place-items-center w-10 h-10 rounded-lg bg-violet-500/15 text-violet-300 shrink-0"><s.icon className="w-5 h-5" /></span>
            <div>
              <div className="font-semibold">{s.t}</div>
              <div className="text-sm text-slate-400">{s.d}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
