import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Shield, AlertTriangle, Zap, Terminal,
    FileCode, Globe, CheckCircle, Info, Copy,
    ChevronRight, Lock, Unlock, Database, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// --- Types ---
interface ParamRisk {
    key: string;
    description: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    category: 'IDOR' | 'SSRF' | 'RCE' | 'LFI' | 'Info' | 'Auth';
}

interface AnalysisResult {
    existingParams: Record<string, string>;
    suggestedParams: ParamRisk[];
    riskScore: 'Low' | 'Medium' | 'High';
    riskExplanation: string;
}

// --- Data: Common Pentesting Parameters (Educational) ---
const COMMON_DISCOVERY_PARAMS: ParamRisk[] = [
    { key: 'debug', description: 'Often enables verbose error messages or dev mode.', riskLevel: 'Medium', category: 'Info' },
    { key: 'admin', description: 'May trigger administrative access or login prompts.', riskLevel: 'High', category: 'Auth' },
    { key: 'test', description: 'Used for testing features, might bypass checks.', riskLevel: 'Low', category: 'Info' },
    { key: 'id', description: 'Classic vector for Insecure Direct Object References (IDOR).', riskLevel: 'High', category: 'IDOR' },
    { key: 'redirect', description: 'Common vector for Open Redirects or SSRF.', riskLevel: 'Medium', category: 'SSRF' },
    { key: 'file', description: 'Target for Local/Remote File Inclusion (LFI/RFI).', riskLevel: 'High', category: 'LFI' },
    { key: 'cmd', description: 'Potential entry point for Command Injection (RCE).', riskLevel: 'High', category: 'RCE' },
    { key: 'user', description: 'Can be fuzzed to enumerate users or escalate privileges.', riskLevel: 'Medium', category: 'Auth' },
    { key: 'role', description: 'Mass Assignment vulnerability target (e.g. role=admin).', riskLevel: 'High', category: 'Auth' },
    { key: 'source', description: 'Might reveal source code if handled improperly.', riskLevel: 'Medium', category: 'Info' },
    { key: 'url', description: 'SSRF target; server might fetch this URL.', riskLevel: 'High', category: 'SSRF' },
    { key: 'api', description: 'Might expose hidden API versions or endpoints.', riskLevel: 'Low', category: 'Info' },
    { key: 'backup', description: 'Could point to backup files or features.', riskLevel: 'Medium', category: 'Info' },
    { key: 'shell', description: 'Highly suspicious; often checked for backdoor access.', riskLevel: 'High', category: 'RCE' },
    { key: 'config', description: 'May expose configuration files or settings.', riskLevel: 'High', category: 'Info' }
];

const DISCLAIMER = "This tool performs static analysis and educational parameter suggestion only. No active scanning, fuzzing, or brute-forcing is performed against the target. Always obtain permission before testing non-owned targets.";

