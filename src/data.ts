import { LevelConfig, Skin } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
export const PLAYER_SIZE = 24;

export const INITIAL_SKINS: Skin[] = [
  {
    id: 'blocky',
    name: 'Neko Sky Blue',
    color: '#3b82f6', // blue
    faceType: 'happy',
    price: 0,
    unlocked: true,
    description: 'A sweet, bouncy sky-blue kitten who always lands on their feet (well, mostly).'
  },
  {
    id: 'derp',
    name: 'Derpy Calico',
    color: '#f97316', // orange
    faceType: 'derp',
    price: 100,
    unlocked: false,
    description: 'Consistently confused. Thinks tasty catnip treats are hidden inside the lava.'
  },
  {
    id: 'glitch',
    name: 'Glitchy Void',
    color: '#a855f7', // purple
    faceType: 'glitch',
    price: 250,
    unlocked: false,
    description: 'A sleek, semi-stable digital glitch cat. Likes to glitch-pounce and chase laser dots.'
  },
  {
    id: 'cool',
    name: 'Devil Shady Cat',
    color: '#ef4444', // red
    faceType: 'cool',
    price: 400,
    unlocked: false,
    description: 'Wears visual sunglasses. This cool cat claims they are way too swift for spikes.'
  },
  {
    id: 'crowned',
    name: 'King Meowster',
    color: '#eab308', // gold
    faceType: 'crowned',
    price: 600,
    unlocked: false,
    description: 'Royal Golden Emperor of cats. Absolute power does not protect against gravity.'
  },
  {
    id: 'slime',
    name: 'Lime Jelly Cat',
    color: '#22c55e', // green
    faceType: 'scared',
    price: 150,
    unlocked: false,
    description: 'Extremely jumpy lime jelly neko. Startled by its own shadow; melts on spikes.'
  }
];

