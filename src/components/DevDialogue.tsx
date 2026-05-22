import React, { useState } from 'react';

const DIALOGUE = [
  {
    speaker: 'Dev' as const,
    text: 'Hey, gato. Como você veio parar aqui?'
  },
  {
    speaker: 'Gato' as const,
    text: 'Não faço ideia, estava dormindo e fui jogado aqui...'
  },
  {
    speaker: 'Dev' as const,
    text: 'Veja, estamos presos nesse submundo. Eu estava criando um jogo com auxílio de Inteligência Artificial, mas de repente perdi o controle e fui jogado para cá. Provavelmente isso ocorreu com você também. Posso ajudar você a sair daqui, mas também vou precisar da sua ajuda.'
  },
  {
    speaker: 'Dev' as const,
    text: 'Rápido, pule nesse buraco!'
  },
];

interface DevDialogueProps {
  onComplete: () => void;
}

export const DevDialogue: React.FC<DevDialogueProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const advance = () => {
    if (step < DIALOGUE.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const entry = DIALOGUE[step];
  const isDev = entry.speaker === 'Dev';
  const isLast = step === DIALOGUE.length - 1;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end font-mono select-none">
      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-slate-950/80" />

      {/* Letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/80" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/80" />

      {/* Dialogue box */}
      <div className="relative z-10 m-3 mb-10 flex flex-col gap-2">
        {/* Characters + bubble row */}
        <div className="flex items-end gap-2">
          {/* Dev portrait */}
          <div className={`flex flex-col items-center gap-0.5 shrink-0 transition-opacity duration-200 ${isDev ? 'opacity-100' : 'opacity-35'}`}>
            <div className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl border-2 transition-colors duration-200 ${isDev ? 'border-emerald-500' : 'border-slate-700'}`}>
              💻
            </div>
            <span className="text-[8px] text-emerald-400 font-bold tracking-widest">DEV</span>
          </div>

          {/* Speech bubble */}
          <div className="flex-1 bg-slate-900/97 border border-slate-600 rounded-xl p-2.5 relative">
            {/* Speaker label */}
            <div className={`text-[9px] font-extrabold mb-1 tracking-wider ${isDev ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isDev ? '[ Dev ]' : '[ Gato ]'}
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              {entry.text}
            </p>
          </div>

          {/* Cat portrait */}
          <div className={`flex flex-col items-center gap-0.5 shrink-0 transition-opacity duration-200 ${!isDev ? 'opacity-100' : 'opacity-35'}`}>
            <div className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl border-2 transition-colors duration-200 ${!isDev ? 'border-blue-500' : 'border-slate-700'}`}>
              🐱
            </div>
            <span className="text-[8px] text-blue-400 font-bold tracking-widest">GATO</span>
          </div>
        </div>

        {/* Progress + button row */}
        <div className="flex justify-between items-center px-1">
          <div className="flex gap-1 items-center">
            {DIALOGUE.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === step ? 'w-3 h-1.5 bg-emerald-400' : i < step ? 'w-1.5 h-1.5 bg-slate-600' : 'w-1.5 h-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={advance}
            className={`px-4 py-1.5 font-mono font-bold text-[10px] rounded-lg cursor-pointer transition-all border tracking-wider ${
              isLast
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isLast ? 'ENTENDIDO →' : 'CONTINUAR ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};
