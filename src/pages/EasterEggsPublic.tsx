import { useState } from "react";
import { useEasterEggs } from "@/contexts/EasterEggsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trophy, Lock, Unlock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorTrail from "@/components/CursorTrail";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import { TRIGGER_PRESETS, ACTION_PRESETS } from "@/utils/easterEggPresets";

const EasterEggsPublic = () => {
    const { eggs, foundEggs, settings } = useEasterEggs();
    const [visibleHints, setVisibleHints] = useState<Record<string, boolean>>({});

    const toggleHint = (eggId: string) => {
        setVisibleHints(prev => ({
            ...prev,
            [eggId]: !prev[eggId]
        }));
    };

    const activeEggs = eggs.filter(egg => egg.is_active && !egg.is_secret);
    const foundCount = activeEggs.filter(egg => foundEggs.includes(egg.id)).length;
    const totalCount = activeEggs.length;
    const progress = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

    if (!settings.eggs_page_enabled) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
                <CursorTrail />
                <ParticleBackground />
                <div className="relative z-10">
                    <h1 className="text-4xl font-orbitron text-primary mb-4">404</h1>
                    <p className="text-muted-foreground">This page does not exist... or does it?</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative">
            <ParticleBackground />
            <CursorTrail />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar onLogoClick={() => { }} />

                <main className="flex-grow container mx-auto px-4 py-24">
                    <div className="text-center mb-12 space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-orbitron font-bold text-gradient"
                        >
                            Easter Egg Hunt
                        </motion.h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Discover the hidden secrets of the portfolio. Explore, interact, and unlock achievements!
                        </p>
                    </div>

                    {/* Progress Section with Neon Glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto mb-16 glass p-8 rounded-2xl border border-primary/20 relative overflow-hidden"
                    >
                        {/* Animated top border glow */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                            animate={{
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
                            </div>
                            <span className="text-2xl font-mono text-primary">{foundCount}/{totalCount}</span>
                        </div>

                        <Progress
                            value={progress}
                            className="h-4 bg-muted/50"
                            indicatorClassName="bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                        />

                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            {progress === 100
                                ? "🎉 Incredible! You've found all the secrets! You are a true cyber-explorer."
                                : "Keep exploring! Hints are available if you get stuck."}
                        </p>
                    </motion.div>

                    {/* Eggs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeEggs.map((egg, index) => {
                            const isFound = foundEggs.includes(egg.id);
                            const isHintVisible = visibleHints[egg.id];

                            return (
                                <motion.div
                                    key={egg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className={`bg-card/50 backdrop-blur-sm border-primary/10 transition-all duration-300 hover:border-primary/30 ${isFound ? 'shadow-[0_0_15px_rgba(0,234,255,0.1)] border-primary/40' : ''}`}
                                    >
                                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                                            <CardTitle className={`text-lg font-bold ${isFound ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {egg.name}
                                            </CardTitle>
                                            {isFound ? (
                                                <Unlock className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Lock className="w-5 h-5 text-muted-foreground/50" />
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge variant={isFound ? "default" : "outline"} className={isFound ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}>
                                                    {isFound ? "FOUND" : "LOCKED"}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {egg.difficulty}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground min-h-[40px]">
                                                {egg.description}
                                            </p>

                                            {/* Action Preview */}
                                            <div className="pt-2 border-t border-border/50">
                                                <p className="text-xs text-muted-foreground mb-1">Action:</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{ACTION_PRESETS[egg.action_type as keyof typeof ACTION_PRESETS]?.icon || '✨'}</span>
                                                    <span className="text-xs font-mono text-primary/80">
                                                        {ACTION_PRESETS[egg.action_type as keyof typeof ACTION_PRESETS]?.label || egg.action_type}
                                                    </span>
                                                </div>
                                            </div>

                                            {!isFound && (
                                                <div className="pt-2">
                                                    {isHintVisible ? (
                                                        <>
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="bg-primary/5 p-3 rounded-md border border-primary/10 mb-2"
                                                            >
                                                                <p className="text-xs text-primary/80 italic">
                                                                    💡 Hint: {egg.hint}
                                                                </p>
                                                            </motion.div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="w-full text-muted-foreground hover:text-primary"
                                                                onClick={() => toggleHint(egg.id)}
                                                            >
                                                                <EyeOff className="w-4 h-4 mr-2" />
                                                                Hide Hint
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="w-full text-muted-foreground hover:text-primary"
                                                            onClick={() => toggleHint(egg.id)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Show Hint
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            {isFound && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="pt-2 space-y-2"
                                                >
                                                    <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                                                        <p className="text-xs text-green-500 font-mono text-center">
                                                            STATUS: UNLOCKED ✓
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
                                                        onClick={() => {
                                                            // Dispatch custom event to trigger egg
                                                            window.dispatchEvent(new CustomEvent('trigger_egg', { detail: egg }));
                                                        }}
                                                    >
                                                        Run Effect
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </main>

                <Footer onCopyrightClick={() => { }} />
            </div>
        </div>
    );
};

export default EasterEggsPublic;
