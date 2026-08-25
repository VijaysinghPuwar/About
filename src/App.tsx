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

/*
  Ambient effects, deliberately down to two.

  The site previously ran a cursor spotlight, a cursor trail, a mouse-reactive
  canvas grid, a preloader, a theme-transition scan line with synthesized audio,
  and a Konami-code rainbow mode — all at once. Individually clever, collectively
  noise, and none of them helped anyone read the work. What survives:

    1. A static rule grid behind the hero (CyberGrid) — it frames the terminal
       and fades out before the content.
    2. Section fade-up on scroll (SectionReveal) — it marks where a section
       begins without decorating it.

  Everything else was removed rather than tuned down.
*/
const CommandPalette = lazy(() =>
  import("@/components/CommandPalette").then(m => ({ default: m.CommandPalette }))
);

import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Blocked from "./pages/Blocked";
import OAuthConsent from "./pages/OAuthConsent";
import Admin from "./pages/Admin";
import Resume from "./pages/Resume";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <CyberGrid />
          <Sonner />
          <div className="min-h-[100dvh] bg-background">
            <BrowserRouter>
              <Suspense fallback={null}>
                <CommandPalette />
              </Suspense>
              <Navigation />
              <main className="relative z-[1]">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                  <Route path="/blocked" element={<Blocked />} />
                  {/* Public on purpose — no ProtectedRoute. Resume.tsx is now
                      transcribed from the canonical /resume.pdf, so the page and
                      the download agree. It previously went unrouted because the
                      page contradicted the verified record; that content is gone. */}
                  <Route path="/resume" element={<Resume />} />
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
