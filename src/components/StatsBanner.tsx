import React from 'react';
import { TemperedGlassRef } from '../types/glass';
import { Database, Smartphone, Tag } from 'lucide-react';

interface StatsBannerProps {
  references: TemperedGlassRef[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ references }) => {
  const totalReferences = references.length;
  
  // Count distinct compatible phones and brands
  const allPhonesSet = new Set<string>();
  const brandsSet = new Set<string>();

  references.forEach((r) => {
    brandsSet.add(r.brand.trim());
    r.compatibleModels.forEach((m) => allPhonesSet.add(m.trim().toLowerCase()));
  });

  const totalCompatiblePhones = allPhonesSet.size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
      {/* Stat 1: Total Referencias */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">
            Referencias Registradas
          </span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">
            {totalReferences}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
          <Database className="w-4 h-4" />
        </div>
      </div>

      {/* Stat 2: Total Modelos Cubiertos */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">
            Modelos de Teléfono Cubiertos
          </span>
          <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
            {totalCompatiblePhones}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-cyan-400">
          <Smartphone className="w-4 h-4" />
        </div>
      </div>

      {/* Stat 3: Marcas */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider font-mono">
            Marcas de Dispositivos
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {brandsSet.size}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
          <Tag className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
