import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, BrandingSettings } from '@/services/api';

interface BrandingContextType {
    branding: BrandingSettings;
    loading: boolean;
    updateBranding: (updates: Partial<BrandingSettings>) => Promise<void>;
}

const defaultBranding: BrandingSettings = {
    logo_type: 'text',
    logo_url: null,
    logo_size: 45,
    neon_glow: true,
};

const BrandingContext = createContext<BrandingContextType>({
    branding: defaultBranding,
    loading: true,
    updateBranding: async () => { },
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
    const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial branding settings
        const fetchBranding = async () => {
            try {
                const data = await api.getBrandingSettings();
                setBranding(data);
            } catch (error) {
                console.error('Failed to fetch branding settings:', error);
                // Use defaults on error
            } finally {
                setLoading(false);
            }
        };

        fetchBranding();

        // Subscribe to real-time updates
        const channel = api.subscribeToBrandingSettings((newBranding) => {
            setBranding(newBranding);
        });

        return () => {
            api.unsubscribeFromBrandingSettings(channel);
        };
    }, []);

    const updateBranding = async (updates: Partial<BrandingSettings>) => {
        try {
            const updated = await api.updateBrandingSettings(updates);
            setBranding(updated);
        } catch (error) {
            console.error('Failed to update branding settings:', error);
            throw error;
        }
    };

    return (
        <BrandingContext.Provider value={{ branding, loading, updateBranding }}>
            {children}
        </BrandingContext.Provider>
    );
};
