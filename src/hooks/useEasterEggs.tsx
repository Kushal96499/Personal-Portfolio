import { useState, useEffect } from 'react';
import { api, EasterEggsConfig } from '@/services/api';

/**
 * Custom hook to load and listen for Easter eggs configuration updates
 * Automatically syncs with admin panel changes in real-time
 */
export const useEasterEggs = () => {
    const [config, setConfig] = useState<EasterEggsConfig>({
        logo_animation: false,
        game_trigger: false,
        hacker_mode: false,
        secret_keyword: 'konami',
        animation_speed: 1.0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Load initial config from Supabase
        const loadConfig = async () => {
            try {
                const data = await api.getEasterEggsConfig();
                setConfig(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load Easter eggs config:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();

        // Listen for real-time updates from admin panel
        const handleConfigUpdate = (event: CustomEvent<EasterEggsConfig>) => {

            setConfig(event.detail);
        };

        window.addEventListener('easterEggsConfigUpdated', handleConfigUpdate as EventListener);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('easterEggsConfigUpdated', handleConfigUpdate as EventListener);
        };
    }, []);

    return { config, loading, error };
};
