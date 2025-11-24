import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";
import ThreeScene from "./ThreeScene";

const Hero = () => {
  const [text, setText] = useState("");
  const roles = [
    "Cybersecurity Student",
    "Developer",
    "Web Developer",
    "Python Automation Expert",
  ];
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;
    const currentRole = roles[roleIndex];

    const typeInterval = setInterval(() => {
      if (currentIndex < currentRole.length) {
        currentText += currentRole[currentIndex];
        setText(currentText);
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          const deleteInterval = setInterval(() => {
            if (currentText.length > 0) {
              currentText = currentText.slice(0, -1);
              setText(currentText);
            } else {
              clearInterval(deleteInterval);
              setRoleIndex((prev) => (prev + 1) % roles.length);
            }
          }, 50);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [roleIndex]);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-glow" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
              data-ee-hover="hero-name"
            >
              <span className="text-gradient">Kushal Kumawat</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-6 h-10"
            >
              <span className="text-primary">{text}</span>
              <span className="animate-pulse">|</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base md:text-lg text-muted-foreground mb-8"
            >
              Intern at Inlighn Tech & CodTech | BCA Student at Biyani College
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              <Button size="lg" className="gradient-cyber glow-cyan">
                <a href="#projects">View Projects</a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <a href="#contact">Contact Me</a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex gap-6 justify-center lg:justify-start"
            >
              <a
                href="https://github.com/Kushal96499"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                data-ee="nav-github"
              >
                <Github size={28} />
              </a>
              <a
                href="https://www.linkedin.com/in/kushal-ku"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-primary transition-colors"
                data-ee="nav-linkedin"
              >
                <Linkedin size={28} />
              </a>
              <a
                href="mailto:kushalkumawat85598@gmail.com"
                className="text-foreground/60 hover:text-primary transition-colors"
                data-ee="nav-email"
              >
                <Mail size={28} />
              </a>
            </motion.div>
          </motion.div>

          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <Suspense fallback={
              <div className="w-full h-[500px] flex items-center justify-center">
                <div className="text-primary animate-pulse">Loading 3D Models...</div>
              </div>
            }>
              <ThreeScene />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
