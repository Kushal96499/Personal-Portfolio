import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, GraduationCap, Briefcase, Award } from "lucide-react";
import { toast } from "sonner";
import { api, ResumeData } from "@/services/api";
import { sanitize } from "@/utils/sanitize";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";

// Simple markdown renderer for basic formatting
const renderMarkdown = (text: string) => {
  return text
    .split('\n')
    .map((line, idx) => {
      // Handle bold **text**
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle italic *text*
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return `<li key="${idx}">${line.trim().substring(2)}</li>`;
      }
      return line ? `<p key="${idx}">${line}</p>` : '';
    })
    .join('');
};

const Resume = () => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumeData();

    // Subscribe to real-time updates
    const channel = api.subscribeToResumeData((data) => {
      setResumeData(data);
    });

    return () => {
      api.unsubscribeFromResumeData(channel);
    };
  }, []);

  const fetchResumeData = async () => {
    try {
      const data = await api.getResumeData();
      setResumeData(data);
    } catch (error) {
      console.error('Failed to fetch resume data:', error);
      toast.error('Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resumeData?.resume_pdf_path) {
      // Trigger download
      const link = document.createElement('a');
      link.href = resumeData.resume_pdf_path;
      link.download = 'Resume.pdf';
      link.target = '_blank';
      link.click();
      toast.success("Downloading resume...");
    } else {
      toast.info("Resume PDF will be available soon!");
    }
  };

  if (loading) {
    return (
      <section id="resume" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading resume...</p>
        </div>
      </section>
    );
  }

  const stats = [
    {
      icon: <GraduationCap className="text-blue-400" size={28} />,
      label: "Education",
      value: resumeData?.stats.educationCount.toString() || "0",
      detail: resumeData?.stats.educationCount === 1 ? "Degree" : "Degrees"
    },
    {
      icon: <Briefcase className="text-purple-400" size={28} />,
      label: "Experience",
      value: resumeData?.stats.experienceCount.toString() || "0",
      detail: resumeData?.stats.experienceCount === 1 ? "Position" : "Positions"
    },
    {
      icon: <Award className="text-emerald-400" size={28} />,
      label: "Projects",
      value: `${resumeData?.stats.projectsCompleted || 0}+`,
      detail: "Completed"
    }
  ];

  return (
    <SectionWrapper id="resume">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-20 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight text-shadow-premium">
          My <span className="text-gradient-premium">Resume</span>
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
          A timeline of my professional journey and academic achievements.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <GlassCard className="p-8 h-full flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-white/90">{stat.label}</p>
                <p className="text-sm text-white/40">{stat.detail}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Resume Preview Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Gloss Effect */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="space-y-12 relative z-10">
            {/* Education */}
            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <GraduationCap className="text-blue-400" size={24} />
                </div>
                Education
              </h3>
              {resumeData?.education && resumeData.education.length > 0 ? (
                <div className="space-y-6">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="group relative pl-8 border-l border-white/10 hover:border-blue-500/50 transition-colors duration-300">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[#0A0A0A] border border-white/20 group-hover:border-blue-400 group-hover:bg-blue-400 transition-all duration-300" />

                      <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-xl hover:bg-white/[0.04] transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                          <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{edu.degree}</h4>
                          <span className="text-sm font-mono text-white/40 bg-white/5 px-2 py-1 rounded">
                            {edu.startYear} - {edu.endYear}
                          </span>
                        </div>
                        <p className="text-blue-400 font-medium mb-4">{edu.institute}</p>
                        {edu.description && (
                          <div
                            className="text-base text-white/60 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{ __html: sanitize(renderMarkdown(edu.description)) }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-center py-4">No education entries yet</p>
              )}
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Briefcase className="text-purple-400" size={24} />
                </div>
                Experience
              </h3>
              {resumeData?.experience && resumeData.experience.length > 0 ? (
                <div className="space-y-6">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="group relative pl-8 border-l border-white/10 hover:border-purple-500/50 transition-colors duration-300">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[#0A0A0A] border border-white/20 group-hover:border-purple-400 group-hover:bg-purple-400 transition-all duration-300" />

                      <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-xl hover:bg-white/[0.04] transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                          <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{exp.role}</h4>
                          <span className="text-sm font-mono text-white/40 bg-white/5 px-2 py-1 rounded">
                            {exp.startYear} - {exp.isPresent ? 'Present' : exp.endYear}
                          </span>
                        </div>
                        <p className="text-purple-400 font-medium mb-4">{exp.company}</p>
                        {exp.description && (
                          <ul className="text-base text-white/60 list-disc list-inside space-y-2 leading-relaxed font-light marker:text-white/20">
                            {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => {
                              const cleanLine = line.trim().replace(/^[•\-]\s*/, '');
                              return cleanLine ? <li key={idx}>{cleanLine}</li> : null;
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-center py-4">No experience entries yet</p>
              )}
            </div>

            {/* Download Button */}
            <div className="text-center pt-8 border-t border-white/5">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transition-all duration-300 h-14 px-8 text-lg rounded-xl"
                onClick={handleDownload}
              >
                <Download className="mr-2" size={20} />
                Download Full Resume
              </Button>
              {!resumeData?.resume_pdf_path && (
                <p className="text-xs text-white/30 mt-3">
                  PDF will be available soon
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default Resume;
