import { useState, useEffect } from 'react';

const STORAGE_KEY = 'portfolio-favorites';
const LEGACY_KEYS = ['favoriteTools', 'pdf-favorite-tools'];

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const loadFavorites = () => {
            // 1. Load main storage
            const stored = localStorage.getItem(STORAGE_KEY);
            let currentFavorites = new Set<string>();

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        parsed.forEach((id: string) => currentFavorites.add(id));
                    }
                } catch (e) {
                    console.error('Failed to parse favorites', e);
                }
            }

            // 2. Merge Legacy Keys (Aggressive Migration)
            let changed = false;
            LEGACY_KEYS.forEach(key => {
                const legacyStored = localStorage.getItem(key);
                if (legacyStored) {
                    try {
                        const parsed = JSON.parse(legacyStored);
                        if (Array.isArray(parsed)) {
                            parsed.forEach((id: string) => {
                                if (!currentFavorites.has(id)) {
                                    currentFavorites.add(id);
                                    changed = true;
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Failed to parse legacy key ${key}`, e);
                    }
                }
            });

            const finalFavorites = Array.from(currentFavorites);
            setFavorites(finalFavorites);

            // 3. Save back if we merged anything
            if (changed) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(finalFavorites));
            }
        };

        loadFavorites();

        // Listen for changes from other tabs/components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadFavorites();
            }
        };

        // Custom event for same-tab updates
        const handleLocalChange = () => {
            loadFavorites();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('favorites-updated', handleLocalChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('favorites-updated', handleLocalChange);
        };
    }, []);

    const toggleFavorite = (toolId: string) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        let currentFavorites: string[] = [];
        if (stored) {
            try {
                currentFavorites = JSON.parse(stored);
            } catch (e) { }
        }

        const newFavorites = currentFavorites.includes(toolId)
            ? currentFavorites.filter(id => id !== toolId)
            : [...currentFavorites, toolId];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
        setFavorites(newFavorites);

        // Notify other components
        window.dispatchEvent(new Event('favorites-updated'));
    };

    const isFavorite = (toolId: string) => favorites.includes(toolId);

    return { favorites, toggleFavorite, isFavorite };
};
