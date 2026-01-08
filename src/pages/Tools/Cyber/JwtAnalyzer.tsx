import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    Key,
    Clock,
    Unlock,
    Code,
    RefreshCw,
    Copy,
    Info,
    AlertOctagon,
    FileJson,
    User,
    Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { cn } from "@/lib/utils";

// --- Types ---

interface JwtAnalysis {
    header: any;
    payload: any;
    score: number;
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
    findings: Finding[];
    isValidStructure: boolean;
}

interface Finding {
    id: string;
    title: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
    remediation: string;
}

// --- Component ---

const JwtAnalyzer = () => {
    const [token, setToken] = useState('');
    const [analysis, setAnalysis] = useState<JwtAnalysis | null>(null);

    // --- Parser Engine ---

    const base64UrlDecode = (str: string) => {
        try {
            // Replace Base64URL characters with Base64 characters
            let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            // Add padding if needed
            const pad = base64.length % 4;
            if (pad) {
                base64 += new Array(5 - pad).join('=');
            }
            return decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) {
            throw new Error("Invalid Base64URL encoding");
        }
    };

    const analyzeToken = () => {
        if (!token.trim()) {
            toast.error("Please enter a token to analyze.");
            return;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            toast.error("Invalid JWT structure. Expected 3 parts (Header.Payload.Signature).");
            setAnalysis({
                header: null,
                payload: null,
                score: 0,
                riskLevel: 'Critical',
                findings: [{
                    id: 'invalid-structure',
                    title: 'Invalid Token Structure',
                    description: 'The input does not match the JWT format (Header.Payload.Signature).',
                    severity: 'Critical',
                    remediation: 'Ensure you have pasted the full token string.'
                }],
                isValidStructure: false
            });
            return;
        }

        let headerObj = {};
        let payloadObj = {};
        const findings: Finding[] = [];
        let score = 100;

        try {
            headerObj = JSON.parse(base64UrlDecode(parts[0]));
            payloadObj = JSON.parse(base64UrlDecode(parts[1]));
        } catch (e) {
            toast.error("Failed to decode token parts. Invalid Base64 or JSON.");
            return;
        }

        // --- Analysis Logic ---

        // 1. Critical: alg: none
        const alg = (headerObj as any).alg;
        if (!alg || alg.toLowerCase() === 'none') {
            score -= 50;
            findings.push({
                id: 'alg-none',
                title: 'Insecure Algorithm (None)',
                description: 'The token uses the "none" algorithm, effectively disabling signature verification. This allows attackers to forge tokens arbitrarily.',
                severity: 'Critical',
                remediation: 'Configure the server to reject "alg: none" and enforce HMAC (HS256) or RSA (RS256) signatures.'
            });
        } else if (alg.toLowerCase().startsWith('hs')) {
            // HMAC is secure if key is strong, but worth noting symmetric key risk
            findings.push({
                id: 'alg-hmac',
                title: 'Symmetric Key Algorithm',
                description: `Using ${alg} (HMAC). Ensure your signing secret is complex (32+ random chars) to prevent brute-force attacks.`,
                severity: 'Info',
                remediation: 'Use a strong, long random secret key.'
            });
        }

        // 2. High: Missing Expiry (exp)
        const exp = (payloadObj as any).exp;
        if (!exp) {
            score -= 30;
            findings.push({
                id: 'missing-exp',
                title: 'No Expiration Time',
                description: 'The token is missing the "exp" claim. Tokens should always have a limited lifetime to mitigate risk if stolen.',
                severity: 'High',
                remediation: 'Add an "exp" claim to limit the token lifetime.'
            });
        } else {
            // Check if expired
            const now = Math.floor(Date.now() / 1000);
            if (exp < now) {
                // Not a security vulnerability per se, but functional issue
                findings.push({
                    id: 'token-expired',
                    title: 'Token Expired',
                    description: `This token expired at ${new Date(exp * 1000).toLocaleString()}.`,
                    severity: 'Medium',
                    remediation: 'Refresh the token.'
                });
            } else if (exp - now > 60 * 60 * 24 * 7) {
                // Long lived > 7 days
                score -= 10;
                findings.push({
                    id: 'long-expiry',
                    title: 'Long Token Lifetime',
                    description: 'The token is valid for more than 7 days. Long-lived access tokens increase the impact of theft.',
                    severity: 'Medium',
                    remediation: 'Reduce access token lifetime and use Refresh Tokens.'
                });
            }
        }

        // 3. Medium: Sensitive Data Heuristics
        const sensitiveKeys = ['password', 'secret', 'ssn', 'credit_card', 'cvv', 'pin', 'hash', 'salt'];
        const keys = Object.keys(payloadObj).map(k => k.toLowerCase());
        const foundSensitive = keys.filter(k => sensitiveKeys.some(s => k.includes(s)));

        if (foundSensitive.length > 0) {
            score -= 20;
            findings.push({
                id: 'sensitive-data',
                title: 'Potential Sensitive Data',
                description: `The payload contains keys that suggest sensitive data: ${foundSensitive.join(', ')}. JWTs are not encrypted by default and can be read by anyone.`,
                severity: 'High',
                remediation: 'Remove sensitive data from the payload. Use opaque references (IDs) instead.'
            });
        }

        // 4. Low: Missing Standard Claims
        if (!(payloadObj as any).sub) {
            findings.push({
                id: 'missing-sub',
                title: 'Missing Subject (sub)',
                description: 'The "sub" claim identifies the principal. It is recommended for tracking user identity.',
                severity: 'Low',
                remediation: 'Include the "sub" claim.'
            });
        }

        // Calculate Grade
        score = Math.max(0, Math.min(100, score));
        let riskLevel: JwtAnalysis['riskLevel'] = 'Safe';

        if (findings.some(f => f.severity === 'Critical')) riskLevel = 'Critical';
        else if (findings.some(f => f.severity === 'High')) riskLevel = 'High';
        else if (findings.some(f => f.severity === 'Medium')) riskLevel = 'Medium';
        else if (findings.some(f => f.severity === 'Low')) riskLevel = 'Low';

        if (score === 100 && findings.length === 0) {
            findings.push({
                id: 'good-token',
                title: 'No Obvious Issues',
                description: 'The token structure and claims appear to follow best practices.',
                severity: 'Info',
                remediation: 'Ensure the signature is verified securely on the backend.'
            });
        }

        setAnalysis({
            header: headerObj,
            payload: payloadObj,
            score,
            riskLevel,
            findings,
            isValidStructure: true
        });

        toast.success("Token decoded successfully!");
    };

    const loadSample = (type: 'secure' | 'danger') => {
        let sample = '';
        if (type === 'secure') {
            // Header: {"alg": "HS256", "typ": "JWT"}
            // Payload: {"sub": "1234567890", "name": "John Doe", "iat": 1516239022, "exp": 9999999999}
            sample = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature_placeholder';
        } else if (type === 'danger') {
            // Header: {"alg": "none", "typ": "JWT"}
            // Payload: {"sub": "user", "admin": true, "password": "plaintextpassword"}
            // Encoded: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiYWRtaW4iOnRydWUsInBhc3N3b3JkIjoicGxhaW50ZXh0cGFzc3dvcmQifQ.
            sample = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiYWRtaW4iOnRydWUsInBhc3N3b3JkIjoicGxhaW50ZXh0cGFzc3dvcmQifQ.';
        }
        setToken(sample);
        setAnalysis(null);
    };

    // --- Helpers ---

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

    const copyJSON = (data: any) => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        toast.success("JSON copied to clipboard");
    };

    return (
        <ToolPageLayout
            title="JWT Token Analyzer"
            description="Decode, inspect, and analyze JSON Web Tokens for security flaws without server interaction."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        Decode and inspect JSON Web Tokens (JWTs) to debug authentication issues and verify claims.
                        Checks for security flaws like 'alg: none' or expired timestamps.
                    </p>
                    <p className="mt-2">
                        Entirely client-side: your tokens are never sent to our servers, ensuring your sensitive session data remains private.
                    </p>
                </div>
            }
            howItWorks={[
                "Paste an encoded JWT string (Header.Payload.Signature).",
                "The tool decodes the Base64URL sections.",
                "It performs a static security audit on claims and headers.",
                "View the decoded JSON and risk analysis report."
            ]}
            disclaimer="Tokens are decoded client-side. We do not validate signatures against your server's secret."
        >
            <div className="max-w-7xl mx-auto space-y-8 min-h-[800px]">

                {/* Input Section */}
                <Card className="bg-[#0A0A0A] border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="text-pink-500" /> Token Input
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Paste your JWT (eyJ...)"
                            className="font-mono bg-black/50 border-white/10 h-12"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={analyzeToken}
                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold"
                            >
                                <Shield className="mr-2 h-4 w-4" /> Decode & Analyze
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => loadSample('secure')} className="text-xs border-green-500/20 text-green-400 hover:bg-green-500/10">
                                Load Secure Sample
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => loadSample('danger')} className="text-xs border-red-500/20 text-red-400 hover:bg-red-500/10">
                                Load Vulnerable Sample
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Results */}
                <AnimatePresence mode="wait">
                    {analysis && analysis.isValidStructure ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Col: Decoded Data */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Header */}
                                <Card className="bg-[#111] border-white/5 relative group">
                                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => copyJSON(analysis.header)}>
                                            <Copy size={14} />
                                        </Button>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                            <Code size={14} /> Header
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="text-xs md:text-sm font-mono text-red-200/80 overflow-x-auto p-4 bg-black/40 rounded-lg border border-red-500/10">
                                            {JSON.stringify(analysis.header, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>

                                {/* Payload */}
                                <Card className="bg-[#111] border-white/5 relative group">
                                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => copyJSON(analysis.payload)}>
                                            <Copy size={14} />
                                        </Button>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileJson size={14} /> Payload
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="text-xs md:text-sm font-mono text-purple-200/80 overflow-x-auto p-4 bg-black/40 rounded-lg border border-purple-500/10">
                                            {JSON.stringify(analysis.payload, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>

                                <div className="text-xs text-white/30 italic text-center">
                                    * Signature verification is not performed client-side to protect your secrets.
                                </div>
                            </div>

                            {/* Right Col: Analysis & Risk */}
                            <div className="space-y-6">
                                {/* Score Card */}
                                <Card className="bg-[#0A0A0A] border-white/10 overflow-hidden relative">
                                    <div className={`absolute top-0 left-0 w-2 h-full ${analysis.riskLevel === 'Critical' ? 'bg-red-500' : analysis.riskLevel === 'High' ? 'bg-orange-500' : analysis.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-lg font-medium text-white/80">Security Audit</h3>
                                            </div>
                                            <Badge variant="outline" className={`px-4 py-1 text-sm font-bold ${getRiskColor(analysis.riskLevel)}`}>
                                                {analysis.riskLevel.toUpperCase()} RISK
                                            </Badge>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/50">Algorithm</span>
                                                <span className="font-mono text-white">{(analysis.header as any).alg || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/50">Type</span>
                                                <span className="font-mono text-white">{(analysis.header as any).typ || 'JWT'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                                                <span className="text-white/50">Expires At</span>
                                                <span className="font-mono text-white text-right max-w-[150px] truncate">
                                                    {(analysis.payload as any).exp ? new Date((analysis.payload as any).exp * 1000).toLocaleTimeString() : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Findings */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Risk Indicators</h3>
                                    {analysis.findings.length === 0 && (
                                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex gap-3">
                                            <CheckCircle className="shrink-0" />
                                            <div>Standard configuration detected. Ensure backend validation is robust.</div>
                                        </div>
                                    )}
                                    {analysis.findings.map(finding => (
                                        <Card key={finding.id} className="bg-[#111] border-white/5">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5">
                                                        {finding.severity === 'Critical' && <AlertOctagon className="text-red-500 h-4 w-4" />}
                                                        {finding.severity === 'High' && <AlertTriangle className="text-orange-500 h-4 w-4" />}
                                                        {finding.severity === 'Medium' && <AlertTriangle className="text-yellow-500 h-4 w-4" />}
                                                        {(finding.severity === 'Low' || finding.severity === 'Info') && <Info className="text-blue-500 h-4 w-4" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-bold text-white">{finding.title}</div>
                                                        <div className="text-xs text-white/60 leading-relaxed">{finding.description}</div>
                                                        <div className="text-[10px] text-green-400/80 font-mono mt-2 pt-2 border-t border-white/5">
                                                            Fix: {finding.remediation}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]"
                        >
                            <div className="bg-pink-500/10 p-4 rounded-full mb-6">
                                <Key className="h-12 w-12 text-pink-500/50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Decode</h3>
                            <p className="text-white/40 max-w-sm">
                                Paste a JWT above to dissect its header and payload, and check for common security pitfalls.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ToolPageLayout>
    );
};

export default JwtAnalyzer;
