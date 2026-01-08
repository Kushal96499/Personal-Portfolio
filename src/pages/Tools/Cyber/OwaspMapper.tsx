import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Shield, AlertTriangle, FileText, Copy, Check, Info, Server, Lock, Eye, Database, Globe } from "lucide-react";

// --- Data Models ---

interface OWASPCategory {
    id: string;
    name: string;
    description: string;
    remediation_principles: string[];
}

interface VulnerabilityMapping {
    id: string;
    name: string;
    owasp_id: string;
    default_severity: 'Low' | 'Medium' | 'High' | 'Critical';
    impact_summary: string;
}

const OWASP_DATA: Record<string, OWASPCategory> = {
    'A01': {
        id: 'A01:2021',
        name: 'Broken Access Control',
        description: 'Restrictions on what authenticated users are allowed to do are not properly enforced. Attackers can exploit these flaws to access unauthorized functionality and/or data.',
        remediation_principles: ['Deny by default.', 'Implement Role-Based Access Control (RBAC).', 'Disable web server directory listing.', 'Log access control failures.']
    },
    'A02': {
        id: 'A02:2021',
        name: 'Cryptographic Failures',
        description: 'Failures related to cryptography (formerly Sensitive Data Exposure). Often leads to exposure of sensitive data like passwords, health records, or credit cards.',
        remediation_principles: ['Encrypt data at rest and in transit.', 'Use strong, up-to-date algorithms (AES-256, RSA-2048).', 'Disable caching for sensitive responses.', 'Do not use deprecated protocols (TLS 1.0, 1.1).']
    },
    'A03': {
        id: 'A03:2021',
        name: 'Injection',
        description: 'User-supplied data is not validated, filtered, or sanitized by the application. Common types include SQL, NoSQL, OS command, and LDAP injection.',
        remediation_principles: ['Use safe APIs (Parameterized Queries).', 'Use positive server-side input validation.', 'Escape special characters.', 'Limit database permissions.']
    },
    'A04': {
        id: 'A04:2021',
        name: 'Insecure Design',
        description: 'Focuses on risks related to design and architectural flaws. Call for more potential threat modeling, secure design patterns, and reference architectures.',
        remediation_principles: ['Establish a secure development lifecycle.', 'Perform threat modeling.', 'Use secure design patterns.', 'Implement distinct security controls.']
    },
    'A05': {
        id: 'A05:2021',
        name: 'Security Misconfiguration',
        description: 'Missing appropriate security hardening across any part of the application stack, or improperly configured permissions on cloud services.',
        remediation_principles: ['Harden all your environments.', 'Remove unused features and frameworks.', 'Updates and patches are applied timely.', 'Automate verification of configuration effectiveness.']
    },
    'A06': {
        id: 'A06:2021',
        name: 'Vulnerable and Outdated Components',
        description: 'Usage of libraries, frameworks, and other software modules with known vulnerabilities.',
        remediation_principles: ['Remove unused dependencies.', 'Continuously inventory client and server-side components.', 'Monitor for CVEs.', 'Obtain components from official sources.']
    },
    'A07': {
        id: 'A07:2021',
        name: 'Identification and Authentication Failures',
        description: 'Confirmation of the user\'s identity, authentication, and session management is critical to protect against authentication-related attacks.',
        remediation_principles: ['Implement multi-factor authentication (MFA).', 'Do not ship with default credentials.', 'Implement weak-password checks.', 'Limit failed login attempts.']
    },
    'A08': {
        id: 'A08:2021',
        name: 'Software and Data Integrity Failures',
        description: 'Code and infrastructure that does not protect against integrity violations. Includes software updates, critical data modification, and CI/CD pipelines.',
        remediation_principles: ['Use digital signatures.', 'Verify source code integrity.', 'Ensure libraries are from trusted repositories.', 'Review code changes.']
    },
    'A09': {
        id: 'A09:2021',
        name: 'Security Logging and Monitoring Failures',
        description: 'Failures in detection, escalation, and response to active breaches. Without logging and monitoring, breaches cannot be detected.',
        remediation_principles: ['Ensure all login, access control, and server-side input validation failures can be logged.', 'Ensure logs are generated in a format that can be easily consumed.', 'Establish an incident response plan.']
    },
    'A10': {
        id: 'A10:2021',
        name: 'Server-Side Request Forgery (SSRF)',
        description: 'SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL.',
        remediation_principles: ['Enforce a positive allow list.', 'Disable HTTP redirections.', 'Validate user-supplied URLs.', 'Use a segmented network architecture.']
    }
};

