import React, { useState, useEffect, useCallback } from 'react';
import { Settings2, LayoutTemplate, FileType, RotateCw, Maximize, Minimize, Check, Undo2, Redo2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

export interface PageSettings {
    pageSize: 'A4' | 'LETTER' | 'LEGAL';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    dpi: 72 | 150 | 300;
}

interface PageSetupPanelProps {
    settings: PageSettings;
    onSettingsChange: (settings: PageSettings) => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const PageSetupPanel: React.FC<PageSetupPanelProps> = ({
    settings,
    onSettingsChange,
    disabled = false,
    className,
    children
}) => {
    // Local state for margins to prevent laggy updates while typing
    const [localMargins, setLocalMargins] = useState(settings.margins);

    // History Management
    const [history, setHistory] = useState<PageSettings[]>([settings]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Sync local state when external settings change (e.g. reset)
    useEffect(() => {
        setLocalMargins(settings.margins);
    }, [settings.margins]);

    // Helper to update settings and push to history
    const updateSettingsWithHistory = useCallback((newSettings: PageSettings) => {
        // Don't push if identical to current
        if (JSON.stringify(newSettings) === JSON.stringify(history[historyIndex])) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newSettings);

        // Limit history size to 50
        if (newHistory.length > 50) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onSettingsChange(newSettings);
    }, [history, historyIndex, onSettingsChange]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            onSettingsChange(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            onSettingsChange(history[newIndex]);
        }
    };

    const handleMarginChange = (key: keyof PageSettings['margins'], value: string) => {
        const numValue = parseFloat(value);
        setLocalMargins(prev => ({
            ...prev,
            [key]: isNaN(numValue) ? 0 : numValue
        }));
    };

    const commitMarginChange = () => {
        updateSettingsWithHistory({
            ...settings,
            margins: localMargins
        });
    };

    return (
        <GlassPanel className={cn("h-full border-l border-white/10 bg-[#0A0A0A]/80 backdrop-blur-2xl", className)}>
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shadow-lg shadow-blue-500/5">
                        <Settings2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-white tracking-tight">Page Setup</h3>
                        <p className="text-xs text-gray-400 font-medium">Configure output settings</p>
                    </div>
                </div>

                {/* Undo/Redo Controls */}
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                        onClick={handleUndo}
                        disabled={historyIndex === 0 || disabled}
                        title="Undo"
                    >
                        <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                        onClick={handleRedo}
                        disabled={historyIndex === history.length - 1 || disabled}
                        title="Redo"
                    >
                        <Redo2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-8 px-2 pb-8">
                {/* Tool Specific Settings (Injected) */}
                {children && (
                    <>
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-500">
                            {children}
                        </div>
                        <Separator className="bg-white/5" />
                    </>
                )}

                {/* Page Size */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Paper Size</Label>
                    </div>
                    <Select
                        value={settings.pageSize}
                        onValueChange={(v: any) => updateSettingsWithHistory({ ...settings, pageSize: v })}
                        disabled={disabled}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 hover:bg-white/10 transition-all focus:ring-2 focus:ring-blue-500/50 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#151515] border-white/10 text-white backdrop-blur-xl">
                            <SelectItem value="A4" className="focus:bg-white/10 cursor-pointer">
                                <span className="font-medium">A4</span> <span className="text-gray-500 ml-2">(210 x 297 mm)</span>
                            </SelectItem>
                            <SelectItem value="LETTER" className="focus:bg-white/10 cursor-pointer">
                                <span className="font-medium">Letter</span> <span className="text-gray-500 ml-2">(8.5 x 11 in)</span>
                            </SelectItem>
                            <SelectItem value="LEGAL" className="focus:bg-white/10 cursor-pointer">
                                <span className="font-medium">Legal</span> <span className="text-gray-500 ml-2">(8.5 x 14 in)</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Separator className="bg-white/5" />

                {/* Orientation */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Orientation</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => updateSettingsWithHistory({ ...settings, orientation: 'portrait' })}
                            disabled={disabled}
                            className={cn(
                                "h-24 flex flex-col gap-3 border-white/10 hover:bg-white/5 hover:text-white transition-all rounded-xl relative overflow-hidden group",
                                settings.orientation === 'portrait'
                                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400 ring-1 ring-blue-500/50"
                                    : "bg-black/20 text-gray-400"
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 transition-opacity",
                                settings.orientation === 'portrait' && "opacity-100"
                            )} />
                            <FileType className={cn("w-6 h-6 z-10 transition-transform group-hover:scale-110", settings.orientation === 'portrait' ? 'text-blue-400' : 'text-gray-500')} />
                            <span className="font-medium z-10">Portrait</span>
                            {settings.orientation === 'portrait' && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-3 h-3 text-blue-400" />
                                </div>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => updateSettingsWithHistory({ ...settings, orientation: 'landscape' })}
                            disabled={disabled}
                            className={cn(
                                "h-24 flex flex-col gap-3 border-white/10 hover:bg-white/5 hover:text-white transition-all rounded-xl relative overflow-hidden group",
                                settings.orientation === 'landscape'
                                    ? "bg-blue-500/10 border-blue-500/50 text-blue-400 ring-1 ring-blue-500/50"
                                    : "bg-black/20 text-gray-400"
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 opacity-0 transition-opacity",
                                settings.orientation === 'landscape' && "opacity-100"
                            )} />
                            <LayoutTemplate className={cn("w-6 h-6 z-10 transition-transform group-hover:scale-110", settings.orientation === 'landscape' ? 'text-blue-400' : 'text-gray-500')} />
                            <span className="font-medium z-10">Landscape</span>
                            {settings.orientation === 'landscape' && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-3 h-3 text-blue-400" />
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Margins */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Margins (mm)</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2 rounded-full transition-colors"
                            onClick={() => updateSettingsWithHistory({
                                ...settings,
                                margins: { top: 25.4, bottom: 25.4, left: 25.4, right: 25.4 }
                            })}
                        >
                            Reset to Standard
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner">
                        {['top', 'bottom', 'left', 'right'].map((side) => (
                            <div key={side} className="space-y-2">
                                <Label className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{side}</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={localMargins[side as keyof typeof localMargins]}
                                        onChange={(e) => handleMarginChange(side as any, e.target.value)}
                                        onBlur={commitMarginChange}
                                        onKeyDown={(e) => e.key === 'Enter' && commitMarginChange()}
                                        disabled={disabled}
                                        className="bg-black/40 border-white/10 text-white h-10 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all pl-3 pr-8 rounded-lg"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 pointer-events-none">
                                        mm
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="bg-white/5" />

                {/* DPI / Quality - Removed as per user request for Max Quality default */}
            </div>
        </GlassPanel>
    );
};

export default PageSetupPanel;
