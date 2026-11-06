import React, { useRef, useState } from 'react';
import { BrandFilter, TemperedGlassRef } from '../types/glass';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  LayoutGrid, 
  Table as TableIcon,
  Database,
  Cloud,
  CloudCheck,
  RefreshCw
} from 'lucide-react';

interface DatabaseControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  brandFilter: BrandFilter;
  onBrandFilterChange: (brand: BrandFilter) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onAddNew: () => void;
  onExportJson: () => void;
  onImportJson: (data: TemperedGlassRef[]) => void;
  onResetFactory: () => void;
  isFirebaseConnected?: boolean;
  isSyncingFirebase?: boolean;
  onSyncAllToFirebase?: () => void;
  canAddReference?: boolean;
  isLoggedIn?: boolean;
}

const BRANDS: BrandFilter[] = [
  'Todas',
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
  'Otras'
];

export const DatabaseControlBar: React.FC<DatabaseControlBarProps> = ({
  searchQuery,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  viewMode,
  onViewModeChange,
  onAddNew,
  onExportJson,
  onImportJson,
  onResetFactory,
  isFirebaseConnected = false,
  isSyncingFirebase = false,
  onSyncAllToFirebase,
  canAddReference = false,
  isLoggedIn = false,
}) => {
  const [showDbMenu, setShowDbMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0 && json[0].primaryModel) {
          onImportJson(json);
          setShowDbMenu(false);
        } else {
          alert('El archivo JSON no tiene un formato válido de base de datos de vidrios.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Upper row: Search, View toggles & Add button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search in Catalog */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por modelo base o compatibilidad..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
          />
        </div>

        {/* View toggles & DB menu & Add button */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {/* View Mode Switcher (Grid vs Table) */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Vista de Tarjetas"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Vista de Tabla / Matriz"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Firebase Cloud Sync Button & Database Menu - Only visible when logged in */}
          {isLoggedIn && (
            <div className="flex items-center gap-1.5">
              {onSyncAllToFirebase && (
                <button
                  onClick={onSyncAllToFirebase}
                  disabled={isSyncingFirebase}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-800/60 hover:border-cyan-400 text-cyan-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Sincronizar toda la base de datos a Firebase Firestore"
                >
                  {isSyncingFirebase ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span className="hidden sm:inline font-mono">
                    {isSyncingFirebase ? 'Guardando en la Nube...' : 'Guardar en Firebase'}
                  </span>
                  {isFirebaseConnected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Firebase Conectado" />
                  )}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowDbMenu(!showDbMenu)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Opciones de Base de Datos"
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {showDbMenu && (
                  <div 
                    className="absolute right-0 mt-1 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-40 text-xs font-mono space-y-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Base de Datos</span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Firebase Activo
                      </span>
                    </div>

                    {onSyncAllToFirebase && (
                      <button
                        onClick={() => {
                          onSyncAllToFirebase();
                          setShowDbMenu(false);
                        }}
                        disabled={isSyncingFirebase}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <CloudCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Subir Todo a Firebase</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onExportJson();
                        setShowDbMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Exportar Copia (.json)</span>
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Importar Copia (.json)</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        if (confirm('¿Restablecer el catálogo con los vidrios compatibles de fábrica?')) {
                          onResetFactory();
                          setShowDbMenu(false);
                        }
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-950/40 text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>Restablecer Fábrica</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Brand Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 text-xs font-mono">
        <span className="text-[11px] text-slate-500 mr-1.5 shrink-0">Marca:</span>
        {BRANDS.map((brand) => (
          <button
            key={brand}
            onClick={() => onBrandFilterChange(brand)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              brandFilter === brand
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
};
