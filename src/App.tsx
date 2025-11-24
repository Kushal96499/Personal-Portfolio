import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SecurityCheck from "./components/SecurityCheck";

// Lazy load admin and detail pages
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Projects = lazy(() => import("./pages/admin/Projects"));
const Testimonials = lazy(() => import("./pages/admin/Testimonials"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const Certificates = lazy(() => import("./pages/admin/Certificates"));
const Blogs = lazy(() => import("./pages/admin/Blogs"));
const Skills = lazy(() => import("./pages/admin/Skills"));
const EasterEggs = lazy(() => import("./pages/admin/EasterEggs"));
const Logs = lazy(() => import("./pages/admin/Logs"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const SectionControls = lazy(() => import("./pages/admin/SectionControls"));
const BrandingSettings = lazy(() => import("./pages/admin/BrandingSettings"));
const ResumeSettings = lazy(() => import("./pages/admin/ResumeSettings"));
const EasterEggsPublic = lazy(() => import("./pages/EasterEggsPublic"));
import { AuthProvider } from "./contexts/AuthContext";
import { SiteControlsProvider } from "@/contexts/SiteControlsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

import { EasterEggsProvider } from "./contexts/EasterEggsContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import EasterEggEngine from "./components/EasterEggEngine";

// Supabase function URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VERIFY_TURNSTILE_URL = `${SUPABASE_URL.replace('.supabase.co', '')}.functions.supabase.co/verify-turnstile`;


const App = () => {
  const [verified, setVerified] = useState(false);

  const handleVerified = async (token) => {
    try {
      // Call Supabase Edge Function for backend verification
      const res = await fetch(VERIFY_TURNSTILE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        console.log("Backend verification successful");
        setVerified(true);
      } else {
        console.error("Backend verification failed:", data);
        alert("Verification failed. Please try again.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Unable to verify. Please try again.");
      window.location.reload();
    }
  };

  if (!verified) {
    return <SecurityCheck onVerified={handleVerified} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EasterEggsProvider>
            <SiteControlsProvider>
              <BrandingProvider>
                <EasterEggEngine />
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
                        <Route path="/easter-eggs" element={<EasterEggsPublic />} />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<Login />} />
                        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                          <Route index element={<Dashboard />} />
                          <Route path="projects" element={<Projects />} />
                          <Route path="testimonials" element={<Testimonials />} />
                          <Route path="messages" element={<Messages />} />
                          <Route path="certificates" element={<Certificates />} />
                          <Route path="blogs" element={<Blogs />} />
                          <Route path="skills" element={<Skills />} />
                          <Route path="resume" element={<ResumeSettings />} />
                          <Route path="easter-eggs" element={<EasterEggs />} />
                          <Route path="logs" element={<Logs />} />
                          <Route path="section-controls" element={<SectionControls />} />
                          <Route path="branding" element={<BrandingSettings />} />
                        </Route>

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </BrandingProvider>
            </SiteControlsProvider>
          </EasterEggsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
