import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, Crop, Subtitles, Package, Zap, Palette, ArrowRight, Menu, X,
  Youtube, Sparkles, Play, Mic, Video, GraduationCap, Building2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UrlInput } from "@/components/UrlInput";
import { PricingSection } from "@/components/PricingSection";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.5 } };

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [["Features", "#features"], ["How It Works", "#how"], ["Pricing", "#pricing"], ["FAQ", "#faq"]];
  return (
    <header className="glass-nav fixed top-0 inset-x-0 z-50 border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(([l, h]) => (
            <a key={l} href={h} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" data-testid="nav-login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
          <Link to="/register" data-testid="nav-start-free"
                className="px-4 py-2 rounded-lg bg-white text-[#0B0C10] text-sm font-semibold hover:bg-slate-200 transition-colors">Start Free</Link>
        </div>
        <button className="md:hidden text-white" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/[0.07] surface-1 px-5 py-4 space-y-3">
          {links.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)} className="block text-slate-300">{l}</a>)}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center py-2 rounded-lg border border-white/10 text-white">Log in</Link>
            <Link to="/register" className="flex-1 text-center py-2 rounded-lg bg-white text-[#0B0C10] font-semibold">Start Free</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroMock() {
  const clips = [
    { t: "Why Most Startups Fail", s: 96, c: "Business" },
    { t: "The Hook That Hooks", s: 91, c: "Viral" },
    { t: "Hire When It Hurts", s: 84, c: "Insight" },
  ];
  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/[0.08] surface-1 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-red-500/70" /><span className="w-3 h-3 rounded-full bg-amber-500/70" /><span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="ml-3 text-xs text-slate-500 font-mono">clapclip.ai/app</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <img src="https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=600&q=80" alt="source" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 grid place-items-center"><Play className="w-8 h-8 text-white/90" /></div>
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white">42:15 · original</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-violet-300">
              <span className="pulse-ring relative w-2 h-2 rounded-full bg-violet-500" /> AI analyzing transcript...
            </div>
          </div>
          <div className="col-span-3 space-y-2">
            {clips.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.2 }}
                          className="flex items-center gap-3 rounded-lg border border-white/[0.07] surface-2 p-2.5">
                <div className="w-14 h-10 rounded bg-gradient-to-br from-violet-600/40 to-indigo-600/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{c.t}</div>
                  <div className="text-[11px] text-slate-500">{c.c} · 0:{30 + i * 4}</div>
                </div>
                <ScoreBadge score={c.s} size={40} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <motion.div className="absolute -right-4 -top-4 hidden sm:block animate-float" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur px-3 py-2 text-xs font-semibold text-emerald-400">🚀 Super Viral · 96</div>
      </motion.div>
    </div>
  );
}

const CAPS = [
  { icon: Brain, title: "AI Highlight Detection", desc: "Understands transcript, context, emotion and hooks to surface the moments people actually share." },
  { icon: Zap, title: "AI Viral Potential Score", desc: "Every clip is scored 0–100 across hook, engagement, clarity, emotion & shareability." },
  { icon: Crop, title: "Smart 9:16 Reframe", desc: "Auto-converts landscape to vertical, keeping the active speaker perfectly framed." },
  { icon: Subtitles, title: "Dynamic Captions", desc: "Word-by-word animated captions in Clean, Bold, Highlight, Viral & Minimal styles." },
  { icon: Package, title: "Full AI Content Pack", desc: "Title, hook, social caption, hashtags, thumbnail text and CTA — ready to post." },
  { icon: Palette, title: "Brand Kit", desc: "Save your logo, colors, fonts and caption presets — apply them to every clip." },
];

const STEPS = [
  { n: "01", t: "Paste", d: "Drop in any YouTube URL. No downloads, no uploads, no software." },
  { n: "02", t: "Let AI find the moments", d: "ClapClip analyzes the transcript, context, emotion and hooks in seconds." },
  { n: "03", t: "Publish", d: "Review, customize captions, export vertical clips + content packs." },
];

const USECASES = [
  { icon: Mic, t: "Podcasters", d: "Turn every episode into a week of short clips." },
  { icon: Video, t: "YouTubers", d: "Repurpose long-form videos into Shorts & Reels." },
  { icon: GraduationCap, t: "Coaches", d: "Transform lessons into bite-sized teaching moments." },
  { icon: Building2, t: "Agencies", d: "Generate content for multiple brands at scale." },
];

const FAQS = [
  ["Do I need any editing experience?", "None at all. Paste a YouTube link and ClapClip's AI does the hard part — finding moments, reframing, captioning and packaging."],
  ["How does the AI Viral Score work?", "Each clip is scored on hook, engagement, clarity, emotion and shareability based on content characteristics. It reflects potential, not guaranteed performance."],
  ["What video lengths are supported?", "From short clips to multi-hour podcasts. ClapClip finds the best 5–20 moments regardless of length."],
  ["Can I customize the captions and branding?", "Yes. Choose caption styles, colors, fonts and animations, and save a Brand Kit to apply your identity to every clip."],
  ["Is my content private?", "Your projects and clips are tied to your account and protected behind authentication. We never expose private assets."],
];

