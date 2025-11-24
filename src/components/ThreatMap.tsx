import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Lock, AlertTriangle } from 'lucide-react';

interface Attack {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    progress: number;
    sourceCountry: string;
    targetCountry: string;
    type: string;
}

const attackTypes = ['DDoS', 'Malware', 'Phishing', 'Ransomware', 'SQL Injection', 'XSS', 'Brute Force'];
const countries = [
    { name: 'USA', x: 0.15, y: 0.35 },
    { name: 'Brazil', x: 0.25, y: 0.65 },
    { name: 'UK', x: 0.48, y: 0.28 },
    { name: 'Russia', x: 0.65, y: 0.25 },
    { name: 'China', x: 0.75, y: 0.35 },
    { name: 'India', x: 0.70, y: 0.45 },
    { name: 'Japan', x: 0.82, y: 0.35 },
    { name: 'Australia', x: 0.85, y: 0.75 },
    { name: 'Germany', x: 0.50, y: 0.28 },
    { name: 'France', x: 0.48, y: 0.32 },
    { name: 'South Africa', x: 0.52, y: 0.72 },
    { name: 'Canada', x: 0.18, y: 0.25 },
];

const ThreatMap = () => {
    const [loading, setLoading] = useState(true);
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [totalAttacks, setTotalAttacks] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Generate new attacks periodically
    useEffect(() => {
        if (loading) return;

        const generateAttack = () => {
            const source = countries[Math.floor(Math.random() * countries.length)];
            let target = countries[Math.floor(Math.random() * countries.length)];
            while (target === source) {
                target = countries[Math.floor(Math.random() * countries.length)];
            }

            const newAttack: Attack = {
                id: Math.random().toString(36).substr(2, 9),
                sourceX: source.x,
                sourceY: source.y,
                targetX: target.x,
                targetY: target.y,
                progress: 0,
                sourceCountry: source.name,
                targetCountry: target.name,
                type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
            };

            setAttacks(prev => [...prev.slice(-9), newAttack]);
            setTotalAttacks(prev => prev + 1);
        };

        // Generate initial attacks
        for (let i = 0; i < 5; i++) {
            setTimeout(generateAttack, i * 300);
        }

        // Continue generating attacks
        const interval = setInterval(generateAttack, 1500 + Math.random() * 1500);
        return () => clearInterval(interval);
    }, [loading]);

    // Animate attacks
    useEffect(() => {
        if (loading) return;

        const interval = setInterval(() => {
            setAttacks(prev =>
                prev
                    .map(attack => ({
                        ...attack,
                        progress: attack.progress + 0.02,
                    }))
                    .filter(attack => attack.progress < 1.1)
            );
        }, 50);

        return () => clearInterval(interval);
    }, [loading]);

    // Draw on canvas
    useEffect(() => {
        if (loading || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        // Set canvas size with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Draw world map dots (simplified representation)
        countries.forEach(country => {
            const x = country.x * rect.width;
            const y = country.y * rect.height;

            // Glow effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
            gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 15, y - 15, 30, 30);

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw attack arcs
        attacks.forEach(attack => {
            const startX = attack.sourceX * rect.width;
            const startY = attack.sourceY * rect.height;
            const endX = attack.targetX * rect.width;
            const endY = attack.targetY * rect.height;

            // Calculate control point for bezier curve (arc)
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - 100;

            // Draw arc path
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 * (1 - attack.progress)})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw moving particle
            if (attack.progress <= 1) {
                const t = attack.progress;
                const particleX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
                const particleY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

                // Particle glow
                const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 10);
                particleGradient.addColorStop(0, 'rgba(239, 68, 68, 1)');
                particleGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
                particleGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                ctx.fillStyle = particleGradient;
                ctx.fillRect(particleX - 10, particleY - 10, 20, 20);

                // Particle
                ctx.beginPath();
                ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
            }
        });

        // Draw pulsing effect on source nodes
        attacks.forEach(attack => {
            if (attack.progress < 0.3) {
                const x = attack.sourceX * rect.width;
                const y = attack.sourceY * rect.height;
                const pulseRadius = 8 + attack.progress * 20;

                ctx.beginPath();
                ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 * (1 - attack.progress / 0.3)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }, [attacks, loading]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = rect.width * dpr;
                canvasRef.current.height = rect.height * dpr;
                canvasRef.current.style.width = `${rect.width}px`;
                canvasRef.current.style.height = `${rect.height}px`;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <section id="threat-map" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient font-orbitron">
                        🌐 Global Threat Map
                    </h2>
                    <p className="text-lg text-cyan-100/70 max-w-2xl mx-auto">
                        Real-time visualization of cyber attacks and threats detected worldwide.
                    </p>
                </motion.div>

                {/* Threat Map Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="relative w-full max-w-6xl mx-auto"
                >
                    {/* Main Map Card */}
                    <div className="glass rounded-lg p-6 border-border/50 hover:glow-cyan transition-all duration-300 relative overflow-hidden">
                        {/* Loading State */}
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-20 rounded-lg">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    <Globe className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-primary font-mono mt-4 animate-pulse">Fetching live threat activity...</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" style={{ animationDelay: '0.15s' }} />
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" style={{ animationDelay: '0.3s' }} />
                                </div>
                            </div>
                        )}

                        {/* Status Badges */}
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                                <span className="text-xs font-mono text-primary">LIVE FEED</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
                                <Lock className="w-3 h-3 text-primary" />
                                <span className="text-xs font-mono text-primary">SECURE</span>
                            </div>
                        </div>

                        {/* Canvas Container */}
                        <div
                            ref={containerRef}
                            className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden bg-black/30 border border-primary/10"
                        >
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full"
                            />

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-lg pointer-events-none" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-lg pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/40 rounded-bl-lg pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-lg pointer-events-none" />
                        </div>

                        {/* Statistics Panel */}
                        {!loading && (
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                <div className="glass rounded-lg p-4 border border-primary/20 text-center hover:border-primary/40 transition-colors">
                                    <div className="text-xs text-muted-foreground font-mono mb-1">TOTAL ATTACKS</div>
                                    <div className="text-2xl font-bold text-primary font-mono">{totalAttacks.toLocaleString()}</div>
                                </div>
                                <div className="glass rounded-lg p-4 border border-primary/20 text-center hover:border-primary/40 transition-colors">
                                    <div className="text-xs text-muted-foreground font-mono mb-1">ACTIVE THREATS</div>
                                    <div className="text-2xl font-bold text-destructive font-mono">{attacks.length}</div>
                                </div>
                                <div className="glass rounded-lg p-4 border border-primary/20 text-center hover:border-primary/40 transition-colors">
                                    <div className="text-xs text-muted-foreground font-mono mb-1">COUNTRIES</div>
                                    <div className="text-2xl font-bold text-secondary font-mono">{countries.length}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Attacks List */}
                    {!loading && attacks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-6"
                        >
                            <h3 className="text-xl font-bold text-primary mb-4 font-orbitron flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Recent Attack Activity
                            </h3>
                            <div className="glass rounded-lg p-4 border border-border/50 max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                                {attacks.slice(-5).reverse().map(attack => (
                                    <motion.div
                                        key={attack.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-foreground font-medium truncate">
                                                    {attack.type} Attack
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono truncate">
                                                    {attack.sourceCountry} → {attack.targetCountry}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 w-20">
                                            <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-destructive to-orange-500 transition-all duration-300 rounded-full"
                                                    style={{ width: `${Math.min(attack.progress * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default ThreatMap;
