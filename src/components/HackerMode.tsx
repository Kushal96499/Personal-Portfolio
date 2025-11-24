import { useEffect } from "react";

interface HackerModeProps {
  isActive: boolean;
}

const HackerMode = ({ isActive }: HackerModeProps) => {
  useEffect(() => {
    // Apply smooth transition
    document.documentElement.style.transition = "all 0.4s ease-in-out";
    
    if (isActive) {
      document.documentElement.style.setProperty("--background", "0 0% 0%");
      document.documentElement.style.setProperty("--foreground", "120 100% 50%");
      document.documentElement.style.setProperty("--primary", "120 100% 50%");
      document.documentElement.style.setProperty("--secondary", "120 100% 30%");
      document.documentElement.style.setProperty("--muted", "120 20% 10%");
      document.documentElement.style.setProperty("--accent", "120 100% 50%");
      document.documentElement.style.setProperty("--border", "120 30% 20%");
      document.body.style.fontFamily = "'Courier New', monospace";
      document.body.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"24\" fill=\"%2300ff00\"><text y=\"16\" font-size=\"16\">|</text></svg>'), auto";
    } else {
      document.documentElement.style.setProperty("--background", "222 47% 5%");
      document.documentElement.style.setProperty("--foreground", "180 100% 95%");
      document.documentElement.style.setProperty("--primary", "193 100% 50%");
      document.documentElement.style.setProperty("--secondary", "271 76% 53%");
      document.documentElement.style.setProperty("--muted", "222 47% 15%");
      document.documentElement.style.setProperty("--accent", "193 100% 50%");
      document.documentElement.style.setProperty("--border", "222 47% 20%");
      document.body.style.fontFamily = "";
      document.body.style.cursor = "";
    }
    
    // Clean up transition after animation completes
    const timer = setTimeout(() => {
      document.documentElement.style.transition = "";
    }, 400);
    
    return () => clearTimeout(timer);
  }, [isActive]);

  return null;
};

export default HackerMode;
