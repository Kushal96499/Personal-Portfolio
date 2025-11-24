import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Testimonial } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Quote, Loader2, User } from 'lucide-react';
import { Reorder } from 'framer-motion';

interface TestimonialFormData {
    name: string;
    role: string;
    message: string;
    avatar_url: string;
    visible: boolean;
}

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<TestimonialFormData>({
        name: '',
        role: '',
        message: '',
        avatar_url: '',
        visible: true
    });

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            const data = await api.getTestimonials();
            setTestimonials(data);
        } catch (error) {
            toast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (testimonial?: Testimonial) => {
        if (testimonial) {
            setCurrentTestimonial(testimonial);
            setFormData({
                name: testimonial.name,
                role: testimonial.role,
                message: testimonial.message,
                avatar_url: testimonial.avatar_url || '',
                visible: testimonial.visible
            });
        } else {
            setCurrentTestimonial(null);
            setFormData({
                name: '',
                role: '',
                message: '',
                avatar_url: '',
                visible: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (currentTestimonial) {
                await api.updateTestimonial(currentTestimonial.id, formData);
                toast.success('Testimonial updated');
            } else {
                await api.createTestimonial(formData);
                toast.success('Testimonial created');
            }

            setIsDialogOpen(false);
            loadTestimonials();
        } catch (error) {
            toast.error('Failed to save testimonial');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await api.deleteTestimonial(id);
            toast.success('Testimonial deleted');
            loadTestimonials();
        } catch (error) {
            toast.error('Failed to delete testimonial');
        }
    };

    const handleReorder = (newOrder: Testimonial[]) => {
        setTestimonials(newOrder);
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Testimonials...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Testimonials Manager</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage client testimonials and reviews</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                </Button>
            </div>

            <Reorder.Group axis="y" values={testimonials} onReorder={handleReorder} className="space-y-4">
                {testimonials.map((item) => (
                    <Reorder.Item key={item.id} value={item}>
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 group hover:border-primary/30 transition-all">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-background/50 rounded">
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {item.avatar_url ? (
                                    <img
                                        src={item.avatar_url}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <span className="text-sm text-muted-foreground">({item.role})</span>
                                        {!item.visible && (
                                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Hidden</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-1 text-muted-foreground italic text-sm">
                                        <Quote className="w-3 h-3 flex-shrink-0 mt-1" />
                                        <p className="line-clamp-2">{item.message}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                        <Pencil className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-card border-primary/20 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role *</Label>
                                <Input
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="bg-background/50"
                                    placeholder="CEO, Developer, etc."
                                />
                            </div>
                        </div>

                        <ImageUpload
                            label="Avatar Image"
                            folder="testimonials"
                            currentImageUrl={formData.avatar_url}
                            onImageUploaded={(url) => setFormData({ ...formData, avatar_url: url })}
                            onImageRemoved={() => setFormData({ ...formData, avatar_url: '' })}
                        />

                        <div className="space-y-2">
                            <Label>Message *</Label>
                            <Textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                className="bg-background/50 min-h-[100px]"
                                placeholder="What did they say about your work?"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                            <Label>Visible on Site</Label>
                            <Switch
                                checked={formData.visible}
                                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Testimonial
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Testimonials;
