import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";

const Hero = () => {
  const textVariants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
  };

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
      {/* Content Container */}
      <div className="container mx-auto px-6 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Massive Text */}
          <div className="flex flex-col items-start text-left">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="relative mb-8"
            >
              <div className="overflow-hidden">
                <motion.h2 variants={textVariants} className="text-sm md:text-base font-medium text-white/60 uppercase tracking-[0.2em] mb-2">
                  Creative Developer
                </motion.h2>
              </div>

              <div className="overflow-hidden">
                <motion.h1 variants={textVariants} className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem] leading-[0.9] font-black text-white tracking-tighter mix-blend-difference">
                  KUSHAL
                </motion.h1>
              </div>

              <div className="overflow-hidden">
                <motion.h1 variants={textVariants} className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem] leading-[0.9] font-black text-transparent bg-clip-text bg-gradient-to-r from-white/80 to-white/20 tracking-tighter">
                  KUMAWAT
                </motion.h1>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/50 mb-10 font-light tracking-wide max-w-lg"
            >
              Crafting digital experiences with code and gravity-defying design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-row gap-4 sm:gap-6"
            >
              <Button
                size="lg"
                className="h-12 px-6 text-base md:h-14 md:px-10 md:text-lg font-medium text-black bg-white rounded-full hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105"
                asChild
              >
                <a href="#projects">
                  View Work
                </a>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="h-12 px-6 text-base md:h-14 md:px-10 md:text-lg font-medium text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-full transition-all duration-300 backdrop-blur-md"
                asChild
              >
                <Link to="/easter-eggs">
                  <span className="flex items-center gap-2">
                    Secret Lab <ArrowRight size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  </span>
                </Link>
              </Button>
            </motion.div>

            {/* Social Dock */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-16 flex items-center gap-6"
            >
              {[
                { icon: Github, href: "https://github.com/Kushal96499" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/kushal-ku" },
                { icon: Mail, href: "mailto:kushalkumawat85598@gmail.com" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                >
                  <social.icon size={24} />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Empty to reveal 3D Background */}
          <div className="hidden lg:block h-full w-full pointer-events-none">
            {/* The 3D Ring from Experience3D will be visible here */}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
