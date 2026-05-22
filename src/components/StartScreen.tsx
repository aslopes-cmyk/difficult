import React, { useEffect, useState } from 'react';

const ACRONYM: [string, string][] = [
  ['D', 'aring'],
  ['I', 'ncredible'],
  ['F', 'urry'],
  ['F', 'eline'],
  ['I', 'n'],
  ['C', 'atastrophic'],
  ['U', 'nderworld'],
  ['L', 'evels'],
  ['T', 'rials'],
];

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [visible, setVisible] = useState(false);
  const [catFrame, setCatFrame] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Simple cat animation cycle
  useEffect(() => {
    const interval = setInterval(() => setCatFrame(f => (f + 1) % 4), 180);
    return () => clearInterval(interval);
  }, []);

  const catFaces = ['=^.^=', '=^-^=', '=^.^=', '=^o^='];

  return (
    <div
      className={`min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Purple glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cat character */}
      <div className="relative mb-6 select-none">
        <span className="text-5xl tracking-widest text-blue-400 font-black drop-shadow-lg">
          {catFaces[catFrame]}
        </span>
        <span className="absolute -right-6 bottom-1 text-blue-400 text-2xl animate-bounce">~</span>
      </div>

      {/* Main title */}
      <h1 className="text-5xl md:text-7xl font-black tracking-[0.18em] text-rose-500 mb-1 drop-shadow-[0_0_24px_rgba(239,68,68,0.4)] select-none">
        D.I.F.F.I.C.U.L.T
      </h1>

      {/* Acronym breakdown */}
      <div className="mt-4 mb-10 flex flex-col gap-0.5 text-center">
        {ACRONYM.map(([letter, rest], i) => (
          <p key={i} className="text-sm md:text-base text-slate-500 leading-snug">
            <span className="text-rose-400 font-bold">{letter}</span>
            <span>{rest}</span>
          </p>
        ))}
      </div>

      {/* START button */}
      <button
        onClick={onStart}
        className="px-14 py-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-xl tracking-[0.2em] rounded-xl border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg shadow-rose-900/40 hover:shadow-rose-500/30 select-none"
      >
        ▶ START
      </button>

      {/* Controls hint */}
      <p className="mt-6 text-xs text-slate-600 tracking-wider select-none">
        A / D &nbsp;·&nbsp; ← / → &nbsp;para mover &nbsp;·&nbsp; W / SPACE para pular
      </p>

      {/* Footer */}
      <p className="absolute bottom-4 text-[10px] text-slate-700 tracking-widest select-none">
        DECEPTIVE LEVEL PLATFORMER © 2026
      </p>
    </div>
  );
};
