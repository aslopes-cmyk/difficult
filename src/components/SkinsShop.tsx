import React from 'react';
import { Skin } from '../types';
import { INITIAL_SKINS } from '../data';
import { Sparkles, Tv, Coins } from 'lucide-react';

interface SkinsShopProps {
  coins: number;
  purchasedSkins: string[];
  activeSkin: Skin;
  onSelectSkin: (skinId: string) => void;
  onBuySkin: (skinId: string, cost: number) => void;
  onWatchAdForCoins: () => void;
  playtestMode?: boolean;
}

export const SkinsShop: React.FC<SkinsShopProps> = ({
  coins,
  purchasedSkins,
  activeSkin,
  onSelectSkin,
  onBuySkin,
  onWatchAdForCoins,
  playtestMode = false
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full text-slate-100 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 id="skins-shop-title" className="text-xl font-bold font-mono tracking-tight text-yellow-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            LOJA DE PIXELS DE NEKO
          </h2>
          <p className="text-xs text-slate-400">Desbloqueie gatinhos fofos com expressões únicas!</p>
        </div>

        {/* Watch Ad Bonus trigger / Playtest sandbox coins */}
        <button
          id="btn-ad-coins"
          onClick={onWatchAdForCoins}
          className={`w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 text-white cursor-pointer select-none border-b-2 active:border-b-0 active:translate-y-[2px] transition-all ${
            playtestMode 
              ? 'bg-amber-600 hover:bg-amber-500 border-amber-800' 
              : 'bg-green-600 hover:bg-green-500 border-green-800'
          }`}
        >
          <Tv className="w-4 h-4 text-white" />
          {playtestMode ? "MOEDAS GRÁTIS (+999 🪙)" : "ASSISTIR ANÚNCIO (+50 🪙)"}
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {INITIAL_SKINS.map((skin) => {
          const isOwned = purchasedSkins.includes(skin.id);
          const isActive = activeSkin.id === skin.id;

          return (
            <div
              key={skin.id}
              onClick={() => isOwned && onSelectSkin(skin.id)}
              className={`relative flex flex-col gap-3 p-3.5 bg-slate-950/80 rounded-xl border-2 transition-all select-none ${
                isActive
                  ? 'border-yellow-400 shadow-md ring-2 ring-yellow-400/20'
                  : isOwned
                  ? 'border-slate-800 hover:border-slate-700 cursor-pointer'
                  : 'border-slate-900 opacity-90'
              }`}
            >
              {/* Visual Skin Head Model Draw */}
              <div className="flex justify-center items-center py-4 bg-slate-900/60 rounded-lg relative overflow-hidden">
                <div
                  className="w-12 h-12 rounded border-2 border-slate-950 flex flex-col justify-center items-center relative transition-transform hover:scale-105"
                  style={{ backgroundColor: skin.color }}
                >
                  {/* Left Cat Ear */}
                  <div 
                    className="absolute -top-[7px] left-0.5 w-0 h-0 border-l-[5.5px] border-l-transparent border-r-[5.5px] border-r-transparent border-b-[8px] flex items-center justify-center pointer-events-none"
                    style={{ borderBottomColor: skin.color }}
                  >
                    {/* Inner Pink Part */}
                    <div className="absolute top-[2.5px] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-300" />
                  </div>

                  {/* Right Cat Ear */}
                  <div 
                    className="absolute -top-[7px] right-0.5 w-0 h-0 border-l-[5.5px] border-l-transparent border-r-[5.5px] border-r-transparent border-b-[8px] flex items-center justify-center pointer-events-none"
                    style={{ borderBottomColor: skin.color }}
                  >
                    {/* Inner Pink Part */}
                    <div className="absolute top-[2.5px] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-300" />
                  </div>

                  {/* Cheek Whiskers */}
                  <div className="absolute left-[-4px] top-[18px] flex flex-col gap-1 pointer-events-none">
                    <div className="w-2.5 h-[1.2px] bg-slate-950/70 rotate-[-12deg]" />
                    <div className="w-3 h-[1.2px] bg-slate-950/70" />
                  </div>
                  <div className="absolute right-[-4px] top-[18px] flex flex-col gap-1 pointer-events-none">
                    <div className="w-2.5 h-[1.2px] bg-slate-950/70 rotate-[12deg]" />
                    <div className="w-3 h-[1.2px] bg-slate-950/70" />
                  </div>

                  {/* Draw crown if King */}
                  {skin.faceType === 'crowned' && (
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 flex gap-0.5 justify-center items-end h-3 w-8 z-10 pointer-events-none">
                      <div className="w-1.5 h-2 bg-yellow-400 rounded-t-sm" />
                      <div className="w-1.5 h-3 bg-yellow-500 rounded-t-sm border-x border-yellow-300" />
                      <div className="w-1.5 h-2 bg-yellow-400 rounded-t-sm" />
                    </div>
                  )}

                  {/* Face design inside DOM */}
                  {skin.faceType === 'derp' ? (
                    <div className="flex flex-col items-center justify-center gap-1 w-full">
                      <div className="flex justify-around w-full px-2">
                        <div className="w-2 h-2 bg-white flex justify-end items-center"><div className="w-1 h-1 bg-black mr-0.5" /></div>
                        <div className="w-2 h-2 bg-white flex justify-start items-center"><div className="w-1 h-1 bg-black ml-0.5" /></div>
                      </div>
                      <div className="w-1.5 h-2 bg-rose-400 rounded-b-sm" />
                    </div>
                  ) : skin.faceType === 'cool' ? (
                    <div className="flex flex-col items-center justify-center gap-1 w-full">
                      {/* sunglasses */}
                      <div className="flex justify-center items-center gap-0.5 w-[90%]">
                        <div className="w-4 h-2.5 bg-slate-900 rounded-sm" />
                        <div className="h-0.5 w-1 bg-slate-900" />
                        <div className="w-4 h-2.5 bg-slate-900 rounded-sm" />
                      </div>
                      <div className="w-4 h-0.5 bg-slate-950" />
                    </div>
                  ) : skin.faceType === 'glitch' ? (
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="w-7 h-1.5 bg-emerald-500 mb-0.5" />
                      <div className="w-6 h-1 bg-rose-500" />
                    </div>
                  ) : skin.faceType === 'scared' ? (
                    <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                      <div className="flex justify-around w-full px-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white flex justify-center items-center border border-slate-950"><div className="w-1 h-1 rounded-full bg-black" /></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-white flex justify-center items-center border border-slate-950"><div className="w-1 h-1 rounded-full bg-black" /></div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500 border border-slate-950" />
                    </div>
                  ) : (
                    // default happy block face
                    <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                      <div className="flex justify-around w-full px-2">
                        <div className="w-1.5 h-2.2 bg-black rounded" />
                        <div className="w-1.5 h-2.2 bg-black rounded" />
                      </div>
                      <div className="w-4 h-1 px-1 rounded-b bg-black" style={{ borderTop: 'none' }} />
                    </div>
                  )}
                </div>

                {/* Unlocked overlay badge */}
                {isActive && (
                  <span id={`active-badge-${skin.id}`} className="absolute top-1 text-[8px] font-bold font-mono text-yellow-400 bg-yellow-950 px-1 border border-yellow-400 rounded-sm uppercase">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <p id={`skin-name-${skin.id}`} className="text-sm font-semibold font-mono tracking-wide">{skin.name}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2 h-7">{skin.description}</p>
              </div>

              {/* Buy or Select action button */}
              <div className="mt-1">
                {isOwned ? (
                  <button
                    id={`btn-select-${skin.id}`}
                    className={`w-full py-1 text-xs font-mono font-bold tracking-wider rounded border cursor-pointer select-none ${
                      isActive
                        ? 'bg-yellow-500/10 border-yellow-400/40 text-yellow-500 font-extrabold cursor-default'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                    disabled={isActive}
                  >
                    {isActive ? 'SELECTED' : 'SELECT'}
                  </button>
                ) : (
                  <button
                    id={`btn-buy-${skin.id}`}
                    onClick={() => onBuySkin(skin.id, skin.price)}
                    className="w-full py-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-mono font-bold tracking-wide rounded border-b-2 border-yellow-700 active:border-b-0 flex items-center justify-center gap-1 cursor-pointer select-none"
                  >
                    <Coins className="w-3.5 h-3.5 text-slate-900" />
                    {skin.price} 🪙
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
