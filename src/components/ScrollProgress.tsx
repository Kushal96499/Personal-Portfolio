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

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrollPercentage(Math.round(latest * 100));
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

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
        className="fixed bottom-8 right-8 z-50 glass w-16 h-16 rounded-full flex items-center justify-center glow-cyan"
      >
        <span className="text-primary font-bold text-sm">{scrollPercentage}%</span>
      </motion.div>
    </>
  );
};

export default ScrollProgress;
