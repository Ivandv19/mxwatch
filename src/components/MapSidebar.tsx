"use client";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
    useSearchQuery,
    useSelectedCartel,
    useSelectedState,
    useLiveStateData,
    useMapActions
} from "@/store/mapStore";
import { getStateIntelligence, getAllCartelsBasic } from "@/actions/mapData";
import type { LiveStateIntelligence } from "@/types/api.types";

/**
 * Constantes de Interfaz
 */
const CARTEL_ITEM_HEIGHT = 48; // Altura base para cálculos de layout

// --- Componentes de Micro-Interacción (Iconos y Helpers) ---

const SearchIcon = () => (
    <svg className="w-4 h-4 text-[#5e6c8b] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ClearButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5e6c8b] hover:text-[#f0f4ff] transition-colors p-0.5"
        aria-label="Limpiar búsqueda"
    >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);

const CheckIcon = ({ color }: { color: string }) => (
    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

/**
 * Tooltip informativo ligero para aclaraciones rápidas en la UI.
 */
const InfoTooltip = ({ content }: { content: string }) => (
    <div className="group relative inline-block ml-1">
        <span className="text-[#5e6c8b] cursor-help text-xs">ⓘ</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0f1520] border border-white/10 rounded-lg text-[10px] text-[#8b98b8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {content}
        </div>
    </div>
);

/**
 * Alerta de error estilizada para el flujo de datos del sidebar.
 */
const ErrorAlert = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center mx-4"
    >
        <span className="text-xs text-red-400">⚠️ {message}</span>
        {onRetry && (
            <button
                onClick={onRetry}
                className="block mx-auto mt-2 text-xs text-accent hover:text-accent-hover transition-colors"
            >
                Reintentar
            </button>
        )}
    </motion.div>
);

/**
 * Componente MapSidebar: El panel lateral de inteligencia.
 * Gestiona la selección de estados, filtrado de cárteles y la persitencia
 * del estado de la aplicación mediante la URL (Search Params).
 */
