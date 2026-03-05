"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import { CARTEL_DATA } from "@/constants/cartelData";
import {
    useSearchQuery,
    useSelectedCartel,
    useSelectedState,
    useMapActions
} from "@/store/mapStore";

const geoUrl = "/maps/mexico.json";

// Constantes para mejorar mantenibilidad
const MEXICO_CENTER: [number, number] = [-102.34, 24.01];
const DEFAULT_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.5;

// Interfaz para el tooltip
interface TooltipState {
    content: string;
    cartel: string;
    color: string;
    x: number;
    y: number;
}

export default function MapCanvas() {
    const searchQuery = useSearchQuery();
    const selectedCartel = useSelectedCartel();
    const selectedState = useSelectedState();
    const { setSelectedState } = useMapActions();
    const [position, setPosition] = useState({ coordinates: MEXICO_CENTER, zoom: DEFAULT_ZOOM });
    const [topoData, setTopoData] = useState<any>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Efecto para cargar el mapa
    useEffect(() => {
        fetch(geoUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => setTopoData(data))
            .catch((err) => {
                console.error("Error loading map:", err);
            });
    }, []);

    // Manejadores de zoom memoizados
    const handleZoomIn = useCallback(() => {
        setPosition((pos) => ({
            ...pos,
            zoom: Math.min(pos.zoom * ZOOM_STEP, MAX_ZOOM)
        }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setPosition((pos) => ({
            ...pos,
            zoom: Math.max(pos.zoom / ZOOM_STEP, DEFAULT_ZOOM)
        }));
    }, []);

    const handleReset = useCallback(() => {
        setPosition({ coordinates: MEXICO_CENTER, zoom: DEFAULT_ZOOM });
        // No reseteamos el estado seleccionado aquí para permitir que el usuario mantenga el detalle si solo quiere re-centrar
    }, []);

    const handleMoveEnd = useCallback((position: any) => {
        setPosition(position);
    }, []);

    // Función para obtener estilos del cártel - optimizada
    const getCartelStyle = useCallback((stateName: string) => {
        const isSearchHighlighted = searchQuery && stateName.toLowerCase().includes(searchQuery.toLowerCase());
        const data = CARTEL_DATA[stateName];

        // Si no hay datos del estado
        if (!data) {
            return {
                fill: "rgba(25, 40, 60, 0.4)",
                stroke: "rgba(80, 110, 150, 0.4)",
                strokeWidth: 0.5,
                cartel: "Zonas en disputa / No data",
                opacity: 1,
            };
        }

        const isCartelMatch = selectedCartel !== null && data.cartels.includes(selectedCartel);
        const isDimmed = selectedCartel !== null && !isCartelMatch;
        const isHighlighted = (isSearchHighlighted || isCartelMatch);

        // Caso especial Tamaulipas (bicefalia)
        if (data.cartels.length > 1 && stateName === "Tamaulipas") {
            return {
                fill: isDimmed
                    ? "url(#pattern-tamaulipas-dimmed)"
                    : isHighlighted
                        ? "url(#pattern-tamaulipas-highlighted)"
                        : "url(#pattern-tamaulipas-normal)",
                stroke: isDimmed ? `${data.color}30` : isHighlighted ? "white" : data.color,
                strokeWidth: isHighlighted ? 2 : isDimmed ? 0.5 : 1,
                cartel: data.cartels.join(" / "),
                opacity: isDimmed ? 0.4 : 1,
            };
        }

        // Caso regular
        const primaryColor = data.color;
        return {
            fill: isDimmed
                ? `${primaryColor}18`
                : isHighlighted
                    ? `${primaryColor}dd`
                    : `${primaryColor}44`,
            stroke: isDimmed
                ? `${primaryColor}30`
                : isHighlighted
                    ? "white"
                    : primaryColor,
            strokeWidth: isHighlighted ? 2 : isDimmed ? 0.5 : 1,
            cartel: data.cartels.join(" / "),
            opacity: isDimmed ? 0.4 : 1,
        };
    }, [searchQuery, selectedCartel]);

    // Convert TopoJSON a GeoJSON features
    const features = useMemo(() => {
        if (!topoData?.objects?.states) return [];
        try {
            return (feature(topoData, topoData.objects.states) as any).features;
        } catch (error) {
            console.error("Error converting TopoJSON:", error);
            return [];
        }
    }, [topoData]);

    // Escala del mapa responsive
    const mapScale = useMemo(() =>
        typeof window !== 'undefined' && window.innerWidth < 768 ? 900 : 1400,
        []);

    return (
        <div
            ref={mapContainerRef}
            className="relative flex-1 w-full h-full bg-[#080c12] overflow-hidden cursor-crosshair"
        >
            <div
                className="absolute inset-0 flex items-center justify-center bg-[#05080c]"
                style={{
                    backgroundImage: `
                        radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                        linear-gradient(0deg, rgba(8,12,18,1) 0%, rgba(8,12,18,0) 100%)
                    `,
                    backgroundSize: "24px 24px, 100% 100%",
                    backgroundPosition: "center center",
                }}
            >
                {/* Tooltip táctico */}
                {tooltip && (
                    <StrategicTooltip tooltip={tooltip} />
                )}

                {/* Graticule/Grid simulation */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px"
                    }}
                />

                {!topoData ? (
                    <LoadingIndicator />
                ) : (
                    <MemoizedMap
                        features={features}
                        position={position}
                        handleMoveEnd={handleMoveEnd}
                        getCartelStyle={getCartelStyle}
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        setTooltip={setTooltip}
                        mapScale={mapScale}
                        containerRef={mapContainerRef}
                    />
                )}

                {/* HUD Elements - Controles de mapa */}
                <MapControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onReset={handleReset}
                    zoom={position.zoom}
                />
            </div>
        </div>
    );
}

// Componente de tooltip separado para mejor rendimiento
const StrategicTooltip = React.memo(({ tooltip }: { tooltip: TooltipState }) => (
    <div
        className="absolute z-50 pointer-events-none transition-transform duration-75 ease-out"
        style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15,
        }}
    >
        <div className="bg-[#0a0f18]/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col gap-1.5 min-w-[180px]">
            <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5e6c8b]">
                    Estado
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            <span className="text-sm font-bold text-[#f0f4ff] leading-tight">
                {tooltip.content}
            </span>
            <div className="h-[1px] w-full bg-white/5 my-0.5" />
            <div className="flex items-center gap-2">
                <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: tooltip.color }}
                />
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-[#5e6c8b]">
                        Control dominante
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: tooltip.color }}>
                        {tooltip.cartel}
                    </span>
                </div>
            </div>
            <span className="text-[9px] text-[#5e6c8b]/60 mt-0.5">
                Click para ver detalle
            </span>
        </div>
    </div>
));

