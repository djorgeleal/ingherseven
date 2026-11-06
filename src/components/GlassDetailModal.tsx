import React, { useState } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { PhoneScreenPreview } from './PhoneScreenPreview';
import { 
  X, 
  MapPin, 
  Package, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CopyPlus, 
  Plus, 
  Minus,
  CheckCircle,
  FileText
} from 'lucide-react';

interface GlassDetailModalProps {
  reference: TemperedGlassRef | null;
  onClose: () => void;
  onEdit: (ref: TemperedGlassRef) => void;
  onDelete: (id: string) => void;
  onDuplicate: (ref: TemperedGlassRef) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export const GlassDetailModal: React.FC<GlassDetailModalProps> = ({
  reference,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateStock,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!reference) return null;

  const handleCopyTechSheet = () => {
    const text = `📋 FICHA TÉCNICA - VIDRIO TEMPLADO
• Código: ${reference.sku}
• Marca: ${reference.brand}
• Modelo Base: ${reference.primaryModel}
• Modelos Compatibles: ${reference.compatibleModels.join(', ')}
• Tipo: ${reference.glassType}
• Tamaño Pantalla: ${reference.screenSize}
• Curvatura: ${reference.curvature}
• Espesor: ${reference.thicknessMm} mm
• Ubicación Almacén: ${reference.location}
• Stock Disponible: ${reference.stock} unidades
• Precio Venta Sugerido: $${reference.retailPrice?.toFixed(2) || '0.00'}
${reference.notes ? `• Notas: ${reference.notes}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const marginPct = reference.retailPrice && reference.wholesalePrice && reference.wholesalePrice > 0
    ? Math.round(((reference.retailPrice - reference.wholesalePrice) / reference.retailPrice) * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-cyan-800/50 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-700/50 px-2.5 py-1 rounded">
              {reference.sku}
            </span>
            <span className="text-slate-400 text-sm hidden sm:inline">·</span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {reference.brand} {reference.primaryModel}
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Phone & Glass Schematics visualizer */}
          <div className="md:col-span-5 flex flex-col items-center">
            <PhoneScreenPreview
              primaryModel={reference.primaryModel}
              screenSize={reference.screenSize}
              cutoutType={reference.cutoutType}
              curvature={reference.curvature}
              glassType={reference.glassType}
            />

            {/* Warehouse Location Callout */}
            <div className="w-full mt-4 p-3.5 bg-slate-950/80 rounded-xl border border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-700/40 flex items-center justify-center text-amber-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-400/80 uppercase font-mono block">
                    Ubicación Almacén
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {reference.location}
                  </span>
                </div>
              </div>

              {/* Stock Stepper */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => onUpdateStock(reference.id, Math.max(0, reference.stock - 1))}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-xs font-bold px-2 text-cyan-300">
                  {reference.stock}
                </span>
                <button
                  onClick={() => onUpdateStock(reference.id, reference.stock + 1)}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Specs & Compatibility Matrix */}
          <div className="md:col-span-7 space-y-4">
            {/* Compatibility Matrix */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Modelos 100% Compatibles ({reference.compatibleModels.length})
                </h4>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400 mb-2">
                  Cualquiera de los siguientes teléfonos puede utilizar esta misma referencia sin desajustes:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reference.compatibleModels.map((model) => (
                    <span
                      key={model}
                      className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-slate-800/90 text-cyan-200 border border-slate-700/80"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Especificaciones del Protector
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Tipo de Vidrio</span>
                  <span className="text-slate-200 font-semibold">{reference.glassType}</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Curvatura de Borde</span>
                  <span className="text-slate-200 font-semibold">{reference.curvature}</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Diagonal Pantalla</span>
                  <span className="text-cyan-300 font-semibold">{reference.screenSize}</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Espesor / Dureza</span>
                  <span className="text-slate-200 font-semibold">{reference.thicknessMm} mm · 9H</span>
                </div>
              </div>
            </div>

            {/* Pricing & Margins */}
            {(reference.wholesalePrice !== undefined || reference.retailPrice !== undefined) && (
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl grid grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Costo Mayor</span>
                  <span className="text-slate-300 font-bold">${reference.wholesalePrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Precio Público</span>
                  <span className="text-emerald-400 font-bold">${reference.retailPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Margen Estimado</span>
                  <span className="text-cyan-300 font-bold">{marginPct ? `${marginPct}%` : 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Installation Notes */}
            {reference.notes && (
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  Notas de Instalación / Taller
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {reference.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          {/* Delete with confirmation */}
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-mono">¿Confirmar eliminación?</span>
                <button
                  onClick={() => {
                    onDelete(reference.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
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
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDuplicate(reference);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CopyPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Duplicar Variante</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
