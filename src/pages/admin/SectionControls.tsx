import { useState, useEffect } from 'react';
import { api, SiteControls } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface SectionConfig {
    key: keyof Omit<SiteControls, 'id' | 'created_at' | 'updated_at'>;
    label: string;
    description: string;
}

const sections: SectionConfig[] = [
    { key: 'home_hero', label: 'Home Hero', description: 'Main landing section with introduction' },
    { key: 'skills', label: 'Skills', description: 'Technical skills and expertise' },
    { key: 'projects', label: 'Projects', description: 'Portfolio projects showcase' },
    { key: 'testimonials', label: 'Testimonials', description: 'Client reviews and feedback' },
    { key: 'certificates', label: 'Certificates', description: 'Professional certifications' },
    { key: 'blog', label: 'Blog', description: 'Cybersecurity articles and updates' },
    { key: 'threat_map_enabled', label: 'Threat Map', description: 'Real-time cyber threat visualization' },
    { key: 'contact', label: 'Contact', description: 'Contact form section' },
    { key: 'footer_extras', label: 'Footer Extras', description: 'Additional footer content and features' },
];

const SectionControls = () => {
    const [controls, setControls] = useState<SiteControls | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchControls();
    }, []);

    const fetchControls = async () => {
        try {
            const data = await api.getSiteControls();
            setControls(data);
        } catch (error) {
            console.error('Failed to fetch site controls:', error);
            toast.error('Failed to load section controls');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof Omit<SiteControls, 'id' | 'created_at' | 'updated_at'>) => {
        if (!controls) return;
        setControls({
            ...controls,
            [key]: !controls[key]
        });
    };

    const handleSave = async () => {
        if (!controls) return;

        setSaving(true);
        try {
            await api.updateSiteControls(controls);
            toast.success('Section visibility updated successfully!');
        } catch (error) {
            console.error('Failed to save site controls:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading section controls...</p>
                </div>
            </div>
        );
    }

    if (!controls) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load section controls</p>
                <Button onClick={fetchControls} className="mt-4">Retry</Button>
            </div>
        );
    }

    const activeCount = sections.filter(s => controls[s.key]).length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold font-orbitron text-gradient">Section Visibility Manager</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Control which sections appear on your portfolio website
                </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings2 className="w-6 h-6 text-primary" />
                            <div>
                                <CardTitle>Section Settings</CardTitle>
                                <CardDescription>
                                    {activeCount} of {sections.length} sections active
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sections.map((section) => {
                        const isActive = controls[section.key];
                        return (
                            <div
                                key={section.key}
                                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-3 h-3 rounded-full shadow-lg transition-all ${isActive
                                            ? 'bg-green-500 shadow-green-500/50'
                                            : 'bg-gray-500 shadow-gray-500/50'
                                            }`}
                                        title={isActive ? 'Active' : 'Inactive'}
                                    />
                                    <div>
                                        <Label
                                            htmlFor={section.key}
                                            className="text-base font-medium cursor-pointer"
                                        >
                                            {section.label}
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {section.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id={section.key}
                                    checked={isActive}
                                    onCheckedChange={() => handleToggle(section.key)}
                                />
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card className="bg-yellow-500/5 border-yellow-500/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="text-yellow-500 mt-0.5">⚠️</div>
                        <div className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Note:</strong> Disabled sections will be completely hidden from the public portfolio and removed from the navigation menu. Changes take effect immediately across all devices with real-time synchronization.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SectionControls;
