import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Code, Network, Bot, Lock, Database, Terminal, Cpu, Globe, Server, Cloud, Smartphone } from "lucide-react";
import { api, Skill } from "@/services/api";
import { toast } from "sonner";

// Map icon names to Lucide components
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
        console.error("Failed to load skills:", error);
        toast.error("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Helper to get color based on index or category
  const getCategoryColor = (index: number) => {
    const colors = ["primary", "secondary", "accent"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <section id="skills" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-dark opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" data-ee-hover="skills-title">
            My <span className="text-gradient">Skills</span>
          </h2>
          <p className="text-muted-foreground">
            Expertise in Network Security, Ethical Hacking, and Incident Response
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => {
            const IconComponent = iconMap[skill.icon] || Code;
            const color = getCategoryColor(index);

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 50, rotateY: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: color === "primary" ? "0 0 30px rgba(0, 217, 255, 0.5)" :
                    color === "secondary" ? "0 0 30px rgba(181, 55, 255, 0.5)" :
                      "0 0 30px rgba(0, 217, 255, 0.3)"
                }}
                className="glass p-6 rounded-lg transform-gpu"
              >
                <div className={`text-${color} mb-4`}>
                  <IconComponent size={40} />
                </div>
                <h3 className="text-xl font-bold mb-4">{skill.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 font-mono">{skill.category}</p>
                <ul className="space-y-2">
                  {skill.items.map((item, idx) => (
                    <li key={idx} className="text-muted-foreground flex items-center gap-2">
                      <span className={`w-2 h-2 bg-${color} rounded-full`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
