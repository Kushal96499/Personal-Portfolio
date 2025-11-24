import { useState, useEffect } from 'react';
import { api, EasterSettings, EasterEgg, EasterEggInsert } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Save, Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { TRIGGER_PRESETS, ACTION_PRESETS } from '@/utils/easterEggPresets';

const EasterEggs = () => {
    const [settings, setSettings] = useState<EasterSettings>({
        id: '',
        eggs_page_enabled: true,
        created_at: ''
    });
    const [eggs, setEggs] = useState<EasterEgg[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Egg Form State
    const [isEggDialogOpen, setIsEggDialogOpen] = useState(false);
    const [editingEgg, setEditingEgg] = useState<EasterEgg | null>(null);
    const [eggForm, setEggForm] = useState<EasterEggInsert>({
        name: '',
        description: '',
        hint: '',
        difficulty: 'Medium',
        trigger_type: 'navigate_section',
        trigger_value: '',
        action_type: 'neon_particles',
        is_active: true,
        is_secret: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsData, eggsData] = await Promise.all([
                api.getEasterSettings(),
                api.getEasterEggs()
            ]);
            setSettings(settingsData);
            setEggs(eggsData);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to fetch easter eggs data:', error);
            toast.error('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await api.updateEasterSettings(settings);
            toast.success('Settings saved successfully!');
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSettings = (updates: Partial<EasterSettings>) => {
        setSettings({ ...settings, ...updates });
        setHasChanges(true);
    };

    const handleEggSubmit = async () => {
        try {
            if (editingEgg) {
                await api.updateEasterEgg(editingEgg.id, eggForm);
                toast.success('Easter egg updated!');
            } else {
                await api.createEasterEgg(eggForm);
                toast.success('New easter egg created!');
            }
            setIsEggDialogOpen(false);
            fetchData();
            resetEggForm();
        } catch (error: any) {
            console.error('Failed to save egg:', error);
            toast.error(error.message || 'Failed to save easter egg');
        }
    };

    const handleDeleteEgg = async (id: string) => {
        if (!confirm('Are you sure you want to delete this easter egg?')) return;
        try {
            await api.deleteEasterEgg(id);
            toast.success('Easter egg deleted');
            fetchData();
        } catch (error: any) {
            console.error('Failed to delete egg:', error);
            toast.error(error.message || 'Failed to delete easter egg');
        }
    };

    const resetEggForm = () => {
        setEditingEgg(null);
        setEggForm({
            name: '',
            description: '',
            hint: '',
            difficulty: 'Medium',
            trigger_type: 'navigate_section',
            trigger_value: '',
            action_type: 'neon_particles',
            is_active: true,
            is_secret: false
        });
    };

    const openEditDialog = (egg: EasterEgg) => {
        setEditingEgg(egg);
        setEggForm({
            name: egg.name,
            description: egg.description,
            hint: egg.hint,
            difficulty: egg.difficulty,
            trigger_type: egg.trigger_type,
            trigger_value: egg.trigger_value,
            action_type: egg.action_type || 'neon_particles',
            is_active: egg.is_active,
            is_secret: egg.is_secret
        });
        setIsEggDialogOpen(true);
    };

    const getTriggerConfig = () => {
        return TRIGGER_PRESETS[eggForm.trigger_type as keyof typeof TRIGGER_PRESETS];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Easter Eggs Manager</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage preset-driven Easter Eggs</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={!hasChanges || saving}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>

            {/* Public Page Visibility */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Public Page Visibility
                    </CardTitle>
                    <CardDescription>Show/Hide the public Easter Eggs page</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="eggs-page">Enable Public Page</Label>
                        <Switch
                            id="eggs-page"
                            checked={settings.eggs_page_enabled}
                            onCheckedChange={(checked) => updateSettings({ eggs_page_enabled: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Easter Eggs List Manager */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Easter Eggs List
                        </CardTitle>
                        <CardDescription>Manage individual easter eggs with preset triggers</CardDescription>
                    </div>
                    <Dialog open={isEggDialogOpen} onOpenChange={setIsEggDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetEggForm}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Egg
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingEgg ? 'Edit Easter Egg' : 'Create New Easter Egg'}</DialogTitle>
                                <DialogDescription>
                                    Define the details and preset trigger for this easter egg.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={eggForm.name}
                                            onChange={(e) => setEggForm({ ...eggForm, name: e.target.value })}
                                            placeholder="e.g. Secret Portal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Difficulty</Label>
                                        <Select
                                            value={eggForm.difficulty}
                                            onValueChange={(val: any) => setEggForm({ ...eggForm, difficulty: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={eggForm.description}
                                        onChange={(e) => setEggForm({ ...eggForm, description: e.target.value })}
                                        placeholder="What happens when found?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Hint</Label>
                                    <Input
                                        value={eggForm.hint}
                                        onChange={(e) => setEggForm({ ...eggForm, hint: e.target.value })}
                                        placeholder="Clue for the user..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Trigger Type</Label>
                                        <Select
                                            value={eggForm.trigger_type}
                                            onValueChange={(val: any) => setEggForm({ ...eggForm, trigger_type: val, trigger_value: '' })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(TRIGGER_PRESETS).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {config.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">{getTriggerConfig()?.description}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Action Type</Label>
                                        <Select
                                            value={eggForm.action_type}
                                            onValueChange={(val: any) => setEggForm({ ...eggForm, action_type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(ACTION_PRESETS).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {config.icon} {config.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Dynamic Trigger Value Input */}
                                {getTriggerConfig()?.requiresValue && (
                                    <div className="space-y-2">
                                        <Label>
                                            {eggForm.trigger_type === 'keyword' ? 'Keyword to Type' :
                                                eggForm.trigger_type === 'navigate_section' ? 'Navigation Section' :
                                                    eggForm.trigger_type === 'ui_interaction' ? 'UI Element' :
                                                        eggForm.trigger_type === 'hover_element' ? 'Element to Hover' :
                                                            eggForm.trigger_type === 'click_nav_icon' ? 'Navigation Icon' :
                                                                'Value'}
                                        </Label>
                                        {getTriggerConfig()?.values.length > 0 && !getTriggerConfig()?.allowCustom ? (
                                            <Select
                                                value={eggForm.trigger_value}
                                                onValueChange={(val) => setEggForm({ ...eggForm, trigger_value: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select preset value..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getTriggerConfig()?.values.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                value={eggForm.trigger_value}
                                                onChange={(e) => setEggForm({ ...eggForm, trigger_value: e.target.value })}
                                                placeholder={
                                                    eggForm.trigger_type === 'keyword' ? 'Enter secret keyword...' :
                                                        eggForm.trigger_type === 'navigate_section' ? 'Select section...' :
                                                            'Enter value...'
                                                }
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="egg-active"
                                            checked={eggForm.is_active}
                                            onCheckedChange={(checked) => setEggForm({ ...eggForm, is_active: checked })}
                                        />
                                        <Label htmlFor="egg-active">Active</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="egg-secret"
                                            checked={eggForm.is_secret}
                                            onCheckedChange={(checked) => setEggForm({ ...eggForm, is_secret: checked })}
                                        />
                                        <Label htmlFor="egg-secret">Secret (Hidden from list)</Label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEggDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleEggSubmit}>Save Easter Egg</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Trigger</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {eggs.map((egg) => (
                                <TableRow key={egg.id}>
                                    <TableCell className="font-medium">
                                        <div>{egg.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{egg.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="font-mono text-xs w-fit">
                                                {TRIGGER_PRESETS[egg.trigger_type as keyof typeof TRIGGER_PRESETS]?.label || egg.trigger_type}
                                            </Badge>
                                            {egg.trigger_value && (
                                                <span className="text-xs text-muted-foreground">
                                                    {egg.trigger_value}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {ACTION_PRESETS[egg.action_type as keyof typeof ACTION_PRESETS]?.icon} {ACTION_PRESETS[egg.action_type as keyof typeof ACTION_PRESETS]?.label || egg.action_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={egg.difficulty === 'Hard' ? 'destructive' : egg.difficulty === 'Medium' ? 'secondary' : 'default'}>
                                            {egg.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {egg.is_active ? (
                                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                            {egg.is_secret && <Badge variant="outline">Secret</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(egg)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteEgg(egg.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {eggs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No easter eggs found. Create one to get started!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default EasterEggs;
