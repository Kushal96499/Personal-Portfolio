import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Lock, Unlock, RefreshCw, Copy, AlertTriangle,
    CheckCircle, XCircle, Zap, Key, Eye, EyeOff, AlertOctagon,
    Hourglass, BarChart3, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Constants & Lists ---
const COMMON_PASSWORDS = [
    "123456", "password", "qwerty", "letmein", "welcome", "admin", "iloveyou",
    "123123", "abc123", "111111", "password1", "12345678", "123456789", "google",
    "monkey", "dragon", "master", "sunshine", "princess", "football", "charlie",
    "michael", "jordan", "baseball", "superman", "secret", "login", "hunter2"
];

const SECURITY_TIPS = [
    "Use at least 12+ characters for better entropy.",
    "Mix Uppercase, Lowercase, Numbers, and Symbols.",
    "Avoid using dictionary words or common phrases.",
    "Never reuse passwords across different sites.",
    "Enable 2FA (Two-Factor Auth) for critical accounts.",
    "Use a Password Manager to generate and store keys.",
    "Avoid using personal info like birthdays or names."
];

const HOW_IT_WORKS = [
    "Enter your password in the input field above.",
    "We analyze the character composition (uppercase, lowercase, numbers, symbols).",
    "Entropy is calculated to determine the mathematical difficulty of guessing the password.",
    "We check against a database of common weak passwords.",
    "A final score and estimated crack time are generated based on 10 billion guesses/second."
];

const DISCLAIMER = "This tool runs entirely in your browser. Your password is never sent to any server. The strength estimation is a simulation based on current computing power and known cracking techniques. Always use a unique, complex password for every account.";

