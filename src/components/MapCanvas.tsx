"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import {
    useSearchQuery,
    useSelectedCartel,
    useSelectedState,
    useLiveStateData,
    useMapActions
} from "@/store/mapStore";
import { getLiveMapData } from "@/actions/mapData";

/**
 * URL del recurso TopoJSON con los límites geográficos de México.
 */
const geoUrl = "/maps/mexico.json";

/**
 * Constantes de Configuración del Mapa
 */
const MEXICO_CENTER: [number, number] = [-102.34, 24.01]; // Centro geográfico aproximado
const DEFAULT_ZOOM = 1;      // Nivel de zoom inicial
const MAX_ZOOM = 8;         // Límite máximo de acercamiento
const ZOOM_STEP = 1.5;      // Factor de incremento en zoom

/**
 * Estado interno para el Tooltip estratégico.
 */
interface TooltipState {
    content: string; // Nombre del estado
    cartel: string;  // Nombres de los cárteles presentes
    color: string;   // Color representativo
    x: number;       // Posición X en pixeles
    y: number;       // Posición Y en pixeles
}

/**
 * Estados de Error para el seguimiento de fallos en carga.
 */
interface ErrorState {
    map: string | null;  // Error al cargar TopoJSON
    data: string | null; // Error al cargar inteligencia de la BD
}

/**
 * Componente MapCanvas: El núcleo interactivo de la plataforma.
 * Renderiza el mapa de México, maneja zoom, tooltips y la visualización 
 * dinámica del control territorial (inteligencia en vivo).
 */
