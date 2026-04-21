import { useState, useEffect, lazy, Suspense } from "react";
import { useSiteControls } from "@/contexts/SiteControlsContext";
import Hero from "@/components/Hero";
import About from "@/components/About";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEasterEggs } from "@/contexts/EasterEggsContext";
import { SEO } from "@/components/SEO";

const Skills = lazy(() => import("@/components/Skills"));
const Projects = lazy(() => import("@/components/Projects"));
const Terminal = lazy(() => import("@/components/Terminal"));
const Certifications = lazy(() => import("@/components/Certifications"));
const Resume = lazy(() => import("@/components/Resume"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));
const Blog = lazy(() => import("@/components/Blog"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const ThreatMap = lazy(() => import("@/components/ThreatMap"));
const FAQ = lazy(() => import("@/components/FAQ"));

const Index = () => {
  const { settings } = useEasterEggs();
  const { controls, loading } = useSiteControls();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen relative">
      <SEO 
        title="Cybersecurity Portfolio & Full-Stack Expert" 
        description="Explore the cybersecurity portfolio of Kushal Kumawat. Expert in ethical hacking, penetration testing, and building secure, high-performance web applications." 
      />

      <div className="relative z-10">
        {controls.home_hero && <Hero />}
        <About />
        <Suspense fallback={<div className="h-20 flex items-center justify-center"><LoadingSpinner /></div>}>
          {controls.skills && <Skills />}
          <Terminal />
          {controls.projects && <Projects />}
          {controls.blog && <Blog />}
          {controls.threat_map_enabled && <ThreatMap />}
          {controls.testimonials && <Testimonials />}
          {controls.certificates && <Certifications />}
          <FAQ />
          <Resume />
          {controls.contact && <Contact />}
          <Footer />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
