import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(32); // Default: 2rem (32px)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollPercentage(Math.round(latest * 100));
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollBottom = scrollTop + windowHeight;

      // Calculate distance from bottom
      const distanceFromBottom = documentHeight - scrollBottom;

      // Adjust position when within 100px of bottom
      // Footer is typically 60-80px tall, so we shift up by 80-100px
      if (distanceFromBottom < 100) {
        // Smoothly transition from 32px to 100px based on proximity
        const offset = 32 + (100 - distanceFromBottom) * 0.8;
        setBottomOffset(Math.min(offset, 100));
      } else {
        setBottomOffset(32);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-cyber origin-left z-50 glow-cyan"
        style={{ scaleX }}
      />

      {/* Scroll percentage indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: scrollPercentage > 5 ? 1 : 0,
          scale: scrollPercentage > 5 ? 1 : 0,
        }}
        style={{
          bottom: `${bottomOffset}px`,
        }}
        transition={{
          bottom: { duration: 0.3, ease: "easeOut" },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
        }}
        className="fixed right-4 md:right-8 z-50 glass w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center glow-cyan"
      >
        <span className="text-primary font-bold text-xs md:text-sm">{scrollPercentage}%</span>
      </motion.div>
    </>
  );
};

export default ScrollProgress;