export default function Landing() {
  const nav = useNavigate();
  const handleGenerate = (url) => {
    localStorage.setItem("clapclip_pending_url", url);
    nav("/register");
  };
  return (
    <div className="bg-[#0B0C10] text-white">
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-5 grid-noise overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.div {...fade} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" /> One Video. Endless Content.
            </motion.div>
            <motion.h1 {...fade} className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight">
              Turn long videos into <span className="text-gradient">endless content</span> with AI.
            </motion.h1>
            <motion.p {...fade} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-slate-400 mt-5 max-w-xl leading-relaxed">
              Paste a YouTube link. ClapClip finds the moments people will care about, turns them into short-form clips, adds captions, and prepares everything for social media.
            </motion.p>
            <motion.div {...fade} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 max-w-xl">
              <UrlInput onGenerate={handleGenerate} ctaLabel="Create Your First Clip" />
            </motion.div>
            <motion.p {...fade} transition={{ duration: 0.5, delay: 0.3 }} className="text-sm text-slate-500 mt-4">No editing experience required.</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <HeroMock />
          </motion.div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="border-y border-white/[0.07] py-8 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["10+", "clips per video"], ["5-stage", "AI pipeline"], ["9:16", "smart reframe"], ["0", "editing skills needed"]].map(([a, b]) => (
            <div key={a}><div className="font-display font-extrabold text-2xl text-white">{a}</div><div className="text-xs uppercase tracking-wider text-slate-500 mt-1">{b}</div></div>
          ))}
        </div>
      </section>

      {/* 1 VIDEO -> 10+ */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 {...fade} className="font-display font-bold text-3xl lg:text-4xl">1 Video → 10+ Pieces of Content</motion.h2>
          <motion.p {...fade} className="text-slate-400 mt-3 max-w-2xl mx-auto">One long-form video becomes an entire content calendar — clips, titles, captions, hashtags and thumbnails.</motion.p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {["Long Video", "AI Understands", "Best Moments", "Short Clips", "Content Pack"].map((s, i, arr) => (
              <motion.div key={s} {...fade} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                <span className="px-4 py-2.5 rounded-xl border border-white/[0.08] surface-1 text-sm font-semibold">{s}</span>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-violet-500" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-5 bg-white/[0.015] border-y border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fade} className="font-display font-bold text-3xl lg:text-4xl text-center">How it works</motion.h2>
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fade} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-white/[0.08] surface-1 p-7">
                <div className="font-mono font-bold text-violet-500 text-lg">{s.n}</div>
                <h3 className="font-display font-semibold text-xl mt-3">{s.t}</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fade} className="font-display font-bold text-3xl lg:text-4xl text-center">Everything you need to go viral</motion.h2>
          <motion.p {...fade} className="text-slate-400 text-center mt-3">The AI does the hard part. You just review and publish.</motion.p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {CAPS.map((c, i) => (
              <motion.div key={c.title} {...fade} transition={{ delay: i * 0.06 }}
                          className="rounded-2xl border border-white/[0.08] surface-1 p-6 hover:border-violet-500/40 transition-colors group">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-violet-500/15 text-violet-300 group-hover:scale-110 transition-transform"><c.icon className="w-5 h-5" /></span>
                <h3 className="font-display font-semibold text-lg mt-4">{c.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-24 px-5 bg-white/[0.015] border-y border-white/[0.07]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div {...fade}>
            <span className="text-xs uppercase tracking-wider text-slate-500">Before</span>
            <div className="mt-3 rounded-2xl border border-white/[0.08] surface-1 aspect-video overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&q=80" className="w-full h-full object-cover opacity-60" alt="before" />
              <div className="absolute inset-0 grid place-items-center text-slate-300 font-semibold">60-min podcast</div>
            </div>
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.15 }}>
            <span className="text-xs uppercase tracking-wider text-violet-400">After</span>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative rounded-xl border border-violet-500/30 surface-2 aspect-[9/16] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-indigo-600/20" />
                  <span className="absolute bottom-2 inset-x-2 text-center text-[10px] font-bold text-white uppercase">Clip {i + 1}</span>
                  <span className="absolute top-2 right-2"><ScoreBadge score={[96, 88, 82][i]} size={30} /></span>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm mt-4">10 clips · 10 titles · 10 captions · 10 hashtag sets · 10 thumbnail ideas.</p>
          </motion.div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fade} className="font-display font-bold text-3xl lg:text-4xl text-center">Built for every kind of creator</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {USECASES.map((u, i) => (
              <motion.div key={u.t} {...fade} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-white/[0.08] surface-1 p-6 text-center">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-violet-500/15 text-violet-300 mx-auto"><u.icon className="w-6 h-6" /></span>
                <h3 className="font-display font-semibold text-lg mt-4">{u.t}</h3>
                <p className="text-slate-400 text-sm mt-2">{u.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-5 bg-white/[0.015] border-y border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fade} className="font-display font-bold text-3xl lg:text-4xl text-center">Simple, creator-friendly pricing</motion.h2>
          <motion.p {...fade} className="text-slate-400 text-center mt-3 mb-4">Start free. Upgrade when you're ready to scale.</motion.p>
          <div className="mt-8"><PricingSection /></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...fade} className="font-display font-bold text-3xl lg:text-4xl text-center mb-12">Frequently asked questions</motion.h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map(([q, a], i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-white/[0.08] surface-1 px-5" data-testid={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="text-slate-400">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-5">
        <motion.div {...fade} className="max-w-4xl mx-auto rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/15 to-indigo-600/10 p-12 text-center violet-glow">
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl">One video. Endless content.</h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">Turn your long-form videos into short-form content with AI. Your first clip is one paste away.</p>
          <Link to="/register" data-testid="cta-final"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold transition-all">
            Create Your First Clip <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07] py-12 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <Link to="/login" className="hover:text-white">Log in</Link>
          </nav>
          <p className="text-xs text-slate-600">© 2026 ClapClip. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
