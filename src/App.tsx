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
  and a Konami-code rainbow mode, all at once. Individually clever, collectively
  noise, and none of them helped anyone read the work. What survives:

    1. A static rule grid behind the hero (CyberGrid). It frames the terminal
       and fades out before the content.
    2. Section fade-up on scroll (SectionReveal). It marks where a section
       begins without decorating it.

  Everything else was removed rather than tuned down.
*/
const CommandPalette = lazy(() =>
  import("@/components/CommandPalette").then(m => ({ default: m.CommandPalette }))
);

import Index from "./pages/Index";

/* Only the home page ships in the entry bundle. Every other route, the admin
   console above all, used to be imported eagerly, so a first visit parsed and
   compiled a few hundred kilobytes of code it would never run. On a slow CPU
   that is the difference between the hero arriving and the hero waiting. */
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Blocked = lazy(() => import("./pages/Blocked"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const Admin = lazy(() => import("./pages/Admin"));
const Resume = lazy(() => import("./pages/Resume"));
const Environment = lazy(() => import("./pages/Environment"));
const NotFound = lazy(() => import("./pages/NotFound"));

// The book routes are their own chunk: the catalogue, the reader and its
// stylesheet are not something the home page should pay for.
const Books = lazy(() => import("./pages/Books"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const BookReader = lazy(() => import("./pages/BookReader"));

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
                <Suspense fallback={<div className="min-h-[100dvh]" />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                  <Route path="/blocked" element={<Blocked />} />
                  {/* Public on purpose, no ProtectedRoute. Resume.tsx is now
                      transcribed from the canonical /resume.pdf, so the page and
                      the download agree. It previously went unrouted because the
                      page contradicted the verified record; that content is gone. */}
                  <Route path="/resume" element={<Resume />} />
                  {/* The long read behind the hero schematic; each node on the
                      home page links to its section here. */}
                  <Route path="/environment" element={<Environment />} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                  {/* The shelf and each book's page are public, so a book can
                      be linked and found. Reading needs an account: that is
                      what lets the reader's place follow them between devices. */}
                  <Route path="/books" element={<Suspense fallback={null}><Books /></Suspense>} />
                  <Route path="/books/:slug" element={<Suspense fallback={null}><BookDetail /></Suspense>} />
                  <Route path="/books/:slug/read/:chapterId?" element={<ProtectedRoute><Suspense fallback={null}><BookReader /></Suspense></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
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
