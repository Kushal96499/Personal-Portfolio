import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Info, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLog {
    id: string;
    action: string;
    details: any;
    created_at: string;
}

const Logs = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'error' | 'login'>('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        try {
            setError(null);
            const data = await api.getAdminLogs();
            setLogs(data);
        } catch (err: any) {
            console.error('Failed to fetch logs:', err);
            setError(err.message || 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action: string) => {
        if (action.includes('error') || action.includes('fail')) return AlertTriangle;
        if (action.includes('login')) return Shield;
        return Info;
    };

    const getColor = (action: string) => {
        if (action.includes('error') || action.includes('fail')) return 'text-red-500';
        if (action.includes('login')) return 'text-green-500';
        return 'text-blue-500';
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'error') return log.action.includes('error') || log.action.includes('fail');
        if (filter === 'login') return log.action.includes('login');
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">System Logs</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track system events and errors</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'login' ? 'default' : 'outline'}
                        onClick={() => setFilter('login')}
                        size="sm"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Logins
                    </Button>
                    <Button
                        variant={filter === 'error' ? 'default' : 'outline'}
                        onClick={() => setFilter('error')}
                        size="sm"
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Errors
                    </Button>
                </div>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Recent Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
                            ) : error ? (
                                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <p>{error}</p>
                                </div>
                            ) : filteredLogs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No logs found</div>
                            ) : (
                                filteredLogs.map((log) => {
                                    const Icon = getIcon(log.action);
                                    const color = getColor(log.action);
                                    return (
                                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                                            <div className={`mt-1 ${color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-sm">{log.action.toUpperCase()}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground font-mono bg-black/20 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(log.details, null, 2)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default Logs;
