import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Mail, Moon, Sun, Laptop, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

export const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[640px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
        >
            <div className="flex items-center border-b border-white/10 px-4" cmdk-input-wrapper="">
                <Search className="w-5 h-5 text-white/40 mr-2" />
                <Command.Input
                    className="w-full bg-transparent py-4 text-lg text-white placeholder:text-white/40 focus:outline-none font-light"
                    placeholder="Type a command or search..."
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-white/40">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs font-medium text-white/30 px-2 py-1.5 mb-1 uppercase tracking-wider">
                    <Command.Item
                        onSelect={() => runCommand(() => navigate('/projects'))}
                        className="flex items-center px-2 py-3 rounded-lg text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Laptop className="w-4 h-4 mr-2" />
                        Go to Projects
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => navigate('/resume'))}
                        className="flex items-center px-2 py-3 rounded-lg text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Actions" className="text-xs font-medium text-white/30 px-2 py-1.5 mb-1 uppercase tracking-wider">
                    <Command.Item
                        onSelect={() => runCommand(() => {
                            navigator.clipboard.writeText('your.email@example.com');
                            // Add toast notification here
                        })}
                        className="flex items-center px-2 py-3 rounded-lg text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Copy Email
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => {
                            // Trigger download
                        })}
                        className="flex items-center px-2 py-3 rounded-lg text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Theme" className="text-xs font-medium text-white/30 px-2 py-1.5 mb-1 uppercase tracking-wider">
                    <Command.Item
                        onSelect={() => runCommand(() => setTheme('dark'))}
                        className="flex items-center px-2 py-3 rounded-lg text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Moon className="w-4 h-4 mr-2" />
                        Dark Mode
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => setTheme('light'))}
                        className="flex items-center px-2 py-3 rounded-lg text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Sun className="w-4 h-4 mr-2" />
                        Light Mode
                    </Command.Item>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    );
};
