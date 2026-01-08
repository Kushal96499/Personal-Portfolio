import { useState, useEffect } from "react";
import { Copy, Check, Type, Link as LinkIcon, FileCode, Scissors, AlignLeft, Hash, RefreshCcw, Eraser, AlertTriangle, Clock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

const ToolCard = ({ title, icon: Icon, children, className = "" }: { title: string, icon: any, children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative group h-full flex flex-col ${className}`}
    >
        <div className="absolute -inset-[1px] bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-blue-500/30 rounded-2xl opacity-50 blur-sm group-hover:opacity-100 transition duration-500"></div>
        <div className="relative h-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white/90 tracking-wide">{title}</h3>
            </div>
            <div className="flex-grow flex flex-col gap-4">
                {children}
            </div>
        </div>
    </motion.div>
);

const MiniTools = () => {
    // --- STATE ---

    // Base64
    const [base64Input, setBase64Input] = useState("");
    const [base64Output, setBase64Output] = useState("");
    const [base64Error, setBase64Error] = useState(false);

    // URL
    const [urlInput, setUrlInput] = useState("");
    const [urlOutput, setUrlOutput] = useState("");
    const [urlError, setUrlError] = useState(false);

    // Case
    const [caseInput, setCaseInput] = useState("");
    const [caseOutput, setCaseOutput] = useState("");

    // Text Utils
    const [textInput, setTextInput] = useState("");
    const [textOutput, setTextOutput] = useState("");
    const [textStats, setTextStats] = useState({ chars: 0, words: 0, lines: 0 });

    const debouncedTextInput = useDebounce(textInput, 300);

    // JWT
    const [jwtInput, setJwtInput] = useState("");
    const [jwtOutput, setJwtOutput] = useState("");
    const [jwtError, setJwtError] = useState(false);

    // Timestamp
    const [timestampInput, setTimestampInput] = useState("");
    const [timestampOutput, setTimestampOutput] = useState("");
    const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));

    // Copy States
    const [copiedBase64, setCopiedBase64] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedCase, setCopiedCase] = useState(false);
    const [copiedText, setCopiedText] = useState(false);
    const [copiedJwt, setCopiedJwt] = useState(false);
    const [copiedTimestamp, setCopiedTimestamp] = useState(false);

    // --- LOGIC ---

    // 1. Base64 (Unicode Support)
    const handleBase64 = (action: "encode" | "decode") => {
        setBase64Error(false);
        try {
            if (action === "encode") {
                const encoder = new TextEncoder();
                const data = encoder.encode(base64Input);
                const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join("");
                setBase64Output(btoa(binString));
            } else {
                // Support Base64Url by replacing - and _
                const sanitizedInput = base64Input.replace(/-/g, '+').replace(/_/g, '/');
                const binString = atob(sanitizedInput);
                const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
                const decoder = new TextDecoder();
                setBase64Output(decoder.decode(bytes));
            }
        } catch (e) {
            setBase64Error(true);
            setBase64Output("Error: Invalid Base64 input or incompatible characters.");
        }
    };

    // 2. URL
    const handleUrl = (action: "encode" | "decode") => {
        setUrlError(false);
        try {
            if (action === "encode") {
                setUrlOutput(encodeURIComponent(urlInput));
            } else {
                setUrlOutput(decodeURIComponent(urlInput));
            }
        } catch (e) {
            setUrlError(true);
            setUrlOutput("Error: Malformed URL sequence.");
        }
    };

    // 3. Case Converter
    const handleCase = (type: "upper" | "lower" | "title" | "sentence" | "lines") => {
        let result = "";
        switch (type) {
            case "upper":
                result = caseInput.toUpperCase();
                break;
            case "lower":
                result = caseInput.toLowerCase();
                break;
            case "title":
                result = caseInput.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
                break;
            case "sentence":
                result = caseInput.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
                break;
            case "lines":
                result = caseInput.split('\n').map(line => line.charAt(0).toUpperCase() + line.slice(1)).join('\n');
                break;
        }
        setCaseOutput(result);
    };

    // 4. Text Utilities
    const handleTextUtil = (action: string) => {
        let result = textInput;
        switch (action) {
            case "trim":
                result = textInput.trim();
                break;
            case "spaces":
                result = textInput.replace(/\s+/g, ' ').trim();
                break;
            case "lines":
                result = textInput.replace(/(\r\n|\n|\r)/gm, " ");
                break;
            case "reverse":
                result = textInput.split("").reverse().join("");
                break;
            case "numbers":
                result = textInput.replace(/[^0-9\s]/g, "");
                break;
            case "letters":
                result = textInput.replace(/[^a-zA-Z\s]/g, "");
                break;
            case "slug":
                result = textInput.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                break;
        }
        setTextOutput(result);
        updateStats(result);
    };

    const updateStats = (text: string) => {
        setTextStats({
            chars: text.length,
            words: text.trim() ? text.trim().split(/\s+/).length : 0,
            lines: text.split(/\r\n|\r|\n/).length
        });
    };

    useEffect(() => {
        updateStats(debouncedTextInput);
    }, [debouncedTextInput]);

    // 5. JWT Decoder
    const handleJwt = () => {
        setJwtError(false);
        try {
            if (!jwtInput) {
                setJwtOutput("");
                return;
            }
            const parts = jwtInput.trim().split('.');
            if (parts.length !== 3) throw new Error("Invalid JWT format");

            const decodeBase64Url = (str: string) => {
                // Replace Base64Url characters with Base64 characters
                const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                // Pad with '=' to make length a multiple of 4
                const pad = base64.length % 4;
                const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
                return atob(padded);
            };

            const header = JSON.parse(decodeBase64Url(parts[0]));
            const payload = JSON.parse(decodeBase64Url(parts[1]));

            setJwtOutput(JSON.stringify({ header, payload }, null, 2));
        } catch (e) {
            setJwtError(true);
            setJwtOutput("Error: Invalid JWT token or corrupt format.");
        }
    };

    useEffect(() => {
        handleJwt();
    }, [jwtInput]);

    // 6. Timestamp Converter
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTimestamp = (type: "to_date" | "to_timestamp") => {
        try {
            if (type === "to_date") {
                // strict check for digits to avoid parsing "01-08-2026" as "1"
                if (!/^\d+$/.test(timestampInput.trim())) {
                    // Try to see if it's actually a date string the user wants to convert to timestamp instead?
                    // For now, just error out or try to be smart.
                    // Better: Throw error if not digits.
                    throw new Error("Input is not a valid timestamp (digits only).");
                }
                const ts = parseInt(timestampInput.trim());
                if (isNaN(ts)) throw new Error("Invalid timestamp");
                setTimestampOutput(new Date(ts * 1000).toLocaleString());
            } else {
                const date = new Date(timestampInput);
                if (isNaN(date.getTime())) throw new Error("Invalid date");
                setTimestampOutput(Math.floor(date.getTime() / 1000).toString());
            }
        } catch (e) {
            setTimestampOutput("Error: Invalid input format.");
        }
    };

    // --- HELPER ---
    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const HOW_IT_WORKS = [
        "Base64: Encode or decode text to/from Base64 format.",
        "URL: Encode or decode URL components.",
        "JWT: Decode JSON Web Tokens to view header and payload.",
        "Timestamp: Convert Unix timestamps to human-readable dates and vice versa.",
        "Case: Convert text to uppercase, lowercase, title case, etc.",
        "Text Utils: Trim, reverse, slugify, or extract specific characters."
    ];

    const DISCLAIMER = "All operations are performed locally in your browser. No data (including JWTs) is sent to any server.";

    return (
        <ToolPageLayout
            title="Quick Mini Tools (Advanced)"
            description="A multi-utility cyber toolkit for developers and security pros."
            about={
                <div>
                    <p>
                        A versatile collection of essential developer utilities in one place. From Base64 encoding to JWT debugging and timestamp conversion, this toolkit mimics the functionality of a 'Swiss Army Knife' for developers.
                    </p>
                    <p className="mt-2">
                        It handles common data transformation tasks locally in your browser, ensuring speed and privacy for your sensitive data tokens.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
            parentPath="/tools/other"
            parentName="Developer Tools"
        >
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">

                    {/* 1. Base64 Tool */}
                    <ToolCard title="Base64 Encoder / Decoder" icon={FileCode}>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Paste text to encode/decode..."
                                value={base64Input}
                                onChange={(e) => setBase64Input(e.target.value)}
                                className="bg-black/50 border-white/10 focus:border-cyan-500/50 min-h-[100px] resize-none text-sm font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => handleBase64("encode")} className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30">Encode</Button>
                            <Button onClick={() => handleBase64("decode")} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30">Decode</Button>
                        </div>
                        <div className="space-y-2 mt-auto pt-4 relative">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Output</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-white/10"
                                    onClick={() => { setBase64Input(""); setBase64Output(""); }}
                                >
                                    <Eraser size={12} className="mr-1" /> Clear
                                </Button>
                            </div>
                            <div className={`relative rounded-md border transition-colors ${base64Error ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 bg-black/30'}`}>
                                <Textarea
                                    readOnly
                                    value={base64Output}
                                    className="bg-transparent border-none focus:ring-0 min-h-[100px] resize-none text-sm font-mono text-muted-foreground"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 hover:bg-white/10"
                                    onClick={() => copyToClipboard(base64Output, setCopiedBase64)}
                                >
                                    {copiedBase64 ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </Button>
                            </div>
                            {base64Error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} /> Invalid Base64 string</p>}
                        </div>
                    </ToolCard>

                    {/* 2. URL Tool */}
                    <ToolCard title="URL Encoder / Decoder" icon={LinkIcon}>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Paste URL..."
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="bg-black/50 border-white/10 focus:border-cyan-500/50 min-h-[100px] resize-none text-sm font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => handleUrl("encode")} className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30">Encode URL</Button>
                            <Button onClick={() => handleUrl("decode")} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30">Decode URL</Button>
                        </div>
                        <div className="space-y-2 mt-auto pt-4 relative">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Output</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-white/10"
                                    onClick={() => { setUrlInput(""); setUrlOutput(""); }}
                                >
                                    <Eraser size={12} className="mr-1" /> Clear
                                </Button>
                            </div>
                            <div className={`relative rounded-md border transition-colors ${urlError ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 bg-black/30'}`}>
                                <Textarea
                                    readOnly
                                    value={urlOutput}
                                    className="bg-transparent border-none focus:ring-0 min-h-[100px] resize-none text-sm font-mono text-muted-foreground"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 hover:bg-white/10"
                                    onClick={() => copyToClipboard(urlOutput, setCopiedUrl)}
                                >
                                    {copiedUrl ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </Button>
                            </div>
                        </div>
                    </ToolCard>

                    {/* 3. Case Converter */}
                    <ToolCard title="Case Converter" icon={Type}>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Type text to convert..."
                                value={caseInput}
                                onChange={(e) => setCaseInput(e.target.value)}
                                className="bg-black/50 border-white/10 focus:border-cyan-500/50 min-h-[100px] resize-none text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            <Button onClick={() => handleCase("upper")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5">UPPER</Button>
                            <Button onClick={() => handleCase("lower")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5">lower</Button>
                            <Button onClick={() => handleCase("title")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5">Title Case</Button>
                            <Button onClick={() => handleCase("sentence")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5">Sentence</Button>
                            <Button onClick={() => handleCase("lines")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5">Lines</Button>
                        </div>
                        <div className="space-y-2 mt-auto pt-4 relative">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Output</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-white/10"
                                    onClick={() => copyToClipboard(caseOutput, setCopiedCase)}
                                >
                                    {copiedCase ? <Check size={12} className="mr-1 text-green-400" /> : <Copy size={12} className="mr-1" />}
                                    {copiedCase ? "Copied" : "Copy"}
                                </Button>
                            </div>
                            <Textarea
                                readOnly
                                value={caseOutput}
                                className="bg-black/30 border-white/5 focus:border-white/10 min-h-[100px] resize-none text-sm text-muted-foreground"
                            />
                        </div>
                    </ToolCard>

                    {/* 4. Text Utilities */}
                    <ToolCard title="Text Utilities" icon={Scissors}>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Enter text to process..."
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                className="bg-black/50 border-white/10 focus:border-cyan-500/50 min-h-[100px] resize-none text-sm"
                            />
                            <div className="flex gap-4 text-[10px] text-muted-foreground font-mono px-1">
                                <span>Chars: {textStats.chars}</span>
                                <span>Words: {textStats.words}</span>
                                <span>Lines: {textStats.lines}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Button onClick={() => handleTextUtil("trim")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5" title="Trim Whitespace"><Scissors size={12} className="mr-1" /> Trim</Button>
                            <Button onClick={() => handleTextUtil("spaces")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5" title="Remove Extra Spaces"><AlignLeft size={12} className="mr-1" /> Spaces</Button>
                            <Button onClick={() => handleTextUtil("lines")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5" title="Remove Line Breaks">No Lines</Button>
                            <Button onClick={() => handleTextUtil("reverse")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5" title="Reverse Text"><RefreshCcw size={12} className="mr-1" /> Reverse</Button>
                            <Button onClick={() => handleTextUtil("numbers")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5" title="Extract Numbers"><Hash size={12} className="mr-1" /> 0-9 Only</Button>
                            <Button onClick={() => handleTextUtil("letters")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5" title="Extract Letters"><Type size={12} className="mr-1" /> A-Z Only</Button>
                            <Button onClick={() => handleTextUtil("slug")} variant="outline" className="px-0 text-[10px] h-8 border-white/10 hover:bg-white/5 col-span-2" title="Slugify">Slugify (url-friendly)</Button>
                        </div>
                        <div className="space-y-2 mt-auto pt-4 relative">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Output</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-white/10"
                                    onClick={() => copyToClipboard(textOutput, setCopiedText)}
                                >
                                    {copiedText ? <Check size={12} className="mr-1 text-green-400" /> : <Copy size={12} className="mr-1" />}
                                    {copiedText ? "Copied" : "Copy"}
                                </Button>
                            </div>
                            <Textarea
                                readOnly
                                value={textOutput}
                                className="bg-black/30 border-white/5 focus:border-white/10 min-h-[100px] resize-none text-sm text-muted-foreground"
                            />
                        </div>
                    </ToolCard>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 mt-8">
                    {/* 5. JWT Decoder */}
                    <ToolCard title="JWT Decoder" icon={Key}>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="Paste JWT token (header.payload.signature)..."
                                value={jwtInput}
                                onChange={(e) => setJwtInput(e.target.value)}
                                className="bg-black/50 border-white/10 focus:border-cyan-500/50 min-h-[80px] resize-none text-sm font-mono"
                            />
                        </div>
                        <div className="space-y-2 mt-auto pt-4 relative flex-grow flex flex-col">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Decoded Payload</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-white/10"
                                    onClick={() => { setJwtInput(""); setJwtOutput(""); }}
                                >
                                    <Eraser size={12} className="mr-1" /> Clear
                                </Button>
                            </div>
                            <div className={`relative rounded-md border transition-colors flex-grow ${jwtError ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 bg-black/30'}`}>
                                <Textarea
                                    readOnly
                                    value={jwtOutput}
                                    className="bg-transparent border-none focus:ring-0 h-full min-h-[150px] resize-none text-sm font-mono text-muted-foreground"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 hover:bg-white/10"
                                    onClick={() => copyToClipboard(jwtOutput, setCopiedJwt)}
                                >
                                    {copiedJwt ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </Button>
                            </div>
                        </div>
                    </ToolCard>

                    {/* 6. Timestamp Converter */}
                    <ToolCard title="Unix Timestamp Converter" icon={Clock}>
                        <div className="bg-white/5 p-4 rounded-lg text-center mb-4">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Unix Timestamp</div>
                            <div className="text-3xl font-mono font-bold text-cyan-400">{currentTimestamp}</div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Enter timestamp or date..."
                                        value={timestampInput}
                                        onChange={(e) => setTimestampInput(e.target.value)}
                                        className="bg-black/50 border-white/10 focus:border-cyan-500/50 h-10 min-h-[40px] resize-none text-sm font-mono py-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={() => handleTimestamp("to_date")} variant="outline" className="border-white/10 hover:bg-white/5 text-xs">To Date</Button>
                                    <Button onClick={() => handleTimestamp("to_timestamp")} variant="outline" className="border-white/10 hover:bg-white/5 text-xs">To Timestamp</Button>
                                </div>
                            </div>

                            <div className="space-y-2 mt-auto pt-4 relative">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Result</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs hover:bg-white/10"
                                        onClick={() => { setTimestampInput(""); setTimestampOutput(""); }}
                                    >
                                        <Eraser size={12} className="mr-1" /> Clear
                                    </Button>
                                </div>
                                <div className="relative rounded-md border border-white/5 bg-black/30">
                                    <div className="p-3 text-sm font-mono text-muted-foreground min-h-[40px] flex items-center">
                                        {timestampOutput || "Result will appear here..."}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-1 right-1 h-8 w-8 hover:bg-white/10"
                                        onClick={() => copyToClipboard(timestampOutput, setCopiedTimestamp)}
                                    >
                                        {copiedTimestamp ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ToolCard>
                </div>

                <p className="mt-12 text-xs text-center text-muted-foreground opacity-60">
                    All conversions happen locally in your browser — no data uploaded.
                </p>
            </div>
        </ToolPageLayout>
    );
};

export default MiniTools;
