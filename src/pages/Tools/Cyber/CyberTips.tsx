import { useState, useEffect, useCallback, useRef } from "react";
import { Lightbulb, Copy, Quote, Check, Sparkles, Shield, Wifi, Lock, Smartphone, UserX, Pause, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// --- Tip Data ---
const CATEGORIES = [
    { id: "all", name: "All Tips", icon: <Shield size={16} /> },
    { id: "password", name: "Passwords", icon: <Lock size={16} /> },
    { id: "phishing", name: "Phishing", icon: <UserX size={16} /> },
    { id: "device", name: "Device Safety", icon: <Smartphone size={16} /> },
    { id: "network", name: "Network", icon: <Wifi size={16} /> },
];

const TIPS_DATA = {
    password: [
        "Use passphrases (e.g., 'Blue-Coffee-Jump-2024') instead of complex short passwords.",
        "Enable Multi-Factor Authentication (MFA) on every account that supports it.",
        "Never reuse passwords. If one site is breached, all your accounts are at risk.",
        "Use a reputable Password Manager to generate and store unique passwords.",
        "Avoid using personal information like birthdays or pet names in passwords.",
        "Change your passwords immediately if you suspect a breach.",
        "Don't share your OTP (One-Time Password) with anyone, ever.",
        "Check if your email has been pwned using services like HaveIBeenPwned.",
        "Use biometric authentication (FaceID/Fingerprint) where available for convenience and security.",
        "Log out of sessions on shared computers immediately after use.",
        "Passwords should be at least 12-16 characters long for maximum security.",
        "Use different passwords for email, banking, and social media accounts.",
        "Enable password history to prevent reusing old passwords.",
        "Never write passwords on sticky notes or in plain text files.",
        "Use password generators that include symbols, numbers, and mixed case.",
        "Consider using hardware security keys for critical accounts.",
        "Set up account recovery options before you need them.",
        "Review and revoke old app passwords regularly.",
        "Use passkeys (FIDO2) where available instead of traditional passwords.",
        "Never save passwords in your browser on shared computers.",
        "Create unique security questions with nonsense answers that only you know.",
        "Use temporary passwords for shared accounts and change them after use.",
        "Enable login alerts to know when someone accesses your account.",
        "Never email or text your passwords to anyone.",
        "Use encrypted password vaults with strong master passwords."
    ],
    phishing: [
        "Always check the sender's email address carefully. Display names can be spoofed.",
        "Hover over links before clicking to see the actual destination URL.",
        "Be skeptical of urgent requests (e.g., 'Act now or account suspended').",
        "Never download attachments from unknown senders.",
        "Verify suspicious requests from 'friends' or 'bosses' via a separate channel.",
        "Don't click on 'Unsubscribe' links in spam emails; it confirms your email is active.",
        "Watch out for subtle typos in domain names (e.g., 'g0ogle.com').",
        "Legitimate companies will never ask for your password via email.",
        "Be wary of 'You won a prize' pop-ups or messages.",
        "Use a browser extension that blocks known phishing sites.",
        "Check for grammar and spelling mistakes in suspicious emails.",
        "Don't trust caller ID - scammers can spoof phone numbers.",
        "Never give out verification codes sent to your phone.",
        "Beware of fake LinkedIn job offers requesting personal information.",
        "Don't click on shortened URLs from unknown sources.",
        "Enable email filtering to catch potential phishing attempts.",
        "Report phishing emails to your email provider and the company being impersonated.",
        "Be suspicious of emails with generic greetings like 'Dear Customer'.",
        "Verify requests for wire transfers or gift cards through official channels.",
        "Don't trust pop-ups asking you to call tech support.",
        "Be cautious of QR codes from unknown sources - they can lead to phishing sites.",
        "Check the URL bar for HTTPS and the correct domain before entering credentials.",
        "Be wary of emails claiming your account will be closed unless you verify information.",
        "Never share your Social Security Number via email or unsolicited calls.",
        "Use anti-phishing toolbars and security software."
    ],
    device: [
        "Keep your operating system and apps updated to patch security vulnerabilities.",
        "Install antivirus software and run regular scans.",
        "Enable 'Find My Device' to locate or wipe your phone if lost.",
        "Avoid using public USB charging stations (Juice Jacking). Use a power bank instead.",
        "Download apps only from official stores (App Store, Google Play).",
        "Encrypt your hard drive (BitLocker for Windows, FileVault for Mac).",
        "Disable Bluetooth and Wi-Fi when not in use to prevent tracking.",
        "Cover your webcam when not in use.",
        "Set a short screen timeout to lock your device automatically.",
        "Regularly back up your data to an external drive or secure cloud.",
        "Remove unnecessary apps and browser extensions to reduce attack surface.",
        "Use a strong PIN or biometric lock on all devices.",
        "Disable lock screen notifications that show sensitive information.",
        "Review app permissions regularly and revoke unnecessary access.",
        "Enable automatic security updates on all devices.",
        "Use a firewall on your computer and router.",
        "Disable auto-run for USB devices to prevent malware.",
        "Keep your BIOS/UEFI firmware updated.",
        "Use full disk encryption on laptops and external drives.",
        "Disable remote access features unless absolutely necessary.",
        "Clear browsing history and cache regularly.",
        "Use sandboxing for running untrusted software.",
        "Enable secure boot to prevent rootkits and bootkits.",
        "Disable unnecessary services and features on your devices.",
        "Use a privacy-focused operating system for sensitive work."
    ],
    network: [
        "Avoid accessing banking apps on public Wi-Fi without a VPN.",
        "Change the default admin password on your home router.",
        "Disable WPS (Wi-Fi Protected Setup) on your router; it's easily hacked.",
        "Use WPA3 encryption for your home Wi-Fi if available.",
        "Create a separate Guest Network for visitors to keep your main devices safe.",
        "Turn off 'Auto-Connect' to Wi-Fi networks on your phone.",
        "Use a privacy-focused DNS provider like Cloudflare (1.1.1.1) or Quad9.",
        "Check for HTTPS (padlock icon) before entering sensitive data.",
        "Disable file sharing on your computer when on public networks.",
        "Update your router's firmware regularly.",
        "Use a VPN when traveling or on untrusted networks.",
        "Disable UPnP on your router to prevent unauthorized port forwarding.",
        "Change your router's default SSID to something non-descriptive.",
        "Hide your SSID broadcast if you don't need public visibility.",
        "Use MAC address filtering for additional security.",
        "Monitor connected devices on your network regularly.",
        "Disable remote management on your router.",
        "Use a separate network for IoT devices (smart home gadgets).",
        "Enable your router's built-in firewall.",
        "Avoid using public Wi-Fi for sensitive transactions.",
        "Use HTTPS Everywhere browser extension.",
        "Disable IPv6 if you don't need it to reduce attack surface.",
        "Set up network logging to detect suspicious activity.",
        "Use DNS-over-HTTPS (DoH) or DNS-over-TLS (DoT).",
        "Regularly check for unauthorized wireless access points near your home."
    ],
    privacy: [
        "Review app permissions regularly. Does a flashlight app really need your location?",
        "Use privacy-focused browsers like Firefox or Brave.",
        "Limit what you share on social media. Attackers use info for social engineering.",
        "Shred sensitive physical documents before trashing them.",
        "Use end-to-end encrypted messaging apps like Signal.",
        "Clear your browser cookies and cache periodically.",
        "Opt-out of data collection in your account settings where possible.",
        "Be careful with 'Sign in with Facebook/Google'. It links your activities.",
        "Use a privacy screen filter when working in public.",
        "Freeze your credit if you don't plan on opening new accounts soon.",
        "Disable ad tracking on your devices and browsers.",
        "Use private browsing mode for sensitive searches.",
        "Review and adjust privacy settings on social media regularly.",
        "Use disposable email addresses for signups you don't trust.",
        "Avoid oversharing location data on social media.",
        "Use a webcam cover when not in video calls.",
        "Disable microphone access for apps that don't need it.",
        "Review third-party app access to your accounts.",
        "Use Tor browser for maximum anonymity when needed.",
        "Disable personalized ads in your Google and Facebook settings.",
        "Use privacy-focused search engines like DuckDuckGo.",
        "Avoid public computers for accessing personal accounts.",
        "Use virtual credit cards for online purchases.",
        "Enable two-factor authentication using authenticator apps, not SMS.",
        "Regularly audit what data companies have about you and request deletion."
    ]
};

const ALL_TIPS = Object.values(TIPS_DATA).flat();

// Quiz Questions (True/False)
const QUIZ_QUESTIONS = [
    { q: "Using the same password across multiple sites is acceptable if it's strong.", a: false, explanation: "Never reuse passwords. One breach compromises all accounts." },
    { q: "Multi-Factor Authentication (MFA) adds an important extra layer of security.", a: true, explanation: "MFA significantly reduces the risk of unauthorized access." },
    { q: "It's safe to click 'Unsubscribe' in emails from unknown senders.", a: false, explanation: "This confirms your email is active and can lead to more spam." },
    { q: "Checking the sender's email address helps identify phishing attempts.", a: true, explanation: "Attackers often use similar-looking but fake email addresses." },
    { q: "Public USB charging stations are safe to use for your phone.", a: false, explanation: "Juice Jacking attacks can install malware through USB ports." },
    { q: "Covering your webcam when not in use enhances privacy.", a: true, explanation: "Hackers can remotely activate webcams without your knowledge." },
    { q: "WPA3 encryption is less secure than WPA2 for Wi-Fi networks.", a: false, explanation: "WPA3 offers stronger encryption and better security than WPA2." },
    { q: "Using public Wi-Fi without a VPN is safe for banking.", a: false, explanation: "Public Wi-Fi is often unencrypted, making data vulnerable to interception." },
    { q: "Passphrases are generally more secure than complex short passwords.", a: true, explanation: "Longer passphrases are harder to crack than short complex passwords." },
    { q: "It's okay to share your OTP code with customer support if they ask.", a: false, explanation: "Legitimate companies never ask for OTP codes." },
    { q: "Enabling automatic software updates helps protect against vulnerabilities.", a: true, explanation: "Updates patch security holes that hackers exploit." },
    { q: "Using the same security answer for all accounts is recommended.", a: false, explanation: "Reusing answers makes all accounts vulnerable if one is compromised." },
    { q: "HTTPS in a URL guarantees a website is safe and legitimate.", a: false, explanation: "HTTPS only encrypts data; phishing sites can still have HTTPS." },
    { q: "Disabling Bluetooth when not in use improves security and battery life.", a: true, explanation: "Active Bluetooth can be exploited for tracking and attacks." },
    { q: "Clicking on shortened URLs from unknown sources is harmless.", a: false, explanation: "Shortened URLs can hide malicious destinations." },
    { q: "Two-factor authentication via SMS is as secure as using an authenticator app.", a: false, explanation: "SMS can be intercepted; authenticator apps are more secure." },
    { q: "It's safe to download apps from third-party app stores.", a: false, explanation: "Third-party stores may host malware-infected apps." },
    { q: "Regularly backing up data protects against ransomware.", a: true, explanation: "Backups allow recovery without paying ransoms." },
    { q: "Using 'password123' is acceptable if you add special characters.", a: false, explanation: "Common passwords are easily cracked regardless of modifications." },
    { q: "Browser password managers are always completely secure.", a: false, explanation: "While convenient, they can be vulnerable if your device is compromised." },
    { q: "Checking for spelling errors can help identify phishing emails.", a: true, explanation: "Phishing emails often contain obvious grammar and spelling mistakes." },
    { q: "Disabling auto-run for USB devices prevents some malware infections.", a: true, explanation: "Auto-run can automatically execute malicious code from USB drives." },
    { q: "It's safe to connect to any Wi-Fi network as long as it has a password.", a: false, explanation: "Even password-protected networks can be malicious or compromised." },
    { q: "Using a VPN encrypts your internet traffic.", a: true, explanation: "VPNs create encrypted tunnels for your data." },
    { q: "Legitimate companies often ask for passwords via email.", a: false, explanation: "No legitimate company will ever ask for your password via email." },
    { q: "Enabling full disk encryption protects data if your device is stolen.", a: true, explanation: "Encryption makes data unreadable without the decryption key." },
    { q: "Clicking on pop-ups claiming your computer is infected is helpful.", a: false, explanation: "These are often scareware tactics to install actual malware." },
    { q: "Using the same email for all accounts improves security.", a: false, explanation: "Using different emails for different services limits exposure from breaches." },
    { q: "Biometric authentication (fingerprint/face ID) is more secure than PINs.", a: true, explanation: "Biometrics are unique and harder to replicate than PINs." },
    { q: "It's safe to use admin accounts for everyday tasks.", a: false, explanation: "Use standard accounts daily; admin privileges increase malware impact." },
    { q: "Clearing browser cookies regularly enhances privacy.", a: true, explanation: "Cookies track your browsing activity across websites." },
    { q: "Antivirus software is unnecessary if you're careful online.", a: false, explanation: "Even careful users benefit from antivirus protection against evolving threats." },
    { q: "Social media privacy settings should be reviewed regularly.", a: true, explanation: "Settings change and defaults are often not privacy-friendly." },
    { q: "Using public computers for banking is safe if you log out.", a: false, explanation: "Public computers may have keyloggers or malware installed." },
    { q: "Hardware security keys provide the strongest form of 2FA.", a: true, explanation: "Hardware keys are resistant to phishing and remote attacks." },
    { q: "It's okay to click links in texts from unknown numbers if they look official.", a: false, explanation: "Smishing (SMS phishing) is a common attack vector." },
    { q: "Router firmware should be updated regularly.", a: true, explanation: "Firmware updates patch security vulnerabilities in network devices." },
    { q: "Using disposable email addresses for signups protects your main account.", a: true, explanation: "Disposable emails limit spam and data breaches to temporary addresses." },
    { q: "Disabling unnecessary browser extensions reduces security risks.", a: true, explanation: "Extensions can have vulnerabilities or collect data." },
    { q: "It's safe to post vacation photos on social media in real-time.", a: false, explanation: "Broadcasting your absence can make you a target for burglary." },
    { q: "End-to-end encryption means the service provider cannot read your messages.", a: true, explanation: "Only you and the recipient can decrypt properly encrypted messages." },
    { q: "MAC address filtering on Wi-Fi networks is foolproof security.", a: false, explanation: "MAC addresses can be spoofed by attackers." },
    { q: "Using password generators creates more secure passwords than manual creation.", a: true, explanation: "Generators create truly random, complex passwords." },
    { q: "It's safe to scan QR codes from unknown sources.", a: false, explanation: "QR codes can link to phishing sites or trigger malicious downloads." },
    { q: "Freezing your credit protects against identity theft.", a: true, explanation: "Frozen credit prevents opening new accounts in your name." },
    { q: "All free VPN services are trustworthy and secure.", a: false, explanation: "Free VPNs may log data, inject ads, or sell your information." },
    { q: "Hiding your Wi-Fi SSID makes your network completely invisible.", a: false, explanation: "Hidden SSIDs can still be detected with proper tools." },
    { q: "Screen sharing in video calls can inadvertently expose sensitive information.", a: true, explanation: "Always check what's visible before sharing your screen." },
    { q: "Using the same PIN for your phone and banking app is efficient.", a: false, explanation: "Different PINs limit damage if one device is compromised." },
    { q: "Browser fingerprinting can track you even in incognito mode.", a: true, explanation: "Fingerprinting uses device characteristics, not just cookies." },
    { q: "It's safe to trust all HTTPS websites with your credit card.", a: false, explanation: "HTTPS only means encrypted communication, not trustworthiness." },
    { q: "Using a password manager reduces the risk of password reuse.", a: true, explanation: "Password managers encourage unique passwords for each account." },
    { q: "Caller ID can be spoofed to appear as a legitimate number.", a: true, explanation: "Scammers routinely spoof caller IDs to appear trustworthy." },
    { q: "Clicking 'Remember Me' on public computers is convenient and safe.", a: false, explanation: "This allows anyone using that computer to access your account." },
    { q: "Regular security awareness training reduces susceptibility to attacks.", a: true, explanation: "Education is one of the best defenses against social engineering." },
    { q: "Using secure boot prevents some types of rootkits.", a: true, explanation: "Secure boot ensures only trusted software runs at startup." },
    { q: "It's safe to share screenshots of boarding passes on social media.", a: false, explanation: "Barcodes contain sensitive information that can be used fraudulently." },
    { q: "DNS-over-HTTPS (DoH) encrypts DNS queries for privacy.", a: true, explanation: "DoH prevents ISPs and others from seeing which sites you visit." },
    { q: "Jailbreaking or rooting your phone improves security.", a: false, explanation: "This removes security protections and makes devices vulnerable." },
    { q: "Using different browsers for different activities enhances privacy.", a: true, explanation: "Browser isolation limits cross-site tracking." },
    { q: "It's safe to use the same recovery email for all accounts.", a: false, explanation: "Compromising one recovery email could expose all accounts." },
    { q: "Privacy-focused search engines like DuckDuckGo don't track searches.", a: true, explanation: "They don't log or track user searches unlike mainstream alternatives." },
    { q: "Enabling login notifications helps detect unauthorized access.", a: true, explanation: "Alerts warn you immediately of suspicious login attempts." },
    { q: "It's okay to photograph credit cards and store photos in the cloud.", a: false, explanation: "Cloud breaches could expose your financial information." },
    { q: "Using Tor browser provides complete anonymity online.", a: false, explanation: "While enhancing privacy, Tor isn't foolproof and has limitations." },
    { q: "Smart home devices should be on a separate network from computers.", a: true, explanation: "IoT device vulnerabilities won't directly compromise main network." },
    { q: "Email encryption ensures only intended recipients can read messages.", a: true, explanation: "Encryption protects email content from interception." },
    { q: "It's safe to click 'Forgot Password' links in emails.", a: false, explanation: "Navigate directly to the site instead; links could be phishing." },
    { q: "Using virtual credit cards for online shopping adds a security layer.", a: true, explanation: "Virtual cards limit exposure and can be easily canceled." },
    { q: "Disabling location services completely prevents all location tracking.", a: false, explanation: "Cell towers and Wi-Fi can still approximate your location." },
    { q: "Security questions should have truthful, verifiable answers.", a: false, explanation: "Use nonsense answers known only to you for better security." },
    { q: "Regular password changes improve security if passwords are strong.", a: false, explanation: "Frequent changes actually lead to weaker, similar passwords." },
    { q: "Browser extensions can access all data on pages you visit.", a: true, explanation: "Extensions with broad permissions can read sensitive information." },
    { q: "It's safe to download software from torrent sites.", a: false, explanation: "Torrents are common vectors for malware distribution." },
    { q: "Using a firewall on your router and computer adds redundant protection.", a: true, explanation: "Defense in depth provides multiple security layers." },
    { q: "Shredding physical documents protects against identity theft.", a: true, explanation: "Dumpster diving is a real threat; shredding prevents it." },
    { q: "It's okay to reuse passwords after adding a number to the end.", a: false, explanation: "Minor variations are easily guessed by password crackers." },
    { q: "Encrypted messaging apps like Signal protect conversation privacy.", a: true, explanation: "End-to-end encryption ensures private communication." },
    { q: "Using guest mode on browsers provides complete privacy.", a: false, explanation: "Guest mode doesn't hide activity from ISPs or network admins." },
    { q: "Enabling remote desktop access improves convenience without risks.", a: false, explanation: "Remote access is a major attack vector if not properly secured." },
    { q: "Privacy screen filters prevent shoulder surfing in public.", a: true, explanation: "They limit viewing angles, protecting sensitive information." },
    { q: "It's safe to share verification codes with representatives who call you.", a: false, explanation: "Legitimate services never ask for codes via unsolicited calls." },
    { q: "Using passkeys (FIDO2) is more secure than traditional passwords.", a: true, explanation: "Passkeys are phishing-resistant and don't rely on shared secrets." },
    { q: "Disabling IPv6 can reduce your network attack surface.", a: true, explanation: "If not needed, disabling IPv6 eliminates potential vulnerabilities." },
    { q: "It's safe to accept all cookie consent banners to browse faster.", a: false, explanation: "This allows extensive tracking across websites." },
    { q: "Monitoring network traffic can help detect intrusions.", a: true, explanation: "Unusual traffic patterns can indicate security breaches." },
    { q: "Using temp/burner phones for sensitive communications enhances security.", a: true, explanation: "Disposable phones limit tracking and exposure." },
    { q: "It's okay to use default passwords on IoT devices.", a: false, explanation: "Default passwords are publicly known and easily exploited." },
    { q: "Sandboxing applications limits damage from potential malware.", a: true, explanation: "Sandboxes isolate programs from the rest of your system." },
    { q: "Clicking email links is safer than typing URLs manually.", a: false, explanation: "Manually typing ensures you reach the legitimate website." },
    { q: "Using HTTPS Everywhere extension forces encrypted connections.", a: true, explanation: "It automatically upgrades HTTP connections to HTTPS." },
    { q: "It's safe to store passwords in plain text files if encrypted locally.", a: false, explanation: "Use dedicated password managers with proper encryption." },
    { q: "Reviewing account activity regularly helps detect unauthorized access.", a: true, explanation: "Early detection allows faster response to breaches." },
    { q: "Public Wi-Fi networks labeled 'Secure' are safe for sensitive tasks.", a: false, explanation: "Names can be misleading; always use VPN on public networks." },
    { q: "Using a hardware wallet is the most secure way to store cryptocurrency.", a: true, explanation: "Hardware wallets keep private keys offline and secure." },
    { q: "It's okay to share your screen sharing software password with colleagues.", a: false, explanation: "Each person should have their own credentials." },
    { q: "Disabling JavaScript prevents all browser-based attacks.", a: false, explanation: "While reducing risks, it breaks legitimate site functionality." },
    { q: "Account recovery options should be reviewed and updated regularly.", a: true, explanation: "Outdated recovery info can lock you out or help attackers." }
];

const CyberTips = () => {
    const [category, setCategory] = useState("all");
    const [currentTip, setCurrentTip] = useState("");
    const [tipIndex, setTipIndex] = useState(-1);
    const [copied, setCopied] = useState(false);
    const [autoMode, setAutoMode] = useState(false);
    const [tipsGenerated, setTipsGenerated] = useState(0);
    const [proModeUnlocked, setProModeUnlocked] = useState(false);
    const [quizMode, setQuizMode] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState<{ q: string, a: boolean, explanation: string } | null>(null);
    const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(null);
    const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

    const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- Logic ---
    const getActiveTips = useCallback(() => {
        if (category === "all") return ALL_TIPS;
        return TIPS_DATA[category as keyof typeof TIPS_DATA] || ALL_TIPS;
    }, [category]);

    // --- Quiz Logic ---
    const generateQuiz = useCallback(() => {
        const randomQuestion = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
        setQuizQuestion(randomQuestion);
        setQuizResult(null);
    }, []);

    const generateTip = useCallback(() => {
        const tips = getActiveTips();
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * tips.length);
        } while (newIndex === tipIndex && tips.length > 1);

        setTipIndex(newIndex);
        setCurrentTip(tips[newIndex]);
        setTipsGenerated(prev => prev + 1);
    }, [category, tipIndex, getActiveTips]);

    // Initial load & Category change
    useEffect(() => {
        if (quizMode) {
            generateQuiz();
        } else {
            generateTip();
        }
    }, [category, quizMode]);

    const handleQuizAnswer = (answer: boolean) => {
        if (!quizQuestion) return;
        const isCorrect = answer === quizQuestion.a;
        setQuizResult(isCorrect ? "correct" : "incorrect");
        setQuizScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));

        if (isCorrect) {
            toast.success("Correct! 🎉", { description: quizQuestion.explanation });
        } else {
            toast.error("Incorrect", { description: quizQuestion.explanation });
        }
    };

    // Auto Mode
    useEffect(() => {
        if (autoMode && !quizMode) {
            autoIntervalRef.current = setInterval(generateTip, 5000);
        } else {
            if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
        }
        return () => {
            if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
        };
    }, [autoMode, quizMode, generateTip]);

    // Easter Egg Check
    useEffect(() => {
        if (tipsGenerated >= 10 && !proModeUnlocked) {
            setProModeUnlocked(true);
            toast.success("Cyber Pro Mode Unlocked! 🔓", {
                description: "You're taking security seriously. Keep it up!"
            });
        }
    }, [tipsGenerated, proModeUnlocked]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" && !quizMode) {
                e.preventDefault();
                if (!autoMode) generateTip();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [generateTip, autoMode, quizMode]);

    const copyTip = () => {
        const textToCopy = quizMode && quizQuestion ? quizQuestion.q : currentTip;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <ToolPageLayout
            title="Cybersecurity Tips Generator"
            description="Expert security advice to protect your digital life."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        An interactive educational tool designed to improve your cybersecurity awareness through bite-sized tips and quizzes.
                    </p>
                    <p className="mt-2">
                        Covering topics from password security to network safety, it helps you stay one step ahead of digital threats.
                    </p>
                </div>
            }
            howItWorks={[
                "Select a category of interest or browse 'All Tips'.",
                "Click 'Generate New Tip' or press SPACE to get a random security insight.",
                "Switch to 'Quiz Mode' to test your knowledge with True/False questions.",
                "Use 'Auto-Play' for a continuous stream of learning."
            ]}
            disclaimer="These tips are for educational purposes. Security is a constantly evolving field, and best practices may change."
        >
            <div className="max-w-[800px] mx-auto space-y-8">

                {/* Category Selector */}
                <div className="flex flex-wrap justify-center gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${category === cat.id
                                    ? "bg-white/10 text-white border border-white/20 shadow-sm"
                                    : "bg-transparent text-white/40 border border-transparent hover:bg-white/5 hover:text-white"}
                            `}
                        >
                            {cat.icon}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Main Card */}
                <Card className="border-white/5 bg-[#111111] overflow-hidden relative">
                    <CardContent className="p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center text-center">

                        {/* Quotes */}
                        <div className="absolute top-6 left-6 opacity-10 pointer-events-none">
                            <Quote size={48} className="text-white rotate-180" />
                        </div>
                        <div className="absolute bottom-6 right-6 opacity-10 pointer-events-none">
                            <Quote size={48} className="text-white" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 w-full flex flex-col items-center justify-center flex-grow">

                            <div className="mb-8 relative">
                                <div className="bg-blue-500/10 p-4 rounded-full ring-1 ring-blue-500/20">
                                    <Lightbulb size={40} className="text-blue-400" />
                                </div>
                                {proModeUnlocked && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 bg-yellow-500/10 text-yellow-400 p-1.5 rounded-full border border-yellow-500/20"
                                        title="Pro Mode Unlocked"
                                    >
                                        <Trophy size={14} />
                                    </motion.div>
                                )}
                            </div>

                            <div className="min-h-[140px] flex items-center justify-center w-full px-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={quizMode ? quizQuestion?.q : currentTip}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="max-w-2xl"
                                    >
                                        <p className="text-2xl md:text-3xl font-medium leading-relaxed text-white">
                                            "{quizMode && quizQuestion ? quizQuestion.q : currentTip}"
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {quizMode && quizScore.total > 0 && (
                                <div className="mt-4 text-sm text-white/60">
                                    Score: {quizScore.correct}/{quizScore.total} ({Math.round((quizScore.correct / quizScore.total) * 100)}%)
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-10 flex items-center gap-4 relative z-20">
                            <Button
                                onClick={copyTip}
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                title="Copy"
                            >
                                {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6">

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#111111] px-4 py-2 rounded-full border border-white/5">
                            <Label htmlFor="quiz-mode" className="text-sm font-medium text-white/60 cursor-pointer">Quiz Mode</Label>
                            <Switch id="quiz-mode" checked={quizMode} onCheckedChange={(v) => { setQuizMode(v); if (v) generateQuiz(); else setQuizScore({ correct: 0, total: 0 }); }} />
                        </div>

                        {!quizMode && (
                            <div className="flex items-center gap-2 bg-[#111111] px-4 py-2 rounded-full border border-white/5">
                                <Label htmlFor="auto-mode" className="text-sm font-medium text-white/60 cursor-pointer">Auto-Play</Label>
                                <Switch id="auto-mode" checked={autoMode} onCheckedChange={setAutoMode} />
                            </div>
                        )}
                    </div>

                    {quizMode ? (
                        <div className="flex gap-4">
                            <Button
                                onClick={() => handleQuizAnswer(true)}
                                disabled={!!quizResult}
                                className={`w-32 h-12 text-lg font-bold ${quizResult === 'correct' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                TRUE
                            </Button>
                            <Button
                                onClick={() => handleQuizAnswer(false)}
                                disabled={!!quizResult}
                                className={`w-32 h-12 text-lg font-bold ${quizResult === 'incorrect' ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                FALSE
                            </Button>
                            {quizResult && (
                                <Button onClick={generateQuiz} variant="outline" className="h-12 border-white/20">
                                    Next Question
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Button
                            onClick={generateTip}
                            disabled={autoMode}
                            className={`
                                relative overflow-hidden group/btn
                                h-14 px-10 text-lg rounded-xl
                                font-medium tracking-wide transition-all
                                ${autoMode ? 'opacity-50 cursor-not-allowed bg-white/5' : 'bg-white text-black hover:bg-white/90'}
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {autoMode ? <Pause className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                {autoMode ? "Auto-Playing..." : "Generate New Tip"}
                            </span>
                        </Button>
                    )}

                    {!autoMode && !quizMode && (
                        <p className="text-xs text-white/40 font-mono">
                            Press <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">SPACE</span> to generate
                        </p>
                    )}
                </div>

            </div>
        </ToolPageLayout>
    );
};

export default CyberTips;
