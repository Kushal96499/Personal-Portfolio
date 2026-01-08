import React from 'react';
import ToolsDashboardLayout from '@/components/tools/ToolsDashboardLayout';
import { Shield, Lock, Hash, Globe, Activity, Terminal, Wifi, Microscope, Code, Cookie, Key } from 'lucide-react';

const CyberDashboard = () => {
    const categories = [
        {
            id: "security",
            name: "Security Analysis",
            icon: Shield,
            tools: [
                { id: "password-strength", name: "Password Strength", description: "Test how strong your passwords are.", icon: Lock, path: "/tools/password-strength" },
                { id: "hash-generator", name: "Hash Generator", description: "Generate secure hashes (MD5, SHA-256).", icon: Hash, path: "/tools/hash" },
                { id: "url-safety", name: "URL Safety Checker", description: "Check if a URL is safe or malicious.", icon: Globe, path: "/tools/url-safety" },
                { id: "attack-surface", name: "Attack Surface Analyzer", description: "Analyze URL structure and identifying risk factors.", icon: Microscope, path: "/tools/attack-surface" },
                { id: "param-discovery", name: "Parameter Discovery", description: "Identify and fuzz sensitive URL parameters.", icon: Terminal, path: "/tools/parameter-discovery" },
                { id: "input-reflection", name: "Input Reflection", description: "Simulate XSS reflection risks statically.", icon: Code, path: "/tools/input-reflection" },
                { id: "headers-analyzer", name: "Security Headers", description: "Analyze HTTP response headers for security gaps.", icon: Shield, path: "/tools/headers-analyzer" },
                { id: "cookie-analyzer", name: "Cookie Security", description: "Analyze cookies for security gaps.", icon: Cookie, path: "/tools/cookie-analyzer" },
                { id: "cors-analyzer", name: "CORS Analyzer", description: "Detect dangerous Cross-Origin configurations.", icon: Globe, path: "/tools/cors-analyzer" },
                { id: "jwt-analyzer", name: "JWT Analyzer", description: "Decode and audit JSON Web Tokens.", icon: Key, path: "/tools/cyber/jwt-analyzer" },
                { id: "owasp-mapper", name: "OWASP Top 10 Mapper", description: "Map findings to OWASP categories & risk.", icon: Shield, path: "/tools/cyber/owasp-mapper" },
            ]
        },
        {
            id: "network",
            name: "Network Tools",
            icon: Wifi,
            tools: [
                { id: "ip-address", name: "My IP Address", description: "View your public IP and location info.", icon: Globe, path: "/tools/ip-address" },
                { id: "ping-tester", name: "Ping Tester", description: "Check latency to websites/IPs.", icon: Activity, path: "/tools/ping" },
            ]
        },
        {
            id: "education",
            name: "Education & Tips",
            icon: Terminal,
            tools: [
                { id: "cyber-tips", name: "Cybersecurity Tips", description: "Get random security tips and best practices.", icon: Shield, path: "/tools/tips" },
            ]
        }
    ];

    return (
        <ToolsDashboardLayout
            title="Cybersecurity Tools"
            description="Essential tools for security analysis, network testing, and protection."
            categories={categories}
            basePath="/tools/cyber"
        />
    );
};

export default CyberDashboard;
