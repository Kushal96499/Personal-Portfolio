import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api, AboutMe } from "@/services/api";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";

const About = () => {
  const [aboutMe, setAboutMe] = useState<AboutMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutData = await api.getAboutMe();
        setAboutMe(aboutData);
      } catch (error) {
        console.error("Failed to fetch about data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SectionWrapper id="about">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* Left: Image with Spotlight & 3D Rings */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative group perspective-1000"
        >
          {/* Spotlight Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto transform-style-3d group-hover:rotate-y-12 transition-transform duration-700">
            {/* 3D Rings */}
            <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transform translate-z-20" />
            <div className="absolute -inset-4 rounded-full border border-white/5 animate-pulse-glow transform translate-z-10" />

            <div className="absolute inset-2 rounded-full overflow-hidden border border-white/10 bg-[#111111] shadow-2xl transform translate-z-30">
              {aboutMe?.profile_image_url ? (
                <img
                  src={aboutMe.profile_image_url}
                  alt="Kushal Kumawat - Profile Picture"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20">
                  <Loader2 className="w-12 h-12 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight drop-shadow-lg text-shadow-premium">
            {aboutMe?.title || "Cybersecurity Architect & Full-Stack Strategist"}
          </h2>
          <div className="space-y-6 text-lg md:text-xl text-white/80 leading-relaxed whitespace-pre-wrap font-light">
            {aboutMe?.description || 
              "With a dual passion for building scalable web architectures and hardening digital defenses, I help organizations navigate the complex landscape of modern cybersecurity. My approach combines deep technical expertise in ethical hacking—including vulnerability scanning and IDS implementation—with a commitment to writing clean, secure, and performant code. I am dedicated to creating digital experiences that are not only visually stunning but also resilient against evolving threats."
            }
          </div>

          {/* Apple-style Metric Blocks */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            <GlassCard className="p-6 group">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4 opacity-50" />
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter group-hover:text-blue-400 transition-colors">
                {aboutMe?.experience_years || "3+"}
              </h3>
              <p className="text-sm md:text-base text-white/50 font-medium uppercase tracking-wider">Years Experience</p>
            </GlassCard>

            <GlassCard className="p-6 group">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4 opacity-50" />
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter group-hover:text-purple-400 transition-colors">
                {aboutMe?.projects_completed || "50+"}
              </h3>
              <p className="text-sm md:text-base text-white/50 font-medium uppercase tracking-wider">Projects Completed</p>
            </GlassCard>
          </div>

          {/* Technical Keywords Cloud (Hidden from visual clutter or styled subtley, but great for GEO/SEO) */}
          <div className="mt-10 flex flex-wrap gap-2 opacity-60">
            {["Penetration Testing", "Full-Stack Security", "IDS/IPS", "Web Architecture", "Secure Code Audits", "Vulnerability Research"].map(tag => (
              <span key={tag} className="text-xs md:text-sm font-medium text-white/40 border border-white/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default About;
