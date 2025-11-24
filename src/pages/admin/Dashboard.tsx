import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Activity as ActivityType } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Folder,
    Star,
    MessageSquare,
    Award,
    FileText,
    Gamepad2,
    Activity,
    Code,
    Database,
    HardDrive,
    Mail,
    Server,
    Globe,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    to
}: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    to: string;
}) => (
    <Link to={to}>
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${color} drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold font-orbitron">{value}</div>
            </CardContent>
        </Card>
    </Link>
);

const SystemStatusCard = ({
    label,
    status,
    icon: Icon
}: {
    label: string;
    status: boolean | null;
    icon: any;
}) => (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardContent className="p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium truncate" title={label}>{label}</span>
            </div>
            {status === null ? (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin flex-shrink-0" />
            ) : status === true ? (
                <div className="text-green-500 flex-shrink-0" title="Operational">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
            ) : (
                <div className="text-red-500 flex-shrink-0" title={typeof status === 'string' ? status : 'Error'}>
                    <XCircle className="w-5 h-5" />
                </div>
            )}
        </CardContent>
    </Card>
);

// Helper function to format relative time
const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
};

// Helper function to get icon for entity type
const getEntityIcon = (entityType: string) => {
    switch (entityType) {
        case 'project': return Folder;
        case 'blog': return FileText;
        case 'testimonial': return Star;
        case 'certificate': return Award;
        case 'contact_message': return MessageSquare;
        case 'skill': return Code;
        case 'easter_egg': return Gamepad2;
        default: return Activity;
    }
};

// Helper function to get badge variant for action type
const getActionBadge = (actionType: string) => {
    switch (actionType) {
        case 'created': return { text: 'New', variant: 'default' as const };
        case 'updated': return { text: 'Updated', variant: 'secondary' as const };
        case 'deleted': return { text: 'Deleted', variant: 'destructive' as const };
        default: return { text: 'Activity', variant: 'outline' as const };
    }
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        projects: 0,
        testimonials: 0,
        messages: 0,
        certificates: 0,
        blogs: 0,
        skills: 0,
        easterEggs: 0
    });
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityType[]>([]);

    const [health, setHealth] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats (critical)
                const statsData = await api.getAnalytics();
                setStats(statsData);

                // Fetch health
                try {
                    const healthData = await api.getSystemHealth();
                    setHealth(healthData);
                } catch (healthError) {
                    console.error('Health check failed:', healthError);
                    // Set all to false to indicate error
                    setHealth({
                        database: false,
                        storage: false,
                        mail_service: false,
                        edge_functions: false,
                        portfolio_pages: false
                    });
                }

                // Fetch activities (optional - may fail if table doesn't exist yet)
                try {
                    const activitiesData = await api.getRecentActivities(5);
                    setActivities(activitiesData);
                } catch (activityError) {
                    console.warn('Activity logs not available yet. Run the migration to enable activity tracking:', activityError);
                    // Keep activities as empty array - this is fine
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Set up real-time subscription for new activities (if table exists)
        let channel: any = null;
        try {
            channel = api.subscribeToActivities((newActivity) => {
                setActivities((prev) => [newActivity, ...prev].slice(0, 5));
            });
        } catch (error) {
            console.warn('Activity subscription not available:', error);
        }

        // Auto-refresh stats every 30 seconds
        const interval = setInterval(() => {
            api.getAnalytics().then(setStats).catch(console.error);
            api.getSystemHealth().then(setHealth).catch((error) => {
                console.error('Health check auto-refresh failed:', error);
                setHealth({
                    database: false,
                    storage: false,
                    mail_service: false,
                    edge_functions: false,
                    portfolio_pages: false
                });
            });
        }, 30000);

        return () => {
            clearInterval(interval);
            if (channel) {
                api.unsubscribeFromActivities(channel);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">Portfolio content overview</p>
                </div>
            </div>

            {/* System Status Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-orbitron flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    System Status
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <SystemStatusCard
                        label="Database"
                        status={health?.database ?? null}
                        icon={Database}
                    />
                    <SystemStatusCard
                        label="Storage"
                        status={health?.storage ?? null}
                        icon={HardDrive}
                    />
                    <SystemStatusCard
                        label="Mail Service"
                        status={health?.mail_service ?? null}
                        icon={Mail}
                    />
                    <SystemStatusCard
                        label="Edge Functions"
                        status={health?.edge_functions ?? null}
                        icon={Server}
                    />
                    <SystemStatusCard
                        label="Portfolio API"
                        status={health?.portfolio_pages ?? null}
                        icon={Globe}
                    />
                </div>
            </div>

            {/* Real Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Projects"
                    value={stats.projects}
                    icon={Folder}
                    color="text-blue-500"
                    to="/admin/projects"
                />
                <StatCard
                    title="Testimonials"
                    value={stats.testimonials}
                    icon={Star}
                    color="text-yellow-500"
                    to="/admin/testimonials"
                />
                <StatCard
                    title="Contact Messages"
                    value={stats.messages}
                    icon={MessageSquare}
                    color="text-green-500"
                    to="/admin/messages"
                />
                <StatCard
                    title="Certificates"
                    value={stats.certificates}
                    icon={Award}
                    color="text-purple-500"
                    to="/admin/certificates"
                />
                <StatCard
                    title="Blog Posts"
                    value={stats.blogs}
                    icon={FileText}
                    color="text-pink-500"
                    to="/admin/blogs"
                />
                <StatCard
                    title="Skills"
                    value={stats.skills}
                    icon={Code}
                    color="text-orange-500"
                    to="/admin/skills"
                />
                <StatCard
                    title="Easter Eggs Active"
                    value={stats.easterEggs}
                    icon={Gamepad2}
                    color="text-cyan-500"
                    to="/admin/easter-eggs"
                />
            </div>

            {/* Activity Log */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => {
                                const EntityIcon = getEntityIcon(activity.entity_type);
                                const badge = getActionBadge(activity.action_type);
                                return (
                                    <div key={activity.id} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                                        <div className="flex-shrink-0">
                                            <EntityIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.created_at)}</p>
                                        </div>
                                        <Badge variant={badge.variant} className="text-xs flex-shrink-0">
                                            {badge.text}
                                        </Badge>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
