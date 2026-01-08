import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import MagneticButton from "./ui/MagneticButton";
import { Menu, X } from "lucide-react";
import NavDrawer from "./NavDrawer";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", path: "/#about" },
    { name: "Work", path: "/#projects" },
    { name: "Testimonials", path: "/#testimonials" },
    { name: "Certificates", path: "/#certificates" },
    { name: "Resume", path: "/#resume" },
    { name: "Blog", path: "/blog" },
    { name: "Tools", path: "/tools" },
    { name: "Secret", path: "/easter-eggs" },
  ];

  return (
    <>
      {/* Mobile Logo - Top Left */}
      {/* Mobile Logo - Top Left */}
      <div className="fixed top-6 left-6 z-50 xl:hidden">
        <Link to="/" className="relative group">
          <span className="text-xl font-bold tracking-tighter text-white mix-blend-difference">
            KK<span className="text-blue-500">.</span>
          </span>
        </Link>
      </div>

      {/* Mobile Menu Trigger - Top Right */}
      <div className="fixed top-6 right-6 z-50 xl:hidden">
        <button
          className="text-white p-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Floating Dynamic Island */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden xl:block"
      >
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-500 max-w-fit mx-auto",
            scrolled
              ? "bg-black/80 border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50 scale-95"
              : "bg-white/5 border-white/10 backdrop-blur-md shadow-lg"
          )}
        >
          {/* Logo */}
          <Link to="/" className="pl-3 pr-1 flex-shrink-0" data-ee="main-logo">
            <span className="text-lg font-bold tracking-tighter text-white">
              KK<span className="text-blue-500">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="flex-shrink-0">
                <MagneticButton
                  variant="ghost"
                  className={cn(
                    "relative px-3 py-2 rounded-full text-sm font-medium transition-colors hover:text-white whitespace-nowrap",
                    location.pathname === link.path && !link.path.includes("#")
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:bg-white/5"
                  )}
                >
                  {link.name}
                </MagneticButton>
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />

          {/* CTA / Menu */}
          <Link to="/#contact" className="flex-shrink-0">
            <MagneticButton
              variant="secondary"
              className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Hire Me
            </MagneticButton>
          </Link>
        </div>
      </motion.header>

      <NavDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
};

export default Navbar;

