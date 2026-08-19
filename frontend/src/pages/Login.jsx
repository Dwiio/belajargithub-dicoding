import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@clapclip.ai");
  const [password, setPassword] = useState("ClapClip2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) { toast.success("Welcome back!"); nav("/app"); }
    else setError(res.error);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0B0C10]">
      <div className="hidden lg:flex flex-col justify-between p-12 grid-noise border-r border-white/[0.07]">
        <Logo />
        <div>
          <h1 className="font-display font-extrabold text-4xl leading-tight text-white">One Video.<br /><span className="text-gradient">Endless Content.</span></h1>
          <p className="text-slate-400 mt-4 max-w-sm">Paste a YouTube link. ClapClip finds the moments people care about and turns them into short-form clips with captions and a full content pack.</p>
        </div>
        <p className="text-xs text-slate-600">© 2026 ClapClip. Turn long videos into short content with AI.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h2 className="font-display font-bold text-2xl text-white">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Log in to your ClapClip studio.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email"
                     className="mt-1.5 w-full surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password"
                     className="mt-1.5 w-full surface-2 border border-white/10 focus:border-violet-500 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
            </div>
            {error && <p className="text-sm text-red-400" data-testid="login-error">{error}</p>}
            <button type="submit" disabled={loading} data-testid="login-submit"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Log in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-4 rounded-lg border border-white/[0.06] surface-1 p-3 text-xs text-slate-400">
            Demo account is pre-filled — just click <span className="text-white font-medium">Log in</span>.
          </div>
          <p className="text-sm text-slate-400 mt-6 text-center">
            No account? <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300" data-testid="go-register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
