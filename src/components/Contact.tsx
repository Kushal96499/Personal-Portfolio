import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/services/api";
import { Mail, MapPin, Linkedin, ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GlassCard from "@/components/ui/GlassCard";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      // Send email notification
      await api.sendContactEmail({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionWrapper id="contact">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight text-shadow-premium">
            Get in <span className="text-gradient-premium">Touch</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
            Have a project in mind or just want to say hi? I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-6 group">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:scale-110 transition-all duration-300 shadow-premium">
                <Mail className="w-6 h-6 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Email</h3>
                <a href="mailto:kushalkumawat85598@gmail.com" className="text-white/60 hover:text-blue-400 transition-colors font-light">
                  kushalkumawat85598@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white shrink-0 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:scale-110 transition-all duration-300 shadow-premium">
                <MapPin className="w-6 h-6 group-hover:text-purple-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Location</h3>
                <p className="text-white/60 font-light">India</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white shrink-0 group-hover:bg-blue-400/10 group-hover:border-blue-400/30 group-hover:scale-110 transition-all duration-300 shadow-premium">
                <Linkedin className="w-6 h-6 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">LinkedIn</h3>
                <a href="https://www.linkedin.com/in/kushal-ku" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-blue-400 transition-colors font-light">
                  @Kushal96499
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-0 group rounded-3xl">
              {/* Gradient Outline Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <CardContent className="p-8 md:p-10 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-white/80 ml-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-white/80 ml-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-white/80 ml-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="How can I help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 rounded-xl resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transition-all duration-300 h-12 rounded-xl font-medium text-lg group/btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />}
                  </Button>
                </form>
              </CardContent>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
