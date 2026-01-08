import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Database, Globe, Shield, Terminal, Code, Network, Bot, Lock, Cpu, Server, Cloud, Smartphone, Loader2 } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import MagneticCard from "@/components/ui/MagneticCard";
import { useState, useEffect } from "react";
import { api, Skill } from "@/services/api";

const iconMap: Record<string, any> = {
  Shield, Code, Network, Bot, Lock, Database, Terminal, Cpu, Globe, Server, Cloud, Smartphone
};

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await api.getSkills();
        setSkills(data);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return (
      <SectionWrapper id="skills">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id="skills">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight text-shadow-premium">
          Technical Arsenal
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto text-lg font-light">
          A curated stack of technologies I use to build secure and scalable solutions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill, index) => {
          const IconComponent = iconMap[skill.icon] || Code;
          // Generate a gradient based on index or category if needed, or use a default
          // For now, we'll use a subtle blue/cyan theme for all to match the site, 
          // or we could map categories to colors if we had that data consistent.
          // Let's stick to the premium glass look.

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MagneticCard className="h-full group">
                {/* Vertical Gloss Strip */}
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-50" />

                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-white text-lg tracking-tight">{skill.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {skill.items.map((item) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="bg-white/[0.03] border-white/[0.1] text-white/70 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 px-3 py-1.5 text-sm font-normal rounded-full"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default Skills;