const ParameterDiscovery = () => {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const trySample = () => {
        const sample = "https://shop.example.com/products?id=4052&view=list&ref=social";
        setUrl(sample);
        setTimeout(() => performAnalysis(sample), 100);
    };

    const performAnalysis = (inputUrl: string = url) => {
        if (!inputUrl.trim()) return;
        setIsAnalyzing(true);
        setResult(null);

        // Normalize URL Protocol
        let target = inputUrl.trim();
        if (!/^https?:\/\//i.test(target)) {
            target = `https://${target}`;
        }

        setTimeout(() => {
            try {
                const urlObj = new URL(target);
                const params: Record<string, string> = {};
                urlObj.searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                // Analyze Risk of Existing Params
                let highRiskCount = 0;
                let mediumRiskCount = 0;

                Object.keys(params).forEach(key => {
                    const lowerKey = key.toLowerCase();
                    const match = COMMON_DISCOVERY_PARAMS.find(p => p.key === lowerKey);
                    if (match) {
                        if (match.riskLevel === 'High') highRiskCount++;
                        if (match.riskLevel === 'Medium') mediumRiskCount++;
                    }
                });

                let riskScore: 'Low' | 'Medium' | 'High' = 'Low';
                let explanation = "Standard parameters detected.";

                if (highRiskCount > 0) {
                    riskScore = 'High';
                    explanation = "URL contains critical parameters commonly targeted for IDOR or RCE.";
                } else if (mediumRiskCount > 0) {
                    riskScore = 'Medium';
                    explanation = "URL contains interesting parameters that warrant further investigation.";
                } else if (Object.keys(params).length === 0) {
                    explanation = "No parameters found. Fuzzing recommended.";
                }

                setResult({
                    existingParams: params,
                    suggestedParams: COMMON_DISCOVERY_PARAMS,
                    riskScore,
                    riskExplanation: explanation
                });

            } catch (e) {
                toast.error("Invalid URL format");
            } finally {
                setIsAnalyzing(false);
            }
        }, 1200);
    };

    // --- UI Helpers ---
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    // --- Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <ToolPageLayout
            title="Parameter Discovery Tool"
            description="Static analyzer for identifying and suggesting sensitive URL discovery parameters."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        A reconnaissance assistant that helps identify potentially sensitive or hidden URL parameters.
                        It analyzes your target URL against a database of common query parameters used for fuzzing and discovery.
                    </p>
                    <p className="mt-2">
                        This tool is entirely passive and client-side—it does not send traffic to the target, making it safe for initial scoping.
                    </p>
                </div>
            }
            disclaimer={DISCLAIMER}
            howItWorks={[
                "Enter a target URL to identify existing parameters.",
                "The engine analyzes current parameters for keyword risks.",
                "We provide a curated list of 'Top Discovery Parameters' to fuzz.",
                "Output is purely educational for manual reconnaissance."
            ]}
        >
            <div className="max-w-6xl mx-auto space-y-8 min-h-[600px]">

                {/* Input Section */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
                        <Terminal className="w-32 h-32 text-white/5" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-3 h-3" /> Target Endpoint
                            </label>
                            <Button
                                variant="ghost" size="sm" onClick={trySample}
                                className="text-xs text-white/50 hover:text-white h-auto p-0 hover:bg-transparent"
                            >
                                Not sure? Try a sample
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="https://example.com/page..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-black/40 border-white/10 text-lg h-14 pl-4 font-mono text-blue-100"
                                onKeyDown={(e) => e.key === 'Enter' && performAnalysis()}
                            />
                            <Button
                                onClick={() => performAnalysis()}
                                disabled={isAnalyzing}
                                className={cn(
                                    "h-14 px-8 text-lg font-medium transition-all duration-300 min-w-[140px]",
                                    isAnalyzing ? "bg-purple-900/50 text-purple-200" : "bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                )}
                            >
                                {isAnalyzing ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white" /> : "Discover"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <AnimatePresence mode="wait">
                    {result && !isAnalyzing && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: 20 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Left Col: Detected Params & Summary */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Detected Parameters Card */}
                                <motion.div variants={itemVariants} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                                        <h3 className="font-semibold text-white/90 flex items-center gap-2">
                                            <FileCode className="w-4 h-4 text-green-400" /> Detected Parameters
                                        </h3>
                                        <Badge variant={Object.keys(result.existingParams).length > 0 ? "secondary" : "outline"} className="text-xs">
                                            {Object.keys(result.existingParams).length} Found
                                        </Badge>
                                    </div>
                                    <div className="p-0">
                                        {Object.keys(result.existingParams).length > 0 ? (
                                            <div className="divide-y divide-white/5">
                                                {Object.entries(result.existingParams).map(([key, value]) => (
                                                    <div key={key} className="p-4 hover:bg-white/[0.02] flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="font-mono text-sm text-green-300">{key}</div>
                                                            <div className="text-white/20">=</div>
                                                            <div className="font-mono text-sm text-gray-400 max-w-[200px] truncate" title={value}>{value}</div>
                                                        </div>
                                                        <Button
                                                            variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => copyToClipboard(`${key}=${value}`)}
                                                        >
                                                            <Copy className="w-3 h-3 text-white/50" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                No query parameters found in the provided URL.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Educational Suggestions Grid */}
                                <motion.div variants={itemVariants} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                                        <h3 className="font-semibold text-white/90 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-400" /> Discovery Suggestions
                                        </h3>
                                        <span className="text-xs text-white/40">Common Fuzzing Targets</span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.suggestedParams.map((param, i) => (
                                            <div
                                                key={i}
                                                className="bg-[#161616] p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-2 group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                                                            ?{param.key}=
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] h-5 px-1.5 border-white/10",
                                                                param.riskLevel === 'High' ? "text-red-400 bg-red-500/10" :
                                                                    param.riskLevel === 'Medium' ? "text-yellow-400 bg-yellow-500/10" : "text-blue-400 bg-blue-500/10"
                                                            )}
                                                        >
                                                            {param.category}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                        onClick={() => copyToClipboard(param.key)}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{param.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                            </div>

                            {/* Right Col: Risk Score & Actions */}
                            <div className="lg:col-span-4 space-y-6">

                                {/* Risk Summary Card */}
                                <motion.div variants={itemVariants} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden relative">
                                    <div className={cn(
                                        "absolute inset-0 opacity-10 pointer-events-none",
                                        result.riskScore === 'High' ? "bg-red-600" :
                                            result.riskScore === 'Medium' ? "bg-yellow-500" : "bg-green-500"
                                    )} />
                                    <div className="p-6 flex flex-col items-center text-center relative z-10">
                                        <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Exposure Risk</div>
                                        <div className={cn(
                                            "text-4xl font-black mb-4",
                                            result.riskScore === 'High' ? "text-red-500" :
                                                result.riskScore === 'Medium' ? "text-yellow-400" : "text-green-400"
                                        )}>
                                            {result.riskScore.toUpperCase()}
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">
                                            {result.riskExplanation}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Quick Actions */}
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-12 bg-[#161616] border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
                                        onClick={() => {
                                            const params = result.suggestedParams.map(p => p.key);
                                            copyToClipboard(params.join('\n'));
                                        }}
                                    >
                                        <span className="flex items-center gap-2"><Database className="w-4 h-4" /> Copy All Suggestions</span>
                                        <Copy className="w-4 h-4 opacity-50" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-12 bg-[#161616] border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
                                        onClick={() => {
                                            const params = result.suggestedParams.map(p => `${p.key}=TEST`).join('&');
                                            copyToClipboard(`?${params}`);
                                        }}
                                    >
                                        <span className="flex items-center gap-2"><Server className="w-4 h-4" /> Copy as Query String</span>
                                        <Copy className="w-4 h-4 opacity-50" />
                                    </Button>
                                    <p className="text-[10px] text-center text-white/30 pt-2">
                                        Use these wordlists with tools like FFUF or Burp Suite.
                                    </p>
                                </motion.div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ToolPageLayout>
    );
};

export default ParameterDiscovery;
