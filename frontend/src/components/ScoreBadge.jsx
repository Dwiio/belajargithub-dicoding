import { cn } from "@/lib/utils";

export function scoreTier(score) {
  if (score >= 85) return { color: "#10B981", label: "Super Viral", ring: "#10B981", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
  if (score >= 70) return { color: "#8B5CF6", label: "High Potential", ring: "#8B5CF6", text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30" };
  return { color: "#F59E0B", label: "Solid Hook", ring: "#F59E0B", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
}

export function ScoreBadge({ score = 0, size = 56, stroke = 5, showLabel = false, className, testId }) {
  const tier = scoreTier(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className={cn("inline-flex items-center gap-2", className)} data-testid={testId || "viral-score-badge"}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={tier.color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono font-bold text-white" style={{ fontSize: size * 0.3 }}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("text-xs font-semibold", tier.text)}>{tier.label}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">AI Viral Score</span>
        </div>
      )}
    </div>
  );
}
