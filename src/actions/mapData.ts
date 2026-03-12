
/**
 * Cliente API (Hono RPC)
 * Conecta el frontend con mxwatch-api para consumo tipado (E2E) de datos.
 */
'use server'; // <- Directiva de Next.js: Indica que estas funciones SOLO se ejecutan en el servidor de Node.js, nunca en el navegador web del usuario.

import { hc } from 'hono/client';
// @ts-ignore: Importamos los tipos inferidos desde el backend hermano (mxwatch-api)
import type { AppType } from '../../../mxwatch-api/src/index';
import type { LiveStatePresence, LiveCartelDetails, LiveStateIntelligence } from '../types/api.types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api').replace('/api', '');

// Instancia RPC casteada a 'any' temporalmente para sortear reglas estrictas cross-repo de Next.js
const client: any = hc<AppType>(API_URL);

// -----------------------------------------------------------------------------
// UTILIDAD DE TIMEOUT
// Evita que el frontend de Next.js se quede colgado si la VPS tarda en responder
// -----------------------------------------------------------------------------
async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId!));
}



// -----------------------------------------------------------------------------
// FUNCIONES DE FETCHING AL BACKEND (Server Actions de Next.js)
// 
// IMPORTANTE: ¿Son Server Actions o simples fetchs?
// Son AMBAS cosas. 
// 1. Son "Simples fetchs" porque detrás de escena usan el cliente de Hono (hono/client) 
//    para hacer una petición HTTP GET convencional hacia nuestro backend remoto (localhost:8787).
// 2. Son "Server Actions" de Next.js porque tienen la directiva 'use server' arriba. 
//    Esto significa que si un componente de React llama a `getLiveMapData()`, Next.js intercepta esa
//    llamada, la resuelve en tu propio servidor intermedio (Next Server) y le devuelve solo 
//    el resultado limpio al navegador del cliente web, escondiendo la URL de Hono.
// -----------------------------------------------------------------------------

export async function getLiveMapData(): Promise<LiveStatePresence[]> {
    try {
        const res = await fetchWithTimeout<any>(client.api.map.$get());
        if (!res.ok) throw new Error('Failed to fetch map data');

        const json = await res.json();
        return json.data as LiveStatePresence[];
    } catch (error) {
        console.error("Error obteniendo datos del mapa en vivo desde Hono:", error);
        return [];
    }
}

export async function getCartelDetails(cartelSlug: string): Promise<LiveCartelDetails | null> {
    try {
        const res = await fetchWithTimeout<any>(client.api.cartel[':slug'].$get({
            param: { slug: cartelSlug }
        }));

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch cartel details');
        }

        const json = await res.json();
        return json.data as LiveCartelDetails;
    } catch (error) {
        console.error("Error obteniendo detalles del cártel desde Hono:", error);
        return null;
    }
}

export async function getAllCartelsBasic() {
    try {
        const res = await fetchWithTimeout<any>(client.api.cartels.$get());
        if (!res.ok) throw new Error('Failed to fetch cartels');

        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error("Error obteniendo lista de cárteles desde Hono:", error);
        return [];
    }
}

export async function getStateIntelligence(stateName: string): Promise<LiveStateIntelligence | null> {
    try {
        const res = await fetchWithTimeout<any>(client.api.state[':name'].$get({
            param: { name: stateName }
        }));

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch state intelligence');
        }

        const json = await res.json();
        return json.data as LiveStateIntelligence;
    } catch (error) {
        console.error("Error fetching state intelligence desde Hono:", error);
        return null;
    }
}

