import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, CheckCircle, Trash2, Download, Clock, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

const Messages = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await api.getMessages();
            setMessages(data);
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRead = async (id: string, currentStatus: boolean) => {
        try {
            await api.markMessageAsRead(id, !currentStatus);
            setMessages(messages.map(m => m.id === id ? { ...m, read: !currentStatus } : m));
            toast.success(!currentStatus ? 'Marked as read' : 'Marked as unread');
        } catch (error) {
            toast.error('Failed to update message');
        }
    };

    const handleToggleResolved = async (id: string, currentStatus: boolean) => {
        try {
            await api.markMessageAsResolved(id, !currentStatus);
            setMessages(messages.map(m => m.id === id ? { ...m, resolved: !currentStatus } : m));
            toast.success(!currentStatus ? 'Marked as resolved' : 'Marked as unresolved');
        } catch (error) {
            toast.error('Failed to update message');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            await api.deleteMessage(id);
            setMessages(messages.filter(m => m.id !== id));
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Message', 'Date', 'Status', 'Resolved'];
        const csvContent = [
            headers.join(','),
            ...messages.map(m => [
                `"${m.name}"`,
                `"${m.email}"`,
                `"${m.message.replace(/"/g, '""')}"`,
                `"${m.created_at}"`,
                m.read ? 'Read' : 'Unread',
                m.resolved ? 'Resolved' : 'Pending'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contact_messages_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
        toast.success('Messages exported to CSV');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Contact Inbox</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {messages.filter(m => !m.read).length} unread • {messages.filter(m => !m.resolved).length} pending
                    </p>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Mail className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No messages found.</p>
                        </CardContent>
                    </Card>
                ) : (
                    messages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`transition-all ${!msg.read
                                ? 'border-primary/50 bg-primary/5'
                                : msg.resolved
                                    ? 'bg-card/30 border-border/50 opacity-75'
                                    : 'bg-card/50 border-border'
                                }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-bold text-lg">{msg.name}</h3>
                                            <Badge variant={msg.read ? "secondary" : "default"}>
                                                {msg.read ? 'Read' : 'New'}
                                            </Badge>
                                            {msg.resolved && (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                    Resolved
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(msg.created_at), 'PPP p')}
                                            </span>
                                        </div>
                                        <div className="text-sm text-primary font-medium flex items-center gap-2">
                                            <Mail className="w-3 h-3" />
                                            {msg.email}
                                        </div>
                                        <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{msg.message}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleRead(msg.id, msg.read)}
                                            title={msg.read ? "Mark as Unread" : "Mark as Read"}
                                        >
                                            <CheckCircle className={`w-4 h-4 ${msg.read ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleResolved(msg.id, msg.resolved)}
                                            title={msg.resolved ? "Mark as Unresolved" : "Mark as Resolved"}
                                        >
                                            <CheckCheck className={`w-4 h-4 ${msg.resolved ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(msg.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Messages;
