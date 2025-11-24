import { useState, useEffect } from "react";
import { useSiteControls } from "@/contexts/SiteControlsContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Terminal from "@/components/Terminal";
import Certifications from "@/components/Certifications";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CursorTrail from "@/components/CursorTrail";
import ScrollProgress from "@/components/ScrollProgress";
import Blog from "@/components/Blog";
import ParticleBackground from "@/components/ParticleBackground";
import Testimonials from "@/components/Testimonials";
import ThreatMap from "@/components/ThreatMap";
import { useEasterEggs } from "@/contexts/EasterEggsContext";

const Index = () => {
  const { settings } = useEasterEggs();
  const { controls, loading } = useSiteControls();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10">
        <CursorTrail />
        <ScrollProgress />
        <Navbar onLogoClick={() => { }} />
        {controls.home_hero && <Hero />}
        <About />
        {controls.skills && <Skills />}
        <Terminal />
        {controls.projects && <Projects />}
        {controls.blog && <Blog />}
        {controls.threat_map_enabled && <ThreatMap />}
        {controls.testimonials && <Testimonials />}
        {controls.certificates && <Certifications />}
        <Resume />
        {controls.contact && <Contact />}
        <Footer onCopyrightClick={() => { }} />
      </div>
    </div>
  );
};

export default Index;
