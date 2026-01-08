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
import { Plus, Trash2, GripVertical, Award, Loader2, Pencil, ExternalLink } from 'lucide-react';
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

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-white/40">Loading Certificates...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Certificates</h2>
                    <p className="text-white/60 mt-1">Manage your certifications and achievements</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certificate
                </Button>
            </div>

            <Reorder.Group axis="y" values={certificates} onReorder={handleReorder} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => (
                    <Reorder.Item key={cert.id} value={cert} className="h-full">
                        <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl group hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col cursor-grab active:cursor-grabbing">
                            <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
                                <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:border-white/20 transition-colors">
                                    {cert.image_url ? (
                                        <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <Award className="w-12 h-12 text-white/20" />
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                            onClick={() => handleOpenDialog(cert)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-9 w-9 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                                            onClick={() => handleDelete(cert.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${cert.status === 'Completed'
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                        {cert.status}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors" title={cert.title}>{cert.title}</h3>
                                        <p className="text-xs text-white/40 mt-1">
                                            Added on {new Date(cert.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {cert.credential_link && (
                                        <a
                                            href={cert.credential_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2 w-fit"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View Credential <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#0D0D11] border-white/[0.08] text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{currentCertificate ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label className="text-white/80">Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g., AWS Certified Solutions Architect"
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/80">Credential Link</Label>
                            <div className="relative">
                                <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                <Input
                                    value={formData.credential_link}
                                    onChange={e => setFormData({ ...formData, credential_link: e.target.value })}
                                    placeholder="https://..."
                                    className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/80">Status</Label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="Completed" className="bg-[#0D0D11]">Completed</option>
                                <option value="In Progress" className="bg-[#0D0D11]">In Progress</option>
                            </select>
                        </div>

                        <ImageUpload
                            label="Certificate Image *"
                            folder="certificates"
                            currentImageUrl={formData.image_url}
                            onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                            onImageRemoved={() => setFormData({ ...formData, image_url: '' })}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 hover:text-white">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving || !formData.image_url} className="bg-blue-600 hover:bg-blue-700 text-white">
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
