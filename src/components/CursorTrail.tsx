import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useLocation } from "react-router-dom";

const CursorTrail = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  // Smooth springs for different elements
  const springConfig = { damping: 25, stiffness: 700 };
  const mainX = useSpring(mouseX, springConfig);
  const mainY = useSpring(mouseY, springConfig);

  const outerX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const outerY = useSpring(mouseY, { damping: 20, stiffness: 300 });

  const dotX = useSpring(mouseX, { damping: 30, stiffness: 800 });
  const dotY = useSpring(mouseY, { damping: 30, stiffness: 800 });

  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  // Only render on non-touch devices to save performance
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor glow */}
      <motion.div
        className="fixed pointer-events-none z-[99999] w-8 h-8 rounded-full bg-white/30 blur-xl"
        style={{
          x: mainX,
          y: mainY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Outer cursor ring */}
      <motion.div
        className="fixed pointer-events-none z-[99999] w-6 h-6 rounded-full border-2 border-white/50"
        style={{
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Inner cursor dot */}
      <motion.div
        className="fixed pointer-events-none z-[99999] w-2 h-2 rounded-full bg-white"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
};

export default CursorTrail;
