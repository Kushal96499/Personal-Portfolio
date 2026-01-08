import React, { useState } from 'react';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertTriangle, CheckCircle, Search, Shield, Globe, Terminal,
    AlertOctagon, FileCode, Hash, Info, Bug, Lock,
    ChevronRight, ExternalLink, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RiskFactor {
    id: string;
    category: 'Low' | 'Medium' | 'High';
    title: string;
    description: string;
    potentialVuln: string; // e.g., "IDOR", "LFI", "Open Redirect"
}

interface AnalysisResult {
    protocol: string;
    rootDomain: string;
    subdomain: string;
    path: string;
    extension: string;
    params: Record<string, string>;
    fragment: string;
    riskScore: 'Low' | 'Medium' | 'High';
    riskFactors: RiskFactor[];
    confidence: 'High' | 'Medium'; // Based on how strong the matches are
}

const AttackSurfaceAnalyzer = () => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const trySample = () => {
        setUrl('http://admin.test-target.com/dashboard.php?user_id=105&redirect=google.com&debug=true');
        setTimeout(() => handleAnalyze('http://admin.test-target.com/dashboard.php?user_id=105&redirect=google.com&debug=true'), 100);
    };

    const handleAnalyze = (inputUrl = url) => {
        let target = inputUrl.trim();
        if (!target) {
            toast.error("Please enter a URL to analyze");
            return;
        }

        // 1. Smart URL Handling
        if (!/^https?:\/\//i.test(target)) {
            target = `https://${target}`;
        }

        // Basic Regex Validation for domain structure (rough check)
        const domainRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?(#.*)?$/;
        if (!domainRegex.test(target)) {
            toast.error("Invalid Domain Format. Please enter a valid URL.");
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        // Simulate "Processing" time for effect
        setTimeout(() => {
            try {
                const parsedUrl = new URL(target);

                // 2. Advanced Parsing
                const protocol = parsedUrl.protocol.replace(':', '');
                const fullHost = parsedUrl.hostname;
                const hostParts = fullHost.split('.');

                // Simple heuristic for root vs subdomain (works for standard com/net/org etc)
                // For complex TLDs like co.uk this is an approximation, but acceptable for client-side heuristic tool
                let rootDomain = fullHost;
                let subdomain = '';

                if (hostParts.length > 2) {
                    rootDomain = hostParts.slice(-2).join('.');
                    subdomain = hostParts.slice(0, -2).join('.');
                } else {
                    rootDomain = fullHost;
                }

                const path = parsedUrl.pathname;
                const extension = path.includes('.') ? path.split('.').pop() || '' : '';
                const params: Record<string, string> = {};
                parsedUrl.searchParams.forEach((value, key) => {
                    params[key] = value;
                });
                const fragment = parsedUrl.hash.replace('#', '');

                // 3. Risk Engine (Heuristic)
                const risks: RiskFactor[] = [];
                let highImpactCount = 0;
                let mediumImpactCount = 0;

                // Protocol Check
                if (protocol === 'http') {
                    risks.push({
                        id: 'protocol',
                        category: 'Medium',
                        title: 'Unencrypted Protocol',
                        description: 'Using HTTP allows traffic interception (MitM).',
                        potentialVuln: 'Information Dislcosure'
                    });
                    mediumImpactCount++;
                }

                // Subdomain Check
                if (['admin', 'dev', 'test', 'staging', 'beta', 'internal'].includes(subdomain)) {
                    risks.push({
                        id: 'subdomain',
                        category: 'High',
                        title: 'Sensitive Subdomain',
                        description: `The subdomain '${subdomain}' often hosts pre-production or sensitive interfaces.`,
                        potentialVuln: 'Admin Panel Exposure'
                    });
                    highImpactCount++;
                }

                // Path Keywords
                const sensitivePaths = ['admin', 'login', 'dashboard', 'config', 'auth', 'user', 'db', 'backup'];
                const sensitiveMatch = sensitivePaths.find(k => path.toLowerCase().includes(k));
                if (sensitiveMatch) {
                    risks.push({
                        id: 'path',
                        category: 'High',
                        title: 'Sensitive Path Segment',
                        description: `URL contains '${sensitiveMatch}', indicating a privileged area.`,
                        potentialVuln: 'Privilege Escalation Risk'
                    });
                    highImpactCount++;
                }

                // Extension Checks
                const riskyExts: Record<string, string> = {
                    'php': 'Legacy/Server-side Scripting (Check for old versions)',
                    'asp': 'Legacy Server (ASP.NET)',
                    'aspx': 'ASP.NET Application',
                    'jsp': 'Java Server Pages',
                    'env': 'Environment File (CRITICAL LEAK)',
                    'bak': 'Backup File (Source Code Leak)',
                    'log': 'Log File (Info Disclosure)',
                    'git': 'Git Repository (Source Code Leak)'
                };
                if (extension && riskyExts[extension.toLowerCase()]) {
                    risks.push({
                        id: 'ext',
                        category: ['env', 'bak', 'git', 'log'].includes(extension) ? 'High' : 'Medium',
                        title: 'Interesting File Extension',
                        description: `File extension .${extension} detected: ${riskyExts[extension.toLowerCase()]}`,
                        potentialVuln: 'Tech Stack Disclosure'
                    });
                    if (['env', 'bak', 'git', 'log'].includes(extension)) highImpactCount += 2;
                    else mediumImpactCount++;
                }

                // Parameter Analysis
                Object.keys(params).forEach(key => {
                    const k = key.toLowerCase();
                    if (['id', 'user_id', 'account', 'pid'].includes(k)) {
                        risks.push({
                            id: `param-${key}`,
                            category: 'High',
                            title: `Direct Object Reference (${key})`,
                            description: `Parameter '${key}' might directly reference database objects.`,
                            potentialVuln: 'IDOR (Insecure Direct Object Reference)'
                        });
                        highImpactCount++;
                    }
                    if (['url', 'redirect', 'next', 'target', 'dest'].includes(k)) {
                        risks.push({
                            id: `param-${key}`,
                            category: 'Medium',
                            title: `Redirection Parameter (${key})`,
                            description: `Parameter '${key}' accepts a URL/path, possibly allowing open redirects.`,
                            potentialVuln: 'Open Redirect / SSRF'
                        });
                        mediumImpactCount++;
                    }
                    if (['file', 'path', 'include', 'doc', 'root'].includes(k)) {
                        risks.push({
                            id: `param-${key}`,
                            category: 'High',
                            title: `File System Reference (${key})`,
                            description: `Parameter '${key}' might control file inclusion or reading.`,
                            potentialVuln: 'LFI / Path Traversal'
                        });
                        highImpactCount++;
                    }
                    if (['cmd', 'exec', 'command', 'func'].includes(k)) {
                        risks.push({
                            id: `param-${key}`,
                            category: 'High',
                            title: `Command Execution Risk (${key})`,
                            description: `Parameter '${key}' suggests command execution capability.`,
                            potentialVuln: 'RCE (Remote Code Execution)'
                        });
                        highImpactCount += 2;
                    }
                    if (['debug', 'test', 'admin'].includes(k)) {
                        risks.push({
                            id: `param-${key}`,
                            category: 'Medium',
                            title: `Debug Parameter (${key})`,
                            description: `Parameter '${key}' is often used for developer shortcuts.`,
                            potentialVuln: 'Security Misconfiguration'
                        });
                        mediumImpactCount++;
                    }
                });

                // Calculate Score
                let finalScore: 'Low' | 'Medium' | 'High' = 'Low';
                if (highImpactCount > 0) finalScore = 'High';
                else if (mediumImpactCount >= 2) finalScore = 'Medium';

                // If it's just HTTP but nothing else, keep it Low/Medium
                if (risks.length === 1 && risks[0].id === 'protocol') finalScore = 'Low';


                setResult({
                    protocol,
                    rootDomain,
                    subdomain,
                    path,
                    extension,
                    params,
                    fragment,
                    riskScore: finalScore,
                    riskFactors: risks,
                    confidence: 'Medium'
                });

            } catch (error) {
                console.error("Url Parse Error", error);
                toast.error("Failed to parse URL. Please check the format.");
            } finally {
                setIsAnalyzing(false);
            }
        }, 800);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const HOW_IT_WORKS = [
        "Enter a target URL (e.g., example.com/login?id=1)",
        "Engine normalizes and parses the URL client-side",
        "Heuristic scanner checks for risky patterns (IDOR, LFI, etc.)",
        "Review the automated Attack Surface Report"
    ];

    return (
        <UniversalToolLayout
            title="Attack Surface Analyzer"
            description="Professional grade client-side URL reconnaissance and risk assessment tool."
            steps={HOW_IT_WORKS}
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        This tool dissects URLs to identify potential security risks without sending any packets to the target.
                        It uses heuristic analysis to detect patterns often associated with vulnerabilities like IDOR, LFI/RFI, and Open Redirects.
                    </p>
                    <p className="mt-2">
                        Designed for security researchers, bug hunters, and developers who need to quickly assess the "attack surface" exposed by a URL structure.
                    </p>
                </div>
            }
            disclaimer="This tool performs static analysis only and does not perform real attacks."
        >
            <div className="flex flex-col items-center justify-start min-h-[800px] max-w-6xl mx-auto w-full space-y-8 p-4">

                {/* Input Section */}
                <div className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Shield className="w-24 h-24 text-white/5" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-semibold text-blue-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Search className="w-3 h-3" /> Target Endpoint
                            </label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={trySample}
                                className="text-xs text-white/50 hover:text-white h-auto p-0 hover:bg-transparent"
                            >
                                Not sure? Try a sample
                            </Button>
                        </div>

                        <div className="flex gap-2 relative">
                            <Input
                                placeholder="Start typing (e.g. example.com)..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-black/40 border-white/10 text-lg h-14 pl-4 focus:border-blue-500/50 transition-all shadow-inner font-mono text-blue-100"
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            />
                            <Button
                                onClick={() => handleAnalyze()}
                                disabled={isAnalyzing}
                                className={cn(
                                    "h-14 px-8 text-lg font-medium transition-all duration-300 min-w-[140px]",
                                    isAnalyzing ? "bg-blue-900/50 text-blue-200" : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                )}
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Scanning</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span>Analyze</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {result && !isAnalyzing && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Left Column: Summary & Structure */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Structure Card */}
                                <motion.div variants={itemVariants} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                                    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="font-semibold text-white/90 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-400" /> Endpoint Structure
                                        </h3>
                                        <span className="text-xs text-white/40 font-mono">parsed_result.json</span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DetailRow label="Protocol" value={result.protocol} isSecure={result.protocol === 'https'} />
                                        <DetailRow label="Root Domain" value={result.rootDomain} />
                                        <DetailRow label="Subdomain" value={result.subdomain || '-'} highlight={!!result.subdomain} />
                                        <DetailRow label="Path" value={result.path} />
                                        <DetailRow label="Extension" value={result.extension || '-'} highlight={['php', 'env', 'bak', 'config'].includes(result.extension)} />
                                        <DetailRow label="Fragment" value={result.fragment || '-'} />
                                    </div>
                                </motion.div>

                                {/* Parameters Analysis */}
                                <motion.div variants={itemVariants} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                                    <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="font-semibold text-white/90 flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-purple-400" /> Parameter Analysis
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className="text-xs bg-white/5 px-2 py-1 rounded text-white/50">{Object.keys(result.params).length} params</span>
                                        </div>
                                    </div>
                                    <div className="p-0">
                                        {Object.entries(result.params).length > 0 ? (
                                            <div className="divide-y divide-white/5">
                                                {Object.entries(result.params).map(([key, value]) => {
                                                    const isRisky = result.riskFactors.some(r => r.id === `param-${key}`);
                                                    return (
                                                        <div key={key} className={cn("px-6 py-3 flex items-start justify-between group hover:bg-white/[0.02]", isRisky && "bg-red-500/[0.03]")}>
                                                            <div className="flex items-center gap-3">
                                                                <span className={cn("font-mono text-sm font-medium", isRisky ? "text-red-400" : "text-blue-300")}>{key}</span>
                                                                <span className="text-white/20">=</span>
                                                                <span className="font-mono text-sm text-gray-400 max-w-[200px] md:max-w-[300px] truncate" title={value}>{value}</span>
                                                            </div>
                                                            {isRisky && (
                                                                <span className="text-[10px] uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20 tracking-wider">Risky</span>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 italic text-sm">No query parameters found in URL.</div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right Column: Risk Engine */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Score Card */}
                                <motion.div variants={itemVariants} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden relative group">
                                    <div className={cn(
                                        "absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500",
                                        result.riskScore === 'High' ? "bg-red-600" :
                                            result.riskScore === 'Medium' ? "bg-yellow-500" : "bg-green-500"
                                    )} />

                                    <div className="p-8 flex flex-col items-center text-center relative z-10">
                                        <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Calculated Risk Level</div>
                                        <div className={cn(
                                            "text-5xl font-black tracking-tighter mb-4",
                                            result.riskScore === 'High' ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                                                result.riskScore === 'Medium' ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" :
                                                    "text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                                        )}>
                                            {result.riskScore}
                                        </div>

                                        <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000",
                                                result.riskScore === 'High' ? "bg-red-500 w-[90%]" :
                                                    result.riskScore === 'Medium' ? "bg-yellow-500 w-[60%]" :
                                                        "bg-green-500 w-[20%]"
                                            )} />
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {result.riskFactors.length === 0 ? (
                                                <Badge text="Clean URL Structure" variant="green" />
                                            ) : (
                                                <Badge text={`${result.riskFactors.length} Risk Factors`} variant={result.riskScore === 'High' ? 'red' : 'yellow'} />
                                            )}
                                            <Badge text="Heuristic Analysis" variant="neutral" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Findings Feed */}
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2 px-1">
                                        <Bug className="w-4 h-4" /> Detected Patterns
                                    </h3>

                                    {result.riskFactors.length > 0 ? (
                                        result.riskFactors.map((risk, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 + (i * 0.1) }}
                                                className="bg-[#161616] border-l-2 border-white/10 p-4 rounded-r-lg hover:bg-white/[0.02] transition-colors relative overflow-hidden"
                                                style={{ borderLeftColor: risk.category === 'High' ? '#ef4444' : '#eab308' }}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase tracking-wider",
                                                        risk.category === 'High' ? "text-red-400" : "text-yellow-400"
                                                    )}>{risk.potentialVuln}</span>
                                                </div>
                                                <h4 className="text-white font-medium text-sm mb-1">{risk.title}</h4>
                                                <p className="text-white/50 text-xs leading-relaxed">{risk.description}</p>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center border border-white/5 rounded-xl bg-white/[0.02]">
                                            <CheckCircle className="w-8 h-8 text-green-500/50 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No suspicious patterns matched.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Disclaimer */}
                <div className="mt-12 text-center border-t border-white/5 pt-8 w-full max-w-2xl">
                    <div className="flex items-center justify-center gap-2 mb-3 text-blue-400/80">
                        <AlertOctagon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Ethical Use Only</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        This tool performs <strong>passive, client-side analysis</strong> only. No packets are sent to the target server.
                        The risk score is accurate based on common naming conventions but does not guarantee the presence of a vulnerability.
                        <br />
                        Always obtain permission before testing targets you do not own.
                    </p>
                </div>
            </div>
        </UniversalToolLayout>
    );
};

const DetailRow = ({ label, value, subValue, highlight, isSecure }: { label: string, value: string, subValue?: string, highlight?: boolean, isSecure?: boolean }) => (
    <div className="bg-black/20 p-3 rounded border border-white/5 flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{label}</span>
        <div className="flex items-center gap-2">
            <span className={cn(
                "font-mono text-sm truncate",
                highlight ? "text-yellow-400" : "text-white/80"
            )} title={value}>
                {value || '-'}
            </span>
            {isSecure !== undefined && (
                isSecure ? <Lock className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3 text-red-500" />
            )}
        </div>
        {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
    </div>
);

const Badge = ({ text, variant }: { text: string, variant: 'red' | 'yellow' | 'green' | 'neutral' }) => {
    const colors = {
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        neutral: "bg-white/5 text-white/40 border-white/10"
    };
    return (
        <span className={cn("px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border", colors[variant])}>
            {text}
        </span>
    );
};

export default AttackSurfaceAnalyzer;
