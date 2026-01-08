import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, AlertTriangle, CheckCircle,
    Info, Copy, FileText, Activity, AlertOctagon, Terminal, Play, Zap, Globe
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
type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
type HeaderStatus = 'Pass' | 'Fail' | 'Warning' | 'Missing';

interface HeaderFinding {
    header: string;
    status: HeaderStatus;
    value: string | null;
    issues: string[];
    remediation: string;
    description: string;
    severity: Severity;
}

interface AnalysisResult {
    grade: Grade;
    score: number; // 0-100
    findings: HeaderFinding[];
    summary: string;
}

const REQUIRED_HEADERS = [
    { name: 'Content-Security-Policy', severity: 'Critical', weight: 30 },
    { name: 'Strict-Transport-Security', severity: 'Critical', weight: 25 },
    { name: 'X-Content-Type-Options', severity: 'High', weight: 15 },
    { name: 'X-Frame-Options', severity: 'High', weight: 15 },
    { name: 'Referrer-Policy', severity: 'Medium', weight: 10 },
    { name: 'Permissions-Policy', severity: 'Medium', weight: 5 },
];

const DISCLAIMER = "This tool performs static analysis on the headers you paste. It does not connect to any server or perform active scanning.";

const SecurityHeadersAnalyzer = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // --- Analysis Engine ---

    const parseHeaders = (raw: string): Map<string, string> => {
        const headers = new Map<string, string>();
        raw.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(':').trim();
                headers.set(key, value);
            }
        });
        return headers;
    };

    const analyzeHeaders = () => {
        if (!input.trim()) {
            setResult(null);
            return;
        }

        setIsAnalyzing(true);

        // Simulating a brief delay for effect
        setTimeout(() => {
            const headers = parseHeaders(input);
            const findings: HeaderFinding[] = [];
            let totalScore = 0;
            let maxScore = 0;

            REQUIRED_HEADERS.forEach(def => {
                const value = headers.get(def.name.toLowerCase());
                let status: HeaderStatus = 'Missing';
                const issues: string[] = [];
                let remediation = "";

                if (value) {
                    status = 'Pass';
                    // Specific checks
                    if (def.name === 'Content-Security-Policy') {
                        if (value.includes("'unsafe-inline'") || value.includes("'unsafe-eval'")) {
                            status = 'Warning';
                            issues.push("Contains unsafe directives (unsafe-inline/eval).");
                            remediation = "Remove unsafe-inline/eval and use nonces or hashes.";
                        } else if (value.includes("*") && !value.includes("default-src 'none'")) {
                            status = 'Warning';
                            issues.push("Wildcard usage allows looser restrictions.");
                            remediation = "Specify trusted domains instead of wildcards.";

                        } else {
                            remediation = "Configuration looks strong.";
                        }
                    }
                    if (def.name === 'Strict-Transport-Security') {
                        if (!value.includes('includeSubDomains')) {
                            status = 'Warning';
                            issues.push("Missing includeSubDomains directive.");
                            remediation = "Add 'includeSubDomains' to protect all subdomains.";
                        }
                        if (!value.includes('max-age')) { // Basic check, better integer parsing could be done
                            status = 'Fail';
                            issues.push("Missing max-age directive.");
                            remediation = "Set max-age to at least 31536000 (1 year).";
                        }
                    }
                    if (def.name === 'X-Frame-Options') {
                        if (value.toLowerCase() !== 'deny' && value.toLowerCase() !== 'sameorigin') {
                            status = 'Warning';
                            issues.push("Weak configuration allows framing.");
                            remediation = "Set to DENY or SAMEORIGIN.";
                        }
                    }
                    if (def.name === 'X-Content-Type-Options') {
                        if (value.toLowerCase() !== 'nosniff') {
                            status = 'Fail';
                            issues.push("Value must be 'nosniff'.");
                            remediation = "Set value to 'nosniff' to prevent MIME sniffing.";
                        }
                    }
                    if (def.name === 'Referrer-Policy') {
                        if (value.toLowerCase().includes('unsafe-url') || value.toLowerCase().includes('always')) {
                            status = 'Fail';
                            issues.push("Policy allows leaking full referrer URL.");
                            remediation = "Use 'strict-origin-when-cross-origin' or 'no-referrer'.";
                        }
                    }

                } else {
                    status = 'Missing';
                    issues.push("Header is not present in response.");
                    // Default remediation
                    if (def.name === 'Content-Security-Policy') remediation = "Implement CSP to prevent XSS.";
                    if (def.name === 'Strict-Transport-Security') remediation = "Enable HSTS to enforce HTTPS.";
                    if (def.name === 'X-Frame-Options') remediation = "Set X-Frame-Options to prevent Clickjacking.";
                    if (def.name === 'X-Content-Type-Options') remediation = "Set to 'nosniff' to stop MIME sniffing.";
                    if (def.name === 'Referrer-Policy') remediation = "Control referrer information leakage.";
                    if (def.name === 'Permissions-Policy') remediation = "Restrict browser features and APIs.";
                }

                // Scoring
                maxScore += def.weight;
                if (status === 'Pass') totalScore += def.weight;
                else if (status === 'Warning') totalScore += (def.weight / 2);

                findings.push({
                    header: def.name,
                    value: value || null,
                    status,
                    issues,
                    remediation,
                    severity: def.severity as Severity,
                    description: `Protects against ${getAttackVector(def.name)}`
                });

            });

            // Calculate Grade
            const percentage = (totalScore / maxScore) * 100;
            let grade: Grade = 'F';
            if (percentage >= 95) grade = 'A+';
            else if (percentage >= 85) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 55) grade = 'C';
            else if (percentage >= 40) grade = 'D';

            setResult({
                grade,
                score: Math.round(percentage),
                findings,
                summary: getSummary(grade, findings)
            });
            setIsAnalyzing(false);

        }, 600);
    };

    const getAttackVector = (header: string) => {
        switch (header) {
            case 'Content-Security-Policy': return 'XSS and Data Injection';
            case 'Strict-Transport-Security': return 'Man-in-the-Middle Attacks';
            case 'X-Frame-Options': return 'Clickjacking';
            case 'X-Content-Type-Options': return 'MIME Sniffing';
            case 'Referrer-Policy': return 'Data Leakage';
            case 'Permissions-Policy': return 'Unauthorized Feature Usage';
            default: return 'attacks';
        }
    };

    const getSummary = (grade: Grade, findings: HeaderFinding[]) => {
        if (grade === 'A+' || grade === 'A') return "Excellent configuration. Most security headers are present and correctly configured.";
        if (grade === 'B') return "Good start, but some important headers are missing or weak.";
        if (grade === 'F') return "Critical security headers are missing. Site is vulnerable to common client-side attacks.";
        return "Multiple security issues detected. Review the missing headers below.";
    };

    const loadSample = () => {
        const sample = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; object-src 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: no-store, no-cache, must-revalidate`;
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

    const getStatusIcon = (status: HeaderStatus) => {
        switch (status) {
            case 'Pass': return <CheckCircle className="text-green-500" size={18} />;
            case 'Warning': return <AlertTriangle className="text-yellow-500" size={18} />;
            case 'Fail': return <AlertOctagon className="text-red-500" size={18} />;
            case 'Missing': return <AlertOctagon className="text-red-500/50" size={18} />;
        }
    };

    return (
        <ToolPageLayout
            title="HTTP Security Headers Analyzer"
            description="Static analysis of HTTP response headers to detect security misconfigurations."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        An automated auditing tool that checks raw HTTP response headers for missing or misconfigured security controls.
                    </p>
                    <p className="mt-2">
                        It evaluates critical headers like CSP, HSTS, and X-Frame-Options to provide a security score and actionable remediation steps.
                    </p>
                </div>
            }
            disclaimer={DISCLAIMER}
            howItWorks={[
                "Paste your raw HTTP response headers into the text area.",
                "The engine parses and analyzes key security headers (CSP, HSTS, etc).",
                "Get a security grade and detailed remediation advice."
            ]}
        >
            <div className="max-w-7xl mx-auto space-y-8 min-h-[800px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT PANEL: INPUT */}
                    <Card className="lg:col-span-5 bg-[#0A0A0A] border-white/10 h-fit">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Terminal className="text-purple-500" size={18} /> Raw Headers
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadSample}
                                    className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-7"
                                >
                                    <Zap size={12} className="mr-1" /> Load Sample
                                </Button>
                            </div>

                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`HTTP/1.1 200 OK\nContent-Type: text/html...\nContent-Security-Policy: ...`}
                                className="bg-[#111] border-white/10 text-white font-mono text-xs min-h-[400px] resize-none focus:ring-1 focus:ring-purple-500/50 p-4 leading-relaxed tracking-wide custom-scrollbar"
                            />

                            <Button
                                onClick={analyzeHeaders}
                                disabled={isAnalyzing || !input.trim()}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Headers'} <Play size={16} className="ml-2 fill-current" />
                            </Button>

                            <div className="text-[10px] text-white/30 text-center flex items-center justify-center gap-1">
                                <Lock size={10} /> Client-side only. No data is sent to server.
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT PANEL: RESULTS */}
                    <div className="lg:col-span-7 space-y-6">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Grade Card */}
                                    <Card className="bg-[#111] border-white/10 overflow-hidden relative">
                                        <div className={cn("absolute top-0 left-0 w-1 h-full", getGradeBg(result.grade))} />
                                        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                                            <div className={cn("text-7xl font-black tracking-tighter", getGradeColor(result.grade))}>
                                                {result.grade}
                                            </div>
                                            <div className="flex-1 space-y-2 text-center md:text-left">
                                                <h3 className="text-xl font-bold text-white">Security Score: {result.score}/100</h3>
                                                <p className="text-white/60 text-sm leading-relaxed">{result.summary}</p>
                                                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.score}%` }}
                                                        className={cn("h-full", getGradeBg(result.grade))}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Findings List */}
                                    <div className="space-y-4">
                                        {result.findings.map((finding, index) => (
                                            <motion.div
                                                key={finding.header}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className="bg-[#0A0A0A] border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300">
                                                    <CardContent className="p-0">
                                                        {/* Header Row */}
                                                        <div className="p-4 flex items-center justify-between cursor-default">
                                                            <div className="flex items-center gap-3">
                                                                {getStatusIcon(finding.status)}
                                                                <div>
                                                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                                                        {finding.header}
                                                                        {finding.value && (
                                                                            <Badge variant="outline" className="text-[10px] text-white/30 border-white/10 py-0 h-4">Present</Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[10px] text-white/40">{finding.description}</div>
                                                                </div>
                                                            </div>
                                                            <Badge className={cn("text-[10px]",
                                                                finding.status === 'Pass' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                                                                    finding.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                                                                        'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                            )}>
                                                                {finding.status}
                                                            </Badge>
                                                        </div>

                                                        {/* Details Expansion (Always visible if issues/content exist) */}
                                                        <div className="bg-[#111] p-4 border-t border-white/5 space-y-3">
                                                            {finding.issues.length > 0 && (
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider flex items-center gap-1">
                                                                        <AlertTriangle size={10} /> Issues Detected
                                                                    </div>
                                                                    <ul className="text-xs text-red-200/70 list-disc list-inside space-y-0.5 ml-1">
                                                                        {finding.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {/* Value Preview if present */}
                                                            {finding.value && (
                                                                <div className="group/code relative">
                                                                    <div className="text-[9px] uppercase font-bold text-white/20 tracking-wider mb-1">Current Value</div>
                                                                    <pre className="text-[10px] font-mono text-blue-200/60 bg-[#000] p-2 rounded border border-white/5 break-all whitespace-pre-wrap">
                                                                        {finding.value}
                                                                    </pre>
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="absolute top-1 right-1 h-5 w-5 p-0 text-white/20 hover:text-white"
                                                                        onClick={() => copyToClipboard(finding.value || "")}
                                                                    >
                                                                        <Copy size={10} />
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {/* Remediation */}
                                                            {finding.status !== 'Pass' && (
                                                                <div className="bg-purple-500/5 border border-purple-500/10 rounded p-3 mt-2">
                                                                    <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider mb-1 flex items-center gap-1">
                                                                        <Shield size={10} /> Recommendation
                                                                    </div>
                                                                    <p className="text-xs text-purple-200/60 leading-relaxed">
                                                                        {finding.remediation}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>

                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/[0.02] min-h-[500px]">
                                    <div className="w-20 h-20 rounded-full bg-purple-500/5 flex items-center justify-center mb-6">
                                        <Activity className="text-purple-500/40" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                                    <p className="text-white/40 max-w-sm mb-8">
                                        Paste your HTTP headers to generate a comprehensive security report and risk assessment.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 max-w-md w-full opacity-50">
                                        {[
                                            { l: "CSP Analysis", i: <Shield size={14} /> },
                                            { l: "HSTS Checks", i: <Lock size={14} /> },
                                            { l: "Clickjack Defense", i: <Globe size={14} /> },
                                            { l: "Sniff Protection", i: <AlertOctagon size={14} /> }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded border border-white/5 text-xs text-white/60">
                                                {item.i} {item.l}
                                            </div>
                                        ))}
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

export default SecurityHeadersAnalyzer;
