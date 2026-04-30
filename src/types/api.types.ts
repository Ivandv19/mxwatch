/**
 * Presencia territorial de cárteles por estado para visualización en mapa.
 */
export interface LiveStatePresence {
    stateSlug: string;    // Slug del estado (ej. "sinaloa")
    stateName: string;    // Nombre legible del estado
    cartels: {
        id: string;       // UUID del cártel
        name: string;     // Nombre oficial
        color: string;    // Hex color para UI
        isDominant: boolean; // Control territorial principal
        slug: string;     // Slug del cártel (ej. "cds")
    }[];
}

/**
 * Perfil detallado de cártel a nivel nacional/global.
 */
export interface LiveCartelDetails {
    id: string;
    name: string;
    slug: string;
    color: string;
    globalStatus: string | null;      // Estatus operativo nacional
    foreignDesignation: string | null; // Designación externa (DEA/Treasury)
    fifaRiskLevel: string | null;      // Nivel de riesgo internacional
    factions: string[];               // Facciones activas
    leaders: {
        name: string;
        alias: string | null;
    }[]; // Liderazgo principal
}

/**
 * Informe de inteligencia táctica específico por estado.
 */
export interface LiveStateIntelligence {
    stateName: string;
    cartels: {
        id: string;
        name: string;
        color: string;
        isDominant: boolean;
        localIntelligenceNote: string | null; // Nota táctica regional
        globalStatus: string | null;
        foreignDesignation: string | null;
        factions: {
            name: string;
            focus: string | null; // Enfoque operativo local
        }[];
        leaders: {
            name: string;
            alias: string | null;
        }[];
    }[];
}