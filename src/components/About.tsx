import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { api, AboutMe, TimelineItem } from "@/services/api";

const About = () => {
  const [aboutMe, setAboutMe] = useState<AboutMe | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutData, timelineData] = await Promise.all([
          api.getAboutMe(),
          api.getTimelineItems()
        ]);
        setAboutMe(aboutData);
        setTimelineItems(timelineData);
      } catch (error) {
        console.error("Failed to fetch about data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="about" className="py-20 relative min-h-[600px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {aboutMe?.title?.split(' ').map((word, i, arr) => (
              <span key={i} className={i === arr.length - 1 ? "text-gradient" : ""}>
                {word}{" "}
              </span>
            )) || (
                <>
                  About <span className="text-gradient">Me</span>
                </>
              )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
            {aboutMe?.description || "Passionate cybersecurity student with hands-on experience in web development, Python automation, and security tools."}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {timelineItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 mb-8 relative"
            >
              <div className="glass p-4 rounded-lg flex-shrink-0 glow-cyan w-16 h-16 flex items-center justify-center mx-auto sm:mx-0">
                {item.icon_type === 'graduation-cap' ? (
                  <GraduationCap className="text-accent" />
                ) : (
                  <Briefcase className="text-primary" />
                )}
              </div>
              <div className="glass p-6 rounded-lg flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-primary mb-2">{item.period}</p>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}

          {timelineItems.length === 0 && (
            <div className="text-center text-muted-foreground">
              No timeline items found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default About;