StrategicTooltip.displayName = 'StrategicTooltip';

// Indicador de carga
const LoadingIndicator = React.memo(() => (
    <div className="flex flex-col items-center gap-4 text-[#8b98b8]">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-[0.2em]">
            Cargando Mapa...
        </span>
    </div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

// Controles del mapa
const MapControls = React.memo(({
    onZoomIn,
    onZoomOut,
    onReset,
    zoom
}: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    zoom: number;
}) => (
    <div className="absolute top-20 md:top-auto md:bottom-6 right-4 md:right-6 flex flex-col gap-2 z-20">
        <button
            onClick={onZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-[#8b98b8] hover:text-[#f0f4ff] hover:border-white/20 hover:bg-[#1c2636] transition-all shadow-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Acercar"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
        </button>
        <button
            onClick={onZoomOut}
            disabled={zoom <= DEFAULT_ZOOM}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-[#8b98b8] hover:text-[#f0f4ff] hover:border-white/20 hover:bg-[#1c2636] transition-all shadow-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Alejar"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
        </button>
        <button
            onClick={onReset}
            className="mt-1 flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-accent hover:text-accent-hover hover:border-accent hover:bg-accent/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
            aria-label="Resetear vista"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    </div>
));

MapControls.displayName = 'MapControls';

// Componente del mapa memoizado
const MemoizedMap = React.memo(({
    features,
    position,
    handleMoveEnd,
    getCartelStyle,
    selectedState,
    setSelectedState,
    setTooltip,
    mapScale,
    containerRef
}: any) => {

    const handleGeographyMouseEnter = useCallback((e: React.MouseEvent, stateName: string, style: any) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const color = style.stroke === "white"
            ? CARTEL_DATA[stateName]?.color ?? "#8b98b8"
            : style.stroke;

        setTooltip({
            content: stateName,
            cartel: style.cartel,
            color,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, [containerRef, setTooltip]);

    const handleGeographyMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip((prev: TooltipState | null) =>
            prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null
        );
    }, [containerRef, setTooltip]);

    return (
        <div className="absolute inset-0 z-10">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: mapScale,
                    center: MEXICO_CENTER
                }}
                className="w-full h-full"
            >
                <defs>
                    <pattern id="pattern-tamaulipas-normal" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="12" fill="#9b59b6" fillOpacity={0.4} />
                        <rect x="6" width="6" height="12" fill="#1abc9c" fillOpacity={0.4} />
                    </pattern>
                    <pattern id="pattern-tamaulipas-highlighted" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="12" fill="#9b59b6" fillOpacity={0.8} />
                        <rect x="6" width="6" height="12" fill="#1abc9c" fillOpacity={0.8} />
                    </pattern>
                    <pattern id="pattern-tamaulipas-dimmed" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="6" height="12" fill="#9b59b6" fillOpacity={0.15} />
                        <rect x="6" width="6" height="12" fill="#1abc9c" fillOpacity={0.15} />
                    </pattern>
                </defs>
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                    maxZoom={MAX_ZOOM}
                >
                    <Geographies geography={features}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const stateName = geo.properties.state_name;
                                const style = getCartelStyle(stateName);
                                const isSelected = selectedState === stateName;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={style.fill}
                                        stroke={style.stroke}
                                        strokeWidth={style.strokeWidth}
                                        onMouseEnter={(e) => handleGeographyMouseEnter(e, stateName, style)}
                                        onMouseMove={handleGeographyMouseMove}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => setSelectedState(isSelected ? null : stateName)}
                                        style={{
                                            default: {
                                                opacity: style.opacity,
                                                outline: "none",
                                                transition: "all 200ms ease",
                                                cursor: "pointer"
                                            },
                                            hover: {
                                                fill: style.stroke === "white" ? style.fill : style.stroke,
                                                fillOpacity: 0.8,
                                                stroke: "white",
                                                strokeWidth: 2,
                                                outline: "none",
                                            },
                                            pressed: {
                                                outline: "none",
                                                transform: "scale(0.98)"
                                            },
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
}, (prevProps, nextProps) => {
    return (
        prevProps.features === nextProps.features &&
        prevProps.position.zoom === nextProps.position.zoom &&
        prevProps.position.coordinates[0] === nextProps.position.coordinates[0] &&
        prevProps.position.coordinates[1] === nextProps.position.coordinates[1] &&
        prevProps.selectedState === nextProps.selectedState &&
        prevProps.getCartelStyle === nextProps.getCartelStyle &&
        prevProps.mapScale === nextProps.mapScale
    );
});

MemoizedMap.displayName = 'MemoizedMap';
