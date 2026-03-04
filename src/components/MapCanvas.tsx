"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import { CARTEL_DATA } from "@/constants/cartelData";
import { useMapStore } from "@/store/mapStore";

const geoUrl = "/maps/mexico.json";

export default function MapCanvas() {
    const { searchQuery, selectedCartel, selectedState, setSelectedState } = useMapStore();
    const [position, setPosition] = useState({ coordinates: [-102.34, 24.01], zoom: 1 });
    const [topoData, setTopoData] = useState<any>(null);
    const [tooltip, setTooltip] = useState<{ content: string; cartel: string; color: string; x: number; y: number } | null>(null);

    useEffect(() => {
        fetch(geoUrl)
            .then((res) => res.json())
            .then((data) => setTopoData(data))
            .catch((err) => console.error("Error loading map:", err));
    }, []);

    function handleZoomIn() {
        if (position.zoom >= 8) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    }

    function handleZoomOut() {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    }

    function handleReset() {
        setPosition({ coordinates: [-102.34, 24.01], zoom: 1 });
    }

    function handleMoveEnd(position: any) {
        setPosition(position);
    }

    const getCartelStyle = (stateName: string) => {
        const isSearchHighlighted = searchQuery && stateName.toLowerCase().includes(searchQuery.toLowerCase());
        const data = CARTEL_DATA[stateName];

        // Is this state part of the selected cartel?
        const isCartelMatch = selectedCartel !== null && data?.cartel === selectedCartel;
        // Dim states that don't match the selected cartel
        const isDimmed = selectedCartel !== null && !isCartelMatch;

        if (data) {
            const highlighted = isSearchHighlighted || isCartelMatch;
            return {
                fill: isDimmed
                    ? `${data.color}18`
                    : highlighted
                        ? `${data.color}dd`
                        : `${data.color}44`,
                stroke: isDimmed
                    ? `${data.color}30`
                    : highlighted
                        ? "white"
                        : data.color,
                strokeWidth: highlighted ? 2 : isDimmed ? 0.5 : 1,
                cartel: data.cartel,
                opacity: isDimmed ? 0.4 : 1,
            };
        }
        return {
            fill: isDimmed ? "rgba(25, 40, 60, 0.15)" : isSearchHighlighted ? "rgba(100, 150, 255, 0.4)" : "rgba(25, 40, 60, 0.4)",
            stroke: isDimmed ? "rgba(80, 110, 150, 0.15)" : isSearchHighlighted ? "white" : "rgba(80, 110, 150, 0.4)",
            strokeWidth: isSearchHighlighted ? 2 : 0.5,
            cartel: "Zonas en disputa / No data",
            opacity: isDimmed ? 0.4 : 1,
        };
    };



    // Convert TopoJSON object to GeoJSON features (States only)
    const features = useMemo(() => {
        return topoData && topoData.objects.states
            ? (feature(topoData, topoData.objects.states) as any).features
            : [];
    }, [topoData]);

    return (
        <div className="relative flex-1 w-full h-full bg-[#080c12] overflow-hidden cursor-crosshair">
            <div
                className="absolute inset-0 flex items-center justify-center bg-[#05080c]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(0deg, rgba(8,12,18,1) 0%, rgba(8,12,18,0) 100%)",
                    backgroundSize: "24px 24px, 100% 100%",
                    backgroundPosition: "center center",
                }}
            >
                {/* Tooltip táctico */}
                {tooltip && (
                    <div
                        className="absolute z-50 pointer-events-none transition-transform duration-75 ease-out"
                        style={{
                            left: tooltip.x + 15,
                            top: tooltip.y + 15,
                        }}
                    >
                        <div className="bg-[#0a0f18]/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col gap-1.5 min-w-[180px]">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#5e6c8b]">Estado</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            </div>
                            <span className="text-sm font-bold text-[#f0f4ff] leading-tight">{tooltip.content}</span>
                            <div className="h-[1px] w-full bg-white/5 my-0.5" />
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: tooltip.color }} />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold uppercase tracking-tighter text-[#5e6c8b]">Control dominante</span>
                                    <span className="text-xs font-mono font-bold" style={{ color: tooltip.color }}>{tooltip.cartel}</span>
                                </div>
                            </div>
                            <span className="text-[9px] text-[#5e6c8b]/60 mt-0.5">Click para ver detalle</span>
                        </div>
                    </div>
                )}

                {/* Graticule/Grid simulation */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }}
                />

                {!topoData ? (
                    <div className="flex flex-col items-center gap-4 text-[#8b98b8]">
                        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em]">Cargando Mapa...</span>
                    </div>
                ) : (
                    <MemoizedMap
                        features={features}
                        position={position}
                        handleMoveEnd={handleMoveEnd}
                        getCartelStyle={getCartelStyle}
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        setTooltip={setTooltip}
                    />
                )}

                {/* HUD Elements (Bottom Right) */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                    <button onClick={handleZoomIn} className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-[#8b98b8] hover:text-[#f0f4ff] hover:border-white/20 hover:bg-[#1c2636] transition-all shadow-lg cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button onClick={handleZoomOut} className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-[#8b98b8] hover:text-[#f0f4ff] hover:border-white/20 hover:bg-[#1c2636] transition-all shadow-lg cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                        </svg>
                    </button>
                    <button onClick={handleReset} className="mt-1 flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-accent hover:text-accent-hover hover:border-accent hover:bg-accent/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Separate component to prevent re-rendering the whole SVG when the tooltip position changes
const MemoizedMap = React.memo(({
    features,
    position,
    handleMoveEnd,
    getCartelStyle,
    selectedState,
    setSelectedState,
    setTooltip
}: any) => {
    return (
        <div className="absolute inset-0 z-10">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 1400,
                    center: [-102.34, 24.01]
                }}
                className="w-full h-full"
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates as [number, number]}
                    onMoveEnd={handleMoveEnd}
                    maxZoom={8}
                >
                    <Geographies geography={features}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const stateName = geo.properties.state_name;
                                const style = getCartelStyle(stateName);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={style.fill}
                                        stroke={style.stroke}
                                        strokeWidth={style.strokeWidth}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.closest(".relative")?.getBoundingClientRect();
                                            if (rect) {
                                                setTooltip({
                                                    content: stateName,
                                                    cartel: style.cartel,
                                                    color: style.stroke === "white" ? CARTEL_DATA[stateName]?.color ?? "#8b98b8" : style.stroke,
                                                    x: e.clientX - rect.left,
                                                    y: e.clientY - rect.top
                                                });
                                            }
                                        }}
                                        onMouseMove={(e) => {
                                            const rect = e.currentTarget.closest(".relative")?.getBoundingClientRect();
                                            if (rect) {
                                                setTooltip((prev: any) => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
                                            }
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => setSelectedState(selectedState === stateName ? null : stateName)}
                                        style={{
                                            default: { opacity: style.opacity, outline: "none", transition: "all 300ms ease" },
                                            hover: {
                                                fill: style.stroke,
                                                fillOpacity: 0.6,
                                                stroke: "white",
                                                strokeWidth: 2,
                                                outline: "none",
                                                filter: "drop-shadow(0 0 12px rgba(255,255,255,0.3))"
                                            },
                                            pressed: { outline: "none", scale: 0.98 },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}, (prev, next) => {
    // Only re-render if essential props change (not tooltip)
    return (
        prev.features === next.features &&
        prev.position.zoom === next.position.zoom &&
        prev.position.coordinates[0] === next.position.coordinates[0] &&
        prev.selectedState === next.selectedState &&
        // We assume getCartelStyle depends on searchQuery, but technically here it's passed as prop
        // Simplified check for common cases
        prev.getCartelStyle === next.getCartelStyle
    );
});
