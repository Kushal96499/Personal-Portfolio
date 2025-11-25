import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { api } from "@/services/api";
import { CheckCircle, Send, Loader2 } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    honeypot: "", // Anti-spam honeypot
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check (60 seconds between submissions)
    const lastSubmitTime = localStorage.getItem('lastContactSubmit');
    const now = Date.now();
    const cooldownPeriod = 60 * 1000; // 60 seconds

    if (lastSubmitTime) {
      const timeSinceLastSubmit = now - parseInt(lastSubmitTime);
      if (timeSinceLastSubmit < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastSubmit) / 1000);
        toast.error(`Please wait ${remainingSeconds} seconds before sending another message`, {
          className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500",
          style: {
            boxShadow: "0 0 20px rgba(234, 179, 8, 0.3)",
          },
        });
        return;
      }
    }

    // Anti-spam check (Honeypot)
    if (formData.honeypot) {
      console.log("Bot detected");
      return;
    }

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields", {
        className: "border-red-500/50 bg-red-500/10 text-red-500",
        style: {
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
        },
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address", {
        className: "border-red-500/50 bg-red-500/10 text-red-500",
        style: {
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save message to Supabase
      await api.submitContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      // 2. Send emails via Supabase Edge Function
      try {
        await api.sendContactEmail({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        });

      } catch (emailError: any) {
        console.error("Failed to send emails:", emailError);
        // Continue even if email fails - message is still saved
      }

      // 3. Store submission timestamp for rate limiting
      localStorage.setItem('lastContactSubmit', now.toString());

      // 4. Show Success UI
      setIsSuccess(true);
      toast.success("Message sent successfully!", {
        description: "Thanks for reaching out! I'll get back to you soon.",
        className: "border-primary/50 bg-primary/10 text-primary",
        style: {
          boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)",
        },
      });

      // 5. Reset form fields
      setFormData({ name: "", email: "", message: "", honeypot: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);

    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.", {
        description: error.message || "Something went wrong",
        className: "border-red-500/50 bg-red-500/10 text-red-500",
        style: {
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative">
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
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground">
            Let's collaborate on your next cybersecurity or development project
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass p-8 rounded-lg glow-cyan relative overflow-hidden"
        >
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
              <p className="text-muted-foreground">
                Thanks for reaching out. I'll get back to you shortly.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="mt-4 border-green-500/50 text-green-500 hover:bg-green-500/10"
              >
                Send Another Message
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background/50 border-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background/50 border-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="bg-background/50 border-primary/30 focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-cyber glow-cyan group"
                disabled={isSubmitting}
                data-ee="contact-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
