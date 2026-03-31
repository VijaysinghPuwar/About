import { Toaster } from "@/components/ui/toaster";
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
import { CursorSpotlight } from "@/components/CursorSpotlight";
import { CursorTrail } from "@/components/CursorTrail";
import { CyberGrid } from "@/components/CyberGrid";
import { ThemeTransition } from "@/components/ThemeTransition";
import { Preloader } from "@/components/Preloader";
import { ThreatLevelIndicator } from "@/components/ThreatLevelIndicator";
import { KonamiCode } from "@/components/KonamiCode";
import { CommandPalette } from "@/components/CommandPalette";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Pending from "./pages/Pending";
import Blocked from "./pages/Blocked";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <CyberGrid />
          <ThemeTransition />
          <Preloader />
          {/* ThreatLevelIndicator needs router context, mounted inside BrowserRouter below */}
          <CursorSpotlight />
          <CursorTrail />
          <KonamiCode />
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-background">
            <BrowserRouter>
              <ThreatLevelIndicator />
              <CommandPalette />
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
);

export default App;
