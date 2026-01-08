import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, EasterSettings, EasterEgg } from '@/services/api';
import { toast } from 'sonner';

interface EasterEggsContextType {
    settings: EasterSettings;
    eggs: EasterEgg[];
    foundEggs: string[];
    loading: boolean;
    refreshConfig: () => Promise<void>;
    unlockEgg: (eggId: string) => void;
    updateSettings: (updates: Partial<EasterSettings>) => Promise<void>;
}

const EasterEggsContext = createContext<EasterEggsContextType | undefined>(undefined);

export const EasterEggsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<EasterSettings>({
        id: 'default',
        eggs_page_enabled: true,
        created_at: new Date().toISOString()
    });
    const [eggs, setEggs] = useState<EasterEgg[]>([]);
    const [foundEggs, setFoundEggs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshConfig = async () => {
        try {
            const [settingsData, eggsData] = await Promise.all([
                api.getEasterSettings(),
                api.getEasterEggs()
            ]);
            setSettings(settingsData);
            setEggs(eggsData);
        } catch (error) {
            console.error('Failed to load easter eggs config:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load found eggs from localStorage
        const saved = localStorage.getItem('foundEggs');
        if (saved) {
            setFoundEggs(JSON.parse(saved));
        }

        refreshConfig();

        // Subscribe to realtime changes
        const settingsSub = api.subscribeToEasterSettings((newSettings) => {
            setSettings(newSettings);
        });

        // Listen for local updates (fallback)
        const handleSettingsUpdate = (event: CustomEvent) => {
            setSettings(event.detail);
        };
        window.addEventListener('easterSettingsUpdated', handleSettingsUpdate as EventListener);

        return () => {
            api.unsubscribeFromEasterSettings(settingsSub);
            window.removeEventListener('easterSettingsUpdated', handleSettingsUpdate as EventListener);
        };
    }, []);

    const unlockEgg = async (eggId: string) => {
        if (foundEggs.includes(eggId)) return;

        const egg = eggs.find(e => e.id === eggId);
        if (!egg || !egg.is_active) return;

        const newFound = [...foundEggs, eggId];
        setFoundEggs(newFound);
        localStorage.setItem('foundEggs', JSON.stringify(newFound));

        // Update database
        // Update database - Removed as 'found' column does not exist in schema
        // try {
        //     await api.updateEasterEgg(eggId, { found: true });
        // } catch (error) {
        //     console.error('Failed to update egg found status in database:', error);
        // }

        // Emit event for real-time UI updates
        window.dispatchEvent(new CustomEvent('easterEggUnlocked', { detail: { eggId, egg } }));

        toast.success(`🎉 Easter Egg Unlocked: ${egg.name}!`, {
            description: egg.description,
            duration: 5000,
            className: "border-primary/50 bg-background/90 backdrop-blur-sm"
        });
    };

    const updateSettings = async (updates: Partial<EasterSettings>) => {
        try {
            const updated = await api.updateEasterSettings(updates);
            setSettings(updated);
        } catch (error) {
            console.error('Failed to update easter settings:', error);
            toast.error('Failed to update settings');
        }
    };

    return (
        <EasterEggsContext.Provider value={{ settings, eggs, foundEggs, loading, refreshConfig, unlockEgg, updateSettings }}>
            {children}
        </EasterEggsContext.Provider>
    );
};

export const useEasterEggs = () => {
    const context = useContext(EasterEggsContext);
    if (context === undefined) {
        throw new Error('useEasterEggs must be used within an EasterEggsProvider');
    }
    return context;
};
