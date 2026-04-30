/**
 * Configuración principal de Next.js.
 * Define ajustes de runtime, optimizaciones y comportamiento del framework.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Configuración de indicadores visuales en modo desarrollo.
   * Posiciona el badge de "Development" en la esquina inferior derecha para no interferir con el layout principal.
   */
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;