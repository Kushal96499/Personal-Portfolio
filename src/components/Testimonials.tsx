import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { Testimonial } from "@/integrations/supabase/types";
import { toast } from "sonner";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await api.getPublicTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testimonials.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
      scale: 0.8,
    }),
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (loading) {
    return (
      <section id="testimonials" className="py-20 relative overflow-hidden">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            What People Say
          </h2>
          <p className="text-white/40">No testimonials available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Client <span className="text-gradient-premium">Testimonials</span>
          </h2>
        </motion.div>

        <div className="relative max-w-5xl mx-auto h-[500px] flex items-center justify-center perspective-1000">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.5 },
                rotateY: { duration: 0.5 },
                scale: { duration: 0.5 },
              }}
              className="absolute w-full max-w-3xl"
            >
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 md:p-14 rounded-3xl shadow-premium hover:shadow-[0_0_40px_-10px_rgba(76,140,255,0.2)] hover:border-blue-500/30 transition-all duration-500 group">
                {/* Gradient Quote Icon */}
                <div className="absolute top-8 right-8 text-white/5 group-hover:text-blue-500/10 transition-colors duration-500">
                  <Quote size={80} />
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {testimonials[currentIndex].avatar_url ? (
                      <motion.img
                        src={testimonials[currentIndex].avatar_url}
                        alt={testimonials[currentIndex].name}
                        className="w-24 h-24 rounded-full border-2 border-white/10 object-cover relative z-10"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center relative z-10">
                        <User className="w-10 h-10 text-white/40" />
                      </div>
                    )}
                  </div>

                  <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed font-light italic">
                    "{testimonials[currentIndex].message}"
                  </p>

                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-blue-400 text-sm font-medium tracking-wide uppercase">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute left-0 md:-left-12 z-20 bg-white/5 hover:bg-white/10 text-white rounded-full w-12 h-12 border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-0 md:-right-12 z-20 bg-white/5 hover:bg-white/10 text-white rounded-full w-12 h-12 border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Dot Indicators */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex
                  ? "bg-blue-500 w-8 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  : "bg-white/20 w-2 hover:bg-white/40"
                  }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
