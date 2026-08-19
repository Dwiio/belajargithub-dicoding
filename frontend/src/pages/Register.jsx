import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

const PERKS = ["30 free processing minutes / month", "AI highlight detection & viral scoring", "Full AI content packs", "No credit card required"];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const res = await register(name, email, password);
    setLoading(false);
    if (res.ok) { toast.success("Account created! Let's make some clips."); nav("/app"); }
    else setError(res.error);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0B0C10]">
      <div className="hidden lg:flex flex-col justify-between p-12 grid-noise border-r border-white/[0.07]">
        <Logo />
        <div>
          <h1 className="font-display font-extrabold text-4xl leading-tight text-white">Start free.<br /><span className="text-gradient">Create in minutes.</span></h1>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-slate-300">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-emerald-500/15"><Check className="w-3 h-3 text-emerald-400" /></span> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-600">© 2026 ClapClip. Turn long videos into short content with AI.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h2 className="font-display font-bold text-2xl text-white">Create your account</h2>
          <p className="text-slate-400 text-sm mt-1">No editing experience required.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required data-testid="register-name"
                     className="mt-1.5 w-full surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="register-email"
                     className="mt-1.5 w-full surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="register-password"
                     className="mt-1.5 w-full surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
            </div>
            {error && <p className="text-sm text-red-400" data-testid="register-error">{error}</p>}
            <button type="submit" disabled={loading} data-testid="register-submit"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create free account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-sm text-slate-400 mt-6 text-center">
            Already have an account? <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300" data-testid="go-login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
