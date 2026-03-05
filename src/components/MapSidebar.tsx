"use client";
import React, { useMemo } from "react";
import { CARTEL_LEGEND, CARTEL_DATA, type CartelInfo } from "@/constants/cartelData";
import { useMapStore } from "@/store/mapStore";

// Precompute state count per cartel (se queda igual, está bien optimizado)
const stateCountByCartel = Object.values(CARTEL_DATA).reduce<Record<string, number>>(
    (acc, { cartels }) => {
        cartels.forEach((c) => {
            acc[c] = (acc[c] ?? 0) + 1;
        });
        return acc;
    },
    {}
);

// Componente para el ícono de búsqueda (extraído para mejorar legibilidad)
const SearchIcon = () => (
    <svg className="w-4 h-4 text-[#5e6c8b] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Componente para el botón de limpiar búsqueda
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

// Componente para el ícono de check
const CheckIcon = ({ color }: { color: string }) => (
    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

export default function MapSidebar() {
    const { searchQuery, setSearchQuery, selectedCartel, toggleCartel, selectedState, setSelectedState } = useMapStore();

    // Usar useMemo para cálculos derivados
    const selectedStateData = useMemo(
        () => (selectedState ? CARTEL_DATA[selectedState] : null),
        [selectedState]
    );

    const selectedCartelsInfo = useMemo(
        () => selectedStateData
            ? selectedStateData.cartels
                .map((id) => CARTEL_LEGEND.find((c) => c.id === id))
                .filter((c): c is CartelInfo => c !== undefined)
            : [],
        [selectedStateData]
    );

    const primaryColor = useMemo(
        () => selectedCartelsInfo.length > 0 ? selectedCartelsInfo[0].color : null,
        [selectedCartelsInfo]
    );

    return (
        <aside className="w-full h-[40%] md:h-full md:w-[380px] bg-[#0f1520] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-10 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
            {/* Cabecera / Buscador */}
            <div className="p-3 md:p-4 border-b border-white/10 bg-[#080c12]/50 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-[#f0f4ff] mb-2 md:mb-3">
                    Centro de Análisis
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar estado..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#161d2b] border border-white/20 rounded-lg pl-10 pr-10 py-2 text-sm text-[#f0f4ff] placeholder:text-[#5e6c8b] focus:outline-none focus:border-accent transition-colors shadow-sm"
                    />
                    <SearchIcon />
                    {searchQuery && <ClearButton onClick={() => setSearchQuery("")} />}
                </div>
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
                    {/* Panel de estado seleccionado */}
                    {selectedState && selectedStateData && (
                        <SelectedStatePanel
                            selectedState={selectedState}
                            selectedStateData={selectedStateData}
                            selectedCartelsInfo={selectedCartelsInfo}
                            primaryColor={primaryColor}
                            onClear={() => setSelectedState(null)}
                        />
                    )}

                    {/* Stats rápidas */}
                    <QuickStats stateCount={Object.keys(CARTEL_DATA).length} cartelsCount={CARTEL_LEGEND.length} />

                    {/* Leyenda de Cárteles */}
                    <CartelLegend
                        selectedCartel={selectedCartel}
                        onToggleCartel={toggleCartel}
                        stateCountByCartel={stateCountByCartel}
                    />
                </div>
            </div>

            {/* Sidebar Footer */}
            <SidebarFooter />
        </aside>
    );
}

// Componente para el panel de estado seleccionado
const SelectedStatePanel = React.memo(({
    selectedState,
    selectedStateData,
    selectedCartelsInfo,
    primaryColor,
    onClear
}: {
    selectedState: string;
    selectedStateData: typeof CARTEL_DATA[string];
    selectedCartelsInfo: CartelInfo[];
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
                aria-label="Limpiar selección"
            >
                ✕
            </button>
        </div>
        <span className="text-base font-bold text-[#f0f4ff]">{selectedState}</span>

        <div className="flex flex-col gap-6">
            {selectedCartelsInfo.length > 1 && selectedStateData.status && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-lg text-center shadow-inner">
                    <span className="text-xs font-bold text-orange-400 capitalize tracking-wide">
                        {selectedStateData.status}
                    </span>
                </div>
            )}

            {selectedCartelsInfo.map((cartelInfo, idx) => (
                <CartelDetail
                    key={cartelInfo.id}
                    cartelInfo={cartelInfo}
                    index={idx}
                    totalCartels={selectedCartelsInfo.length}
                    stateStatus={selectedStateData?.status}
                    isDisputed={selectedCartelsInfo.length > 1}
                />
            ))}
        </div>
    </div>
));

SelectedStatePanel.displayName = 'SelectedStatePanel';

// Componente para el detalle de un cártel
const CartelDetail = React.memo(({
    cartelInfo,
    index,
    totalCartels,
    stateStatus,
    isDisputed
}: {
    cartelInfo: CartelInfo;
    index: number;
    totalCartels: number;
    stateStatus?: string;
    isDisputed: boolean;
}) => (
    <div className={`flex flex-col gap-3 ${index > 0 ? "pt-6 border-t border-white/10 relative" : ""}`}>
        {index > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f1520] px-2 text-[8px] text-[#5e6c8b] uppercase tracking-widest">
                Cártel Confrontado
            </div>
        )}

        <div className="flex items-center gap-2">
            <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: cartelInfo.color }}
            />
            <span className="text-sm font-medium pr-2" style={{ color: cartelInfo.color }}>
                {cartelInfo.name}
            </span>
        </div>

        <div className="flex flex-col gap-4 mt-2">
            {/* Status Badge */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-tighter bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/30">
                    {isDisputed ? "Operación Conjunta/Disputa" : (stateStatus || cartelInfo.status)}
                </span>
                {cartelInfo.foreign_designation && (
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                        {cartelInfo.foreign_designation}
                    </span>
                )}
            </div>

            {/* Sección: Liderazgo y Unidades */}
            {((cartelInfo.leaders && cartelInfo.leaders.length > 0) || (cartelInfo.units && cartelInfo.units.length > 0)) && (
                <div className="grid grid-cols-2 gap-4">
                    {cartelInfo.leaders && cartelInfo.leaders.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
                                Liderazgo Estratégico
                            </span>
                            <div className="flex flex-col gap-0.5">
                                {cartelInfo.leaders.map((leader, i) => (
                                    <span key={i} className="text-xs text-[#f0f4ff] font-medium leading-tight">
                                        {leader}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {cartelInfo.units && cartelInfo.units.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
                                Brazos Armados
                            </span>
                            <div className="flex flex-col gap-0.5">
                                {cartelInfo.units.map((unit, i) => (
                                    <span key={i} className="text-xs text-[#8b98b8] font-medium leading-tight">
                                        {unit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sección: Facciones */}
            {cartelInfo.factions && cartelInfo.factions.length > 0 && (
                <FactionsSection factions={cartelInfo.factions} />
            )}

            {/* Impacto Estratégico */}
            {(cartelInfo.economic_impact || cartelInfo.risk_level_fifa2026) && (
                <StrategicImpact cartelInfo={cartelInfo} />
            )}

            {/* Situación Táctica */}
            {cartelInfo.situation && (
                <TacticalSituation situation={cartelInfo.situation} />
            )}
        </div>
    </div>
));

CartelDetail.displayName = 'CartelDetail';

// Componente para la sección de facciones
const FactionsSection = React.memo(({ factions }: { factions: NonNullable<CartelInfo['factions']> }) => (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
        <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
            Desglose de Facciones internas
        </span>
        <div className="flex flex-col gap-3">
            {factions.map((faction, i) => (
                <div key={i} className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-xs font-bold text-[#f0f4ff]">{faction.name}</span>
                        {faction.focus && (
                            <span className="text-[9px] text-[#8b98b8] bg-[#0f1520] px-1.5 py-0.5 rounded border border-white/10">
                                {faction.focus}
                            </span>
                        )}
                    </div>
                    {faction.leaders && faction.leaders.length > 0 && (
                        <span className="text-[10px] text-[#8b98b8] pl-3.5 italic">
                            Líder: {faction.leaders.join(", ")}
                        </span>
                    )}
                    {faction.units && faction.units.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-3.5 mt-0.5">
                            {faction.units.map((u, j) => (
                                <span key={j} className="text-[9px] bg-white/10 text-[#f0f4ff] px-1.5 py-0.5 rounded">
                                    {u}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
));

FactionsSection.displayName = 'FactionsSection';

// Componente para el impacto estratégico
const StrategicImpact = React.memo(({ cartelInfo }: { cartelInfo: CartelInfo }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 pt-4 border-t border-white/10">
        {cartelInfo.risk_level_fifa2026 && (
            <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
                    Riesgo Mundial FIFA 26
                </span>
                <span className="text-[10px] font-bold text-[#f0f4ff] bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded w-fit">
                    {cartelInfo.risk_level_fifa2026}
                </span>
            </div>
        )}
        {cartelInfo.economic_impact && (
            <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
                    Impacto Económico
                </span>
                <span className="text-[11px] text-[#8b98b8] leading-tight">
                    {cartelInfo.economic_impact}
                </span>
            </div>
        )}
    </div>
));

StrategicImpact.displayName = 'StrategicImpact';

// Componente para la situación táctica
const TacticalSituation = React.memo(({ situation }: { situation: string }) => (
    <div className="flex flex-col gap-1.5 mt-1 pt-4 border-t border-white/10">
        <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold">
            Resumen de Inteligencia
        </span>
        <p className="text-xs text-[#8b98b8] leading-relaxed italic bg-black/20 p-2 rounded-md border-l-2 border-accent/50">
            "{situation}"
        </p>
    </div>
));

TacticalSituation.displayName = 'TacticalSituation';

// Componente para stats rápidas
const QuickStats = React.memo(({ stateCount, cartelsCount }: { stateCount: number, cartelsCount: number }) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4">
            <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-1">
                Cárteles
            </span>
            <span className="text-2xl font-black text-[#f0f4ff]">{cartelsCount}</span>
        </div>
        <div className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4">
            <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-1">
                Estados
            </span>
            <span className="text-2xl font-black text-[#f0f4ff]">{stateCount}</span>
        </div>
    </div>
));

QuickStats.displayName = 'QuickStats';

// Componente para la leyenda de cárteles
const CartelLegend = React.memo(({
    selectedCartel,
    onToggleCartel,
    stateCountByCartel
}: {
    selectedCartel: string | null;
    onToggleCartel: (id: string) => void;
    stateCountByCartel: Record<string, number>;
}) => (
    <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase text-[#8b98b8] tracking-wider">
            Leyenda de Control Territorial
            {selectedCartel && (
                <button
                    onClick={() => onToggleCartel(selectedCartel)}
                    className="ml-2 text-[9px] text-accent hover:text-accent-hover transition-colors normal-case tracking-normal font-medium"
                >
                    Limpiar filtro ×
                </button>
            )}
        </h3>
        <div className="flex flex-col gap-1.5">
            {CARTEL_LEGEND.map((c) => {
                const isSelected = selectedCartel === c.id;
                const isDimmed = selectedCartel !== null && !isSelected;
                const count = stateCountByCartel[c.id] ?? 0;

                return (
                    <button
                        key={c.id}
                        onClick={() => onToggleCartel(c.id)}
                        className={`flex items-center gap-3 p-2 rounded-md transition-all text-left w-full group
                            ${isSelected ? "bg-[#1c2636] shadow-sm" : "hover:bg-[#161d2b]"}
                            ${isDimmed ? "opacity-30" : "opacity-100"}
                        `}
                        style={isSelected ? { outline: `1px solid ${c.color}60` } : undefined}
                        aria-pressed={isSelected}
                    >
                        <div
                            className={`w-3.5 h-3.5 rounded-sm shadow-sm flex-shrink-0 transition-transform ${isSelected ? "scale-125" : "group-hover:scale-110"}`}
                            style={{
                                backgroundColor: c.color,
                                boxShadow: isSelected ? `0 0 8px ${c.color}80` : undefined
                            }}
                        />
                        <span className={`text-sm font-medium transition-colors flex-1 ${isSelected ? "text-white" : "text-[#f0f4ff]"}`}>
                            {c.name}
                        </span>
                        <span
                            className="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${c.color}25`,
                                color: c.color,
                            }}
                        >
                            {count}
                        </span>
                        {isSelected && <CheckIcon color={c.color} />}
                    </button>
                );
            })}
        </div>
    </div>
));

CartelLegend.displayName = 'CartelLegend';

// Componente para el footer
const SidebarFooter = React.memo(() => (
    <div className="p-4 border-t border-white/5 mt-auto flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-medium">
            Última actualización: 4 de marzo del 2026
        </span>
        <div className="flex flex-col items-center gap-1 opacity-50">
            <span
                className="text-[12px] text-[#5e6c8b] uppercase tracking-widest text-center"
                style={{ transform: 'scale(0.65)', display: 'block' }}
            >
                Powered by Gemini Deep Research
            </span>
        </div>
    </div>
));

SidebarFooter.displayName = 'SidebarFooter';
