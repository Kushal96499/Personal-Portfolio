import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Lock,
    Unlock,
    Globe,
    Code,
    RefreshCw,
    Copy,
    Info,
    AlertOctagon,
    Server,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { cn } from "@/lib/utils";

// --- Types ---

interface CorsAnalysis {
    score: number;
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
    findings: Finding[];
    origin: string | null;
    credentials: boolean | null;
    methods: string[];
    headers: string[];
}

interface Finding {
    id: string;
    title: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
    remediation: string;
}

// --- Component ---

const CorsMisconfigAnalyzer = () => {
    const [input, setInput] = useState('');
    const [analysis, setAnalysis] = useState<CorsAnalysis | null>(null);

    // --- Parser & Analyzer ---

    const analyzeHeaders = () => {
        if (!input.trim()) {
            toast.error("Please enter headers to analyze.");
            return;
        }

        const lines = input.split('\n');
        const headers: Record<string, string> = {};

        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const value = parts.slice(1).join(':').trim();
                headers[key] = value;
            }
        });

        const acaOrigin = headers['access-control-allow-origin'] || null;
        const acaCredentials = headers['access-control-allow-credentials']?.toLowerCase() === 'true';
        const acaMethods = headers['access-control-allow-methods']?.split(',').map(m => m.trim().toUpperCase()) || [];
        const acaHeaders = headers['access-control-allow-headers']?.split(',').map(h => h.trim()) || [];

        const findings: Finding[] = [];
        let score = 100;

        // 1. Critical: Wildcard Origin + Credentials
        if (acaOrigin === '*' && acaCredentials) {
            score -= 50; // Use a large deduction but cap at 0 later
            findings.push({
                id: 'wildcard-creds',
                title: 'Wildcard Origin with Credentials',
                description: 'The server allows any origin ("*") and supports credentials. This is a contradictory configuration often blocked by browsers, but indicates a severe misunderstanding of CORS logic.',
                severity: 'Critical',
                remediation: 'Do not use "*" with "Access-Control-Allow-Credentials: true". Specify exact trusted origins.'
            });
        }

        // 2. High: Null Origin
        if (acaOrigin === 'null') {
            score -= 40;
            findings.push({
                id: 'null-origin',
                title: 'Null Origin Allowed',
                description: 'The origin "null" is allowed. This allows sandboxed iframes or local files to access the resource, bypassing origin checks.',
                severity: 'High',
                remediation: 'Never whitelist the "null" origin. Check your server configuration middleware.'
            });
        }

        // 3. High: Wildcard Origin (Public)
        if (acaOrigin === '*' && !acaCredentials) {
            score -= 10; // Warning level deduction
            findings.push({
                id: 'wildcard-public',
                title: 'Unrestricted Public Access',
                description: 'Access is allowed from any origin provided credentials are NOT sent. This is acceptable for public APIs but dangerous for private data.',
                severity: 'Medium', // Downgraded to Medium as it's valid for public APIs
                remediation: 'Ensure this endpoint is intended to be completely public. If not, restrict via whitelist.'
            });
        }

        // 4. Medium: Permissive Methods
        const riskyMethods = ['PUT', 'DELETE', 'PATCH'];
        const foundRisky = acaMethods.filter(m => riskyMethods.includes(m));
        if (foundRisky.length > 0) {
            score -= 15;
            findings.push({
                id: 'risky-methods',
                title: 'Permissive HTTP Methods',
                description: `The methods ${foundRisky.join(', ')} are allowed. Ensure state-changing operations are strictly authenticated.`,
                severity: 'Medium',
                remediation: 'Verify that these methods are required and properly secured with "Access-Control-Allow-Methods".'
            });
        }

        // 5. Info: Dynamic Reflection Check (Heuristic)
        // If we can't detect dynamic reflection client-side without sending requests, we warn about the concept if not specific.
        if (acaOrigin && acaOrigin !== '*' && acaOrigin !== 'null' && !acaOrigin.startsWith('http')) {
            // Heuristic for regex-based patterns or non-standard values
            findings.push({
                id: 'malformed-origin',
                title: 'Potentially Malformed Origin',
                description: `The origin value "${acaOrigin}" does not look like a standard URL.`,
                severity: 'Low',
                remediation: 'Ensure the origin is a valid URI.'
            });
        }

        // 6. Good Config: Specific Origin + Creds
        if (acaOrigin && acaOrigin !== '*' && acaOrigin !== 'null' && acaCredentials) {
            findings.push({
                id: 'secure-creds',
                title: 'Secure Credentials Config',
                description: 'Explicit origin with credentials allowed. This is the correct way to handle authenticated cross-origin requests.',
                severity: 'Info',
                remediation: 'Maintain this strict whitelisting.'
            });
        }

        // Calculate Grade
        score = Math.max(0, Math.min(100, score));
        let riskLevel: CorsAnalysis['riskLevel'] = 'Safe';

        if (findings.some(f => f.severity === 'Critical')) riskLevel = 'Critical';
        else if (findings.some(f => f.severity === 'High')) riskLevel = 'High';
        else if (findings.some(f => f.severity === 'Medium')) riskLevel = 'Medium';
        else if (findings.some(f => f.severity === 'Low')) riskLevel = 'Low';

        // Override for purely safe results
        if (score === 100 && findings.length === 0) {
            findings.push({
                id: 'no-cors',
                title: 'No CORS Headers Found',
                description: 'No Access-Control-* headers were detected. This usually means SOP applies (safest).',
                severity: 'Info',
                remediation: 'If cross-origin access is needed, add specific headers.'
            });
        }

        setAnalysis({
            score,
            riskLevel,
            findings,
            origin: acaOrigin,
            credentials: acaCredentials,
            methods: acaMethods,
            headers: acaHeaders
        });

        toast.success("Analysis complete!");
    };

    const loadSample = (type: 'secure' | 'critical' | 'public') => {
        let sample = '';
        if (type === 'secure') {
            sample = `Access-Control-Allow-Origin: https://app.example.com\nAccess-Control-Allow-Credentials: true\nAccess-Control-Allow-Methods: GET, POST\nAccess-Control-Allow-Headers: Content-Type, Authorization`;
        } else if (type === 'critical') {
            sample = `Access-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true\nAccess-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`;
        } else if (type === 'public') {
            sample = `Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET\nAccess-Control-Max-Age: 3600`;
        }
        setInput(sample);
        setAnalysis(null); // Reset previous analysis to encourage re-clicking analyze
    };

    // --- Render Helpers ---

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-500";
        if (score >= 70) return "text-yellow-500";
        return "text-red-500";
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critical': return "bg-red-500/20 text-red-500 border-red-500/50";
            case 'High': return "bg-orange-500/20 text-orange-500 border-orange-500/50";
            case 'Medium': return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
            case 'Low': return "bg-blue-500/20 text-blue-500 border-blue-500/50";
            default: return "bg-green-500/20 text-green-500 border-green-500/50";
        }
    };

    return (
        <ToolPageLayout
            title="CORS Misconfiguration Analyzer"
            description="Static analysis of Cross-Origin Resource Sharing headers for security vulnerabilities."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        CORS (Cross-Origin Resource Sharing) policies control which external sites can access your API.
                        Misconfigurations here can lead to massive data breaches.
                    </p>
                    <p className="mt-2">
                        This analyzer checks your <code>Access-Control-*</code> headers for dangerous patterns like wildcard origins paired with credentials or unrestricted public access to private data.
                    </p>
                </div>
            }
            disclaimer="This tool performs static analysis only and does not perform real attacks."
            howItWorks={[
                "Paste your HTTP response headers (e.g. from Burp Suite or DevTools).",
                "The tool identifies Access-Control headers.",
                "It applies rule-based logic to find contradictions or insecure defaults.",
                "Review the color-coded risk report and remediation steps."
            ]}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">

                {/* LEFT COLUMN: Input */}
                <div className="space-y-6">
                    <Card className="bg-[#0A0A0A] border-white/10 h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="text-purple-400" /> Header Input
                            </CardTitle>
                            <CardDescription>
                                Paste your raw HTTP response headers here. We specifically look for <code>Access-Control-*</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-4">
                            <Textarea
                                placeholder={`Access-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true\n...`}
                                className="flex-1 font-mono text-xs bg-black/50 border-white/10 min-h-[300px] resize-none focus:ring-purple-500/50"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />

                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" size="sm" onClick={() => loadSample('secure')} className="text-xs border-green-500/20 text-green-400 hover:bg-green-500/10">
                                    Load Secure
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => loadSample('public')} className="text-xs border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                                    Load Public API
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => loadSample('critical')} className="text-xs border-red-500/20 text-red-400 hover:bg-red-500/10">
                                    Load Vulnerable
                                </Button>
                            </div>

                            <Button
                                onClick={analyzeHeaders}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold"
                            >
                                <Shield className="mr-2 h-4 w-4" /> Analyze Configuration
                            </Button>

                            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 flex items-start gap-3">
                                <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-200/70 leading-relaxed">
                                    This tool performs client-side static analysis only. It does not send requests to your server or validate dynamic reflection behavior.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Results */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {analysis ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Score Card */}
                                <Card className="bg-[#0A0A0A] border-white/10 overflow-hidden relative">
                                    <div className={`absolute top-0 left-0 w-2 h-full ${analysis.score > 80 ? 'bg-green-500' : analysis.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-lg font-medium text-white/80">Security Assessment</h3>
                                                <div className="text-sm text-white/40 mt-1">Based on static rules</div>
                                            </div>
                                            <Badge variant="outline" className={`px-4 py-1 text-sm font-bold ${getRiskColor(analysis.riskLevel)}`}>
                                                {analysis.riskLevel.toUpperCase()} RISK
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="text-4xl font-black text-white">
                                                {analysis.score}<span className="text-base text-white/30 font-normal">/100</span>
                                            </div>
                                            <div className="h-10 w-[1px] bg-white/10" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-white/70">
                                                    <Server size={14} /> Origin: <span className="font-mono text-white">{analysis.origin || 'None'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-white/70">
                                                    {analysis.credentials ? <Unlock size={14} className="text-red-400" /> : <Lock size={14} className="text-green-400" />}
                                                    Credentials: <span className={analysis.credentials ? "text-red-400" : "text-green-400"}>{analysis.credentials ? "Allowed" : "Blocked"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Findings List */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Detailed Findings</h3>
                                    {analysis.findings.length === 0 && (
                                        <Card className="bg-green-500/5 border-green-500/20">
                                            <CardContent className="p-6 flex items-center gap-4">
                                                <CheckCircle className="h-8 w-8 text-green-500" />
                                                <div>
                                                    <h4 className="text-green-400 font-bold">No Issues Detected</h4>
                                                    <p className="text-green-300/70 text-sm">The provided configuration appears to follow standard best practices.</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {analysis.findings.map((finding) => (
                                        <Card key={finding.id} className="bg-[#111] border-white/5 hover:border-white/10 transition-colors">
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {finding.severity === 'Critical' && <AlertOctagon className="text-red-500 h-5 w-5" />}
                                                            {finding.severity === 'High' && <AlertTriangle className="text-orange-500 h-5 w-5" />}
                                                            {finding.severity === 'Medium' && <AlertTriangle className="text-yellow-500 h-5 w-5" />}
                                                            {(finding.severity === 'Low' || finding.severity === 'Info') && <Info className="text-blue-500 h-5 w-5" />}
                                                            <h4 className="font-semibold text-white text-sm">{finding.title}</h4>
                                                        </div>
                                                        <p className="text-sm text-white/60">{finding.description}</p>

                                                        <div className="pt-3 mt-3 border-t border-white/5">
                                                            <div className="flex items-center gap-2 text-xs font-mono text-green-400/80 bg-green-900/10 p-2 rounded">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Fix: {finding.remediation}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]"
                            >
                                <div className="bg-blue-500/10 p-4 rounded-full mb-6">
                                    <Globe className="h-12 w-12 text-blue-500/50" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                                <p className="text-white/40 max-w-sm">
                                    Paste your HTTP headers on the left or load a sample to see the security breakdown.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </ToolPageLayout>
    );
};

export default CorsMisconfigAnalyzer;
