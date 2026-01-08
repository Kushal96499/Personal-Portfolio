import { Drawer } from "vaul";
import { Link } from "react-router-dom";
import { Wrench, Egg, FileText, BookOpen, Github, Linkedin, Mail, MessageSquare, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NavDrawer = ({ open, onOpenChange }: NavDrawerProps) => {
    const items = [
        { icon: MessageSquare, label: "Testimonials", path: "/#testimonials", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { icon: Award, label: "Certificates", path: "/#certificates", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
        { icon: FileText, label: "Resume", path: "/#resume", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { icon: BookOpen, label: "Blog", path: "/blog", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        { icon: Egg, label: "Secret", path: "/easter-eggs", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { icon: Wrench, label: "Tools", path: "/tools", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    ];

    const socials = [
        { icon: Github, href: "https://github.com/Kushal96499", label: "GitHub" },
        { icon: Linkedin, href: "https://www.linkedin.com/in/kushal-ku", label: "LinkedIn" },
        { icon: Mail, href: "mailto:kushalkumawat85598@gmail.com", label: "Email" }
    ];

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                <Drawer.Content className="bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 flex flex-col rounded-t-[20px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none shadow-[0_-10px_40px_-15px_rgba(255,255,255,0.1)]">
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />

                        <div className="max-w-md mx-auto space-y-8">
                            <div className="text-center">
                                <Drawer.Title className="font-bold text-2xl mb-2 text-white">
                                    Command Center
                                </Drawer.Title>
                                <p className="text-white/50 font-light">
                                    Quick access to all sectors.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {items.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        onClick={() => onOpenChange(false)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 active:scale-95 group",
                                            item.border,
                                            item.bg,
                                            "hover:bg-opacity-20"
                                        )}
                                    >
                                        <item.icon className={cn("w-8 h-8 mb-3 transition-transform group-hover:scale-110 duration-300", item.color)} strokeWidth={1.5} />
                                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-center gap-6">
                                    {socials.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                                        >
                                            <social.icon size={24} strokeWidth={1.5} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default NavDrawer;
