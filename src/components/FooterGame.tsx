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
}

const FooterGame = ({ onClose }: FooterGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("dinoRunnerHighScore") || "0");
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const gameStateRef = useRef({
    dino: {
      x: 50,
      y: 0,
      width: 30,
      height: 40,
      velocityY: 0,
      isJumping: false,
    },
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    trail: [] as TrailPoint[],
    ground: 250,
    gravity: 0.6,
    jumpForce: 12,
    speed: 6,
    obstacleTimer: 0,
    obstacleSpawnTime: 120,
    score: 0,
    frameCount: 0,
    speedIncreaseTimer: 0,
    animationId: null as number | null,
  });

  // Web Audio API sound effects
  const playSound = (frequency: number, duration: number, type: "sine" | "square" | "sawtooth" = "sine") => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playJumpSound = () => {
    playSound(400, 0.1, "square");
  };

  const playLandSound = () => {
    playSound(200, 0.15, "sine");
  };

  const playGameOverSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    
    // Create descending tone for game over
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const createParticles = (x: number, y: number, count: number, color: string) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        maxLife: 20 + Math.random() * 10,
        color,
      });
    }
    return particles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = Math.min(600, window.innerWidth - 40);
      canvas.height = 300;
      gameStateRef.current.ground = canvas.height - 50;
      gameStateRef.current.dino.y = gameStateRef.current.ground - gameStateRef.current.dino.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gameState = gameStateRef.current;

    const jump = () => {
      const groundY = gameState.ground - gameState.dino.height;
      if (gameState.dino.y >= groundY && !isGameOver && isStarted) {
        gameState.dino.isJumping = true;
        gameState.dino.velocityY = -gameState.jumpForce;
        
        playJumpSound();
        
        // Jump particles (reduced count)
        const jumpParticles = createParticles(
          gameState.dino.x + gameState.dino.width / 2,
          gameState.dino.y + gameState.dino.height,
          5,
          "hsl(193, 100%, 50%)"
        );
        gameState.particles.push(...jumpParticles);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!isStarted) {
          setIsStarted(true);
        } else if (isGameOver) {
          handleRestart();
        } else {
          jump();
        }
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      
      if (!isStarted) {
        setIsStarted(true);
      } else if (isGameOver) {
        handleRestart();
      } else {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("touchstart", handleTouch);

    const checkCollision = () => {
      const dino = gameState.dino;

      for (const obstacle of gameState.obstacles) {
        // AABB Collision Detection (Chrome Dino method)
        if (
          dino.x < obstacle.x + obstacle.width &&
          dino.x + dino.width > obstacle.x &&
          dino.y < obstacle.y + obstacle.height &&
          dino.y + dino.height > obstacle.y
        ) {
          return true;
        }
      }
      return false;
    };

    const handleRestart = () => {
      gameState.obstacles = [];
      gameState.particles = [];
      gameState.trail = [];
      gameState.score = 0;
      gameState.speed = 6;
      gameState.obstacleTimer = 0;
      gameState.obstacleSpawnTime = 80 + Math.random() * 40; // 1.3-2.0 seconds at 60fps
      gameState.speedIncreaseTimer = 0;
      gameState.frameCount = 0;
      gameState.dino.y = gameState.ground - gameState.dino.height;
      gameState.dino.velocityY = 0;
      gameState.dino.isJumping = false;
      setScore(0);
      setIsGameOver(false);
      setIsStarted(true);
    };

    const gameLoop = () => {
      if (!canvas || !ctx || !isStarted || isGameOver) {
        return;
      }

      gameState.frameCount++;

      // Clear canvas
      ctx.fillStyle = "hsl(222, 47%, 5%)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid background (optimized - draw every 40px instead of 20px)
      ctx.strokeStyle = "hsl(222, 47%, 15%)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Update dino physics (Chrome Dino style)
      gameState.dino.velocityY += gameState.gravity;
      gameState.dino.y += gameState.dino.velocityY;

      // Ground collision
      const groundY = gameState.ground - gameState.dino.height;
      if (gameState.dino.y >= groundY) {
        gameState.dino.y = groundY;
        gameState.dino.velocityY = 0;
        
        if (gameState.dino.isJumping) {
          gameState.dino.isJumping = false;
          playLandSound();
          
          // Land particles (reduced count)
          const landParticles = createParticles(
            gameState.dino.x + gameState.dino.width / 2,
            gameState.dino.y + gameState.dino.height,
            6,
            "hsl(271, 76%, 53%)"
          );
          gameState.particles.push(...landParticles);
        }
      }

      // Update trail (only every 2 frames for performance)
      if (gameState.frameCount % 2 === 0) {
        gameState.trail.push({
          x: gameState.dino.x + gameState.dino.width / 2,
          y: gameState.dino.y + gameState.dino.height / 2,
          alpha: 1,
        });
      }

      // Limit trail length and fade
      gameState.trail = gameState.trail.slice(-15);
      gameState.trail.forEach((point) => {
        point.alpha *= 0.9;
      });

      // Draw trail (optimized)
      if (gameState.trail.length > 0) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "hsl(193, 100%, 50%)";
        for (let i = 0; i < gameState.trail.length; i++) {
          const point = gameState.trail[i];
          const size = (i / gameState.trail.length) * 3 + 1.5;
          ctx.fillStyle = `hsla(193, 100%, 50%, ${point.alpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Draw dino (optimized shadow)
      ctx.shadowBlur = 15;
      ctx.shadowColor = "hsl(193, 100%, 50%)";
      ctx.fillStyle = "hsl(193, 100%, 50%)";
      ctx.fillRect(gameState.dino.x, gameState.dino.y, gameState.dino.width, gameState.dino.height);
      
      // Dino eye
      ctx.shadowBlur = 0;
      ctx.fillStyle = "hsl(222, 47%, 5%)";
      ctx.fillRect(gameState.dino.x + 20, gameState.dino.y + 8, 5, 5);

      // Spawn obstacles (1.3-2.0 seconds random interval)
      gameState.obstacleTimer++;
      if (gameState.obstacleTimer >= gameState.obstacleSpawnTime) {
        gameState.obstacleTimer = 0;
        gameState.obstacleSpawnTime = 80 + Math.random() * 40; // Random 1.3-2.0s at 60fps
        
        const width = 20 + Math.random() * 20; // 20-40px
        const height = 40 + Math.random() * 20; // 40-60px
        
        // Check for overlapping spawn
        const lastObstacle = gameState.obstacles[gameState.obstacles.length - 1];
        const minDistance = 250;
        
        if (!lastObstacle || canvas.width - lastObstacle.x >= minDistance) {
          gameState.obstacles.push({
            x: canvas.width,
            y: gameState.ground - height,
            width,
            height,
          });
        }
      }

      // Update obstacles (optimized rendering)
      ctx.shadowBlur = 12;
      ctx.shadowColor = "hsl(271, 76%, 53%)";
      ctx.fillStyle = "hsl(271, 76%, 53%)";
      
      gameState.obstacles = gameState.obstacles.filter((obstacle) => {
        obstacle.x -= gameState.speed;
        
        // Draw obstacle
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        return obstacle.x + obstacle.width > 0;
      });
      
      ctx.shadowBlur = 0;

      // Update particles (limit to 30 max for performance)
      if (gameState.particles.length > 30) {
        gameState.particles = gameState.particles.slice(-30);
      }
      
      gameState.particles = gameState.particles.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.life--;

        if (particle.life > 0) {
          const alpha = particle.life / particle.maxLife;
          ctx.fillStyle = particle.color.replace(")", `, ${alpha})`).replace("hsl", "hsla");
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      // Draw ground (optimized)
      ctx.strokeStyle = "hsl(193, 100%, 50%)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "hsl(193, 100%, 50%)";
      ctx.beginPath();
      ctx.moveTo(0, gameState.ground);
      ctx.lineTo(canvas.width, gameState.ground);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Check collision
      if (checkCollision()) {
        setIsGameOver(true);
        playGameOverSound();
        
        if (gameState.score > highScore) {
          setHighScore(gameState.score);
          localStorage.setItem("dinoRunnerHighScore", gameState.score.toString());
        }
        return; // Stop game loop on collision
      }

      // Update score
      gameState.score++;
      if (gameState.score % 10 === 0) {
        setScore(Math.floor(gameState.score / 10));
      }
      
      // Increase speed every 8 seconds (480 frames at 60fps)
      gameState.speedIncreaseTimer++;
      if (gameState.speedIncreaseTimer >= 480) {
        gameState.speed += 0.5;
        gameState.speedIncreaseTimer = 0;
      }

      gameState.animationId = requestAnimationFrame(gameLoop);
    };

    gameState.animationId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("resize", resizeCanvas);
      if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
      }
    };
  }, [isStarted, isGameOver, highScore]);

  const handleStart = () => {
    setIsStarted(true);
    setIsGameOver(false);
  };

  const handleRestart = () => {
    gameStateRef.current.obstacles = [];
    gameStateRef.current.particles = [];
    gameStateRef.current.trail = [];
    gameStateRef.current.score = 0;
    gameStateRef.current.speed = 6;
    gameStateRef.current.obstacleTimer = 0;
    gameStateRef.current.obstacleSpawnTime = 80 + Math.random() * 40;
    gameStateRef.current.speedIncreaseTimer = 0;
    gameStateRef.current.frameCount = 0;
    gameStateRef.current.dino.y = gameStateRef.current.ground - gameStateRef.current.dino.height;
    gameStateRef.current.dino.velocityY = 0;
    gameStateRef.current.dino.isJumping = false;
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  };

  const handleClose = () => {
    if (gameStateRef.current.animationId) {
      cancelAnimationFrame(gameStateRef.current.animationId);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsStarted(false);
    setIsGameOver(false);
    setScore(0);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background/95 border-2 border-primary/30 rounded-lg p-6 max-w-3xl w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gradient mb-2" style={{ fontFamily: "Orbitron" }}>
              DINO RUNNER
            </h2>
            <div className="flex justify-center gap-8 text-lg">
              <div>
                <span className="text-muted-foreground">Score: </span>
                <span className="text-primary font-bold">{score}</span>
              </div>
              <div>
                <span className="text-muted-foreground">High: </span>
                <span className="text-secondary font-bold">{highScore}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              className="border-2 border-primary/20 rounded-lg cursor-default"
              style={{ maxWidth: "100%", cursor: "default" }}
            />
          </div>

          {!isStarted && !isGameOver && (
            <div className="text-center">
              <Button onClick={handleStart} className="gap-2" size="lg">
                <Play className="w-4 h-4" />
                Start Game
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="mb-2">Desktop: Space/↑ to jump</p>
                <p>Mobile: Tap to jump</p>
              </div>
            </div>
          )}

          {isGameOver && (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-destructive mb-2">GAME OVER</h3>
              <p className="text-muted-foreground mb-4">Tap Space or Screen to Restart</p>
              <Button onClick={handleRestart} className="gap-2" size="lg">
                <Play className="w-4 h-4" />
                Restart
              </Button>
            </div>
          )}

          {isStarted && !isGameOver && (
            <div className="text-center text-xs text-muted-foreground">
              Game is running - avoid obstacles!
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FooterGame;
