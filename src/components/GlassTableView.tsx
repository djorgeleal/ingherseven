import React from 'react';
import { TemperedGlassRef } from '../types/glass';
import { 
  Edit3, 
  Eye,
  Smartphone
} from 'lucide-react';

interface GlassTableViewProps {
  references: TemperedGlassRef[];
  searchHighlight?: string;
  onSelect: (ref: TemperedGlassRef) => void;
  onEdit: (ref: TemperedGlassRef) => void;
  canEdit?: boolean;
}

export const GlassTableView: React.FC<GlassTableViewProps> = ({
  references,
  searchHighlight = '',
  onSelect,
  onEdit,
  canEdit = false,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
            <th className="py-3 px-3.5">Marca</th>
            <th className="py-3 px-3.5">Modelo Base</th>
            <th className="py-3 px-3.5">Compatibilidades Cruzadas</th>
            <th className="py-3 px-3.5">Observaciones</th>
            <th className="py-3 px-3.5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {references.map((ref) => {
            return (
              <tr
                key={ref.id}
                onClick={() => onSelect(ref)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Brand */}
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                    {ref.brand}
                  </span>
                </td>

                {/* Primary Model */}
                <td className="py-2.5 px-3.5 whitespace-nowrap font-sans">
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{ref.primaryModel}</span>
                  </div>
                </td>

                {/* Compatibles */}
                <td className="py-2.5 px-3.5 min-w-[300px]">
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

                {/* Notes */}
                <td className="py-2.5 px-3.5 max-w-[200px] truncate text-slate-400 font-sans">
                  {ref.notes || '—'}
                </td>

                {/* Action buttons */}
                <td className="py-2.5 px-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSelect(ref)}
                      title="Ver Ficha Técnica"
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => onEdit(ref)}
                        title="Editar Referencia"
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
