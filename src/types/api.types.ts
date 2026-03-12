export interface LiveStatePresence {
    stateSlug: string;
    stateName: string;
    cartels: {
        id: string; // uuid
        name: string;
        color: string;
        isDominant: boolean;
        slug: string;
    }[];
}

export interface LiveCartelDetails {
    id: string;
    name: string;
    slug: string;
    color: string;
    globalStatus: string | null;
    foreignDesignation: string | null;
    fifaRiskLevel: string | null;
    factions: string[];
    leaders: { name: string; alias: string | null }[];
}

export interface LiveStateIntelligence {
    stateName: string;
    cartels: {
        id: string;
        name: string;
        color: string;
        isDominant: boolean;
        localIntelligenceNote: string | null;
        globalStatus: string | null;
        foreignDesignation: string | null;
        factions: { name: string; focus: string | null }[];
        leaders: { name: string; alias: string | null }[];
    }[];
}
