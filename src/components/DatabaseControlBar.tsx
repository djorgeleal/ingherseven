import React, { useRef, useState } from 'react';
import { BrandFilter, GlassType, TemperedGlassRef } from '../types/glass';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  LayoutGrid, 
  Table as TableIcon,
  SlidersHorizontal,
  Layers,
  Database
} from 'lucide-react';

interface DatabaseControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  brandFilter: BrandFilter;
  onBrandFilterChange: (brand: BrandFilter) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onAddNew: () => void;
  onExportJson: () => void;
  onImportJson: (data: TemperedGlassRef[]) => void;
  onResetFactory: () => void;
}

const BRANDS: BrandFilter[] = ['Todas', 'Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Realme', 'Honor'];

export const DatabaseControlBar: React.FC<DatabaseControlBarProps> = ({
  searchQuery,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  typeFilter,
  onTypeFilterChange,
  viewMode,
  onViewModeChange,
  onAddNew,
  onExportJson,
  onImportJson,
  onResetFactory,
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
        if (Array.isArray(json) && json.length > 0 && json[0].sku) {
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
      {/* Upper row: Search, Filter dropdowns, View toggles & Add button */}
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
            placeholder="Buscar por código SKU, modelo, pantalla o gaveta..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
          />
        </div>

        {/* Glass Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-sans"
          >
            <option value="Todos">Todos los Tipos de Vidrio</option>
            <option value="Vidrio 9D/11D Full Glue">Vidrio 9D/11D</option>
            <option value="Cerámico Flexible">Cerámico Flexible</option>
            <option value="Privacidad Antiespía">Privacidad Antiespía</option>
            <option value="Mate Gamer Antihuellas">Mate Gamer</option>
            <option value="Cristal Transparente 2.5D">Cristal 2.5D</option>
            <option value="UV Líquido Curvo 3D">UV Curvo 3D</option>
          </select>

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

          {/* Database Operations Menu */}
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
                className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-40 text-xs font-mono space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  Base de Datos (JSON)
                </div>

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

          {/* Add New Glass Reference Button */}
          <button
            onClick={onAddNew}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-950/40 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Referencia</span>
          </button>
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
