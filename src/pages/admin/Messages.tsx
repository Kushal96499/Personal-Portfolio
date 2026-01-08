import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, CheckCircle, Trash2, Download, Clock, CheckCheck, Inbox } from 'lucide-react';
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
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-white/40">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Contact Inbox</h2>
                    <p className="text-white/60 mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                            {messages.filter(m => !m.read).length} unread
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                            {messages.filter(m => !m.resolved).length} pending
                        </span>
                    </p>
                </div>
                <Button variant="outline" onClick={handleExportCSV} className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="p-4 rounded-full bg-white/5 mb-4">
                                <Inbox className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/60 font-medium">No messages found</p>
                            <p className="text-white/40 text-sm mt-1">Your inbox is empty</p>
                        </CardContent>
                    </Card>
                ) : (
                    messages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`transition-all duration-300 group ${!msg.read
                                ? 'bg-blue-500/[0.05] border-blue-500/20 shadow-[0_0_20px_-5px_rgba(59,130,246,0.1)]'
                                : msg.resolved
                                    ? 'bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-100'
                                    : 'bg-white/[0.03] border-white/[0.08]'
                                } backdrop-blur-xl hover:border-blue-500/30`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-bold text-lg text-white">{msg.name}</h3>
                                            <Badge variant={msg.read ? "secondary" : "default"} className={msg.read ? "bg-white/10 text-white/60 hover:bg-white/20" : "bg-blue-500 hover:bg-blue-600"}>
                                                {msg.read ? 'Read' : 'New'}
                                            </Badge>
                                            {msg.resolved && (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                    Resolved
                                                </Badge>
                                            )}
                                            <span className="text-xs text-white/40 flex items-center gap-1.5 ml-auto sm:ml-0">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(msg.created_at), 'PPP p')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-blue-400 font-medium bg-blue-500/5 w-fit px-3 py-1 rounded-full border border-blue-500/10">
                                            <Mail className="w-3 h-3" />
                                            {msg.email}
                                        </div>

                                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-white/80 leading-relaxed whitespace-pre-wrap">
                                            {msg.message}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleToggleRead(msg.id, msg.read)}
                                            title={msg.read ? "Mark as Unread" : "Mark as Read"}
                                            className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-400"
                                        >
                                            <CheckCircle className={`w-4 h-4 ${msg.read ? 'text-blue-500' : 'text-white/40'}`} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleToggleResolved(msg.id, msg.resolved)}
                                            title={msg.resolved ? "Mark as Unresolved" : "Mark as Resolved"}
                                            className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-400"
                                        >
                                            <CheckCheck className={`w-4 h-4 ${msg.resolved ? 'text-emerald-500' : 'text-white/40'}`} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(msg.id)}
                                            title="Delete"
                                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4 text-white/40" />
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
