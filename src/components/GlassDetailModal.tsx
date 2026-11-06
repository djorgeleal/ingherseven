import React, { useState } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { 
  X, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CopyPlus, 
  CheckCircle,
  FileText,
  Smartphone
} from 'lucide-react';

interface GlassDetailModalProps {
  reference: TemperedGlassRef | null;
  onClose: () => void;
  onEdit: (ref: TemperedGlassRef) => void;
  onDelete: (id: string) => void;
  onDuplicate: (ref: TemperedGlassRef) => void;
  canEdit?: boolean;
}

export const GlassDetailModal: React.FC<GlassDetailModalProps> = ({
  reference,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  canEdit = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!reference) return null;

  const handleCopyTechSheet = () => {
    const text = `📋 FICHA DE COMPATIBILIDAD
• Marca: ${reference.brand}
• Modelo Base: ${reference.primaryModel}
• Modelos Compatibles: ${reference.compatibleModels.join(', ')}${reference.notes ? `\n• Notas: ${reference.notes}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-800/50 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-700/50 px-2.5 py-1 rounded">
              {reference.brand}
            </span>
            <span className="text-slate-400 text-sm hidden sm:inline">·</span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{reference.primaryModel}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTechSheet}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Ficha</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Compatibility Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                Modelos 100% Compatibles ({reference.compatibleModels.length})
              </h4>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 mb-3">
                Cualquiera de los siguientes teléfonos comparte exactamente el mismo protector de pantalla:
              </p>
              <div className="flex flex-wrap gap-2">
                {reference.compatibleModels.map((model) => (
                  <span
                    key={model}
                    className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800/90 text-cyan-200 border border-slate-700/80"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Installation Notes */}
          {reference.notes && (
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-mono mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-cyan-400" />
                Observaciones y Notas
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {reference.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          {/* Delete with confirmation */}
          <div>
            {canEdit && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-mono">¿Confirmar eliminación?</span>
                  <button
                    onClick={() => {
                      onDelete(reference.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Referencia</span>
                </button>
              )
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canEdit ? (
              <>
                <button
                  onClick={() => {
                    onDuplicate(reference);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CopyPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => {
                    onEdit(reference);
                    onClose();
                  }}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Referencia</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
