export const CARTEL_DATA: Record<string, { cartels: string[]; color: string; status?: string }> = {
    // ── CJNG ─────────────────────────────
    "Jalisco": { cartels: ["CJNG"], color: "#e63946", status: "En disputa / Blindaje FIFA" },
    "Nayarit": { cartels: ["CJNG"], color: "#e63946", status: "Presencia dominante" },
    "Colima": { cartels: ["CJNG"], color: "#e63946", status: "Presencia dominante" },
    "Guanajuato": { cartels: ["CJNG"], color: "#e63946", status: "Presencia dominante" },
    "Veracruz de Ignacio de la Llave": { cartels: ["CJNG"], color: "#e63946", status: "Presencia dominante" },
    "Aguascalientes": { cartels: ["CJNG"], color: "#e63946" },
    "Querétaro": { cartels: ["CJNG"], color: "#e63946" },
    "Hidalgo": { cartels: ["CJNG"], color: "#e63946" },
    "Puebla": { cartels: ["CJNG"], color: "#e63946" },
    "Oaxaca": { cartels: ["CJNG"], color: "#e63946" },
    "Tabasco": { cartels: ["CJNG"], color: "#e63946" },
    "Morelos": { cartels: ["CJNG"], color: "#e63946" },
    "Quintana Roo": { cartels: ["CJNG"], color: "#e63946" },

    // ── Sinaloa ───────────────────
    "Sinaloa": { cartels: ["Sinaloa"], color: "#2a7de1", status: "Guerra Civil Abierta" },
    "Sonora": { cartels: ["Sinaloa"], color: "#2a7de1", status: "Dominio Chapitos" },
    "Chihuahua": { cartels: ["Sinaloa"], color: "#2a7de1", status: "Presencia dominante" },
    "Durango": { cartels: ["Sinaloa"], color: "#2a7de1", status: "Refugio Mayiza" },
    "Baja California": { cartels: ["Sinaloa"], color: "#2a7de1", status: "Presencia dominante" },
    "Baja California Sur": { cartels: ["Sinaloa"], color: "#2a7de1" },
    "Yucatán": { cartels: ["Sinaloa"], color: "#2a7de1" },
    "Campeche": { cartels: ["Sinaloa"], color: "#2a7de1" },
    "Chiapas": { cartels: ["Sinaloa"], color: "#2a7de1" },

    // ── Cártel del Noreste (CDN) / GOLFO
    "Nuevo León": { cartels: ["Noreste"], color: "#9b59b6", status: "Sede FIFA / Control CDN" },
    "Coahuila de Zaragoza": { cartels: ["Noreste"], color: "#9b59b6", status: "Presencia dominante" },
    "San Luis Potosí": { cartels: ["Noreste"], color: "#9b59b6" },
    "Zacatecas": { cartels: ["Noreste"], color: "#9b59b6", status: "Expansión CDN" },

    // Tamaulipas es el piloto de estado multi-cártel
    "Tamaulipas": { cartels: ["Noreste", "Golfo"], color: "#58d68d", status: "Bicefalia Regional / Zona de Guerra" },

    // ── La Nueva Familia Michoacana ───────────────
    "Tlaxcala": { cartels: ["Michoacana"], color: "#e67e22" },
    "Michoacán de Ocampo": { cartels: ["Michoacana"], color: "#e67e22", status: "Ofensiva de recuperación" },
    "Guerrero": { cartels: ["Michoacana"], color: "#e67e22", status: "Ofensiva de recuperación" },
    "México": { cartels: ["Michoacana"], color: "#e67e22", status: "Disputa Valle de México" },
};

export interface FactionInfo {
    name: string;
    leaders?: string[];
    units?: string[];
    focus?: string;
}

export interface CartelInfo {
    id: string;
    name: string;
    color: string;
    status: string;
    leaders?: string[];
    units?: string[];
    factions?: FactionInfo[];
    situation: string;
    foreign_designation?: string;
    economic_impact?: string;
    risk_level_fifa2026?: string;
}

export const CARTEL_LEGEND: CartelInfo[] = [
    {
        id: "CJNG",
        name: "Cártel Jalisco Nueva Generación",
        color: "#e63946",
        status: "Crisis Sucesoria / Riesgo de Balcanización",
        leaders: ["Juan Carlos Valencia ('El 3')", "Ricardo Ruiz Velasco ('El Doble R')", "Julio Alberto Castillo Rodríguez"],
        foreign_designation: "FTO (Foreign Terrorist Organization) por EE.UU.",
        economic_impact: "Extorsión sistémica y robo de hidrocarburos",
        risk_level_fifa2026: "Crítico (Epicentro Guadalajara)",
        situation: "Tras la muerte de 'El Mencho', el ala financiera choca con el mando operativo. Rebelión de células periféricas."
    },
    {
        id: "Sinaloa",
        name: "Cártel de Sinaloa",
        color: "#2a7de1",
        status: "Guerra de Exterminio Interno",
        factions: [
            { name: "Los Chapitos", leaders: ["Iván Archivaldo Guzmán Salazar"], focus: "Fentanilo / Designación FTO" },
            { name: "La Mayiza", leaders: ["Ismael Zambada Sicairos ('El Mayito Flaco')"], focus: "Logística tradicional" },
            { name: "Los Guanos", leaders: ["Aureliano Guzmán Loera"], focus: "Triángulo Dorado" }
        ],
        economic_impact: "Lavado de dinero corporativo y dominio de opioides sintéticos",
        risk_level_fifa2026: "Medio (Riesgo en Mazatlán/Zonas turísticas)",
        situation: "Guerra civil desde la captura de 'El Mayo' en 2024. Los Chapitos usan tácticas de narcoterrorismo urbano."
    },
    {
        id: "Noreste",
        name: "Cártel del Noreste (CDN)",
        color: "#9b59b6",
        status: "Estructura Paramilitar Monolítica",
        leaders: ["Juan Cisneros Treviño ('La Sombra')"],
        economic_impact: "Depredación económica local y control aduanero",
        risk_level_fifa2026: "Alto (Sede Monterrey bajo presión)",
        situation: "Control férreo de Nuevo Laredo. Utilizan a 'La Tropa del Infierno' para imponer un Estado paralelo."
    },
    {
        id: "Golfo",
        name: "Cártel del Golfo (CDG)",
        color: "#1abc9c",
        status: "Atomización Extrema",
        factions: [
            { name: "Los Metros", leaders: ["'El Fayuca'"] },
            { name: "Los Escorpiones", leaders: ["José Alberto García Vilano ('La Kena')"] },
            { name: "Los Ciclones" }
        ],
        economic_impact: "Tráfico de migrantes y contrabando de combustible",
        situation: "Archipiélago de células regionales que controlan el litoral este de Tamaulipas."
    },
    {
        id: "Michoacana",
        name: "La Nueva Familia Michoacana",
        color: "#e67e22",
        status: "Ofensiva de Recuperación",
        leaders: ["Johnny Hurtado Olascoaga ('El Pez')", "José Alfredo Hurtado Olascoaga ('El Fresa')"],
        economic_impact: "Extorsión agrícola (Aguacate y Limón)",
        situation: "Alianza con 'Cárteles Unidos' para expulsar al CJNG de Tierra Caliente aprovechando el vacío de poder."
    }
];
