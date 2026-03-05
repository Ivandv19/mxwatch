"use client";
import React from "react";
import { CARTEL_LEGEND, CARTEL_DATA } from "@/constants/cartelData";
import { useMapStore } from "@/store/mapStore";

// Precompute state count per cartel
const stateCountByCartel = Object.values(CARTEL_DATA).reduce<Record<string, number>>(
    (acc, { cartel }) => {
        acc[cartel] = (acc[cartel] ?? 0) + 1;
        return acc;
    },
    {}
);

export default function MapSidebar() {
    const { searchQuery, setSearchQuery, selectedCartel, toggleCartel, selectedState, setSelectedState } = useMapStore();

    const selectedStateData = selectedState ? CARTEL_DATA[selectedState] : null;
    const selectedCartelInfo = selectedStateData
        ? CARTEL_LEGEND.find((c) => c.id === selectedStateData.cartel)
        : null;

    return (
        <aside className="w-full h-[40%] md:h-full md:w-[380px] bg-[#0f1520] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 overflow-hidden z-10 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)] md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
            {/* Cabecera / Buscador */}
            <div className="p-3 md:p-4 border-b border-white/10 bg-[#080c12]/50 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-[#f0f4ff] mb-2 md:mb-3">Centro de Análisis</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar estado..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#161d2b] border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-[#f0f4ff] placeholder:text-[#5e6c8b] focus:outline-none focus:border-accent transition-colors shadow-sm"
                    />
                    <svg className="w-4 h-4 text-[#5e6c8b] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
                {/* Pestañas */}
                <div className="flex border-b border-white/5 bg-[#0f1520] sticky top-0 z-10">
                    <button className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-accent border-b-2 border-accent bg-accent/10">Cárteles</button>
                    <button
                        disabled
                        className="flex-1 py-3 text-xs font-bold uppercase tracking-wide text-[#5e6c8b] opacity-30 cursor-not-allowed"
                    >
                        Incidentes
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-6">

                    {/* Panel de estado seleccionado */}
                    {selectedState && (
                        <div
                            className="rounded-xl border p-4 flex flex-col gap-3 transition-all"
                            style={{
                                borderColor: selectedCartelInfo ? `${selectedCartelInfo.color}40` : "var(--border-subtle)",
                                backgroundColor: selectedCartelInfo ? `${selectedCartelInfo.color}10` : "var(--bg-subtle)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#5e6c8b]">Estado seleccionado</span>
                                <button
                                    onClick={() => setSelectedState(null)}
                                    className="text-[#5e6c8b] hover:text-[#f0f4ff] transition-colors text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                            <span className="text-base font-bold text-[#f0f4ff]">{selectedState}</span>
                            {selectedStateData ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: selectedCartelInfo?.color }}
                                        />
                                        <span className="text-sm font-medium" style={{ color: selectedCartelInfo?.color }}>
                                            {selectedCartelInfo?.name}
                                        </span>
                                    </div>

                                    {/* Intel Adicional del Cártel */}
                                    {(selectedCartelInfo as any)?.leaders && (
                                        <div className="flex flex-col gap-2 mt-1 pt-3 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-0.5">Liderazgo Principal</span>
                                                <span className="text-xs text-[#f0f4ff]">{(selectedCartelInfo as any).leaders}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-0.5">Estructura / Facciones</span>
                                                <span className="text-xs text-[#8b98b8] italic">{(selectedCartelInfo as any).factions}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-[#5e6c8b]">Sin datos disponibles de control territorial</span>
                            )}
                        </div>
                    )}

                    {/* Stats rápidas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-1">Activos</span>
                            <span className="text-2xl font-black text-[#f0f4ff]">5</span>
                        </div>
                        <div className="bg-[#161d2b] border border-white/5 rounded-lg p-3 flex flex-col py-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-bold mb-1">Estados</span>
                            <span className="text-2xl font-black text-[#f0f4ff]">{Object.keys(CARTEL_DATA).length}</span>
                        </div>
                    </div>

                    {/* Leyenda de Cárteles */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-xs font-bold uppercase text-[#8b98b8] tracking-wider">
                            Leyenda de Control Territorial
                            {selectedCartel && (
                                <button
                                    onClick={() => toggleCartel(selectedCartel)}
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
                                        onClick={() => toggleCartel(c.id)}
                                        className={`flex items-center gap-3 p-2 rounded-md transition-all text-left w-full group
                                            ${isSelected ? "bg-[#1c2636] shadow-sm" : "hover:bg-[#161d2b]"}
                                            ${isDimmed ? "opacity-30" : "opacity-100"}
                                        `}
                                        style={isSelected ? { outline: `1px solid ${c.color}60` } : {}}
                                    >
                                        <div
                                            className={`w-3.5 h-3.5 rounded-sm shadow-sm flex-shrink-0 transition-transform ${isSelected ? "scale-125" : "group-hover:scale-110"}`}
                                            style={{ backgroundColor: c.color, boxShadow: isSelected ? `0 0 8px ${c.color}80` : undefined }}
                                        />
                                        <span className={`text-sm font-medium transition-colors flex-1 ${isSelected ? "text-white" : "text-[#f0f4ff]"}`}>
                                            {c.name}
                                        </span>
                                        {/* Contador de estados */}
                                        <span
                                            className="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: `${c.color}25`,
                                                color: c.color,
                                            }}
                                        >
                                            {count}
                                        </span>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.color }} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5 mt-auto flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#5e6c8b] font-medium">
                    Última actualización: 4 de marzo del 2026
                </span>
                <div className="flex flex-col items-center gap-1 opacity-50">
                    <span className="text-[12px] text-[#5e6c8b] uppercase tracking-widest text-center" style={{ transform: 'scale(0.65)', transformOrigin: 'center', display: 'block' }}>Powered by Gemini Deep Research</span>

                </div>
            </div>
        </aside>
    );
}
