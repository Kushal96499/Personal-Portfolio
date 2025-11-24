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
    Palette,
    FileUser
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
            'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group',
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
        )}
    >
        <Icon className={cn('w-5 h-5', isActive && 'text-primary drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]')} />
        <span className={cn('font-medium', isActive && 'text-primary')}>{label}</span>
        {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#00ffff]" />
        )}
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
        { icon: FolderKanban, label: 'Projects', to: '/admin/projects' },
        { icon: MessageSquare, label: 'Testimonials', to: '/admin/testimonials' },
        { icon: FileText, label: 'Contact Messages', to: '/admin/messages' },
        { icon: Award, label: 'Certificates', to: '/admin/certificates' },
        { icon: FileText, label: 'Blogs / Updates', to: '/admin/blogs' },
        { icon: Code, label: 'Skills', to: '/admin/skills' },
        { icon: FileUser, label: 'Resume Settings', to: '/admin/resume' },
        { icon: Gamepad2, label: 'Easter Eggs', to: '/admin/easter-eggs' },
        { icon: Settings, label: 'Section Controls', to: '/admin/section-controls' },
        { icon: Palette, label: 'Branding Settings', to: '/admin/branding' },
        { icon: Activity, label: 'System Logs', to: '/admin/logs' },
    ];

    return (
        <div className="min-h-screen bg-background flex" data-admin-panel>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out transform md:translate-x-0',
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h1 className="text-xl font-bold font-orbitron tracking-wider text-gradient">
                        ADMIN PANEL
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-80px)]">
                    <div className="p-4 space-y-2">
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

                    <div className="p-4 border-t border-border mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </Button>
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                <div className="p-4 md:hidden flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
                    <h1 className="font-orbitron font-bold text-primary">Admin Panel</h1>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