const VULN_MAPPINGS: VulnerabilityMapping[] = [
    { id: 'v1', name: 'SQL Injection (SQLi)', owasp_id: 'A03', default_severity: 'Critical', impact_summary: 'Allows attackers to execute arbitrary SQL commands, potentially stealing data, modifying records, or deleting tables.' },
    { id: 'v2', name: 'Cross-Site Scripting (Reflected XSS)', owasp_id: 'A03', default_severity: 'High', impact_summary: 'Executing malicious scripts in the victim\'s browser, leading to session hijacking, defacement, or redirection.' },
    { id: 'v3', name: 'Broken Object Level Authorization (BOLA/IDOR)', owasp_id: 'A01', default_severity: 'High', impact_summary: 'Accessing data objects that belong to other users by manipulating identifiers.' },
    { id: 'v4', name: 'Hardcoded API Keys/Secrets', owasp_id: 'A07', default_severity: 'High', impact_summary: 'Exposure of sensitive credentials in source code, allowing unauthorized access to systems.' },
    { id: 'v5', name: 'Missing Security Headers', owasp_id: 'A05', default_severity: 'Low', impact_summary: 'Lack of browser protection layers, increasing susceptibility to XSS, Clickjacking, and other client-side attacks.' },
    { id: 'v6', name: 'Weak Password Policy', owasp_id: 'A07', default_severity: 'Medium', impact_summary: 'Users can set weak passwords that are easily brute-forced or guessed.' },
    { id: 'v7', name: 'Unencrypted Sensitive Data', owasp_id: 'A02', default_severity: 'High', impact_summary: 'Cleartext storage or transmission of sensitive data allows interception or theft.' },
    { id: 'v8', name: 'Using Known Vulnerable Component', owasp_id: 'A06', default_severity: 'Medium', impact_summary: 'Application depends on libraries with known CVEs, making it susceptible to public exploits.' },
    { id: 'v9', name: 'Insufficient Logging', owasp_id: 'A09', default_severity: 'Low', impact_summary: 'Attackers can probe or breach the system without leaving a traceable footprint.' },
    { id: 'v10', name: 'Server-Side Request Forgery (SSRF)', owasp_id: 'A10', default_severity: 'High', impact_summary: 'Server can be tricked into making requests to internal resources, exposing internal networks.' },
    { id: 'v11', name: 'Directory Listing Enabled', owasp_id: 'A05', default_severity: 'Low', impact_summary: 'Attackers can map the directory structure and find hidden files or backups.' },
    { id: 'v12', name: 'Default Credentials', owasp_id: 'A07', default_severity: 'Critical', impact_summary: 'Administrator accounts accessible via publicly known default passwords.' },
];