const PasswordStrength = () => {
    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState({
        length: 0,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSymbol: false,
        entropy: 0,
        score: 0, // 0-100
        isCommon: false,
        breachRisk: "Unknown" as "Very High" | "High" | "Medium" | "Low" | "Very Low" | "Unknown",
        crackTime: "Instant",
        crackTimeSeconds: 0
    });
    const [tipIndex, setTipIndex] = useState(0);

    // --- Generator Options ---
    const [genOptions, setGenOptions] = useState({
        upper: true,
        lower: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false
    });

    // --- Real-time Analysis ---
    useEffect(() => {
        if (!password) {
            setStats({
                length: 0,
                hasUpper: false,
                hasLower: false,
                hasNumber: false,
                hasSymbol: false,
                entropy: 0,
                score: 0,
                isCommon: false,
                breachRisk: "Unknown",
                crackTime: "Instant",
                crackTimeSeconds: 0
            });
            return;
        }

        const length = password.length;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

        // Entropy Calculation
        let poolSize = 0;
        if (hasLower) poolSize += 26;
        if (hasUpper) poolSize += 26;
        if (hasNumber) poolSize += 10;
        if (hasSymbol) poolSize += 32;
        if (poolSize === 0) poolSize = 1; // Prevent log(0)

        const entropy = Math.floor(Math.log2(Math.pow(poolSize, length)));

        // Score Calculation (Weighted)
        let score = 0;
        if (length >= 8) score += 10;
        if (length >= 12) score += 20;
        if (length >= 16) score += 20;
        if (hasUpper) score += 10;
        if (hasLower) score += 10;
        if (hasNumber) score += 10;
        if (hasSymbol) score += 20;

        // Penalties
        if (isCommon) score = Math.min(score, 10); // Cap score if common
        if (length < 8) score = Math.min(score, 30); // Cap if too short
        if (!hasUpper && !hasLower && !hasNumber && !hasSymbol) score = 0;

        // Sequence Detection Penalty (e.g. "123", "abc")
        if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
            score -= 10;
        }
        if (/(.)\1{2,}/.test(password)) { // Repeats like "aaa"
            score -= 10;
        }

        score = Math.max(0, Math.min(100, score));

        // Breach Risk Simulation
        let breachRisk: "Very High" | "High" | "Medium" | "Low" | "Very Low" = "Medium";
        if (length < 8 || isCommon) breachRisk = "Very High";
        else if (poolSize <= 36 && length < 10) breachRisk = "High"; // Only letters/numbers & short
        else if (entropy > 60 && length >= 12) breachRisk = "Low";
        else if (entropy > 80 && length >= 16) breachRisk = "Very Low";

        // Crack Time Calculation
        const guessesPerSecond = 10000000000; // 10 Billion
        const secondsToCrack = Math.pow(2, entropy) / guessesPerSecond;

        let timeDisplay = "Instant";
        if (secondsToCrack > 31536000000000) timeDisplay = "Trillions of years";
        else if (secondsToCrack > 31536000000) timeDisplay = "Centuries";
        else if (secondsToCrack > 31536000) timeDisplay = `${Math.floor(secondsToCrack / 31536000)} years`;
        else if (secondsToCrack > 86400) timeDisplay = `${Math.floor(secondsToCrack / 86400)} days`;
        else if (secondsToCrack > 3600) timeDisplay = `${Math.floor(secondsToCrack / 3600)} hours`;
        else if (secondsToCrack > 60) timeDisplay = `${Math.floor(secondsToCrack / 60)} minutes`;
        else if (secondsToCrack > 0) timeDisplay = "Seconds";

        setStats({
            length,
            hasUpper,
            hasLower,
            hasNumber,
            hasSymbol,
            entropy,
            score,
            isCommon,
            breachRisk,
            crackTime: timeDisplay,
            crackTimeSeconds: secondsToCrack
        });

    }, [password]);

    // --- Rotating Tips ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % SECURITY_TIPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // --- Helpers ---
    const getStrengthLabel = () => {
        if (stats.score === 0) return "Too Short";
        if (stats.score < 40) return "Weak";
        if (stats.score < 70) return "Moderate";
        if (stats.score < 90) return "Strong";
        return "Military-Grade";
    };

    const getStrengthColor = () => {
        if (stats.score < 40) return "bg-red-500";
        if (stats.score < 70) return "bg-yellow-500";
        if (stats.score < 90) return "bg-green-500";
        return "bg-cyan-500";
    };

    const getRiskColor = () => {
        switch (stats.breachRisk) {
            case "Very High": return "text-red-500";
            case "High": return "text-orange-500";
            case "Medium": return "text-yellow-500";
            case "Low": return "text-green-500";
            case "Very Low": return "text-cyan-500";
            default: return "text-white/40";
        }
    };

    // --- Actions ---
    const generatePassword = (len: number) => {
        let charset = "";
        if (genOptions.lower) charset += "abcdefghijklmnopqrstuvwxyz";
        if (genOptions.upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (genOptions.numbers) charset += "0123456789";
        if (genOptions.symbols) charset += "!@#$%^&*()_+";

        if (genOptions.excludeAmbiguous) {
            charset = charset.replace(/[l1I0O]/g, "");
        }

        if (charset === "") {
            toast.error("Please select at least one character type!");
            return;
        }

        let newPass = "";
        const array = new Uint32Array(len);
        crypto.getRandomValues(array);
        for (let i = 0; i < len; i++) {
            newPass += charset.charAt(array[i] % charset.length);
        }
        setPassword(newPass);
    };

    const copyToClipboard = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        toast.success("Password copied to clipboard!");
    };

    const toggleOption = (key: keyof typeof genOptions) => {
        setGenOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ToolPageLayout
            title="Password Strength Checker"
            description="Advanced entropy analysis and security evaluation."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        A client-side analysis tool that evaluates the strength of your password based on entropy, pattern recognition, and known leak databases.
                    </p>
                    <p className="mt-2">
                        It provides real-time feedback on how to improve your password's complexity and resistance to brute-force attacks.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Main Input Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-white/5 bg-[#111111] backdrop-blur-xl">
                        <CardContent className="p-8">
                            {/* Input Field */}
                            <div className="relative mb-8">
                                <input
                                    type={isVisible ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Type a password to analyze..."
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-6 py-5 text-xl md:text-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono tracking-wider"
                                />
                                <button
                                    onClick={() => setIsVisible(!isVisible)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    {isVisible ? <EyeOff size={24} /> : <Eye size={24} />}
                                </button>
                            </div>

                            {/* Strength Meter */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-xs uppercase tracking-wider text-white/40">Strength Verdict</span>
                                        <h2 className={`text-2xl font-bold ${getStrengthColor().replace('bg-', 'text-')} transition-colors duration-300`}>
                                            {password ? getStrengthLabel() : "Waiting for input..."}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-mono font-bold text-white">{stats.score}</span>
                                        <span className="text-sm text-white/40">/100</span>
                                    </div>
                                </div>

                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${getStrengthColor()}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.score}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                    />
                                </div>
                            </div>

                            {/* Common Password Warning */}
                            <AnimatePresence>
                                {stats.isCommon && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-500"
                                    >
                                        <AlertOctagon size={24} />
                                        <div>
                                            <p className="font-bold">Common Password Detected</p>
                                            <p className="text-sm opacity-80">This password appears in known data breaches. Do not use it.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Length */}
                    <StatsCard
                        icon={<Key size={20} className={stats.length >= 12 ? "text-green-500" : "text-yellow-500"} />}
                        label="Length"
                        value={`${stats.length} chars`}
                        subValue={stats.length >= 12 ? "Good length" : "Too short (<12)"}
                        status={stats.length >= 12 ? "success" : "warning"}
                    />

                    {/* Entropy */}
                    <StatsCard
                        icon={<Zap size={20} className="text-cyan-500" />}
                        label="Entropy"
                        value={`${stats.entropy} bits`}
                        subValue={stats.entropy > 60 ? "Hard to crack" : "Easy to crack"}
                        status={stats.entropy > 60 ? "success" : "danger"}
                    />

                    {/* Crack Time */}
                    <StatsCard
                        icon={<Hourglass size={20} className="text-purple-500" />}
                        label="Time to Crack"
                        value={stats.crackTime}
                        subValue="At 10B guesses/sec"
                        status={stats.entropy > 60 ? "success" : "danger"}
                    />

                    {/* Breach Risk */}
                    <Card className="border-white/5 bg-[#111111]">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2 mb-1 text-white/40 text-sm">
                                <Shield size={16} /> Breach Risk
                            </div>
                            <div>
                                <div className={`text-xl font-bold ${getRiskColor()}`}>
                                    {stats.breachRisk}
                                </div>
                                <div className="text-xs text-white/40 mt-1">
                                    Estimated offline check
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Variety */}
                <Card className="border-white/5 bg-[#111111]">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4 text-white/40 text-sm">
                            <RefreshCw size={16} /> Character Variety
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <VarietyBadge label="ABC" active={stats.hasUpper} />
                            <VarietyBadge label="abc" active={stats.hasLower} />
                            <VarietyBadge label="123" active={stats.hasNumber} />
                            <VarietyBadge label="#$@" active={stats.hasSymbol} />
                        </div>
                    </CardContent>
                </Card>

                {/* Generator & Actions */}
                <Card className="border-white/5 bg-[#111111]">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <RefreshCw size={18} className="text-cyan-500" /> Password Generator
                        </h3>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" checked={genOptions.upper} onChange={() => toggleOption('upper')} className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500" />
                                Uppercase (A-Z)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" checked={genOptions.lower} onChange={() => toggleOption('lower')} className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500" />
                                Lowercase (a-z)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" checked={genOptions.numbers} onChange={() => toggleOption('numbers')} className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500" />
                                Numbers (0-9)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" checked={genOptions.symbols} onChange={() => toggleOption('symbols')} className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500" />
                                Symbols (!@#)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" checked={genOptions.excludeAmbiguous} onChange={() => toggleOption('excludeAmbiguous')} className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500" />
                                Exclude Ambiguous (l, 1, O, 0)
                            </label>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                onClick={() => generatePassword(16)}
                                variant="default"
                                className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-500/20"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> Generate Strong (16)
                            </Button>
                            <Button
                                onClick={copyToClipboard}
                                disabled={!password}
                                variant="outline"
                                className="border-white/10 text-white hover:bg-white/5"
                            >
                                <Copy className="mr-2 h-4 w-4" /> Copy Password
                            </Button>
                            <Button
                                onClick={() => setPassword("")}
                                disabled={!password}
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Tips */}
                <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/10"
                >
                    <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                        <Shield size={14} /> Security Tip
                    </h3>
                    <p className="text-white/60 italic">"{SECURITY_TIPS[tipIndex]}"</p>
                </motion.div>

            </div>
        </ToolPageLayout>
    );
};

// --- Sub-components ---

const StatsCard = ({ icon, label, value, subValue, status }: { icon: React.ReactNode, label: string, value: string, subValue: string, status: "success" | "warning" | "danger" }) => (
    <Card className="border-white/5 bg-[#111111]">
        <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/40">{label}</span>
                {icon}
            </div>
            <div>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className={`text-xs mt-1 ${status === "success" ? "text-green-500" :
                    status === "warning" ? "text-yellow-500" : "text-red-500"
                    }`}>
                    {subValue}
                </div>
            </div>
        </CardContent>
    </Card>
);

const VarietyBadge = ({ label, active }: { label: string, active: boolean }) => (
    <div className={`text-center py-1 rounded text-xs font-bold transition-colors ${active ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-white/5 text-white/20 border border-white/5"
        }`}>
        {label}
    </div>
);

export default PasswordStrength;
