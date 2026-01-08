import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { Certificate } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";

const Certifications = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await api.getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 relative">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading certificates...</p>
        </div>
      </section>
    );
  }

  return (
    <SectionWrapper id="certificates">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight text-shadow-premium">
          Certifications
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
          Professional milestones and verified skills.
        </p>
      </motion.div>

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/40">No certifications added yet.</p>
        </div>
      )}

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="h-full group p-0 overflow-hidden rounded-2xl">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Certificate Image */}
                <div className="aspect-[4/3] bg-[#0A0A0A] border-b border-white/5 flex items-center justify-center relative overflow-hidden p-8 group-hover:bg-[#0F0F0F] transition-colors duration-500">
                  {/* Soft Glow Behind Image */}
                  <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {cert.image_url ? (
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 relative z-10 drop-shadow-2xl"
                    />
                  ) : (
                    <div className="bg-white/5 p-6 rounded-full relative z-10">
                      <Award className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {cert.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0 bg-white/5 border-white/10 text-white/60 text-xs font-medium uppercase tracking-wider px-2 py-0.5">
                      {cert.status || 'Completed'}
                    </Badge>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    {cert.credential_link && (
                      <Button variant="ghost" size="sm" className="w-full gap-2 text-white/60 hover:text-white hover:bg-white/5 justify-between group/btn" asChild>
                        <a
                          href={cert.credential_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="font-medium">View Credential</span>
                          <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default Certifications;
