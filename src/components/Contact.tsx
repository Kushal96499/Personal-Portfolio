import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MapPin, Linkedin, ArrowRight, Check, Zap } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    website: "" // Honeypot
  });

  // Multi-step OTP verification state
  const [step, setStep] = useState<'form' | 'otp' | 'verified'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Send OTP
  const handleSendOTP = async () => {
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Invalid email format");
      return;
    }

    // Honeypot check
    if (formData.website && formData.website.trim() !== '') {
      setFormError('Invalid submission detected');
      return;
    }

    setOtpSending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: formData.name,
          }
        }
      });

      if (error) throw error;

      setStep('otp');
      setCountdown(60);
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      console.error('OTP send error:', error);
      setFormError(error.message || 'Failed to send verification code');
    } finally {
      setOtpSending(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async () => {
    if (otpCode.length < 6) {
      setFormError('Please enter the verification code');
      return;
    }

    setOtpVerifying(true);
    setFormError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode,
        type: 'email'
      });

      if (error) throw error;

      if (data.session) {
        setStep('verified');
        toast.success("Email verified successfully!");
      }
    } catch (error: any) {
      console.error('OTP verify error:', error);
      setFormError(error.message || 'Invalid verification code');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step !== 'verified') {
      setFormError('Please verify your email first');
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please verify your email first');
      }

      // Insert message
      console.log('Inserting message into DB...');
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: user.email!, // Verified email
          message: formData.message,
          // user_id will be auto-set
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      console.log('Message inserted successfully.');

      // Send email notification (using admin function)
      try {
        console.log('Sending email notification...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: user.email,
            message: formData.message,
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('Email notification sent.');
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail submission if only email notification fails
      }

      toast.success("Message sent successfully!");

      // Show success state
      setSubmitted(true);

      // Reset form data and step
      setFormData({ name: "", email: "", message: "", website: "" });
      setStep('form');
      setOtpCode('');

      // Sign out
      await supabase.auth.signOut();

    } catch (error: any) {
      console.error("Failed to send message:", error);
      setFormError(error.message || "Failed to send message");
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
                <a href="https://linkedin.com/in/kushal-kumawat" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-blue-400 transition-colors font-light">
                  Connect on LinkedIn
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
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-white/60 mb-8 max-w-xs mx-auto">
                      Thanks for reaching out. I'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all active:scale-[0.98] shadow-premium"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all"
                        placeholder="John Doe"
                        disabled={step !== 'form'}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Your Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all"
                        placeholder="john@example.com"
                        disabled={step !== 'form'}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Message</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all min-h-[120px]"
                        placeholder="Tell me about your project..."
                        disabled={step !== 'form'}
                      />
                    </div>

                    {/* Honeypot */}
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      style={{ position: 'absolute', left: '-5000px' }}
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    {/* Error Message */}
                    {formError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          {formError}
                        </p>
                      </div>
                    )}

                    {/* OTP UI */}
                    <div className="pt-2">
                      {step === 'form' && (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpSending || isSubmitting}
                          className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {otpSending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              Send Verification Code <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      )}

                      {step === 'otp' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Mail size={20} className="text-blue-400" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">Verify your email</h4>
                                <p className="text-white/60 text-sm">Code sent to {formData.email}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="000000"
                                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-white/40 focus:bg-black/60 transition-all placeholder:text-white/20 placeholder:tracking-normal placeholder:font-sans"
                                maxLength={8}
                              />

                              <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={otpVerifying || otpCode.length < 6}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {otpVerifying ? "Verifying..." : "Verify Code"}
                              </button>
                            </div>

                            <div className="mt-4 text-center">
                              {countdown > 0 ? (
                                <p className="text-white/40 text-xs">Resend code in {countdown}s</p>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSendOTP();
                                    setOtpCode("");
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                                >
                                  Resend Code
                                </button>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setStep('form')}
                            className="w-full py-2 text-white/40 hover:text-white text-sm transition-colors"
                          >
                            Cancel Verification
                          </button>
                        </div>
                      )}

                      {step === 'verified' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Check size={16} className="text-green-400" />
                            </div>
                            <div>
                              <p className="text-green-400 font-medium text-sm">Email Verified Successfully!</p>
                            </div>
                          </div>

                          <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Sending Message...
                              </>
                            ) : (
                              <>
                                Send Message <Zap size={18} className="fill-black" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
