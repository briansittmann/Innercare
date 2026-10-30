# Landing Innercare — especificación para implementar

Este documento acompaña a `landing-borrador.html`, un prototipo navegable hecho en un solo HTML con canvas 2D. **El prototipo define estructura, textos y tiempos de animación; no es código para copiar.** El cuerpo y los implantes del prototipo son siluetas dibujadas a mano que se reemplazan por modelos 3D reales.

Alcance de esta etapa: **solo la landing (`/`)**. Las demás páginas (catálogo, fichas, casos, nosotros, contacto) vienen después; sus links quedan apuntando a rutas que todavía no existen.

---

## 1. Contexto

- Empresa: Innercare, fabricante argentino de implantes ortopédicos en titanio (sistemas modulares de catálogo + piezas a medida). Planta en Alberti, laboratorio en Caseros.
- Público: cirujanos traumatólogos, hospitales y áreas de compras (licitaciones).
- Competencia principal: Raomed (raomed.com.ar). Su home es un índice estático. Nos diferenciamos con: recorrido 3D, catálogo modular además de casos a medida, proceso explicado, CNC + impresión 3D, habilitaciones ANMAT visibles.
- Repo: `github.com/briansittmann/Innercare`. La versión anterior (Vite + React Router) queda en la rama `legacy`. El proyecto nuevo va en `main`.
- Contenido verificado: reutilizar `src/data/company.js`, `products.js` y `customCases.js` de la rama `legacy`. **No inventar datos** (años de experiencia, países, materiales que no estén en esos archivos).

## 2. Stack

