import React, { useEffect, useRef, useState } from 'react';
import { LevelConfig, Skin, Particle, Trap, Platform, Coin, PowerUpItem, PowerUpType } from '../types';
import { PLAYER_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../data';
import { soundEffects } from './SoundEffects';

interface GameCanvasProps {
  level: LevelConfig;
  activeSkin: Skin;
  hintActive: boolean;
  isPaused: boolean;
  onCoinCollected: (count: number) => void;
  onLevelComplete: (coinsEarned: number) => void;
  onDeath: (prompt: string) => void;
  playStateResetTrigger: number;
  virtualInput: { left: boolean; right: boolean; jump: boolean };
  onDevDialogue?: () => void;
  escapeHoleActive?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  activeSkin,
  hintActive,
  isPaused,
  onCoinCollected,
  onLevelComplete,
  onDeath,
  playStateResetTrigger,
  virtualInput,
  onDevDialogue,
  escapeHoleActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core level state copies to allow resetting & dynamic modifications
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [traps, setTraps] = useState<Trap[]>([]);
  const [coinsList, setCoinsList] = useState<Coin[]>([]);
  const [hasKey, setHasKey] = useState(false);
  const [doorUnlockAnim, setDoorUnlockAnim] = useState(false);
  const [powerUpsList, setPowerUpsList] = useState<PowerUpItem[]>([]);

  // Player State
  const playerRef = useRef({
    x: level.playerStartX,
    y: level.playerStartY,
    vx: 0,
    vy: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    isGrounded: false,
    doubleJumpAvailable: true,
    jumpsRemaining: 2,
    maxJumps: 2,
    activePowerUp: null as 'triple-jump' | 'mini-size' | 'super-speed' | null,
    powerUpTimer: 0, // frames remaining
    gravityDirection: 1, // 1 for normal (down), -1 for inverted (up)
    dead: false,
    deathTimer: 0,
    winState: false,
    winTimer: 0,
    facing: 'right' as 'left' | 'right',
    scaleX: 1,
    scaleY: 1,
    jumping: false,
    currentFloorY: 390
  });

  // Inputs
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Level 7: counts deaths to trigger Dev dialogue on the 2nd
  const level7DeathCountRef = useRef(0);
  const prevLevelIdRef = useRef(level.id);

  // FPS counter for performance diagnostics
  const fpsRef = useRef(0);
  const fpsFrameCountRef = useRef(0);
  const fpsLastTimeRef = useRef(performance.now());

  // Visual effects
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef({ x: 0, y: 0, duration: 0 });
  const [trollMessage, setTrollMessage] = useState<string | null>(null);
  const trollMessageTimerRef = useRef(0);

  // Floating text indicators
  const floatingTextsRef = useRef<{ id: string; x: number; y: number; text: string; color: string; r: number; alpha: number }[]>([]);

  // Door position representation
  const [currentDoorPos, setCurrentDoorPos] = useState({ x: level.doorX, y: level.doorY });

  // Init/Reset level state
  useEffect(() => {
    // Reset Level 7 death counter when switching to a different level
    if (prevLevelIdRef.current !== level.id) {
      level7DeathCountRef.current = 0;
      prevLevelIdRef.current = level.id;
    }

    // Clone platforms
    setPlatforms(level.platforms.map(p => ({ ...p, state: 'stable', vy: 0 })));
    setTraps(level.traps.map(t => ({ ...t, state: t.type === 'moving-spike' ? 'active' : 'idle' })));
    setCoinsList(level.coins.map(c => ({ ...c, collected: false })));
    setPowerUpsList((level.powerUps || []).map(p => ({ ...p, collected: false })));
    setHasKey(false);
    setDoorUnlockAnim(false);
    setTrollMessage(null);
    trollMessageTimerRef.current = 0;
    setCurrentDoorPos({ x: level.doorX, y: level.doorY });

    // Reset player
    const p = playerRef.current;
    p.x = level.playerStartX;
    p.y = level.playerStartY;
    p.vx = 0;
    p.vy = 0;
    p.isGrounded = false;
    p.doubleJumpAvailable = true;
    p.jumpsRemaining = 2;
    p.maxJumps = 2;
    p.activePowerUp = null;
    p.powerUpTimer = 0;
    p.width = PLAYER_SIZE;
    p.height = PLAYER_SIZE;
    p.gravityDirection = 1;
    p.dead = false;
    p.deathTimer = 0;
    p.winState = false;
    p.winTimer = 0;
    p.facing = 'right';
    p.scaleX = 1;
    p.scaleY = 1;

    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Sparkle particles at start
    createSparks(level.playerStartX + 12, level.playerStartY + 12, '#3b82f6', 15);
  }, [level, playStateResetTrigger]);

  // Handle keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && !isPaused) {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  // Helper particle triggers
  const createSparks = (x: number, y: number, color: string, count = 10, shape: 'square' | 'circle' = 'square') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particlesRef.current.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color,
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 30
      });
    }
  };

  const spawnFloatingText = (x: number, y: number, text: string, color = '#facc15') => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      r: -1 - Math.random() * 2,
      alpha: 1
    });
  };

  const applyScreenShake = (intensity: number, duration: number) => {
    screenShakeRef.current = { x: intensity, y: intensity, duration };
  };

  // Trigger comical message
  const triggerTrollMessage = (msg: string, duration = 120) => {
    setTrollMessage(msg);
    trollMessageTimerRef.current = duration;
    soundEffects.playTrollLaugh();
  };

  const handleDeath = () => {
    const p = playerRef.current;
    if (p.dead) return;

    p.dead = true;
    p.deathTimer = 60;

    applyScreenShake(8, 25);
    createSparks(p.x + p.width / 2, p.y + p.height / 2, activeSkin.color, 35);
    createSparks(p.x + p.width / 2, p.y + p.height / 2, '#ef4444', 20);
    soundEffects.playDeath();

    // Level 7: trigger Dev dialogue on the 2nd death
    if (level.id === 7 && onDevDialogue && !escapeHoleActive) {
      level7DeathCountRef.current++;
      if (level7DeathCountRef.current >= 2) {
        onDevDialogue();
        return;
      }
    }

    const deathPrompt = level.maxSpikesPrompt || 'Troll physics strikes again!';
    onDeath(deathPrompt);
  };

  // Core Math Helper: AABB Circle / Box intersection
  const checkCollides = (
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
  ) => {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  };

  // Physics and Logic update loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // FPS counter
      fpsFrameCountRef.current++;
      const now = performance.now();
      if (now - fpsLastTimeRef.current >= 1000) {
        fpsRef.current = fpsFrameCountRef.current;
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = now;
      }

      // 1. Inputs Check (Keyboard + Virtual Controls)
      const input = {
        left: keysRef.current['arrowleft'] || keysRef.current['a'] || virtualInput.left,
        right: keysRef.current['arrowright'] || keysRef.current['d'] || virtualInput.right,
        jump: keysRef.current['arrowup'] || keysRef.current['w'] || keysRef.current[' '] || keysRef.current['space'] || virtualInput.jump
      };

      const p = playerRef.current;

      // Update Screen Shake decay
      if (screenShakeRef.current.duration > 0) {
        const sk = screenShakeRef.current;
        screenShakeRef.current = {
          x: (Math.random() - 0.5) * sk.x * 0.9,
          y: (Math.random() - 0.5) * sk.y * 0.9,
          duration: sk.duration - 1
        };
      } else if (screenShakeRef.current.x !== 0 || screenShakeRef.current.y !== 0) {
        screenShakeRef.current = { x: 0, y: 0, duration: 0 };
      }

      // Decay floating messages
      floatingTextsRef.current = floatingTextsRef.current
        .map(t => ({ ...t, y: t.y + t.r, alpha: t.alpha - 0.02 }))
        .filter(t => t.alpha > 0);

      // Decay troll banner messages
      if (trollMessageTimerRef.current > 0) {
        trollMessageTimerRef.current--;
        if (trollMessageTimerRef.current <= 0) {
          setTrollMessage(null);
        }
      }

      if (!p.dead && !p.winState) {
        // --- 1.5. PowerUp Ticks & Trail Sparks ---
        if (p.powerUpTimer > 0) {
          if (p.activePowerUp !== 'triple-jump') {
            p.powerUpTimer--;
          }
          if (p.powerUpTimer <= 0) {
            spawnFloatingText(p.x + p.width / 2, p.y - 12, `${(p.activePowerUp || '').toUpperCase()} EXPIRED 🍃`, '#94a3b8');
            if (p.activePowerUp === 'mini-size') {
              // Adjust position upwards to keep vertical alignment grounded
              p.y -= (PLAYER_SIZE - p.height);
            }
            p.activePowerUp = null;
            p.width = PLAYER_SIZE;
            p.height = PLAYER_SIZE;
          } else {
            // Spawn gorgeous custom powerUp trace trail sparks!
            if (Math.random() < 0.22) {
              const color = p.activePowerUp === 'triple-jump' ? '#eab308' : p.activePowerUp === 'super-speed' ? '#fb7185' : '#4ade80';
              createSparks(p.x + p.width / 2, p.y + p.height / 2, color, 1, 'circle');
            }
          }
        }

        // --- 2. Acceleration / Inertia ---
        const moveSpeed = p.activePowerUp === 'super-speed' ? 6.5 : 4.2;
        const drag = 0.78;

        if (input.left) {
          p.vx = -moveSpeed;
          p.facing = 'left';
        } else if (input.right) {
          p.vx = moveSpeed;
          p.facing = 'right';
        } else {
          p.vx *= drag; // slide friction
        }

        // Apply Inverted / Normal Gravity
        const g = (p.activePowerUp === 'mini-size' ? 0.38 : 0.50) * p.gravityDirection;
        p.vy += g;

        // Terminal velocity check
        const maxVy = 12;
        if (p.vy > maxVy) p.vy = maxVy;
        if (p.vy < -maxVy) p.vy = -maxVy;

        // --- 3. Jump Handler ---
        if (input.jump) {
          if (!p.jumping) {
            p.jumping = true; // prevent immediate repeat button triggers
            if (p.isGrounded) {
              p.vy = -9.5 * p.gravityDirection;
              p.isGrounded = false;
              p.jumpsRemaining = (p.activePowerUp === 'triple-jump' ? 3 : 2) - 1;
              soundEffects.playJump();
              // Squash animation stretching
              p.scaleX = 0.75;
              p.scaleY = 1.35;
              createSparks(p.x + p.width / 2, p.y + (p.gravityDirection === 1 ? p.height : 0), '#ffffff', 5);
            } else if (p.jumpsRemaining > 0) {
              const totalJumps = p.activePowerUp === 'triple-jump' ? 3 : 2;
              const jumpNumber = totalJumps - p.jumpsRemaining + 1;
              p.vy = (jumpNumber === 3 ? -10.0 : -9.0) * p.gravityDirection;
              p.jumpsRemaining--;
              soundEffects.playJump();
              p.scaleX = 0.82;
              p.scaleY = 1.25;
              
              if (jumpNumber === 3) {
                // Triple jump custom spectacular cloud blast!
                createSparks(p.x + p.width / 2, p.y + p.height / 2, '#fbbf24', 16, 'circle');
                spawnFloatingText(p.x + p.width / 2, p.y - 12, 'TRIPLE JUMP!!! 🚀', '#fbbf24');
              } else {
                createSparks(p.x + p.width / 2, p.y + p.height / 2, '#60a5fa', 8, 'circle');
              }
            }
          }
        } else {
          p.jumping = false;
        }

        // Return squash scale slowly to standard square values (1.0)
        p.scaleX += (1.0 - p.scaleX) * 0.12;
        p.scaleY += (1.0 - p.scaleY) * 0.12;

        // Movement Step 1: Horizontal Movement & Wall Collisions
        p.x += p.vx;
        // Map walls boundaries
        if (p.x < 0) p.x = 0;
        if (p.x + p.width > CANVAS_WIDTH) p.x = CANVAS_WIDTH - p.width;

        // Platform horizontal bounds check
        platforms.forEach(plat => {
          if (plat.type === 'fake-solid') return; // ignore visual trolls
          if (checkCollides(p.x, p.y, p.width, p.height, plat.x, plat.y, plat.width, plat.height)) {
            // If we are moving right and hit left bounds
            if (p.vx > 0) {
              p.x = plat.x - p.width;
              p.vx = 0;
            }
            // If we are moving left and hit right bounds
            else if (p.vx < 0) {
              p.x = plat.x + plat.width;
              p.vx = 0;
            }
          }
        });

        // Movement Step 2: Vertical Movement & Floor Collisions
        p.y += p.vy;
        p.isGrounded = false;

        platforms.forEach((plat) => {
          if (plat.type === 'fake-solid') return; // visual dummy
          if (checkCollides(p.x, p.y, p.width, p.height, plat.x, plat.y, plat.width, plat.height)) {
            // Normal Gravity Landings (moving down, landing on top surface)
            if (p.gravityDirection === 1 && p.vy > 0 && p.y + p.height - p.vy <= plat.y + 4) {
              p.y = plat.y - p.height;
              p.vy = 0;
              p.isGrounded = true;
              p.doubleJumpAvailable = true;
              p.jumpsRemaining = p.activePowerUp === 'triple-jump' ? 3 : 2;

              // Fall speed squash animation impact
              if (p.scaleY < 0.9) {
                p.scaleX = 1.3;
                p.scaleY = 0.7;
              }

              // Trigger falling platform mechanics
              if (plat.type === 'fake-fall' && plat.state === 'stable') {
                plat.state = 'shaking';
                plat.timer = 18; // frames of shaking before falling
                soundEffects.playSlam();
                spawnFloatingText(plat.x + plat.width / 2 - 10, plat.y - 15, 'CRACK!', '#ef4444');
              }

              // Apply custom Bouncy elastic mechanics
              if (plat.type === 'bouncy') {
                p.vy = -14.5; // catapult!
                p.isGrounded = false;
                soundEffects.playTrampoline();
                spawnFloatingText(plat.x + plat.width / 2 - 20, plat.y - 20, 'BOING!!', '#22c55e');
                applyScreenShake(3, 10);
                p.scaleX = 0.6;
                p.scaleY = 1.4;
                createSparks(plat.x + plat.width / 2, plat.y, '#22c55e', 12);
              }
            }
            // Inverted Gravity Landings (moving up, landing on bottom of platform)
            else if (p.gravityDirection === -1 && p.vy < 0 && p.y - p.vy >= plat.y + plat.height - 4) {
              p.y = plat.y + plat.height;
              p.vy = 0;
              p.isGrounded = true;
              p.doubleJumpAvailable = true;
              p.jumpsRemaining = p.activePowerUp === 'triple-jump' ? 3 : 2;

              if (plat.type === 'fake-fall' && plat.state === 'stable') {
                plat.state = 'shaking';
                plat.timer = 18;
                soundEffects.playSlam();
              }
            }
            // Ceiling impact resolve
            else if (p.gravityDirection === 1 && p.vy < 0) {
              p.y = plat.y + plat.height;
              p.vy = 0;
            }
            // Floor impact resolve for inverted ceiling
            else if (p.gravityDirection === -1 && p.vy > 0) {
              p.y = plat.y - p.height;
              p.vy = 0;
            }
          }
        });

        // --- 4. Deep Vacuum Death bounds check ---
        if (p.y > CANVAS_HEIGHT + 40 || p.y < -80) {
          handleDeath();
        }

        // --- 5. Coins Pickup Check ---
        coinsList.forEach((coin) => {
          if (!coin.collected && checkCollides(p.x, p.y, p.width, p.height, coin.x - 8, coin.y - 8, 16, 16)) {
            coin.collected = true;
            onCoinCollected(1);
            soundEffects.playCoin();
            spawnFloatingText(coin.x, coin.y - 12, '+1 Coin ✨', '#fbbf24');
            createSparks(coin.x, coin.y, '#facc15', 8, 'circle');
          }
        });

        // --- 5b. Power-Ups Pickup Check ---
        powerUpsList.forEach((pup) => {
          if (!pup.collected && checkCollides(p.x, p.y, p.width, p.height, pup.x - 10, pup.y - 10, 20, 20)) {
            pup.collected = true;
            p.activePowerUp = pup.type;
            p.powerUpTimer = pup.type === 'mini-size' ? 900 : 480; // 15s for mini, 8s for others
            soundEffects.playPowerUp();

            let txt = '';
            let valColor = '';
            if (pup.type === 'triple-jump') {
              txt = 'TRIPLE JUMP ACTIVATED! 🚀';
              valColor = '#fbbf24';
              p.jumpsRemaining = 3;
            } else if (pup.type === 'mini-size') {
              txt = 'MINI MOW CAT CHEAT! 🐱';
              valColor = '#4ade80';
              p.width = PLAYER_SIZE / 2;
              const prevHeight = p.height;
              p.height = PLAYER_SIZE / 2;
              p.y += (prevHeight - p.height); // keep feet on the floor
            } else if (pup.type === 'super-speed') {
              txt = 'SUPER SPEED MINT ACTIVE! ⚡';
              valColor = '#fb7185';
            }

            spawnFloatingText(pup.x, pup.y - 15, txt, valColor);
            createSparks(pup.x, pup.y, valColor, 18, 'circle');
            triggerTrollMessage(`CRAZY CAT ABILITY: ${txt}`, 150);
          }
        });

        // --- 6. Traps Trigger & Updates ---
        traps.forEach((trap) => {
          // When escape hole is active on Level 7, freeze the ceiling spike in place
          if (escapeHoleActive && level.id === 7 && trap.id === 'l7_ceil_main') return;

          // Check player proximity to trigger trap
          if (trap.state === 'idle' && trap.triggerBox) {
            const tBox = trap.triggerBox;
            const fullTriggerX = tBox.x === 0 ? true : checkCollides(p.x, p.y, p.width, p.height, tBox.x, tBox.y, tBox.width, tBox.height);
            if (fullTriggerX) {
              trap.state = 'triggered';

              // Specific troll events on trigger
              if (trap.type === 'up-spike') {
                applyScreenShake(2, 10);
                soundEffects.playSlam();
                trap.visible = true;
                spawnFloatingText(trap.x, trap.y - 20, 'SURPRISE! 💢', '#ef4444');
              }
              else if (trap.type === 'falling-spike') {
                soundEffects.playSlam();
                spawnFloatingText(trap.x, trap.y + 40, 'WATCH OUT! 💀', '#ef4444');
              }
              else if (trap.type === 'crushing-pillar') {
                soundEffects.playSlam();
                spawnFloatingText(trap.x - 10, trap.y + trap.height + 15, 'CRUSH!!', '#f43f5e');
                applyScreenShake(3, 10);
              }
              else if (trap.type === 'flying-arrow') {
                soundEffects.playTrampoline();
                trap.visible = true;
                spawnFloatingText(700, trap.y - 10, 'MISSILE! 🚀', '#ec4899');
              }
              else if (trap.type === 'ad-physical-popup') {
                trap.visible = true;
                applyScreenShake(4, 15);
                triggerTrollMessage('CONGRATULATIONS! YOU WON A MOCK-PHONE!! [X]', 180);
                soundEffects.playAdJingle();

                // Trigger missile simultaneously to catch them off-guard
                traps.forEach(otherTrap => {
                  if (otherTrap.type === 'flying-arrow') {
                    otherTrap.state = 'triggered';
                    otherTrap.visible = true;
                  }
                });

              }
              else if (trap.type === 'fleeing-door') {
                // Shift door's goal
                setCurrentDoorPos({ x: trap.targetX!, y: trap.targetY! });
                applyScreenShake(2, 12);
                triggerTrollMessage('DOOR: "Nope, too close! Try again."', 130);
                // Sparkle at new position
                createSparks(trap.targetX! + 20, trap.targetY! + 30, '#fbbf24', 15);
              }
            }
          }

          // Fake Key trigger
          if (trap.type === 'fake-key' && trap.state === 'idle') {
            if (checkCollides(p.x, p.y, p.width, p.height, trap.x, trap.y, trap.width, trap.height)) {
              trap.state = 'active';
              trap.visible = false;
              setHasKey(true);
              setDoorUnlockAnim(true);
              soundEffects.playUnlock();
              spawnFloatingText(trap.x, trap.y - 20, '🔑 DOOR UNLOCKED', '#fbbf24');
              createSparks(trap.x, trap.y, '#fbbf24', 15);

              // Simultaneously summon the heavy sliding boulder from left
              traps.forEach(otherTrap => {
                if (otherTrap.type === 'boulder-roll') {
                  otherTrap.state = 'triggered';
                  otherTrap.visible = true;
                  spawnFloatingText(100, 310, 'ROLLING BOULDER!!! 🪨', '#ef4444');
                  triggerTrollMessage('GET TO THE FLOATING STEP! RUN!', 120);
                }
              });
            }
          }

          // Bullet mechanics for gravity-line
          if (trap.type === 'gravity-line') {
            if (checkCollides(p.x, p.y, p.width, p.height, trap.x, trap.y, trap.width, trap.height)) {
              if (trap.id === 'l5_grav_up' && p.gravityDirection === 1) {
                p.gravityDirection = -1;
                p.doubleJumpAvailable = true; // refresh jump for upside-down launch
                soundEffects.playTrampoline();
                applyScreenShake(3, 8);
                spawnFloatingText(p.x, p.y - 30, 'GRAVITY FLIP 🌌', '#a855f7');
                createSparks(p.x + 12, p.y + 12, '#a855f7', 15);
              }
              else if (trap.id === 'l5_grav_down' && p.gravityDirection === -1) {
                p.gravityDirection = 1;
                p.doubleJumpAvailable = true;
                soundEffects.playTrampoline();
                applyScreenShake(3, 8);
                spawnFloatingText(p.x, p.y + 30, 'NORMAL GRAVITY 🌍', '#eab308');
                createSparks(p.x + 12, p.y + 12, '#eab308', 15);
              }
              else if (trap.id === 'l10_grav' && p.gravityDirection === 1) {
                p.gravityDirection = -1;
                p.doubleJumpAvailable = true;
                soundEffects.playTrampoline();
                spawnFloatingText(p.x, p.y - 30, 'REVERSE GRAVITY', '#a855f7');
              }
            }
          }

          // Move the triggered traps in real time
          if (trap.state === 'triggered') {
            if (trap.type === 'up-spike') {
              const spd = trap.speed || 5;
              if (trap.y > trap.targetY!) {
                trap.y -= spd;
              } else {
                trap.y = trap.targetY!;
                trap.state = 'active';
              }
            }
            else if (trap.type === 'falling-spike') {
              const spd = trap.speed || 6;
              if (trap.y < trap.targetY!) {
                trap.y += spd;
              } else {
                trap.y = trap.targetY!;
                trap.state = 'active';
                applyScreenShake(2, 6);
                soundEffects.playSlam();
                createSparks(trap.x + trap.width / 2, trap.y + trap.height, '#f43f5e', 8);
              }
            }
            else if (trap.type === 'crushing-pillar') {
              const spd = trap.speed || 12;
              if (trap.y < trap.targetY!) {
                trap.y += spd;
              } else {
                trap.y = trap.targetY!;
                trap.state = 'active';
                trap.timer = 50; // hold slam state for 50 frames
                applyScreenShake(5, 12);
                soundEffects.playSlam();
                createSparks(trap.x + trap.width / 2, trap.y + trap.height, '#475569', 15);
              }
            }
            else if (trap.type === 'flying-arrow') {
              const spd = trap.speed || 10;
              trap.x -= spd; // fly left
              if (trap.x < -100) {
                trap.state = 'exhausted';
              }
            }
            else if (trap.type === 'boulder-roll') {
              const spd = trap.speed || 6;
              trap.x += spd; // roll right
              if (trap.x > 900) {
                trap.state = 'exhausted';
              }
            }
            else if (trap.type === 'ad-physical-popup') {
              // Simply make active and stay
              trap.state = 'active';
            }
            else if (trap.type === 'fleeing-door') {
              const spd = trap.speed || 10;
              // Animate door slide
              const dx = trap.targetX! - trap.x;
              const dy = trap.targetY! - trap.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > spd) {
                trap.x += (dx / dist) * spd;
                trap.y += (dy / dist) * spd;
              } else {
                trap.x = trap.targetX!;
                trap.y = trap.targetY!;
                trap.state = 'active';
              }
            }
          }

          // Crushing pillar retracting cycle
          if (trap.state === 'active' && trap.type === 'crushing-pillar') {
            if (trap.timer && trap.timer > 0) {
              trap.timer--;
            } else {
              // Retract slowly
              const retractSpeed = 2;
              if (trap.y > trap.origY) {
                trap.y -= retractSpeed;
              } else {
                trap.y = trap.origY;
                trap.state = 'idle'; // reset for re-triggers!
              }
            }
          }

          // Check direct death collision with ACTIVE traps
          if (trap.visible && trap.type !== 'fake-key' && trap.type !== 'gravity-line' && trap.type !== 'fleeing-door') {
            // Buffer to make collision slightly forgiving matching design visuals
            const hurtBoxReduction = 4;
            let trapCol = checkCollides(
              p.x + 2, p.y + 2, p.width - 4, p.height - 4,
              trap.x + hurtBoxReduction, trap.y + hurtBoxReduction,
              trap.width - hurtBoxReduction * 2, trap.height - hurtBoxReduction * 2
            );

            // Special handle for ad popup - it's a SOLID obstacle, not a death hazard, UNLESS we touch the fake Close [X]
            if (trap.type === 'ad-physical-popup') {
              trapCol = false; // solid, resolved separated
              // Resolve solid player wall overlap
              if (checkCollides(p.x, p.y, p.width, p.height, trap.x, trap.y, trap.width, trap.height)) {
                // block player side
                if (p.vx > 0 && p.x + p.width - p.vx <= trap.x + 6) {
                  p.x = trap.x - p.width;
                  p.vx = 0;
                } else if (p.vx < 0 && p.x - p.vx >= trap.x + trap.width - 6) {
                  p.x = trap.x + trap.width;
                  p.vx = 0;
                }
              }

              // Troll Close Button Area (X sits at top right of ad popup block: x+width-24, y, 24, 24)
              // If touched, triggers a crazy trap
              const xBtn = { x: trap.x + trap.width - 24, y: trap.y, w: 24, h: 24 };
              if (checkCollides(p.x, p.y, p.width, p.height, xBtn.x, xBtn.y, xBtn.w, xBtn.h)) {
                // Spawn arrow instantly right into the back
                traps.forEach(otherTrap => {
                  if (otherTrap.type === 'flying-arrow') {
                    otherTrap.x = p.x + 120;
                    otherTrap.y = p.y + 2;
                    otherTrap.state = 'triggered';
                    otherTrap.speed = 15;
                    otherTrap.visible = true;
                  }
                });
                spawnFloatingText(xBtn.x, xBtn.y, 'VIRUS DETECTED! ⚠️', '#ef4444');
                soundEffects.playTrollLaugh();
              }
            }

            if (trapCol) {
              handleDeath();
            }
          }

          return trap;
        });

        // Apply platforms gravity falling
        platforms.forEach(plat => {
          if (plat.state === 'shaking') {
            if (plat.timer && plat.timer > 0) {
              plat.timer--;
              // Animate subtle horizontal shake offset
              plat.x = plat.x + (Math.sin(plat.timer * 1.5) * 1.5);
            } else {
              plat.state = 'falling';
              plat.vy = 0.5;
            }
          } else if (plat.state === 'falling') {
            plat.vy = (plat.vy || 0) + 0.3; // gravity acceleration
            plat.y += plat.vy;
            if (plat.y > CANVAS_HEIGHT + 100) {
              plat.state = 'fell';
            }
          }
          return plat;
        });


        // --- 6.5. Escape hole teleport (Level 7 Dev dialogue mechanic) ---
        if (escapeHoleActive && level.id === 7) {
          const holeX = 130, holeY = 362, holeW = 52, holeH = 28;
          if (checkCollides(p.x, p.y, p.width, p.height, holeX, holeY, holeW, holeH)) {
            // Teleport player above exit door
            p.x = level.doorX + 10;
            p.y = level.doorY - 200;
            p.vx = 0;
            p.vy = 0;
            createSparks(holeX + holeW / 2, holeY + holeH / 2, '#a855f7', 20);
            createSparks(p.x + p.width / 2, p.y + p.height / 2, '#fbbf24', 18);
            spawnFloatingText(p.x - 10, p.y - 20, 'TELEPORTADO! 🌀', '#a855f7');
            applyScreenShake(4, 12);
            soundEffects.playPowerUp();
          }
        }

        // --- 7. Level Goal/Win Portal trigger check ---
        const dX = currentDoorPos.x;
        const dY = currentDoorPos.y;
        if (checkCollides(p.x, p.y, p.width, p.height, dX + 10, dY + 10, 20, 44)) {
          // If level 8 key is not grabbed, door shows LOCKED
          if (level.id === 8 && !hasKey) {
            spawnFloatingText(dX + 5, dY - 20, 'LOCKED! 🔒', '#ef4444');
            applyScreenShake(2, 6);
            soundEffects.playSlam();
            // push player left slightly
            p.x = dX - p.width - 5;
            p.vx = -2;
          } else {
            p.winState = true;
            p.winTimer = 55; // frames of victorious swirl
            soundEffects.playWin();
            applyScreenShake(3, 10);
            createSparks(dX + 20, dY + 30, '#facc15', 25);
            spawnFloatingText(dX + 10, dY - 15, 'STAGED BEATEN! 🎉', '#4ade80');
          }
        }
      }

      // 8. Visual Particle Animations update
      particlesRef.current = particlesRef.current
        .map(pt => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          pt.alpha = 1 - pt.life / pt.maxLife;
          return pt;
        })
        .filter(pt => pt.life < pt.maxLife);

      // 9. Death Timer cycle
      if (p.dead) {
        p.deathTimer--;
        if (p.deathTimer <= 0) {
          // Restart trigger!
          resetLevelLocal();
        }
      }

      // 10. Win transition timer cycle
      if (p.winState) {
        // Spiral absorption animation of player cube towards portal slot
        const dX = currentDoorPos.x + 20;
        const dY = currentDoorPos.y + 30;
        p.x += (dX - (p.x + p.width / 2)) * 0.15;
        p.y += (dY - (p.y + p.height / 2)) * 0.15;
        p.scaleX *= 0.88;
        p.scaleY *= 0.88;

        p.winTimer--;
        if (p.winTimer <= 0) {
          p.winState = false;
          p.winTimer = 0;
          const levelCoinsCount = coinsList.filter(c => c.collected).length;
          const completionReward = 20 + (levelCoinsCount * 10);
          onLevelComplete(completionReward);
        }
      }

      // 11. Custom rendering helper function
      renderCanvas();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const resetLevelLocal = () => {
      // Re-trigger visual layout and restart
      // Will increment parents dead attempt
      onDeath('');
    };

    // Render logic onto visual Canvas API context
    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      // Apply Screen Shake Translation
      ctx.translate(screenShakeRef.current.x, screenShakeRef.current.y);

      // A. Sky Background with linear cosmic gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, '#0f172a'); // very dark slate
      bgGrad.addColorStop(0.7, '#1e293b');
      bgGrad.addColorStop(1, '#020617'); // dark background
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw subtle background matrix grid lines (single batched stroke call)
      ctx.strokeStyle = '#33415555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridSize = 40;
      for (let sx = 0; sx < CANVAS_WIDTH; sx += gridSize) {
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, CANVAS_HEIGHT);
      }
      for (let sy = 0; sy < CANVAS_HEIGHT; sy += gridSize) {
        ctx.moveTo(0, sy);
        ctx.lineTo(CANVAS_WIDTH, sy);
      }
      ctx.stroke();

      // B. Draw Static Paths/Platforms
      platforms.forEach((plat) => {
        if (plat.state === 'fell') return;

        // Custom platform rendering based on type
        if (plat.type === 'bouncy') {
          // Draw bouncy trampoline pad
          ctx.fillStyle = plat.color || '#22c55e';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Draw spring bands
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(plat.x + 3, plat.y + 4);
          ctx.bezierCurveTo(
            plat.x + plat.width / 3, plat.y + 16,
            plat.x + (plat.width * 2) / 3, plat.y + 16,
            plat.x + plat.width - 3, plat.y + 4
          );
          ctx.stroke();

          // Green soft glow
          ctx.fillStyle = '#22c55e55';
          ctx.fillRect(plat.x, plat.y - 4, plat.width, 4);
        }
        else if (plat.type === 'fake-fall') {
          // Draw decaying stone steps with crack texture
          ctx.fillStyle = plat.state === 'shaking' ? '#f43f5e' : '#64748b';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // Dark gray bottom edge shadow
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(plat.x, plat.y + plat.height - 4, plat.width, 4);

          // Drawing cracks
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(plat.x + plat.width / 4, plat.y);
          ctx.lineTo(plat.x + plat.width / 3, plat.y + plat.height - 2);
          ctx.moveTo(plat.x + plat.width * 0.6, plat.y);
          ctx.lineTo(plat.x + plat.width * 0.5, plat.y + 12);
          ctx.lineTo(plat.x + plat.width * 0.7, plat.y + plat.height);
          ctx.stroke();
        }
        else if (plat.type === 'fake-solid') {
          // Completely transparent visual guide for visual trolls
          ctx.fillStyle = '#475569aa'; // Semi clear
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#ef444455'; // hint outlines
          ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        }
        else {
          // Standard dark stone solid elements
          ctx.fillStyle = '#475569';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

          // highlight top border caps
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);

          // shadow bottom border caps
          ctx.fillStyle = '#334155';
          ctx.fillRect(plat.x, plat.y + plat.height - 4, plat.width, 4);
        }
      });

      // C. Draw Golden Entrance Door Portal
      const dx = currentDoorPos.x;
      const dy = currentDoorPos.y;

      // Outer Portal Frame
      ctx.save();
      // Draw standard glowing base
      const doorPulse = Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = '#eab30833'; // transparent golden yellow

      // Draw Arch representation
      ctx.beginPath();
      ctx.arc(dx + 20, dy + 25, 20 + doorPulse * 0.2, Math.PI, 0, false);
      ctx.lineTo(dx + 40, dy + 60);
      ctx.lineTo(dx, dy + 60);
      ctx.closePath();
      ctx.fill();

      // Golden Arch Borders
      ctx.strokeStyle = (level.id === 8 && !hasKey) ? '#ef4444' : '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(dx + 20, dy + 25, 20, Math.PI, 0, false);
      ctx.lineTo(dx + 40, dy + 60);
      ctx.moveTo(dx, dy + 25);
      ctx.lineTo(dx, dy + 60);
      ctx.stroke();

      // Draw lock padlock graphic if locked
      if (level.id === 8 && !hasKey) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = '14px monospace';
        ctx.fillText('🔒 LOCKED', dx - 12, dy - 10);
      } else {
        // Spinning swirl indicators inside active door
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(dx + 20, dy + 32, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // D. Draw Golden Coins
      coinsList.forEach(coin => {
        if (coin.collected) return;
        ctx.save();

        const floatAmt = Math.sin((Date.now() / 150) + coin.pulseOffset) * 4.5;
        const spinScale = Math.cos((Date.now() / 180) + coin.pulseOffset);

        ctx.translate(coin.x, coin.y + floatAmt);
        ctx.scale(spinScale, 1);

        // Gold coin circle
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Inner polygon rim
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // D2. Draw Power-Ups
      powerUpsList.forEach(pup => {
        if (pup.collected) return;
        ctx.save();

        const floatAmt = Math.sin((Date.now() / 130) + pup.pulseOffset) * 4.5;
        const spinScale = Math.cos((Date.now() / 160) + pup.pulseOffset);

        ctx.translate(pup.x, pup.y + floatAmt);
        ctx.scale(spinScale, 1);

        if (pup.type === 'triple-jump') {
          // Blazing wing powerup
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1;
          ctx.fillStyle = '#fbbf24'; // bright yellow
          
          // Feather wing shape
          ctx.beginPath();
          ctx.moveTo(-10, -5);
          ctx.quadraticCurveTo(-15, -12, -2, -10);
          ctx.quadraticCurveTo(8, -12, 10, -3);
          ctx.quadraticCurveTo(15, 6, 2, 7);
          ctx.quadraticCurveTo(-12, 8, -10, -5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Core crystal
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Cute little label
          ctx.fillStyle = '#fdbaf8';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('3x', -5, -13);
        } else if (pup.type === 'mini-size') {
          // Shrinking potion/milk container
          ctx.fillStyle = '#4ade80'; // bright green
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1.2;

          ctx.fillRect(-6, -2, 12, 11);
          ctx.strokeRect(-6, -2, 12, 11);

          ctx.beginPath();
          ctx.moveTo(-6, -2);
          ctx.lineTo(0, -9);
          ctx.lineTo(6, -2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-2, 1, 4, 4);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('MINI', -7, -13);
        } else if (pup.type === 'super-speed') {
          ctx.fillStyle = '#fb7185'; // hot rose pink
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(3, -11);
          ctx.lineTo(-7, 0);
          ctx.lineTo(-1, 0);
          ctx.lineTo(-4, 11);
          ctx.lineTo(7, -1);
          ctx.lineTo(1, -1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Speed lines
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-10, -4);
          ctx.lineTo(-15, -4);
          ctx.moveTo(-12, 3);
          ctx.lineTo(-17, 3);
          ctx.stroke();
        }

        ctx.restore();
      });

      // E. Draw Traps
      traps.forEach((trap) => {
        if (!trap.visible) return;

        // Custom renderer based on trap structures
        if (trap.type === 'moving-spike' || trap.type === 'up-spike' || trap.type === 'falling-spike') {
          // Hide ceiling spike on Level 7 when escape hole is active
          if (escapeHoleActive && level.id === 7 && trap.id === 'l7_ceil_main') return;

          // Draw multiple sharp triangles
          const numSpikes = Math.max(1, Math.floor(trap.width / 14));
          const actualSpikeW = trap.width / numSpikes;

          ctx.fillStyle = trap.color || '#ef4444';
          ctx.strokeStyle = '#991b1b';
          ctx.lineWidth = 1;

          for (let i = 0; i < numSpikes; i++) {
            const sx = trap.x + (i * actualSpikeW);
            ctx.beginPath();

            if (trap.type === 'falling-spike' || trap.origY < 100) {
              ctx.moveTo(sx, trap.y);
              ctx.lineTo(sx + actualSpikeW / 2, trap.y + trap.height);
              ctx.lineTo(sx + actualSpikeW, trap.y);
            } else {
              ctx.moveTo(sx, trap.y + trap.height);
              ctx.lineTo(sx + actualSpikeW / 2, trap.y);
              ctx.lineTo(sx + actualSpikeW, trap.y + trap.height);
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }
        else if (trap.type === 'crushing-pillar') {
          // Deep heavy metallic stone block with glowing red patterns
          ctx.fillStyle = trap.color || '#475569';
          ctx.fillRect(trap.x, trap.y, trap.width, trap.height);

          // Border outline highlight
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(trap.x, trap.y, trap.width, trap.height);

          // Spikes at bottom of crushing pillar
          ctx.fillStyle = '#ef4444';
          const pillarSpikes = Math.floor(trap.width / 16);
          const pSpikeW = trap.width / pillarSpikes;
          for (let i = 0; i < pillarSpikes; i++) {
            const sx = trap.x + i * pSpikeW;
            ctx.beginPath();
            ctx.moveTo(sx, trap.y + trap.height);
            ctx.lineTo(sx + pSpikeW / 2, trap.y + trap.height + 12);
            ctx.lineTo(sx + pSpikeW, trap.y + trap.height);
            ctx.closePath();
            ctx.fill();
          }

          // Angry robot eyes on pillar
          ctx.fillStyle = '#ef4444';
          // Angry red lines
          ctx.fillRect(trap.x + 20, trap.y + trap.height - 40, 12, 5);
          ctx.fillRect(trap.x + trap.width - 32, trap.y + trap.height - 40, 12, 5);
        }
        else if (trap.type === 'flying-arrow') {
          // Render visual horizontal arrow projectile
          ctx.fillStyle = trap.color || '#ec4899';
          ctx.fillRect(trap.x, trap.y, trap.width - 10, trap.height);
          // Spear Tip polygon
          ctx.beginPath();
          ctx.moveTo(trap.x, trap.y - 4);
          ctx.lineTo(trap.x - 12, trap.y + trap.height / 2);
          ctx.lineTo(trap.x, trap.y + trap.height + 4);
          ctx.closePath();
          ctx.fill();

          // Arrow tails lines
          ctx.fillStyle = '#fdbaf8';
          ctx.fillRect(trap.x + trap.width - 10, trap.y - 2, 8, trap.height + 4);
        }
        else if (trap.type === 'boulder-roll') {
          // Giant stone boulder
          ctx.save();
          // Translate to center to rotate properly
          const radius = trap.width / 2;
          ctx.translate(trap.x + radius, trap.y + radius);
          // Spin rotation based on horizontal x position
          ctx.rotate(trap.x / 40);

          ctx.fillStyle = trap.color || '#78716c';
          ctx.strokeStyle = '#44403c';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw spiral line detailing rotation
          ctx.strokeStyle = '#292524';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.7, radius * 0.3, Math.PI / 4, 0, Math.PI * 1.5);
          ctx.stroke();

          ctx.restore();
        }
        else if (trap.type === 'ad-physical-popup') {
          // Draw the physical troll banner adblock
          ctx.fillStyle = trap.color || '#0284c7';
          ctx.fillRect(trap.x, trap.y, trap.width, trap.height);

          // White header bar visual
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(trap.x, trap.y, trap.width, 24);

          // Dark border
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(trap.x, trap.y, trap.width, trap.height);

          // Close [X] button at top right
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(trap.x + trap.width - 24, trap.y, 24, 24);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('X', trap.x + trap.width - 16, trap.y + 16);

          // Tiny Header Title Text
          ctx.fillStyle = '#334155';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('⚠️ ERROR 404: YOU WIN!', trap.x + 8, trap.y + 16);

          // Comical ad messaging
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.fillText('WINNER!', trap.x + 15, trap.y + 60);

          ctx.font = '11px sans-serif';
          ctx.fillText('Claim Free Custom Skin.', trap.x + 15, trap.y + 85);
          ctx.fillText('Do not click the X!', trap.x + 15, trap.y + 105);

          // Visual flashing premium button
          const flash = Math.sin(Date.now() / 100) > 0;
          ctx.fillStyle = flash ? '#eab308' : '#e2e8f0';
          ctx.fillRect(trap.x + 15, trap.y + 130, 110, 24);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('👉 START DOWNLOAD', trap.x + 22, trap.y + 145);
        }
        else if (trap.type === 'gravity-line') {
          // Draw glowing transparent vertical beam path
          const flux = Math.sin((Date.now() / 100)) * 0.15 + 0.5;
          ctx.fillStyle = (trap.color || '#a855f7');
          ctx.save();
          ctx.globalAlpha = flux;
          ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
          ctx.restore();

          // borders
          ctx.strokeStyle = trap.color || '#a855f7';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(trap.x, trap.y, trap.width, trap.height);
        }
        else if (trap.type === 'fake-key') {
          // Draw standard key sprite shape
          ctx.save();
          const spin = Math.sin(Date.now() / 150) * 0.5;
          ctx.translate(trap.x + 12, trap.y + 12);
          ctx.rotate(spin);

          ctx.fillStyle = trap.color || '#fbbf24';

          // Ring head
          ctx.beginPath();
          ctx.arc(-4, 0, 7, 0, Math.PI * 2);
          ctx.arc(-4, 0, 4, 0, Math.PI * 2, true); // hole
          ctx.closePath();
          ctx.fill();

          // shaft body
          ctx.fillRect(-1, -2, 14, 4);
          // standard teeth blocks
          ctx.fillRect(9, 2, 4, 4);
          ctx.fillRect(5, 2, 4, 4);

          ctx.restore();
        }
      });

      // E2. Draw Escape Hole (Level 7 Dev dialogue mechanic)
      if (escapeHoleActive && level.id === 7) {
        const holeX = 130, holeY = 366, holeW = 52, holeH = 24;
        const cx = holeX + holeW / 2;
        const cy = holeY + holeH / 2;
        const pulse = Math.sin(Date.now() / 130) * 0.25 + 0.75;

        ctx.save();

        // Dark void ellipse
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(cx, cy, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow ring — faked with two strokes of decreasing alpha (no shadowBlur)
        ctx.beginPath();
        ctx.ellipse(cx, cy, holeW / 2 + 4, holeH / 2 + 3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${pulse * 0.35})`;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner swirl (no shadow)
        ctx.beginPath();
        ctx.ellipse(cx, cy, holeW / 4, holeH / 4, Date.now() / 800, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(216, 180, 254, ${pulse * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label above (no shadow)
        ctx.fillStyle = `rgba(216, 180, 254, ${pulse})`;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⬇ PULE AQUI!', cx, holeY - 6);
        ctx.textAlign = 'left';

        ctx.restore();
      }

      // F. Draw Active Interactive Hints if unlocked & selected
      if (hintActive) {
        ctx.save();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        traps.forEach(trap => {
          // Drawing highlights on hidden or triggered traps
          if (trap.type === 'up-spike' && trap.state === 'idle') {
            ctx.strokeRect(trap.x - 3, trap.targetY! - 3, trap.width + 6, trap.height + 6);
            ctx.fillStyle = '#eab30866';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⚠️ SPIKES POPUP!', trap.x - 20, trap.targetY! - 12);
          }
          else if (trap.type === 'falling-spike' && trap.state === 'idle') {
            ctx.strokeRect(trap.x - 2, trap.y - 2, trap.width + 4, trap.height + 4);
            ctx.fillStyle = '#eab30866';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⚠️ DROP SPIKE', trap.x - 15, trap.y + 64);
          }
          else if (trap.type === 'crushing-pillar' && trap.state === 'idle') {
            ctx.strokeRect(trap.x - 2, trap.origY - 2, trap.width + 4, 250);
            ctx.fillStyle = '#eab30888';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⚠️ PILLAR CRUSH!', trap.x - 10, trap.origY + 270);
          }
          else if (trap.type === 'ad-physical-popup' && trap.state === 'idle') {
            ctx.strokeRect(trap.x - 3, trap.y - 3, trap.width + 6, trap.height + 6);
            ctx.fillStyle = '#eab30888';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⚠️ AD BLOCK SEVERE', trap.x - 10, trap.y - 12);
          }
          else if (trap.type === 'fleeing-door' && trap.state === 'idle') {
            ctx.beginPath();
            ctx.arc(trap.triggerBox!.x + trap.triggerBox!.width / 2, trap.triggerBox!.y + 100, 35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⚠️ DOOR MOVES!', trap.x - 20, trap.y - 12);
          }
        });

        // Highlight unstable steps
        platforms.forEach(plat => {
          if (plat.type === 'fake-fall') {
            ctx.strokeRect(plat.x - 2, plat.y - 2, plat.width + 4, plat.height + 4);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⚠️ COLLAPSIBLE PLATFORM!', plat.x, plat.y - 8);
          }
        });
        ctx.restore();
      }

      // G. Draw Particles visual effects
      particlesRef.current.forEach((pt) => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      });
      ctx.globalAlpha = 1.0; // Reset alpha filter

      // H. Draw Player character Box
      const p = playerRef.current;
      if (!p.dead) {
        ctx.save();
        // Translate to player center to support squash & stretch rotation flip
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        ctx.scale(p.scaleX * (p.facing === 'left' ? -1 : 1), p.scaleY);

        // 1. Draw Waving Cat Tail (drawn behind/before the core body)
        ctx.save();
        const tailWave = Math.sin(Date.now() / 120) * 4.5;
        // Draw black outline first
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-p.width / 2 + 2, p.height / 2 - 3);
        ctx.bezierCurveTo(
          -p.width / 2 - 6, p.height / 2 - 1 + tailWave * 0.5,
          -p.width / 2 - 11, p.height / 2 - 8 + tailWave,
          -p.width / 2 - 9, p.height / 2 - 14 + tailWave * 1.2
        );
        ctx.stroke();

        // Draw inner colored tail core
        ctx.strokeStyle = activeSkin.color;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();

        // 2. Draw Left & Right Cat Ears (with outline and pink highlights)
        // Left Ear Outline & Fill
        ctx.save();
        ctx.fillStyle = activeSkin.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.8;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-p.width / 2 + 1, -p.height / 2);
        ctx.lineTo(-p.width / 2 - 1, -p.height / 2 - 8);
        ctx.lineTo(-p.width / 2 + 7, -p.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner Left Pink Ear
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.moveTo(-p.width / 2 + 2, -p.height / 2 + 1);
        ctx.lineTo(-p.width / 2, -p.height / 2 - 5);
        ctx.lineTo(-p.width / 2 + 5, -p.height / 2 + 1);
        ctx.closePath();
        ctx.fill();

        // Right Ear Outline & Fill
        ctx.fillStyle = activeSkin.color;
        ctx.beginPath();
        ctx.moveTo(p.width / 2 - 1, -p.height / 2);
        ctx.lineTo(p.width / 2 + 1, -p.height / 2 - 8);
        ctx.lineTo(p.width / 2 - 7, -p.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner Right Pink Ear
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.moveTo(p.width / 2 - 2, -p.height / 2 + 1);
        ctx.lineTo(p.width / 2, -p.height / 2 - 5);
        ctx.lineTo(p.width / 2 - 5, -p.height / 2 + 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 3. Body block core
        ctx.fillStyle = activeSkin.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);

        // Solid outline trim
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);

        // 4. Draw Cheek Whiskers
        ctx.save();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        // Left side cheeks whiskers
        ctx.moveTo(-p.width / 2 + 2, 0);
        ctx.lineTo(-p.width / 2 - 4, -1);
        ctx.moveTo(-p.width / 2 + 2, 2.5);
        ctx.lineTo(-p.width / 2 - 5, 2.5);
        
        // Right side cheeks whiskers
        ctx.moveTo(p.width / 2 - 2, 0);
        ctx.lineTo(p.width / 2 + 4, -1);
        ctx.moveTo(p.width / 2 - 2, 2.5);
        ctx.lineTo(p.width / 2 + 5, 2.5);
        ctx.stroke();
        ctx.restore();

        // Add visual Crown King detail if selected
        if (activeSkin.faceType === 'crowned') {
          ctx.fillStyle = '#fbbf24'; // Yellow crown top
          ctx.beginPath();
          ctx.moveTo(-p.width / 2, -p.height / 2 - 2);
          ctx.lineTo(-p.width / 2 + 4, -p.height / 2 - 12);
          ctx.lineTo(-p.width / 4, -p.height / 2 - 5);
          ctx.lineTo(0, -p.height / 2 - 14);
          ctx.lineTo(p.width / 4, -p.height / 2 - 5);
          ctx.lineTo(p.width / 2 - 4, -p.height / 2 - 12);
          ctx.lineTo(p.width / 2, -p.height / 2 - 2);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#854d0e';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw comical facial expressions on block based on state and velocity
        ctx.fillStyle = '#ffffff'; // Sclera white of eyes
        let faceOffset = p.facing === 'left' ? -1 : 1;

        if (p.vy * p.gravityDirection > 1.2) {
          // A. Scared Falling face expression (O_O scream!)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-3, -2, 5.2, 0, Math.PI * 2);
          ctx.arc(5, -2, 5.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(-3, -2, 2.2, 0, Math.PI * 2);
          ctx.arc(5, -2, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Screaming wide red mouth
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(1, 5, 4, 0, Math.PI);
          ctx.fill();
        }
        else if (activeSkin.faceType === 'derp') {
          // B. Extremely derp crossed cross-eye eyes expression
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-7, -5, 6, 6);
          ctx.fillRect(1, -5, 6, 6);

          ctx.fillStyle = '#000000';
          ctx.fillRect(-3, -4, 2, 2); // left eye looks right
          ctx.fillRect(1, -4, 2, 2); // right eye looks left

          // silly tongue hanging out
          ctx.fillStyle = '#fb7185';
          ctx.fillRect(0, 3, 3, 4);
        }
        else if (activeSkin.faceType === 'glitch') {
          // C. Cyber error glitch digital lines
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-7, -4, 14, 2);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(-4, 2, 10, 25); // visual drift pixel
        }
        else if (activeSkin.faceType === 'cool') {
          // D. Cool sunglasses
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-9, -4, 7, 5);
          ctx.fillRect(-1, -4, 7, 5);
          // bridge connection
          ctx.fillRect(-2, -3, 3, 2.2);

          // smug confident smirk mouth line
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-3, 4);
          ctx.lineTo(3, 3);
          ctx.stroke();
        }
        else {
          // E. Happy smiling face expression (^___^)
          ctx.fillStyle = '#000000';
          // left dot
          ctx.fillRect(-5, -4, 2.5, 3.5);
          // right dot
          ctx.fillRect(2.5, -4, 2.5, 3.5);

          // Smile arc curve
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(-1, 2, 4.5, 0.1, Math.PI - 0.1, false);
          ctx.stroke();
        }

        ctx.restore();
      }

      // I. Render floating texts
      floatingTextsRef.current.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      // J. Game UI Overlay display (Powerup alerts on-screen HUD timer bar)
      if (p.activePowerUp && p.powerUpTimer > 0) {
        ctx.save();
        const maxTime = p.activePowerUp === 'mini-size' ? 900 : 480;
        const width = 110;
        const ratio = p.activePowerUp === 'triple-jump' ? 1.0 : p.powerUpTimer / maxTime;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(16, 16, width + 14, 34);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.strokeRect(16, 16, width + 14, 34);

        ctx.font = 'bold 9px monospace';
        let label = '';
        let colorTheme = '';
        if (p.activePowerUp === 'triple-jump') { label = 'TRIPLE JUMP'; colorTheme = '#fbbf24'; }
        else if (p.activePowerUp === 'mini-size') { label = 'MINI CAT'; colorTheme = '#4ade80'; }
        else if (p.activePowerUp === 'super-speed') { label = 'SUPER SPEED'; colorTheme = '#fb7185'; }

        ctx.fillStyle = colorTheme;
        ctx.fillText(label, 22, 28);

        // Progress track
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.fillRect(22, 35, width, 5);
        ctx.fillStyle = colorTheme;
        ctx.fillRect(22, 35, width * ratio, 5);

        ctx.restore();
      }

      // FPS display (top-right corner)
      ctx.fillStyle = fpsRef.current < 50 ? '#ef4444' : '#22c55e';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${fpsRef.current} fps`, CANVAS_WIDTH - 6, 14);
      ctx.textAlign = 'left';

      ctx.restore(); // Undo Translate screen shake
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [platforms, traps, coinsList, powerUpsList, activeSkin, hintActive, isPaused, level, hasKey, currentDoorPos, virtualInput, escapeHoleActive]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-center justify-center">
      {/* Dynamic Troll Banner alerts floating on top */}
      {trollMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-rose-600 text-white font-mono text-center font-bold text-xs rounded-full border-2 border-white shadow-lg animate-bounce z-40 max-w-[90%]">
          🚨 {trollMessage}
        </div>
      )}

      {/* Actual HTML5 Graphical Stage viewport */}
      <canvas
        id="level-devil-stage"
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full max-w-full max-h-full aspect-[16/9] block object-contain select-none bg-slate-900"
      />
    </div>
  );
};
