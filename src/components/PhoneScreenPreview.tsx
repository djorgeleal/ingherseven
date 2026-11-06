import React from 'react';
import { CutoutType, CurvatureType, GlassType } from '../types/glass';
import { Smartphone, Layers, ShieldCheck } from 'lucide-react';

interface PhoneScreenPreviewProps {
  primaryModel: string;
  screenSize: string;
  cutoutType: CutoutType;
  curvature: CurvatureType;
  glassType: GlassType;
  showGlassOverlay?: boolean;
}

export const PhoneScreenPreview: React.FC<PhoneScreenPreviewProps> = ({
  primaryModel,
  screenSize,
  cutoutType,
  curvature,
  glassType,
  showGlassOverlay = true,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-cyan-900/30 overflow-hidden select-none">
      {/* Background tech grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      {/* Screen dimension badge */}
      <div className="flex items-center justify-between w-full mb-3 px-1 text-xs text-cyan-400 font-mono">
        <span className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate max-w-[130px]">{primaryModel || 'Dispositivo'}</span>
        </span>
        <span className="bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded text-[11px] text-cyan-300">
          {screenSize || '6.1"'}
        </span>
      </div>

      {/* Phone chassis & screen */}
      <div 
        className={`relative w-44 h-72 rounded-[28px] bg-slate-900 p-2 shadow-2xl transition-all duration-300 ${
          curvature === '3D Curvo' 
            ? 'border-x-2 border-y border-cyan-400/50 shadow-cyan-950/50' 
            : 'border border-slate-700'
        }`}
      >
        {/* Curved side highlight indicator if 3D */}
        {curvature === '3D Curvo' && (
          <>
            <div className="absolute inset-y-6 left-0.5 w-1 bg-gradient-to-r from-cyan-400/40 to-transparent rounded-l pointer-events-none" />
            <div className="absolute inset-y-6 right-0.5 w-1 bg-gradient-to-l from-cyan-400/40 to-transparent rounded-r pointer-events-none" />
          </>
        )}

        {/* Screen inner active display */}
        <div className="relative w-full h-full rounded-[22px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col items-center justify-between p-3 border border-slate-800/80">
          {/* Glass simulated reflections */}
          <div className="absolute -inset-x-10 top-0 h-32 bg-gradient-to-b from-cyan-500/10 via-cyan-400/5 to-transparent rotate-12 pointer-events-none" />

          {/* Top Notch / Cutout Area */}
          <div className="relative z-10 w-full flex justify-center pt-0.5">
            {cutoutType === 'dynamic-island' && (
              <div className="w-16 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-between px-2 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-cyan-950 border border-cyan-800/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-950" />
              </div>
            )}

            {cutoutType === 'notch-classic' && (
              <div className="w-18 h-3.5 bg-black rounded-b-xl border-b border-x border-slate-800 flex items-center justify-center shadow-inner">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>
            )}

            {cutoutType === 'waterdrop' && (
              <div className="w-4 h-3 bg-black rounded-b-full border-b border-x border-slate-800 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
              </div>
            )}

            {cutoutType === 'punch-hole' && (
              <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-800 flex items-center justify-center mt-0.5">
                <div className="w-1 h-1 rounded-full bg-cyan-950/80" />
              </div>
            )}

            {cutoutType === 'punch-hole-pill' && (
              <div className="w-8 h-2.5 rounded-full bg-black border border-slate-800 flex items-center justify-between px-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-950/80" />
                <div className="w-1 h-1 rounded-full bg-cyan-900/60" />
              </div>
            )}

            {cutoutType === 'none' && (
              <div className="w-10 h-1 bg-slate-800 rounded-full opacity-60" />
            )}
          </div>

          {/* Screen Content Simulation / Alignment grid */}
          <div className="z-10 w-full flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="relative mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {showGlassOverlay && (
                <span className="absolute -bottom-1 -right-1 text-[9px] font-mono px-1 bg-cyan-500 text-slate-950 font-bold rounded">
                  9H
                </span>
              )}
            </div>

            <p className="text-[10px] font-medium text-slate-300 font-mono tracking-tight">
              {glassType.replace('Vidrio ', '').replace(' Gamer', '')}
            </p>
            <p className="text-[9px] text-cyan-400/80 font-mono mt-0.5">
              {curvature}
            </p>
          </div>

          {/* Bottom Bar indicator */}
          <div className="z-10 w-16 h-1 bg-slate-700 rounded-full opacity-70 mb-0.5" />

          {/* Tempered Glass Overlay Frame (Bezel simulator) */}
          {showGlassOverlay && (
            <div className="absolute inset-1 rounded-[20px] border border-cyan-400/40 pointer-events-none ring-1 ring-cyan-500/10">
              {/* Corner alignment crosshairs */}
              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan-400/80" />
              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-400/80" />
              <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-400/80" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-400/80" />
            </div>
          )}
        </div>
      </div>

      {/* Screen specs footer */}
      <div className="w-full mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1 text-slate-400">
          <Layers className="w-3 h-3 text-cyan-400" />
          {cutoutType === 'dynamic-island' && 'Dynamic Island'}
          {cutoutType === 'notch-classic' && 'Notch Clásico'}
          {cutoutType === 'waterdrop' && 'Gota / V-Notch'}
          {cutoutType === 'punch-hole' && 'Punch Hole Central'}
          {cutoutType === 'punch-hole-pill' && 'Píldora Lateral'}
          {cutoutType === 'none' && 'Sin Perforación'}
        </span>
        <span className="text-cyan-400/90">0.33mm</span>
      </div>
    </div>
  );
};
