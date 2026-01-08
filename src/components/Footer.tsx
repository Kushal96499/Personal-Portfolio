import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-8 pb-28 md:pb-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-900/10 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <Link to="/" className="text-xl font-bold text-white tracking-tight hover:text-blue-400 transition-colors">
              Kushal<span className="text-white/50">.in</span>
            </Link>
            <p className="text-sm text-white/50 font-light">
              Security-focused automation and development solutions
            </p>
            <p className="text-xs text-white/30 font-light mt-0.5">
              Built with privacy and security by design
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Kushal96499"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors hover:scale-110 transform duration-300"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/kushal-ku"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors hover:scale-110 transform duration-300"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:kushalkumawat85598@gmail.com"
              className="text-white/40 hover:text-white transition-colors hover:scale-110 transform duration-300"
              aria-label="Email Contact"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="text-sm text-white/40 font-mono">
              &copy; {currentYear} Kushal Kumawat
            </div>
            <div className="text-xs text-white/30">
              All rights reserved
            </div>
          </div>
        </div>

        {/* Optional: Subtle Divider & Tools Disclaimer */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-center text-xs text-white/30 font-light">
            Tools and utilities provided for educational and professional use only. Use responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
