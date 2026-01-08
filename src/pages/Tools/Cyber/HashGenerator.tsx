import { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { Copy, Check, FileLock, RefreshCw, ChevronDown, ChevronUp, Layers, Upload, AlertTriangle, Shield, Zap, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const HashGenerator = () => {
    const [input, setInput] = useState("");
    const [algorithm, setAlgorithm] = useState("SHA-256");
    const [hash, setHash] = useState("");
    const [copied, setCopied] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [allHashes, setAllHashes] = useState<{ [key: string]: string }>({});

    // Advanced Features State
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [file, setFile] = useState<File | null>(null);
    const [fileHashLoading, setFileHashLoading] = useState(false);
    const [compareHash, setCompareHash] = useState("");
    const [isLive, setIsLive] = useState(true); // Live hashing toggle
    const [hashingTime, setHashingTime] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- HMAC State ---
    const [hmacKey, setHmacKey] = useState("");

    // --- Hashing Logic ---
    const computeHash = async (text: string, algo: string): Promise<string> => {
        if (algo === "MD5") {
            return CryptoJS.MD5(text).toString();
        } else if (algo === "SHA-3") {
            // SHA-3 (Keccak) - Defaulting to 512 bits for maximum security perception
            return CryptoJS.SHA3(text, { outputLength: 512 }).toString();
        } else if (algo === "RIPEMD-160") {
            return CryptoJS.RIPEMD160(text).toString();
        } else if (algo === "Hex Encode") {
            try { return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(text)); } catch { return "Error: Invalid input"; }
        } else if (algo === "Hex Decode") {
            try { return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(text)); } catch { return "Error: Invalid Hex string"; }
        } else if (algo === "Base64 Encode") {
            try { return btoa(text); } catch { return "Error: Invalid input for Base64"; }
        } else if (algo === "Base64 Decode") {
            try { return atob(text); } catch { return "Error: Invalid Base64 string"; }
        } else if (algo === "URL Encode") {
            return encodeURIComponent(text);
        } else if (algo === "URL Decode") {
            try { return decodeURIComponent(text); } catch { return "Error: Malformed URL"; }
        } else if (algo.startsWith("HMAC")) {
            if (!hmacKey) return "Error: HMAC Key Required";
            // ... (rest of HMAC logic)
            const encoder = new TextEncoder();
            const keyData = encoder.encode(hmacKey);
            const msgData = encoder.encode(text);
            const hashAlgo = algo.split("-")[1]; // SHA-256 or SHA-512

            try {
                const key = await crypto.subtle.importKey(
                    "raw", keyData, { name: "HMAC", hash: { name: hashAlgo } }, false, ["sign"]
                );
                const signature = await crypto.subtle.sign("HMAC", key, msgData);
                return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (e) {
                return "Error: HMAC Computation Failed";
            }
        } else {
            // Web Crypto API for SHA family
            const msgBuffer = new TextEncoder().encode(text);
            const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    };

    const computeFileHash = async (fileToHash: File, algo: string): Promise<string> => {
        if (algo === "Base64 Encode" || algo === "Base64 Decode") {
            throw new Error("Base64 not supported for files in this tool yet.");
        }
        if (algo.startsWith("HMAC")) {
            throw new Error("HMAC not supported for files in this version (Client-side limitation for large files).");
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    if (algo === "MD5") {
                        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
                        resolve(CryptoJS.MD5(wordArray).toString());
                    } else if (algo === "SHA-3") {
                        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
                        resolve(CryptoJS.SHA3(wordArray, { outputLength: 512 }).toString());
                    } else if (algo === "RIPEMD-160") {
                        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
                        resolve(CryptoJS.RIPEMD160(wordArray).toString());
                    } else {
                        // Web Crypto for SHA family
                        const hashBuffer = await crypto.subtle.digest(algo, arrayBuffer);
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        resolve(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsArrayBuffer(fileToHash);
        });
    };

    // --- Effects ---
    useEffect(() => {
        if (mode === 'text' && isLive) {
            handleTextHash();
        }
    }, [input, algorithm, mode, isLive, hmacKey]);

    useEffect(() => {
        if (mode === 'file' && file) {
            handleFileHash();
        }
    }, [file, algorithm, mode]);

    // --- Handlers ---
    const handleTextHash = async () => {
        if (!input) {
            setHash("");
            return;
        }
        const start = performance.now();
        const result = await computeHash(input, algorithm);
        setHash(result);
        setHashingTime(performance.now() - start);

        if (showAll && !algorithm.startsWith("HMAC")) {
            const algos = ["MD5", "SHA-1", "SHA-256", "SHA-512"];
            const results: { [key: string]: string } = {};
            for (const algo of algos) {
                results[algo] = await computeHash(input, algo);
            }
            setAllHashes(results);
        }
    };

    const handleFileHash = async () => {
        if (!file) return;
        setFileHashLoading(true);
        const start = performance.now();
        try {
            const result = await computeFileHash(file, algorithm);
            setHash(result);
            setHashingTime(performance.now() - start);
        } catch (err: any) {
            toast.error(err.message || "File hashing failed.");
            setHash("Error");
        } finally {
            setFileHashLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const copyToClipboard = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getHashLength = (h: string) => {
        return h.length;
    };

    const isMatch = compareHash && hash && compareHash.trim().toLowerCase() === hash.trim().toLowerCase();

    const HOW_IT_WORKS = [
        "Select 'Text String' or 'File Upload' mode.",
        "Enter your text or upload a file.",
        "Choose a hashing algorithm (SHA-256 is recommended).",
        "For HMAC, enter a secret key to sign the message.",
        "The hash is generated locally in your browser."
    ];

    const DISCLAIMER = "All hashing is performed client-side using the Web Crypto API. Your files and text never leave your device.";

    return (
        <ToolPageLayout
            title="Hash Generator (Advanced)"
            description="Professional cryptographic hashing suite with HMAC & File support."
            parentPath="/tools/cyber"
            parentName="Cyber Tools"
            about={
                <div>
                    <p>
                        Securely generate cryptographic hashes for your text or files entirely within your browser.
                        Supports common algorithms like SHA-256, MD5, and even HMAC for message authentication.
                    </p>
                    <p className="mt-2">
                        Perfect for verifying file integrity, generating checksums, or learning about different cryptographic standards.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-[800px] mx-auto space-y-8">

                {/* Main Card */}
                <Card className="border-white/5 bg-[#111111]">
                    <CardContent className="p-6 md:p-8">

                        {/* Header Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setMode('text')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'text' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                >
                                    Text String
                                </button>
                                <button
                                    onClick={() => setMode('file')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'file' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
                                >
                                    File Upload
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-white/40 uppercase tracking-wider">Mode:</span>
                                <button
                                    onClick={() => setIsLive(!isLive)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isLive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                                >
                                    {isLive ? <Zap size={12} /> : <Lock size={12} />}
                                    {isLive ? "LIVE" : "MANUAL"}
                                </button>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div className="space-y-6 mb-8">
                            {mode === 'text' ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">Input Text</label>
                                    <Textarea
                                        placeholder="Type or paste content here..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="min-h-[120px] bg-[#0A0A0A] border-white/10 focus:border-blue-500/50 text-lg rounded-xl resize-none font-mono text-white placeholder:text-white/20"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">Select File</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0A0A0A] hover:bg-white/5 group/drop"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <Upload className="w-10 h-10 text-white/40 group-hover/drop:text-blue-500 mb-4 transition-colors" />
                                        {file ? (
                                            <div className="text-center">
                                                <p className="text-white font-medium">{file.name}</p>
                                                <p className="text-sm text-white/40">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        ) : (
                                            <div className="text-center text-white/40">
                                                <p className="font-medium">Click to upload or drag and drop</p>
                                                <p className="text-xs mt-1">Any file type supported</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Algorithm & Action */}
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="w-full md:w-1/2 space-y-2">
                                    <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">Algorithm</label>
                                    <Select value={algorithm} onValueChange={setAlgorithm}>
                                        <SelectTrigger className="bg-[#0A0A0A] border-white/10 h-12 rounded-xl focus:ring-blue-500/50 text-white">
                                            <SelectValue placeholder="Select Algorithm" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#111111] border-white/10 text-white">
                                            <SelectItem value="MD5">MD5 (128-bit)</SelectItem>
                                            <SelectItem value="SHA-1">SHA-1 (160-bit)</SelectItem>
                                            <SelectItem value="SHA-256">SHA-256 (256-bit)</SelectItem>
                                            <SelectItem value="SHA-384">SHA-384 (384-bit)</SelectItem>
                                            <SelectItem value="SHA-512">SHA-512 (512-bit)</SelectItem>
                                            <SelectItem value="SHA-3">SHA-3 (Keccak-512)</SelectItem>
                                            <SelectItem value="RIPEMD-160">RIPEMD-160</SelectItem>
                                            <SelectItem value="HMAC-SHA-256">HMAC-SHA-256</SelectItem>
                                            <SelectItem value="HMAC-SHA-512">HMAC-SHA-512</SelectItem>
                                            <SelectItem value="Base64 Encode">Base64 Encode</SelectItem>
                                            <SelectItem value="Base64 Decode">Base64 Decode</SelectItem>
                                            <SelectItem value="Hex Encode">Hex Encode</SelectItem>
                                            <SelectItem value="Hex Decode">Hex Decode</SelectItem>
                                            <SelectItem value="URL Encode">URL Encode</SelectItem>
                                            <SelectItem value="URL Decode">URL Decode</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {!isLive && (
                                    <Button
                                        onClick={mode === 'text' ? handleTextHash : handleFileHash}
                                        disabled={fileHashLoading}
                                        className="w-full md:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all border-none"
                                    >
                                        {fileHashLoading ? <RefreshCw className="animate-spin mr-2" /> : <Shield className="mr-2 h-4 w-4" />}
                                        Generate Hash
                                    </Button>
                                )}
                            </div>

                            {/* HMAC Key Input */}
                            <AnimatePresence>
                                {algorithm.startsWith("HMAC") && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-yellow-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                                <Key size={14} /> Secret Key (Required)
                                            </label>
                                            <Input
                                                type="password"
                                                placeholder="Enter secret key for HMAC..."
                                                value={hmacKey}
                                                onChange={(e) => setHmacKey(e.target.value)}
                                                className="bg-[#0A0A0A] border-yellow-500/30 focus:border-yellow-500 text-white h-12 rounded-xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Output Section */}
                        <AnimatePresence mode="wait">
                            {hash && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4 mb-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-white/40 uppercase tracking-wider ml-1">
                                            Result ({algorithm})
                                        </label>
                                        <div className="flex gap-4 text-xs text-white/40 font-mono">
                                            <span>Len: {getHashLength(hash)}</span>
                                            <span>Time: {hashingTime.toFixed(2)}ms</span>
                                        </div>
                                    </div>

                                    <div className="relative group/output">
                                        <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-xl p-4 overflow-hidden">
                                            <code className="flex-grow font-mono text-sm break-all text-blue-400">
                                                {hash}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(hash)}
                                                className="ml-2 shrink-0 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
                                            >
                                                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Comparison Tool */}
                        {hash && (
                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-white/40 uppercase tracking-wider">
                                    <FileLock size={14} /> Hash Comparison
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Paste a hash to compare..."
                                        value={compareHash}
                                        onChange={(e) => setCompareHash(e.target.value)}
                                        className={`w-full bg-[#0A0A0A] border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-colors ${compareHash
                                            ? (isMatch ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400')
                                            : 'border-white/10 text-white focus:border-white/30'
                                            }`}
                                    />
                                    {compareHash && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {isMatch ? (
                                                <span className="text-xs font-bold text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded">
                                                    <Check size={12} /> MATCH
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded">
                                                    <AlertTriangle size={12} /> MISMATCH
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Generate All (Text Only) */}
                        {mode === 'text' && !algorithm.startsWith("HMAC") && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowAll(!showAll)}
                                    className="w-full flex justify-between items-center hover:bg-white/5 h-12 rounded-xl group/all text-white/60 hover:text-white"
                                >
                                    <span className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-purple-400" />
                                        Generate All Common Hashes
                                    </span>
                                    {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>

                                <AnimatePresence>
                                    {showAll && input && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-4 pt-4 px-1">
                                                {Object.entries(allHashes).map(([algo, val]) => (
                                                    <div key={algo} className="space-y-1">
                                                        <span className="text-xs text-white/40 font-mono">{algo}</span>
                                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-lg p-3 flex items-center justify-between group/item hover:border-white/10 transition-colors">
                                                            <code className="text-xs font-mono text-white/80 truncate flex-1 mr-4">
                                                                {val}
                                                            </code>
                                                            <button
                                                                onClick={() => copyToClipboard(val)}
                                                                className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                    </CardContent>
                </Card>

            </div>
        </ToolPageLayout>
    );
};

export default HashGenerator;
