import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AdminConsole from "@/pages/AdminConsole";
import GeneratePage from "@/pages/GeneratePage";
import HubPage from "@/pages/HubPage";
import PublicPage from "@/pages/PublicPage";
import ProbioticPlusAdvertorial from "@/pages/ProbioticPlusAdvertorial";
import TenReasonsAdvertorial from "@/pages/TenReasonsAdvertorial";
import Showcase from "@/pages/Showcase";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

// Surfaces:
//   /          → bounce to the main store (public root of the ad subdomain)
//   /login     → owner sign-in (public)
//   /admin     → admin console      (gated)
//   /new       → generator          (gated)
//   /p/:slug   → public landing page (public — Meta-ad traffic)
//
// The bare subdomain root is for public ad traffic, so it sends visitors to the
// store. netlify.toml redirects it at the edge (no app load); this client-side
// route is the fallback for any in-app <Link to="/">.
function StoreRedirect() {
  useEffect(() => { window.location.replace("https://goodforpets.co"); }, []);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StoreRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminConsole />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <GeneratePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hub"
        element={
          <ProtectedRoute>
            <HubPage />
          </ProtectedRoute>
        }
      />
      {/* Bespoke golden page — art-directed clone of the live Replo advertorial. */}
      <Route path="/p/5-strain-probiotic-plus" element={<ProbioticPlusAdvertorial />} />
      <Route path="/p/10-reasons" element={<TenReasonsAdvertorial />} />
      <Route path="/p/:slug" element={<PublicPage />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
