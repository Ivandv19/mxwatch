import type { Metadata } from "next";

/**
 * Metadatos SEO para la página legal de privacidad.
 */
export const meta Metadata = {
    title: "Política de Privacidad — mxwatch",
    description: "Política de privacidad y manejo de datos de mxwatch.",
};

/**
 * Página estática de Política de Privacidad.
 * Detalla el compromiso de no-recopilación de PII y el uso ético de analíticas.
 */
export default function PrivacyPage() {
    return (
        <article className="max-w-3xl mx-auto px-4 py-20 text-[#8b98b8] leading-relaxed">
            <h1 className="text-3xl font-bold text-[#f0f4ff] mb-2">Política de Privacidad</h1>
            <p className="text-sm text-accent font-medium mb-12 uppercase tracking-widest">Última actualización: 30 de abril de 2026</p>

            {/* Sección 1: Declaración de no recopilación de datos personales */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">1. Recopilación de Datos</h2>
                <p>
                    En <strong>mxwatch</strong>, priorizamos su privacidad. No recopilamos información de identificación personal (PII) de nuestros usuarios. No requerimos registro ni cuentas para acceder a la funcionalidad principal del mapa.
                </p>
            </section>

            {/* Sección 2: Transparencia sobre herramientas de análisis */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">2. Analíticas de Uso</h2>
                <p>
                    Utilizamos herramientas de análisis que respetan la privacidad para entender de forma agregada y anónima cómo se utiliza la plataforma. Esto nos ayuda a mejorar el rendimiento y la experiencia de usuario sin rastrear identidades individuales ni recopilar datos sensibles.
                </p>
            </section>

            {/* Sección 3: Uso de almacenamiento local del navegador */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">3. Cookies y Almacenamiento Local</h2>
                <p>
                    Es posible que utilicemos el almacenamiento local de su navegador para guardar preferencias de visualización (como el estado del mapa o temas). Estas herramientas no se utilizan para rastrear su actividad fuera de este sitio.
                </p>
            </section>

            {/* Sección 4: Responsabilidad sobre enlaces externos */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">4. Enlaces a Terceros</h2>
                <p>
                    Nuestra plataforma puede contener enlaces a otros sitios de interés o fuentes de datos. Una vez que utilice estos enlaces para abandonar nuestro sitio, debe notar que no tenemos control sobre ese otro sitio web y no somos responsables de la protección y privacidad de cualquier información que proporcione.
                </p>
            </section>

            {/* Sección 5: Compromiso con la seguridad de la infraestructura */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">5. Seguridad</h2>
                <p>
                    Estamos comprometidos a asegurar que su información esté segura. Para prevenir el acceso o divulgación no autorizados, hemos puesto en marcha procedimientos físicos, electrónicos y administrativos para salvaguardar y asegurar la información que recolectamos en línea.
                </p>
            </section>

            <div className="mt-20 pt-8 border-t border-white/10 text-center">
                <p className="text-sm">La privacidad es un derecho, no un privilegio. Gracias por confiar en mxwatch.</p>
            </div>
        </article>
    );
}