export default function MapCanvas() {
    // --- Hooks de Estado Global (Zustand) ---
    const searchQuery = useSearchQuery();
    const selectedCartel = useSelectedCartel();
    const selectedState = useSelectedState();
    const liveStateData = useLiveStateData();
    const { setSelectedState, setLiveStateData } = useMapActions();

    // --- Hooks de Estado Local ---
    const [position, setPosition] = useState({ coordinates: MEXICO_CENTER, zoom: DEFAULT_ZOOM });
    const [topoData, setTopoData] = useState<any>(null);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [errors, setErrors] = useState<ErrorState>({ map: null, data: null });
    const [isLoading, setIsLoading] = useState({ map: true, data: true });
    
    // Referencia al contenedor para cálculos de coordenadas locales
    const mapContainerRef = useRef<HTMLDivElement>(null);

    /**
     * EFECTO: Carga de Datos y Geografía
     * Implementa AbortController para evitar fugas de memoria en desmontaje.
     */
    useEffect(() => {
        const controller = new AbortController();

        // 1. Cargar Geometría del Mapa (TopoJSON)
        setIsLoading(prev => ({ ...prev, map: true }));
        fetch(geoUrl, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setTopoData(data);
                setErrors(prev => ({ ...prev, map: null }));
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error("Error loading map:", err);
                    setErrors(prev => ({ ...prev, map: "Error al cargar geometría" }));
                }
            })
            .finally(() => setIsLoading(prev => ({ ...prev, map: false })));

        // 2. Cargar Inteligencia en Vivo (Server Action -> PostgreSQL)
        setIsLoading(prev => ({ ...prev, data: true }));
        getLiveMapData()
            .then(data => {
                setLiveStateData(data);
                setErrors(prev => ({ ...prev, data: null }));
            })
            .catch(err => {
                console.error("Error fetching live map data:", err);
                setErrors(prev => ({ ...prev, data: "Error al cargar inteligencia" }));
            })
            .finally(() => setIsLoading(prev => ({ ...prev, data: false })));

        return () => controller.abort();
    }, [setLiveStateData]);

    /**
     * Handlers de Control de Vista (Zoom y Reset)
     */
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
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedState(null);
    }, [setSelectedState]);

    /**
     * EFECTO: Atajos de Teclado (Navegación Táctica)
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // No activar atajos si el usuario está escribiendo en un input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    handleReset();
                    break;
                case 'Escape':
                    e.preventDefault();
                    handleClearSelection();
                    break;
                case '0':
                    e.preventDefault();
                    handleReset();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleZoomIn, handleZoomOut, handleReset, handleClearSelection]);

    const handleMoveEnd = useCallback((position: any) => {
        setPosition(position);
    }, []);

    /**
     * Lógica de Estilizado Dinámico de Carteles.
     * Calcula colores, grosores y patrones según filtros de búsqueda y selección.
     */
    const getCartelStyle = useCallback((stateName: string) => {
        const isSearchHighlighted = searchQuery && stateName.toLowerCase().includes(searchQuery.toLowerCase());

        // Cruzar con datos locales de la BD
        const stateRecord = liveStateData.find(s => s.stateName === stateName);

        // Caso: Estado sin datos registrados o en disputa total
        if (!stateRecord || stateRecord.cartels.length === 0) {
            return {
                fill: "rgba(25, 40, 60, 0.4)",
                stroke: "rgba(80, 110, 150, 0.4)",
                strokeWidth: 0.5,
                cartel: "Zonas en disputa / No data",
                opacity: 1,
                liveDataRaw: null
            };
        }

        const isCartelMatch = selectedCartel !== null && stateRecord.cartels.some((c: any) => c.slug === selectedCartel || c.id === selectedCartel);
        const isDimmed = selectedCartel !== null && !isCartelMatch;
        const isHighlighted = (isSearchHighlighted || isCartelMatch);

        const dominantCartel = stateRecord.cartels.find((c: any) => c.isDominant) || stateRecord.cartels[0];
        const primaryColor = dominantCartel.color;
        const cartelNames = stateRecord.cartels.map((c: any) => c.name).join(" / ");

        // Caso Especial: Tamaulipas (Renderizado con patrones de bicefalia)
        if (stateRecord.cartels.length > 1 && stateName === "Tamaulipas") {
            return {
                fill: isDimmed
                    ? "url(#pattern-tamaulipas-dimmed)"
                    : isHighlighted
                        ? "url(#pattern-tamaulipas-highlighted)"
                        : "url(#pattern-tamaulipas-normal)",
                stroke: isDimmed ? `${primaryColor}30` : isHighlighted ? "white" : primaryColor,
                strokeWidth: isHighlighted ? 2 : isDimmed ? 0.5 : 1,
                cartel: cartelNames,
                opacity: isDimmed ? 0.4 : 1,
                liveDataRaw: dominantCartel
            };
        }

        // Estilo Estándar basado en Cartel Dominante
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
            cartel: cartelNames,
            opacity: isDimmed ? 0.4 : 1,
            liveDataRaw: dominantCartel
        };
    }, [searchQuery, selectedCartel, liveStateData]);

    /**
     * Memorizar features de TopoJSON para evitar re-calculo constante.
     */
    const features = useMemo(() => {
        if (!topoData?.objects?.states) return [];
        try {
            return (feature(topoData, topoData.objects.states) as any).features;
        } catch (error) {
            console.error("Error converting TopoJSON:", error);
            return [];
        }
    }, [topoData]);

    /**
     * Ajuste de escala según dispositivo.
     */
    const mapScale = useMemo(() =>
        typeof window !== 'undefined' && window.innerWidth < 768 ? 900 : 1400,
        []);

    // --- Sub-componentes de Estado Táctico ---

    const ErrorDisplay = ({ message, type }: { message: string; type: 'map' | 'data' }) => (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-red-400 text-sm">⚠️</span>
                <span className="text-red-400 text-xs font-mono">{message}</span>
                <button
                    onClick={() => {
                        if (type === 'map') {
                            setErrors(prev => ({ ...prev, map: null }));
                            setIsLoading(prev => ({ ...prev, map: true }));
                            fetch(geoUrl).then(res => res.json()).then(data => setTopoData(data))
                                .catch(() => setErrors(prev => ({ ...prev, map: "Error al reintentar" })))
                                .finally(() => setIsLoading(prev => ({ ...prev, map: false })));
                        } else {
                            setErrors(prev => ({ ...prev, data: null }));
                            setIsLoading(prev => ({ ...prev, data: true }));
                            getLiveMapData().then(data => setLiveStateData(data))
                                .catch(() => setErrors(prev => ({ ...prev, data: "Error al reintentar" })))
                                .finally(() => setIsLoading(prev => ({ ...prev, data: false })));
                        }
                    }}
                    className="text-xs text-red-400/70 hover:text-red-400 ml-2 underline"
                >
                    Reintentar
                </button>
            </div>
        </div>
    );

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-[#080c12]/80 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8b98b8]">
                    Sincronizando Inteligencia...
                </span>
            </div>
        </div>
    );

    const KeyboardShortcutsHint = () => (
        <div className="absolute bottom-6 left-6 z-30 bg-[#0f1520]/60 backdrop-blur-sm border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-[#5e6c8b] hidden md:block">
            <div className="flex items-center gap-3">
                <span>+ / - : Zoom</span>
                <span>R : Reset</span>
                <span>ESC : Limpiar</span>
            </div>
        </div>
    );

    return (
        <div
            ref={mapContainerRef}
            className="relative flex-1 w-full h-full bg-[#080c12] overflow-hidden cursor-crosshair"
        >
            {/* HUD: Errores y Estados de Carga */}
            {errors.map && <ErrorDisplay message={errors.map} type="map" />}
            {errors.data && <ErrorDisplay message={errors.data} type="data" />}
            {isLoading.map && !errors.map && <LoadingOverlay />}

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
                {/* Visualización de Tooltip */}
                {tooltip && (
                    <StrategicTooltip tooltip={tooltip} />
                )}

                {/* Rejilla de Referencia Táctica */}
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

                <KeyboardShortcutsHint />

                {!topoData && !errors.map ? (
                    <LoadingIndicator />
                ) : topoData && (
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

                {/* Controles de HUD Flotantes */}
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

/**
 * StrategicTooltip: Componente memoizado para renderizar detalles al vuelo.
 */
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

/**
 * LoadingIndicator: Spinner táctico central.
 */
const LoadingIndicator = React.memo(() => (
    <div className="flex flex-col items-center gap-4 text-[#8b98b8]">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-[0.2em]">
            Cargando Mapa...
        </span>
    </div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

/**
 * MapControls: Botonera de control de cámara.
 */
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
            aria-label="Acercar (tecla +)"
            title="Acercar (+)"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
        </button>
        <button
            onClick={onZoomOut}
            disabled={zoom <= DEFAULT_ZOOM}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-[#8b98b8] hover:text-[#f0f4ff] hover:border-white/20 hover:bg-[#1c2636] transition-all shadow-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Alejar (tecla -)"
            title="Alejar (-)"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
        </button>
        <button
            onClick={onReset}
            className="mt-1 flex items-center justify-center w-9 h-9 rounded-lg bg-[#0f1520]/80 backdrop-blur-md border border-white/10 text-accent hover:text-accent-hover hover:border-accent hover:bg-accent/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
            aria-label="Resetear vista (tecla R)"
            title="Resetear (R)"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    </div>
));

MapControls.displayName = 'MapControls';

/**
 * MemoizedMap: El renderizador SVG del mapa. 
 * Memoizado para evitar ruidos de re-render al mover el mouse sobre el contenedor.
 */
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
            ? (style.liveDataRaw?.color ?? "#8b98b8")
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
                {/* Definiciones de patrones para bicefalia territorial */}
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
    // Optimización: Solo re-renderizar si cambian propiedades críticas de la vista
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