- Next.js (App Router), JavaScript o TypeScript (decidir al inicio y ser consistente).
- Tailwind CSS v4 (`@tailwindcss/postcss`), tokens en `@theme`.
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`.
- Scroll: GSAP + ScrollTrigger (o `ScrollControls` de drei si simplifica). Una sola fuente de verdad para el progreso del scroll.
- Fuentes con `next/font` (Instrument Sans en el prototipo; el estilo visual no está cerrado).
- Landing con SSG. Todo el texto debe estar en el HTML del servidor y ser visible sin JS: las animaciones nunca arrancan con `opacity: 0` en el render del servidor.

## 3. Secciones (en este orden)

| # | Sección | Contenido | Tipo |
|---|---|---|---|
| 1 | Hero | H1 “Implantes en titanio para cada paciente”, bajada, CTA “Plantear un caso” + “Recorrer los implantes”, línea de habilitación ANMAT | Dentro de la escena fija del recorrido |
| 2 | Recorrido por el cuerpo | 6 paradas: craneoplastía, maxilar, hombro reverso, acetábulo, endoprótesis femoral, intercalar de fémur. Card por parada con chip **Catálogo** o **A medida**, miniatura 3D, descripción, specs y link | Escena 3D fija (sticky), ~8 alturas de viewport |
| 3 | Cómo trabajamos cada caso | 3 pasos numerados + pieza que se transforma: cortes de TC → hueso con zona a resecar → implante y guías | Sticky, ~3,4 alturas de viewport |
| 4 | Mecanizado e impresión 3D | Dos tarjetas con animación disparada al entrar en pantalla | Normal |
| 5 | Habilitaciones ANMAT | Tabla con las 4 habilitaciones de `company.js` | Normal, sin animación |
| 6 | Distribución a todo el país | 4 sedes sobre un eje con los extremos rotulados “Norte” y “Sur” | Normal |
| 7 | CTA final | “¿Tenés un caso para resolver?” a la izquierda; a la derecha el logo de Innercare en versión clara y debajo un único botón “Contactar” | Normal |
| — | Footer | Marca, dirección, teléfono | Normal |

Los textos exactos están en `landing-borrador.html`.

## 4. Guion de animación del recorrido

El progreso `p` (0→1) del contenedor del recorrido se divide en 7 tramos entre 8 keyframes:

- k = 0: hero, cuerpo entero.
- k = 1…6: una parada por implante.
- k = 7: cierre, cuerpo entero.

Reglas (son las del prototipo, función `updateTour`):

- `seg = p * 7`. Entre keyframe `k` y `k+1`, la cámara interpola con `e = smoothstep((u - 0.22) / 0.56)`, donde `u` es la fracción del tramo. Así queda una pausa al principio y al final de cada tramo para leer la card.
- La escala de cámara se interpola en escala logarítmica.
- Peso de cada card: `w = 1 - clamp((|seg - i| - 0.22) / 0.24)`. Opacidad = `w`, desplazamiento vertical de ±22 px según la dirección del scroll, `visibility: hidden` cuando `w < 0.02` (para que no reciba foco).
- Ensamble de la miniatura: `A = smoothstep(1 - (|seg - i| - 0.06) / 0.42)`. Las partículas viajan desde una nube hacia la forma con un retraso aleatorio por partícula (0–0,4). Al pasar `A > 0.82` aparece el modelo sólido en metal.
- Opacidad de implantes en el cuerpo: 60 % en el hero, 26 % los inactivos durante el recorrido, 100 % y glow el activo, 95 % todos en el cierre.
- Halo pulsante alrededor del implante activo.
- Hero: se desvanece entre `seg` 0 y 0,35. Cierre: aparece entre 6,55 y 6,85, con el H2 “Lo que está en el catálogo y lo que no, lo fabricamos nosotros.” y los botones “Ver catálogo” y “Ver casos a medida”.
- Índice anatómico lateral (escritorio ≥ 1100 px) visible entre las paradas 1 y 6; cada ítem lleva a su parada.

Cámara:

- Escritorio: en el hero el cuerpo se ancla a la derecha (68 % del ancho) y el texto queda a la izquierda. En las paradas, el implante se ancla al 34 % del ancho y la card a la derecha.
- Móvil (< 820 px): cuerpo centrado y card como hoja inferior. En la card móvil se ocultan las specs.

Otras secciones:

- Proceso: 1.400 partículas, morph entre 3 formas con desfase por partícula; color por tipo (hueso, zona a resecar, metal).
- Fabricación: se dispara una sola vez al entrar al 45 % en pantalla, dura unos 3,8 s y tiene botón “Volver a ver”. CNC: una fresa barre un bloque y el material sobrante se desprende. Aditiva: la pieza crece capa por capa.
- Fuera de esto, nada se mueve solo. Nada de fade-up genérico en cada sección.

## 5. Modelos 3D

- Pendiente: recibir el modelo del cuerpo y los de los implantes. **Mientras tanto, usar primitivas o placeholders** con las mismas posiciones y la misma API, para que reemplazarlos sea cambiar un archivo.
- Formato objetivo: `.glb` comprimido (Draco o Meshopt). Cuerpo e implantes en archivos separados. Versión liviana para móvil.
- Partículas: generarlas desde los vértices o la superficie del propio modelo (`MeshSurfaceSampler`), no desde siluetas.
- Mientras carga el modelo, mostrar una imagen fija del hero; el texto nunca espera al 3D.
- Un solo `<Canvas>` para el recorrido. Las miniaturas de las cards pueden ser vistas del mismo canvas (`<View>` de drei) para no crear varios contextos WebGL.

## 6. Requisitos no negociables

- `prefers-reduced-motion`: todo queda en su estado final; el scroll sigue funcionando sin animaciones automáticas.
- Responsive hasta 360 px. Foco visible con teclado. Contraste AA.
- Metadatos propios de la landing, `og:image` con URL absoluta, `sitemap` y `robots` desde App Router.
- Rendimiento: el bundle de three se carga de forma diferida; LCP en el texto del hero, no en el canvas.
- No usar `localStorage` para nada esencial.

## 7. Fases sugeridas

1. **Base:** proyecto Next en `main`, Tailwind v4 con tokens, layout, header y footer, datos copiados de `legacy`, todas las secciones en HTML estático y responsive, sin 3D.
2. **Recorrido:** escena R3F con placeholders, cámara controlada por scroll según la sección 4, cards sincronizadas.
3. **Partículas y miniaturas:** ensamble de partículas a sólido en las cards.
4. **Proceso y fabricación:** animaciones de las secciones 3 y 4.
5. **Modelos reales:** reemplazar placeholders, optimizar y probar en móvil.

Criterio para cerrar cada fase: `npm run build` y lint sin errores, la página se lee completa con JS desactivado y funciona con reduced motion.
