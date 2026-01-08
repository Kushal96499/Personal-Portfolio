import { useState, useEffect } from "react";
import { useSiteControls } from "@/contexts/SiteControlsContext";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Terminal from "@/components/Terminal";
import Certifications from "@/components/Certifications";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import Blog from "@/components/Blog";

import Testimonials from "@/components/Testimonials";
import ThreatMap from "@/components/ThreatMap";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useEasterEggs } from "@/contexts/EasterEggsContext";

const Index = () => {
  const { settings } = useEasterEggs();
  const { controls, loading } = useSiteControls();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen relative">


      <div className="relative z-10">

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
        <Footer />
      </div>
    </div>
  );
};

export default Index;
