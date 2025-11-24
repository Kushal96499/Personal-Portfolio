import { Github, Linkedin, Mail } from "lucide-react";

interface FooterProps {
  onCopyrightClick: () => void;
}

const Footer = ({ onCopyrightClick }: FooterProps) => {
  return (
    <footer className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={onCopyrightClick}
            className="text-muted-foreground hover:text-primary transition-colors"
            data-ee-hover="footer-logo"
          >
            © 2025 Kushal Kumawat. All rights reserved.
          </button>

          <div className="flex gap-6">
            <a
              href="https://github.com/Kushal96499"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-ee="footer-github"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/kushal-ku"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-ee="footer-linkedin"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:kushalkumawat85598@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-ee="footer-email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
