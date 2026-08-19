import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CreateClips from "@/pages/CreateClips";
import Processing from "@/pages/Processing";
import Results from "@/pages/Results";
import Editor from "@/pages/Editor";
import Projects from "@/pages/Projects";
import AllClips from "@/pages/AllClips";
import ContentPacks from "@/pages/ContentPacks";
import BrandKit from "@/pages/BrandKit";
import Templates from "@/pages/Templates";
import SettingsPage from "@/pages/Settings";

function Loader() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0B0C10]">
      <div className="w-9 h-9 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null) return <Loader />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

          <Route path="/app" element={<Protected><AppLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateClips />} />
            <Route path="processing/:projectId" element={<Processing />} />
            <Route path="results/:projectId" element={<Results />} />
            <Route path="editor/:clipId" element={<Editor />} />
            <Route path="projects" element={<Projects />} />
            <Route path="clips" element={<AllClips />} />
            <Route path="content-packs" element={<ContentPacks />} />
            <Route path="templates" element={<Templates />} />
            <Route path="brand-kit" element={<BrandKit />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
    </AuthProvider>
  );
}
