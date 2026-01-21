import { Drawer } from "vaul";
import { Link } from "react-router-dom";
import {
    Briefcase,
    Home,
    Layers,
    Mail,
    User,
    Wrench,
    FileText,
    MessageSquare,
    BookOpen,
    Award,
    Github,
    Linkedin,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { Button } from "./ui/button";

interface NavDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NavDrawer = ({ open, onOpenChange }: NavDrawerProps) => {
    const menuItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: Layers, label: "Services", path: "/services" },
        { icon: Briefcase, label: "Work", path: "/#projects" },
        { icon: Wrench, label: "Tools", path: "/tools" },
        { icon: User, label: "About", path: "/#about" },
        { icon: BookOpen, label: "Blog", path: "/blog" },
        { icon: MessageSquare, label: "Testimonials", path: "/#testimonials" },
        { icon: FileText, label: "Resume", path: "/#resume" },
        { icon: Award, label: "Certificates", path: "/#certificates" },
        { icon: Mail, label: "Contact", path: "/#contact" },
    ];

    const socials = [
        { icon: Github, href: "https://github.com/Kushal96499", label: "GitHub" },
        { icon: Linkedin, href: "https://www.linkedin.com/in/kushal-ku", label: "LinkedIn" },
        { icon: Mail, href: "mailto:kushalkumawat85598@gmail.com", label: "Email" }
    ];

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-[#0a0a0a] border-t border-white/10 flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none shadow-2xl">

                    {/* Handle */}
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mt-4 mb-2" />

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                        {/* Header / CTA */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Menu</h2>
                                <Link to="/" onClick={() => onOpenChange(false)} className="text-xl font-bold text-white/50">
                                    KK<span className="text-blue-500">.</span>
                                </Link>
                            </div>

                            <Link to="/services" onClick={() => onOpenChange(false)}>
                                <Button className="w-full h-14 text-base font-bold bg-white text-black hover:bg-white/90 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-[0.98] transition-all">
                                    Hire Me <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>

                        {/* Menu List */}
                        <div className="space-y-1 mb-8">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={() => onOpenChange(false)}
                                    className="flex items-center justify-between p-4 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all group active:scale-98"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            <item.icon size={16} className="text-white/60 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="font-medium text-lg">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                </Link>
                            ))}
                        </div>

                        {/* Socials */}
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-center gap-6">
                                {socials.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white/40 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-full bg-white/5 border border-white/5"
                                    >
                                        <social.icon size={20} />
                                    </a>
                                ))}
                            </div>
                            <p className="text-center text-white/20 text-xs mt-6">
                                © {new Date().getFullYear()} Kushal Kumawat
                            </p>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default NavDrawer;
