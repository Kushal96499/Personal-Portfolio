import { useState, useEffect, useRef } from "react";
import { Activity, Play, Square, Wifi, WifiOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PingResult {
    id: number;
    latency: number;
    timestamp: string;
    status: "success" | "timeout" | "error";
}

const NetworkPing = () => {
    const [domain, setDomain] = useState("");
    const [isPinging, setIsPinging] = useState(false);
    const [results, setResults] = useState<PingResult[]>([]);
    const [stats, setStats] = useState({ min: 0, max: 0, avg: 0, loss: 0 });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countRef = useRef(0);

    // --- Ping Logic ---
    const ping = async () => {
        if (!domain) return;

        // Format domain
        let url = domain;
        if (!url.startsWith("http")) {
            url = "https://" + url;
        }

        const id = countRef.current + 1;
        countRef.current = id;
        const startTime = performance.now();
        let status: PingResult["status"] = "error";
        let latency = 0;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            await fetch(url, {
                mode: "no-cors",
                cache: "no-cache",
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const endTime = performance.now();
            latency = Math.round(endTime - startTime);
            status = "success";
        } catch (error: any) {
            if (error.name === "AbortError") {
                status = "timeout";
                latency = 3000;
            } else {
                status = "error";
                latency = 0;
            }
        }

        const newResult: PingResult = {
            id,
            latency,
            timestamp: new Date().toLocaleTimeString(),
            status
        };

        setResults(prev => {
            const newResults = [...prev, newResult].slice(-20); // Keep last 20
            updateStats(newResults);
            return newResults;
        });
    };

    const updateStats = (data: PingResult[]) => {
        const validPings = data.filter(r => r.status === "success");
        const total = data.length;
        const failed = data.filter(r => r.status !== "success").length;

        if (validPings.length > 0) {
            const latencies = validPings.map(r => r.latency);
            setStats({
                min: Math.min(...latencies),
                max: Math.max(...latencies),
                avg: Math.round(latencies.reduce((a, b) => a + b, 0) / validPings.length),
                loss: Math.round((failed / total) * 100)
            });
        } else {
            setStats({ min: 0, max: 0, avg: 0, loss: total > 0 ? 100 : 0 });
        }
    };

    const togglePing = () => {
        if (isPinging) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPinging(false);
        } else {
            if (!domain) {
                toast.error("Please enter a domain");
                return;
            }
            setResults([]);
            countRef.current = 0;
            setIsPinging(true);
            ping(); // First ping immediately
            intervalRef.current = setInterval(ping, 1500);
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const HOW_IT_WORKS = [
        "Browser-based Ping: This tool uses the Fetch API with 'no-cors' mode to send HTTP requests to the target domain.",
        "Latency Measurement: It measures the time elapsed between sending the request and receiving a response (or network error).",
        "CORS Limitations: Due to browser security (CORS), we cannot read the actual response content, but we can measure the round-trip time."
    ];

    const DISCLAIMER = "This tool provides an estimation of HTTP latency from your browser to the target server. It is not a raw ICMP ping (which is impossible in a browser). Values may be higher than a terminal ping due to browser overhead and HTTPS handshakes. Results are for educational and diagnostic purposes only.";

    return (
        <ToolPageLayout
            title="Network Ping Tester"
            description="Measure HTTP latency to any domain directly from your browser."
            parentPath="/tools/cyber"
            parentName="Cyber Tools"
            about={
                <div>
                    <p>
                        A browser-based utility to measure the response time (latency) of any public web server.
                        It simulates a 'ping' by measuring the time it takes to handshake with the target server.
                    </p>
                    <p className="mt-2">
                        Useful for checking if a website is reachable, comparing CDN speeds, or diagnosing basic connectivity issues.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-[1000px] mx-auto space-y-8">

                {/* Input & Control */}
                <Card className="bg-[#111111] border-white/5">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-grow space-y-2 w-full">
                            <Label className="text-white/60">Target Domain</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 text-white/40" size={16} />
                                <Input
                                    placeholder="google.com"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="pl-10 font-mono bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
                                    disabled={isPinging}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={togglePing}
                            className={`w-full md:w-auto min-w-[120px] ${isPinging ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" : "bg-blue-600 hover:bg-blue-700 text-white border-none"}`}
                        >
                            {isPinging ? <Square className="mr-2 h-4 w-4 fill-current" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                            {isPinging ? "Stop" : "Start Ping"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Average", value: `${stats.avg} ms`, color: "text-blue-400" },
                        { label: "Min", value: `${stats.min} ms`, color: "text-green-400" },
                        { label: "Max", value: `${stats.max} ms`, color: "text-orange-400" },
                        { label: "Packet Loss", value: `${stats.loss}%`, color: "text-red-400" },
                    ].map((stat, idx) => (
                        <Card key={idx} className="bg-[#111111] border-white/5">
                            <CardContent className="p-4 text-center">
                                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{stat.label}</div>
                                <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Chart & Log */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Chart */}
                    <Card className="lg:col-span-2 bg-[#111111] border-white/5 h-[400px] flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Activity className="text-blue-500" size={20} />
                                Latency Graph
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow w-full pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={results}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="id" stroke="#666" tick={false} axisLine={false} />
                                    <YAxis stroke="#666" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                                        itemStyle={{ color: "#3b82f6" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="latency"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 6, fill: "#3b82f6" }}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Log */}
                    <Card className="lg:col-span-1 bg-[#111111] border-white/5 h-[400px] flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Wifi className="text-blue-500" size={20} />
                                Ping Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto space-y-2 pr-2 font-mono text-xs pt-0">
                            {results.slice().reverse().map((res) => (
                                <div key={res.id} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                                    <span className="text-white/40">#{res.id}</span>
                                    <span className="text-white/40">{res.timestamp}</span>
                                    {res.status === "success" ? (
                                        <span className="text-green-400">{res.latency} ms</span>
                                    ) : (
                                        <span className="text-red-400 flex items-center gap-1">
                                            <WifiOff size={10} /> {res.status}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {results.length === 0 && (
                                <div className="text-center text-white/20 py-10">
                                    Ready to start...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </ToolPageLayout>
    );
};

export default NetworkPing;
