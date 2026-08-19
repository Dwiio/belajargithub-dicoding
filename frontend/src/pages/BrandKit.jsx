import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
import { Palette, Save, Check } from "lucide-react";

const POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"];
const STYLES = ["Clean", "Bold", "Highlight", "Viral", "Minimal"];
const FONTS = ["Outfit", "Plus Jakarta Sans", "JetBrains Mono"];

export default function BrandKit() {
  const [b, setB] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/brand-kit").then(({ data }) => setB(data)); }, []);
  const set = (k, v) => setB((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { const { data } = await api.put("/brand-kit", b); setB(data); toast.success("Brand kit saved"); }
    catch { toast.error("Couldn't save brand kit."); }
    setSaving(false);
  };

  if (!b) return <div className="h-96 rounded-2xl bg-white/[0.04] animate-pulse" />;

  return (
    <div data-testid="brand-kit-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl">Brand Kit</h1>
          <p className="text-slate-400 mt-1">Save your identity once — apply it to every clip.</p>
        </div>
        <button onClick={save} disabled={saving} data-testid="save-brand-kit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-60">
          {saving ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="surface-1 border border-white/[0.08] rounded-2xl p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Brand name"><input value={b.brand_name} onChange={(e) => set("brand_name", e.target.value)} data-testid="brand-name" className="inp" /></Field>
            <Field label="Username"><input value={b.username} onChange={(e) => set("username", e.target.value)} data-testid="brand-username" className="inp" /></Field>
          </div>
          <Field label="Logo URL"><input value={b.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." data-testid="brand-logo" className="inp" /></Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Primary color">
              <div className="flex items-center gap-2">
                <input type="color" value={b.primary_color} onChange={(e) => set("primary_color", e.target.value)} data-testid="brand-primary" className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={b.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="inp font-mono" />
              </div>
            </Field>
            <Field label="Secondary color">
              <div className="flex items-center gap-2">
                <input type="color" value={b.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} data-testid="brand-secondary" className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={b.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} className="inp font-mono" />
              </div>
            </Field>
          </div>

          <Field label={`Watermark opacity — ${b.watermark_opacity}%`}>
            <Slider value={[b.watermark_opacity]} onValueChange={(v) => set("watermark_opacity", v[0])} max={100} step={5} data-testid="brand-opacity" />
          </Field>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Logo position">
              <Select value={b.logo_position} onValueChange={(v) => set("logo_position", v)}>
                <SelectTrigger className="surface-2 border-white/10" data-testid="brand-position"><SelectValue /></SelectTrigger>
                <SelectContent className="surface-1 border-white/10 text-white">{POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Caption style">
              <Select value={b.caption_style} onValueChange={(v) => set("caption_style", v)}>
                <SelectTrigger className="surface-2 border-white/10" data-testid="brand-caption"><SelectValue /></SelectTrigger>
                <SelectContent className="surface-1 border-white/10 text-white">{STYLES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Font">
              <Select value={b.font} onValueChange={(v) => set("font", v)}>
                <SelectTrigger className="surface-2 border-white/10" data-testid="brand-font"><SelectValue /></SelectTrigger>
                <SelectContent className="surface-1 border-white/10 text-white">{FONTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        {/* Live preview */}
        <div className="surface-1 border border-white/[0.08] rounded-2xl p-6">
          <span className="text-xs uppercase tracking-wider text-slate-500">Preview</span>
          <div className="mt-4 relative aspect-[9/16] rounded-xl overflow-hidden max-w-[240px] mx-auto"
               style={{ background: `linear-gradient(160deg, ${b.primary_color}, ${b.secondary_color})` }}>
            <div className="absolute inset-0 grid place-items-center px-4">
              <span className="text-center font-extrabold uppercase text-white text-lg leading-tight drop-shadow" style={{ fontFamily: b.font }}>Your caption here</span>
            </div>
            <div className={`absolute p-2 flex items-center gap-1.5 ${b.logo_position.includes("bottom") ? "bottom-2" : "top-2"} ${b.logo_position.includes("right") ? "right-2" : "left-2"}`} style={{ opacity: b.watermark_opacity / 100 }}>
              {b.logo_url ? <img src={b.logo_url} alt="" className="w-6 h-6 rounded object-contain" /> : <Palette className="w-4 h-4 text-white" />}
              <span className="text-white text-xs font-semibold">{b.username}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`.inp{width:100%;background:#1A1C28;border:1px solid rgba(255,255,255,0.1);border-radius:0.5rem;padding:0.6rem 0.85rem;color:#fff;outline:none;font-size:0.9rem}.inp:focus{border-color:#8B5CF6}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (<div><label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>{children}</div>);
}
