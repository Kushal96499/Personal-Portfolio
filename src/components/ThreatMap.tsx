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
    const [totalAttacks, setTotalAttacks] = useState(0);
    const [displayAttacks, setDisplayAttacks] = useState<Attack[]>([]);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const attacksRef = useRef<Attack[]>([]);
    const animationFrameRef = useRef<number>();
    const lastAttackTimeRef = useRef<number>(0);
    const isVisibleRef = useRef<boolean>(false);

    // Initialize loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Intersection Observer to pause when not visible
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = entry.isIntersecting;
            },
            { threshold: 0.1 }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

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

        attacksRef.current = [...attacksRef.current.slice(-9), newAttack];
        setTotalAttacks(prev => prev + 1);
        setDisplayAttacks([...attacksRef.current]);
    };

    // Main animation loop
    const animate = (time: number) => {
        if (!isVisibleRef.current || loading) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
        }

        // Logic check: Generate new attack if needed
        if (time - lastAttackTimeRef.current > 2000 + Math.random() * 2000) {
            generateAttack();
            lastAttackTimeRef.current = time;
        }

        // Update progress of attacks
        attacksRef.current = attacksRef.current
            .map(attack => ({
                ...attack,
                progress: attack.progress + 0.015,
            }))
            .filter(attack => attack.progress < 1.1);

        // Draw
        draw();

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = containerRef.current.getBoundingClientRect();
        
        // Ensure canvas size is correct (handle resize)
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
        }

        ctx.clearRect(0, 0, rect.width, rect.height);

        // 1. Draw world map dots
        countries.forEach(country => {
            const x = country.x * rect.width;
            const y = country.y * rect.height;

            // Simplified Glow (Faster)
            ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // 2. Draw attack arcs
        attacksRef.current.forEach(attack => {
            const startX = attack.sourceX * rect.width;
            const startY = attack.sourceY * rect.height;
            const endX = attack.targetX * rect.width;
            const endY = attack.targetY * rect.height;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - 80;

            // Draw arc path (dimly)
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.2 * (1 - attack.progress)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw moving particle
            if (attack.progress <= 1) {
                const t = attack.progress;
                const pX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
                const pY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

                // Simple particle glow
                ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.beginPath();
                ctx.arc(pX, pY, 8, 0, Math.PI * 2);
                ctx.fill();

                // Particle dot
                ctx.beginPath();
                ctx.arc(pX, pY, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
            }

            // Draw pulse at source if early
            if (attack.progress < 0.2) {
                const x = startX;
                const y = startY;
                const r = 5 + attack.progress * 40;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 * (1 - attack.progress / 0.2)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    };

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [loading]);

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
                    <div className="glass rounded-lg p-4 md:p-6 border-border/50 hover:glow-cyan transition-all duration-300 relative overflow-hidden">
                        {/* Loading State */}
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-20 rounded-lg">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    <Globe className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-primary font-mono mt-4 animate-pulse">Fetching live threat activity...</p>
                            </div>
                        )}

                        {/* Status Badges */}
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                                <span className="text-xs font-mono text-primary">LIVE FEED</span>
                            </div>
                        </div>

                        {/* Canvas Container */}
                        <div
                            ref={containerRef}
                            className="relative w-full h-[300px] md:aspect-[21/9] md:h-auto rounded-lg overflow-hidden bg-black/30 border border-primary/10"
                        >
                            <canvas ref={canvasRef} className="w-full h-full" />
                        </div>

                        {/* Statistics Panel */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="glass rounded-lg p-4 border border-primary/20 text-center">
                                <div className="text-xs text-muted-foreground font-mono mb-1">TOTAL ATTACKS</div>
                                <div className="text-xl md:text-2xl font-bold text-primary font-mono">{totalAttacks.toLocaleString()}</div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary/20 text-center">
                                <div className="text-xs text-muted-foreground font-mono mb-1">ACTIVE THREATS</div>
                                <div className="text-xl md:text-2xl font-bold text-destructive font-mono">{displayAttacks.length}</div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary/20 text-center">
                                <div className="text-xs text-muted-foreground font-mono mb-1">COUNTRIES</div>
                                <div className="text-xl md:text-2xl font-bold text-secondary font-mono">{countries.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Attacks List */}
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-primary mb-4 font-orbitron flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Recent Attack Activity
                        </h3>
                        <div className="glass rounded-lg p-4 border border-border/50 h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent space-y-2">
                            {displayAttacks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Shield className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">Detecting threat activity...</p>
                                </div>
                            ) : (
                                displayAttacks.slice().reverse().map(attack => (
                                    <div
                                        key={attack.id}
                                        className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-primary/10 transition-colors"
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
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ThreatMap;
