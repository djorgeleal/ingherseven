import React, { useState, useEffect } from 'react';
import { 
  TemperedGlassRef, 
  GlassType, 
  CutoutType, 
  CurvatureType 
} from '../types/glass';
import { PhoneScreenPreview } from './PhoneScreenPreview';
import { X, Plus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface GlassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ref: TemperedGlassRef) => void;
  initialData?: TemperedGlassRef | null;
  presetModel?: string;
}

const GLASS_TYPES: GlassType[] = [
  'Vidrio 9D/11D Full Glue',
  'Cerámico Flexible',
  'Privacidad Antiespía',
  'Mate Gamer Antihuellas',
  'Cristal Transparente 2.5D',
  'UV Líquido Curvo 3D',
];

const CUTOUT_TYPES: { label: string; value: CutoutType }[] = [
  { label: 'Dynamic Island (Apple)', value: 'dynamic-island' },
  { label: 'Punch Hole Central (Agujero)', value: 'punch-hole' },
  { label: 'Gota / Waterdrop (V / U)', value: 'waterdrop' },
  { label: 'Notch Clásico (iPhone X/11/12/13/14)', value: 'notch-classic' },
  { label: 'Píldora Doble Lateral', value: 'punch-hole-pill' },
  { label: 'Sin Perforación / Plano', value: 'none' },
];

const CURVATURES: CurvatureType[] = [
  '2.5D Biselado',
  'Plano Total',
  '3D Curvo',
];

const COMMON_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Realme', 'Honor', 'Huawei', 'Google Pixel', 'ZTE', 'Infinix'];

