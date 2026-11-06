import React from 'react';
import { TemperedGlassRef } from '../types/glass';
import { Database, Smartphone, PackageCheck, AlertTriangle } from 'lucide-react';

interface StatsBannerProps {
  references: TemperedGlassRef[];
  onFilterLowStock: () => void;
  isLowStockFilterActive: boolean;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  references,
  onFilterLowStock,
  isLowStockFilterActive,
}) => {
  const totalReferences = references.length;
  
  // Count distinct compatible phones
  const allPhonesSet = new Set<string>();
  let totalStock = 0;
  let lowStockCount = 0;

  references.forEach((r) => {
    totalStock += r.stock;
    if (r.stock <= r.minStockAlert) {
      lowStockCount++;
    }
    r.compatibleModels.forEach((m) => allPhonesSet.add(m.trim().toLowerCase()));
  });

  const totalCompatiblePhones = allPhonesSet.size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
      {/* Stat 1: Total Referencias */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Referencias en Base de Datos
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
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Modelos de Celular Cubiertos
          </span>
          <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
            {totalCompatiblePhones}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-cyan-400">
          <Smartphone className="w-4 h-4" />
        </div>
      </div>

      {/* Stat 3: Total Stock */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Inventario Total (Unidades)
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {totalStock}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
          <PackageCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Stat 4: Stock Bajo */}
      <button
        onClick={onFilterLowStock}
        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
          isLowStockFilterActive
            ? 'bg-amber-950/50 border-amber-500/80 ring-1 ring-amber-500'
            : 'bg-slate-900/80 border-slate-800 hover:border-amber-800/60'
        }`}
      >
        <div>
          <span className="text-[11px] font-medium text-amber-400 block uppercase tracking-wider">
            {isLowStockFilterActive ? 'Filtro Activo' : 'Stock Crítico / Agotado'}
          </span>
          <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {lowStockCount} {lowStockCount === 1 ? 'ref' : 'refs'}
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-950/50 border border-amber-800/50 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
