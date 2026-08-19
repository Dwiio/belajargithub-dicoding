import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UsageMeter } from "@/components/UsageMeter";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Gauge, ShieldCheck, CreditCard, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [usage, setUsage] = useState(null);
  useEffect(() => { api.get("/usage").then(({ data }) => setUsage(data)).catch(() => {}); }, []);

  return (
    <div data-testid="settings-page" className="max-w-4xl">
      <h1 className="font-display font-extrabold text-2xl lg:text-3xl mb-8">Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList className="bg-white/[0.04] mb-6 flex-wrap h-auto">
          <TabsTrigger value="profile" data-testid="tab-profile"><User className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>
          <TabsTrigger value="usage" data-testid="tab-usage"><Gauge className="w-4 h-4 mr-1.5" /> Usage</TabsTrigger>
          <TabsTrigger value="subscription" data-testid="tab-subscription"><CreditCard className="w-4 h-4 mr-1.5" /> Subscription</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security"><ShieldCheck className="w-4 h-4 mr-1.5" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="surface-1 border border-white/[0.08] rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-4">
              <span className="grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold">{(user?.name || "C")[0].toUpperCase()}</span>
              <div>
                <div className="font-display font-semibold text-lg">{user?.name}</div>
                <div className="text-slate-400 text-sm">{user?.email}</div>
                <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">{user?.plan}</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-sm text-slate-400">Name</label><div className="mt-1 surface-2 border border-white/10 rounded-lg px-4 py-2.5">{user?.name}</div></div>
              <div><label className="text-sm text-slate-400">Email</label><div className="mt-1 surface-2 border border-white/10 rounded-lg px-4 py-2.5">{user?.email}</div></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage"><UsageMeter usage={usage} /></TabsContent>

        <TabsContent value="subscription">
          <div className="surface-1 border border-white/[0.08] rounded-2xl p-6">
            <h3 className="font-display font-semibold text-lg">Current plan: {user?.plan}</h3>
            <p className="text-slate-400 text-sm mt-1">Upgrade to unlock more processing minutes, HD exports and premium features.</p>
            <button onClick={() => nav("/pricing")} data-testid="view-plans" className="mt-5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold transition-colors">View plans</button>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <div className="surface-1 border border-white/[0.08] rounded-2xl p-6 flex items-center justify-between">
              <div><h3 className="font-semibold">Session</h3><p className="text-slate-400 text-sm mt-0.5">Log out of your ClapClip studio.</p></div>
              <button onClick={() => { logout(); nav("/"); }} data-testid="settings-logout" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] font-medium text-sm"><LogOut className="w-4 h-4" /> Log out</button>
            </div>
            <div className="surface-1 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between">
              <div><h3 className="font-semibold text-red-400">Delete account</h3><p className="text-slate-400 text-sm mt-0.5">Permanently remove your account and all data.</p></div>
              <AlertDialog>
                <AlertDialogTrigger asChild><button data-testid="delete-account-btn" className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 font-medium text-sm">Delete</button></AlertDialogTrigger>
                <AlertDialogContent className="surface-1 border-white/10 text-white">
                  <AlertDialogHeader><AlertDialogTitle>Delete your account?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">This is permanent and can't be undone. Contact support to fully purge your data.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.12]">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { toast.info("Account deletion requires support confirmation."); }} className="bg-red-600 hover:bg-red-500 text-white">Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
