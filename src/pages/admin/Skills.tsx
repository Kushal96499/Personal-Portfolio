import { useState, useEffect } from 'react';
import { api, Skill } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    Shield,
    Code,
    Network,
    Bot,
    Lock,
    Database,
    Terminal,
    Cpu,
    Globe,
    Server,
    Cloud,
    Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const iconOptions = [
    { value: 'Shield', label: 'Shield', icon: Shield },
    { value: 'Code', label: 'Code', icon: Code },
    { value: 'Network', label: 'Network', icon: Network },
    { value: 'Bot', label: 'Bot', icon: Bot },
    { value: 'Lock', label: 'Lock', icon: Lock },
    { value: 'Database', label: 'Database', icon: Database },
    { value: 'Terminal', label: 'Terminal', icon: Terminal },
    { value: 'Cpu', label: 'CPU', icon: Cpu },
    { value: 'Globe', label: 'Globe', icon: Globe },
    { value: 'Server', label: 'Server', icon: Server },
    { value: 'Cloud', label: 'Cloud', icon: Cloud },
    { value: 'Smartphone', label: 'Smartphone', icon: Smartphone },
];

const Skills = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        icon: 'Code',
        items: [] as string[],
        newItem: '',
        order: 0
    });

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const data = await api.getSkills();
            setSkills(data);
        } catch (error: any) {
            console.error('Failed to fetch skills:', error);

            // Provide helpful error message
            if (error?.message?.includes('relation "public.skills" does not exist') || error?.code === 'PGRST116') {
                toast.error('Skills table not found. Please run the database migration first.', {
                    duration: 5000,
                    description: 'Migration file: 20251122_03_add_skills_and_fix_easter_eggs.sql'
                });
            } else {
                toast.error('Failed to load skills');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (skill?: Skill) => {
        if (skill) {
            setEditingSkill(skill);
            setFormData({
                category: skill.category,
                title: skill.title,
                icon: skill.icon,
                items: [...skill.items],
                newItem: '',
                order: skill.order || 0
            });
        } else {
            setEditingSkill(null);
            setFormData({
                category: '',
                title: '',
                icon: 'Code',
                items: [],
                newItem: '',
                order: 0
            });
        }
        setIsDialogOpen(true);
    };

    const handleAddItem = () => {
        if (!formData.newItem.trim()) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, prev.newItem.trim()],
            newItem: ''
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!formData.category || !formData.title || formData.items.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const skillData = {
                category: formData.category,
                title: formData.title,
                icon: formData.icon,
                items: formData.items,
                order: formData.order
            };



            if (editingSkill) {
                await api.updateSkill(editingSkill.id, skillData);
                toast.success('Skill updated successfully');
            } else {
                await api.createSkill(skillData);
                toast.success('Skill created successfully');
            }

            setIsDialogOpen(false);
            fetchSkills();
        } catch (error: any) {
            console.error('Failed to save skill:', error);

            // Provide more detailed error message
            let errorMessage = 'Failed to save skill';
            if (error?.message) {
                errorMessage += `: ${error.message}`;
            }
            if (error?.code === 'PGRST116') {
                errorMessage = 'Skills table not found. Please run the database migration first.';
            }
            if (error?.message?.includes('relation "public.skills" does not exist')) {
                errorMessage = 'Skills table does not exist. Please run the migration: 20251122_03_add_skills_and_fix_easter_eggs.sql';
            }

            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this skill?')) return;

        try {
            await api.deleteSkill(id);
            toast.success('Skill deleted successfully');
            fetchSkills();
        } catch (error) {
            console.error('Failed to delete skill:', error);
            toast.error('Failed to delete skill');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading skills...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Skills Manager</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your technical expertise</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => {
                    const IconComponent = iconOptions.find(opt => opt.value === skill.icon)?.icon || Code;
                    return (
                        <Card key={skill.id} className="bg-card/50 backdrop-blur-sm border-primary/10 group hover:border-primary/30 transition-all">
                            <CardHeader className="relative">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(skill)}>
                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(skill.id)}>
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{skill.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground font-mono mt-1">{skill.category}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {skill.items.map((item, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-secondary/20">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                                placeholder="e.g. Web Development"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="e.g. Frontend Stack"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select
                                value={formData.icon}
                                onValueChange={(value) => setFormData({ ...formData, icon: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <option.icon className="w-4 h-4" />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Skills List</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a skill item..."
                                    value={formData.newItem}
                                    onChange={(e) => setFormData({ ...formData, newItem: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                />
                                <Button onClick={handleAddItem} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.items.map((item, idx) => (
                                    <Badge key={idx} variant="outline" className="gap-1 pl-2 pr-1 py-1">
                                        {item}
                                        <X
                                            className="w-3 h-3 cursor-pointer hover:text-red-500"
                                            onClick={() => handleRemoveItem(idx)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Skill
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Skills;
