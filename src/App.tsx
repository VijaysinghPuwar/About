import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CyberGrid } from "@/components/CyberGrid";
import { Preloader } from "@/components/Preloader";

const CursorSpotlight = lazy(() =>
  import("@/components/CursorSpotlight").then(m => ({ default: m.CursorSpotlight }))
);
const CursorTrail = lazy(() =>
  import("@/components/CursorTrail").then(m => ({ default: m.CursorTrail }))
);
const ThemeTransition = lazy(() =>
  import("@/components/ThemeTransition").then(m => ({ default: m.ThemeTransition }))
);
const ThreatLevelIndicator = lazy(() =>
  import("@/components/ThreatLevelIndicator").then(m => ({ default: m.ThreatLevelIndicator }))
);
const KonamiCode = lazy(() =>
  import("@/components/KonamiCode").then(m => ({ default: m.KonamiCode }))
);
const CommandPalette = lazy(() =>
  import("@/components/CommandPalette").then(m => ({ default: m.CommandPalette }))
);

import Index from "./pages/Index";
import Login from "./pages/Login";
import Pending from "./pages/Pending";
import Blocked from "./pages/Blocked";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <CyberGrid />
          <Suspense fallback={null}>
            <ThemeTransition />
          </Suspense>
          <Preloader />
          {/* ThreatLevelIndicator needs router context, mounted inside BrowserRouter below */}
          <Suspense fallback={null}>
            <CursorSpotlight />
          </Suspense>
          <Suspense fallback={null}>
            <CursorTrail />
          </Suspense>
          <Suspense fallback={null}>
            <KonamiCode />
          </Suspense>
          <Sonner />
          <div className="min-h-[100dvh] bg-background">
            <BrowserRouter>
              <Suspense fallback={null}>
                <ThreatLevelIndicator />
              </Suspense>
              <Suspense fallback={null}>
                <CommandPalette />
              </Suspense>
              <Navigation />
              <main className="relative">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/pending" element={<Pending />} />
                  <Route path="/blocked" element={<Blocked />} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <BackToTop />
            </BrowserRouter>
          </div>
        </AuthProvider>
      </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
