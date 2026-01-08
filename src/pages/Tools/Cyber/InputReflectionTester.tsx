import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, AlertTriangle, Code, Terminal, CheckCircle,
    Copy, Info, Lock, Play, Braces, Eye, FileJson,
    AlertOctagon, Globe, Link, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ToolPageLayout from '@/components/ui/ToolPageLayout';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";

// --- Types ---
type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe';
type ConfidenceLevel = 'Certain' | 'High' | 'Medium' | 'Low';
type ContextType = 'html_body' | 'html_attribute' | 'javascript_string' | 'url_parameter';

interface Detection {
    name: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
}

interface AnalysisResult {
    riskLevel: RiskLevel;
    confidence: ConfidenceLevel;
    score: number; // 0-100
    detections: Detection[];
    explanation: string;
    reflectedCode: string;
    mitigation: string;
    contextInfo: string;
}

const CONTEXT_INFO: Record<ContextType, { label: string; desc: string; icon: React.ReactNode }> = {
    html_body: { label: "HTML Body", desc: "Reflected inside generic tags (e.g. <div>...</div>)", icon: <Code size={14} /> },
    html_attribute: { label: "HTML Attribute", desc: "Reflected in an attribute (e.g. value='...')", icon: <Braces size={14} /> },
    javascript_string: { label: "JavaScript String", desc: "Reflected inside a JS variable ('...')", icon: <Terminal size={14} /> },
    url_parameter: { label: "URL Context", desc: "Reflected in a link target (href='...')", icon: <Link size={14} /> }
};

const DISCLAIMER = "This tool performs advanced static analysis only. It simulates browser parsing algorithms to estimate risk but DOES NOT execute payloads. Designed for educational XSS simulation.";

