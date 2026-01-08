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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Skills Manager</h2>
                    <p className="text-white/60 mt-1">Manage your technical expertise</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => {
                    const IconComponent = iconOptions.find(opt => opt.value === skill.icon)?.icon || Code;
                    return (
                        <Card key={skill.id} className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl group hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
                            <CardHeader className="relative pb-2">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border border-white/10" onClick={() => handleOpenDialog(skill)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20" onClick={() => handleDelete(skill.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{skill.title}</CardTitle>
                                        <p className="text-xs text-white/40 font-mono mt-1 uppercase tracking-wider">{skill.category}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex flex-wrap gap-2">
                                    {skill.items.map((item, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-white/5 hover:bg-white/10 text-white/80 border-white/5 transition-colors">
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
                <DialogContent className="max-w-md bg-[#0D0D11] border-white/[0.08] text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-white/80">Category</Label>
                            <Input
                                placeholder="e.g. Web Development"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Title</Label>
                            <Input
                                placeholder="e.g. Frontend Stack"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Icon</Label>
                            <Select
                                value={formData.icon}
                                onValueChange={(value) => setFormData({ ...formData, icon: value })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-blue-500/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0D0D11] border-white/10 text-white">
                                    {iconOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white">
                                            <div className="flex items-center gap-2">
                                                <option.icon className="w-4 h-4 text-blue-400" />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Sort Order</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/80">Skills List</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a skill item..."
                                    value={formData.newItem}
                                    onChange={(e) => setFormData({ ...formData, newItem: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                    className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
                                    id="skill-input"
                                />
                                <Button onClick={handleAddItem} size="icon" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-white/5 rounded-lg border border-white/5 min-h-[60px]">
                                {formData.items.length === 0 && (
                                    <span className="text-white/20 text-sm italic w-full text-center py-2">No skills added yet</span>
                                )}
                                {formData.items.map((item, idx) => (
                                    <Badge key={idx} variant="outline" className="gap-1 pl-2 pr-1 py-1 bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                                        {item}
                                        <X
                                            className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors ml-1"
                                            onClick={() => handleRemoveItem(idx)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 hover:text-white">Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
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
