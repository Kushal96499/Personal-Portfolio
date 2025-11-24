import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Certificate } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Award, Loader2, Pencil } from 'lucide-react';
import { Reorder } from 'framer-motion';

interface CertificateFormData {
    title: string;
    image_url: string;
    credential_link: string;
    status: string;
}

const Certificates = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCertificate, setCurrentCertificate] = useState<Certificate | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<CertificateFormData>({
        title: '',
        image_url: '',
        credential_link: '',
        status: 'Completed'
    });

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            const data = await api.getCertificates();
            setCertificates(data);
        } catch (error) {
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (certificate?: Certificate) => {
        if (certificate) {
            setCurrentCertificate(certificate);
            setFormData({
                title: certificate.title,
                image_url: certificate.image_url,
                credential_link: certificate.credential_link || '',
                status: certificate.status || 'Completed'
            });
        } else {
            setCurrentCertificate(null);
            setFormData({
                title: '',
                image_url: '',
                credential_link: '',
                status: 'Completed'
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image_url) {
            toast.error('Please upload a certificate image');
            return;
        }

        setSaving(true);

        try {
            if (currentCertificate) {
                await api.updateCertificate(currentCertificate.id, formData);
                toast.success('Certificate updated');
            } else {
                await api.createCertificate(formData);
                toast.success('Certificate added');
            }

            setIsDialogOpen(false);
            loadCertificates();
        } catch (error: any) {
            console.error('Error saving certificate:', error);
            toast.error(error.message || 'Failed to save certificate');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return;
        try {
            await api.deleteCertificate(id);
            toast.success('Certificate deleted');
            loadCertificates();
        } catch (error) {
            toast.error('Failed to delete certificate');
        }
    };

    const handleReorder = (newOrder: Certificate[]) => {
        setCertificates(newOrder);
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Certificates...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Certificates</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your certifications and achievements</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certificate
                </Button>
            </div>

            <Reorder.Group axis="y" values={certificates} onReorder={handleReorder} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => (
                    <Reorder.Item key={cert.id} value={cert}>
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 group hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing">
                            <CardContent className="p-4 space-y-4">
                                <div className="aspect-video bg-black/50 rounded-md flex items-center justify-center border border-border relative overflow-hidden">
                                    {cert.image_url ? (
                                        <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Award className="w-12 h-12 text-muted-foreground" />
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8"
                                            onClick={() => handleOpenDialog(cert)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8"
                                            onClick={() => handleDelete(cert.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold truncate" title={cert.title}>{cert.title}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(cert.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card border-primary/20 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentCertificate ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., AWS Certified Solutions Architect"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Credential Link</Label>
                            <Input
                                value={formData.credential_link}
                                onChange={e => setFormData({ ...formData, credential_link: e.target.value })}
                                placeholder="https://..."
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="Completed">Completed</option>
                                <option value="In Progress">In Progress</option>
                            </select>
                        </div>

                        <ImageUpload
                            label="Certificate Image *"
                            folder="certificates"
                            currentImageUrl={formData.image_url}
                            onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                            onImageRemoved={() => setFormData({ ...formData, image_url: '' })}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving || !formData.image_url}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Certificate
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Certificates;
