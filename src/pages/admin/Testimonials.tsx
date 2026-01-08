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

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-white/40">Loading Testimonials...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Testimonials Manager</h2>
                    <p className="text-white/60 mt-1">Manage client testimonials and reviews</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                </Button>
            </div>

            <Reorder.Group axis="y" values={testimonials} onReorder={handleReorder} className="space-y-4">
                {testimonials.map((item) => (
                    <Reorder.Item key={item.id} value={item}>
                        <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl group hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300">
                            <CardContent className="p-4 flex items-center gap-6">
                                <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <GripVertical className="w-5 h-5 text-white/40" />
                                </div>

                                {item.avatar_url ? (
                                    <img
                                        src={item.avatar_url}
                                        alt={item.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-500/30 transition-colors"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
                                        <User className="w-6 h-6 text-white/40" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{item.name}</h3>
                                        <span className="text-sm text-white/40">({item.role})</span>
                                        {!item.visible && (
                                            <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Hidden</span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 mt-1 text-white/60 text-sm">
                                        <Quote className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500/40" />
                                        <p className="line-clamp-2 leading-relaxed">{item.message}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} className="hover:bg-blue-500/10 hover:text-blue-400">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="hover:bg-red-500/10 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-[#0D0D11] border-white/[0.08] text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{currentTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/80">Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/80">Role *</Label>
                                <Input
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
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
                            <Label className="text-white/80">Message *</Label>
                            <Textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 min-h-[100px]"
                                placeholder="What did they say about your work?"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="space-y-0.5">
                                <Label className="text-white">Visible on Site</Label>
                                <p className="text-xs text-white/60">Show this testimonial on your public portfolio</p>
                            </div>
                            <Switch
                                checked={formData.visible}
                                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
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
