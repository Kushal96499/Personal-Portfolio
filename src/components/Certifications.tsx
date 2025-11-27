import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { Certificate } from "@/integrations/supabase/types";
import { toast } from "sonner";

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
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading certificates...</p>
        </div>
      </section>
    );
  }


  return (
    <section id="certificates" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-dark opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Certifications & <span className="text-gradient">Achievements</span>
          </h2>
          <p className="text-muted-foreground">
            Professional certifications and continuous learning journey
          </p>
        </motion.div>

        {/* Empty State */}
        {!loading && certificates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No certifications added yet.</p>
          </div>
        )}

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 50, rotateX: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 0 30px rgba(0, 217, 255, 0.5)"
              }}
              className="glass p-6 rounded-lg relative overflow-hidden transform-gpu"
            >
              {/* Certificate Image */}
              <div className="aspect-video bg-black/50 rounded-md flex items-center justify-center border border-border relative overflow-hidden mb-4">
                {cert.image_url ? (
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Award className="w-12 h-12 text-primary" />
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">
                  {cert.title}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${cert.status === 'In Progress'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                    }`}>
                    {cert.status || 'Completed'}
                  </span>
                  {cert.credential_link && (
                    <a
                      href={cert.credential_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    >
                      <span>View Credential</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-cyber opacity-50" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
