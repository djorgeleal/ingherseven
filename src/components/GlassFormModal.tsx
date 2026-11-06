import React, { useState, useEffect } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { X, Plus, Check, AlertCircle, Smartphone } from 'lucide-react';

interface GlassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ref: TemperedGlassRef) => void;
  initialData?: TemperedGlassRef | null;
  presetModel?: string;
}

const COMMON_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Motorola',
  'Oppo',
  'Realme',
  'Vivo',
  'Nokia',
  'Sony',
  'Poco',
  'Alcatel',
  'BLU',
  'Lenovo',
  'LG',
  'Tecno',
  'Honor',
  'Huawei',
  'Infinix',
  'Google Pixel',
  'ZTE',
  'Otra'
];

export const GlassFormModal: React.FC<GlassFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  presetModel,
}) => {
  const [brand, setBrand] = useState('Samsung');
  const [primaryModel, setPrimaryModel] = useState('');
  const [compatibleInput, setCompatibleInput] = useState('');
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setBrand(initialData.brand);
      setPrimaryModel(initialData.primaryModel);
      setCompatibleModels(initialData.compatibleModels || [initialData.primaryModel]);
      setNotes(initialData.notes || '');
    } else {
      // New reference
      const defaultModel = presetModel || '';
      setPrimaryModel(defaultModel);
      setCompatibleModels(defaultModel ? [defaultModel] : []);
      setNotes('');
      // Auto-guess brand if presetModel matches common brand names
      const lower = defaultModel.toLowerCase();
      if (lower.includes('iphone')) {
        setBrand('Apple');
      } else if (lower.includes('galaxy') || lower.startsWith('a') || lower.startsWith('s')) {
        setBrand('Samsung');
      } else if (lower.includes('poco')) {
        setBrand('Poco');
      } else if (lower.includes('redmi') || lower.includes('xiaomi')) {
        setBrand('Xiaomi');
      } else if (lower.includes('moto') || lower.includes('motorola')) {
        setBrand('Motorola');
      } else if (lower.includes('oppo') || lower.includes('reno')) {
        setBrand('Oppo');
      } else if (lower.includes('realme')) {
        setBrand('Realme');
      } else if (lower.includes('vivo')) {
        setBrand('Vivo');
      } else if (lower.includes('nokia')) {
        setBrand('Nokia');
      } else if (lower.includes('sony') || lower.includes('xperia')) {
        setBrand('Sony');
      } else if (lower.includes('alcatel')) {
        setBrand('Alcatel');
      } else if (lower.includes('blu')) {
        setBrand('BLU');
      } else if (lower.includes('lenovo')) {
        setBrand('Lenovo');
      } else if (lower.includes('lg')) {
        setBrand('LG');
      } else if (lower.includes('tecno') || lower.includes('spark') || lower.includes('camon')) {
        setBrand('Tecno');
      } else if (lower.includes('infinix') || lower.includes('hot')) {
        setBrand('Infinix');
      } else if (lower.includes('honor')) {
        setBrand('Honor');
      } else if (lower.includes('huawei') || lower.includes('nova')) {
        setBrand('Huawei');
      }
    }
    setError('');
  }, [initialData, presetModel, isOpen]);

  if (!isOpen) return null;

  const handleAddCompatibleModel = () => {
    const val = compatibleInput.trim();
    if (val && !compatibleModels.includes(val)) {
      setCompatibleModels([...compatibleModels, val]);
      setCompatibleInput('');
    }
  };

  const handleRemoveCompatible = (modelToRemove: string) => {
    setCompatibleModels(compatibleModels.filter((m) => m !== modelToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryModel.trim()) {
      setError('Por favor ingresa el modelo base o principal.');
      return;
    }

    const allCompatibles = compatibleModels.length > 0 
      ? compatibleModels 
      : [primaryModel.trim()];

    // Ensure primary model is included in compatibles
    if (!allCompatibles.includes(primaryModel.trim())) {
      allCompatibles.unshift(primaryModel.trim());
    }

    const updatedRef: TemperedGlassRef = {
      id: initialData?.id || `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brand,
      primaryModel: primaryModel.trim(),
      compatibleModels: allCompatibles,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedRef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-800/60 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {initialData ? 'Editar Referencia de Vidrio' : 'Registrar Nueva Referencia de Vidrio'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura el modelo y las compatibilidades entre teléfonos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Brand & Primary Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                  Marca Principal *
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
                >
                  {COMMON_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                  Modelo Base / Principal *
                </label>
                <input
                  type="text"
                  value={primaryModel}
                  onChange={(e) => setPrimaryModel(e.target.value)}
                  placeholder="Ej: Galaxy A14 o iPhone 13"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 2: Compatible Models */}
            <div>
              <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                Modelos de Celular Compatibles (Equivalencias)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Escribe un modelo que use el mismo vidrio y presiona Enter o "Agregar".
              </p>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={compatibleInput}
                  onChange={(e) => setCompatibleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompatibleModel();
                    }
                  }}
                  placeholder="Ej: Galaxy A13 4G, Galaxy A04..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCompatibleModel}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              {/* Tags container */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950/70 border border-slate-800 rounded-lg min-h-[44px]">
                {compatibleModels.length === 0 ? (
                  <span className="text-xs text-slate-500 italic p-1">
                    No hay modelos adicionales agregados. Se usará el modelo base.
                  </span>
                ) : (
                  compatibleModels.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-slate-800 text-cyan-200 border border-slate-700"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompatible(m)}
                        className="text-slate-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Row 3: Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                Notas Técnicas / Observaciones (Opcional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Cubre los bordes completamente, compatibilidad comprobada en tienda..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-950/50"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Guardar Cambios' : 'Registrar Referencia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