export default function MapSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- Hooks de Estado Global (Zustand) ---
    const searchQuery = useSearchQuery();
    const selectedCartel = useSelectedCartel();
    const selectedState = useSelectedState();
    const liveStateData = useLiveStateData();
    const { setSearchQuery, toggleCartel, setSelectedState } = useMapActions();

    // --- Hooks de Estado Local (Inteligencia Específica) ---
    const [stateIntelligence, setStateIntelligence] = useState<LiveStateIntelligence | null>(null);
    const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
    const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
    const [allCartels, setAllCartels] = useState<any[]>([]);
    const [cartelsError, setCartelsError] = useState<string | null>(null);

    /**
     * EFECTO: Persistencia en URL (Lectura)
     * Sincroniza el estado del store con los parámetros de la URL al montar.
     */
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const urlCartel = params.get('cartel');
        const urlSearch = params.get('search');
        const urlState = params.get('state');

        if (urlCartel && !selectedCartel) toggleCartel(urlCartel);
        if (urlSearch && !searchQuery) setSearchQuery(urlSearch);
        if (urlState && !selectedState) setSelectedState(urlState);
    }, []); 

    /**
     * EFECTO: Persistencia en URL (Escritura)
     * Actualiza la URL cada vez que el usuario interactúa con el mapa o filtros.
     */
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCartel) params.set('cartel', selectedCartel);
        if (searchQuery) params.set('search', searchQuery);
        if (selectedState) params.set('state', selectedState);

        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
    }, [selectedCartel, searchQuery, selectedState, router]);

    /**
     * EFECTO: Atajos de Teclado (Foco y Navegación)
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;

            switch (e.key) {
                case 'Escape':
                    if (selectedState) setSelectedState(null);
                    else if (searchQuery) setSearchQuery('');
                    break;
                case 'f':
                case 'F':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
                    }
                    break;
                case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
                    // Selección rápida de cárteles mediante Alt + [Numero]
                    if (e.altKey && allCartels.length > 0) {
                        const index = parseInt(e.key) - 1;
                        if (allCartels[index]) {
                            toggleCartel(allCartels[index].slug || allCartels[index].id);
                        }
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedState, searchQuery, allCartels, setSelectedState, setSearchQuery, toggleCartel]);

    /**
     * EFECTO: Carga de Listado Maestro de Cárteles
     */
    useEffect(() => {
        getAllCartelsBasic()
            .then(data => {
                setAllCartels(data);
                setCartelsError(null);
            })
            .catch(err => {
                console.error("Error loading cartels:", err);
                setCartelsError("Fallo al cargar listado de cárteles");
            });
    }, []);

    /**
     * EFECTO: Carga de Inteligencia Detallada por Estado
     * Se dispara automáticamente al seleccionar un estado en el mapa.
     */
    useEffect(() => {
        if (!selectedState) {
            setStateIntelligence(null);
            setIntelligenceError(null);
            return;
        }

        setIsLoadingIntelligence(true);
        setIntelligenceError(null);

        getStateIntelligence(selectedState)
            .then(data => {
                if (!data) {
                    setIntelligenceError("No hay datos de inteligencia para este estado");
                    return;
                }
                setStateIntelligence(data);
                setIntelligenceError(null);
            })
            .catch(err => {
                console.error("Error loading intelligence:", err);
                setIntelligenceError("Error al conectar con la central de inteligencia");
            })
            .finally(() => setIsLoadingIntelligence(false));
    }, [selectedState]);

    /**
     * Cálculos Memoizados para Optimización de UI
     */
    const stateCountByCartel = useMemo(() => {
        // Conteo de presencia territorial por cada cártel
        return liveStateData.reduce<Record<string, number>>((acc, stateInfo) => {
            stateInfo.cartels.forEach((c: any) => {
                acc[c.slug] = (acc[c.slug] ?? 0) + 1;
                acc[c.id] = (acc[c.id] ?? 0) + 1;
            });
            return acc;
        }, {});
    }, [liveStateData]);

    const primaryColor = useMemo(
        () => stateIntelligence && stateIntelligence.cartels.length > 0 ? stateIntelligence.cartels[0].color : null,
        [stateIntelligence]
    );

    const filteredCartels = useMemo(() => {
        if (!searchQuery) return allCartels;
        return allCartels.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allCartels, searchQuery]);

    // --- Handlers de Interacción ---

    const handleRetryCartels = useCallback(() => {
        setCartelsError(null);
        getAllCartelsBasic().then(setAllCartels).catch(() => setCartelsError("Fallo al reintentar"));
    }, []);

    const handleRetryIntelligence = useCallback(() => {
        if (!selectedState) return;
        setIsLoadingIntelligence(true);
        setIntelligenceError(null);
        getStateIntelligence(selectedState).then(setStateIntelligence).catch(() => setIntelligenceError("Fallo al reintentar"))
            .finally(() => setIsLoadingIntelligence(false));
    }, [selectedState]);

    return (
        <aside className="w-full h-[40%] md:h-full md:w-[380px] bg-[#0f1520] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-10 shadow-2xl">
            
            {/* Sección: Buscador Superior */}
            <div className="p-3 md:p-4 border-b border-white/10 bg-[#080c12]/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                    <h2 className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-[#f0f4ff]">
                        Centro de Análisis
                    </h2>
                    <InfoTooltip content="Atajos: Foco (Ctrl+F), ESC limpiar, Alt+1-9 selección rápida" />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar estado o cártel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#161d2b] border border-white/20 rounded-lg pl-10 pr-10 py-2 text-sm text-[#f0f4ff] placeholder:text-[#5e6c8b] focus:outline-none focus:border-accent transition-colors"
                    />
                    <SearchIcon />
                    {searchQuery && <ClearButton onClick={() => setSearchQuery("")} />}
                </div>
            </div>

            {/* Area de Contenido Scrolleable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="flex border-b border-white/5 bg-[#0f1520] sticky top-0 z-10">
                    <button className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-accent border-b-2 border-accent bg-accent/10">
                        Cárteles
                    </button>
                    <button disabled className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-[#5e6c8b] opacity-30 cursor-not-allowed">
                        Incidentes
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-6">
                    {/* Visualización de Inteligencia del Estado Seleccionado */}
                    <AnimatePresence mode="wait">
                        {selectedState && (
                            <motion.div
                                key={selectedState}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {isLoadingIntelligence ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                                        <span className="text-xs text-[#8b98b8] font-mono uppercase tracking-[0.2em]">Leyendo expediente...</span>
                                    </div>
                                ) : intelligenceError ? (
                                    <ErrorAlert message={intelligenceError} onRetry={handleRetryIntelligence} />
                                ) : stateIntelligence ? (
                                    <SelectedStatePanel
                                        selectedState={selectedState}
                                        stateIntelligence={stateIntelligence}
                                        primaryColor={primaryColor}
                                        onClear={() => setSelectedState(null)}
                                    />
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Widgets de Estadísticas Rápidas */}
                    <QuickStats stateCount={liveStateData.length} cartelsCount={allCartels.length} />

                    {/* Leyenda y Filtros de Cárteles */}
                    {cartelsError ? (
                        <ErrorAlert message={cartelsError} onRetry={handleRetryCartels} />
                    ) : (
                        <CartelLegend
                            cartels={filteredCartels}
                            selectedCartel={selectedCartel}
                            onToggleCartel={toggleCartel}
                            stateCountByCartel={stateCountByCartel}
                        />
                    )}
                </div>
            </div>

            <SidebarFooter />
        </aside>
    );
}

/**
 * Panel de detalles del estado seleccionado.
 */
const SelectedStatePanel = React.memo(({
    selectedState,
    stateIntelligence,
    primaryColor,
    onClear
}: any) => (
    <div
        className="rounded-xl border p-4 flex flex-col gap-3 transition-all"
        style={{
            borderColor: primaryColor ? `${primaryColor}40` : "rgba(255,255,255,0.1)",
            backgroundColor: primaryColor ? `${primaryColor}10` : "rgba(255,255,255,0.03)",
        }}
    >
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5e6c8b]">Estado seleccionado</span>
            <button onClick={onClear} className="text-[#5e6c8b] hover:text-[#f0f4ff] text-xs">✕</button>
        </div>
        <span className="text-base font-bold text-[#f0f4ff]">{selectedState}</span>

        <div className="flex flex-col gap-6">
            {stateIntelligence.cartels.length > 1 && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg text-center">
                    <span className="text-xs font-bold text-orange-400 uppercase">Zona en Disputa Táctica</span>
                </div>
            )}
            {stateIntelligence.cartels.map((cartelInfo: any, idx: number) => (
                <CartelDetail key={cartelInfo.id} cartel={cartelInfo} index={idx} isDisputed={stateIntelligence.cartels.length > 1} />
            ))}
        </div>
    </div>
));

