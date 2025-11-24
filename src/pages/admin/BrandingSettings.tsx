import { useState, useEffect } from 'react';
import { api, BrandingSettings } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Palette, Image as ImageIcon, Type } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';

const BrandingSettingsPage = () => {
    const [settings, setSettings] = useState<BrandingSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await api.getBrandingSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch branding settings:', error);
            toast.error('Failed to load branding settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            await api.updateBrandingSettings(settings);
            toast.success('Branding settings updated successfully!');
        } catch (error) {
            console.error('Failed to save branding settings:', error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoTypeChange = (value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            logo_type: value as 'text' | 'image'
        });
    };

    const handleLogoSizeChange = (value: number[]) => {
        if (!settings) return;
        setSettings({
            ...settings,
            logo_size: value[0]
        });
    };

    const handleNeonGlowToggle = (checked: boolean) => {
        if (!settings) return;
        setSettings({
            ...settings,
            neon_glow: checked
        });
    };

    const handleImageUploaded = (url: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            logo_url: url,
            logo_type: 'image' // Auto-switch to image when uploaded
        });
    };

    const handleImageRemoved = () => {
        if (!settings) return;
        setSettings({
            ...settings,
            logo_url: null,
            logo_type: 'text' // Switch back to text when removed
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading branding settings...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load branding settings</p>
                <Button onClick={fetchSettings} className="mt-4">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold font-orbitron text-gradient">Branding & Logo Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Customize your portfolio logo and branding appearance
                </p>
            </div>

            {/* Logo Preview Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Palette className="w-6 h-6 text-primary" />
                        <div>
                            <CardTitle>Logo Preview</CardTitle>
                            <CardDescription>See how your logo will appear</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8 bg-background/50 rounded-lg border border-border">
                        {settings.logo_type === 'text' ? (
                            <div
                                className={`text-2xl font-bold text-gradient transition-all ${settings.neon_glow ? 'logo-neon-glow' : ''
                                    }`}
                                style={{ fontSize: `${settings.logo_size}px` }}
                            >
                                KK
                            </div>
                        ) : settings.logo_url ? (
                            <img
                                src={settings.logo_url}
                                alt="Logo"
                                className={`logo-round transition-all ${settings.neon_glow ? 'logo-neon-glow' : ''
                                    }`}
                                style={{ height: `${settings.logo_size}px`, width: `${settings.logo_size}px` }}
                            />
                        ) : (
                            <div className="text-muted-foreground">No logo uploaded</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Logo Type Selector */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle>Logo Type</CardTitle>
                    <CardDescription>Choose between text or image logo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup value={settings.logo_type} onValueChange={handleLogoTypeChange}>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all">
                            <RadioGroupItem value="text" id="text" />
                            <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer flex-1">
                                <Type className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-medium">Text Logo</div>
                                    <div className="text-sm text-muted-foreground">Use "KK" as logo</div>
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all">
                            <RadioGroupItem value="image" id="image" />
                            <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer flex-1">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-medium">Image Logo</div>
                                    <div className="text-sm text-muted-foreground">Upload custom logo</div>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Image Upload (shown when image type is selected) */}
            {settings.logo_type === 'image' && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                        <CardTitle>Upload Logo Image</CardTitle>
                        <CardDescription>
                            Recommended size: 150×150px • Accepts: PNG, JPG, WEBP
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ImageUpload
                            label="Logo Image"
                            folder="branding"
                            currentImageUrl={settings.logo_url || undefined}
                            onImageUploaded={handleImageUploaded}
                            onImageRemoved={handleImageRemoved}
                            accept="image/png,image/jpeg,image/webp"
                            maxSizeMB={2}
                        />
                        <p className="text-xs text-muted-foreground mt-3">
                            💡 Tip: Square images work best. The logo will be automatically cropped to a circle with neon glow effect.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Logo Size Control */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle>Logo Size</CardTitle>
                    <CardDescription>Adjust the height of your logo in pixels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Size (px)</Label>
                            <span className="text-sm font-mono text-primary">{settings.logo_size}px</span>
                        </div>
                        <Slider
                            value={[settings.logo_size]}
                            onValueChange={handleLogoSizeChange}
                            min={30}
                            max={80}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>30px (Min)</span>
                            <span>45px (Default)</span>
                            <span>80px (Max)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Neon Glow Toggle */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                    <CardTitle>Neon Glow Effect</CardTitle>
                    <CardDescription>Add an animated neon glow to your logo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-3 h-3 rounded-full transition-all ${settings.neon_glow
                                    ? 'bg-primary shadow-[0_0_10px_rgba(0,234,255,0.8)]'
                                    : 'bg-gray-500'
                                    }`}
                            />
                            <div>
                                <Label htmlFor="neon-glow" className="font-medium cursor-pointer">
                                    Enable Neon Glow
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {settings.neon_glow ? 'Glow effect is active' : 'Glow effect is disabled'}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="neon-glow"
                            checked={settings.neon_glow}
                            onCheckedChange={handleNeonGlowToggle}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="text-blue-500 mt-0.5">ℹ️</div>
                        <div className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Real-time Updates:</strong> Changes will be reflected instantly across your entire portfolio website. The logo appears in the navigation bar and updates automatically when you save.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BrandingSettingsPage;
