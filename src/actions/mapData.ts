"use server";

import { hc } from "hono/client";
// @ts-ignore: Importamos los tipos inferidos desde el backend hermano (mxwatch-api)
import type { AppType } from "../../../mxwatch-api/src/index";
import type {
  LiveStatePresence,
  LiveCartelDetails,
  LiveStateIntelligence,
} from "../types/api.types";

// URL base de la aplicación (limpia cualquier sufijo /api para evitar el doble prefijo /api/api)
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

// El cliente de Hono añade automáticamente los prefijos definidos en app.route('/api', api)
// Por lo tanto, la base para hc debe ser la raíz del servidor.
const API_URL = API_BASE.replace(/\/api$/, "");

// Instancia RPC con la API Key configurada globalmente
const client: any = hc<AppType>(API_URL, {
  headers: {
    "x-api-key": process.env.API_KEY || "",
  },
});

// Envuelve una promesa en un timeout para evitar peticiones colgadas
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 8000,
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Request timeout")),
      timeoutMs,
    );
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId!),
  );
}

// --- ACCIONES DE FETCHING (Server Actions) ---

export async function getLiveMapData(): Promise<LiveStatePresence[]> {
  try {
    const res = await fetchWithTimeout<any>(client.api.map.$get()); // Petición GET al mapa
    if (!res.ok) throw new Error("Failed to fetch map data");

    const json = await res.json(); // Parsea la respuesta JSON
    return json.data as LiveStatePresence[]; // Retorna los datos tipados de presencia
  } catch (error) {
    console.error("Error [getLiveMapData]:", error);
    return [];
  }
}

export async function getCartelDetails(
  cartelSlug: string,
): Promise<LiveCartelDetails | null> {
  try {
    const res = await fetchWithTimeout<any>(
      client.api.cartel[":slug"].$get({
        param: { slug: cartelSlug }, // Petición usando el slug como parámetro
      }),
    );

    if (!res.ok) {
      if (res.status === 404) return null; // Retorna null si no existe
      throw new Error("Failed to fetch cartel details");
    }

    const json = await res.json(); // Parsea la respuesta JSON
    return json.data as LiveCartelDetails; // Retorna detalles completos del cártel
  } catch (error) {
    console.error("Error [getCartelDetails]:", error);
    return null;
  }
}

export async function getAllCartelsBasic() {
  try {
    const res = await fetchWithTimeout<any>(client.api.cartels.$get()); // Lista de todos los cárteles
    if (!res.ok) throw new Error("Failed to fetch cartels");

    const json = await res.json(); // Parsea la respuesta JSON
    return json.data; // Retorna nombres, slugs y colores básicos
  } catch (error) {
    console.error("Error [getAllCartelsBasic]:", error);
    return [];
  }
}

export async function getStateIntelligence(
  stateName: string,
): Promise<LiveStateIntelligence | null> {
  try {
    const res = await fetchWithTimeout<any>(
      client.api.state[":name"].$get({
        param: { name: stateName }, // Consulta inteligencia por nombre de estado
      }),
    );

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch state intelligence");
    }

    const json = await res.json(); // Parsea la respuesta JSON
    return json.data as LiveStateIntelligence; // Retorna presencias, líderes y notas tácticas
  } catch (error) {
    console.error("Error [getStateIntelligence]:", error);
    return null;
  }
}
