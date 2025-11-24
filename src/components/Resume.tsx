import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, GraduationCap, Briefcase, Award } from "lucide-react";
import { toast } from "sonner";
import { api, ResumeData } from "@/services/api";
import { sanitize } from "@/utils/sanitize";

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
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </section>
    );
  }

  const stats = [
    {
      icon: <GraduationCap className="text-primary" size={32} />,
      label: "Education",
      value: resumeData?.stats.educationCount.toString() || "0",
      detail: resumeData?.stats.educationCount === 1 ? "Degree" : "Degrees"
    },
    {
      icon: <Briefcase className="text-secondary" size={32} />,
      label: "Experience",
      value: resumeData?.stats.experienceCount.toString() || "0",
      detail: resumeData?.stats.experienceCount === 1 ? "Position" : "Positions"
    },
    {
      icon: <Award className="text-accent" size={32} />,
      label: "Projects",
      value: `${resumeData?.stats.projectsCompleted || 0}+`,
      detail: "Completed"
    }
  ];

  return (
    <section id="resume" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="text-gradient">Resume</span>
          </h2>
          <p className="text-muted-foreground">
            Download my professional resume and credentials
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0, 217, 255, 0.3)" }}
              className="glass p-6 rounded-lg text-center"
            >
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <h3 className="text-3xl font-bold mb-2 text-gradient">{stat.value}</h3>
              <p className="text-lg font-semibold mb-1">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Resume Preview Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-lg p-8 glow-purple">
            <div className="space-y-8">
              {/* Education */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="text-primary" />
                  Education
                </h3>
                {resumeData?.education && resumeData.education.length > 0 ? (
                  <div className="space-y-4">
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="glass p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-primary">{edu.degree}</h4>
                        <p className="text-muted-foreground">{edu.institute}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {edu.startYear} - {edu.endYear}
                        </p>
                        {edu.description && (
                          <div
                            dangerouslySetInnerHTML={{ __html: sanitize(renderMarkdown(edu.description)) }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No education entries yet</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="text-secondary" />
                  Experience
                </h3>
                {resumeData?.experience && resumeData.experience.length > 0 ? (
                  <div className="space-y-4">
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="glass p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-secondary">{exp.role}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {exp.company} • {exp.startYear} - {exp.isPresent ? 'Present' : exp.endYear}
                        </p>
                        {exp.description && (
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            {exp.description.split('\n').filter(line => line.trim()).map((line, idx) => {
                              const cleanLine = line.trim().replace(/^[•\-]\s*/, '');
                              return cleanLine ? <li key={idx}>{cleanLine}</li> : null;
                            })}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No experience entries yet</p>
                )}
              </div>

              {/* Download Button */}
              <div className="text-center pt-4">
                <Button
                  size="lg"
                  className="gradient-cyber glow-cyan"
                  onClick={handleDownload}
                >
                  <Download className="mr-2" size={20} />
                  Download Full Resume (PDF)
                </Button>
                {!resumeData?.resume_pdf_path && (
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF will be available soon
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Resume;
