import React from 'react';
import { TreeState } from '../types';

interface UIProps {
  treeState: TreeState;
  onToggle: () => void;
}

export const UI: React.FC<UIProps> = ({ treeState, onToggle }) => {
  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-white text-3xl md:text-5xl font-serif tracking-widest uppercase" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
            Arix <span className="text-[#FFD700]">Signature</span>
          </h1>
          <p className="text-[#0B6623] text-sm md:text-base font-light tracking-[0.3em] mt-2 uppercase">
            Interactive Holiday Experience
          </p>
        </div>
        <div className="hidden md:block text-right">
            <p className="text-white/50 text-xs font-mono">EST. 2024</p>
            <p className="text-white/50 text-xs font-mono">LUXURY EDITION</p>
        </div>
      </header>

      {/* Controls */}
      <footer className="flex items-end justify-between pointer-events-auto">
        <div className="flex flex-col gap-2">
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Current State</span>
            <div className="text-white text-xl font-serif tracking-widest uppercase">
                {isTree ? "Imperial Formation" : "Ethereal Scatter"}
            </div>
        </div>

        <button 
            onClick={onToggle}
            className="group relative px-8 py-4 bg-transparent border border-[#FFD700]/30 hover:border-[#FFD700] transition-all duration-500 overflow-hidden"
        >
            <div className={`absolute inset-0 bg-[#FFD700]/10 transform transition-transform duration-700 ease-out origin-left ${isTree ? 'scale-x-0 group-hover:scale-x-100' : 'scale-x-100 group-hover:scale-x-0'}`}></div>
            
            <span className="relative z-10 text-white font-serif tracking-[0.2em] uppercase text-sm group-hover:text-[#FFD700] transition-colors duration-300">
                {isTree ? "Deconstruct" : "Assemble"}
            </span>
            
            {/* Corner Accents */}
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#FFD700]"></span>
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FFD700]"></span>
        </button>
      </footer>
    </div>
  );
};