import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem with geometric futuristic play symbol and S.O Monogram */}
      <div className={`relative flex items-center justify-center ${iconSize} rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35)]`}>
        <div className="w-full h-full bg-[#0a0b12] rounded-[10px] flex items-center justify-center relative overflow-hidden group">
          {/* Subtle inner ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 opacity-80" />
          
          {/* Futuristic geometric play / diamond symbol */}
          <svg
            viewBox="0 0 24 24"
            className="w-1/2 h-1/2 text-cyan-400 fill-current drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] relative z-10 transform transition-transform group-hover:scale-110"
          >
            <path d="M5 4.5v15l15-7.5L5 4.5z" />
          </svg>

          {/* S.O Badge accent in corner */}
          <span className="absolute bottom-0.5 right-1 text-[7px] font-black tracking-tighter text-purple-300 font-mono">
            SO
          </span>
        </div>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider text-white font-sans ${textClass}`}>
            S.O <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">ADIGUN</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-cyan-400/90 font-mono -mt-0.5">
            AI Video Studio
          </span>
        )}
      </div>
    </div>
  );
};