const InputReflectionTester = () => {
    const [input, setInput] = useState('');
    const [context, setContext] = useState<ContextType>('html_body');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    // --- Advanced Static Analysis Engine ---
    const analyzePayload = (payload: string, ctx: ContextType) => {
        setIsAnalyzing(true);

        setTimeout(() => {
            const detections: Detection[] = [];
            let score = 0;
            const p = payload.toLowerCase();

            // --- Universal Checks ---

            // 1. Script Tags (Critical)
            if (/<script[\s>]/i.test(p)) {
                detections.push({ name: "Script Tag", description: "Direct execution vector via <script> tag.", severity: "High" });
                score += 50;
            } else if (/<s\W*c\W*r\W*i\W*p\W*t/i.test(p)) { // Obfuscation
                detections.push({ name: "Obfuscated Script", description: "Evasion attempt for script tag.", severity: "High" });
                score += 45;
            }

            // 2. Event Handlers (High)
            if (/on\w+\s*=/i.test(p)) {
                detections.push({ name: "DOM Event Handler", description: "Event handler (e.g. onload, onerror) detected.", severity: "High" });
                score += 40;
            }

            // 3. Dangerous Tags (Medium/High)
            if (/<(svg|iframe|object|embed|details|style)/i.test(p)) {
                detections.push({ name: "Dangerous HTML Tag", description: "Tag capable of execution or defacement.", severity: "Medium" });
                score += 30;
            }

            // 4. JavaScript URI (High)
            if (/javascript:/i.test(p)) {
                detections.push({ name: "JavaScript Protocol", description: "URI scheme executes code if processed.", severity: "High" });
                score += 40;
            }

            // --- Context Specific Logic ---

            if (ctx === 'html_body') {
                if (/[<>]/.test(p) && detections.length === 0) {
                    detections.push({ name: "HTML Injection", description: "Tags detected. May alter page structure.", severity: "Medium" });
                    score += 20;
                }
            }
            else if (ctx === 'html_attribute') {
                if (/['"]/.test(p)) {
                    detections.push({ name: "Attribute Breakout", description: "Quotes can escape attribute context.", severity: "High" });
                    score += 35;
                }
                // Check if they are trying to inject new handlers after breaking out
                if (detectionExists(detections, "Attribute Breakout") && detectionExists(detections, "DOM Event Handler")) {
                    score += 20; // Bonus risk for breakout + handler
                }
            }
            else if (ctx === 'javascript_string') {
                if (/['"`]/.test(p)) {
                    detections.push({ name: "String Breakout", description: "Quotes/Backticks can escape string context.", severity: "High" });
                    score += 40;
                }
                if (/<\/script>/i.test(p)) {
                    detections.push({ name: "Script Termination", description: "Closing script tag can terminate block early.", severity: "High" });
                    score += 50;
                }
                if ((/;/i.test(p) || /\+/i.test(p)) && detectionExists(detections, "String Breakout")) {
                    detections.push({ name: "JS Injection", description: "Potential to append arbitrary JS commands.", severity: "High" });
                    score += 30;
                }
            }
            else if (ctx === 'url_parameter') {
                // In href, 'javascript:' is the main killer
                if (/javascript:/i.test(p)) {
                    score += 50; // Critical in href
                }
                if (/"|'/.test(p)) {
                    detections.push({ name: "Attribute Breakout", description: "Quotes can escape href attribute.", severity: "Medium" });
                    score += 25;
                }
            }

            // Encoding Detection (Bonus info)
            if (/%[0-9a-f]{2}/i.test(p)) {
                detections.push({ name: "URL Encoded", description: "Payload contains URL encoding.", severity: "Low" });
            }
            if (/&[a-z]+;|&#[0-9]+;/i.test(p)) {
                detections.push({ name: "HTML Entity", description: "Payload contains HTML entities.", severity: "Low" });
            }

            // --- Risk Calculation ---
            score = Math.min(100, score);
            let riskLevel: RiskLevel = 'Safe';
            if (score >= 80) riskLevel = 'Critical';
            else if (score >= 50) riskLevel = 'High';
            else if (score >= 20) riskLevel = 'Medium';
            else if (score > 0) riskLevel = 'Low';

            let confidence: ConfidenceLevel = 'Certain';
            if (detections.length === 0) confidence = 'High'; // Confident it's safe

            // --- Dynamic Explanations ---
            let explanation = "No dangerous patterns detected. Input likely rendered as text.";
            if (riskLevel === 'Critical' || riskLevel === 'High') {
                explanation = `High likelihood of XSS. Detected ${detections[0]?.name} which facilitates arbitrary code execution.`;
            } else if (riskLevel === 'Medium') {
                explanation = "Potential for HTML Injection or context breakout, but direct execution vector is ambiguous.";
            }

            // --- Simulation ---
            let reflected = "";
            let contextMsg = "";
            let mitigationAdvice = "";

            switch (ctx) {
                case 'html_body':
                    reflected = `<div>\n  ${payload}\n</div>`;
                    contextMsg = "Reflected as content within a DIV tag.";
                    mitigationAdvice = "Use proper Output Encoding (convert < > to entities).";
                    break;
                case 'html_attribute':
                    reflected = `<input type="text" value="${payload}">`;
                    contextMsg = "Reflected inside a double-quoted attribute value.";
                    mitigationAdvice = "Attribute-Encode quotes and special chars. Ensure inputs are quoted.";
                    break;
                case 'javascript_string':
                    reflected = `<script>\n  var input = "${payload}";\n</script>`;
                    contextMsg = "Reflected inside a double-quoted JavaScript string.";
                    mitigationAdvice = "Use Unicode Escapes for untrusted data in JS strings using JSON.stringify() or equivalent.";
                    break;
                case 'url_parameter':
                    reflected = `<a href="${payload}">Link</a>`;
                    contextMsg = "Reflected inside an HREF attribute.";
                    mitigationAdvice = "Validate protocol (allow only http/https). URL-Encode parameters.";
                    break;
            }

            setResult({
                riskLevel,
                confidence,
                score,
                detections,
                explanation,
                reflectedCode: reflected,
                mitigation: mitigationAdvice,
                contextInfo: contextMsg
            });
            setIsAnalyzing(false);
        }, 800);
    };

    const detectionExists = (list: Detection[], name: string) => list.some(d => d.name === name);

    // Auto-analyze
    useEffect(() => {
        const timer = setTimeout(() => {
            if (input) analyzePayload(input, context);
            else setResult(null);
        }, 600);
        return () => clearTimeout(timer);
    }, [input, context]);

    const trySample = () => {
        const samples = [
            { t: "<script>alert(1)</script>", c: 'html_body' },
            { t: "\"><img src=x onerror=prompt(1)>", c: 'html_attribute' },
            { t: "\"; alert(1); //", c: 'javascript_string' },
            { t: "javascript:alert(1)", c: 'url_parameter' },
            { t: "'-alert(1)-'", c: 'javascript_string' }
        ];
        const s = samples[Math.floor(Math.random() * samples.length)];
        setInput(s.t);
        setContext(s.c as ContextType);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    // --- Visual Helpers ---
    const getRiskColor = (level: RiskLevel) => {
        switch (level) {
            case 'Critical': return 'text-red-600';
            case 'High': return 'text-red-500';
            case 'Medium': return 'text-orange-500';
            case 'Low': return 'text-yellow-500';
            default: return 'text-green-500';
        }
    };
    const getRiskBg = (level: RiskLevel) => {
        switch (level) {
            case 'Critical': return 'bg-red-600';
            case 'High': return 'bg-red-500';
            case 'Medium': return 'bg-orange-500';
            case 'Low': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    return (
        <ToolPageLayout
            title="Advanced Input Reflection Tester"
            description="Professional Context-Aware XSS Simulator & Risk Analyzer."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        A safe, simulated environment to test potential Cross-Site Scripting (XSS) vectors.
                        It helps you understand how different contexts (HTML, JS, URL) handle special characters and escape sequences.
                    </p>
                    <p className="mt-2">
                        Instead of executing payloads, this tool uses a static analysis engine to predict browser behavior and identify breakout vectors.
                    </p>
                </div>
            }
            disclaimer={DISCLAIMER}
            howItWorks={[
                "Select the Reflection Context (Body, Attribute, JS, URL).",
                "Input your payload or string to test.",
                "The engine analyzes potential evasion, breakout, and execution vectors.",
                "Review the comprehensive Risk Score and Defense Guidance."
            ]}
        >
            <div className="max-w-7xl mx-auto space-y-8 min-h-[800px]">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT PANEL: CONFIG */}
                    <Card className="lg:col-span-5 bg-[#0A0A0A] border-white/10 h-fit">
                        <CardContent className="p-6 space-y-8">

                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Terminal className="text-purple-500" size={18} /> Configuration
                                </h3>
                                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 text-[10px] px-2 py-0.5">
                                    <Shield size={10} className="mr-1" /> Safe Mode
                                </Badge>
                            </div>

                            {/* Context Selector */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    Reflection Context <Info size={12} className="text-white/20" />
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(CONTEXT_INFO).map(([key, info]) => (
                                        <button
                                            key={key}
                                            onClick={() => setContext(key as ContextType)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 gap-2 text-center",
                                                context === key
                                                    ? "bg-[#1A1A1A] border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                                    : "bg-[#111] border-white/5 text-white/40 hover:bg-[#161616] hover:text-white/70"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-full", context === key ? "bg-purple-500/20 text-purple-400" : "bg-white/5")}>
                                                {info.icon}
                                            </div>
                                            <span className="text-xs font-bold">{info.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-white/30 text-center pt-1 italic">
                                    "{CONTEXT_INFO[context].desc}"
                                </p>
                            </div>

                            {/* Input Area */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Payload</label>
                                    <button onClick={trySample} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                                        <Zap size={10} /> Auto-Generate Payload
                                    </button>
                                </div>
                                <div className="relative">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Try a payload like <script>alert(1)</script>...`}
                                        className="bg-[#111] border-white/10 text-white font-mono text-sm min-h-[200px] resize-none focus:ring-1 focus:ring-purple-500/50 p-4 leading-relaxed tracking-wide"
                                    />
                                    <div className="absolute bottom-3 right-3 text-[10px] text-white/20">
                                        {input.length} chars
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* RIGHT PANEL: ANALYSIS */}
                    <div className="lg:col-span-7 space-y-6">
                        <AnimatePresence mode="wait">
                            {input && result ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Score Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Risk Level */}
                                        <Card className="bg-[#111] border-white/10 overflow-hidden relative">
                                            <div className={cn("absolute top-0 left-0 w-1 h-full", getRiskBg(result.riskLevel))} />
                                            <CardContent className="p-6 flex flex-col justify-between h-full">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-xs font-bold uppercase text-white/40 tracking-widest">Risk Assessment</span>
                                                    {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />}
                                                </div>
                                                <div>
                                                    <div className={cn("text-4xl font-black mb-1 tracking-tight", getRiskColor(result.riskLevel))}>
                                                        {result.riskLevel.toUpperCase()}
                                                    </div>
                                                    <div className="text-xs text-white/40 font-medium">
                                                        Confidence: <span className="text-white">{result.confidence}</span>
                                                    </div>
                                                </div>
                                                <Progress value={result.score} className={cn("h-1.5 mt-4 bg-white/5", `text-${getRiskColor(result.riskLevel).split('-')[1]}-500`)} />
                                            </CardContent>
                                        </Card>

                                        {/* Findings */}
                                        <Card className="bg-[#111] border-white/10">
                                            <CardContent className="p-6 h-full">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <AlertOctagon size={16} className={result.detections.length > 0 ? "text-orange-500" : "text-green-500"} />
                                                    <span className="text-xs font-bold uppercase text-white/40 tracking-widest">Detections</span>
                                                </div>
                                                {result.detections.length > 0 ? (
                                                    <div className="space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                                                        {result.detections.map((d, i) => (
                                                            <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-white/5 border border-white/5">
                                                                <span className="text-white font-medium">{d.name}</span>
                                                                <Badge variant="outline" className={cn("text-[10px] h-5 border-white/10", d.severity === 'High' ? 'text-red-400' : 'text-yellow-400')}>
                                                                    {d.severity}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-center text-white/30 text-xs">
                                                        <CheckCircle size={24} className="mb-2 text-green-500/50" />
                                                        No known vectors detected.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Simulation View */}
                                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
                                        <div className="absolute top-0 left-0 right-0 h-9 bg-[#161616] border-b border-white/5 flex items-center px-4 justify-between">
                                            <span className="text-[10px] font-bold uppercase text-white/40 flex items-center gap-2">
                                                <Eye size={12} /> Browser Interpretation Simulation
                                            </span>
                                            <button onClick={() => copyToClipboard(result.reflectedCode)} className="text-white/30 hover:text-white transition-colors">
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                        <div className="p-6 pt-12 overflow-x-auto">
                                            <pre className="font-mono text-sm text-blue-100 whitespace-pre-wrap break-all">
                                                {result.reflectedCode}
                                            </pre>
                                        </div>
                                        <div className="bg-[#161616] px-4 py-2 border-t border-white/5 text-[10px] text-white/40 flex items-center gap-2">
                                            <Info size={10} /> {result.contextInfo}
                                        </div>
                                    </div>

                                    {/* Mitigation Advice */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-5 rounded-xl border border-white/5 bg-gradient-to-br from-green-500/5 to-transparent"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                <Shield size={20} className="text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white mb-1">Defense Recommendation</h4>
                                                <p className="text-sm text-white/70 leading-relaxed">
                                                    {result.mitigation}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/[0.02] min-h-[400px]">
                                    <div className="w-20 h-20 rounded-full bg-purple-500/5 flex items-center justify-center mb-6 animate-pulse">
                                        <Terminal className="text-purple-500/40" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Awaiting Payload</h3>
                                    <p className="text-white/40 max-w-sm mb-8">
                                        Configure the context and input a test string to begin the advanced structural analysis.
                                    </p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
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

export default InputReflectionTester;
