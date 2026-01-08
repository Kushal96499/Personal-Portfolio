import { useState, useEffect, useRef } from "react";
import {
    Clock, Globe, Calendar, Hourglass, Activity,
    Play, Pause, RotateCcw, Copy, ArrowRight,
    Sunrise, Sunset, Watch, Timer, CalendarDays, Coffee, Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion, AnimatePresence } from "framer-motion";

// --- Helper Functions ---
const timeZones = (Intl as any).supportedValuesOf("timeZone");

const TimeDateTools = () => {
    // --- 1. Live Clock State ---
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAnalog, setIsAnalog] = useState(false);

    // --- 2. World Time State ---
    const [fromZone, setFromZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [toZone, setToZone] = useState("UTC");
    const [worldTimeResult, setWorldTimeResult] = useState("");

    // --- 3. Unix Timestamp State ---
    const [unixInput, setUnixInput] = useState("");
    const [unixResult, setUnixResult] = useState("");
    const [currentUnix, setCurrentUnix] = useState(Math.floor(Date.now() / 1000));

    // --- 4. Time Difference State ---
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [diffResult, setDiffResult] = useState<any>(null);

    // --- 5. Countdown State ---
    const [countdownInput, setCountdownInput] = useState({ minutes: 5, seconds: 0 });
    const [countdownTime, setCountdownTime] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // --- 6. Age Calculator State ---
    const [birthDate, setBirthDate] = useState("");
    const [ageResult, setAgeResult] = useState<any>(null);

    // --- 7. Stopwatch State ---
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

    // --- 8. Pomodoro State ---
    const [pomodoroMode, setPomodoroMode] = useState<"work" | "short" | "long">("work");
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
    const pomodoroRef = useRef<NodeJS.Timeout | null>(null);

    // --- Effects ---
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            setCurrentUnix(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isTimerRunning && countdownTime > 0) {
            timerRef.current = setTimeout(() => setCountdownTime(t => t - 1), 1000);
        } else if (countdownTime === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            new Audio("/sounds/alarm.mp3").play().catch(() => { }); // Placeholder sound
            toast.success("Timer Finished!");
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isTimerRunning, countdownTime]);

    useEffect(() => {
        if (isStopwatchRunning) {
            stopwatchRef.current = setInterval(() => setStopwatchTime(t => t + 10), 10);
        } else {
            if (stopwatchRef.current) clearInterval(stopwatchRef.current);
        }
        return () => {
            if (stopwatchRef.current) clearInterval(stopwatchRef.current);
        };
    }, [isStopwatchRunning]);

    useEffect(() => {
        if (isPomodoroRunning && pomodoroTime > 0) {
            pomodoroRef.current = setTimeout(() => setPomodoroTime(t => t - 1), 1000);
        } else if (pomodoroTime === 0 && isPomodoroRunning) {
            setIsPomodoroRunning(false);
            new Audio("/sounds/alarm.mp3").play().catch(() => { });
            toast.success("Pomodoro Session Finished!");
        }
        return () => {
            if (pomodoroRef.current) clearTimeout(pomodoroRef.current);
        };
    }, [isPomodoroRunning, pomodoroTime]);

    // --- Handlers ---

    // 2. World Time
    const convertWorldTime = () => {
        try {
            const date = new Date();
            const result = date.toLocaleString("en-US", {
                timeZone: toZone,
                dateStyle: "full",
                timeStyle: "medium"
            });
            setWorldTimeResult(result);
        } catch (e) {
            toast.error("Invalid Timezone");
        }
    };

    // 3. Unix Conversion
    const convertUnix = () => {
        const ts = parseInt(unixInput);
        if (isNaN(ts)) return toast.error("Invalid Timestamp");
        setUnixResult(new Date(ts * 1000).toLocaleString());
    };

    // 4. Time Difference
    const calculateDiff = () => {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = Math.abs(end.getTime() - start.getTime());

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setDiffResult({ days, hours, minutes });
    };

    // 5. Countdown
    const toggleTimer = () => {
        if (!isTimerRunning && countdownTime === 0) {
            setCountdownTime(countdownInput.minutes * 60 + countdownInput.seconds);
        }
        setIsTimerRunning(!isTimerRunning);
    };
    const resetTimer = () => {
        setIsTimerRunning(false);
        setCountdownTime(countdownInput.minutes * 60 + countdownInput.seconds);
    };

    // 6. Age Calculator
    const calculateAge = () => {
        if (!birthDate) return;
        const birth = new Date(birthDate);
        const now = new Date();
        const diff = now.getTime() - birth.getTime();

        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor(diff / (60 * 60 * 1000));

        setAgeResult({ years, days, hours });
    };

    // 7. Stopwatch
    const formatStopwatch = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    };

    const toggleStopwatch = () => setIsStopwatchRunning(!isStopwatchRunning);
    const resetStopwatch = () => {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        setLaps([]);
    };
    const lapStopwatch = () => {
        setLaps(prev => [stopwatchTime, ...prev]);
    };

    // 8. Pomodoro
    const togglePomodoro = () => setIsPomodoroRunning(!isPomodoroRunning);
    const resetPomodoro = () => {
        setIsPomodoroRunning(false);
        setPomodoroTime(pomodoroMode === "work" ? 25 * 60 : pomodoroMode === "short" ? 5 * 60 : 15 * 60);
    };
    const changePomodoroMode = (mode: "work" | "short" | "long") => {
        setPomodoroMode(mode);
        setIsPomodoroRunning(false);
        setPomodoroTime(mode === "work" ? 25 * 60 : mode === "short" ? 5 * 60 : 15 * 60);
    };

    // --- Render Components ---
    const Card = ({ title, icon: Icon, children, className = "" }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group ${className}`}
        >
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Icon className="text-cyan-400 w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white/90">{title}</h3>
            </div>
            {children}
        </motion.div>
    );

    const HOW_IT_WORKS = [
        "Live Clock: Displays current local time in digital format.",
        "World Time: Convert time between any two timezones.",
        "Unix Timestamp: Convert between Unix epoch seconds and human-readable dates.",
        "Stopwatch: Precise timing with lap functionality.",
        "Pomodoro: Focus timer with Work (25m), Short Break (5m), and Long Break (15m) modes.",
        "Countdown: Set a custom timer with alarm."
    ];

    const DISCLAIMER = "Timers and alarms run in your browser tab. If you close the tab or your device sleeps, the timer may pause or fail to alert you.";

    return (
        <ToolPageLayout
            title="Time & Date Suite"
            description="Precision timing tools for developers and power users."
            about={
                <div>
                    <p>
                        A comprehensive suite for all your time-related needs. Track world clocks, convert Unix timestamps, measure intervals with a stopwatch, or focus with a built-in Pomodoro timer.
                    </p>
                    <p className="mt-2">
                        Designed for precision and ease of use, keeping you on schedule across multiple timezones.
                    </p>
                </div>
            }
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
            parentPath="/tools/other"
            parentName="Developer Tools"
        >
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. LIVE CLOCK */}
                <Card title="Live Clock" icon={Clock}>
                    <div className="flex flex-col items-center justify-center h-[200px] relative">
                        <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tabular-nums tracking-wider">
                            {currentTime.toLocaleTimeString([], { hour12: !isAnalog })}
                        </div>
                        <p className="text-muted-foreground mt-2 font-mono text-sm">
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 text-xs text-cyan-400 hover:text-cyan-300"
                            onClick={() => {
                                navigator.clipboard.writeText(currentTime.toString());
                                toast.success("Time copied!");
                            }}
                        >
                            <Copy className="w-3 h-3 mr-1" /> Copy ISO
                        </Button>
                    </div>
                </Card>

                {/* 2. WORLD TIME */}
                <Card title="World Time Converter" icon={Globe}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Convert From</Label>
                            <Select value={fromZone} onValueChange={setFromZone}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {timeZones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-center">
                            <ArrowRight className="text-white/20 rotate-90 md:rotate-0" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Convert To</Label>
                            <Select value={toZone} onValueChange={setToZone}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {timeZones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={convertWorldTime} className="w-full bg-white/5 hover:bg-white/10">Convert</Button>
                        {worldTimeResult && (
                            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-center">
                                <p className="text-cyan-400 font-medium text-sm">{worldTimeResult}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 3. UNIX TIMESTAMP */}
                <Card title="Unix Timestamp" icon={Activity}>
                    <div className="space-y-6">
                        <div className="text-center p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-xs text-muted-foreground mb-1">Current Unix Time</p>
                            <p className="text-2xl font-mono text-green-400 animate-pulse">{currentUnix}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Timestamp to Date</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. 1678900000"
                                    value={unixInput}
                                    onChange={(e) => setUnixInput(e.target.value)}
                                    className="font-mono"
                                />
                                <Button size="icon" onClick={convertUnix}><ArrowRight className="w-4 h-4" /></Button>
                            </div>
                            {unixResult && <p className="text-xs text-cyan-400 mt-1 text-right">{unixResult}</p>}
                        </div>
                    </div>
                </Card>

                {/* 4. TIME DIFFERENCE */}
                <Card title="Time Difference" icon={Hourglass}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start</Label>
                                <Input type="datetime-local" onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>End</Label>
                                <Input type="datetime-local" onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <Button onClick={calculateDiff} className="w-full bg-white/5 hover:bg-white/10">Calculate</Button>

                        {diffResult && (
                            <div className="grid grid-cols-3 gap-2 text-center mt-4">
                                <div className="p-2 bg-white/5 rounded">
                                    <p className="text-xl font-bold text-white">{diffResult.days}</p>
                                    <p className="text-[10px] text-muted-foreground">DAYS</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded">
                                    <p className="text-xl font-bold text-white">{diffResult.hours}</p>
                                    <p className="text-[10px] text-muted-foreground">HOURS</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded">
                                    <p className="text-xl font-bold text-white">{diffResult.minutes}</p>
                                    <p className="text-[10px] text-muted-foreground">MINS</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 5. COUNTDOWN */}
                <Card title="Countdown Timer" icon={Timer}>
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="60" className="stroke-white/10" strokeWidth="4" fill="none" />
                                <circle
                                    cx="64" cy="64" r="60"
                                    className="stroke-cyan-500 transition-all duration-1000"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={377}
                                    strokeDashoffset={377 - (377 * countdownTime) / (countdownInput.minutes * 60 + countdownInput.seconds)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-mono font-bold">
                                {Math.floor(countdownTime / 60)}:{String(countdownTime % 60).padStart(2, '0')}
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <Input
                                type="number"
                                className="w-16 text-center"
                                value={countdownInput.minutes}
                                onChange={(e) => setCountdownInput({ ...countdownInput, minutes: parseInt(e.target.value) || 0 })}
                                disabled={isTimerRunning}
                            />
                            <span className="self-center">:</span>
                            <Input
                                type="number"
                                className="w-16 text-center"
                                value={countdownInput.seconds}
                                onChange={(e) => setCountdownInput({ ...countdownInput, seconds: parseInt(e.target.value) || 0 })}
                                disabled={isTimerRunning}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button size="icon" onClick={toggleTimer} className={isTimerRunning ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"}>
                                {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                            </Button>
                            <Button size="icon" variant="outline" onClick={resetTimer}>
                                <RotateCcw size={18} />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* 6. AGE CALCULATOR */}
                <Card title="Age Calculator" icon={CalendarDays}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input type="date" onChange={(e) => setBirthDate(e.target.value)} />
                        </div>
                        <Button onClick={calculateAge} className="w-full bg-white/5 hover:bg-white/10">Calculate Age</Button>

                        {ageResult && (
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-muted-foreground text-sm">Years</span>
                                    <span className="text-xl font-bold text-cyan-400">{ageResult.years}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-white/5 rounded-lg text-center">
                                        <p className="text-lg font-bold">{ageResult.days}</p>
                                        <p className="text-[10px] text-muted-foreground">TOTAL DAYS</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg text-center">
                                        <p className="text-lg font-bold">{ageResult.hours}</p>
                                        <p className="text-[10px] text-muted-foreground">TOTAL HOURS</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 7. STOPWATCH */}
                <Card title="Stopwatch" icon={Watch}>
                    <div className="flex flex-col items-center">
                        <div className="text-4xl font-mono font-bold text-white mb-6 tabular-nums tracking-wider">
                            {formatStopwatch(stopwatchTime)}
                        </div>
                        <div className="flex gap-2 mb-6">
                            <Button size="icon" onClick={toggleStopwatch} className={isStopwatchRunning ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"}>
                                {isStopwatchRunning ? <Pause size={18} /> : <Play size={18} />}
                            </Button>
                            <Button size="icon" variant="outline" onClick={lapStopwatch} disabled={!isStopwatchRunning}>
                                <Flag size={18} />
                            </Button>
                            <Button size="icon" variant="outline" onClick={resetStopwatch}>
                                <RotateCcw size={18} />
                            </Button>
                        </div>
                        {laps.length > 0 && (
                            <div className="w-full max-h-[100px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                {laps.map((lap, i) => (
                                    <div key={i} className="flex justify-between text-xs text-muted-foreground border-b border-white/5 pb-1">
                                        <span>Lap {laps.length - i}</span>
                                        <span className="font-mono text-white">{formatStopwatch(lap)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 8. POMODORO */}
                <Card title="Pomodoro Focus" icon={Coffee}>
                    <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg">
                            {(["work", "short", "long"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => changePomodoroMode(mode)}
                                    className={`px-3 py-1 text-xs rounded-md capitalize transition-all ${pomodoroMode === mode ? "bg-cyan-500 text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="60" className="stroke-white/10" strokeWidth="4" fill="none" />
                                <circle
                                    cx="64" cy="64" r="60"
                                    className={`transition-all duration-1000 ${pomodoroMode === "work" ? "stroke-red-500" : "stroke-green-500"}`}
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={377}
                                    strokeDashoffset={377 - (377 * pomodoroTime) / (pomodoroMode === "work" ? 25 * 60 : pomodoroMode === "short" ? 5 * 60 : 15 * 60)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-mono font-bold">
                                {Math.floor(pomodoroTime / 60)}:{String(pomodoroTime % 60).padStart(2, '0')}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button size="icon" onClick={togglePomodoro} className={isPomodoroRunning ? "bg-yellow-500/20 text-yellow-500" : "bg-cyan-500/20 text-cyan-500"}>
                                {isPomodoroRunning ? <Pause size={18} /> : <Play size={18} />}
                            </Button>
                            <Button size="icon" variant="outline" onClick={resetPomodoro}>
                                <RotateCcw size={18} />
                            </Button>
                        </div>
                    </div>
                </Card>

            </div>
        </ToolPageLayout>
    );
};

export default TimeDateTools;
