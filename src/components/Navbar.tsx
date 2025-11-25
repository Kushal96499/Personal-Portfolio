import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteControls } from "@/contexts/SiteControlsContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useEasterEggs } from "@/contexts/EasterEggsContext";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onLogoClick: () => void;
}

const Navbar = ({ onLogoClick }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { controls, loading } = useSiteControls();
  const { branding, loading: brandingLoading } = useBranding();
  const { settings } = useEasterEggs();

  const navLinks = loading ? [] : [
    ...(controls.home_hero ? [{ href: "/#home", label: "Home" }] : []),
    { href: "/#about", label: "About" }, // always visible
    ...(controls.skills ? [{ href: "/#skills", label: "Skills" }] : []),
    ...(controls.projects ? [{ href: "/#projects", label: "Projects" }] : []),
    ...(controls.blog ? [{ href: "/#blog", label: "Blog" }] : []),
    ...(controls.threat_map_enabled ? [{ href: "/#threat-map", label: "Threat Map" }] : []),
    ...(controls.testimonials ? [{ href: "/#testimonials", label: "Testimonials" }] : []),
    ...(controls.certificates ? [{ href: "/#certificates", label: "Certificates" }] : []),
    { href: "/#resume", label: "Resume" }, // always visible
    ...(controls.contact ? [{ href: "/#contact", label: "Contact" }] : []),
    ...(settings.eggs_page_enabled ? [{ href: "/easter-eggs", label: "Easter Eggs" }] : []),
  ];

  return (
    <nav
      className={
        cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "py-3 backdrop-blur-xl bg-background/60 border-b border-primary/20 shadow-[0_8px_32px_rgba(0,234,255,0.15)]"
            : "py-6 bg-transparent"
        )
      }
    >
      {/* Animated neon top border when scrolled */}
      {isScrolled && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-pulse" />
      )}

      <div className="container mx-auto px-4 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="hover:scale-110 transition-transform"
          style={{ height: `${branding.logo_size}px` }}
          data-ee="main-logo"
        >
          {!brandingLoading && branding.logo_type === 'image' && branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt="Logo"
              className={`logo-round transition-all ${branding.neon_glow ? 'logo-neon-glow' : ''}`}
              style={{
                height: `${branding.logo_size}px`,
                width: `${branding.logo_size}px`
              }}
            />
          ) : (
            <span
              className={`text-2xl font-bold text-gradient transition-all ${branding.neon_glow ? 'logo-neon-glow' : ''}`}
              style={{ fontSize: `${branding.logo_size}px` }}
            >
              KK
            </span>
          )}
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              data-ee={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                if (link.href.includes('#')) {
                  const sectionId = link.href.split('#')[1];
                  // If we are already on the home page, just scroll
                  if (window.location.pathname === '/') {
                    import('@/utils/scrollManager').then(({ scrollToSection }) => {
                      scrollToSection(sectionId);
                    });
                  }
                }
              }}
              className="relative group text-foreground/80 hover:text-primary transition-all duration-300 font-medium text-sm xl:text-base whitespace-nowrap"
            >
              <span className="relative z-10">{link.label}</span>
              {/* Animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              {/* Glow effect on hover */}
              <span className="absolute inset-0 bg-primary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass mt-4 mx-4 rounded-lg p-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              data-ee={`nav-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="block py-3 px-2 text-foreground/80 hover:text-primary transition-colors border-b border-white/5 last:border-0"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (link.href.includes('#')) {
                  const sectionId = link.href.split('#')[1];
                  if (window.location.pathname === '/') {
                    import('@/utils/scrollManager').then(({ scrollToSection }) => {
                      scrollToSection(sectionId);
                    });
                  }
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

