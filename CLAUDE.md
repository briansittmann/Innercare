@AGENTS.md

# Innercare — web corporativa

Web institucional de Innercare, fabricante argentino de implantes ortopédicos modulares y a medida del paciente (titanio, CNC e impresión 3D, habilitado por ANMAT). Público: cirujanos, hospitales y compras institucionales. Los textos de la interfaz van en español rioplatense (voseo: "Contactanos", "Enviános").

## Situación

- **La web no está en uso.** No hay producción que proteger ni usuarios reales: se puede romper, rehacer y reestructurar sin migraciones ni compatibilidad hacia atrás.
- **Habrá un único lanzamiento, al final, con el 3D incluido.** No hay lanzamientos parciales: no hace falta pulir para producción lo que todavía va a cambiar.
- Ramas:
  - `main`: proyecto Next.js, donde se trabaja.
  - `legacy`: web Vite + React Router anterior, solo como referencia. No se modifica.
  - `master`: igual que `legacy`. Se borra cuando Vercel y GitHub apunten a `main`.

## Stack

- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript `strict` + `noUncheckedIndexedAccess`.
- `next.config.ts` trae activados `cacheComponents` y `partialPrefetching` (los valores por defecto de `create-next-app`). Esto cambia las reglas de datos dinámicos, como `new Date()` o `cookies()` en Server Components: consultá `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` antes de usarlos.
- Tailwind CSS v4 con el loader `@tailwindcss/turbopack`, sin PostCSS ni `tailwind.config`. Los tokens están en `app/globals.css` (`@theme`).
- ESLint 9 con flat config (`eslint.config.mjs`, `eslint-config-next`). No subir a ESLint 10 hasta que `eslint-plugin-react`, `import` y `jsx-a11y` lo admitan.
- Node 24 (`.nvmrc`, `engines: 24.x`).
- Fuentes con `next/font/google` (Hanken Grotesk y Source Sans 3, auto-hospedadas).

## Estructura

- `app/`: rutas, layout y `globals.css`.
- `content/`: textos y datos tipados (`types.ts`, `company.ts`, `products.ts`, `customCases.ts`). **Es la única fuente de verdad del contenido.** Sale de la carpeta institucional y del brochure: no inventar cifras, indicaciones, resultados clínicos ni certificaciones. La línea distribuida (AK Medical) queda fuera hasta resolver los permisos.
- `public/`: imágenes (`img/`), `logo.png`, `favicon.png` y el PDF de la ficha del fémur.
- `docs/`: material de referencia que **no se lee por defecto** (ver abajo).

## Comandos

`npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit`

Antes de dar algo por terminado: el build y el lint tienen que pasar sin errores.

## Reglas de herramientas

- **Context7, siempre** antes de usar APIs de Next.js, React, Tailwind, GSAP, React Three Fiber, Drei o Three.js. No te fíes de la memoria.
  - En Next.js, la versión instalada (16.4) es más nueva que la última de Context7 (16.2.x). Contrastá además con la documentación incluida en `node_modules/next/dist/docs/` y, si no coinciden, manda esa.
- **Taste Skill (`design-taste-frontend`)** para cualquier decisión de interfaz.
  - Respetá los tokens de marca (primario `#003c6f`, tipografías y escalas de `globals.css`).
  - Tono clínico y técnico de un fabricante de productos médicos: sobrio, preciso y creíble.
  - Nada de estética de startup: sin gradientes llamativos, sin glassmorphism decorativo, sin copy de marketing hueco.
- **React Bits, solo como acento puntual**, a través del MCP de shadcn (`.mcp.json`) o con `npx shadcn add @react-bits/<Nombre>-TS-TW`. Antes de añadir un componente:
  1. Revisá sus `dependencies` (p. ej. `SplitText` añade `gsap` y `@gsap/react`) y justificá cada dependencia nueva.
  2. Adaptalo a nuestros tokens: nada de colores ni fuentes propios del componente.
  3. Comprobá que respete `prefers-reduced-motion`. Si no lo hace, añadilo.
  - `components.json` tiene `cssVariables: false` para que shadcn no escriba sus variables de tema en `globals.css`.

## Dirección visual

- Lectura (Taste Skill): web institucional B2B de un fabricante regulado de productos médicos, para cirujanos y compras hospitalarias. Lenguaje claro, técnico y preciso. Diales: variance 5, motion 4, density 4.
- La firma visual será la pieza 3D del hero: una figura anatómica translúcida con el implante de titanio visible (ver `docs/referencias/`). La translucidez vive en el objeto 3D, nunca en la interfaz. Hasta la fase 3D, el hueco lo ocupa una foto (`components/home/hero.tsx`).
- Tema único claro (sin modo oscuro). Un solo acento: `primary`.
- Formas: lo interactivo es pill (`rounded-full`); superficies e imágenes, `rounded-xl` (12 px).
- Titulares: `display-xl` (hero) y `display-lg` (secciones), fluidos con `clamp()`. Datos técnicos en `font-data-mono tabular-nums`.
- Iconos: Phosphor (`@phosphor-icons/react/ssr`, peso `light` en iconos de contenido). `content/` usa claves semánticas (`IconKey`) y `components/icon.tsx` las traduce.
- Movimiento solo con CSS (`.rise-in` y `.reveal` en `globals.css`): sin librería y sin ocultar contenido si no hay JS.
- Copy visible: sin guiones largos (`—`), una etiqueta por intención de CTA ("Ver catálogo", "Ver casos a medida", "Contactar") y como máximo un eyebrow cada tres secciones.
- Contenedor de página: utilidad `page-container`.

## Problemas conocidos

- Si un cambio de `globals.css` no aparece en el build, borrá `.next/` (la caché de Turbopack con `@tailwindcss/turbopack` no siempre se invalida).

## Referencias (no leer por defecto)

- `docs/INFORME_PROYECTO.md`: diagnóstico de la web anterior (`legacy`). Es largo: consultalo solo cuando haga falta un dato concreto (textos literales, inventario de imágenes, problemas detectados).
- `docs/referencias/`: dos capturas de referencia visual para el rediseño ("más moderna", "translucido").

## Estado

### Fase 0: base del proyecto (completada)

- [x] Rama `legacy` creada desde `master` y subida.
- [x] Next.js limpio en `main`: App Router, TS strict, Tailwind v4, Node 24.
- [x] MCP de shadcn configurado con el registro `@react-bits`.
- [x] Porteado desde `legacy`: `src/data` → `content/` (TS tipado), `public/` y los tokens `@theme`.
- [x] Build y lint pasan.
- [ ] Vercel (Production Branch → `main`, preset Next.js): lo hace el usuario con Claude en el navegador. GitHub ya tiene `main` como rama por defecto.

### Fase 1: diseño visual (en curso)

- [x] Header con menú móvil, footer y home: hero, habilitaciones, fabricación propia, proceso, casos a medida y CTA de contacto.
- [ ] Productos, Ficha de producto, Casos a medida, Nosotros, Contacto y 404.

### Pendiente para fases siguientes

- Formulario de contacto con envío real (la versión `legacy` no enviaba nada).
- `metadataBase` con el dominio definitivo, metadatos por página, `sitemap` y `robots`.
- Fotos en mayor resolución: varias de casos tienen menos de 650 px y se ven blandas en las celdas grandes.
- Fase 3D (R3F / Drei / Three.js).

## Convenciones

- Código: comillas simples, sin punto y coma, comentarios en español.
- Commits en inglés, en imperativo.
