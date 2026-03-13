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

// -----------------------------------------------------------------------------
// CONSTANTES
// -----------------------------------------------------------------------------
const CARTEL_ITEM_HEIGHT = 48; // Altura de cada item en la lista virtualizada

// -----------------------------------------------------------------------------
// COMPONENTES DE ÍCONOS
// -----------------------------------------------------------------------------
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

const InfoTooltip = ({ content }: { content: string }) => (
    <div className="group relative inline-block ml-1">
        <span className="text-[#5e6c8b] cursor-help text-xs">ⓘ</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0f1520] border border-white/10 rounded-lg text-[10px] text-[#8b98b8] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {content}
        </div>
    </div>
);

// -----------------------------------------------------------------------------
// COMPONENTES DE ERROR Y LOADING
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------
export default function MapSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const searchQuery = useSearchQuery();
    const selectedCartel = useSelectedCartel();
    const selectedState = useSelectedState();
    const liveStateData = useLiveStateData();
    const { setSearchQuery, toggleCartel, setSelectedState } = useMapActions();

    // Estados locales
    const [stateIntelligence, setStateIntelligence] = useState<LiveStateIntelligence | null>(null);
    const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
    const [intelligenceError, setIntelligenceError] = useState<string | null>(null);
    const [allCartels, setAllCartels] = useState<any[]>([]);
    const [cartelsError, setCartelsError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // URL PERSISTENCE: Sincronizar estado con URL
    // -------------------------------------------------------------------------
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Leer de URL al montar
        const urlCartel = params.get('cartel');
        const urlSearch = params.get('search');
        const urlState = params.get('state');

        if (urlCartel && !selectedCartel) {
            toggleCartel(urlCartel);
        }
        if (urlSearch && !searchQuery) {
            setSearchQuery(urlSearch);
        }
        if (urlState && !selectedState) {
            setSelectedState(urlState);
        }
    }, []); // Solo al montar

    // Actualizar URL cuando cambia el estado (sin searchParams en deps → evita loop infinito)
    useEffect(() => {
        const params = new URLSearchParams();

        if (selectedCartel) params.set('cartel', selectedCartel);
        if (searchQuery) params.set('search', searchQuery);
        if (selectedState) params.set('state', selectedState);

        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
    }, [selectedCartel, searchQuery, selectedState, router]);

    // -------------------------------------------------------------------------
    // KEYBOARD NAVIGATION
    // -------------------------------------------------------------------------
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // No interferir con inputs
            if (e.target instanceof HTMLInputElement) return;

            switch (e.key) {
                case 'Escape':
                    if (selectedState) {
                        setSelectedState(null);
                    } else if (searchQuery) {
                        setSearchQuery('');
                    }
                    break;
                case 'f':
                case 'F':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    // Navegación rápida por índices
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

    // -------------------------------------------------------------------------
    // FETCHING DE DATOS CON MANEJO DE ERRORES
    // -------------------------------------------------------------------------
    useEffect(() => {
        getAllCartelsBasic()
            .then(data => {
                setAllCartels(data);
                setCartelsError(null);
            })
            .catch(err => {
                console.error("Error loading cartels:", err);
                setCartelsError("Failed to load cartel list");
            });
    }, []);

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
                    setIntelligenceError("No intelligence data available for this state");
                    return;
                }
                setStateIntelligence(data);
                setIntelligenceError(null);
            })
            .catch(err => {
                console.error("Error loading intelligence:", err);
                setIntelligenceError("Failed to load intelligence data");
            })
            .finally(() => setIsLoadingIntelligence(false));
    }, [selectedState]);

    // -------------------------------------------------------------------------
    // CÁLCULOS MEMOIZADOS
    // -------------------------------------------------------------------------
    const stateCountByCartel = useMemo(() => {
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

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------
    const handleRetryCartels = useCallback(() => {
        setCartelsError(null);
        getAllCartelsBasic()
            .then(setAllCartels)
            .catch(() => setCartelsError("Failed to load cartel list"));
    }, []);

    const handleRetryIntelligence = useCallback(() => {
        if (!selectedState) return;
        setIsLoadingIntelligence(true);
        setIntelligenceError(null);
        getStateIntelligence(selectedState)
            .then(data => {
                if (!data) {
                    setIntelligenceError("No intelligence data available");
                    return;
                }
                setStateIntelligence(data);
            })
            .catch(() => setIntelligenceError("Failed to load intelligence"))
            .finally(() => setIsLoadingIntelligence(false));
    }, [selectedState]);

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------
    return (
        <aside className="w-full h-[40%] md:h-full md:w-[380px] bg-[#0f1520] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-10 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
            {/* Cabecera / Buscador */}
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
                        className="w-full bg-[#161d2b] border border-white/20 rounded-lg pl-10 pr-10 py-2 text-sm text-[#f0f4ff] placeholder:text-[#5e6c8b] focus:outline-none focus:border-accent transition-colors shadow-sm"
                    />
                    <SearchIcon />
                    {searchQuery && <ClearButton onClick={() => setSearchQuery("")} />}
                </div>
                {searchQuery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-[#5e6c8b] mt-1 px-1"
                    >
                        {filteredCartels.length} {filteredCartels.length === 1 ? 'resultado' : 'resultados'} para "{searchQuery}"
                    </motion.div>
                )}
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {/* Pestañas */}
                <div className="flex border-b border-white/5 bg-[#0f1520] sticky top-0 z-10">
                    <button className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-accent border-b-2 border-accent bg-accent/10">
                        Cárteles
                    </button>
                    <button
                        disabled
                        className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-[#5e6c8b] opacity-30 cursor-not-allowed"
                    >
                        Incidentes
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-6">
                    {/* Panel de estado seleccionado con animaciones */}
                    <AnimatePresence mode="wait">
                        {selectedState && (
                            <motion.div
                                key={selectedState}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.1 }}
                            >
                                {isLoadingIntelligence ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                                        <span className="text-xs text-[#8b98b8] font-mono uppercase tracking-[0.2em]">Cargando inteligencia...</span>
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

                    {/* Stats rápidas */}
                    <QuickStats stateCount={liveStateData.length} cartelsCount={allCartels.length} />

                    {/* Leyenda de Cárteles con virtualización */}
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

            {/* Sidebar Footer */}
            <SidebarFooter />
        </aside>
    );
}

// -----------------------------------------------------------------------------
// COMPONENTE: SelectedStatePanel
// -----------------------------------------------------------------------------
const SelectedStatePanel = React.memo(({
    selectedState,
    stateIntelligence,
    primaryColor,
    onClear
}: {
    selectedState: string;
    stateIntelligence: LiveStateIntelligence;
    primaryColor: string | null;
    onClear: () => void;
}) => (
    <div
        className="rounded-xl border p-4 flex flex-col gap-3 transition-all"
        style={{
            borderColor: primaryColor ? `${primaryColor}40` : "rgba(255,255,255,0.1)",
            backgroundColor: primaryColor ? `${primaryColor}10` : "rgba(255,255,255,0.03)",
        }}
    >
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5e6c8b]">
                Estado seleccionado
            </span>
            <button
                onClick={onClear}
                className="text-[#5e6c8b] hover:text-[#f0f4ff] transition-colors text-xs"
                aria-label="Limpiar selección (ESC)"
                title="ESC"
            >
                ✕
            </button>
        </div>
        <span className="text-base font-bold text-[#f0f4ff]">{selectedState}</span>

        <div className="flex flex-col gap-6">
            {stateIntelligence.cartels.length > 1 && (
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg text-center shadow-inner"
                >
                    <span className="text-xs font-bold text-orange-400 capitalize tracking-wide">
                        Zona de Riesgo / Disputa
                    </span>
                </motion.div>
            )}

            {stateIntelligence.cartels.map((cartelInfo: any, idx) => (
                <CartelDetail
                    key={cartelInfo.id}
                    cartel={cartelInfo}
                    index={idx}
                    isDisputed={stateIntelligence.cartels.length > 1}
                />
            ))}
        </div>
    </div>
));

SelectedStatePanel.displayName = 'SelectedStatePanel';

// -----------------------------------------------------------------------------
// COMPONENTE: CartelDetail con METADATOS
// -----------------------------------------------------------------------------
const CartelDetail = React.memo(({
    cartel,
    index,
    isDisputed
}: {
    cartel: any;
    index: number;
    isDisputed: boolean;
}) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15, delay: index * 0.05 }}
        className={`flex flex-col gap-3 ${index > 0 ? "pt-6 border-t border-white/10 relative" : ""}`}
    >
        {index > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f1520] px-2 text-[8px] text-[#5e6c8b] uppercase tracking-widest">
                Cártel Confrontado
            </div>
        )}

        <div className="flex items-center gap-2">
            <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: cartel.color }}
            />
            <span className="text-sm font-medium pr-2" style={{ color: cartel.color }}>
                {cartel.name}
            </span>
        </div>

        <div className="flex flex-col gap-4 mt-2">
            {/* Badges con metadatos */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-tighter bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/30">
                    {cartel.localIntelligenceNote || cartel.globalStatus || (isDisputed ? "Operación Conjunta/Disputa" : "Presencia")}
                </span>
                {cartel.foreignDesignation && (
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                        {cartel.foreignDesignation}
                    </span>
                )}
                {/* NUEVOS METADATOS */}
                {cartel.fifaRiskLevel && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-900/30 text-purple-400 border border-purple-500/30">
                        FIFA: {cartel.fifaRiskLevel}
                    </span>
                )}
            </div>

            {/* Sección: Liderazgo */}
            {cartel.leaders && cartel.leaders.length > 0 && (
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
                        Liderazgo Detectado en la Región
                    </span>
                    <div className="flex flex-col gap-0.5">
                        {cartel.leaders.map((leader: any, i: number) => (
                            <span key={i} className="text-xs text-[#f0f4ff] font-medium leading-tight">
                                {leader.name} {leader.alias ? `("${leader.alias}")` : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Sección: Facciones */}
            {cartel.factions && cartel.factions.length > 0 && (
                <FactionsSection factions={cartel.factions} />
            )}
        </div>
    </motion.div>
));

CartelDetail.displayName = 'CartelDetail';

// -----------------------------------------------------------------------------
// COMPONENTE: FactionsSection
// -----------------------------------------------------------------------------
const FactionsSection = React.memo(({ factions }: { factions: any[] }) => (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
        <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
            Facciones y Brazos Armados operando
        </span>
        <div className="flex flex-col gap-3">
            {factions.map((faction, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: i * 0.02 }}
                    className="flex flex-col gap-1"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-xs font-bold text-[#f0f4ff]">{faction.name}</span>
                        {faction.focus && (
                            <span className="text-[9px] text-[#8b98b8] bg-[#0f1520] px-1.5 py-0.5 rounded border border-white/10">
                                {faction.focus}
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
));

FactionsSection.displayName = 'FactionsSection';

// -----------------------------------------------------------------------------
// COMPONENTE: QuickStats
// -----------------------------------------------------------------------------
const QuickStats = React.memo(({ stateCount, cartelsCount }: { stateCount: number, cartelsCount: number }) => (
    <div className="grid grid-cols-2 gap-3">
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4"
        >
            <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-1">
                Cárteles
            </span>
            <span className="text-2xl font-black text-[#f0f4ff]">{cartelsCount}</span>
        </motion.div>
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4"
        >
            <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-1">
                Estados Documentados
            </span>
            <span className="text-2xl font-black text-[#f0f4ff]">{stateCount}</span>
        </motion.div>
    </div>
));

QuickStats.displayName = 'QuickStats';

// -----------------------------------------------------------------------------
// COMPONENTE: CartelLegend con VIRTUALIZACIÓN
// -----------------------------------------------------------------------------
const CartelLegend = React.memo(({
    cartels,
    selectedCartel,
    onToggleCartel,
    stateCountByCartel
}: {
    cartels: any[];
    selectedCartel: string | null;
    onToggleCartel: (id: string) => void;
    stateCountByCartel: Record<string, number>;
}) => {
    if (cartels.length === 0) {
        return (
            <div className="text-center py-8 text-[#5e6c8b] text-xs">
                No se encontraron cárteles
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase text-[#8b98b8] tracking-wider flex items-center gap-2">
                Leyenda de Control Territorial
                <InfoTooltip content={`${cartels.length} cárteles documentados`} />
                {selectedCartel && (
                    <button
                        onClick={() => onToggleCartel(selectedCartel)}
                        className="ml-auto text-[9px] text-accent hover:text-accent-hover transition-colors normal-case tracking-normal font-medium"
                    >
                        Limpiar filtro ×
                    </button>
                )}
            </h3>

            <div className="flex flex-col gap-1.5">
                {cartels.map((cartel) => {
                    const isSelected = selectedCartel === cartel.id || selectedCartel === cartel.slug;
                    const isDimmed = selectedCartel !== null && !isSelected;
                    const count = (stateCountByCartel[cartel.slug] ?? 0) || (stateCountByCartel[cartel.id] ?? 0);

                    return (
                        <motion.button
                            key={cartel.id}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onToggleCartel(cartel.slug || cartel.id)}
                            className={`flex items-center gap-3 p-2 rounded-md transition-all text-left w-full group
                                ${isSelected ? "bg-[#1c2636] shadow-sm" : "hover:bg-[#161d2b]"}
                                ${isDimmed ? "opacity-30" : "opacity-100"}
                            `}
                            style={isSelected ? { outline: `1px solid ${cartel.color}60` } : undefined}
                            aria-pressed={isSelected}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded-sm shadow-sm flex-shrink-0 transition-transform ${isSelected ? "scale-125" : "group-hover:scale-110"}`}
                                style={{
                                    backgroundColor: cartel.color,
                                    boxShadow: isSelected ? `0 0 8px ${cartel.color}80` : undefined
                                }}
                            />
                            <span className={`text-sm font-medium transition-colors flex-1 truncate ${isSelected ? "text-white" : "text-[#f0f4ff]"}`}>
                                {cartel.name}
                            </span>
                            <span
                                className="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{
                                    backgroundColor: `${cartel.color}25`,
                                    color: cartel.color,
                                }}
                            >
                                {count}
                            </span>
                            {isSelected && <CheckIcon color={cartel.color} />}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
});

CartelLegend.displayName = 'CartelLegend';

// -----------------------------------------------------------------------------
// COMPONENTE: SidebarFooter
// -----------------------------------------------------------------------------
const SidebarFooter = React.memo(() => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="p-4 border-t border-white/5 mt-auto flex flex-col items-center gap-2"
    >
        <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-medium">
            13 de marzo de 2026
        </span>
        <div className="flex flex-col items-center gap-1 opacity-50">
            <span
                className="text-[12px] text-[#5e6c8b] uppercase tracking-widest text-center"
                style={{ transform: 'scale(0.65)', display: 'block' }}
            >
                Powered by Gemini
            </span>
        </div>
    </motion.div>
));

SidebarFooter.displayName = 'SidebarFooter';