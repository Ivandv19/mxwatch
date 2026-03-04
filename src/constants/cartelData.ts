export const CARTEL_DATA: Record<string, { cartel: string; color: string }> = {
    // ── CJNG (22 estados reportados en Feb 2026) ─────────────────────────────
    "Jalisco": { cartel: "CJNG", color: "#e63946" },
    "Nayarit": { cartel: "CJNG", color: "#e63946" },
    "Colima": { cartel: "CJNG", color: "#e63946" },
    "Guanajuato": { cartel: "CJNG", color: "#e63946" },
    "Veracruz de Ignacio de la Llave": { cartel: "CJNG", color: "#e63946" },
    "Aguascalientes": { cartel: "CJNG", color: "#e63946" },
    "Querétaro": { cartel: "CJNG", color: "#e63946" },
    "Hidalgo": { cartel: "CJNG", color: "#e63946" },
    "Puebla": { cartel: "CJNG", color: "#e63946" },
    "Oaxaca": { cartel: "CJNG", color: "#e63946" },
    "Tabasco": { cartel: "CJNG", color: "#e63946" },
    "Morelos": { cartel: "CJNG", color: "#e63946" },
    "Quintana Roo": { cartel: "CJNG", color: "#e63946" },

    // ── Sinaloa (18 estados reportados, dominio principal) ───────────────────
    "Sinaloa": { cartel: "Sinaloa", color: "#2a7de1" },
    "Sonora": { cartel: "Sinaloa", color: "#2a7de1" },
    "Chihuahua": { cartel: "Sinaloa", color: "#2a7de1" },
    "Durango": { cartel: "Sinaloa", color: "#2a7de1" },
    "Baja California": { cartel: "Sinaloa", color: "#2a7de1" },
    "Baja California Sur": { cartel: "Sinaloa", color: "#2a7de1" },
    "Yucatán": { cartel: "Sinaloa", color: "#2a7de1" },
    "Campeche": { cartel: "Sinaloa", color: "#2a7de1" },
    "Chiapas": { cartel: "Sinaloa", color: "#2a7de1" },

    // ── Cártel del Noreste (CDN - Nuevo Laredo, Coahuila, Nuevo León, Zacatecas) 
    "Nuevo León": { cartel: "Noreste", color: "#9b59b6" },
    "Coahuila de Zaragoza": { cartel: "Noreste", color: "#9b59b6" },
    "San Luis Potosí": { cartel: "Noreste", color: "#9b59b6" },
    "Zacatecas": { cartel: "Noreste", color: "#9b59b6" },

    // ── Cártel del Golfo (CDG) ────────────────────────────────────────────────
    "Tamaulipas": { cartel: "Golfo", color: "#1abc9c" },

    // ── La Nueva Familia Michoacana (Tierra Caliente, Edomex) ───────────────
    "Tlaxcala": { cartel: "Michoacana", color: "#e67e22" },
    "Michoacán de Ocampo": { cartel: "Michoacana", color: "#e67e22" },
    "Guerrero": { cartel: "Michoacana", color: "#e67e22" },
    "México": { cartel: "Michoacana", color: "#e67e22" },
};

export const CARTEL_LEGEND = [
    {
        id: "CJNG",
        name: "Cártel Jalisco Nueva Generación",
        color: "#e63946",
        leaders: "Juan Carlos Valencia ('El 3'), Ricardo Ruiz Velasco ('El Doble R')",
        factions: "Crisis sucesoria interna; riesgo de balcanización"
    },
    {
        id: "Sinaloa",
        name: "Cártel de Sinaloa",
        color: "#2a7de1",
        leaders: "Iván Archivaldo Guzmán (Chapitos), Ismael Zambada Sicairos (Mayiza)",
        factions: "Guerra civil: 'Los Chapitos' vs 'La Mayiza'"
    },
    {
        id: "Noreste",
        name: "Cártel del Noreste",
        color: "#9b59b6",
        leaders: "Juan Cisneros Treviño ('La Sombra')",
        factions: "Estructura paramilitar monolítica ('La Tropa del Infierno')"
    },
    {
        id: "Golfo",
        name: "Cártel del Golfo",
        color: "#1abc9c",
        leaders: "Liderazgo regional atomizado ('El Fayuca')",
        factions: "Los Metros, Los Escorpiones, Los Ciclones"
    },
    {
        id: "Michoacana",
        name: "La Nueva Familia Michoacana",
        color: "#e67e22",
        leaders: "Johnny Hurtado Olascoaga ('El Pez'), José Alfredo Hurtado Olascoaga ('El Fresa')",
        factions: "Alianza táctica con 'Cárteles Unidos'"
    },
];
