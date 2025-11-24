import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
}

export const TagInput = ({ tags, onChange, suggestions = [], placeholder = 'Add tags...' }: TagInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const defaultSuggestions = [
        'Web Security',
        'Pentesting',
        'Scripting',
        'Cloud Security',
        'Network Security',
        'Malware Analysis',
        'OSINT',
        'Bug Bounty',
        'CTF',
        'Red Team',
    ];

    const allSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;
    const filteredSuggestions = allSuggestions.filter(
        (s) => !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
    );

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onChange([...tags, trimmedTag]);
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-background/50 min-h-[42px]">
                {tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="relative z-50 border border-border rounded-md bg-card p-2 space-y-1 max-h-48 overflow-y-auto shadow-lg" style={{ pointerEvents: 'auto' }}>
                    <p className="text-xs text-muted-foreground px-2 py-1">Suggestions:</p>
                    {filteredSuggestions.map((suggestion) => (
                        <Button
                            key={suggestion}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addTag(suggestion);
                            }}
                            className="w-full justify-start text-sm hover:bg-primary/10 hover:text-primary cursor-pointer"
                        >
                            {suggestion}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};
