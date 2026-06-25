import { Routes, Route } from "react-router-dom";
import AdminConsole from "@/pages/AdminConsole";
import PublicPage from "@/pages/PublicPage";
import NotFound from "@/pages/NotFound";

// Two surfaces, one app:
//   /          → admin console (the owner's control panel)
//   /p/:slug   → public landing page (what Meta-ad traffic sees)
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminConsole />} />
      <Route path="/p/:slug" element={<PublicPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
