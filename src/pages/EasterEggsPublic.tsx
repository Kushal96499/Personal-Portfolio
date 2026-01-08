import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Unlock, Lock, Eye, EyeOff, Terminal, Search, Code, Keyboard, MousePointer, Trophy } from "lucide-react";
import Footer from "@/components/Footer";
import { useEasterEggs } from "@/contexts/EasterEggsContext";

const ACTION_PRESETS: Record<string, { icon: React.ReactNode; label: string }> = {
    konami: { icon: <Keyboard className="w-4 h-4" />, label: "Konami Code" },
    click: { icon: <MousePointer className="w-4 h-4" />, label: "Click Sequence" },
    hover: { icon: <MousePointer className="w-4 h-4" />, label: "Hover Pattern" },
    type: { icon: <Keyboard className="w-4 h-4" />, label: "Type Keyword" },
    code: { icon: <Code className="w-4 h-4" />, label: "Dev Console" },
};

const EasterEggsPublic = () => {
    const { eggs, foundEggs } = useEasterEggs();
    const [visibleHints, setVisibleHints] = useState<Record<string, boolean>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeEggs = eggs.filter(egg => egg.is_active);
    // Only count found eggs that are still active/exist
    const foundCount = foundEggs.filter(id => activeEggs.some(egg => egg.id === id)).length;
    const totalCount = activeEggs.length;

    const toggleHint = (eggId: string) => {
        setVisibleHints(prev => ({
            ...prev,
            [eggId]: !prev[eggId]
        }));
    };

    if (!mounted) return null;

    return (
        <div className="text-white selection:bg-blue-500/30 font-mono">
            <main className="pt-32 pb-20 container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block p-3 rounded-full bg-white/5 border border-white/10 mb-4"
                    >
                        <Terminal className="w-8 h-8 text-blue-500" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold tracking-tighter"
                    >
                        The <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60">Vault</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/50 max-w-2xl mx-auto"
                    >
                        Discover hidden secrets and unlock achievements across the portfolio.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center mt-6"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-3 backdrop-blur-sm">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="text-white/80 font-mono text-sm md:text-base">
                                Discovered: <span className="text-white font-bold">{foundCount}</span> / <span className="text-white/60">{totalCount}</span>
                            </span>
                        </div>
                    </motion.div>
                </div>

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
                                    className={`bg-white/[0.03] border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 ${isFound ? 'border-blue-500/20 bg-blue-500/5' : ''}`}
                                >
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <CardTitle className={`text-lg font-bold ${isFound ? 'text-blue-400' : 'text-white/60'}`}>
                                            {egg.name}
                                        </CardTitle>
                                        {isFound ? (
                                            <Unlock className="w-5 h-5 text-blue-500" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-white/20" />
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge variant={isFound ? "default" : "outline"} className={isFound ? "bg-blue-500/20 text-blue-400 border-blue-500/20" : "border-white/10 text-white/40"}>
                                                {isFound ? "UNLOCKED" : "LOCKED"}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs bg-white/5 text-white/60 hover:bg-white/10">
                                                {egg.difficulty}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-white/60 min-h-[40px]">
                                            {egg.description}
                                        </p>

                                        {/* Action Preview */}
                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-xs text-white/40 mb-1">Action:</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{ACTION_PRESETS[egg.action_type as keyof typeof ACTION_PRESETS]?.icon || '✨'}</span>
                                                <span className="text-xs font-mono text-white/80">
                                                    {ACTION_PRESETS[egg.action_type as keyof typeof ACTION_PRESETS]?.label || egg.action_type}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hint Section */}
                                        <div className="pt-2">
                                            {(isFound || isHintVisible) ? (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className={`p-3 rounded-md border mb-2 ${isFound ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/10'}`}
                                                >
                                                    <p className={`text-xs italic ${isFound ? 'text-blue-500' : 'text-white/60'}`}>
                                                        {isFound ? '🎉 Secret Revealed: ' : '💡 Hint: '}
                                                        {egg.hint}
                                                    </p>
                                                </motion.div>
                                            ) : null}

                                            {!isFound && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-white/40 hover:text-white hover:bg-white/5"
                                                    onClick={() => toggleHint(egg.id)}
                                                >
                                                    {isHintVisible ? (
                                                        <>
                                                            <EyeOff className="w-4 h-4 mr-2" />
                                                            Hide Hint
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Show Hint
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>

                                        {isFound && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="pt-2"
                                            >
                                                <div className="bg-blue-500/10 p-2 rounded-md border border-blue-500/20 text-center">
                                                    <span className="text-xs text-blue-500 font-mono flex items-center justify-center gap-2">
                                                        <Unlock className="w-3 h-3" />
                                                        UNLOCKED
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EasterEggsPublic;
