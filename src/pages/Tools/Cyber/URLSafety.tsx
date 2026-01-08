import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, ShieldAlert, ShieldCheck, Globe, Search,
    ExternalLink, AlertTriangle, Lock, Unlock, Zap,
    Terminal, Activity, Eye, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- Constants ---
const SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".gq", ".tk", ".ml", ".ga", ".cf", ".cn", ".ru", ".work", ".click", ".loan"
];

const SUSPICIOUS_KEYWORDS = [
    "login", "verify", "account", "update", "secure", "banking", "paypal", "apple", "google", "microsoft"
];

const HOW_IT_WORKS = [
    "Enter a URL to analyze its safety.",
    "The tool checks for common phishing patterns (IP addresses, suspicious TLDs, etc.).",
    "It simulates a redirect trace to show the path.",
    "Use external links (VirusTotal, Whois) for deep verification."
];

const DISCLAIMER = "This tool performs client-side heuristic analysis only. It cannot guarantee a URL is safe. Always use caution.";

const URLSafety = () => {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [riskScore, setRiskScore] = useState(0); // 0-100
    const [flags, setFlags] = useState<string[]>([]);
    const [trace, setTrace] = useState<any[]>([]);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const analyzeURL = () => {
        if (!url) return;
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setFlags([]);
        setTrace([]);
        setRiskScore(0);

        // Simulate analysis delay
        setTimeout(() => {
            let score = 0;
            let newFlags = [];
            let cleanUrl = url.toLowerCase();

            if (!cleanUrl.startsWith("http")) {
                cleanUrl = "http://" + cleanUrl;
            }

            try {
                const urlObj = new URL(cleanUrl);
                const hostname = urlObj.hostname;

                // 1. Protocol Check
                if (urlObj.protocol === "http:") {
                    score += 20;
                    newFlags.push("Insecure Protocol (HTTP)");
                }

                // 2. IP Address Check
                const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
                if (ipRegex.test(hostname)) {
                    score += 50;
                    newFlags.push("Host is an IP Address (Suspicious)");
                }

                // 3. Suspicious TLD Check
                const tld = hostname.substring(hostname.lastIndexOf("."));
                if (SUSPICIOUS_TLDS.includes(tld)) {
                    score += 30;
                    newFlags.push(`Suspicious TLD (${tld})`);
                }

                // 4. Length Check
                if (cleanUrl.length > 75) {
                    score += 10;
                    newFlags.push("URL is unusually long");
                }

                // 5. Keyword Check (Phishing)
                SUSPICIOUS_KEYWORDS.forEach(keyword => {
                    if (cleanUrl.includes(keyword) && !hostname.includes(keyword)) {
                        score += 25;
                        newFlags.push(`Suspicious keyword '${keyword}' in path`);
                    }
                });

                // 6. Auth Bypass (@ symbol)
                if (cleanUrl.includes("@")) {
                    score += 40;
                    newFlags.push("Contains '@' (Potential Auth Bypass)");
                }

                // 7. Double Extension
                if (/\.[a-z]{2,4}\.[a-z]{2,4}$/.test(urlObj.pathname)) {
                    score += 30;
                    newFlags.push("Double Extension Detected (e.g. .pdf.exe)");
                }

                // Cap score
                score = Math.min(100, score);
                setRiskScore(score);
                setFlags(newFlags);

                // Simulate Trace
                const simulatedTrace = [
                    { status: 301, url: "http://" + hostname, time: "12ms" },
                    { status: 302, url: "https://" + hostname + "/auth", time: "45ms" },
                    { status: 200, url: cleanUrl, time: "120ms" }
                ];
                setTrace(simulatedTrace);
                setAnalysisComplete(true);

            } catch (e) {
                toast.error("Invalid URL format");
            }
            setIsAnalyzing(false);
        }, 1500);
    };

    const getRiskLevel = () => {
        if (riskScore >= 75) return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500" };
        if (riskScore >= 40) return { label: "SUSPICIOUS", color: "text-orange-500", bg: "bg-orange-500" };
        if (riskScore > 0) return { label: "LOW RISK", color: "text-yellow-500", bg: "bg-yellow-500" };
        return { label: "SAFE", color: "text-green-500", bg: "bg-green-500" };
    };

    const openExternal = (service: string) => {
        if (!url) return;
        let target = "";
        try {
            const hostname = new URL(url.startsWith("http") ? url : "http://" + url).hostname;
            if (service === "virustotal") {
                target = `https://www.virustotal.com/gui/domain/${hostname}`;
            } else if (service === "whois") {
                target = `https://who.is/whois/${hostname}`;
            } else if (service === "google") {
                target = `https://transparencyreport.google.com/safe-browsing/search?url=${hostname}`;
            }
            window.open(target, "_blank");
        } catch (e) {
            toast.error("Invalid URL for external check");
        }
    };

    const risk = getRiskLevel();

    return (
        <ToolPageLayout
            title="URL Safety Analyzer"
            description="Advanced heuristic analysis and phishing detection for URLs."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        A heuristic analysis engine that scans URLs for suspicious patterns, known phishing indicators, and obfuscation techniques.
                    </p>
                    <p className="mt-2">
                        It helps identify potential threats before you click, checking for things like IP-based hosts, deceptive TLDs, and path anomalies.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Input Section */}
                <Card className="border-white/5 bg-[#111111]">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Enter URL to analyze (e.g. http://example.com)..."
                                    className="pl-12 h-14 bg-[#0A0A0A] border-white/10 text-lg font-mono"
                                    onKeyDown={(e) => e.key === "Enter" && analyzeURL()}
                                />
                            </div>
                            <Button
                                onClick={analyzeURL}
                                disabled={isAnalyzing || !url}
                                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
                            >
                                {isAnalyzing ? <Activity className="animate-spin mr-2" /> : <Search className="mr-2" />}
                                Analyze
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <AnimatePresence>
                    {analysisComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {/* Score Card */}
                            <Card className="border-white/5 bg-[#111111] md:col-span-1">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-6 h-full">
                                    <div className="relative">
                                        <ShieldCheck size={80} className={risk.color} />
                                        <div className={`absolute inset-0 blur-2xl opacity-20 ${risk.bg}`} />
                                    </div>
                                    <div>
                                        <div className={`text-4xl font-bold ${risk.color} mb-2`}>{risk.label}</div>
                                        <div className="text-white/40 text-sm uppercase tracking-wider">Risk Assessment</div>
                                    </div>
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-xs text-white/60">
                                            <span>Safety Score</span>
                                            <span>{100 - riskScore}/100</span>
                                        </div>
                                        <Progress value={100 - riskScore} className={`h-2 ${risk.bg}`} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Details Card */}
                            <Card className="border-white/5 bg-[#111111] md:col-span-2">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Activity size={18} className="text-blue-500" /> Analysis Report
                                        </h3>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openExternal('virustotal')} className="text-xs border-white/10 hover:bg-white/5">
                                                VirusTotal <ExternalLink size={10} className="ml-1" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => openExternal('whois')} className="text-xs border-white/10 hover:bg-white/5">
                                                Whois <ExternalLink size={10} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {flags.length === 0 ? (
                                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400">
                                                <Check size={20} />
                                                <span>No specific heuristic flags detected.</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {flags.map((flag, i) => (
                                                    <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                                                        <AlertTriangle size={16} />
                                                        <span>{flag}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <h4 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Terminal size={14} /> Redirect Trace (Simulated)
                                        </h4>
                                        <div className="space-y-2 font-mono text-xs">
                                            {trace.map((hop, i) => (
                                                <div key={i} className="flex items-center gap-4 p-2 rounded bg-[#0A0A0A] border border-white/5">
                                                    <span className="text-blue-500 w-8">{i + 1}</span>
                                                    <Badge variant="outline" className={`${hop.status === 200 ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                                                        {hop.status}
                                                    </Badge>
                                                    <span className="text-white/60 truncate flex-1">{hop.url}</span>
                                                    <span className="text-white/20">{hop.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ToolPageLayout>
    );
};

export default URLSafety;
