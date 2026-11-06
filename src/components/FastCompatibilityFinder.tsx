import React, { useState } from 'react';
import { TemperedGlassRef } from '../types/glass';
import { 
  Search, 
  CheckCircle2, 
  Smartphone, 
  MapPin, 
  Package, 
  Copy, 
  Check, 
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

interface FastCompatibilityFinderProps {
  references: TemperedGlassRef[];
  onSelectReference: (ref: TemperedGlassRef) => void;
  onAddNewWithModel: (modelName: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export const FastCompatibilityFinder: React.FC<FastCompatibilityFinderProps> = ({
  references,
  onSelectReference,
  onAddNewWithModel,
  onUpdateStock,
}) => {
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cleanQuery = query.trim().toLowerCase();

  // Find all references that match the phone model or SKU
  const matchedReferences = cleanQuery.length >= 2
    ? references.filter((item) => {
        const inPrimary = item.primaryModel.toLowerCase().includes(cleanQuery);
        const inCompatibles = item.compatibleModels.some((m) =>
          m.toLowerCase().includes(cleanQuery)
        );
        const inSku = item.sku.toLowerCase().includes(cleanQuery);
        const inBrand = item.brand.toLowerCase().includes(cleanQuery);
        return inPrimary || inCompatibles || inSku || inBrand;
      })
    : [];

  const handleCopySummary = (ref: TemperedGlassRef) => {
    const text = `📱 COMPATIBILIDAD VIDRIO TEMPLADO:\n• SKU: ${ref.sku} (${ref.glassType})\n• Pantalla: ${ref.screenSize}\n• Teléfonos Compatibles: ${ref.compatibleModels.join(', ')}\n• Ubicación en Almacén: ${ref.location}\n• Stock: ${ref.stock} unid.`;
    navigator.clipboard.writeText(text);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sampleSearches = [
    'iPhone 14',
    'Galaxy A14',
    'Redmi Note 12',
    'Moto G32',
    'S20 FE',
    'iPhone XR',
  ];

  return (
    <div className="relative bg-slate-900/90 border border-cyan-800/40 rounded-2xl p-5 shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Decorative tech ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Buscador Rápido de Compatibilidad Cruzada
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Escribe cualquier modelo de celular para verificar qué vidrios le sirven al instante.
          </p>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Ejemplos:</span>
          {sampleSearches.map((sample) => (
            <button
              key={sample}
              onClick={() => setQuery(sample)}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe el modelo del teléfono (ej: iPhone 13, A54, Redmi 10, Moto G22, etc.)..."
          className="w-full pl-11 pr-24 py-3 bg-slate-950/90 border border-cyan-500/40 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all font-medium"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Results Section */}
      {cleanQuery.length >= 2 ? (
        matchedReferences.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                {matchedReferences.length} referencia{matchedReferences.length > 1 ? 's' : ''} compatible{matchedReferences.length > 1 ? 's' : ''} con "{query}"
              </span>
              <span className="text-slate-500">Resultados en tiempo real</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {matchedReferences.map((ref) => {
                const isDirectMatch = ref.primaryModel.toLowerCase().includes(cleanQuery);
                const matchedCompatibles = ref.compatibleModels.filter(m => m.toLowerCase().includes(cleanQuery));

                return (
                  <div
                    key={ref.id}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 rounded-xl transition-all group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top code and stock status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                          {ref.sku}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                            ref.stock === 0
                              ? 'bg-rose-950/50 text-rose-300 border-rose-900/60'
                              : ref.stock <= ref.minStockAlert
                              ? 'bg-amber-950/50 text-amber-300 border-amber-900/60'
                              : 'bg-emerald-950/50 text-emerald-300 border-emerald-900/60'
                          }`}>
                            <Package className="w-3 h-3" />
                            {ref.stock} unid.
                          </span>
                        </div>
                      </div>

                      {/* Primary Model & Type */}
                      <div className="mb-2">
                        <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{ref.primaryModel}</span>
                          <span className="text-xs text-slate-400 font-normal">({ref.screenSize})</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{ref.glassType}</span>
                          <span>·</span>
                          <span>{ref.curvature}</span>
                        </div>
                      </div>

                      {/* Highlighted Compatible Models */}
                      <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/80 text-xs mb-3">
                        <div className="text-[11px] font-medium text-slate-400 mb-1">
                          Modelos 100% compatibles con este vidrio:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ref.compatibleModels.map((m) => {
                            const isThisMatch = m.toLowerCase().includes(cleanQuery);
                            return (
                              <span
                                key={m}
                                className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                                  isThisMatch
                                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold'
                                    : 'bg-slate-800/70 text-slate-300'
                                }`}
                              >
                                {m}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Location & Quick Action Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-amber-300">{ref.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopySummary(ref)}
                          title="Copiar resumen para cliente o WhatsApp"
                          className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === ref.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onSelectReference(ref)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Ficha</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <AlertCircle className="w-7 h-7 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">
              No se encontró vidrio para "{query}"
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-3">
              No tenemos registrada una compatibilidad para este modelo todavía. Puedes registrarlo en la base de datos ahora mismo.
            </p>
            <button
              onClick={() => onAddNewWithModel(query)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar vidrio para "{query}"</span>
            </button>
          </div>
        )
      ) : (
        <div className="px-1 text-xs text-slate-500 flex items-center justify-between">
          <span>Ingresa al menos 2 letras para activar la búsqueda predictiva.</span>
          <span className="font-mono text-cyan-400/70">
            {references.length} referencias cargadas
          </span>
        </div>
      )}
    </div>
  );
};
