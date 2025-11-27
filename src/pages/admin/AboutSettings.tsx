import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Briefcase, GraduationCap, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, AboutMe, TimelineItem, TimelineItemInsert } from '@/services/api';

const AboutSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aboutMe, setAboutMe] = useState<AboutMe | null>(null);
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

    // Form states for new/edit timeline item
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<TimelineItemInsert>({
        title: '',
        period: '',
        description: '',
        icon_type: 'briefcase',
        order: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [aboutData, timelineData] = await Promise.all([
                api.getAboutMe(),
                api.getTimelineItems()
            ]);
            setAboutMe(aboutData);
            setTimelineItems(timelineData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAbout = async () => {
        if (!aboutMe) return;

        try {
            setSaving(true);
            await api.updateAboutMe({
                title: aboutMe.title,
                description: aboutMe.description
            });
            toast.success('About section updated');
        } catch (error) {
            console.error('Error saving about:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveItem = async () => {
        try {
            setSaving(true);

            if (editingItemId) {
                await api.updateTimelineItem(editingItemId, newItem);
                toast.success('Timeline item updated');
            } else {
                await api.createTimelineItem({
                    ...newItem,
                    order: timelineItems.length + 1
                });
                toast.success('Timeline item added');
            }

            await fetchData();
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error('Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    const handleEditItem = (item: TimelineItem) => {
        setNewItem({
            title: item.title,
            period: item.period,
            description: item.description,
            icon_type: item.icon_type,
            order: item.order
        });
        setEditingItemId(item.id);
        setIsAddingItem(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await api.deleteTimelineItem(id);
            setTimelineItems(prev => prev.filter(item => item.id !== id));
            toast.success('Item deleted');
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        }
    };

    const resetForm = () => {
        setIsAddingItem(false);
        setEditingItemId(null);
        setNewItem({
            title: '',
            period: '',
            description: '',
            icon_type: 'briefcase',
            order: 0
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    About Section Settings
                </h1>
            </div>

            {/* Main Content Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6"
            >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    Main Content
                </h2>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Section Title</label>
                        <input
                            type="text"
                            value={aboutMe?.title || ''}
                            onChange={(e) => setAboutMe(prev => prev ? { ...prev, title: e.target.value } : null)}
                            className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="e.g., About Me"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <textarea
                            value={aboutMe?.description || ''}
                            onChange={(e) => setAboutMe(prev => prev ? { ...prev, description: e.target.value } : null)}
                            className="w-full h-32 bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                            placeholder="Write something about yourself..."
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSaveAbout}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Content
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Timeline Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded-full" />
                        Timeline Items
                    </h2>
                    {!isAddingItem && (
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    )}
                </div>

                {/* Add/Edit Item Form */}
                {isAddingItem && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-background/50 border border-border rounded-lg p-4 space-y-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                {editingItemId ? 'Edit Timeline Item' : 'Add New Timeline Item'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                                    placeholder="e.g., Senior Developer"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Period</label>
                                <input
                                    type="text"
                                    value={newItem.period}
                                    onChange={(e) => setNewItem({ ...newItem, period: e.target.value })}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                                    placeholder="e.g., 2020 - Present"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                            <input
                                type="text"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                                placeholder="Brief description of the role..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Icon Type</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setNewItem({ ...newItem, icon_type: 'briefcase' })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors ${newItem.icon_type === 'briefcase'
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-background border-border hover:bg-secondary/50'
                                        }`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Work
                                </button>
                                <button
                                    onClick={() => setNewItem({ ...newItem, icon_type: 'graduation-cap' })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors ${newItem.icon_type === 'graduation-cap'
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-background border-border hover:bg-secondary/50'
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Education
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveItem}
                                disabled={!newItem.title || !newItem.period}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {editingItemId ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                    {timelineItems.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center gap-4 bg-background/30 border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="p-2 bg-secondary/50 rounded-md text-muted-foreground">
                                {item.icon_type === 'briefcase' ? <Briefcase className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium truncate">{item.title}</h3>
                                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                        {item.period}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditItem(item)}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    title="Edit Item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    title="Delete Item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {timelineItems.length === 0 && !isAddingItem && (
                        <div className="text-center py-8 text-muted-foreground">
                            No timeline items found. Add one to get started.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AboutSettings;
