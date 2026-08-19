import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const LIMITS = { Free: 30, Creator: 180, "Pro Studio": 600, Agency: 2000 };

export function UsageMeter({ usage, compact = false }) {
  const limit = usage?.minutes_limit || LIMITS[usage?.plan] || 30;
  const used = usage?.minutes_used || 0;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  if (compact) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5" data-testid="usage-meter-widget">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Monthly usage</span>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300">{usage?.plan || "Free"}</span>
        </div>
        <Progress value={pct} className="h-1.5 bg-white/10" />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-xs text-slate-400">{used} / {limit} min</span>
          <Link to="/pricing" data-testid="upgrade-link" className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1">
            <Zap className="w-3 h-3" /> Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 surface-1 p-6" data-testid="usage-meter">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-white">Monthly Usage</h3>
        <span className="font-mono text-sm text-slate-400">{used} / {limit} min</span>
      </div>
      <Progress value={pct} className="h-2.5 bg-white/10" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Stat label="Minutes" value={used} />
        <Stat label="Clips" value={usage?.clips_generated || 0} />
        <Stat label="Exports" value={usage?.exports || 0} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-mono font-bold text-2xl text-white">{value}</div>
      <div className="text-xs uppercase tracking-wider text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
