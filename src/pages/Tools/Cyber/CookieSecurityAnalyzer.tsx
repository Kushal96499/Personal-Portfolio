import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, AlertTriangle, CheckCircle,
    Info, Copy, Cookie, AlertOctagon, Terminal, Play, Zap, Globe, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";

// --- Types ---

type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';

interface CookieAttribute {
    name: string;
    value?: string;
}

interface ParsedCookie {
    name: string;
    value: string;
    attributes: {
        secure: boolean;
        httpOnly: boolean;
        sameSite: 'Strict' | 'Lax' | 'None' | 'Missing';
        domain?: string;
        path?: string;
        expires?: string;
        maxAge?: string;
    };
    raw: string;
}

interface CookieIssue {
    type: 'Secure' | 'HttpOnly' | 'SameSite' | 'Other';
    severity: Severity;
    message: string;
    remediation: string;
}

interface AnalysisResult {
    grade: Grade;
    score: number; // 0-100
    cookie: ParsedCookie;
    issues: CookieIssue[];
    summary: string;
}

const DISCLAIMER = "This tool performs static analysis on user-provided cookie strings. It does not access your browser's active cookies.";

const CookieSecurityAnalyzer = () => {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // --- Parsing Engine ---

    const parseCookieString = (str: string): ParsedCookie | null => {
        const parts = str.split(';');
        if (parts.length === 0) return null;

        const firstPart = parts[0].split('=');
        const name = firstPart[0].trim();
        const value = firstPart.slice(1).join('=').trim(); // Handle values with =

        const attributes = {
            secure: false,
            httpOnly: false,
            sameSite: 'Missing' as 'Strict' | 'Lax' | 'None' | 'Missing',
            domain: undefined as string | undefined,
            path: undefined as string | undefined,
            expires: undefined as string | undefined,
            maxAge: undefined as string | undefined
        };

        for (let i = 1; i < parts.length; i++) {
            const part = parts[i].trim();
            const lowerPart = part.toLowerCase();

            if (lowerPart === 'secure') attributes.secure = true;
            else if (lowerPart === 'httponly') attributes.httpOnly = true;
            else if (lowerPart.startsWith('samesite=')) {
                const val = part.split('=')[1]?.trim().toLowerCase();
                if (val === 'strict') attributes.sameSite = 'Strict';
                else if (val === 'lax') attributes.sameSite = 'Lax';
                else if (val === 'none') attributes.sameSite = 'None';
            }
            else if (lowerPart.startsWith('domain=')) attributes.domain = part.split('=')[1]?.trim();
            else if (lowerPart.startsWith('path=')) attributes.path = part.split('=')[1]?.trim();
            else if (lowerPart.startsWith('expires=')) attributes.expires = part.split('=')[1]?.trim();
            else if (lowerPart.startsWith('max-age=')) attributes.maxAge = part.split('=')[1]?.trim();
        }

        return { name, value, attributes, raw: str };
    };

    const analyzeCookies = () => {
        if (!input.trim()) {
            setResults([]);
            return;
        }

        setIsAnalyzing(true);

        setTimeout(() => {
            // Split by newline to handle multiple Set-Cookie headers if pasted together
            // Also handle comma separation if user pasted raw header value? 
            // Better to stick to newline for clarity or just treat input as one or more Set-Cookie lines
            const lines = input.split('\n').filter(l => l.trim().length > 0);

            const newResults: AnalysisResult[] = lines.map(line => {
                const cookie = parseCookieString(line);
                if (!cookie) return null;

                const issues: CookieIssue[] = [];
                let score = 100;

                // 1. Secure Flag
                if (!cookie.attributes.secure) {
                    issues.push({
                        type: 'Secure',
                        severity: 'High',
                        message: "Missing 'Secure' flag.",
                        remediation: "Add '; Secure' to ensure the cookie is only sent over HTTPS."
                    });
                    score -= 30;
                }

                // 2. HttpOnly Flag
                if (!cookie.attributes.httpOnly) {
                    issues.push({
                        type: 'HttpOnly',
                        severity: 'High',
                        message: "Missing 'HttpOnly' flag.",
                        remediation: "Add '; HttpOnly' to prevent JavaScript access (mitigates XSS)."
                    });
                    score -= 30;
                }

                // 3. SameSite Attribute
                if (cookie.attributes.sameSite === 'Missing') {
                    issues.push({
                        type: 'SameSite',
                        severity: 'Medium',
                        message: "Missing 'SameSite' attribute.",
                        remediation: "Set 'SameSite=Strict' or 'Lax' to protect against CSRF."
                    });
                    score -= 20;
                } else if (cookie.attributes.sameSite === 'None') {
                    if (!cookie.attributes.secure) {
                        issues.push({
                            type: 'SameSite',
                            severity: 'Critical',
                            message: "SameSite=None must be paired with Secure.",
                            remediation: "Add '; Secure' attribute. Modern browsers reject SameSite=None without Secure."
                        });
                        score -= 50; // Critical failure
                    } else {
                        issues.push({
                            type: 'SameSite',
                            severity: 'Low',
                            message: "SameSite=None allows cross-site usage.",
                            remediation: "Ensure this is intended (e.g. for third-party embeds)."
                        });
                        score -= 5;
                    }
                }

                // Grading
                score = Math.max(0, score);
                let grade: Grade = 'F';
                if (score >= 95) grade = 'A+';
                else if (score >= 85) grade = 'A';
                else if (score >= 70) grade = 'B';
                else if (score >= 55) grade = 'C';
                else if (score >= 40) grade = 'D';

                let summary = "Good configuration.";
                if (grade === 'F' || grade === 'D') summary = "Critical security gaps detected. High risk of Session Hijacking or XSS theft.";
                else if (grade === 'C' || grade === 'B') summary = "Moderate protection. Some best practices are missing.";

                return {
                    grade,
                    score,
                    cookie,
                    issues,
                    summary
                };
            }).filter(Boolean) as AnalysisResult[];

            setResults(newResults);
            setIsAnalyzing(false);
        }, 800);
    };

    const loadSample = () => {
        const sample = `session_id=d6f5d4e3a2b1c0; Secure; HttpOnly; SameSite=Strict; Path=/; Domain=.example.com; Max-Age=3600`;
        setInput(sample);
    };

    const loadInsecureSample = () => {
        const sample = `auth_token=xyz123; Path=/`;
        setInput(sample);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    // --- UI Helpers ---

    const getGradeColor = (grade: Grade) => {
        if (grade === 'A+' || grade === 'A') return 'text-green-500';
        if (grade === 'B') return 'text-blue-500';
        if (grade === 'C') return 'text-yellow-500';
        if (grade === 'D') return 'text-orange-500';
        return 'text-red-500';
    };

    const getGradeBg = (grade: Grade) => {
        if (grade === 'A+' || grade === 'A') return 'bg-green-500';
        if (grade === 'B') return 'bg-blue-500';
        if (grade === 'C') return 'bg-yellow-500';
        if (grade === 'D') return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getSeverityColor = (sev: Severity) => {
        switch (sev) {
            case 'Critical': return 'text-red-600 bg-red-600/10 border-red-600/20';
            case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Medium': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'Low': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-green-400 bg-green-500/10 border-green-500/20';
        }
    };

    return (
        <ToolPageLayout
            title="Cookie Security Analyzer"
            description="Static analysis of HTTP cookies to detect missing security flags and risks."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        Cookies are a primary vector for session hijacking and XSS attacks. This tool parses raw cookie strings to check for critical security flags.
                    </p>
                    <p className="mt-2">
                        It validates attributes like <code>Secure</code>, <code>HttpOnly</code>, and <code>SameSite</code> to ensure your users' sessions are protected against modern web threats.
                    </p>
                </div>
            }
            disclaimer={DISCLAIMER}
            howItWorks={[
                "Paste your Set-Cookie header string or document.cookie string.",
                "The engine parses flags like Secure, HttpOnly, and SameSite.",
                "Get a security grade and remediation advice for session protection."
            ]}
        >
            <div className="max-w-7xl mx-auto space-y-8 min-h-[800px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT PANEL: INPUT */}
                    <Card className="lg:col-span-4 bg-[#0A0A0A] border-white/10 h-fit">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Cookie className="text-orange-500" size={18} /> Cookie Input
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadInsecureSample}
                                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7"
                                        title="Load Insecure Sample"
                                    >
                                        <AlertTriangle size={12} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadSample}
                                        className="text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 h-7"
                                        title="Load Secure Sample"
                                    >
                                        <Zap size={12} />
                                    </Button>
                                </div>
                            </div>

                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`session_id=xyz; Secure; HttpOnly...`}
                                className="bg-[#111] border-white/10 text-white font-mono text-sm min-h-[300px] resize-none focus:ring-1 focus:ring-orange-500/50 p-4 leading-relaxed tracking-wide custom-scrollbar"
                            />

                            <Button
                                onClick={analyzeCookies}
                                disabled={isAnalyzing || !input.trim()}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Configuration'} <Play size={16} className="ml-2 fill-current" />
                            </Button>

                            <div className="text-[10px] text-white/30 text-center flex items-center justify-center gap-1">
                                <Lock size={10} /> Client-side only. Cookies are not sent to any server.
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT PANEL: RESULTS */}
                    <div className="lg:col-span-8 space-y-6">
                        <AnimatePresence mode="wait">
                            {results.length > 0 ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {results.map((res, idx) => (
                                        <div key={idx} className="space-y-4">
                                            {/* Main Result Card */}
                                            <Card className="bg-[#111] border-white/10 overflow-hidden relative">
                                                <div className={cn("absolute top-0 left-0 w-1 h-full", getGradeBg(res.grade))} />
                                                <CardContent className="p-0">
                                                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                                                        {/* Grade Circle */}
                                                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                                            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/5 text-5xl font-black bg-[#0A0A0A]", getGradeColor(res.grade))}>
                                                                {res.grade}
                                                            </div>
                                                            <Badge variant="outline" className={cn("mt-1", getGradeColor(res.grade), `border-current bg-transparent`)}>
                                                                Score: {res.score}
                                                            </Badge>
                                                        </div>

                                                        {/* Cookie Info */}
                                                        <div className="flex-1 space-y-4 w-full">
                                                            <div>
                                                                <h4 className="text-white font-bold text-lg mb-1 break-all">{res.cookie.name}</h4>
                                                                <p className="text-white/40 text-sm font-mono break-all">{res.cookie.value.substring(0, 50)}{res.cookie.value.length > 50 ? '...' : ''}</p>
                                                            </div>

                                                            {/* Attribute Tags */}
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="outline" className={cn("h-6", res.cookie.attributes.secure ? "text-green-400 border-green-500/30 bg-green-500/5" : "text-red-400 border-red-500/30 bg-red-500/5 line-through decoration-red-400/50")}>
                                                                    Secure
                                                                </Badge>
                                                                <Badge variant="outline" className={cn("h-6", res.cookie.attributes.httpOnly ? "text-green-400 border-green-500/30 bg-green-500/5" : "text-red-400 border-red-500/30 bg-red-500/5 line-through decoration-red-400/50")}>
                                                                    HttpOnly
                                                                </Badge>
                                                                <Badge variant="outline" className={cn("h-6", res.cookie.attributes.sameSite !== 'Missing' && res.cookie.attributes.sameSite !== 'None' ? "text-green-400 border-green-500/30 bg-green-500/5" : "text-yellow-400 border-yellow-500/30 bg-yellow-500/5")}>
                                                                    SameSite={res.cookie.attributes.sameSite}
                                                                </Badge>
                                                                {res.cookie.attributes.domain && <Badge variant="outline" className="h-6 text-blue-300 border-blue-500/30 bg-blue-500/5">Domain: {res.cookie.attributes.domain}</Badge>}
                                                            </div>

                                                            <p className={cn("text-sm p-3 rounded border", res.grade === 'A' || res.grade === 'A+' ? "border-green-500/20 bg-green-500/5 text-green-200/80" : "border-white/10 bg-white/5 text-white/60")}>
                                                                {res.summary}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Issues List */}
                                                    {res.issues.length > 0 && (
                                                        <div className="border-t border-white/5 bg-[#0A0A0A] p-4 md:p-6 space-y-3">
                                                            <h5 className="text-xs uppercase font-bold text-white/30 tracking-widest mb-4">Security Findings</h5>
                                                            {res.issues.map((issue, i) => (
                                                                <div key={i} className="flex gap-4 items-start p-3 rounded-lg bg-[#111] border border-white/5 group hover:border-white/10 transition-colors">
                                                                    <div className={cn("mt-1 p-1 rounded", issue.severity === 'Critical' ? "text-red-500" : issue.severity === 'High' ? "text-red-400" : "text-yellow-400")}>
                                                                        <AlertOctagon size={16} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-white font-medium text-sm">{issue.message}</span>
                                                                            <Badge className={cn("text-[10px] h-5", getSeverityColor(issue.severity))}>{issue.severity}</Badge>
                                                                        </div>
                                                                        <div className="text-xs text-white/40 mb-2">Impact: {issue.type === 'HttpOnly' ? 'XSS Cookie Theft' : issue.type === 'Secure' ? 'Man-in-the-Middle Interception' : 'Cross-Site Request Forgery (CSRF)'}</div>
                                                                        <div className="text-xs text-blue-200/60 bg-blue-500/5 p-2 rounded flex items-start gap-2">
                                                                            <Shield size={12} className="mt-0.5 text-blue-400 shrink-0" />
                                                                            <span className="font-mono">{issue.remediation}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/[0.02] min-h-[500px]">
                                    <div className="w-20 h-20 rounded-full bg-orange-500/5 flex items-center justify-center mb-6 animate-pulse">
                                        <Search className="text-orange-500/40" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Cookie Inspector</h3>
                                    <p className="text-white/40 max-w-sm mb-8">
                                        Paste a cookie string to visualize its security attributes and identify vulnerabilities.
                                    </p>

                                    {/* Simple Visual */}
                                    <div className="flex items-center gap-4 opacity-30 grayscale">
                                        <div className="w-12 h-12 rounded bg-white/10 border border-white/20"></div>
                                        <div className="h-1 w-8 bg-white/10"></div>
                                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20"></div>
                                        <div className="h-1 w-8 bg-white/10"></div>
                                        <Shield size={32} />
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </ToolPageLayout>
    );
};

export default CookieSecurityAnalyzer;
