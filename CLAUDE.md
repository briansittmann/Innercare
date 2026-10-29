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
- **React Bits, solo como acento puntual**, a través del MCP de shadcn (`.mcp.json`) o con `npx shadcn@latest view @react-bits/<Nombre>-TS-TW` (no con `shadcn add`: ver "Dirección visual"). Antes de añadir un componente:
  1. Revisá sus `dependencies` (p. ej. `SplitText` añade `gsap` y `@gsap/react`) y justificá cada dependencia nueva.
  2. Adaptalo a nuestros tokens: nada de colores ni fuentes propios del componente.
  3. Comprobá que respete `prefers-reduced-motion`. Si no lo hace, añadilo.
  - `components.json` tiene `cssVariables: false` para que shadcn no escriba sus variables de tema en `globals.css`.

## Dirección visual

> Rama `rediseno`: **es la dirección visual elegida** (2026-10-29). Reemplaza a la de `main` y se integra a `main` cuando esté lista. Superficies en grises fríos neutros, titulares en peso regular, header con navegación centrada y un 3D provisional en el hero (`components/hero-3d/`: por ahora, el prototipo de cabeza, un busto de vidrio con una craneoplastía de titanio; modelos en `public/modelos/`, generados con `npm run modelos`). Lo que sigue describe `main`, salvo donde esta rama lo cambia.

- Lectura (Taste Skill): web institucional B2B de un fabricante regulado de productos médicos, para cirujanos y compras hospitalarias. Lenguaje claro, técnico y preciso. Diales: variance 5, motion 4, density 4.
- La firma visual será la pieza 3D del hero: una figura anatómica translúcida con el implante de titanio visible (ver `docs/referencias/`). La translucidez vive en el objeto 3D, nunca en la interfaz. Sin WebGL, o mientras carga, se ve una captura fija del modelo (`public/img/cuerpo-inicio.webp`).
  - Única excepción: la navegación de escritorio, de vidrio (`NavGlass` en `components/nav-glass.tsx`, sobre `GlassSurface` de React Bits): la barra superior con `PillNav` dentro y el índice lateral de la home. En Chrome refracta con un filtro SVG y en Safari y Firefox cae a vidrio esmerilado. Con `prefers-reduced-transparency` pasa a opaca (`.nav-glass` en `globals.css`). El vidrio no se extiende a tarjetas, botones ni otras superficies; cualquier pieza de navegación nueva de vidrio usa `NavGlass`. Aparte, el fondo detrás del panel de contacto se desenfoca (`::backdrop`), pero el panel en sí es opaco para que el formulario se lea bien.
- Tema único claro (sin modo oscuro). Un solo acento: `primary`.
- Formas: lo interactivo es pill (`rounded-full`); superficies e imágenes, `rounded-xl` (12 px). Los botones toman el radio de `--radius-control` (hoy pill); el sistema de botones propone 8 px, sin decidir.
- **Botones: seguí `docs/BOTONES.md`** (relieve suave, variables por variante, hover solo con `background-color`, 160 ms). Están implementados como `.boton` + `.boton-primario` / `.boton-claro` / `.boton-relleno`, y `.relieve` + `.relieve-claro` para lo que combina sin ser clickeable (`@layer components` en `globals.css`); no rehagas botones con utilidades sueltas. Leelo antes de crear o tocar un botón, o algo que combine con ellos (pestañas, sellos, tarjetas). El `hover:` de Tailwind ya está redefinido para exigir `(pointer: fine)`.
- Navegación: barra superior entre páginas; en la home, además, un índice lateral de secciones (`components/home/section-index.tsx`, desde `lg`). Cada sección de la home lleva un `id` que coincide con el índice de `app/page.tsx`.
- Titulares: `display-xl` (hero) y `display-lg` (secciones), fluidos con `clamp()`. Datos técnicos en `font-data-mono tabular-nums`.
- Iconos: Phosphor (`@phosphor-icons/react/ssr`, peso `light` en iconos de contenido). `content/` usa claves semánticas (`IconKey`) y `components/icon.tsx` las traduce.
- Barra de escritorio: 62 % del viewport (mínimo 46 rem) y 64 px de alto. Entra solo al cargar el sitio por la home (`data-intro` de `NavIntro`, `.nav-intro-*` en `globals.css`): el contenido se maqueta al ancho final con `100cqw` y el vidrio lo recorta mientras se estira; no lo maquetes al ancho del vidrio.
- Movimiento solo con CSS (`.rise-in` y `.reveal` en `globals.css`): sin librería y sin ocultar contenido si no hay JS. Excepción: los componentes de React Bits animan con JS propio (sin dependencias), siempre respetando `prefers-reduced-motion`.
- Componentes de React Bits: no instalarlos con `shadcn add`, porque corrompe las cadenas de sombras y colores. Sacá el código con `npx shadcn@latest view @react-bits/<Nombre>-TS-TW` y copialo a mano a `components/` (nombre en kebab-case).
- Copy visible: sin guiones largos (`—`), una etiqueta por intención de CTA ("Ver catálogo", "Ver casos a medida", "Contactar") y como máximo un eyebrow cada tres secciones.
- Contenedor de página: utilidad `page-container`.
- Fotos de planta (máquinas, instalaciones): siempre con `PlantPhoto` (blanco y negro con tinte de marca), porque vienen con luz y color dispares. Las de producto y casos, sin tratamiento.

