import React, { useState } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { 
  Copy, 
  Check, 
  MapPin, 
  Edit3, 
  Eye, 
  Plus, 
  Minus, 
  Package,
  Layers
} from 'lucide-react';

interface GlassTableViewProps {
  references: TemperedGlassRef[];
  searchHighlight?: string;
  onSelect: (ref: TemperedGlassRef) => void;
  onEdit: (ref: TemperedGlassRef) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export const GlassTableView: React.FC<GlassTableViewProps> = ({
  references,
  searchHighlight = '',
  onSelect,
  onEdit,
  onUpdateStock,
}) => {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const handleCopy = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
            <th className="py-3 px-3.5">Código / SKU</th>
            <th className="py-3 px-3.5">Modelo Base</th>
            <th className="py-3 px-3.5">Compatibilidades Cruzadas</th>
            <th className="py-3 px-3.5">Tipo y Curvatura</th>
            <th className="py-3 px-3.5">Pantalla</th>
            <th className="py-3 px-3.5">Ubicación</th>
            <th className="py-3 px-3.5 text-right">Inventario</th>
            <th className="py-3 px-3.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {references.map((ref) => {
            const isOutOfStock = ref.stock === 0;
            const isLowStock = ref.stock <= ref.minStockAlert;

            return (
              <tr
                key={ref.id}
                onClick={() => onSelect(ref)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* SKU */}
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <button
                    onClick={(e) => handleCopy(ref.sku, e)}
                    className="inline-flex items-center gap-1.5 font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 hover:border-cyan-400 px-2 py-0.5 rounded text-[11px] transition-colors"
                    title="Copiar código"
                  >
                    <span>{ref.sku}</span>
                    {copiedSku === ref.sku ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-cyan-500 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </td>

                {/* Primary Model */}
                <td className="py-2.5 px-3.5 whitespace-nowrap font-sans">
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {ref.primaryModel}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {ref.brand}
                  </div>
                </td>

                {/* Compatibles */}
                <td className="py-2.5 px-3.5 min-w-[220px] max-w-[340px]">
                  <div className="flex flex-wrap gap-1">
                    {ref.compatibleModels.map((m) => {
                      const isMatch = searchHighlight && m.toLowerCase().includes(searchHighlight.toLowerCase());
                      return (
                        <span
                          key={m}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isMatch
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-bold'
                              : 'bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          {m}
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Glass Type */}
                <td className="py-2.5 px-3.5 whitespace-nowrap font-sans">
                  <div className="text-slate-200 font-medium">
                    {ref.glassType}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {ref.curvature}
                  </div>
                </td>

                {/* Screen size & cutout */}
                <td className="py-2.5 px-3.5 whitespace-nowrap font-mono">
                  <span className="text-cyan-300 font-semibold">{ref.screenSize}</span>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {ref.cutoutType.replace('-', ' ')}
                  </div>
                </td>

                {/* Location */}
                <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[11px]">
                  <div className="flex items-center gap-1 text-amber-300">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{ref.location}</span>
                  </div>
                </td>

                {/* Stock with inline stepper */}
                <td className="py-2.5 px-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex items-center gap-1.5">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-1 py-0.5">
                      <button
                        onClick={() => onUpdateStock(ref.id, Math.max(0, ref.stock - 1))}
                        className="w-4 h-4 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className={`font-mono text-xs font-bold px-1.5 min-w-[24px] text-center tabular-nums ${
                        isOutOfStock 
                          ? 'text-rose-400' 
                          : isLowStock 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                      }`}>
                        {ref.stock}
                      </span>
                      <button
                        onClick={() => onUpdateStock(ref.id, ref.stock + 1)}
                        className="w-4 h-4 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </td>

                {/* Action buttons */}
                <td className="py-2.5 px-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSelect(ref)}
                      title="Ver Ficha Técnica"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(ref)}
                      title="Editar Referencia"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
