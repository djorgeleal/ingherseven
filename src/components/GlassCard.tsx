import React, { useState } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { 
  Smartphone, 
  MapPin, 
  Layers, 
  Package, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  Plus, 
  Minus,
  Maximize2
} from 'lucide-react';

interface GlassCardProps {
  reference: TemperedGlassRef;
  searchHighlight?: string;
  onSelect: (ref: TemperedGlassRef) => void;
  onEdit: (ref: TemperedGlassRef) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  reference,
  searchHighlight = '',
  onSelect,
  onEdit,
  onUpdateStock,
}) => {
  const [copiedSku, setCopiedSku] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  const handleCopySku = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reference.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const isLowStock = reference.stock <= reference.minStockAlert;
  const isOutOfStock = reference.stock === 0;

  // Display first 4 models, hide rest under expand toggle if too many
  const visibleModels = showAllModels 
    ? reference.compatibleModels 
    : reference.compatibleModels.slice(0, 4);
  const remainingCount = reference.compatibleModels.length - 4;

  return (
    <div 
      onClick={() => onSelect(reference)}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-cyan-950/30"
    >
      {/* Top Header Row: SKU, Brand & Stock Pill */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span 
              onClick={handleCopySku}
              title="Clic para copiar código"
              className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/40 hover:border-cyan-400 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              {reference.sku}
              {copiedSku ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-cyan-500 opacity-60 group-hover:opacity-100" />
              )}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {reference.brand}
            </span>
          </div>

          {/* Stock badge */}
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
              isOutOfStock
                ? 'bg-rose-950/60 text-rose-300 border-rose-900/70'
                : isLowStock
                ? 'bg-amber-950/60 text-amber-300 border-amber-900/70'
                : 'bg-slate-950 text-emerald-400 border-slate-800'
            }`}>
              <Package className="w-3 h-3" />
              <span>{reference.stock} un.</span>
            </span>
          </div>
        </div>

        {/* Primary Model */}
        <div className="mb-2.5">
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{reference.primaryModel}</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              ({reference.screenSize})
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>{reference.glassType}</span>
            <span>·</span>
            <span>{reference.curvature}</span>
          </p>
        </div>

        {/* Compatible Models List */}
        <div className="mb-3 p-2 bg-slate-950/80 rounded-lg border border-slate-800/70">
          <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between font-mono">
            <span>Modelos Compatibles ({reference.compatibleModels.length}):</span>
            {remainingCount > 0 && !showAllModels && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllModels(true);
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                +{remainingCount} más
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {visibleModels.map((m) => {
              const isMatch = searchHighlight && m.toLowerCase().includes(searchHighlight.toLowerCase());
              return (
                <span
                  key={m}
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isMatch
                      ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400 font-bold'
                      : 'bg-slate-800/80 text-slate-300'
                  }`}
                >
                  {m}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Location & Quick Stock Stepper */}
      <div 
        className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-amber-300/90 font-medium">{reference.location}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Stock Stepper */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-1 py-0.5">
            <button
              onClick={() => onUpdateStock(reference.id, Math.max(0, reference.stock - 1))}
              title="Disminuir 1 unidad"
              className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono text-xs font-bold px-1.5 text-slate-200 min-w-[20px] text-center">
              {reference.stock}
            </span>
            <button
              onClick={() => onUpdateStock(reference.id, reference.stock + 1)}
              title="Aumentar 1 unidad"
              className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Edit icon */}
          <button
            onClick={() => onEdit(reference)}
            title="Editar ficha"
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors ml-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
