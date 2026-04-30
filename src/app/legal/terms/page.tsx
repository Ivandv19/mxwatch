import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Términos y Condiciones — mxwatch",
    description: "Términos y condiciones de uso de la plataforma mxwatch.",
};

export default function TermsPage() {
    return (
        <article className="max-w-3xl mx-auto px-4 py-20 text-[#8b98b8] leading-relaxed">
            <h1 className="text-3xl font-bold text-[#f0f4ff] mb-2">Términos y Condiciones</h1>
            <p className="text-sm text-accent font-medium mb-12 uppercase tracking-widest">Última actualización: 30 de abril de 2026</p>

            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">1. Aceptación de los Términos</h2>
                <p>
                    Al acceder y utilizar la plataforma <strong>mxwatch</strong>, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, le rogamos que no utilice nuestro sitio.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">2. Propiedad Intelectual</h2>
                <p>
                    Este software y todo su contenido original son propiedad de <strong>Sinx</strong>. Se otorga una licencia de uso personal y no comercial. Queda estrictamente prohibida la reproducción, distribución o modificación del contenido sin el consentimiento expreso del autor.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">3. Naturaleza de la Información</h2>
                <p>
                    <strong>mxwatch</strong> es una herramienta de visualización basada en fuentes públicas y periodísticas. La información se presenta "tal cual" y con fines exclusivamente informativos. No garantizamos la precisión absoluta o la actualización en tiempo real de los datos geográficos presentados.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">4. Limitación de Responsabilidad</h2>
                <p>
                    Bajo ninguna circunstancia <strong>mxwatch</strong> o sus desarrolladores serán responsables por cualquier pérdida o daño, incluyendo sin limitación, daños indirectos o consecuentes, que surjan del uso de esta plataforma.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-xl font-bold text-[#f0f4ff] mb-4">5. Modificaciones</h2>
                <p>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del sitio tras la publicación de cambios constituye la aceptación de los nuevos términos.
                </p>
            </section>

            <div className="mt-20 pt-8 border-t border-white/10 text-center">
                <p className="text-sm">Si tiene alguna duda sobre estos términos, puede contactarnos a través de los canales oficiales.</p>
            </div>
        </article>
    );
}
