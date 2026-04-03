/**
 * Representa la presencia de cárteles en un estado para la visualización del mapa.
 */
export interface LiveStatePresence {
    stateSlug: string;    // Identificador único (slug) del estado (ej. "sinaloa")
    stateName: string;    // Nombre amigable del estado (ej. "Sinaloa")
    cartels: {
        id: string;        // ID (UUID) del cártel
        name: string;      // Nombre oficial del cártel
        color: string;     // Color hexadecimal asignado para la visualización
        isDominant: boolean; // Indica si tiene el control principal del territorio
        slug: string;      // Identificador único del cártel (ej. "cds")
    }[];
}

/**
 * Detalles extendidos de un cártel para perfiles individuales o inteligencia global.
 */
export interface LiveCartelDetails {
    id: string;
    name: string;
    slug: string;
    color: string;
    globalStatus: string | null;      // Estado operativo actual a nivel nacional
    foreignDesignation: string | null; // Designación por agencias extranjeras (ej. Treasury/DEA)
    fifaRiskLevel: string | null;      // Nivel de riesgo asignado para eventos internacionales
    factions: string[];               // Lista de nombres de facciones activas
    leaders: { 
        name: string; 
        alias: string | null; 
    }[]; // Estructura de mando principal
}

/**
 * Informe de inteligencia detallado por estado.
 * Incluye facciones, líderes y notas tácticas específicas de la región seleccionada.
 */
export interface LiveStateIntelligence {
    stateName: string;
    cartels: {
        id: string;
        name: string;
        color: string;
        isDominant: boolean;
        localIntelligenceNote: string | null; // Nota táctica específica para este estado
        globalStatus: string | null;
        foreignDesignation: string | null;
        factions: { 
            name: string; 
            focus: string | null; // Actividad principal de la facción en esta área
        }[];
        leaders: { 
            name: string; 
            alias: string | null; 
        }[];
    }[];
}
