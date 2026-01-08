import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tool, allPdfTools } from '@/data/pdfTools';

interface PDFToolsContextType {
    recentTools: Tool[];
    favoriteTools: string[]; // IDs of favorite tools
    addToRecent: (toolId: string) => void;
    toggleFavorite: (toolId: string) => void;
    isFavorite: (toolId: string) => boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: Tool[];
}

const PDFToolsContext = createContext<PDFToolsContextType | undefined>(undefined);

import { useFavorites } from '@/hooks/useFavorites';

// ...

export const PDFToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [recentTools, setRecentTools] = useState<Tool[]>([]);
    const { favorites: favoriteTools, toggleFavorite, isFavorite } = useFavorites();
    const [searchQuery, setSearchQuery] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        const savedRecents = localStorage.getItem('pdf-recent-tools');

        if (savedRecents) {
            try {
                const recentIds = JSON.parse(savedRecents) as string[];
                const tools = recentIds.map(id => allPdfTools.find(t => t.id === id)).filter(Boolean) as Tool[];
                setRecentTools(tools);
            } catch (e) {
                console.error("Failed to parse recent tools", e);
            }
        }
    }, []);

    const addToRecent = (toolId: string) => {
        const tool = allPdfTools.find(t => t.id === toolId);
        if (!tool) return;

        setRecentTools(prev => {
            const filtered = prev.filter(t => t.id !== toolId);
            const newRecents = [tool, ...filtered].slice(0, 5); // Keep last 5
            localStorage.setItem('pdf-recent-tools', JSON.stringify(newRecents.map(t => t.id)));
            return newRecents;
        });
    };

    const searchResults = searchQuery
        ? allPdfTools.filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <PDFToolsContext.Provider value={{
            recentTools,
            favoriteTools,
            addToRecent,
            toggleFavorite,
            isFavorite,
            searchQuery,
            setSearchQuery,
            searchResults
        }}>
            {children}
        </PDFToolsContext.Provider>
    );
};

export const usePDFTools = () => {
    const context = useContext(PDFToolsContext);
    if (context === undefined) {
        throw new Error('usePDFTools must be used within a PDFToolsProvider');
    }
    return context;
};
