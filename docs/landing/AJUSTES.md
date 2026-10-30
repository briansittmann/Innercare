# Ajustes al guion de la landing

Decisiones del usuario (2026-10-30) sobre `LANDING_SPEC.md` y `landing-borrador.html`. **Donde choquen con el guion, mandan estas.** Donde el guion choque con `CLAUDE.md` en cuestiones de stack (Tailwind con `@tailwindcss/postcss`, Instrument Sans, `src/data` de `legacy`), manda `CLAUDE.md`: el proyecto ya está armado en TypeScript, con `@tailwindcss/turbopack`, Hanken Grotesk y Source Sans 3, y el contenido en `content/`.

## Hero

- **Se queda como está en la rama `rediseno`**: título, degradé, fibras, busto, botones y entrada orquestada. No se adopta el hero del guion (texto a la izquierda y cuerpo anclado al 68 %).
- Se suman dos cosas, como en el borrador:
  - Debajo de los botones, la línea: "Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en todo el país."
  - Centrado abajo, el aviso "Deslizá para recorrer el cuerpo".
  - Las dos entran en la línea de tiempo de la intro (`components/intro.ts`), no con entrada propia.

## Páginas

- **Una sola página** por ahora. Si después hacen falta más, se plantean con el cliente.
- **Nosotros:** se borra (`app/nosotros/`) y salen sus links.
- **Casos a medida:** no se hace. Salen los links a `/casos-a-medida` y la sección "Casos a medida" de la home.
- **Productos (`/productos`):** el código queda, pero ningún link lleva ahí.
- **Fichas (`/productos/[slug]`):** se quedan. La miga de pan vuelve al inicio (`/#recorrido`), no a `/productos`.
- La landing hace de catálogo y de galería de casos: cada parada del recorrido muestra el implante con su información.

## Botones y links

Tres intenciones nada más: recorrer, ver ficha y contactar.

- Contacto: **"Plantear un caso"** en todos lados (header, hero, tarjetas a medida, cierre del recorrido y CTA final). Reemplaza a "Contactar". Abre el panel de contacto existente (`/contacto`), con `?motivo=` o `?producto=` cuando corresponda.
- Hero: el principal pasa a "Plantear un caso" (contacto) y el de vidrio (`BotonVidrio`) a "Recorrer los implantes" (`#recorrido`). Mismo diseño; solo cambian texto y destino.
- Paradas de catálogo (hombro reverso, endoprótesis femoral): "Ver ficha del producto" a su ficha. La endoprótesis suma "Ficha técnica (PDF)", que ya está en `public/`.
- Paradas a medida (craneoplastía, maxilar, acetábulo, intercalar de fémur): sin "Ver el caso". La tarjeta cuenta el caso con los datos de `content/customCases.ts` y lleva "Plantear un caso" al contacto con el motivo de caso a medida precargado.
- Cierre del recorrido: un solo botón, "Plantear un caso". Sin "Ver catálogo" ni "Ver casos a medida".
- Los casos que no entran en el recorrido (biomodelos, corrección de desvío, estructura porosa, craneoplastía en PMMA) pueden ir como ejemplos en "Cómo trabajamos", sin página propia.

## Diseño

- **Prioridad: que la página se vea moderna y atractiva.** Es lo que la va a vender. Se busca un nivel visual de producto actual, no de web institucional genérica.
- Esto reemplaza dos reglas de `CLAUDE.md`: React Bits ya no es "solo acento puntual" (se puede usar donde sume, a través del MCP de shadcn) y el movimiento puede subir por encima de "motion 4".
- Se pueden usar fondos animados (React Bits u otros) donde queden bien, como las fibras del hero.
- Lo que se mantiene:
  - Credibilidad de fabricante médico: datos reales, sin copy de marketing hueco, tipografía y tokens de marca (`globals.css`), primario `#003c6f`.
  - El procedimiento de React Bits de `CLAUDE.md`: código con `shadcn view` (nunca `shadcn add`), dependencias justificadas, colores y fuentes propios reemplazados por los tokens y `prefers-reduced-motion`.
  - Nada de fade-up genérico en cada sección: el movimiento tiene que tener una idea.
- Rendimiento: el hero ya tiene WebGL y fibras. Los fondos nuevos van livianos (CSS o canvas 2D antes que otro contexto WebGL), se pausan fuera de pantalla y nunca hay más de uno visible a la vez con el 3D.

## Navegación

- Menú de la barra superior: Implantes, Cómo trabajamos, Fabricación, Habilitaciones (anclas a las secciones de la home).
- Se quita el índice lateral de secciones de la home (`components/home/section-index.tsx`). Lo reemplaza el índice anatómico del recorrido del borrador: cráneo, maxilar, hombro, acetábulo, fémur proximal, diáfisis femoral.

## Recorrido por el cuerpo

- Las seis paradas del guion definen los implantes que hay que modelar: craneoplastía (ya hecha), maxilar, hombro reverso, acetábulo, endoprótesis femoral (fémur proximal) e intercalar de fémur (diáfisis).
- Va el cuerpo entero, con el ensamble de partículas a modelo sólido del guion.

## Cómo trabajamos cada caso

- La pieza que se transforma (cortes de TC → hueso con zona a resecar → implante y guías) tiene que tener **bastante más detalle** que el borrador. La presentación del borrador gustó mucho: se mantiene la idea y se mejora la ejecución.

## Método

- Se avanza y se itera: primero armarlo, después ir ajustando y mejorando.
