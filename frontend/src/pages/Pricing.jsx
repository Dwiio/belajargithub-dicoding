import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { PricingSection } from "@/components/PricingSection";
import { ArrowLeft } from "lucide-react";

export default function Pricing() {
  return (
    <div className="bg-[#0B0C10] text-white min-h-screen">
      <header className="glass-nav border-b border-white/[0.07] h-16 flex items-center px-5">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link to="/app" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
        </div>
      </header>
      <section className="py-16 px-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display font-extrabold text-4xl text-center">Plans that scale with your content</h1>
          <p className="text-slate-400 text-center mt-3 mb-10">Start free. Upgrade when you're ready to publish everywhere.</p>
          <PricingSection />
        </div>
      </section>
    </div>
  );
}
