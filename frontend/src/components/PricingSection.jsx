import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TIERS = [
  {
    id: "free", name: "Free Starter", price: 0, period: "forever",
    credits: "30 mins video / month",
    features: ["AI Highlight detection", "Basic captions", "Standard 720p export", "Watermarked exports"],
    cta: "Start Free",
  },
  {
    id: "creator", name: "Creator", price: 249000, period: "per bulan", badge: "Popular",
    credits: "180 mins video / month",
    features: ["No watermark", "1080p HD export", "Smart 9:16 Auto-reframe", "Full AI Content Packs", "Custom caption styles", "Fast AI processing"],
    cta: "Choose Creator", highlight: true,
  },
  {
    id: "pro", name: "Pro Studio", price: 599000, period: "per bulan", badge: "Best Value",
    credits: "600 mins video / month",
    features: ["Everything in Creator", "Brand Kit integration", "Premium templates", "Priority AI queue", "Export All batch download", "API & webhook access"],
    cta: "Choose Pro",
  },
  {
    id: "agency", name: "Agency", price: 1499000, period: "per bulan",
    credits: "2,000 mins video / month",
    features: ["Everything in Pro", "Unlimited team seats", "Custom template generator", "Dedicated account manager", "Custom SLA & invoice"],
    cta: "Contact Sales",
  },
];

function rupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const nav = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-12" data-testid="pricing-toggle">
        <span className={!annual ? "text-white font-semibold" : "text-slate-500"}>Monthly</span>
        <button onClick={() => setAnnual(!annual)} data-testid="billing-toggle"
                className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-violet-600" : "bg-white/15"}`}>
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${annual ? "left-8" : "left-1"}`} />
        </button>
        <span className={annual ? "text-white font-semibold" : "text-slate-500"}>
          Annual <span className="text-emerald-400 text-xs font-semibold">−20%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {TIERS.map((t) => {
          const price = annual && t.price ? Math.round(t.price * 0.8) : t.price;
          return (
            <div key={t.id} data-testid={`pricing-card-${t.id}`}
                 className={`relative rounded-2xl p-6 flex flex-col border transition-all ${
                   t.highlight ? "border-violet-500/50 bg-violet-500/[0.06] violet-glow" : "border-white/[0.08] surface-1 hover:border-white/20"}`}>
              {t.badge && (
                <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-semibold">{t.badge}</span>
              )}
              <h3 className="font-display font-bold text-xl text-white">{t.name}</h3>
              <div className="mt-4 mb-1">
                <span className="font-display font-extrabold text-3xl text-white">{price === 0 ? "Rp 0" : rupiah(price)}</span>
                {t.price > 0 && <span className="text-slate-500 text-sm ml-1">/{annual ? "bln" : "bln"}</span>}
              </div>
              <p className="text-sm text-violet-300 font-medium">{t.credits}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => nav("/register")} data-testid={`pricing-cta-${t.id}`}
                      className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        t.highlight ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white" : "bg-white/[0.07] hover:bg-white/[0.13] text-white"}`}>
                {t.cta}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500 mt-8">Prices in Indonesian Rupiah. Cancel anytime. Payment integration ready to connect.</p>
    </div>
  );
}
