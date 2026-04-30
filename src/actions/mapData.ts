"use server";

import { hc } from "hono/client";
// @ts-ignore: Tipos inferidos desde el backend hermano (mxwatch-api) para type-safety end-to-end
import type { AppType } from "../../../mxwatch-api/src/index";
import type {
  LiveStatePresence,
  LiveCartelDetails,
  LiveStateIntelligence,
} from "../types/api.types";

// Configuración de la URL base de la API.
// Se normaliza para evitar duplicidad de prefijos (/api/api) ya que el cliente Hono los maneja.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const API_URL = API_BASE.replace(/\/api$/, "");

// Cliente RPC de Hono con autenticación mediante API Key global.
const client: any = hc<AppType>(API_URL, {
  headers: { "x-api-key": process.env.API_KEY || "" },
});

/**
 * Ejecuta una promesa con un límite de tiempo para evitar bloqueos en el servidor.
 * @param promise - La operación asíncrona a ejecutar
 * @param timeoutMs - Tiempo límite en milisegundos (default: 8000ms)
 */
async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId!));
}

// --- Server Actions para obtención de datos de inteligencia ---

/** Obtiene la presencia territorial de cárteles por estado para el mapa principal */
export async function getLiveMapData(): Promise<LiveStatePresence[]> {
  try {
    const res = await fetchWithTimeout<any>(client.api.map.$get());
    if (!res.ok) throw new Error("Failed to fetch map data");
    const json = await res.json();
    return json.data as LiveStatePresence[];
  } catch (error) {
    console.error("Error [getLiveMapData]:", error);
    return [];
  }
}

/** Obtiene el perfil detallado de un cártel específico por su slug */
export async function getCartelDetails(cartelSlug: string): Promise<LiveCartelDetails | null> {
  try {
    const res = await fetchWithTimeout<any>(
      client.api.cartel[":slug"].$get({ param: { slug: cartelSlug } })
    );
    if (!res.ok) return res.status === 404 ? null : Promise.reject("Fetch failed");
    const json = await res.json();
    return json.data as LiveCartelDetails;
  } catch (error) {
    console.error("Error [getCartelDetails]:", error);
    return null;
  }
}

/** Obtiene la lista básica de todos los cárteles (nombre, color, slug) para filtros */
export async function getAllCartelsBasic() {
  try {
    const res = await fetchWithTimeout<any>(client.api.cartels.$get());
    if (!res.ok) throw new Error("Failed to fetch cartels");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error [getAllCartelsBasic]:", error);
    return [];
  }
}

/** Obtiene el informe de inteligencia táctica detallado para un estado específico */
export async function getStateIntelligence(stateName: string): Promise<LiveStateIntelligence | null> {
  try {
    const res = await fetchWithTimeout<any>(
      client.api.state[":name"].$get({ param: { name: stateName } })
    );
    if (!res.ok) return res.status === 404 ? null : Promise.reject("Fetch failed");
    const json = await res.json();
    return json.data as LiveStateIntelligence;
  } catch (error) {
    console.error("Error [getStateIntelligence]:", error);
    return null;
  }
}