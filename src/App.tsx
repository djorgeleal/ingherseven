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
  Smartphone, 
  Search, 
  CheckCircle,
  Info,
  LogIn,
  LogOut,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { testConnection, auth, loginWithGoogle, logoutUser } from './lib/firebase';
import { 
  subscribeToGlassReferences, 
  saveGlassReferenceToFirestore, 
  deleteGlassReferenceFromFirestore, 
  uploadAllToFirestore,
  autoSyncAllToFirestore,
  ensureAuthorizedEmailsInDatabase,
  isEmailAuthorized,
  AUTHORIZED_EMAILS
} from './services/glassFirebaseService';

const STORAGE_KEY = 'ingherseven_db_v5';

export default function App() {
  // Database State with LocalStorage & Firebase persistence
  const [references, setReferences] = useState<TemperedGlassRef[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('glassmatrix_db_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((r: TemperedGlassRef) => r.id));
          const missing = INITIAL_GLASS_DATABASE.filter((r) => !existingIds.has(r.id));
          return [...parsed, ...missing];
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Selection State
  const [selectedReference, setSelectedReference] = useState<TemperedGlassRef | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<TemperedGlassRef | null>(null);
  const [presetModelForNew, setPresetModelForNew] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase Cloud State & Authorization
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if current logged-in user is one of the authorized emails
  const isAuthorized = Boolean(currentUser?.email && isEmailAuthorized(currentUser.email));

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(references));
    } catch (e) {
      console.error('Error persisting database', e);
    }
  }, [references]);

  // Test connection, ensure authorized emails in DB, and subscribe to Firebase Firestore
  useEffect(() => {
    // 1. Mandatory connection test on boot
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
      if (connected) {
        console.log('Firebase Firestore connection test: OK');
        // Store the authorized emails in Firestore database
        ensureAuthorizedEmailsInDatabase();
      }
    });

    // 2. Auth listener to detect user login state & auto-sync database to Firebase
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && isEmailAuthorized(user.email)) {
        // Ensure authorized user records in Firestore
        ensureAuthorizedEmailsInDatabase().catch(console.warn);

        // Automatically ensure all brands and models are saved in Firebase Firestore
        try {
          setIsSyncingFirebase(true);
          const syncResult = await autoSyncAllToFirestore(references);
          setIsSyncingFirebase(false);
          if (syncResult.uploaded > 0) {
            showToast(`✓ Se guardaron automáticamente ${syncResult.uploaded} marcas y modelos en Firebase`);
          }
        } catch (e) {
          setIsSyncingFirebase(false);
          console.warn('Auto-sync check on auth:', e);
        }
      }
    });

    // 3. Real-time Firestore subscription
    const unsubFirestore = subscribeToGlassReferences(
      (remoteRefs) => {
        setIsFirebaseConnected(true);
        if (remoteRefs && remoteRefs.length > 0) {
          // If Firestore has references, update local state while preserving any factory catalog items
          setReferences((prev) => {
            const remoteIds = new Set(remoteRefs.map((r) => r.id));
            const combined = [...remoteRefs];
            // Include any initial or local references not yet synced
            prev.forEach((item) => {
              if (!remoteIds.has(item.id)) {
                combined.push(item);
              }
            });
            return combined;
          });
        }
      },
      (err) => {
        console.warn('Notice from Firestore subscription:', err);
      }
    );

    return () => {
      unsubAuth();
      unsubFirestore();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Login / Logout handlers
  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        if (isEmailAuthorized(user.email)) {
          showToast(`Sesión iniciada: ${user.email} (Permisos de edición habilitados)`);
          // Automatically sync all marks and models to Firebase on login
          try {
            setIsSyncingFirebase(true);
            const res = await autoSyncAllToFirestore(references);
            setIsSyncingFirebase(false);
            if (res.uploaded > 0) {
              showToast(`✓ Se guardaron automáticamente ${res.uploaded} marcas y modelos en Firebase`);
            }
          } catch (e) {
            setIsSyncingFirebase(false);
            console.error('Error auto-syncing brands on login:', e);
          }
        } else {
          showToast(`Sesión iniciada con ${user.email} (Solo lectura: sin permisos de edición)`);
        }
      }
    } catch (e: unknown) {
      console.error('Login error:', e);
      const err = e as { code?: string; message?: string };
      if (err?.code === 'auth/unauthorized-domain') {
        showToast('Dominio no autorizado en Firebase. Agrega tu dominio de Vercel en la Consola de Firebase.');
      } else if (err?.code === 'auth/popup-blocked') {
        showToast('Ventana emergente bloqueada. Permite las ventanas emergentes en tu navegador.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        showToast('Inicio de sesión cancelado.');
      } else {
        showToast('No se pudo iniciar sesión con Google');
      }
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutUser();
      showToast('Sesión cerrada. Botón de nueva referencia oculto.');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Save reference (Create or Update) in State + Firebase automatically
  const handleSaveReference = async (savedRef: TemperedGlassRef) => {
    if (!isAuthorized) {
      showToast('Solo los correos autorizados (djorgeleal24@gmail.com o ingherseven@gmail.com) pueden guardar referencias.');
      return;
    }
    // Optimistic UI update
    setReferences((prev) => {
      const exists = prev.some((r) => r.id === savedRef.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRef.id ? savedRef : r));
      } else {
        return [savedRef, ...prev];
      }
    });

    showToast(`Guardando ${savedRef.primaryModel} en Firebase automáticamente...`);
    try {
      await saveGlassReferenceToFirestore(savedRef);
      showToast(`✓ ${savedRef.primaryModel} guardado en Firebase automáticamente`);
    } catch (e) {
      console.error('Error saving reference to Firebase:', e);
      showToast(`Guardado localmente (pendiente de sincronización con Firebase)`);
    }
  };

  // Delete reference from State + Firebase
  const handleDeleteReference = async (id: string) => {
    if (!isAuthorized) {
      showToast('Solo los correos autorizados pueden eliminar referencias.');
      return;
    }
    setReferences((prev) => prev.filter((r) => r.id !== id));
    if (selectedReference?.id === id) {
      setSelectedReference(null);
    }
    showToast('Eliminando de Firebase...');
    try {
      await deleteGlassReferenceFromFirestore(id);
      showToast('✓ Referencia eliminada de Firebase');
    } catch (e) {
      console.error('Error deleting reference from Firebase:', e);
    }
  };

  // Duplicate as variant
  const handleDuplicateReference = (ref: TemperedGlassRef) => {
    if (!isAuthorized) {
      showToast('Solo los correos autorizados pueden duplicar o editar fichas.');
      return;
    }
    const duplicated: TemperedGlassRef = {
      ...ref,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    setEditingReference(duplicated);
    setIsFormOpen(true);
  };

  // Manual one-click full database upload/sync to Firebase
  const handleSyncAllToFirebase = async () => {
    if (isSyncingFirebase) return;
    setIsSyncingFirebase(true);
    showToast(`Sincronizando ${references.length} referencias a Firebase...`);
    try {
      const count = await uploadAllToFirestore(references);
      setIsFirebaseConnected(true);
      showToast(`✓ ${count} referencias sincronizadas con éxito en Firebase`);
    } catch (e) {
      console.error('Error syncing all to Firebase:', e);
      showToast('Error al sincronizar con Firebase');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // JSON Export
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(references, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ingherseven_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Base de datos exportada en formato JSON');
  };

  // JSON Import
  const handleImportJson = async (imported: TemperedGlassRef[]) => {
    setReferences(imported);
    showToast(`${imported.length} referencias cargadas localmente. Sincronizando con Firebase...`);
    try {
      await uploadAllToFirestore(imported);
      showToast(`✓ ${imported.length} referencias guardadas en Firebase`);
    } catch (e) {
      console.error('Error uploading imported refs to Firebase:', e);
    }
  };

  // Reset to Factory catalog
  const handleResetFactory = async () => {
    setReferences(INITIAL_GLASS_DATABASE);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Restaurando catálogo de fábrica en Firebase...');
    try {
      await uploadAllToFirestore(INITIAL_GLASS_DATABASE);
      showToast('✓ Catálogo de fábrica restaurado en Firebase');
    } catch (e) {
      console.error('Error restoring factory catalog:', e);
    }
  };

  // Trigger Add Modal with preset model
  const handleAddNewWithModel = (modelName: string) => {
    if (!isAuthorized) {
      showToast('Debes iniciar sesión con djorgeleal24@gmail.com o ingherseven@gmail.com para agregar referencias.');
      return;
    }
    setEditingReference(null);
    setPresetModelForNew(modelName);
    setIsFormOpen(true);
  };

  // Filtering logic
  const filteredReferences = references.filter((item) => {
    // Brand filter
    if (brandFilter !== 'Todas') {
      if (brandFilter === 'Otras') {
        const topBrands = [
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
          'Infinix'
        ];
        if (topBrands.includes(item.brand)) return false;
      } else if (item.brand !== brandFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inPrimary = item.primaryModel.toLowerCase().includes(q);
      const inCompatibles = item.compatibleModels.some((m) => m.toLowerCase().includes(q));
      const inNotes = item.notes?.toLowerCase().includes(q);
      return inPrimary || inCompatibles || inNotes;
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

      {/* Top Bar Contract */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col justify-center text-left leading-none">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white font-mono">
              INGHER<span className="text-cyan-400">SEVEN</span>
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-mono tracking-wider text-cyan-400 font-semibold uppercase mt-0.5 select-none">
              LA TECNOLOGIA A TU ALCANCE
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400 font-mono">
          <a href="#buscador" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Buscador Rápido
          </a>
          <a href="#catalogo" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Catálogo & Matriz
          </a>
          <a href="#estadisticas" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Estadísticas
          </a>
          <a href="#especificaciones" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
            Guía de Uso
          </a>
        </nav>

        {/* Zone 3: Primary Action & Auth Management */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* User Auth Profile or Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 border border-slate-800 px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-mono">
              <div className="relative flex items-center">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || ''} 
                    className="w-5 h-5 rounded-full border border-cyan-400/50" 
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                )}
                {/* Mobile authorized dot indicator on avatar */}
                <span 
                  className={`sm:hidden absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${isAuthorized ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                  title={isAuthorized ? 'Autorizado' : 'No autorizado'}
                />
              </div>

              {/* Email and role badge: hidden on small mobile screens to guarantee room for the Nueva button */}
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[11px] text-white max-w-[100px] sm:max-w-[130px] truncate">
                  {currentUser.email}
                </span>
                <span className={`text-[9px] font-semibold mt-0.5 ${isAuthorized ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isAuthorized ? '● Autorizado' : '○ No autorizado'}
                </span>
              </div>

              <button
                onClick={handleGoogleLogout}
                title="Cerrar sesión"
                className="text-slate-400 hover:text-rose-400 p-0.5 sm:ml-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              title="Iniciar sesión con Google para agregar o modificar referencias"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-mono font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Iniciar Sesión</span>
            </button>
          )}
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
            canAddReference={isAuthorized}
          />
        </section>

        {/* Section: Stats */}
        <section id="estadisticas">
          <StatsBanner references={references} />
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
                Consulta y gestiona cada teléfono y sus modelos compatibles asociados.
              </p>
            </div>
          </div>

          {/* Database Control Bar */}
          <DatabaseControlBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            brandFilter={brandFilter}
            onBrandFilterChange={setBrandFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddNew={() => {
              if (!isAuthorized) {
                showToast('Debes iniciar sesión con un correo autorizado.');
                return;
              }
              setEditingReference(null);
              setPresetModelForNew('');
              setIsFormOpen(true);
            }}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onResetFactory={handleResetFactory}
            isFirebaseConnected={isFirebaseConnected}
            isSyncingFirebase={isSyncingFirebase}
            onSyncAllToFirebase={handleSyncAllToFirebase}
            canAddReference={isAuthorized}
            isLoggedIn={Boolean(currentUser)}
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
                      if (!isAuthorized) {
                        showToast('Solo los correos autorizados pueden editar fichas.');
                        return;
                      }
                      setEditingReference(r);
                      setIsFormOpen(true);
                    }}
                    canEdit={isAuthorized}
                  />
                ))}
              </div>
            ) : (
              <GlassTableView
                references={filteredReferences}
                searchHighlight={searchQuery}
                onSelect={(r) => setSelectedReference(r)}
                onEdit={(r) => {
                  if (!isAuthorized) {
                    showToast('Solo los correos autorizados pueden editar fichas.');
                    return;
                  }
                  setEditingReference(r);
                  setIsFormOpen(true);
                }}
                canEdit={isAuthorized}
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
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* Section: Technical Guide */}
        <section id="especificaciones" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Guía Rápida para Técnicos e Instaladores</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-cyan-300 font-bold block mb-1">Equivalencias Directas</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Teléfonos como iPhone 13, 13 Pro y 14 comparten la misma pantalla frontal, permitiendo usar el mismo protector sin desajustes.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-cyan-300 font-bold block mb-1">Compatibilidad entre Series</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                En Samsung, modelos como Galaxy A14, A13, A04 y A23 son intercambiables para protectores frontales estándar.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-cyan-300 font-bold block mb-1">Búsqueda Instantánea</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Escribe cualquier teléfono en el buscador para ver de inmediato todos los modelos que comparten el mismo protector.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
        <div>
          <span>INGHERSEVEN Database</span>
          <span className="mx-2">·</span>
          <span>Sistema de Referencias & Compatibilidad Móvil</span>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedReference && (
        <GlassDetailModal
          reference={selectedReference}
          onClose={() => setSelectedReference(null)}
          onEdit={(ref) => {
            if (!isAuthorized) {
              showToast('Solo los correos autorizados pueden editar fichas.');
              return;
            }
            setEditingReference(ref);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteReference}
          onDuplicate={handleDuplicateReference}
          canEdit={isAuthorized}
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

      {/* Floating Action Button (FAB) - Sole button for Nueva Referencia */}
      {isAuthorized && (
        <button
          onClick={() => {
            setEditingReference(null);
            setPresetModelForNew('');
            setIsFormOpen(true);
          }}
          className="fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-40 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-2xl shadow-cyan-950/90 border-2 border-cyan-200 cursor-pointer transition-all duration-200 hover:shadow-cyan-400/50 hover:-translate-y-0.5"
          title="Agregar Nueva Referencia"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span>Nueva Referencia</span>
        </button>
      )}
    </div>
  );
}
