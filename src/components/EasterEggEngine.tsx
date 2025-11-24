import { useEffect, useRef, useState } from "react";
import { useEasterEggs } from "@/contexts/EasterEggsContext";
import { toast } from "sonner";
import NeonParticles from "./effects/NeonParticles";
import NeonAura from "./effects/NeonAura";
import RGBGlow from "./effects/RGBGlow";
import MatrixRain from "./effects/MatrixRain";
import GlitchEffect from "./effects/GlitchEffect";
import TrophyUnlock from "./effects/TrophyUnlock";
import HackerMessage from "./effects/HackerMessage";
import FooterGame from "./FooterGame";

const EasterEggEngine = () => {
    const { eggs, unlockEgg, foundEggs } = useEasterEggs();
    const [keyBuffer, setKeyBuffer] = useState("");
    const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [currentLocation, setCurrentLocation] = useState(window.location.pathname + window.location.hash);
    const [activeEffect, setActiveEffect] = useState<{
        type: string;
        eggName?: string;
        message?: string;
    } | null>(null);

    // Track location changes for React Router navigation
    useEffect(() => {
        const checkLocation = () => {
            const newLocation = window.location.pathname + window.location.hash;
            if (newLocation !== currentLocation) {
                setCurrentLocation(newLocation);
            }
        };

        // Check every 100ms for location changes (React Router doesn't always fire events)
        const interval = setInterval(checkLocation, 100);

        // Also listen to popstate and hashchange
        window.addEventListener('popstate', checkLocation);
        window.addEventListener('hashchange', checkLocation);

        return () => {
            clearInterval(interval);
            window.removeEventListener('popstate', checkLocation);
            window.removeEventListener('hashchange', checkLocation);
        };
    }, [currentLocation]);

    // Sound effects - Generate cyber sounds using Web Audio API
    const playSound = (type: 'cyber_whoosh' | 'power_up' | 'digital_pulse' | 'scan_complete' | 'data_transfer' = 'cyber_whoosh') => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            switch (type) {
                case 'cyber_whoosh':
                    const whooshOsc = audioContext.createOscillator();
                    const whooshGain = audioContext.createGain();
                    whooshOsc.connect(whooshGain);
                    whooshGain.connect(audioContext.destination);

                    whooshOsc.type = 'sawtooth';
                    whooshOsc.frequency.setValueAtTime(200, audioContext.currentTime);
                    whooshOsc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.4);

                    whooshGain.gain.setValueAtTime(0, audioContext.currentTime);
                    whooshGain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
                    whooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                    whooshOsc.start(audioContext.currentTime);
                    whooshOsc.stop(audioContext.currentTime + 0.5);
                    break;

                case 'power_up':
                    const powerOsc1 = audioContext.createOscillator();
                    const powerOsc2 = audioContext.createOscillator();
                    const powerGain = audioContext.createGain();

                    powerOsc1.connect(powerGain);
                    powerOsc2.connect(powerGain);
                    powerGain.connect(audioContext.destination);

                    powerOsc1.type = 'sine';
                    powerOsc2.type = 'sine';

                    powerOsc1.frequency.setValueAtTime(220, audioContext.currentTime);
                    powerOsc1.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 1.5);

                    powerOsc2.frequency.setValueAtTime(440, audioContext.currentTime);
                    powerOsc2.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 1.5);

                    powerGain.gain.setValueAtTime(0, audioContext.currentTime);
                    powerGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
                    powerGain.gain.setValueAtTime(0.15, audioContext.currentTime + 1.3);
                    powerGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.0);

                    powerOsc1.start(audioContext.currentTime);
                    powerOsc2.start(audioContext.currentTime);
                    powerOsc1.stop(audioContext.currentTime + 2.0);
                    powerOsc2.stop(audioContext.currentTime + 2.0);
                    break;

                case 'digital_pulse':
                    const pulseOsc = audioContext.createOscillator();
                    const pulseGain = audioContext.createGain();
                    pulseOsc.connect(pulseGain);
                    pulseGain.connect(audioContext.destination);

                    pulseOsc.type = 'square';
                    pulseOsc.frequency.value = 440;

                    const times = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2];
                    times.forEach((time, i) => {
                        pulseGain.gain.setValueAtTime(i % 2 === 0 ? 0.2 : 0, audioContext.currentTime + time);
                    });
                    pulseGain.gain.setValueAtTime(0, audioContext.currentTime + 1.3);

                    pulseOsc.start(audioContext.currentTime);
                    pulseOsc.stop(audioContext.currentTime + 1.5);
                    break;

                case 'scan_complete':
                    const scanOsc = audioContext.createOscillator();
                    const scanGain = audioContext.createGain();
                    scanOsc.connect(scanGain);
                    scanGain.connect(audioContext.destination);

                    scanOsc.type = 'triangle';
                    scanOsc.frequency.setValueAtTime(600, audioContext.currentTime);
                    scanOsc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
                    scanOsc.frequency.setValueAtTime(1200, audioContext.currentTime + 0.15);
                    scanOsc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);

                    scanGain.gain.setValueAtTime(0.2, audioContext.currentTime);
                    scanGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

                    scanOsc.start(audioContext.currentTime);
                    scanOsc.stop(audioContext.currentTime + 0.4);
                    break;

                case 'data_transfer':
                    const dataOsc = audioContext.createOscillator();
                    const dataGain = audioContext.createGain();
                    dataOsc.connect(dataGain);
                    dataGain.connect(audioContext.destination);

                    dataOsc.type = 'sine';
                    dataOsc.frequency.setValueAtTime(400, audioContext.currentTime);

                    for (let i = 0; i < 8; i++) {
                        const time = audioContext.currentTime + (i * 0.12);
                        dataOsc.frequency.setValueAtTime(400 + (i * 100), time);
                    }

                    dataGain.gain.setValueAtTime(0.18, audioContext.currentTime);
                    dataGain.gain.setValueAtTime(0.18, audioContext.currentTime + 0.9);
                    dataGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);

                    dataOsc.start(audioContext.currentTime);
                    dataOsc.stop(audioContext.currentTime + 1.2);
                    break;
            }
        } catch (e) {
            // console.error("Audio play failed", e);
        }
    };

    // Execute Action - Eggs are REUSABLE (trigger unlimited times, mark found once)
    const executeAction = (egg: any) => {
        if (!egg.is_active) return;

        // Unlock the egg ONLY if not already found (one-time unlock)
        if (!foundEggs.includes(egg.id)) {
            unlockEgg(egg.id);
        }

        // Perform action EVERY TIME (not just first time)
        switch (egg.action_type) {
            case "neon_particles":
                setActiveEffect({ type: "neon_particles", eggName: egg.name });
                playSound('power_up');
                break;
            case "neon_aura":
                setActiveEffect({ type: "neon_aura" });
                playSound('scan_complete');
                break;
            case "rgb_glow":
                setActiveEffect({ type: "rgb_glow" });
                playSound('scan_complete');
                break;
            case "matrix_rain":
                setActiveEffect({ type: "matrix_rain" });
                playSound('digital_pulse');
                break;
            case "hacker_message":
                setActiveEffect({
                    type: "hacker_message",
                    eggName: egg.name,
                    message: egg.description || "You found a secret!"
                });
                playSound('data_transfer');
                break;
            case "glitch_effect":
                setActiveEffect({ type: "glitch_effect" });
                playSound('digital_pulse');
                break;
            case "sound_ping":
                playSound('cyber_whoosh');
                toast.success(`🎵 ${egg.name}`, {
                    description: egg.description,
                });
                break;
            case "trophy_unlock":
                setActiveEffect({ type: "trophy_unlock", eggName: egg.name });
                playSound('power_up');
                break;
            case "dino_game":
                setActiveEffect({ type: "dino_game", eggName: egg.name });
                playSound('power_up');
                break;
            default:
                toast.success(`You found: ${egg.name}!`, {
                    description: egg.description,
                });
                playSound('cyber_whoosh');
        }
    };

    // 1. Keyword Trigger - GLOBAL
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const char = e.key.toLowerCase();
            if (char.length !== 1) return;

            setKeyBuffer(prev => {
                const newBuffer = (prev + char).slice(-20);

                eggs.forEach(egg => {
                    if (egg.trigger_type === "keyword" && egg.trigger_value && newBuffer.endsWith(egg.trigger_value.toLowerCase())) {
                        executeAction(egg);
                    }
                });

                return newBuffer;
            });

            if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
            bufferTimeoutRef.current = setTimeout(() => setKeyBuffer(""), 5000);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [eggs]);

    // 2. UI Interaction (data-ee) - GLOBAL
    useEffect(() => {
        const handleUIInteraction = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const triggerElement = target.closest("[data-ee]");

            if (triggerElement) {
                const triggerValue = triggerElement.getAttribute("data-ee");

                eggs.forEach(egg => {
                    if (egg.trigger_type === "ui_interaction" && egg.trigger_value === triggerValue) {
                        executeAction(egg);
                    }
                });
            }
        };

        window.addEventListener("click", handleUIInteraction);
        return () => window.removeEventListener("click", handleUIInteraction);
    }, [eggs]);

    // 3. Scroll to Bottom - GLOBAL
    useEffect(() => {
        const handleScroll = () => {
            const scrolledToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;

            if (scrolledToBottom) {
                eggs.forEach(egg => {
                    if (egg.trigger_type === "scroll_bottom") {
                        executeAction(egg);
                    }
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [eggs]);

    // 4. Hover Element (data-ee-hover) - GLOBAL with debounce
    useEffect(() => {
        const hoveredElements = new Set<string>();

        const handleMouseEnter = (e: Event) => {
            const target = e.target as HTMLElement;
            const hoverElement = target.closest("[data-ee-hover]");

            if (hoverElement) {
                const triggerValue = hoverElement.getAttribute("data-ee-hover");

                if (triggerValue && !hoveredElements.has(triggerValue)) {
                    hoveredElements.add(triggerValue);

                    eggs.forEach(egg => {
                        if (egg.trigger_type === "hover_element" && egg.trigger_value === triggerValue) {
                            executeAction(egg);
                        }
                    });
                }
            }
        };

        const handleMouseLeave = (e: Event) => {
            const target = e.target as HTMLElement;
            const hoverElement = target.closest("[data-ee-hover]");

            if (hoverElement) {
                const triggerValue = hoverElement.getAttribute("data-ee-hover");
                if (triggerValue) {
                    hoveredElements.delete(triggerValue);
                }
            }
        };

        window.addEventListener("mouseenter", handleMouseEnter, true);
        window.addEventListener("mouseleave", handleMouseLeave, true);

        return () => {
            window.removeEventListener("mouseenter", handleMouseEnter, true);
            window.removeEventListener("mouseleave", handleMouseLeave, true);
        };
    }, [eggs]);

    // 5. Click Navigation Icon (data-ee) - GLOBAL
    useEffect(() => {
        const handleNavClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const navElement = target.closest("[data-ee]");

            if (navElement) {
                const triggerValue = navElement.getAttribute("data-ee");

                eggs.forEach(egg => {
                    if (egg.trigger_type === "click_nav_icon" && egg.trigger_value === triggerValue) {
                        executeAction(egg);
                    }
                });
            }
        };

        window.addEventListener("click", handleNavClick);
        return () => window.removeEventListener("click", handleNavClick);
    }, [eggs]);

    // 6. Navigate to Section - GLOBAL with /#section format support
    useEffect(() => {
        const checkSectionTriggers = () => {
            const currentHash = window.location.hash; // e.g. "#about"
            const currentFullPath = window.location.pathname + window.location.hash; // e.g. "/#about"

            eggs.forEach(egg => {
                if (egg.trigger_type === "navigate_section" && egg.trigger_value) {
                    // Support multiple formats:
                    // - "/#about" (preset format) -> match both "/#about" and "#about"
                    // - "#about" (direct hash) -> match "#about"
                    // - "about" (plain text) -> add "#" and match
                    let match = false;

                    if (egg.trigger_value.startsWith('/#')) {
                        // Format: /#about - check both full path and hash
                        match = currentFullPath === egg.trigger_value ||
                            currentHash === egg.trigger_value.substring(1); // Remove leading /
                    } else if (egg.trigger_value.startsWith('#')) {
                        // Format: #about - check hash only
                        match = currentHash === egg.trigger_value;
                    } else {
                        // Format: about - add # and check
                        match = currentHash === `#${egg.trigger_value}`;
                    }

                    if (match) {
                        executeAction(egg);
                    }
                }
            });
        };

        // Check on mount and hash change
        checkSectionTriggers();

        const handleHashChange = () => {
            checkSectionTriggers();
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [eggs, currentLocation]); //  Re-check whenever eggs OR location changes

    // Render active effect
    const renderEffect = () => {
        if (!activeEffect) return null;

        const handleComplete = () => setActiveEffect(null);

        switch (activeEffect.type) {
            case "neon_particles":
                return <NeonParticles onComplete={handleComplete} />;
            case "neon_aura":
                return <NeonAura onComplete={handleComplete} />;
            case "rgb_glow":
                return <RGBGlow onComplete={handleComplete} />;
            case "matrix_rain":
                return <MatrixRain onComplete={handleComplete} />;
            case "glitch_effect":
                return <GlitchEffect onComplete={handleComplete} />;
            case "trophy_unlock":
                return <TrophyUnlock eggName={activeEffect.eggName || ""} onComplete={handleComplete} />;
            case "hacker_message":
                return (
                    <HackerMessage
                        title={activeEffect.eggName || "Secret Found"}
                        message={activeEffect.message || "You discovered something hidden!"}
                        onComplete={handleComplete}
                    />
                );
            case "dino_game":
                return <FooterGame onClose={handleComplete} />;
            default:
                return null;
        }
    };

    return <>{renderEffect()}</>;
};

export default EasterEggEngine;
