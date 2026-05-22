import { useState, useEffect } from 'react';
import { LEVELS, INITIAL_SKINS, MOCK_ADS_POOL } from './data';
import { GameCanvas } from './components/GameCanvas';
import { SkinsShop } from './components/SkinsShop';
import { MockAdController } from './components/MockAdController';
import { StartScreen } from './components/StartScreen';
import { DevDialogue } from './components/DevDialogue';
import { soundEffects } from './components/SoundEffects';
import {
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Trophy,
  HelpCircle,
  ShoppingBag,
  Tv,
  Skull,
  Coins,
  ChevronLeft,
  ChevronRight,
  Sparkle,
  Gamepad2,
  Layers,
  Info,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);

  // Playtest Mode (by default true, bypasses ads, pause screens and death modals)
  const [playtestMode, setPlaytestMode] = useState(true);

  // Game state
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('devil_coins');
    return saved ? parseInt(saved) : 999; // Give 999 starting coins bonus for easy sandbox cosmetic testing
  });

  const [currentLevelIdx, setCurrentLevelIdx] = useState(() => {
    const saved = localStorage.getItem('devil_unlocked_idx');
    return saved ? parseInt(saved) : 0;
  });

  const [deathsCount, setDeathsCount] = useState(() => {
    const saved = localStorage.getItem('devil_deaths');
    return saved ? parseInt(saved) : 0;
  });

  const [activeSkinId, setActiveSkinId] = useState(() => {
    const saved = localStorage.getItem('devil_active_skin');
    return saved || 'blocky';
  });

  const [purchasedSkins, setPurchasedSkins] = useState<string[]>(() => {
    const saved = localStorage.getItem('devil_purchased_skins');
    return saved ? JSON.parse(saved) : ['blocky'];
  });

  const [unlockedHints, setUnlockedHints] = useState<number[]>(() => {
    const saved = localStorage.getItem('devil_unlocked_hints');
    return saved ? JSON.parse(saved) : [];
  });

  // App Layout controls
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());
  const [playResetTrigger, setPlayResetTrigger] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showDevDialogue, setShowDevDialogue] = useState(false);
  const [escapeHoleActive, setEscapeHoleActive] = useState(false);

  // Sync fullscreen change back if cancelled via escape key natively
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    soundEffects.playUnlock();
    setIsFullscreen(prev => {
      const next = !prev;
      if (next) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  };

  // Deceptive Death Prompt overlays
  const [activeDeathPrompt, setActiveDeathPrompt] = useState<string | null>(null);

  // Mock AD center state
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [mockAdType, setMockAdType] = useState<'reward' | 'interstitial'>('reward');
  const [mockBannerAdIndex, setMockBannerAdIndex] = useState(0);
  const [accumulatedClickAdRevenue, setAccumulatedClickAdRevenue] = useState(0.00);

  // Mobile virtual inputs state
  const [virtualInput, setVirtualInput] = useState({ left: false, right: false, jump: false });

  const activeLevel = LEVELS[currentLevelIdx] || LEVELS[0];
  const activeSkin = INITIAL_SKINS.find(s => s.id === activeSkinId) || INITIAL_SKINS[0];

  // Rotate hilarious banner ads every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMockBannerAdIndex(prev => (prev + 1) % MOCK_ADS_POOL.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync state helpers to localStorage for permanence
  useEffect(() => {
    localStorage.setItem('devil_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('devil_deaths', deathsCount.toString());
  }, [deathsCount]);

  useEffect(() => {
    localStorage.setItem('devil_active_skin', activeSkinId);
  }, [activeSkinId]);

  useEffect(() => {
    localStorage.setItem('devil_purchased_skins', JSON.stringify(purchasedSkins));
  }, [purchasedSkins]);

  useEffect(() => {
    localStorage.setItem('devil_unlocked_hints', JSON.stringify(unlockedHints));
  }, [unlockedHints]);

  // Handle Mute actions
  const toggleMute = () => {
    const currentMuted = soundEffects.toggleMute();
    setIsMuted(currentMuted);
  };

  // Skip / Previous levels
  const changeLevel = (direction: 'next' | 'prev') => {
    soundEffects.playUnlock();
    setActiveDeathPrompt(null);
    if (direction === 'next') {
      setCurrentLevelIdx(prev => Math.min(LEVELS.length - 1, prev + 1));
    } else {
      setCurrentLevelIdx(prev => Math.max(0, prev - 1));
    }
  };

  // Direct Level selection dropdown jump
  const handleLevelSelect = (idx: number) => {
    soundEffects.playUnlock();
    setActiveDeathPrompt(null);
    setCurrentLevelIdx(idx);
    setIsShopOpen(false);
  };

  // Trigger manual stage restarting
  const restartCurrentLevel = () => {
    soundEffects.playJump();
    setPlayResetTrigger(prev => prev + 1);
    setActiveDeathPrompt(null);
  };

  // Add virtual controls handler for smooth mobile touch action
  const setVirKey = (key: 'left' | 'right' | 'jump', isPressed: boolean) => {
    setVirtualInput(prev => ({ ...prev, [key]: isPressed }));
  };

  // Sound triggers & score reporting
  const handleCoinCollected = (count: number) => {
    setCoins(prev => prev + count);
  };

  const handleDeathReported = (customPrompt: string) => {
    setDeathsCount(prev => prev + 1);

    if (playtestMode) {
      // Priority gameplay testing: no pausing screens, no death delays, immediate automatic level resets!
      setPlayResetTrigger(prev => prev + 1);
      setActiveDeathPrompt(null);
      return;
    }

    if (customPrompt) {
      setActiveDeathPrompt(customPrompt);
    } else {
      // Automatic quick retry on standard physics death boundary trigger
      setPlayResetTrigger(prev => prev + 1);
    }

    // Comical Interstitial popup ad: 1 in 4 chance of triggering upon death to frustrate players comically!
    if (Math.random() < 0.22) {
      setTimeout(() => {
        setMockAdType('interstitial');
        setIsAdOpen(true);
      }, 350);
    }
  };

  const handleLevelComplete = (rewardCoins: number) => {
    if (gameComplete) return;
    setCoins(prev => prev + rewardCoins);

    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setActiveDeathPrompt(null);
    } else {
      triggerConfetti();
      setGameComplete(true);
    }
  };

  // Buying cosmetic character skins from shop
  const buySkin = (id: string, cost: number) => {
    if (playtestMode || coins >= cost) {
      if (!playtestMode) {
        setCoins(prev => prev - cost);
      }
      setPurchasedSkins(prev => [...prev, id]);
      setActiveSkinId(id);
      soundEffects.playUnlock();
    } else {
      soundEffects.playDeath();
      alert(`⚠️ MOEDAS INSUFICIENTES! Use o botão "MOEDAS GRÁTIS" na loja para pegar +999 moedas de teste instantaneamente!`);
    }
  };

  // Purchasing layout hints on active levels
  const purchaseLevelHint = () => {
    if (unlockedHints.includes(activeLevel.id)) {
      alert(`Dica da Fase: "${activeLevel.hint}"`);
      return;
    }

    if (playtestMode) {
      // Free hint unlock in playtest mode
      setUnlockedHints(prev => [...prev, activeLevel.id]);
      soundEffects.playUnlock();
      alert(`💡 DICA DESBLOQUEADA para ${activeLevel.name}!\n\n"${activeLevel.hint}"\n\nInstruções tracejadas foram ativadas no mapa para ajudar a planejar seu percurso.`);
      return;
    }

    if (coins >= activeLevel.hintCost) {
      setCoins(prev => prev - activeLevel.hintCost);
      setUnlockedHints(prev => [...prev, activeLevel.id]);
      soundEffects.playUnlock();
      alert(`💡 HINT UNLOCKED for ${activeLevel.name}!\n\n"${activeLevel.hint}"\n\nGlowing dashed guidelines have been enabled on the visual map area.`);
    } else {
      soundEffects.playDeath();
      alert('⚠️ NEED COINS! Watch a short sponsor ad to immediately grab 🪙50 coins, then unlock the hints dashboard.');
    }
  };

  // Watch rewarded promo video trigger
  const triggerWatchAdReward = () => {
    if (playtestMode) {
      // Award 999 playtest coins instantly!
      setCoins(prev => prev + 999);
      soundEffects.playWin();
      return;
    }
    setMockAdType('reward');
    setIsAdOpen(true);
  };

  const handleAdClosed = (rewardGranted: boolean) => {
    setIsAdOpen(false);
    if (rewardGranted) {
      setCoins(prev => prev + 50);
      soundEffects.playWin();
    }
  };

  // Simulated metrics tracking click earnings
  const handleBannerAdClick = () => {
    soundEffects.playCoin();
    setAccumulatedClickAdRevenue(prev => prev + 0.08);
    setCoins(prev => prev + 15);
    alert('💰 CLICKED! Simulated advertiser compensation paid: +15 🪙 coins added into your wallet. Thank you for viewing real high-fidelity mock advertisements!');
  };

  const triggerConfetti = () => {
    soundEffects.playWin();
  };

  // Reset Level 7 narrative state whenever the active level changes
  useEffect(() => {
    setShowDevDialogue(false);
    setEscapeHoleActive(false);
  }, [currentLevelIdx]);

  // Called by GameCanvas on 2nd Level 7 death — show dialogue and reset the level
  const handleDevDialogue = () => {
    setDeathsCount(prev => prev + 1);
    setShowDevDialogue(true);
    setPlayResetTrigger(prev => prev + 1);
  };

  // Called when player clicks through the final dialogue line
  const handleDialogueComplete = () => {
    setShowDevDialogue(false);
    setEscapeHoleActive(true);
  };

  const isHintActive = unlockedHints.includes(activeLevel.id);

  if (!gameStarted) {
    return <StartScreen onStart={() => { soundEffects.playUnlock(); setGameStarted(true); }} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans antialiased relative selection:bg-rose-500 selection:text-white overflow-x-hidden">
      
      {/* Background ambience visual */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none z-0" />

      {/* Primary responsive centered workspace container */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 relative z-10 my-4">
        
        {/* Left Hand: Controller & Custom Handheld-Simulating Housing Frame */}
        <div
          id="handheld-bezel-case"
          className={
            isFullscreen
              ? "fixed inset-0 z-[100] w-screen h-[100dvh] bg-slate-900 flex flex-col justify-between overflow-hidden"
              : "w-full max-w-xl bg-slate-900 border-[10px] border-slate-950 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative"
          }
        >
          
          {/* Bezel Top Section Speaker & Camera sensor Bar lines */}
          <div className="w-full h-8 bg-slate-950 flex justify-center items-center gap-2 relative shrink-0">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full border-2 border-slate-800" />
            
            {/* Direct Quick Levels skip arrows inside bezel notch */}
            <div className="absolute right-6 flex items-center gap-3">
              <button
                id="bezel-btn-prev"
                onClick={() => changeLevel('prev')}
                disabled={currentLevelIdx === 0}
                className="p-1 rounded text-slate-500 hover:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {activeLevel.id}/10</span>
              <button
                id="bezel-btn-next"
                onClick={() => changeLevel('next')}
                disabled={currentLevelIdx === LEVELS.length - 1}
                className="p-1 rounded text-slate-500 hover:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Handheld Screen Viewport */}
          <div className={isFullscreen ? "relative bg-[#090d1a] border-y border-slate-950 flex flex-col flex-1 min-h-0" : "relative bg-[#090d1a] border-y-4 border-slate-950 flex flex-col"}>
            
            {/* Screen Header Bar */}
            <header className="flex justify-between items-center p-3 bg-slate-950/90 text-slate-300 font-mono text-xs z-30 relative select-none shrink-0">
              
              {/* Level metadata */}
              <div className="flex items-center gap-1.5 text-slate-100">
                <Gamepad2 className="w-4 h-4 text-rose-500" />
                <span className="font-extrabold uppercase font-mono tracking-wide text-rose-400">
                  {activeLevel.name}
                </span>
              </div>

              {/* Status information */}
              <div className="flex items-center gap-3">
                
                {/* Death/Retry count */}
                <div className="flex items-center gap-1 text-rose-500 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-950">
                  <Skull className="w-3.5 h-3.5 text-rose-500" />
                  <span>DEATHS: {deathsCount}</span>
                </div>

                {/* Coins wallet total */}
                <div className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-950">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{coins}</span>
                </div>
              </div>
            </header>

            {/* Simulated Handheld Screen inner workspace */}
            <div
              className={
                isFullscreen
                  ? "relative overflow-hidden w-full flex-1 flex items-center justify-center bg-slate-950 min-h-0"
                  : "relative overflow-hidden w-full aspect-[16/9] min-h-[160px]"
              }
            >
              
              {/* Ad overlay */}
              {!playtestMode && (
                <MockAdController
                  isOpen={isAdOpen}
                  adType={mockAdType}
                  onClose={handleAdClosed}
                />
              )}

              {/* Active Sub view: Either level player canvas, or skins catalog, or dead notification screen */}
              {isShopOpen ? (
                <div className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/95 scrollbar-thin scrollbar-thumb-slate-800">
                  <div className="p-4">
                    <button
                      id="close-shop"
                      onClick={() => setIsShopOpen(false)}
                      className="mb-4 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-yellow-400 cursor-pointer"
                    >
                      ← VOLTAR PARA O JOGO
                    </button>
                    <SkinsShop
                      coins={coins}
                      purchasedSkins={purchasedSkins}
                      activeSkin={activeSkin}
                      onSelectSkin={(id) => {
                        setActiveSkinId(id);
                        setIsShopOpen(false);
                        soundEffects.playUnlock();
                      }}
                      onBuySkin={buySkin}
                      onWatchAdForCoins={triggerWatchAdReward}
                      playtestMode={playtestMode}
                    />
                  </div>
                </div>
              ) : (activeDeathPrompt && !playtestMode) ? (
                /* Deceptive Death Screen - forcing players to retry and read hilarious troll messages */
                <div className="absolute inset-0 z-30 bg-rose-950/95 flex flex-col justify-center items-center gap-4 text-center p-6 select-none animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-4xl animate-pulse">
                    💀
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-xl font-extrabold font-mono tracking-tight text-white uppercase">
                      STAGED DEATH DETECTED
                    </h3>
                    <p className="text-xs text-rose-300 font-mono italic max-w-sm mx-auto">
                      "{activeDeathPrompt}"
                    </p>
                  </div>
                  
                  {/* Comical death options */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full max-w-xs">
                    <button
                      id="btn-retry"
                      onClick={restartCurrentLevel}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 font-mono font-bold text-xs text-white uppercase rounded border-b-4 border-rose-900 active:border-b-0 active:translate-y-[2px] cursor-pointer"
                    >
                      TRY AGAIN 🔁
                    </button>
                    <button
                      id="btn-buy-hint-death"
                      onClick={purchaseLevelHint}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-semibold border-yellow-500/30 text-yellow-400 font-mono font-bold text-xs rounded cursor-pointer"
                    >
                      {isHintActive ? 'VIEW HINT 💡' : `BUY HINT (🪙${activeLevel.hintCost})`}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Game Complete overlay */}
              {gameComplete && (
                <div className="absolute inset-0 z-40 bg-slate-950/97 flex flex-col justify-center items-center gap-4 text-center p-6 select-none">
                  <div className="text-5xl animate-bounce">🏆</div>
                  <h2 className="text-2xl font-black font-mono tracking-widest text-yellow-400 uppercase">
                    Parabéns!
                  </h2>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed max-w-xs">
                    Você completou todas as 10 fases e dominou o{' '}
                    <span className="text-rose-400 font-bold">D.I.F.F.I.C.U.L.T</span>!<br />
                    Seu gatinho é um mestre das armadilhas! 🐱
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full max-w-xs">
                    <button
                      onClick={() => {
                        setGameComplete(false);
                        setCurrentLevelIdx(0);
                        setPlayResetTrigger(prev => prev + 1);
                        soundEffects.playUnlock();
                      }}
                      className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 font-mono font-bold text-xs text-slate-950 uppercase rounded border-b-4 border-yellow-700 active:border-b-0 active:translate-y-[2px] cursor-pointer"
                    >
                      Jogar Novamente 🔁
                    </button>
                    <button
                      onClick={() => {
                        setGameComplete(false);
                        setCurrentLevelIdx(0);
                        setPlayResetTrigger(prev => prev + 1);
                        setGameStarted(false);
                        soundEffects.playUnlock();
                      }}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-xs rounded cursor-pointer"
                    >
                      Menu Inicial 🏠
                    </button>
                  </div>
                </div>
              )}

              {/* Dev dialogue overlay for Level 7 narrative */}
              {showDevDialogue && (
                <div className="absolute inset-0 z-35">
                  <DevDialogue onComplete={handleDialogueComplete} />
                </div>
              )}

              {/* Main Canvas rendering frame */}
              <GameCanvas
                level={activeLevel}
                activeSkin={activeSkin}
                hintActive={isHintActive}
                isPaused={isPaused}
                onCoinCollected={handleCoinCollected}
                onLevelComplete={handleLevelComplete}
                onDeath={handleDeathReported}
                playStateResetTrigger={playResetTrigger}
                virtualInput={virtualInput}
                onDevDialogue={handleDevDialogue}
                escapeHoleActive={escapeHoleActive}
              />
            </div>

            {/* Handheld Physical Controller Housing Area under the viewport */}
            <div className="bg-slate-950 p-4 md:p-6 portrait:p-6 portrait:py-8 flex flex-col gap-4 portrait:gap-6 select-none">
              
              {/* Virtual Control D-pads Layout */}
              <div className="flex justify-between items-center px-2">
                
                {/* Horizontal navigation buttons */}
                <div id="virtual-dpad" className="flex items-center gap-2 portrait:gap-3">
                  <button
                    onMouseDown={() => setVirKey('left', true)}
                    onMouseUp={() => setVirKey('left', false)}
                    onMouseLeave={() => setVirKey('left', false)}
                    onTouchStart={(e) => { e.preventDefault(); setVirKey('left', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); setVirKey('left', false); }}
                    className="w-14 h-14 portrait:w-20 portrait:h-20 bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 rounded-xl flex items-center justify-center text-slate-300 active:scale-90 transition-transform cursor-pointer select-none"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-6 h-6 portrait:w-8 portrait:h-8" />
                  </button>
                  <button
                    onMouseDown={() => setVirKey('right', true)}
                    onMouseUp={() => setVirKey('right', false)}
                    onMouseLeave={() => setVirKey('right', false)}
                    onTouchStart={(e) => { e.preventDefault(); setVirKey('right', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); setVirKey('right', false); }}
                    className="w-14 h-14 portrait:w-20 portrait:h-20 bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 rounded-xl flex items-center justify-center text-slate-300 active:scale-90 transition-transform cursor-pointer select-none"
                    title="Move Right"
                  >
                    <ArrowRight className="w-6 h-6 portrait:w-8 portrait:h-8" />
                  </button>
                </div>

                {/* Center Console Brand Label and speaker patterns */}
                <div className="hidden sm:flex flex-col items-center gap-0.5 opacity-60">
                  <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest leading-none">
                    LEVEL TROLL
                  </span>
                  <div className="flex gap-0.5 justify-center mt-1">
                    <div className="w-1 h-3 bg-slate-800 rounded-full" />
                    <div className="w-1 h-3 bg-slate-800 rounded-full" />
                    <div className="w-1 h-3 bg-slate-800 rounded-full" />
                    <div className="w-1 h-3 bg-slate-800 rounded-full" />
                  </div>
                </div>

                {/* Big Jump Button */}
                <div className="flex items-center gap-3 portrait:gap-4">
                  {/* Manual Stage Reset button */}
                  <button
                    onClick={restartCurrentLevel}
                    className="w-11 h-11 portrait:w-14 portrait:h-14 bg-slate-900 rounded-lg hover:bg-slate-800 text-slate-400 border border-slate-800 flex items-center justify-center active:scale-95 cursor-pointer"
                    title="Reset Active Stage"
                  >
                    <RefreshCw className="w-4 h-4 portrait:w-6 portrait:h-6" />
                  </button>

                  {/* Super tactile JUMP trigger */}
                  <button
                    onMouseDown={() => setVirKey('jump', true)}
                    onMouseUp={() => setVirKey('jump', false)}
                    onMouseLeave={() => setVirKey('jump', false)}
                    onTouchStart={(e) => { e.preventDefault(); setVirKey('jump', true); }}
                    onTouchEnd={(e) => { e.preventDefault(); setVirKey('jump', false); }}
                    className="w-16 h-16 portrait:w-24 portrait:h-24 bg-rose-600 hover:bg-rose-500 border-[3px] border-rose-800 rounded-full flex items-center justify-center text-white font-mono font-black text-sm portrait:text-lg active:scale-90 transition-transform cursor-pointer shadow-lg select-none"
                    title="Jump / Double Jump (W / Space / Up)"
                  >
                    JUMP
                  </button>
                </div>
              </div>

              {/* Utility row: Shop, sound toggle, hints button, credits info */}
              <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                <div className="flex gap-2">
                  <button
                    id="btn-hint"
                    onClick={purchaseLevelHint}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                      isHintActive
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {isHintActive ? 'HINT ACTIVE' : `GET HINT (🪙${activeLevel.hintCost})`}
                  </button>

                  <button
                    id="btn-shop-open"
                    onClick={() => {
                      setIsShopOpen(!isShopOpen);
                      setActiveDeathPrompt(null);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
                      isShopOpen
                        ? 'bg-yellow-500 text-slate-950 font-extrabold'
                        : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    COSMETICS
                  </button>
                </div>

                {/* Right utility buttons: Sound & Fullscreen */}
                <div className="flex gap-2">
                  <button
                    id="mute-button"
                    onClick={toggleMute}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer border border-slate-800 active:scale-95"
                    title={isMuted ? "Ativar Áudio" : "Mudar para Silencioso"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                  </button>

                  <button
                    id="fullscreen-button"
                    onClick={toggleFullscreen}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer border border-slate-800 active:scale-95"
                    title={isFullscreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4 text-yellow-400 animate-pulse" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Core monetization elements: Permanent funny sliding banner ads */}
          {!playtestMode && (
            <div className="bg-slate-950/95 border-t border-slate-900 p-2.5 flex flex-col gap-1.5 relative overflow-hidden">
              <span className="text-[7.5px] tracking-widest text-slate-600 font-mono absolute top-0.5 right-2 uppercase select-none">
                SPONSORED PROMO BANNER
              </span>

              {/* Scrolling Banner Container */}
              <div
                onClick={handleBannerAdClick}
                className="mt-1 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-yellow-600/20 rounded-lg p-2 flex items-center justify-between gap-3 cursor-pointer hover:border-yellow-500/40 hover:bg-rose-900/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-pulse bg-slate-800/80 p-1.5 rounded">
                    {MOCK_ADS_POOL[mockBannerAdIndex].productImage}
                  </span>
                  <div className="flex flex-col">
                    <header className="text-[10px] font-mono leading-tight text-yellow-500 flex items-center gap-1">
                      <Sparkle className="w-3 h-3 fill-yellow-500 stroke-none" />
                      {MOCK_ADS_POOL[mockBannerAdIndex].title}
                    </header>
                    <p className="text-[9px] text-slate-400 font-sans line-clamp-1 max-w-[200px] sm:max-w-[280px]">
                      {MOCK_ADS_POOL[mockBannerAdIndex].description}
                    </p>
                  </div>
                </div>

                {/* Install simulated CTA */}
                <button
                  className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded text-[9px] font-mono font-bold whitespace-nowrap"
                >
                  {MOCK_ADS_POOL[mockBannerAdIndex].cta}
                </button>
              </div>
              
              <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 px-1 select-none">
                <span>Earn +15 🪙 per click!</span>
                <span>Mock Dev Revenue: ${accumulatedClickAdRevenue.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Hand / Sidepanel: Level Selection catalog & informational details */}
        <div className="flex-1 w-full max-w-sm flex flex-col gap-4">
          
          {/* Test Controls Dashboard Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-inner gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            
            <header className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-extrabold tracking-widest text-[#22c55e] uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                MODO PLAYTESTER
              </h3>
              <span className="text-[9px] bg-emerald-950/60 text-[#22c55e] font-mono font-black px-2 py-0.5 rounded border border-emerald-900/40 select-none">
                ATIVADO
              </span>
            </header>

            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-mono text-slate-400 leading-normal">
                Modo direto sem telas de pausa irritantes, sem interrupções de anúncios eletrônicos, respawn imediato de teste, dicas gratuitas e moedas extras para skins.
              </p>
              
              <button
                onClick={() => {
                  const newVal = !playtestMode;
                  setPlaytestMode(newVal);
                  soundEffects.playUnlock();
                  if (newVal) {
                    setActiveDeathPrompt(null);
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer select-none ${
                  playtestMode
                    ? "bg-emerald-600/10 hover:bg-emerald-600/20 text-[#22c55e] border-emerald-500/35 shadow-sm"
                    : "bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                <span>{playtestMode ? "Desativar Modo de Teste 🛠️" : "Ativar Modo de Teste ⚡ (Recomendado)"}</span>
              </button>
            </div>
          </div>

          {/* Level Index dropdown selector list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-mono font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              STAGE SELECTION DIRECTORY
            </h3>
            
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
              {LEVELS.map((lvl, index) => {
                const isSelected = currentLevelIdx === index;
                const isUnlocked = index <= 10; // All unlocked for sandbox playground fun

                return (
                  <button
                    key={lvl.id}
                    onClick={() => isUnlocked && handleLevelSelect(index)}
                    className={`h-11 rounded-lg font-mono font-extrabold text-xs flex flex-col justify-center items-center relative cursor-pointer outline-none transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-md border-b-4 border-rose-900 scale-105 ring-2 ring-white/10'
                        : isUnlocked
                        ? 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                        : 'bg-slate-950/40 text-slate-600 border border-slate-950 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-[9px] opacity-70">Lvl</span>
                    <span>{lvl.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* How to play guidelines card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs text-slate-400 leading-relaxed">
            <h4 className="font-extrabold text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500" />
              CONTROLS & TACTICS:
            </h4>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Use your keyboard <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200">A / D</kbd> or <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200">← / →</kbd> arrows to walk.</li>
              <li>Press <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200">W</kbd>, <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200">SPACE</kbd>, or <kbd className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-200">↑</kbd> to jump.</li>
              <li>Double jump is active! Trigger middle air to boost.</li>
              <li>Beware: Everything has a trap. Memorize layout details, buy tips with coin savings, or click mock banner ads for easy coinage!</li>
            </ul>
          </div>

        </div>

      </main>

      {/* Retro Credits Footer */}
      <footer className="w-full text-center border-t border-slate-900 mt-8 pt-4 pb-2 z-10">
        <p className="text-[10px] font-mono text-slate-600 tracking-wider">
          DECEPTIVE LEVEL PLATFORMER © 2026 • CREATIVE BRAND OF DECEPTIVE HAZARDS & COMMITTED MOCK CONSOLE ADS • STABLE AT 60FPS
        </p>
      </footer>
    </div>
  );
}
