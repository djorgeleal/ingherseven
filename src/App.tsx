import React, { useState, useEffect } from 'react';
import { TemperedGlassRef, BrandFilter } from './types/glass';
import { INITIAL_GLASS_DATABASE } from './data/initialData';
import { FastCompatibilityFinder } from './components/FastCompatibilityFinder';
import { StatsBanner } from './components/StatsBanner';
import { DatabaseControlBar } from './components/DatabaseControlBar';
import { GlassCard } from './components/GlassCard';
import { GlassTableView } from './components/GlassTableView';
import { GlassDetailModal } from './components/GlassDetailModal';
import { GlassFormModal } from './components/GlassFormModal';
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Smartphone, 
  Search, 
  CheckCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'glassmatrix_db_v1';

export default function App() {
  // Database State with LocalStorage persistence
  const [references, setReferences] = useState<TemperedGlassRef[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved database', e);
    }
    return INITIAL_GLASS_DATABASE;
  });

  // UI & Search Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [isLowStockOnly, setIsLowStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Selection State
  const [selectedReference, setSelectedReference] = useState<TemperedGlassRef | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<TemperedGlassRef | null>(null);
  const [presetModelForNew, setPresetModelForNew] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(references));
    } catch (e) {
      console.error('Error persisting database', e);
    }
  }, [references]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stock update handler
  const handleUpdateStock = (id: string, newStock: number) => {
    setReferences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
    );
    if (selectedReference && selectedReference.id === id) {
      setSelectedReference((prev) => (prev ? { ...prev, stock: newStock } : null));
    }
    showToast('Stock actualizado');
  };

  // Save reference (Create or Update)
  const handleSaveReference = (savedRef: TemperedGlassRef) => {
    setReferences((prev) => {
      const exists = prev.some((r) => r.id === savedRef.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRef.id ? savedRef : r));
      } else {
        return [savedRef, ...prev];
      }
    });
    showToast(`Referencia ${savedRef.sku} guardada con éxito`);
  };

  // Delete reference
  const handleDeleteReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
    if (selectedReference?.id === id) {
      setSelectedReference(null);
    }
    showToast('Referencia eliminada de la base de datos');
  };

  // Duplicate as variant
  const handleDuplicateReference = (ref: TemperedGlassRef) => {
    const duplicated: TemperedGlassRef = {
      ...ref,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sku: `${ref.sku}-VAR`,
      stock: 10,
      updatedAt: new Date().toISOString(),
    };
    setEditingReference(duplicated);
    setIsFormOpen(true);
  };

  // JSON Export
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(references, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `glassmatrix_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Base de datos exportada en formato JSON');
  };

  // JSON Import
  const handleImportJson = (imported: TemperedGlassRef[]) => {
    setReferences(imported);
    showToast(`${imported.length} referencias importadas correctamente`);
  };

  // Reset to Factory catalog
  const handleResetFactory = () => {
    setReferences(INITIAL_GLASS_DATABASE);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Base de datos restaurada al catálogo de fábrica');
  };

  // Trigger Add Modal with preset model
  const handleAddNewWithModel = (modelName: string) => {
    setEditingReference(null);
    setPresetModelForNew(modelName);
    setIsFormOpen(true);
  };

  // Filtering logic
  const filteredReferences = references.filter((item) => {
    // Brand filter
    if (brandFilter !== 'Todas') {
      if (brandFilter === 'Otras') {
        const topBrands = ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Realme', 'Honor'];
        if (topBrands.includes(item.brand)) return false;
      } else if (item.brand !== brandFilter) {
        return false;
      }
    }

    // Glass type filter
    if (typeFilter !== 'Todos' && item.glassType !== typeFilter) {
      return false;
    }

    // Low stock filter
    if (isLowStockOnly && item.stock > item.minStockAlert) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inSku = item.sku.toLowerCase().includes(q);
      const inPrimary = item.primaryModel.toLowerCase().includes(q);
      const inCompatibles = item.compatibleModels.some((m) => m.toLowerCase().includes(q));
      const inLocation = item.location.toLowerCase().includes(q);
      const inScreen = item.screenSize.toLowerCase().includes(q);
      const inNotes = item.notes?.toLowerCase().includes(q);
      return inSku || inPrimary || inCompatibles || inLocation || inScreen || inNotes;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/80 text-cyan-200 text-xs font-mono shadow-2xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white font-mono">
            GLASS<span className="text-cyan-400">MATRIX</span>
          </span>
        </div>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400 font-mono">
          <a href="#buscador" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Buscador Rápido
          </a>
          <a href="#catalogo" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Catálogo & Matriz
          </a>
          <a href="#almacen" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Gavetas & Stock
          </a>
          <a href="#especificaciones" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Tecnología 9H
          </a>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setEditingReference(null);
              setPresetModelForNew('');
              setIsFormOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 cursor-pointer"
          >
            <span>+ Nueva Referencia</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Section IngHerSeven */}
        <section className="relative w-full overflow-hidden rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 shadow-2xl">
          <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />
          <div className="relative w-full flex items-center justify-center p-1 sm:p-2">
            <img
              src="https://i.postimg.cc/15NhJ7yD/inghersevenwebp.webp"
              alt="IngHerSeven - Vidrios Templados y Compatibilidades"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[220px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[480px] object-contain rounded-xl select-none"
              loading="eager"
            />
          </div>
        </section>

        {/* Section: Fast Compatibility Finder */}
        <section id="buscador">
          <FastCompatibilityFinder
            references={references}
            onSelectReference={(ref) => setSelectedReference(ref)}
            onAddNewWithModel={handleAddNewWithModel}
            onUpdateStock={handleUpdateStock}
          />
        </section>

        {/* Section: Stats & Stock Metrics */}
        <section id="almacen">
          <StatsBanner
            references={references}
            onFilterLowStock={() => setIsLowStockOnly(!isLowStockOnly)}
            isLowStockFilterActive={isLowStockOnly}
          />
        </section>

        {/* Section: Catalog & Filter Management */}
        <section id="catalogo" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Catálogo de Referencias y Compatibilidades</span>
                <span className="text-xs font-mono text-cyan-400 font-normal">
                  ({filteredReferences.length} de {references.length})
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Consulta y gestiona cada referencia, sus modelos asociados y su ubicación física.
              </p>
            </div>
          </div>

          {/* Database Control Bar (Search, Brand tabs, Type filter, Import/Export) */}
          <DatabaseControlBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            brandFilter={brandFilter}
            onBrandFilterChange={setBrandFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddNew={() => {
              setEditingReference(null);
              setPresetModelForNew('');
              setIsFormOpen(true);
            }}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onResetFactory={handleResetFactory}
          />

          {/* Catalog Content (Grid Cards or Table) */}
          {filteredReferences.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReferences.map((ref) => (
                  <GlassCard
                    key={ref.id}
                    reference={ref}
                    searchHighlight={searchQuery}
                    onSelect={(r) => setSelectedReference(r)}
                    onEdit={(r) => {
                      setEditingReference(r);
                      setIsFormOpen(true);
                    }}
                    onUpdateStock={handleUpdateStock}
                  />
                ))}
              </div>
            ) : (
              <GlassTableView
                references={filteredReferences}
                searchHighlight={searchQuery}
                onSelect={(r) => setSelectedReference(r)}
                onEdit={(r) => {
                  setEditingReference(r);
                  setIsFormOpen(true);
                }}
                onUpdateStock={handleUpdateStock}
              />
            )
          ) : (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                No se encontraron referencias con los filtros actuales
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Prueba ajustando el término de búsqueda o seleccionando otra marca.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setBrandFilter('Todas');
                  setTypeFilter('Todos');
                  setIsLowStockOnly(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </section>

        {/* Section: Technical Reference Guide & Shop Tips */}
        <section id="especificaciones" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Guía Rápida para Técnicos e Instaladores</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-cyan-300 font-bold block mb-1">Dureza 9H vs Cerámica</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                El vidrio 9D/11D ofrece máxima protección contra rayones directos, mientras que el Cerámico Flexible absorbe impactos fuertes sin astillarse en las esquinas.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-cyan-300 font-bold block mb-1">Corte de Auricular & Notch</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Los modelos como iPhone 13, 13 Pro y 14 comparten la misma medida de 6.1" y notch reducido, permitiendo usar un único SKU para los 3 modelos.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-cyan-300 font-bold block mb-1">Control de Gavetas</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Usa el código de gaveta (ej: Gaveta B-01) para organizar físicamente los protectores por serie y reducir tiempos de atención a menos de 20 segundos.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
        <div>
          <span>GlassMatrix Database</span>
          <span className="mx-2">·</span>
          <span>Sistema de Referencias & Compatibilidad Móvil</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Almacenamiento Local Activo (Offline Ready)
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedReference && (
        <GlassDetailModal
          reference={selectedReference}
          onClose={() => setSelectedReference(null)}
          onEdit={(ref) => {
            setEditingReference(ref);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteReference}
          onDuplicate={handleDuplicateReference}
          onUpdateStock={handleUpdateStock}
        />
      )}

      {/* Add / Edit Form Modal */}
      <GlassFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReference(null);
          setPresetModelForNew('');
        }}
        onSave={handleSaveReference}
        initialData={editingReference}
        presetModel={presetModelForNew}
      />
    </div>
  );
}