## Datos

- Las páginas leen productos solo con `getProducts()` y `getProductBySlug()` (asíncronas) de `content/products.ts`. Así el origen puede pasar a un CMS sin tocar las vistas.
- Fichas: `generateStaticParams` + `notFound()`. Con Cache Components no existe `dynamicParams`. La primera visita a un slug desconocido responde 200 con `noindex` y después queda cacheada como 404.

## Problemas conocidos

- Si un cambio de `globals.css` no aparece en el build, borrá `.next/` (la caché de Turbopack con `@tailwindcss/turbopack` no siempre se invalida).
- **Cache Components conserva las rutas ocultas con `<Activity>` en vez de desmontarlas.** El estado y el DOM sobreviven a la navegación y los efectos se limpian al ocultarse. Todo lo que abra algo global (diálogos con `showModal()`, bloqueo de scroll, menús) tiene que cerrarlo en la limpieza de un `useLayoutEffect`; si no, queda abierto e invisible y la página se traba. Para estado global usá atributos `data-*` que maneje React, no `:has()`. Guía: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`. Ejemplo: `components/contact/contact-modal.tsx`.

## Referencias (no leer por defecto)

- `docs/BOTONES.md`: sistema de botones (norma; leelo siempre que toques botones).
- `docs/DECISIONES.md`: registro de decisiones con su motivo y lo descartado. Al tomar una decisión de diseño o de arquitectura, añadí una entrada; las reglas resultantes van además en este archivo.
- `docs/INFORME_PROYECTO.md`: diagnóstico de la web anterior (`legacy`). Es largo: consultalo solo cuando haga falta un dato concreto (textos literales, inventario de imágenes, problemas detectados).
- `docs/referencias/`: dos capturas de referencia visual para el rediseño ("más moderna", "translucido").
- `docs/ARQUITECTURA_MODELO_3D.md`: el cuerpo translúcido del hero con seis implantes. Qué se ve, cómo se generan los modelos (Blender por script y atlas anatómicos abiertos) y cómo se integran. Leelo antes de tocar `components/hero-3d/` o `3d/`.

## Estado

### Fase 0: base del proyecto (completada)

- [x] Rama `legacy` creada desde `master` y subida.
- [x] Next.js limpio en `main`: App Router, TS strict, Tailwind v4, Node 24.
- [x] MCP de shadcn configurado con el registro `@react-bits`.
- [x] Porteado desde `legacy`: `src/data` → `content/` (TS tipado), `public/` y los tokens `@theme`.
- [x] Build y lint pasan.
- [x] Vercel despliega `main` en producción y GitHub tiene `main` como rama por defecto.

### Fase 1: diseño visual (en curso)

- [x] Header con menú móvil, footer y home: hero, habilitaciones, fabricación propia, proceso, casos a medida y CTA de contacto.
- [x] Productos (catálogo agrupado por categoría), Ficha de producto (galería, datos, especificaciones y medidas) y Nosotros.
- [x] Contacto: `/contacto` como panel lateral desde el sitio (ruta interceptada en `app/@modal`) y como página completa con enlace directo. Formulario con barra de progreso, validación en línea y precarga por contexto (`?producto=<slug>`, `?motivo=<id>`).
- [ ] Casos a medida y 404 (los enlaces del header y del footer ya apuntan a ellas).

### Pendiente para fases siguientes

- Envío real del formulario de contacto: `sendContact` (`app/contacto/actions.ts`) valida pero todavía no manda nada.
- Envío de casos con estudios adjuntos (segunda etapa del contacto; antes, definir con Innercare cómo recibir datos de salud).
- `metadataBase` con el dominio definitivo, metadatos por página, `sitemap` y `robots`.
- Fotos en mayor resolución: varias de casos tienen menos de 650 px y se ven blandas en las celdas grandes.
- Fase 3D (R3F / Drei / Three.js): plan en `docs/ARQUITECTURA_MODELO_3D.md`. Prototipo de cabeza hecho (busto de vidrio con la craneoplastía en el hero); falta medirlo en el celular y después armar el cuerpo entero. Los parámetros `?medir`, `?calidad` y `?hueso` de la home son del prototipo: se quitan antes del lanzamiento.

## Convenciones

- Código: comillas simples, sin punto y coma, comentarios en español.
- Commits en inglés, en imperativo.
