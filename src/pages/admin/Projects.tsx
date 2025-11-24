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

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Projects...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Projects Manager</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your portfolio projects</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                </Button>
            </div>

            <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="space-y-4">
                {projects.map((project) => (
                    <Reorder.Item key={project.id} value={project}>
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 group hover:border-primary/30 transition-all">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-background/50 rounded">
                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {project.thumbnail_url && (
                                    <img
                                        src={project.thumbnail_url}
                                        alt={project.name}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                )}

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg">{project.name}</h3>
                                        {!project.visible && (
                                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Hidden</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        {Array.isArray(project.tech_stack) && project.tech_stack.map((tag: string) => (
                                            <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(project)}>
                                        <Pencil className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-card border-primary/20 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Project Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                className="bg-background/50"
                                rows={3}
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
                            <Label>Tech Stack (comma separated)</Label>
                            <Input
                                value={formData.tech_stack}
                                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                                placeholder="React, Node.js, Supabase"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>GitHub Link</Label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={formData.github_link}
                                        onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                                        className="pl-9 bg-background/50"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Demo Link</Label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={formData.demo_link}
                                        onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                                        className="pl-9 bg-background/50"
                                        placeholder="https://demo.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                            <Label>Visible on Portfolio</Label>
                            <Switch
                                checked={formData.visible}
                                onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
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
