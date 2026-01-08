import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    MessageSquare,
    Award,
    FileText,
    LogOut,
    Menu,
    X,
    Gamepad2,
    Code,
    Activity,
    Settings,
    FileUser,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const SidebarItem = ({
    icon: Icon,
    label,
    to,
    isActive,
    onClick,
}: {
    icon: any;
    label: string;
    to: string;
    isActive: boolean;
    onClick?: () => void;
}) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 group relative',
            isActive
                ? 'bg-blue-600 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
        )}
    >
        {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r" />
        )}
        <Icon className={cn('w-5 h-5 transition-transform duration-300 group-hover:scale-110', isActive && 'text-blue-400')} />
        <span className={cn('font-medium', isActive && 'text-blue-100')}>{label}</span>
    </Link>
);

const AdminLayout = () => {
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
        { icon: Info, label: 'About Settings', to: '/admin/about' },
        { icon: FolderKanban, label: 'Projects', to: '/admin/projects' },
        { icon: MessageSquare, label: 'Testimonials', to: '/admin/testimonials' },
        { icon: FileText, label: 'Contact Messages', to: '/admin/messages' },
        { icon: Award, label: 'Certificates', to: '/admin/certificates' },
        { icon: FileText, label: 'Blogs / Updates', to: '/admin/blogs' },
        { icon: Code, label: 'Skills', to: '/admin/skills' },
        { icon: FileUser, label: 'Resume Settings', to: '/admin/resume' },
        { icon: Gamepad2, label: 'Easter Eggs', to: '/admin/easter-eggs' },
        { icon: Settings, label: 'Section Controls', to: '/admin/section-controls' },
        { icon: Activity, label: 'System Logs', to: '/admin/logs' },
    ];

    return (
        <div className="h-screen overflow-hidden bg-[#070709] flex text-white font-sans selection:bg-blue-500/30" data-admin-panel>
            {/* Background Effects */}
            {/* Background Effects Removed for Performance */}

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0D0D11] border-r border-white/[0.08] transition-transform duration-300 ease-in-out transform md:translate-x-0 flex flex-col',
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
                    <h1 className="text-xl font-bold tracking-wider">
                        <span className="text-gradient-premium">ADMIN PANEL</span>
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white/60 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 h-0 py-4">
                    <div className="px-4 space-y-1">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                icon={item.icon}
                                label={item.label}
                                to={item.to}
                                isActive={location.pathname === item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/[0.08] flex-shrink-0 bg-white/[0.02]">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        onClick={handleSignOut}
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full min-w-0 overflow-y-auto relative">
                <div className="p-4 md:hidden flex items-center justify-between border-b border-white/[0.08] bg-[#0D0D11] sticky top-0 z-40">
                    <h1 className="font-bold text-white">Admin Panel</h1>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="text-white">
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
