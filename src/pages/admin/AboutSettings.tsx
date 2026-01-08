import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Briefcase, GraduationCap, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';
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
                description: aboutMe.description,
                profile_image_url: aboutMe.profile_image_url,
                experience_years: aboutMe.experience_years,
                projects_completed: aboutMe.projects_completed
            });
            toast.success('About section updated');
        } catch (error) {
            console.error('Error saving about:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Years Experience</label>
                            <input
                                type="text"
                                value={aboutMe?.experience_years || ''}
                                onChange={(e) => setAboutMe(prev => prev ? { ...prev, experience_years: e.target.value } : null)}
                                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="e.g., 3+"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Projects Completed</label>
                            <input
                                type="text"
                                value={aboutMe?.projects_completed || ''}
                                onChange={(e) => setAboutMe(prev => prev ? { ...prev, projects_completed: e.target.value } : null)}
                                className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder="e.g., 50+"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Profile Image</label>
                        <ImageUpload
                            label="Profile Photo"
                            folder="about"
                            currentImageUrl={aboutMe?.profile_image_url}
                            onImageUploaded={(url) => setAboutMe(prev => prev ? { ...prev, profile_image_url: url } : null)}
                            onImageRemoved={() => setAboutMe(prev => prev ? { ...prev, profile_image_url: '' } : null)}
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
        </div>
    );
};

export default AboutSettings;
