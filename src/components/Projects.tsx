import { motion } from "framer-motion";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Loader2, FolderGit2, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { Project } from "@/integrations/supabase/types";
import { toast } from "sonner";
import SectionWrapper from "@/components/ui/SectionWrapper";
import MagneticCard from "@/components/ui/MagneticCard";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getPublicProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionWrapper id="projects">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight text-shadow-premium">
            Featured Projects
          </h2>
          <p className="text-white/60 max-w-xl text-lg font-light">
            A selection of my recent work in security and automation.
          </p>
        </div>
        <Button variant="outline" className="hidden md:flex bg-white/5 border-white/10 hover:bg-white/10 text-white backdrop-blur-sm" asChild>
          <a href="https://github.com/Kushal96499" target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" />
            View GitHub Profile
          </a>
        </Button>
      </motion.div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-white/20" />
          <p className="text-white/40">Loading projects...</p>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderGit2 className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40">No projects found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <MagneticCard className="h-full flex flex-col group rounded-[24px] overflow-hidden">
              {project.thumbnail_url && (
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={project.thumbnail_url}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020005] to-transparent opacity-60" />
                </div>
              )}
              <CardHeader className="px-6 pt-6 pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold text-white mb-2">
                  {project.name}
                </CardTitle>
                <p className="text-white/60 text-sm font-light line-clamp-2">
                  {project.description}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-4 relative z-10 flex-grow">
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border-white/[0.05] backdrop-blur-sm px-2.5 py-1 rounded-md font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-6 pb-6 pt-2 relative z-10">
                <div className="flex items-center gap-4 w-full">
                  {project.github_link && (
                    <a
                      href={project.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2 group/link"
                    >
                      <Github className="w-4 h-4" />
                      <span className="relative">
                        View Code
                        <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                      </span>
                    </a>
                  )}
                  {project.demo_link && (
                    <a
                      href={project.demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 ml-auto group/link"
                    >
                      <span className="relative">
                        Live Demo
                        <span className="absolute left-0 -bottom-0.5 w-full h-[1px] bg-blue-400/50 group-hover/link:bg-blue-300 transition-colors" />
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardFooter>
            </MagneticCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center md:hidden">
        <Button variant="outline" className="w-full bg-white/5 border-white/10" asChild>
          <a href="https://github.com/Kushal96499" target="_blank" rel="noopener noreferrer">
            View GitHub Profile
          </a>
        </Button>
      </div>
    </SectionWrapper >
  );
};

export default Projects;
