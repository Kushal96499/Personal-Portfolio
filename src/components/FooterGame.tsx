import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterGameProps {
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus_small' | 'cactus_large' | 'cactus_group';
}

const FooterGame = ({ onClose }: FooterGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Game Constants (Chrome Dino Specs)
  const GRAVITY = 0.6;
  const JUMP_VELOCITY = -14; // Tuned for snappy jump
  const GROUND_HEIGHT = 20; // Lower ground for more vertical space
  const INITIAL_SPEED = 9; // Slightly slower start for better mobile reaction
  const SPEED_SCALE = 0.001; // Speed increases by 1 every 1000 pixels (approx)
  const MAX_SPEED = 20;

  const gameStateRef = useRef({
    dino: {
      x: 50,
      y: 0,
      width: 44,
      height: 47,
      velocity: 0,
      isJumping: false,
    },
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    groundY: 0,
    speed: INITIAL_SPEED,
    score: 0,
    distance: 0,
  });

  // Sound Effects
  const playSound = (frequency: number, type: "sine" | "square" | "sawtooth", duration: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playJumpSound = () => playSound(350, "square", 0.1);
  const playScoreSound = () => playSound(500, "sine", 0.15);
  const playGameOverSound = () => playSound(150, "sawtooth", 0.3);

  // Initialize High Score
  useEffect(() => {
    const saved = localStorage.getItem("dinoRunnerHighScoreV2");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Responsive width: Fill parent container
        canvas.width = parent.clientWidth;
        // Responsive height: Max 250px, but shorter on small screens to fit landscape
        canvas.height = Math.min(250, window.innerHeight * 0.4);

        gameStateRef.current.groundY = canvas.height - GROUND_HEIGHT;

        // Keep dino on ground during resize
        if (!gameStateRef.current.dino.isJumping) {
          gameStateRef.current.dino.y = gameStateRef.current.groundY - gameStateRef.current.dino.height;
        }
      }
    };

    // Initial resize and listener
    resize();
    window.addEventListener("resize", resize);

    const spawnObstacle = () => {
      const state = gameStateRef.current;
      const minGap = 600; // Minimum distance between obstacles
      const maxGap = 1200;

      const lastObstacle = state.obstacles[state.obstacles.length - 1];

      // Spawn further away on wider screens, but keep safe distance on mobile
      const spawnBuffer = Math.max(600, canvas.width);
      const spawnX = canvas.width + (Math.random() * (maxGap - minGap) + minGap);

      // Only spawn if the last obstacle is far enough OR if there are no obstacles
      // AND ensure we don't spawn immediately on top of the player (check canvas.width)
      if (!lastObstacle || (lastObstacle.x < canvas.width - minGap)) {

        // Safety check: Don't spawn if the calculated spawnX is too close to an existing one
        // (Double check logic)
        if (lastObstacle && spawnX < lastObstacle.x + minGap) {
          return;
        }

        const typeRand = Math.random();
        let width = 30;
        let height = 50;
        let type: Obstacle['type'] = 'cactus_small';

        if (typeRand > 0.8) {
          type = 'cactus_group';
          width = 60;
          height = 50;
        } else if (typeRand > 0.6) {
          type = 'cactus_large';
          width = 35;
          height = 65; // Taller cactus
        }

        state.obstacles.push({
          x: lastObstacle ? Math.max(lastObstacle.x + minGap, spawnX) : Math.max(canvas.width, 800), // First obstacle at least 800px away
          y: state.groundY - height,
          width,
          height,
          type
        });
      }
    };

    const update = (deltaTime: number) => {
      if (!isStarted || isGameOver) return;

      const state = gameStateRef.current;
      // Normalize speed for frame rate (target 60fps -> 16.67ms)
      const timeScale = deltaTime / 16.67;

      // 1. Update Speed & Score
      state.distance += state.speed * timeScale;
      // Slow down score: Divide by 40 instead of 10
      const newScore = Math.floor(state.distance / 40);

      // Only update state/react if score actually changed
      if (newScore > state.score) {
        if (newScore % 100 === 0) {
          playScoreSound();
          state.speed = Math.min(MAX_SPEED, state.speed + 0.5);
        }
        state.score = newScore;
        setScore(newScore);
      }

      // 2. Physics (Dino)
      state.dino.velocity += GRAVITY * timeScale;
      state.dino.y += state.dino.velocity * timeScale;

      const groundLevel = state.groundY - state.dino.height;
      if (state.dino.y >= groundLevel) {
        state.dino.y = groundLevel;
        state.dino.velocity = 0;
        state.dino.isJumping = false;
      }

      // 3. Obstacles
      spawnObstacle();
      state.obstacles.forEach(obs => {
        obs.x -= state.speed * timeScale;
      });
      // Remove off-screen obstacles
      if (state.obstacles.length > 0 && state.obstacles[0].x < -100) {
        state.obstacles.shift();
      }

      // 4. Collision Detection (AABB with padding)
      const padding = 10; // More forgiving hitbox for mobile
      const dinoHitbox = {
        x: state.dino.x + padding,
        y: state.dino.y + padding,
        w: state.dino.width - (padding * 2),
        h: state.dino.height - (padding * 2)
      };

      for (const obs of state.obstacles) {
        const obsHitbox = {
          x: obs.x + padding,
          y: obs.y + padding,
          w: obs.width - (padding * 2),
          h: obs.height - (padding * 2)
        };

        if (
          dinoHitbox.x < obsHitbox.x + obsHitbox.w &&
          dinoHitbox.x + dinoHitbox.w > obsHitbox.x &&
          dinoHitbox.y < obsHitbox.y + obsHitbox.h &&
          dinoHitbox.y + dinoHitbox.h > obsHitbox.y
        ) {
          handleGameOver();
        }
      }
    };

    const draw = () => {
      // Clear
      ctx.fillStyle = "#1a1a1a"; // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const state = gameStateRef.current;

      // Draw Grid (Optimized: larger spacing)
      ctx.strokeStyle = "hsl(222, 47%, 10%)"; // Very subtle
      ctx.lineWidth = 1;
      // Vertical lines every 100px
      for (let i = 0; i < canvas.width; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      // Horizontal lines every 100px
      for (let i = 0; i < canvas.height; i += 100) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw Ground Line
      ctx.beginPath();
      ctx.strokeStyle = "#535353";
      ctx.lineWidth = 2;
      ctx.moveTo(0, state.groundY);
      ctx.lineTo(canvas.width, state.groundY);
      ctx.stroke();

      // Draw Dino
      ctx.fillStyle = "#00ff9d"; // Neon Green
      ctx.fillRect(state.dino.x, state.dino.y, state.dino.width, state.dino.height);
      // Eye
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(state.dino.x + 26, state.dino.y + 4, 4, 4);

      // Draw Obstacles
      ctx.fillStyle = "#ff0055"; // Neon Red
      state.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });
    };

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Cap delta time to prevent huge jumps if tab is inactive
      const cappedDelta = Math.min(delta, 50);

      update(cappedDelta);
      draw();
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isStarted, isGameOver]);

  // Controls
  useEffect(() => {
    const jump = () => {
      const state = gameStateRef.current;
      if (!isStarted) {
        setIsStarted(true);
        return;
      }
      if (isGameOver) {
        restartGame();
        return;
      }
      if (!state.dino.isJumping) {
        state.dino.isJumping = true;
        state.dino.velocity = JUMP_VELOCITY;
        playJumpSound();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener("keydown", handleKeyDown);

    const gameContainer = gameContainerRef.current;
    if (gameContainer) {
      gameContainer.addEventListener("touchstart", handleTouch, { passive: false });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gameContainer) {
        gameContainer.removeEventListener("touchstart", handleTouch);
      }
    };
  }, [isStarted, isGameOver]);

  const handleGameOver = () => {
    setIsGameOver(true);
    playGameOverSound();
    const state = gameStateRef.current;
    if (state.score > highScore) {
      setHighScore(state.score);
      localStorage.setItem("dinoRunnerHighScoreV2", state.score.toString());
    }
  };

  const restartGame = () => {
    const state = gameStateRef.current;
    state.obstacles = [];
    state.score = 0;
    state.distance = 0;
    state.speed = INITIAL_SPEED;
    state.dino.y = state.groundY - state.dino.height;
    state.dino.velocity = 0;
    state.dino.isJumping = false;

    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
    lastTimeRef.current = 0;
  };

  const handleClose = () => {
    setIsStarted(false);
    setIsGameOver(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0a0a0a] border-2 border-[#00ff9d]/30 rounded-lg p-4 md:p-6 max-w-4xl w-full relative shadow-[0_0_30px_rgba(0,255,157,0.1)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:text-white/80 transition-colors p-2 z-50"
            aria-label="Close Game"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wider" style={{ fontFamily: "monospace" }}>
              DINO RUNNER
            </h2>
            <div className="flex justify-center gap-4 md:gap-8 text-sm md:text-lg font-mono">
              <div className="bg-white/5 px-3 py-1 rounded">
                <span className="text-white/60">SCORE </span>
                <span className="text-[#00ff9d] font-bold">{score.toString().padStart(5, '0')}</span>
              </div>
              <div className="bg-white/5 px-3 py-1 rounded">
                <span className="text-white/60">HI </span>
                <span className="text-[#00ff9d] font-bold">{highScore.toString().padStart(5, '0')}</span>
              </div>
            </div>
          </div>

          <div
            ref={gameContainerRef}
            className="relative mb-4 bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10 w-full touch-none"
          >
            <canvas
              ref={canvasRef}
              className="w-full block cursor-pointer"
              style={{ maxHeight: '40vh' }}
            />

            {!isStarted && !isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <p className="text-[#00ff9d] font-mono text-lg md:text-xl mb-2 animate-pulse text-center px-4">
                  PRESS SPACE OR TAP TO START
                </p>
              </div>
            )}

            {isGameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <p className="text-[#ff0055] font-mono text-xl md:text-2xl mb-2 font-bold">GAME OVER</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    restartGame();
                  }}
                  className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 font-mono z-10 relative"
                >
                  <Play className="w-4 h-4 mr-2" />
                  TRY AGAIN
                </Button>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-white/30 font-mono">
            [SPACE] / [UP] or TAP to Jump
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FooterGame;