export const MOCK_ADS_POOL = [
  {
    title: 'Grow 10 Inches of Hair!',
    description: 'Scientific breakthrough! Try our pixelated follicle formula today.',
    cta: 'GRAB COINS',
    productImage: '✨'
  },
  {
    title: 'Hot Pixels In Your Area!',
    description: 'Tired of playing alone? 6 premium single blocks are waiting nearby.',
    cta: 'CHAT NOW',
    productImage: '❤️'
  },
  {
    title: 'Unwinnable Idle Hack!',
    description: 'Watch 24,000 ads to unlock a wooden spoon. Best incremental game!',
    cta: 'INSTALL NOW',
    productImage: '🥄'
  },
  {
    title: 'AI Trash Generator',
    description: 'Generate 50,000 incoherent charts per second! Clean UI, much slop.',
    cta: 'GENERATE',
    productImage: '🤖'
  },
  {
    title: 'Meme Crypto Coin Mooning',
    description: 'Invest your life savings in DevilCoin! Guaranteed returns* (-99.8%)',
    cta: 'BUY HIGH',
    productImage: '🪙'
  }
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Como Começar',
    subtitle: 'Apenas entre no portal dourado de saída... É super simples!',
    hint: 'Cuidado! Spikes surpresa vão brotar do chão logo antes do portal. Pule bem antes para passar seguro.',
    hintCost: 20,
    playerStartX: 80,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Você achava que seria um caminho reto e fácil? Bem-vindo!',
    platforms: [
      { id: 'l1_floor', x: 0, y: 390, width: 800, height: 60, type: 'normal', state: 'stable', origY: 390 }
    ],
    traps: [
      {
        id: 'l1_up_spike',
        type: 'up-spike',
        x: 650,
        y: 390,
        width: 40,
        height: 38,
        origX: 650,
        origY: 390,
        targetY: 352,
        state: 'idle',
        visible: false,
        triggerBox: { x: 570, y: 200, width: 80, height: 200 },
        speed: 6,
        color: '#ef4444'
      }
    ],
    coins: [
      { id: 'l1_c1', x: 260, y: 350, collected: false, pulseOffset: 0 },
      { id: 'l1_c2', x: 450, y: 350, collected: false, pulseOffset: 1.5 },
      { id: 'l1_c3', x: 580, y: 350, collected: false, pulseOffset: 3.0 }
    ]
  },
  {
    id: 2,
    name: 'O Portal Fugitivo',
    subtitle: 'Neko, o destino está se movendo...',
    hint: 'O portal vai teleportar para a plataforma flutuante quando você se aproximar. Suba nela para completar!',
    hintCost: 35,
    playerStartX: 80,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Ops! O portal fugiu de você. Use a plataforma flutuante!',
    platforms: [
      { id: 'l2_f1', x: 0, y: 390, width: 250, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l2_f2', x: 350, y: 390, width: 450, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l2_float1', x: 480, y: 240, width: 120, height: 20, type: 'normal', state: 'stable', origY: 240 }
    ],
    traps: [
      {
        id: 'l2_spike_pit',
        type: 'moving-spike',
        x: 250,
        y: 390,
        width: 100,
        height: 30,
        origX: 250,
        origY: 390,
        state: 'active',
        visible: true,
        color: '#f43f5e'
      },
      {
        id: 'l2_flee_door',
        type: 'fleeing-door',
        x: 720,
        y: 330,
        width: 40,
        height: 60,
        origX: 720,
        origY: 330,
        targetX: 520,
        targetY: 180,
        state: 'idle',
        visible: false,
        triggerBox: { x: 580, y: 200, width: 60, height: 200 },
        speed: 12
      }
    ],
    coins: [
      { id: 'l2_c1', x: 180, y: 340, collected: false, pulseOffset: 0 },
      { id: 'l2_c2', x: 300, y: 280, collected: false, pulseOffset: 1 },
      { id: 'l2_c3', x: 540, y: 195, collected: false, pulseOffset: 2 }
    ]
  },
  {
    id: 3,
    name: 'Passos Suspeitos',
    subtitle: 'Neko júnior, pise com extrema leveza!',
    hint: 'Os degraus suspensos vão desabar! Pegue o poder do Salto Triplo na esquerda e voe sobre o abismo!',
    hintCost: 40,
    playerStartX: 85,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Degraus falsos! Corra ou use o poder do Salto Triplo!',
    platforms: [
      { id: 'l3_f1', x: 0, y: 390, width: 200, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l3_f2', x: 600, y: 390, width: 200, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l3_fake1', x: 260, y: 280, width: 120, height: 24, type: 'fake-fall', state: 'stable', origY: 280 },
      { id: 'l3_fake2', x: 440, y: 220, width: 110, height: 24, type: 'fake-fall', state: 'stable', origY: 220 }
    ],
    traps: [
      {
        id: 'l3_pit_spikes',
        type: 'moving-spike',
        x: 200,
        y: 410,
        width: 400,
        height: 40,
        origX: 200,
        origY: 410,
        state: 'active',
        visible: true,
        color: '#ef4444'
      }
    ],
    coins: [
      { id: 'l3_c1', x: 320, y: 220, collected: false, pulseOffset: 0.5 },
      { id: 'l3_c2', x: 495, y: 160, collected: false, pulseOffset: 1.5 },
      { id: 'l3_c3', x: 680, y: 340, collected: false, pulseOffset: 2.5 }
    ],
    powerUps: [
      { id: 'l3_p1', type: 'triple-jump', x: 120, y: 350, collected: false, pulseOffset: 1.0 }
    ]
  },
  {
    id: 4,
    name: 'Céu Desabando',
    subtitle: 'Cuidado com a sua cabeça peluda.',
    hint: 'Os estalactites no teto vão cair se você correr rápido. Aproxime-se para ativar, recue e passe seguro!',
    hintCost: 45,
    playerStartX: 80,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Olhe para cima! O teto está agressivo hoje.',
    platforms: [
      { id: 'l4_f1', x: 0, y: 390, width: 800, height: 60, type: 'normal', state: 'stable', origY: 390 }
    ],
    traps: [
      {
        id: 'l4_spike_fall1',
        type: 'falling-spike',
        x: 340,
        y: 40,
        width: 32,
        height: 48,
        origX: 340,
        origY: 40,
        targetY: 342,
        state: 'idle',
        visible: true,
        triggerBox: { x: 260, y: 100, width: 80, height: 300 },
        speed: 9.5,
        color: '#f43f5e'
      },
      {
        id: 'l4_spike_fall2',
        type: 'falling-spike',
        x: 540,
        y: 40,
        width: 32,
        height: 48,
        origX: 540,
        origY: 40,
        targetY: 342,
        state: 'idle',
        visible: true,
        triggerBox: { x: 460, y: 100, width: 80, height: 300 },
        speed: 10.5,
        color: '#f43f5e'
      }
    ],
    coins: [
      { id: 'l4_c1', x: 300, y: 340, collected: false, pulseOffset: 1.1 },
      { id: 'l4_c2', x: 500, y: 340, collected: false, pulseOffset: 2.2 }
    ],
    powerUps: [
      { id: 'l4_p1', type: 'super-speed', x: 190, y: 350, collected: false, pulseOffset: 0.5 }
    ]
  },
  {
    id: 5,
    name: 'Anomalia Gravitacional',
    subtitle: 'Neko está andando nas nuvens?',
    hint: 'Cruze a linha roxa para inverter a gravidade para o teto. Siga e pise na linha ouro para voltar perto do portal!',
    hintCost: 50,
    playerStartX: 60,
    playerStartY: 300,
    doorX: 730,
    doorY: 330,
    maxSpikesPrompt: 'Ops! Onde é cima de novo?',
    platforms: [
      { id: 'l5_f1', x: 0, y: 390, width: 400, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l5_f2', x: 600, y: 390, width: 200, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l5_ceiling', x: 250, y: 0, width: 420, height: 40, type: 'normal', state: 'stable', origY: 0 }
    ],
    traps: [
      { id: 'l5_gap_spikes', type: 'moving-spike', x: 400, y: 410, width: 200, height: 40, origX: 400, origY: 410, state: 'active', visible: true, color: '#ef4444' },
      { id: 'l5_ceil_spike1', type: 'moving-spike', x: 440, y: 40, width: 30, height: 30, origX: 440, origY: 40, state: 'active', visible: true, color: '#ec4899' },
      {
        id: 'l5_grav_up',
        type: 'gravity-line',
        x: 320,
        y: 200,
        width: 15,
        height: 190,
        origX: 320,
        origY: 200,
        state: 'idle',
        visible: true,
        color: '#a855f7'
      },
      {
        id: 'l5_grav_down',
        type: 'gravity-line',
        x: 610,
        y: 40,
        width: 15,
        height: 190,
        origX: 610,
        origY: 40,
        state: 'idle',
        visible: true,
        color: '#eab308'
      }
    ],
    coins: [
      { id: 'l5_c1', x: 230, y: 340, collected: false, pulseOffset: 0 },
      { id: 'l5_c2', x: 480, y: 90, collected: false, pulseOffset: 1.6 }
    ]
  },
  {
    id: 6,
    name: 'Esmagador de Gatos',
    subtitle: 'Neko-panqueca!',
    hint: 'Os blocos de pedra gigantes caem se passar correndo. Pegue o "Leite Mini" para encolher e passar correndo fácil!',
    hintCost: 55,
    playerStartX: 60,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Achatado como uma deliciosa pizza fria!',
    platforms: [
      { id: 'l6_floor', x: 0, y: 390, width: 800, height: 60, type: 'normal', state: 'stable', origY: 390 }
    ],
    traps: [
      {
        id: 'l6_thwomp1',
        type: 'crushing-pillar',
        x: 320,
        y: -100,
        width: 70,
        height: 250,
        origX: 320,
        origY: -100,
        targetY: 140,
        state: 'idle',
        visible: true,
        triggerBox: { x: 200, y: 0, width: 110, height: 450 },
        speed: 15.5,
        color: '#475569'
      },
      {
        id: 'l6_thwomp2',
        type: 'crushing-pillar',
        x: 540,
        y: -100,
        width: 70,
        height: 250,
        origX: 540,
        origY: -100,
        targetY: 140,
        state: 'idle',
        visible: true,
        triggerBox: { x: 420, y: 0, width: 110, height: 450 },
        speed: 16.5,
        color: '#475569'
      }
    ],
    coins: [
      { id: 'l6_c1', x: 230, y: 340, collected: false, pulseOffset: 0.1 },
      { id: 'l6_c2', x: 450, y: 340, collected: false, pulseOffset: 1.1 },
      { id: 'l6_c3', x: 670, y: 340, collected: false, pulseOffset: 2.1 }
    ],
    powerUps: [
      { id: 'l6_p1', type: 'mini-size', x: 140, y: 350, collected: false, pulseOffset: 1.2 }
    ]
  },
  {
    id: 7,
    name: 'Teto Inevitável',
    subtitle: 'Uma fase impossível... ou será que não?',
    hint: 'Após a segunda morte, um misterioso personagem aparece para ajudar. Resista e preste atenção ao diálogo!',
    hintCost: 60,
    playerStartX: 70,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Impossível? Resista mais uma vez e descubra o segredo desta fase!',
    platforms: [
      { id: 'l7_floor', x: 0, y: 390, width: 800, height: 60, type: 'normal', state: 'stable', origY: 390 }
    ],
    traps: [
      // Full-width ceiling spike — triggers immediately, no escape
      {
        id: 'l7_ceil_main',
        type: 'falling-spike',
        x: 0,
        y: 0,
        width: 790,
        height: 32,
        origX: 0,
        origY: 0,
        targetY: 356,
        state: 'idle',
        visible: true,
        triggerBox: { x: 120, y: 0, width: 680, height: 450 },
        speed: 10,
        color: '#ef4444'
      },
      // Floor pop-up spikes
      {
        id: 'l7_fspike1',
        type: 'up-spike',
        x: 160,
        y: 420,
        width: 70,
        height: 25,
        origX: 160,
        origY: 420,
        targetY: 360,
        state: 'idle',
        visible: false,
        triggerBox: { x: 120, y: 0, width: 200, height: 450 },
        speed: 28,
        color: '#dc2626'
      },
      {
        id: 'l7_fspike2',
        type: 'up-spike',
        x: 480,
        y: 420,
        width: 80,
        height: 25,
        origX: 480,
        origY: 420,
        targetY: 360,
        state: 'idle',
        visible: false,
        triggerBox: { x: 400, y: 0, width: 250, height: 450 },
        speed: 28,
        color: '#f43f5e'
      }
    ],
    coins: [
      { id: 'l7_c1', x: 220, y: 340, collected: false, pulseOffset: 0.5 },
      { id: 'l7_c2', x: 490, y: 100, collected: false, pulseOffset: 1.5 },
      { id: 'l7_c3', x: 670, y: 340, collected: false, pulseOffset: 2.5 }
    ],
    powerUps: [
      { id: 'l7_p1', type: 'triple-jump', x: 240, y: 350, collected: false, pulseOffset: 1.0 }
    ]
  },
  {
    id: 8,
    name: 'A Chave de Ouro',
    subtitle: 'Neko Chaveiro.',
    hint: 'Pegar a chave dourada libera uma grande pedra rolando da esquerda! Corra rápido para a plataforma de segurança na direita.',
    hintCost: 65,
    playerStartX: 80,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'A pedra gigante te alcançou! Corra e suba na plataforma elevada.',
    platforms: [
      { id: 'l8_floor', x: 0, y: 390, width: 800, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l8_safe_step', x: 420, y: 230, width: 140, height: 20, type: 'normal', state: 'stable', origY: 230 }
    ],
    traps: [
      {
        id: 'l8_troll_key',
        type: 'fake-key',
        x: 320,
        y: 340,
        width: 25,
        height: 25,
        origX: 320,
        origY: 340,
        state: 'idle',
        visible: true,
        color: '#fbbf24'
      },
      {
        id: 'l8_boulder',
        type: 'boulder-roll',
        x: -100,
        y: 320,
        width: 70,
        height: 70,
        origX: -100,
        origY: 320,
        targetX: 900,
        state: 'idle',
        visible: false,
        speed: 7.5,
        color: '#78716c'
      }
    ],
    coins: [
      { id: 'l8_c1', x: 490, y: 170, collected: false, pulseOffset: 0.1 },
      { id: 'l8_c2', x: 670, y: 340, collected: false, pulseOffset: 1.1 }
    ]
  },
  {
    id: 9,
    name: 'O Trampolim Audaz',
    subtitle: 'Cuidado para não bater no teto de espinhos!',
    hint: 'O trampolim no meio te joga super alto, mas o teto está cheio de espinhos! Direcione para a DIREITA logo após pular para achar o caminho seguro.',
    hintCost: 70,
    playerStartX: 80,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Teto afiado! Controle seu voo deslizando rapidamente para o lado.',
    platforms: [
      { id: 'l9_f1', x: 0, y: 390, width: 220, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l9_f_bounce', x: 220, y: 390, width: 160, height: 60, type: 'bouncy', state: 'stable', origY: 390, color: '#22c55e' },
      { id: 'l9_f2', x: 380, y: 390, width: 420, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l9_h1', x: 500, y: 220, width: 120, height: 20, type: 'normal', state: 'stable', origY: 220 }
    ],
    traps: [
      {
        id: 'l9_ceiling_spikes',
        type: 'moving-spike',
        x: 180,
        y: 40,
        width: 250,
        height: 30,
        origX: 180,
        origY: 40,
        state: 'active',
        visible: true,
        color: '#ef4444'
      }
    ],
    coins: [
      { id: 'l9_c1', x: 300, y: 180, collected: false, pulseOffset: 0 },
      { id: 'l9_c2', x: 560, y: 160, collected: false, pulseOffset: 1.5 },
      { id: 'l9_c3', x: 700, y: 345, collected: false, pulseOffset: 3.0 }
    ],
    powerUps: [
      { id: 'l9_p1', type: 'super-speed', x: 120, y: 350, collected: false, pulseOffset: 0.5 }
    ]
  },
  {
    id: 10,
    name: 'A Despedida de Neko',
    subtitle: 'O desafio final do mestre sorrateiro!',
    hint: 'Esta fase tem de tudo: plataformas falsas, uma flecha rápida na direita e gravidade invertida! Pegue o Salto Triplo na esquerda e pule veloz até a saída.',
    hintCost: 80,
    playerStartX: 85,
    playerStartY: 300,
    doorX: 720,
    doorY: 330,
    maxSpikesPrompt: 'Fase final superada? Você é um verdadeiro herói de Level Devil!',
    platforms: [
      { id: 'l10_f1', x: 0, y: 390, width: 220, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l10_f2_fake', x: 220, y: 390, width: 150, height: 60, type: 'fake-fall', state: 'stable', origY: 390 },
      { id: 'l10_f3', x: 370, y: 390, width: 430, height: 60, type: 'normal', state: 'stable', origY: 390 },
      { id: 'l10_float', x: 440, y: 200, width: 120, height: 20, type: 'normal', state: 'stable', origY: 200 }
    ],
    traps: [
      {
        id: 'l10_arrow',
        type: 'flying-arrow',
        x: 820,
        y: 340,
        width: 35,
        height: 15,
        origX: 820,
        origY: 340,
        targetX: 100,
        state: 'idle',
        visible: false,
        triggerBox: { x: 320, y: 100, width: 60, height: 350 },
        speed: 13,
        color: '#ec4899'
      },
      {
        id: 'l10_grav',
        type: 'gravity-line',
        x: 580,
        y: 200,
        width: 15,
        height: 190,
        origX: 580,
        origY: 200,
        state: 'idle',
        visible: true,
        color: '#a855f7'
      },
      {
        id: 'l10_teleport_door',
        type: 'fleeing-door',
        x: 720,
        y: 330,
        width: 40,
        height: 60,
        origX: 720,
        origY: 330,
        targetX: 500,
        targetY: 140,
        state: 'idle',
        visible: false,
        triggerBox: { x: 670, y: 100, width: 40, height: 350 },
        speed: 15
      }
    ],
    coins: [
      { id: 'l10_c1', x: 190, y: 340, collected: false, pulseOffset: 0 },
      { id: 'l10_c2', x: 500, y: 140, collected: false, pulseOffset: 1.1 }
    ],
    powerUps: [
      { id: 'l10_p1', type: 'triple-jump', x: 110, y: 350, collected: false, pulseOffset: 1.0 }
    ]
  }
];
