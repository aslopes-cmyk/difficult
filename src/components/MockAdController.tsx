import React, { useState, useEffect, useRef } from 'react';
import { MOCK_ADS_POOL } from '../data';
import { soundEffects } from './SoundEffects';
import { AlertCircle, Play, X, ShieldAlert, Sparkles, Star } from 'lucide-react';

interface MockAdControllerProps {
  isOpen: boolean;
  adType: 'reward' | 'interstitial';
  onClose: (rewardGranted: boolean) => void;
}

export const MockAdController: React.FC<MockAdControllerProps> = ({ isOpen, adType, onClose }) => {
  if (!isOpen) return null;

  const [activeAd, setActiveAd] = useState(MOCK_ADS_POOL[0]);
  const [countdown, setCountdown] = useState(adType === 'reward' ? 5 : 3);
  const [progressWidth, setProgressWidth] = useState(100);
  const [canSkip, setCanSkip] = useState(false);

  // Troll Exit coordinates offset
  const [xOffset, setXOffset] = useState({ x: 0, y: 0 });
  const [trollAttempts, setTrollAttempts] = useState(0);

  // Pick a random funny ad on render
  useEffect(() => {
    const randomAd = MOCK_ADS_POOL[Math.floor(Math.random() * MOCK_ADS_POOL.length)];
    setActiveAd(randomAd);
    setCountdown(adType === 'reward' ? 5 : 3);
    setProgressWidth(100);
    setCanSkip(false);
    setXOffset({ x: 0, y: 0 });
    setTrollAttempts(0);

    soundEffects.playAdJingle();
  }, [isOpen, adType]);

  // Countdown clock ticking down
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        const totalTime = adType === 'reward' ? 5 : 3;
        setProgressWidth(((countdown - 1) / totalTime) * 100);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
      setProgressWidth(0);
    }
  }, [countdown, adType]);

  // Troll close button physics: shifts its visual block slightly when they hover/click
  const handleXMouseEnter = () => {
    // Interstitial ads have an X button that jumps away up to 2 times to annoy players in a friendly troll manner!
    if (adType === 'interstitial' && trollAttempts < 2) {
      soundEffects.playSlam();
      const angles = [Math.PI / 4, Math.PI / 2, -Math.PI / 3, Math.PI];
      const selectedAngle = angles[Math.floor(Math.random() * angles.length)];
      const jumpDistance = 55 + Math.random() * 45;

      setXOffset({
        x: Math.cos(selectedAngle) * jumpDistance,
        y: Math.sin(selectedAngle) * jumpDistance
      });
      setTrollAttempts(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (!canSkip && adType === 'reward') {
      soundEffects.playTrollLaugh();
      return; // force full watch
    }
    soundEffects.playUnlock();
    onClose(adType === 'reward'); // grant rewards only if watched video ad
  };

  return (
    <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-6 select-none font-sans overflow-hidden">
      
      {/* Top Header warning labels */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold font-mono uppercase tracking-widest">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          MOCK SPONSOR PLATFORM
        </div>

        {/* Dynamic Timer counter badge */}
        <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
          {canSkip ? (
            <span className="text-green-400">READY TO SKIP</span>
          ) : (
            <span>AD FINISHES IN <span className="text-yellow-400">{countdown}s</span></span>
          )}
        </div>
      </div>

      {/* Progress horizontal loading line */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-yellow-500 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {/* Main Comic Advert body card */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center my-4">
        {/* Ad icon circle */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-yellow-500 to-rose-500 shadow-xl flex items-center justify-center text-4xl animate-pulse border-2 border-white/20">
          {activeAd.productImage}
        </div>

        <div className="flex flex-col gap-1.5 max-w-sm">
          <h3 id="ad-product-title" className="text-lg font-extrabold font-mono tracking-wide text-white flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {activeAd.title}
          </h3>
          <p className="text-xs text-slate-300 px-4 leading-relaxed font-mono">
            {activeAd.description}
          </p>
        </div>

        {/* Comical reviews quote banner */}
        <div className="text-[10px] italic font-mono px-3 py-1 bg-slate-900 rounded border border-slate-800 text-slate-400 max-w-xs">
          "Wow, this fake app cured my blockhead's fear of ceiling spikes!" - 5 Stars ⭐
        </div>

        {/* Call to action button */}
        <button
          onClick={() => {
            soundEffects.playCoin();
            alert(`MOCK INSTALLATION: You clicked "${activeAd.cta}"! This simulated action generates ad revenue ($0.04) split with the developers. Coins credited!`);
          }}
          className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-xs font-extrabold font-mono rounded-lg border-b-[3px] border-amber-700 hover:scale-105 active:scale-95 transition-transform duration-100 uppercase"
        >
          {activeAd.cta} ⚡
        </button>
      </div>

      {/* Bottom control row: Exit logic */}
      <div className="flex flex-col items-center gap-2 border-t border-slate-800 pt-4 relative">
        {adType === 'interstitial' ? (
          /* Close X button that jumps away */
          <button
            onMouseEnter={handleXMouseEnter}
            onClick={handleSkip}
            style={{
              transform: `translate(${xOffset.x}px, ${xOffset.y}px)`,
              transition: 'transform 0.1s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-mono font-bold rounded-lg border border-slate-600 flex items-center gap-1.5 cursor-pointer active:translate-y-[1.5px]"
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            CLOSE AD
          </button>
        ) : (
          /* Reward ad: Simple skip video trigger when countdown is zero */
          <button
            onClick={handleSkip}
            disabled={!canSkip}
            className={`w-full max-w-xs py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider border transition-all ${
              canSkip
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 cursor-pointer active:border-b-0 active:translate-y-[2px]'
                : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed'
            }`}
          >
            {canSkip ? 'CLAIM REWARD COINS 🪙' : `LOCKED: WATCH FOR ${countdown}s`}
          </button>
        )}

        <p className="text-[9px] text-slate-500 font-mono">
          Non-intrusive ad experience. Powered by local retro simulator. No real personal data tracked.
        </p>
      </div>
    </div>
  );
};
