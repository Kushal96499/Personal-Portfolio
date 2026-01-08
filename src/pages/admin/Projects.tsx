import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Project } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Github, ExternalLink, Loader2 } from 'lucide-react';
import { Reorder } from 'framer-motion';

interface ProjectFormData {
    name: string;
    description: string;
    tech_stack: string;
    github_link: string;
    demo_link: string;
    thumbnail_url: string;
    visible: boolean;
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        tech_stack: '',
        github_link: '',
        demo_link: '',
        thumbnail_url: '',
        visible: true
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (project?: Project) => {
        if (project) {
            setCurrentProject(project);
            setFormData({
                name: project.name,
                description: project.description,
                tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
                github_link: project.github_link || '',
                demo_link: project.demo_link || '',
                thumbnail_url: project.thumbnail_url || '',
                visible: project.visible
            });
        } else {
            setCurrentProject(null);
            setFormData({
                name: '',
                description: '',
                tech_stack: '',
                github_link: '',
                demo_link: '',
                thumbnail_url: '',
                visible: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const projectData = {
                ...formData,
                tech_stack: formData.tech_stack.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (currentProject) {
                await api.updateProject(currentProject.id, projectData);
                toast.success('Project updated');
            } else {
                await api.createProject(projectData);
                toast.success('Project created');
            }

            setIsDialogOpen(false);
            loadProjects();
        } catch (error) {
            toast.error('Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.deleteProject(id);
            toast.success('Project deleted');
            loadProjects();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    const handleReorder = (newOrder: Project[]) => {
        setProjects(newOrder);
        // In a real app, you'd debounce this and save the new order to the backend
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                <p className="text-white/40">Loading Projects...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Projects Manager</h2>
                    <p className="text-white/60 mt-1">Manage your portfolio projects</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                </Button>
            </div>

            <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="space-y-4">
                {projects.map((project) => (
                    <Reorder.Item key={project.id} value={project}>
                        <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl group hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300">
                            <CardContent className="p-4 flex items-center gap-6">
                                <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <GripVertical className="w-5 h-5 text-white/40" />
                                </div>

                                {project.thumbnail_url && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                                        <img
                                            src={project.thumbnail_url}
                                            alt={project.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
                                        {!project.visible && (
                                            <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Hidden</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/60 line-clamp-1 mb-3">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(project.tech_stack) && project.tech_stack.map((tag: string) => (
                                            <span key={tag} className="text-xs bg-white/5 text-white/80 border border-white/10 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(project)} className="hover:bg-blue-500/10 hover:text-blue-400">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="hover:bg-red-500/10 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-[#0D0D11] border-white/[0.08] text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{currentProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label className="text-white/80">Project Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                placeholder="e.g. Portfolio Website"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-white/80">Description *</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 min-h-[100px]"
                                placeholder="Brief description of the project..."
                            />
                        </div>

                        <ImageUpload
                            label="Project Thumbnail"
                            folder="projects"
                            currentImageUrl={formData.thumbnail_url}
                            onImageUploaded={(url) => setFormData({ ...formData, thumbnail_url: url })}
                            onImageRemoved={() => setFormData({ ...formData, thumbnail_url: '' })}
                        />

                        <div className="space-y-2">
                            <Label className="text-white/80">Tech Stack (comma separated)</Label>
                            <Input
                                value={formData.tech_stack}
                                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                placeholder="React, Node.js, Supabase"
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-white/80">GitHub Link</Label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                    <Input
                                        value={formData.github_link}
                                        onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                                        className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white/80">Demo Link</Label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                    <Input
                                        value={formData.demo_link}
                                        onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                                        className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                        placeholder="https://demo.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="space-y-0.5">
                                <Label className="text-white">Visible on Portfolio</Label>
                                <p className="text-xs text-white/60">Show this project on your public portfolio</p>
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
                                Save Project
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Projects;
