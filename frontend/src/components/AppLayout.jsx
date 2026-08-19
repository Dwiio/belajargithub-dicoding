import { useEffect, useState } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Video, FolderKanban, Film, Package, Sparkles,
  Palette, Settings, Menu, X, LogOut, Command, ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UsageMeter } from "@/components/UsageMeter";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/app" },
  { name: "Create Clips", icon: Video, path: "/app/create" },
  { name: "My Projects", icon: FolderKanban, path: "/app/projects" },
  { name: "All Clips", icon: Film, path: "/app/clips" },
  { name: "Content Packs", icon: Package, path: "/app/content-packs" },
  { name: "Templates", icon: Sparkles, path: "/app/templates" },
  { name: "Brand Kit", icon: Palette, path: "/app/brand-kit" },
  { name: "Settings", icon: Settings, path: "/app/settings" },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.path === "/app"} onClick={onNavigate}
          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive ? "bg-violet-600/15 text-white border border-violet-500/30" : "text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent"
            }`}>
          <item.icon className="w-[18px] h-[18px]" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    api.get("/usage").then(({ data }) => setUsage(data)).catch(() => {});
  }, [loc.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  const go = (path) => { setCmdOpen(false); nav(path); };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[264px] flex-col border-r border-white/[0.07] surface-1 z-40">
        <div className="px-5 h-16 flex items-center border-b border-white/[0.07]">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavItems />
        </div>
        <div className="p-3 border-t border-white/[0.07]">
          <UsageMeter usage={usage} compact />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] surface-1 border-r border-white/10 flex flex-col">
            <div className="px-5 h-16 flex items-center justify-between border-b border-white/[0.07]">
              <Logo />
              <button onClick={() => setMobileOpen(false)} data-testid="mobile-close"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4"><NavItems onNavigate={() => setMobileOpen(false)} /></div>
            <div className="p-3 border-t border-white/[0.07]"><UsageMeter usage={usage} compact /></div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[264px]">
        <header className="glass-nav sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)} data-testid="mobile-menu-btn"><Menu className="w-5 h-5" /></button>
            <button onClick={() => setCmdOpen(true)} data-testid="command-palette-trigger"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm transition-colors">
              <Command className="w-3.5 h-3.5" /> Search <kbd className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => nav("/app/create")} data-testid="header-create-btn"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
              <Video className="w-4 h-4" /> New Clip
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2" data-testid="user-menu-trigger">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-bold">
                    {(user?.name || "C")[0].toUpperCase()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="surface-1 border-white/10 text-white w-56">
                <div className="px-2 py-2">
                  <div className="font-semibold text-sm truncate">{user?.name}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">{user?.plan}</span>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => nav("/app/settings")} className="cursor-pointer focus:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); nav("/"); }} data-testid="logout-btn" className="cursor-pointer focus:bg-white/10 text-red-400">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"><Outlet /></main>
      </div>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => go("/app/create")}><Video className="w-4 h-4 mr-2" /> Create Clips</CommandItem>
            <CommandItem onSelect={() => go("/app/projects")}><FolderKanban className="w-4 h-4 mr-2" /> Open Projects</CommandItem>
            <CommandItem onSelect={() => go("/app/clips")}><Film className="w-4 h-4 mr-2" /> All Clips</CommandItem>
            <CommandItem onSelect={() => go("/app/content-packs")}><Package className="w-4 h-4 mr-2" /> Content Packs</CommandItem>
            <CommandItem onSelect={() => go("/app/settings")}><Settings className="w-4 h-4 mr-2" /> Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