const OwaspMapper = () => {
    const [selectedVulnId, setSelectedVulnId] = useState<string>("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
    const [likelihood, setLikelihood] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [risk, setRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

    // Auto-fill defaults when vulnerability is selected
    useEffect(() => {
        if (selectedVulnId) {
            const vuln = VULN_MAPPINGS.find(v => v.id === selectedVulnId);
            if (vuln) {
                setSeverity(vuln.default_severity);
                // Reset likelihood to reasonable default
                setLikelihood('Medium');
            }
        }
    }, [selectedVulnId]);

    // Calculate Risk
    useEffect(() => {
        const calculateRisk = () => {
            const sevScore = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 }[severity];
            const likeScore = { 'Low': 1, 'Medium': 2, 'High': 3 }[likelihood];
            const total = sevScore * likeScore;

            if (total >= 9) return 'Critical'; // 3*3, 4*3
            if (total >= 6) return 'High';     // 2*3, 3*2, 4*2
            if (total >= 3) return 'Medium';   // 1*3, 3*1, 2*2, 4*1(maybe)
            return 'Low';
        };
        setRisk(calculateRisk());
    }, [severity, likelihood]);

    const getSelectedVuln = () => VULN_MAPPINGS.find(v => v.id === selectedVulnId);
    const getOwaspData = () => {
        const vuln = getSelectedVuln();
        return vuln ? OWASP_DATA[vuln.owasp_id] : null;
    };

    const copyReport = () => {
        const vuln = getSelectedVuln();
        const owasp = getOwaspData();
        if (!vuln || !owasp) return;

        const report = `**Vulnerability Report**

**Title:** ${vuln.name}
**Severity:** ${severity} (Likelihood: ${likelihood} -> Overall Risk: ${risk})
**OWASP Category:** ${owasp.id} - ${owasp.name}

**Description:**
${description || "No specific description provided."}

**Impact:**
${vuln.impact_summary}

**Remediation:**
${owasp.remediation_principles.map(r => `- ${r}`).join('\n')}

_Generated by OWASP Top 10 Mapper_`;

        navigator.clipboard.writeText(report);
        toast.success("Report copied to clipboard!");
    };

    const loadSample = () => {
        const sample = VULN_MAPPINGS[0]; // SQLi
        setSelectedVulnId(sample.id);
        setDescription("The login parameter 'username' allows unfiltered input. Entering single quotes results in a syntax error, indicating susceptibility to injection.");
        toast.info("Sample finding loaded.");
    };

    const vuln = getSelectedVuln();
    const owasp = getOwaspData();

    // Aesthetic Colors
    const getRiskColor = (r: string) => {
        switch (r) {
            case 'Critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
            case 'High': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
            case 'Medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            case 'Low': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
            default: return 'text-white border-white/10 bg-white/5';
        }
    };

    return (
        <ToolPageLayout
            title="OWASP Top 10 Mapper"
            description="Map vulnerabilities to standard categories and calculate risk."
            disclaimer="This tool is for educational and reporting purposes only."
            parentPath="/tools/cyber"
            parentName="Cyber Security"
            about={
                <div>
                    <p>
                        A professional utility for security auditors and penetration testers to map findings to the OWASP Top 10 standard.
                    </p>
                    <p className="mt-2">
                        It includes a built-in risk calculator (Severity × Likelihood) and generates professional markdown reports suitable for bug bounty submissions or audit logs.
                    </p>
                </div>
            }
            containerVariant="raw"
        >
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Input & Calculator Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT: Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <Card className="bg-[#0A0A0A] border-white/10 h-full">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Shield size={20} className="text-purple-400" /> Finding Input
                                </CardTitle>
                                <CardDescription>Describe your vulnerability finding.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-white/70">Vulnerability Type</Label>
                                    <Select value={selectedVulnId} onValueChange={setSelectedVulnId}>
                                        <SelectTrigger className="bg-[#111] border-white/10 text-white h-12">
                                            <SelectValue placeholder="Select a vulnerability..." />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="bg-[#111] border-white/10 text-white max-h-[250px] overflow-y-auto"
                                            ref={(ref) => {
                                                if (!ref) return;
                                                ref.ontouchstart = (e) => {
                                                    e.stopPropagation();
                                                };
                                            }}
                                        >
                                            <div onWheel={(e) => e.stopPropagation()}>
                                                {VULN_MAPPINGS.map(v => (
                                                    <SelectItem key={v.id} value={v.id} className="cursor-pointer focus:bg-white/10 focus:text-white">
                                                        {v.name}
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white/70">Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Paste finding details, steps to reproduce, or raw payload..."
                                        className="bg-[#111] border-white/10 text-white min-h-[150px] resize-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>

                                <Separator className="bg-white/10" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white/70">Severity</Label>
                                        <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                                            <SelectTrigger className="bg-[#111] border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 text-white">
                                                {['Low', 'Medium', 'High', 'Critical'].map(l => (
                                                    <SelectItem key={l} value={l} className="cursor-pointer focus:bg-white/10">{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white/70">Likelihood</Label>
                                        <Select value={likelihood} onValueChange={(v: any) => setLikelihood(v)}>
                                            <SelectTrigger className="bg-[#111] border-white/10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#111] border-white/10 text-white">
                                                {['Low', 'Medium', 'High'].map(l => (
                                                    <SelectItem key={l} value={l} className="cursor-pointer focus:bg-white/10">{l}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button variant="outline" onClick={loadSample} className="w-full border-white/10 hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                                    Load Sample Finding
                                </Button>
                            </CardContent>
                        </Card>

                        {/* How it Works Section */}
                        <Card className="bg-[#0A0A0A]/50 border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <Info size={16} /> How it Works
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs text-white/50">
                                <p>1. <strong>Select Vulnerability:</strong> Choose a standard finding type from the dropdown.</p>
                                <p>2. <strong>Auto-Mapping:</strong> The tool automatically identifies the relevant OWASP Top 10 (2021) category.</p>
                                <p>3. <strong>Calculate Risk:</strong> Adjust Severity and Likelihood to compute the overall Risk score.</p>
                                <p>4. <strong>Generate Report:</strong> Copy the professional markdown report for your audit/bug bounty.</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* RIGHT: Results & Mapping */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 space-y-6"
                    >
                        {vuln && owasp ? (
                            <div className="space-y-6">
                                {/* Risk Header */}
                                <Card className={`bg-[#0A0A0A] border-l-4 ${getRiskColor(risk).replace('text-', 'border-').split(' ')[1]} border-white/10 overflow-hidden relative`}>
                                    <div className={`absolute top-0 right-0 p-4 opacity-10`}>
                                        <AlertTriangle size={120} />
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                            <div>
                                                <Badge variant="outline" className="mb-2 border-white/20 text-white/50">{owasp.id}</Badge>
                                                <h2 className="text-3xl font-bold text-white mb-1">{vuln.name}</h2>
                                                <p className="text-white/60">{owasp.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Overall Risk</div>
                                                <Badge className={`text-lg px-4 py-1 ${getRiskColor(risk)}`}>
                                                    {risk}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                            <div>
                                                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Eye size={16} className="text-blue-400" /> OWASP Definition</h3>
                                                <p className="text-sm text-white/70 leading-relaxed mb-4">
                                                    {owasp.description}
                                                </p>

                                                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-orange-400" /> Business Impact</h3>
                                                <p className="text-sm text-white/70 leading-relaxed">
                                                    {vuln.impact_summary}
                                                </p>
                                            </div>
                                            <div className="bg-[#111] p-6 rounded-xl border border-white/5">
                                                <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2"><Check size={16} /> Remediation Principles</h3>
                                                <ul className="space-y-3">
                                                    {owasp.remediation_principles.map((principle, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 mt-1.5 shrink-0" />
                                                            {principle}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
                                        <Button onClick={copyReport} className="bg-white text-black hover:bg-white/90">
                                            <Copy size={16} className="mr-2" /> Copy Professional Report
                                        </Button>
                                    </div>
                                </Card>

                                {/* Detailed View (Placeholder for future expansion) */}
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-[#0A0A0A]/50">
                                <div className="text-center text-white/30 p-8">
                                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">No Finding Selected</h3>
                                    <p className="max-w-xs mx-auto">Select a vulnerability type from the left panel to generate mapped insights and a risk report.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
        </ToolPageLayout>
    );
};

export default OwaspMapper;
