import { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

function copy(text, label) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied`);
}

function Field({ label, value, testId, multiline }) {
  const [done, setDone] = useState(false);
  const onCopy = () => { copy(value || "", label); setDone(true); setTimeout(() => setDone(false), 1200); };
  return (
    <div className="rounded-xl border border-white/[0.08] surface-2 p-4" data-testid={testId}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">{label}</span>
        <button onClick={onCopy} className="text-slate-400 hover:text-white transition-colors" data-testid={`${testId}-copy`}>
          {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className={`text-white ${multiline ? "text-sm leading-relaxed whitespace-pre-wrap" : "font-medium"}`}>{value || "—"}</p>
    </div>
  );
}

export function ContentPackPanel({ clip, onRegenerate, regenerating }) {
  const cp = clip?.content_pack || {};
  const all = `TITLE: ${cp.title}\n\nHOOK: ${cp.hook}\n\nCAPTION:\n${cp.social_caption}\n\nHASHTAGS: ${(cp.hashtags || []).join(" ")}\n\nTHUMBNAIL: ${cp.thumbnail_text}\n\nCTA: ${cp.cta}`;

  return (
    <div data-testid="content-pack-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h3 className="font-display font-semibold text-white">AI Content Pack</h3>
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button onClick={onRegenerate} disabled={regenerating} data-testid="regen-content-pack"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} /> Regenerate
            </button>
          )}
          <button onClick={() => copy(all, "Content pack")} data-testid="copy-all-content-pack"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copy All
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        <Field label="Title" value={cp.title} testId="cp-title" />
        <Field label="Hook" value={cp.hook} testId="cp-hook" />
        <Field label="Social Caption" value={cp.social_caption} testId="cp-caption" multiline />
        <div className="rounded-xl border border-white/[0.08] surface-2 p-4" data-testid="cp-hashtags">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">Hashtags</span>
            <button onClick={() => copy((cp.hashtags || []).join(" "), "Hashtags")} className="text-slate-400 hover:text-white transition-colors" data-testid="cp-hashtags-copy">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(cp.hashtags || []).map((h, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-violet-500/15 text-violet-300 text-xs font-medium border border-violet-500/20">{h}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Thumbnail Text" value={cp.thumbnail_text} testId="cp-thumbnail" />
          <Field label="Call To Action" value={cp.cta} testId="cp-cta" />
        </div>
      </div>
    </div>
  );
}