export const GlassFormModal: React.FC<GlassFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  presetModel,
}) => {
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Samsung');
  const [primaryModel, setPrimaryModel] = useState('');
  const [compatibleInput, setCompatibleInput] = useState('');
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [glassType, setGlassType] = useState<GlassType>('Vidrio 9D/11D Full Glue');
  const [screenSize, setScreenSize] = useState('6.50"');
  const [cutoutType, setCutoutType] = useState<CutoutType>('punch-hole');
  const [curvature, setCurvature] = useState<CurvatureType>('2.5D Biselado');
  const [thicknessMm, setThicknessMm] = useState(0.33);
  const [location, setLocation] = useState('Gaveta A-01');
  const [stock, setStock] = useState(20);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [wholesalePrice, setWholesalePrice] = useState(0.85);
  const [retailPrice, setRetailPrice] = useState(5.0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setSku(initialData.sku);
      setBrand(initialData.brand);
      setPrimaryModel(initialData.primaryModel);
      setCompatibleModels(initialData.compatibleModels || [initialData.primaryModel]);
      setGlassType(initialData.glassType);
      setScreenSize(initialData.screenSize);
      setCutoutType(initialData.cutoutType);
      setCurvature(initialData.curvature);
      setThicknessMm(initialData.thicknessMm || 0.33);
      setLocation(initialData.location);
      setStock(initialData.stock);
      setMinStockAlert(initialData.minStockAlert);
      setWholesalePrice(initialData.wholesalePrice || 0.85);
      setRetailPrice(initialData.retailPrice || 5.0);
      setNotes(initialData.notes || '');
    } else {
      // New reference
      const defaultModel = presetModel || '';
      setSku('');
      setPrimaryModel(defaultModel);
      setCompatibleModels(defaultModel ? [defaultModel] : []);
      setStock(20);
      setMinStockAlert(5);
      setWholesalePrice(0.85);
      setRetailPrice(5.0);
      setNotes('');
      // Auto-guess brand if presetModel matches common brand names
      if (defaultModel.toLowerCase().includes('iphone')) {
        setBrand('Apple');
        setCutoutType('dynamic-island');
        setScreenSize('6.10"');
      } else if (defaultModel.toLowerCase().includes('galaxy') || defaultModel.toLowerCase().startsWith('a') || defaultModel.toLowerCase().startsWith('s')) {
        setBrand('Samsung');
        setCutoutType('punch-hole');
      } else if (defaultModel.toLowerCase().includes('redmi') || defaultModel.toLowerCase().includes('poco') || defaultModel.toLowerCase().includes('xiaomi')) {
        setBrand('Xiaomi');
        setCutoutType('punch-hole');
      } else if (defaultModel.toLowerCase().includes('moto') || defaultModel.toLowerCase().includes('motorola')) {
        setBrand('Motorola');
        setCutoutType('punch-hole');
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

  const handleAutoGenerateSku = () => {
    const brandPrefix = brand.substring(0, 3).toUpperCase();
    const cleanModel = primaryModel
      .toUpperCase()
      .replace(/IPHONE/g, 'IP')
      .replace(/GALAXY/g, 'GAL')
      .replace(/REDMI NOTE/g, 'RN')
      .replace(/REDMI/g, 'RED')
      .replace(/MOTO/g, 'MOT')
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9-]/g, '')
      .substring(0, 10);

    const generated = `VT-${brandPrefix}-${cleanModel || 'REF'}`;
    setSku(generated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) {
      setError('Por favor indica un código o SKU para la referencia.');
      return;
    }
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
      sku: sku.trim().toUpperCase(),
      brand,
      primaryModel: primaryModel.trim(),
      compatibleModels: allCompatibles,
      glassType,
      screenSize: screenSize.trim() || '6.50"',
      cutoutType,
      curvature,
      thicknessMm: Number(thicknessMm) || 0.33,
      location: location.trim() || 'Gaveta General',
      stock: Math.max(0, Number(stock) || 0),
      minStockAlert: Math.max(0, Number(minStockAlert) || 5),
      wholesalePrice: Number(wholesalePrice) || 0,
      retailPrice: Number(retailPrice) || 0,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedRef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-cyan-800/60 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {initialData ? 'Editar Referencia de Vidrio Templado' : 'Registrar Nueva Referencia de Vidrio'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configura el código, compatibilidades de teléfono y ubicación en tienda.
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
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
            {/* Form Fields: Left (8 columns) */}
            <div className="lg:col-span-8 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Row 1: SKU & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300 font-mono">
                      Código / SKU *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSku}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto-generar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="Ej: VT-SAM-A14"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>

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
              </div>

              {/* Row 2: Primary Model */}
              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                  Modelo Base / Impreso en el Paquete *
                </label>
                <input
                  type="text"
                  value={primaryModel}
                  onChange={(e) => setPrimaryModel(e.target.value)}
                  placeholder="Ej: Galaxy A14 4G/5G o iPhone 13"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              {/* Row 3: Compatible Models (Tag management) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                  Modelos de Celular Compatibles (Equivalencias Cruzadas)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Escribe un modelo que comparta la misma pantalla y presiona Enter o "Agregar".
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
                    placeholder="Ej: Galaxy A13 4G, Galaxy A04, Galaxy A23..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCompatibleModel}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 flex items-center gap-1 cursor-pointer"
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

              {/* Row 4: Glass Type & Screen Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Tipo de Protector
                  </label>
                  <select
                    value={glassType}
                    onChange={(e) => setGlassType(e.target.value as GlassType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    {GLASS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Tamaño Pantalla (pulgadas)
                  </label>
                  <input
                    type="text"
                    value={screenSize}
                    onChange={(e) => setScreenSize(e.target.value)}
                    placeholder='Ej: 6.1", 6.67", 6.5"'
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Cutout & Curvature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Tipo de Corte / Perforación
                  </label>
                  <select
                    value={cutoutType}
                    onChange={(e) => setCutoutType(e.target.value as CutoutType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    {CUTOUT_TYPES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Curvatura de Pantalla
                  </label>
                  <select
                    value={curvature}
                    onChange={(e) => setCurvature(e.target.value as CurvatureType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    {CURVATURES.map((curv) => (
                      <option key={curv} value={curv}>{curv}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Location & Stock & Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Ubicación en Almacén
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: Gaveta B-04"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-amber-300 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Alerta Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 7: Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Costo Mayorista ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                    Precio Venta al Público ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-emerald-400 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 8: Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 font-mono block mb-1">
                  Notas Técnicas de Instalación (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Cubre los bordes completamente, no interfiere con fundas Spigen..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Interactive Preview: Right (4 columns) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Simulador Visual en Tiempo Real
              </span>
              <PhoneScreenPreview
                primaryModel={primaryModel || 'Modelo Nuevo'}
                screenSize={screenSize}
                cutoutType={cutoutType}
                curvature={curvature}
                glassType={glassType}
              />
              <p className="text-[11px] text-slate-500 mt-2 text-center font-mono">
                La vista previa se actualiza automáticamente al cambiar el corte, la curvatura o el tamaño.
              </p>
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
