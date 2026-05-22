export type TrapType =
  | 'up-spike'         // Spikes that pop up vertically when near
  | 'falling-spike'    // Ceiling spikes that drop down
  | 'crushing-pillar'  // Ceiling block that slams down
  | 'moving-spike'     // Spikes moving back and forth
  | 'swinging-blade'   // Pendulum physical swing
  | 'spring-board'     // Launches player high, usually into ceiling spikes
  | 'flying-arrow'     // Horizontal projectile fired when triggered
  | 'fleeing-door'     // The exit door itself, moving away when player gets close
  | 'teleport-troll'   // A door/portal that teleports you back or into trap
  | 'gravity-line'     // Inverts gravity
  | 'ad-physical-popup' // A physical wall representing a popup ad
  | 'fake-key'         // A key that flees, triggers a boulder, or dissolves
  | 'boulder-roll'     // Giant rolling ball
  | 'button-spike';    // Button that triggers spiked wall

export interface Trap {
  id: string;
  type: TrapType;
  x: number;
  y: number;
  width: number;
  height: number;
  origX: number;
  origY: number;
  targetX?: number;
  targetY?: number;
  vx?: number;
  vy?: number;
  state: 'idle' | 'triggered' | 'active' | 'retracted' | 'exhausted';
  triggerBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
  color?: string;
  speed?: number;
  cooldown?: number;
  timer?: number;
  hasCollided?: boolean;
}

export type PlatformType = 'normal' | 'fake-fall' | 'fragile' | 'bouncy' | 'lever-bridge' | 'ice' | 'fake-solid';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  color?: string;
  state: 'stable' | 'shaking' | 'falling' | 'fell' | 'recovering';
  timer?: number;
  origY: number;
  vy?: number;
  triggerBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  pulseOffset: number;
}

export type PowerUpType = 'triple-jump' | 'mini-size' | 'super-speed';

export interface PowerUpItem {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  collected: boolean;
  pulseOffset: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  hint: string;
  hintCost: number;
  playerStartX: number;
  playerStartY: number;
  doorX: number;
  doorY: number;
  platforms: Platform[];
  traps: Trap[];
  coins: Coin[];
  powerUps?: PowerUpItem[];
  gravity?: number;
  maxSpikesPrompt?: string; // Comical phrase displayed on death
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  faceType: 'happy' | 'derp' | 'scared' | 'cool' | 'glitch' | 'crowned';
  price: number;
  unlocked: boolean;
  description: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  angle?: number;
  angularVelocity?: number;
}