SelectedStatePanel.displayName = 'SelectedStatePanel';

/**
 * Visualización granular de un cártel en el sidebar.
 */
const CartelDetail = React.memo(({ cartel, index, isDisputed }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
        className={`flex flex-col gap-3 ${index > 0 ? "pt-6 border-t border-white/10 relative" : ""}`}
    >
        {index > 0 && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f1520] px-2 text-[8px] text-[#5e6c8b] uppercase font-bold">Resistencia / Contraparte</div>}
        
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cartel.color }} />
            <span className="text-sm font-medium" style={{ color: cartel.color }}>{cartel.name}</span>
        </div>

        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-black uppercase bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/30">
                    {cartel.localIntelligenceNote || "Operativo Activo"}
                </span>
                {cartel.foreignDesignation && (
                    <span className="text-[9px] font-black uppercase bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-500/30">{cartel.foreignDesignation}</span>
                )}
            </div>

            {/* Sección: Líderes y Facciones */}
            {cartel.leaders?.length > 0 && (
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">Cadena de Mando Regional</span>
                    {cartel.leaders.map((l: any, i: number) => (
                        <span key={i} className="text-xs text-[#f0f4ff] font-medium">{l.name} {l.alias ? `("${l.alias}")` : ''}</span>
                    ))}
                </div>
            )}

            {cartel.factions?.length > 0 && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">Facciones Operativas</span>
                    {cartel.factions.map((f: any, i: number) => (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-accent" />
                            <span className="text-xs font-bold text-[#f0f4ff]">{f.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </motion.div>
));

CartelDetail.displayName = 'CartelDetail';

/**
 * Contadores rápidos de la base de datos.
 */
const QuickStats = React.memo(({ stateCount, cartelsCount }: any) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4">
            <span className="text-[10px] uppercase font-bold text-[#5e6c8b] mb-1">Cárteles</span>
            <span className="text-2xl font-black text-[#f0f4ff]">{cartelsCount}</span>
        </div>
        <div className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4">
            <span className="text-[10px] uppercase font-bold text-[#5e6c8b] mb-1">Documentados</span>
            <span className="text-2xl font-black text-[#f0f4ff]">{stateCount}</span>
        </div>
    </div>
));

QuickStats.displayName = 'QuickStats';

/**
 * Leyenda interactiva de cárteles con indicadores de cobertura territorial.
 */
const CartelLegend = React.memo(({ cartels, selectedCartel, onToggleCartel, stateCountByCartel }: any) => {
    if (cartels.length === 0) return <div className="text-center py-8 text-[#5e6c8b] text-xs">Sin resultados en el sector</div>;

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase text-[#8b98b8] tracking-wider flex items-center gap-2">
                Despliegue Territorial
                {selectedCartel && <button onClick={() => onToggleCartel(selectedCartel)} className="ml-auto text-[9px] text-accent font-medium">Limpiar ×</button>}
            </h3>

            <div className="flex flex-col gap-1.5">
                {cartels.map((cartel: any) => {
                    const isSelected = selectedCartel === cartel.id || selectedCartel === cartel.slug;
                    const count = (stateCountByCartel[cartel.slug] ?? 0) || (stateCountByCartel[cartel.id] ?? 0);
                    return (
                        <button
                            key={cartel.id}
                            onClick={() => onToggleCartel(cartel.slug || cartel.id)}
                            className={`flex items-center gap-3 p-2 rounded-md transition-all text-left w-full group
                                ${isSelected ? "bg-[#1c2636] border border-accent/30" : "hover:bg-[#161d2b] border border-transparent"}
                                ${selectedCartel && !isSelected ? "opacity-30" : "opacity-100"}
                            `}
                        >
                            <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: cartel.color }} />
                            <span className="text-sm font-medium flex-1 truncate text-[#f0f4ff]">{cartel.name}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${cartel.color}25`, color: cartel.color }}>{count}</span>
                            {isSelected && <CheckIcon color={cartel.color} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

CartelLegend.displayName = 'CartelLegend';

/**
 * Pie de firma del analista de datos.
 */
const SidebarFooter = React.memo(() => (
    <div className="p-4 border-t border-white/5 mt-auto flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-medium">Actualizado: Marzo 2026</span>
        <span className="text-[9px] text-[#5e6c8b] uppercase tracking-widest opacity-40">Intelligence System v1.4.2</span>
    </div>
));

SidebarFooter.displayName = 'SidebarFooter';