import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, SiteControls } from '@/services/api';

interface SiteControlsContextType {
    controls: SiteControls;
    loading: boolean;
    updateControls: (updates: Partial<SiteControls>) => Promise<void>;
}

const defaultControls: SiteControls = {
    home_hero: true,
    skills: true,
    projects: true,
    testimonials: true,
    certificates: true,
    blog: true,
    contact: true,
    footer_extras: true,
    threat_map_enabled: false,
};

const SiteControlsContext = createContext<SiteControlsContextType>({
    controls: defaultControls,
    loading: true,
    updateControls: async () => { },
});

export const useSiteControls = () => useContext(SiteControlsContext);

export const SiteControlsProvider = ({ children }: { children: ReactNode }) => {
    const [controls, setControls] = useState<SiteControls>(defaultControls);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial controls
        const fetchControls = async () => {
            try {
                const data = await api.getSiteControls();
                setControls(data);
            } catch (error) {
                console.error('Failed to fetch site controls:', error);
                // Use defaults on error
            } finally {
                setLoading(false);
            }
        };

        fetchControls();

        // Subscribe to real-time updates
        const channel = api.subscribeToSiteControls((newControls) => {
            setControls(newControls);
        });

        return () => {
            api.unsubscribeFromSiteControls(channel);
        };
    }, []);

    const updateControls = async (updates: Partial<SiteControls>) => {
        try {
            const updated = await api.updateSiteControls(updates);
            setControls(updated);
        } catch (error) {
            console.error('Failed to update site controls:', error);
            throw error;
        }
    };

    return (
        <SiteControlsContext.Provider value={{ controls, loading, updateControls }}>
            {children}
        </SiteControlsContext.Provider>
    );
};
