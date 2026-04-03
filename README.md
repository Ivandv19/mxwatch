# MXWatch (Dashboard Interactivo)

## Descripción

Este proyecto es el tablero visual (Dashboard) de la plataforma MXWatch. Funciona como un mapa interactivo diseñado para consultar y monitorear de forma dinámica la presencia y datos geográficos de diferentes zonas en todo el territorio mexicano.

## Características

- **Mapa Táctico Interactivo**: Visualización gráfica del país donde los colores identifican el estado y control de áreas de forma simplificada.
- **Búsqueda Dinámica**: Buscador integrado para encontrar zonas y registros específicos desde un panel lateral.
- **Análisis Desglosado**: Capacidad interactiva de seleccionar y examinar los detalles, metadatos y resúmenes de cualquier estado rápidamente.
- **Rendimiento Visual**: Construido bajo un tema oscuro exclusivo con herramientas de atajos rápidos de teclado para minimizar la fatiga visual.

## Secciones

1. **Lienzo Central**: El mapa principal de exploración donde puedes interactuar con el diseño gráfico.
2. **Panel de Búsqueda (Sidebar)**: Lista lateral donde se encuentran organizados los diferentes datos o grupos disponibles en la plataforma.
3. **Detalles de Zona**: Recuadro de información estructurada que se despliega al dar un clic directo sobre algún estado.

## Uso

- **Visualizar Contenido**: El proyecto web ya está finalizado. Puedes visitarlo directamente aquí: [MXWatch](https://mxwatch.mgdc.site/).
- **Exploración Rápida**: Pasa el ratón por todo el plano del mapa general y haz clic en alguna región geográfica para ver la información.
- **Búsqueda Directa**: Escribe y usa la barra lateral buscando palabras clave para iluminar esa zona específica y obscurecer el resto.

## Tecnologías Utilizadas

- HTML / CSS / TypeScript
- Next.js 16
- React
- Tailwind CSS
- Zustand
- Bun

## Instalación

1. **Clonar el Repositorio**: Descarga el código de este proyecto en tu máquina usando Git.

```bash
git clone https://github.com/Ivandv19/mxwatch.git
```

2. **Instalar Dependencias**: Abre una terminal en la raíz de tu proyecto y ejecuta el siguiente comando:

```bash
bun install
```

3. **Configuración**: Crea un archivo `.env.local` en la raíz del proyecto y configura la variable `NEXT_PUBLIC_API_URL` apuntando a tu instancia del backend para recibir los datos del mapa.

4. **Iniciar el Proyecto**: Enciende y visualiza el tablero de mandos localmente con:

```bash
bun run dev
```

## Créditos

Este proyecto administra la visualización geográfica central e interactiva para el sistema de mapas.

- Desarrollado por Ivan Cruz.

## Despliegue

La aplicación se encuentra estructurada y preparada para exportarse fluidamente mediante infraestructuras como Cloudflare Pages. Puedes visitar el sitio en vivo aquí: [mxwatch.mgdc.site](https://mxwatch.mgdc.site/)

## Licencia

Licencia de Uso Personal:

Este software es propiedad de **Ivan Cruz**. Se permite el uso de este software solo para fines personales y no comerciales. No se permite la distribución, modificación ni uso comercial de este software sin el consentimiento expreso de **Ivan Cruz**.

Cualquier uso no autorizado puede resultar en acciones legales.
