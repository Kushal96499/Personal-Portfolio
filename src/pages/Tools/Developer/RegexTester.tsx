import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Code2, Play, RefreshCw, Copy, Check, AlertTriangle,
    Info, Settings, ChevronDown, ChevronUp, BookOpen, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Constants ---
const PRESETS = [
    { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
    { name: "URL (Simple)", pattern: "https?:\\/\\/[\\w\\-\\.]+(?::\\d+)?(?:\\/[\\w\\-\\.\\/\\?%&=]*)?", flags: "g" },
    { name: "IPv4 Address", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g" },
    { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])", flags: "g" },
    { name: "Hex Color", pattern: "#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})", flags: "g" },
    { name: "Slug (URL Friendly)", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", flags: "" },
    { name: "Password (Strong)", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", flags: "" },
    { name: "HTML Tag", pattern: "<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)", flags: "g" },
];

const CHEATSHEET = {
    "Anchors": [
        { char: "^", desc: "Start of string/line" },
        { char: "$", desc: "End of string/line" },
        { char: "\\b", desc: "Word boundary" },
        { char: "\\B", desc: "Non-word boundary" },
    ],
    "Quantifiers": [
        { char: "*", desc: "0 or more" },
        { char: "+", desc: "1 or more" },
        { char: "?", desc: "0 or 1" },
        { char: "{3}", desc: "Exactly 3" },
        { char: "{3,}", desc: "3 or more" },
        { char: "{3,5}", desc: "3 to 5" },
    ],
    "Groups & Lookaround": [
        { char: "(...)", desc: "Capturing group" },
        { char: "(?:...)", desc: "Non-capturing group" },
        { char: "(?=...)", desc: "Positive lookahead" },
        { char: "(?!...)", desc: "Negative lookahead" },
    ],
    "Classes": [
        { char: ".", desc: "Any char (except newline)" },
        { char: "\\d", desc: "Digit (0-9)" },
        { char: "\\w", desc: "Word char (a-z, A-Z, 0-9, _)" },
        { char: "\\s", desc: "Whitespace" },
        { char: "[abc]", desc: "Any of a, b, or c" },
        { char: "[^abc]", desc: "Not a, b, or c" },
    ]
};

const HOW_IT_WORKS = [
    "Enter a Regular Expression pattern.",
    "Select flags (Global, Case Insensitive, etc.).",
    "Type test text to see real-time matches.",
    "Use 'Substitution' mode to test replace logic.",
    "Check the Cheatsheet for quick reference."
];

const DISCLAIMER = "This tool uses JavaScript's native RegExp engine. Behavior may vary slightly compared to other engines like PCRE or Python's re module.";

const RegexTester = () => {
    const [pattern, setPattern] = useState("");
    const [flags, setFlags] = useState({
        g: true, // global
        i: false, // ignoreCase
        m: false, // multiline
        s: false, // dotAll
        u: false, // unicode
    });
    const [testText, setTestText] = useState("Hello world! Contact us at test@example.com or visit https://example.com.");
    const [replaceText, setReplaceText] = useState("");
    const [matches, setMatches] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"match" | "replace">("match");
    const [debouncedPattern, setDebouncedPattern] = useState(pattern);
    const [debouncedText, setDebouncedText] = useState(testText);

    // --- Debounce ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedPattern(pattern);
            setDebouncedText(testText);
        }, 300);
        return () => clearTimeout(handler);
    }, [pattern, testText]);

    // --- Regex Logic ---
    useEffect(() => {
        if (!debouncedPattern) {
            setMatches([]);
            setError(null);
            return;
        }

        try {
            const flagStr = Object.keys(flags).filter(k => flags[k as keyof typeof flags]).join("");
            const regex = new RegExp(debouncedPattern, flagStr);

            const newMatches = [];
            let match;

            // Prevent infinite loops with empty matches
            if (regex.global) {
                let lastIndex = 0;
                while ((match = regex.exec(debouncedText)) !== null) {
                    newMatches.push({
                        index: match.index,
                        length: match[0].length,
                        content: match[0],
                        groups: match.slice(1)
                    });
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++; // Advance if empty match
                    }
                    if (newMatches.length > 1000) break; // Safety break
                }
            } else {
                match = regex.exec(debouncedText);
                if (match) {
                    newMatches.push({
                        index: match.index,
                        length: match[0].length,
                        content: match[0],
                        groups: match.slice(1)
                    });
                }
            }

            setMatches(newMatches);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setMatches([]);
        }
    }, [debouncedPattern, debouncedText, flags]);

    // --- Highlight Renderer ---
    const renderHighlightedText = () => {
        if (!debouncedPattern || error || matches.length === 0) return debouncedText;

        let lastIndex = 0;
        const elements = [];

        matches.forEach((match, i) => {
            // Text before match
            if (match.index > lastIndex) {
                elements.push(<span key={`text-${i}`}>{debouncedText.slice(lastIndex, match.index)}</span>);
            }

            // Match
            elements.push(
                <span key={`match-${i}`} className="bg-blue-500/30 border-b-2 border-blue-500 text-white font-bold relative group cursor-help">
                    {match.content}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        Match #{i + 1} {match.groups.length > 0 && `(${match.groups.length} groups)`}
                    </span>
                </span>
            );

            lastIndex = match.index + match.length;
        });

        // Remaining text
        if (lastIndex < debouncedText.length) {
            elements.push(<span key="text-end">{debouncedText.slice(lastIndex)}</span>);
        }

        return elements;
    };

    const getReplacementResult = () => {
        if (error || !debouncedPattern) return "";
        try {
            const flagStr = Object.keys(flags).filter(k => flags[k as keyof typeof flags]).join("");
            const regex = new RegExp(debouncedPattern, flagStr);
            return debouncedText.replace(regex, replaceText);
        } catch {
            return "Error calculating replacement";
        }
    };

    const loadPreset = (p: typeof PRESETS[0]) => {
        setPattern(p.pattern);
        const newFlags = { ...flags };
        // Reset flags
        Object.keys(newFlags).forEach(k => newFlags[k as keyof typeof flags] = false);
        // Set preset flags
        p.flags.split("").forEach(f => {
            if (f in newFlags) newFlags[f as keyof typeof flags] = true;
        });
        setFlags(newFlags);
        toast.success(`Loaded preset: ${p.name}`);
    };

    const toggleFlag = (f: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [f]: !prev[f] }));
    };

    return (
        <ToolPageLayout
            title="Regex Tester (Advanced)"
            description="Real-time regular expression testing, debugging, and substitution."
            about={
                <div>
                    <p>
                        Test and debug regular expressions in real-time. This advanced playground features a cheat sheet, substitution mode, and visual highlighting to help you master complex patterns.
                    </p>
                    <p className="mt-2">
                        It validates your regex against JavaScript's engine and provides instant feedback on matches and groups.
                    </p>
                </div>
            }
            parentPath="/tools/other"
            parentName="Developer Tools"
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Controls & Input */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Pattern Input */}
                        <Card className="border-white/5 bg-[#111111]">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Regex Pattern</label>
                                    <div className="flex gap-2">
                                        {Object.keys(flags).map(flag => (
                                            <button
                                                key={flag}
                                                onClick={() => toggleFlag(flag as keyof typeof flags)}
                                                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${flags[flag as keyof typeof flags] ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                                title={`Toggle ${flag} flag`}
                                            >
                                                {flag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-white/40 font-mono text-lg">/</span>
                                    <Input
                                        value={pattern}
                                        onChange={(e) => setPattern(e.target.value)}
                                        className={`pl-6 pr-6 font-mono text-lg bg-[#0A0A0A] border-white/10 h-14 ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                        placeholder="Enter regex pattern..."
                                    />
                                    <span className="absolute right-3 top-3 text-white/40 font-mono text-lg">/</span>
                                </div>

                                {error && (
                                    <div className="text-red-400 text-sm flex items-center gap-2">
                                        <AlertTriangle size={14} /> {error}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Test String & Result */}
                        <Card className="border-white/5 bg-[#111111]">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => setMode('match')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'match' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                        >
                                            Match
                                        </button>
                                        <button
                                            onClick={() => setMode('replace')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'replace' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                        >
                                            Substitution
                                        </button>
                                    </div>
                                    <div className="text-xs text-white/40">
                                        {matches.length} matches found
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Test String</label>
                                    <Textarea
                                        value={testText}
                                        onChange={(e) => setTestText(e.target.value)}
                                        className="min-h-[150px] font-mono bg-[#0A0A0A] border-white/10 text-white/80"
                                        placeholder="Enter text to test against..."
                                    />
                                </div>

                                {mode === 'match' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Live Preview</label>
                                        <div className="min-h-[150px] p-4 rounded-xl bg-[#0A0A0A] border border-white/10 font-mono text-white/60 whitespace-pre-wrap break-all">
                                            {renderHighlightedText()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Substitution String</label>
                                            <Input
                                                value={replaceText}
                                                onChange={(e) => setReplaceText(e.target.value)}
                                                className="font-mono bg-[#0A0A0A] border-white/10"
                                                placeholder="Enter replacement text (e.g. $1)..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white/40 uppercase tracking-wider">Result</label>
                                            <div className="min-h-[100px] p-4 rounded-xl bg-[#0A0A0A] border border-white/10 font-mono text-green-400 whitespace-pre-wrap break-all">
                                                {getReplacementResult()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">

                        {/* Presets */}
                        <Card className="border-white/5 bg-[#111111]">
                            <CardContent className="p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <BookOpen size={16} className="text-blue-500" /> Quick Presets
                                </h3>
                                <div className="space-y-2">
                                    {PRESETS.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => loadPreset(p)}
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors truncate"
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cheatsheet */}
                        <Card className="border-white/5 bg-[#111111]">
                            <CardContent className="p-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Info size={16} className="text-purple-500" /> Cheatsheet
                                </h3>
                                <div className="space-y-6">
                                    {Object.entries(CHEATSHEET).map(([category, items]) => (
                                        <div key={category}>
                                            <h4 className="text-xs font-bold text-white/40 mb-2">{category}</h4>
                                            <div className="space-y-1">
                                                {items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-xs">
                                                        <code className="text-blue-400 font-mono bg-blue-500/10 px-1 rounded">{item.char}</code>
                                                        <span className="text-white/60">{item.desc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </ToolPageLayout>
    );
};

export default RegexTester;
