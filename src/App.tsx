import { Routes, Route } from "react-router-dom";
import AdminConsole from "@/pages/AdminConsole";
import GeneratePage from "@/pages/GeneratePage";
import HubPage from "@/pages/HubPage";
import PublicPage from "@/pages/PublicPage";
import Showcase from "@/pages/Showcase";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

// Surfaces:
//   /login     → owner sign-in (public)
//   /          → admin console      (gated)
//   /new       → generator          (gated)
//   /p/:slug   → public landing page (public — Meta-ad traffic)
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
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
      <Route path="/p/:slug" element={<PublicPage />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
