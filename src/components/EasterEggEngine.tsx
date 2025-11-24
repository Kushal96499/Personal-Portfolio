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

const EasterEggEngine = () => {
    const { eggs, unlockEgg, foundEggs } = useEasterEggs();
    const [keyBuffer, setKeyBuffer] = useState("");
    const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [activeEffect, setActiveEffect] = useState<{
        type: string;
        eggName?: string;
        message?: string;
    } | null>(null);

    // Track triggered eggs to prevent duplicate triggers in same session
    const triggeredEggsRef = useRef<Set<string>>(new Set());

    // Track path changes
    useEffect(() => {
        const handlePathChange = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener('popstate', handlePathChange);
        window.addEventListener('hashchange', handlePathChange);

        return () => {
            window.removeEventListener('popstate', handlePathChange);
            window.removeEventListener('hashchange', handlePathChange);
        };
    }, []);

    // Sound effects - Generate cyber sounds using Web Audio API
    const playSound = (type: 'cyber_whoosh' | 'power_up' | 'digital_pulse' | 'scan_complete' | 'data_transfer' = 'cyber_whoosh') => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            switch (type) {
                case 'cyber_whoosh':
                    // Sci-fi whoosh: sweeping frequency (0.5s)
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
                    // Power-up sound: rising tones with harmonics (2s for particles/trophy)
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
                    // Digital pulse: rhythmic beeps (1.5s for glitch/matrix)
                    const pulseOsc = audioContext.createOscillator();
                    const pulseGain = audioContext.createGain();
                    pulseOsc.connect(pulseGain);
                    pulseGain.connect(audioContext.destination);

                    pulseOsc.type = 'square';
                    pulseOsc.frequency.value = 440;

                    // Create pulsing pattern
                    const times = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2];
                    times.forEach((time, i) => {
                        pulseGain.gain.setValueAtTime(i % 2 === 0 ? 0.2 : 0, audioContext.currentTime + time);
                    });
                    pulseGain.gain.setValueAtTime(0, audioContext.currentTime + 1.3);

                    pulseOsc.start(audioContext.currentTime);
                    pulseOsc.stop(audioContext.currentTime + 1.5);
                    break;

                case 'scan_complete':
                    // Scan complete: quick chirp (0.4s for aura/glow)
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
                    // Data transfer: rapid ascending beeps (1.2s for hacker message)
                    const dataOsc = audioContext.createOscillator();
                    const dataGain = audioContext.createGain();
                    dataOsc.connect(dataGain);
                    dataGain.connect(audioContext.destination);

                    dataOsc.type = 'sine';
                    dataOsc.frequency.setValueAtTime(400, audioContext.currentTime);

                    // Create rapid frequency changes
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

    // Execute Action
    const executeAction = (egg: any) => {
        if (!egg.is_active) return;

        // Check if egg was already found (persisted in localStorage)
        if (foundEggs.includes(egg.id)) return;

        // Prevent duplicate triggers in the same session
        if (triggeredEggsRef.current.has(egg.id)) return;
        triggeredEggsRef.current.add(egg.id);

        // Unlock the egg (updates database and local storage)
        unlockEgg(egg.id);

        // Perform action
        switch (egg.action_type) {
            case "neon_particles":
                setActiveEffect({ type: "neon_particles", eggName: egg.name });
                playSound('power_up'); // 2s sound for 3s animation
                break;
            case "neon_aura":
                setActiveEffect({ type: "neon_aura" });
                playSound('scan_complete'); // 0.4s sound for quick effect
                break;
            case "rgb_glow":
                setActiveEffect({ type: "rgb_glow" });
                playSound('scan_complete'); // 0.4s sound for quick effect
                break;
            case "matrix_rain":
                setActiveEffect({ type: "matrix_rain" });
                playSound('digital_pulse'); // 1.5s pulsing sound
                break;
            case "hacker_message":
                setActiveEffect({
                    type: "hacker_message",
                    eggName: egg.name,
                    message: egg.description || "You found a secret!"
                });
                playSound('data_transfer'); // 1.2s data sound
                break;
            case "glitch_effect":
                setActiveEffect({ type: "glitch_effect" });
                playSound('digital_pulse'); // 1.5s pulsing sound
                break;
            case "sound_ping":
                playSound('cyber_whoosh'); // 0.5s sci-fi whoosh (no more boring beep!)
                toast.success(`🎵 ${egg.name}`, {
                    description: egg.description,
                });
                break;
            case "trophy_unlock":
                setActiveEffect({ type: "trophy_unlock", eggName: egg.name });
                playSound('power_up'); // 2s triumphant sound
                break;
            default:
                toast.success(`You found: ${egg.name}!`, {
                    description: egg.description,
                });
                playSound('cyber_whoosh'); // Default sci-fi sound
        }
    };

    // 1. Keyword Trigger
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const char = e.key.toLowerCase();
            if (char.length !== 1) return;

            setKeyBuffer(prev => {
                const newBuffer = (prev + char).slice(-20);

                // Check for matches
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

    // 2. UI Interaction (data-ee)
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

    // 3. Scroll to Bottom
    useEffect(() => {
        const handleScroll = () => {
            const scrolledToBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20;

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

    // 4. Hover Element (data-ee-hover)
    useEffect(() => {
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const hoverElement = target.closest("[data-ee-hover]");

            if (hoverElement) {
                const triggerValue = hoverElement.getAttribute("data-ee-hover");

                eggs.forEach(egg => {
                    if (egg.trigger_type === "hover_element" && egg.trigger_value === triggerValue) {
                        executeAction(egg);
                    }
                });
            }
        };

        window.addEventListener("mouseover", handleMouseOver);
        return () => window.removeEventListener("mouseover", handleMouseOver);
    }, [eggs]);

    // 5. Click Navigation Icon (data-ee)
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

    // 6. Navigate to Section Trigger
    useEffect(() => {
        eggs.forEach(egg => {
            if (egg.trigger_type === "navigate_section" && egg.trigger_value) {
                // Match both full path and hash-based navigation
                const currentFullPath = window.location.pathname + window.location.hash;

                // Exact match for route or hash
                if (currentPath === egg.trigger_value || currentFullPath === egg.trigger_value) {
                    executeAction(egg);
                }
            }
        });
    }, [currentPath, eggs]);

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
            default:
                return null;
        }
    };

    return <>{renderEffect()}</>;
};

export default EasterEggEngine;
