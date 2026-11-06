import React, { useState } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { 
  Smartphone, 
  Edit3, 
  Eye
} from 'lucide-react';

interface GlassCardProps {
  reference: TemperedGlassRef;
  searchHighlight?: string;
  onSelect: (ref: TemperedGlassRef) => void;
  onEdit: (ref: TemperedGlassRef) => void;
  canEdit?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  reference,
  searchHighlight = '',
  onSelect,
  onEdit,
  canEdit = false,
}) => {
  const [showAllModels, setShowAllModels] = useState(false);

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
      <div>
        {/* Top Header Row: Brand & Compatibility Count */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded">
            {reference.brand}
          </span>

          <span className="text-[11px] text-slate-500 font-mono">
            {reference.compatibleModels.length} compatibles
          </span>
        </div>

        {/* Primary Model */}
        <div className="mb-2.5">
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">{reference.primaryModel}</span>
          </h3>
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
                      ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400 font-bold'
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

      {/* Bottom Footer: Actions */}
      <div 
        className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] text-slate-500 font-mono">
          {reference.notes ? 'Con notas' : 'Estándar'}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelect(reference)}
            className="px-2 py-1 rounded text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Ficha</span>
          </button>
          {canEdit && (
            <button
              onClick={() => onEdit(reference)}
              title="Editar ficha"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
