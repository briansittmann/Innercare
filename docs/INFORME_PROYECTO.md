# Informe de diagnóstico — web Innercare

> Documento histórico: describe la web Vite anterior, que hoy vive en la rama `legacy`. No describe el proyecto Next.js de `main`.

Fecha del análisis: 2026-10-27. Análisis de solo lectura sobre la copia local (`master` @ `b9bd474`) y consultas de solo lectura a GitHub (`briansittmann/Innercare`). No se modificó ningún archivo del proyecto, no se instaló nada y no se tocaron ramas (no se hizo `git fetch`). El build de prueba se generó fuera del repo para no sobrescribir `dist/`.

---

## 1. Git

**Remoto:** `origin` → `git@github.com:briansittmann/Innercare.git`

| Rama | Dónde | Commits | Último commit |
|---|---|---|---|
| `master` | local (rama actual) + `origin/master` | 9 | 2026-08-31 19:54 (+01:00) · `b9bd474` "Replace mockup placeholders with the real Innercare material" |
| `contenido-real-carpeta-institucional` | solo local | 9 | igual que `master` (apunta al mismo commit `b9bd474`; es la misma historia, sin commits propios) |
| `main` | solo en GitHub (no existe en local) | 2 | 2026-08-31 14:39 UTC · `42dc34c` "Revise README with detailed project overview" |

**¿`main` y `master` comparten historia? No.**
- Raíz de `master`: `4d894c2` "Initial commit: InnerCare corporate site".
- Raíz de `main`: `0e08aec` "Initial commit" (creado desde la web de GitHub). Ese objeto no existe en el repo local, así que no es ancestro de `master`.
- `main` solo contiene un `README.md` (plantilla en inglés con huecos tipo `[Next.js / React / etc.]`). Todo el código está en `master`.
- **`main` es la rama por defecto del repo en GitHub** (la raíz del repo por defecto solo muestra `README.md`).
- No verificado: qué rama usa Vercel para producción. Hay un commit "trigger vercel deploy" en `master`, así que Vercel parece conectado a `master`, pero la configuración está en el panel de Vercel y no en el repo.

Historial completo de `master`:

```
b9bd474 2026-08-31 19:54 Replace mockup placeholders with the real Innercare material
5897147 2026-08-31 19:53 Add casos a medida page and a 404 route
ceb26d0 2026-08-31 19:53 Add brochure-derived assets and drop the Vite starter favicon
5a093f8 2026-08-31 19:02 Add WhatsApp CTA card to contact page
26e75ec 2026-08-31 18:18 Make the header logo scroll to top and close the mobile menu
5964be2 2026-08-31 18:12 Add working mobile nav menu and fix hamburger hover shape
170e0a3 2026-08-31 18:01 trigger vercel deploy
3334331 2026-08-31 17:38 Normalize brand name to "Innercare" and add product filters
4d894c2 2026-08-31 17:24 Initial commit: InnerCare corporate site
```

Estado del árbol de trabajo: limpio, salvo la carpeta sin seguimiento `referencias/`.

---

## 2. Stack

| Aspecto | Valor |
|---|---|
| Framework / build | **Vite 8** (`vite@8.2.2` instalado) con `@vitejs/plugin-react` 6. Es la plantilla oficial "React + Vite" (el `README.md` es el del starter, sin cambios). |
| UI | **React 19.2.8** |
| Lenguaje | **JavaScript** (`.jsx` / `.js`). No hay TypeScript (hay `@types/react` instalado, pero no hay `tsconfig` ni archivos `.ts`). |
| Router | **react-router-dom 7.18.3**, en modo `BrowserRouter` (SPA). |
| Estilos | **Tailwind CSS v4.3.3** vía `@tailwindcss/vite`. La configuración está en CSS (`@theme` en `src/index.css`); **no hay `tailwind.config.js`**. |
| Animación | **GSAP 3.15** (titulares palabra por palabra y slide-in del catálogo) + transiciones CSS propias con `IntersectionObserver`. |
| Iconos | Fuente **Material Symbols Outlined** (Google Fonts). |
| Lint | **oxlint** (`.oxlintrc.json` con plugins `react` y `oxc`). |
| Tamaño | ~2.480 líneas en `src/`. |

`package.json` completo:

```json
{
  "name": "innercare",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "gsap": "^3.15.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3",
    "tailwindcss": "^4.3.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.1.0",
    "oxlint": "^1.79.0",
    "vite": "^8.2.2"
  }
}
```

Versiones instaladas en `node_modules` (`npm ls --depth=0`): `@tailwindcss/vite@4.3.3`, `@types/react-dom@19.2.5`, `@types/react@19.2.18`, `@vitejs/plugin-react@6.1.1`, `gsap@3.15.0`, `oxlint@1.80.0`, `react-dom@19.2.8`, `react-router-dom@7.18.3`, `react@19.2.8`, `tailwindcss@4.3.3`, `vite@8.2.2`.

`vite.config.js`:

```js
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

## 3. Estructura

Hasta 3 niveles, sin `node_modules`, `dist` ni `.git` (se omiten los `.DS_Store`). Marcado: **[sin seguimiento]** = no está en git; **[local]** = está en `.gitignore` o es config local.

```
.
├── .claude/                       [local]
│   └── settings.local.json
├── .gitignore
├── .oxlintrc.json
├── .vscode/                       [local]
│   └── settings.json
├── README.md                      (README del starter de Vite)
├── index.html                     (meta tags, fuentes, punto de montaje)
├── package.json
├── package-lock.json
├── vercel.json
├── vite.config.js
├── public/
│   ├── endoprotesis-modular-femur-innercare.pdf
│   ├── favicon.png
│   ├── logo.png
│   └── img/                       (28 .jpg; detalle en sección 7)
├── referencias/                   [sin seguimiento]
│   ├── ReferenciaMasModerna.png
│   └── referenciaTranslucido.png
├── src/
│   ├── main.jsx
│   ├── App.jsx                    (router + layout + ScrollToTop)
│   ├── index.css                  (Tailwind v4 + tokens @theme)
│   ├── assets/                    (vacía)
│   ├── components/
│   │   ├── ContactForm.jsx
│   │   ├── CountUp.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductFilters.jsx
│   │   ├── Reveal.jsx
│   │   ├── WhatsAppIcon.jsx
│   │   └── WordReveal.jsx
│   ├── data/
│   │   ├── company.js
│   │   ├── customCases.js
│   │   └── products.js
│   ├── hooks/
│   │   └── useInView.js
│   ├── lib/
│   │   └── motion.js
│   └── pages/
│       ├── About.jsx
│       ├── Contact.jsx
│       ├── CustomCases.jsx
│       ├── Home.jsx
│       ├── NotFound.jsx
│       ├── ProductDetail.jsx
│       └── Products.jsx
└── stitch_innercare_corporate_website/   (mockups de Google Stitch, en git)
    ├── innercare_about_us/        (code.html, screen.png)
    ├── innercare_contact_us/      (code.html, screen.png)
    ├── innercare_design_system/   (DESIGN.md)
    ├── innercare_homepage/        (code.html, screen.png)
    ├── innercare_product_catalog/ (code.html, screen.png)
    └── innercare_product_detail/  (code.html, screen.png)
```

`.gitignore` excluye una carpeta `imagenes` ("Source material (brochures, logos) — kept locally, too large for git"). **No existe en la raíz de esta copia local**, así que el material fuente original (brochures, logos en alta) no está disponible aquí.

---

## 4. Páginas y secciones

Todas las rutas comparten un layout con **Header** (sticky) arriba y **Footer** abajo. Definidas en `src/App.jsx`.

### `/` — Inicio (`pages/Home.jsx`)
1. **Hero:** etiqueta, titular animado con el tagline, párrafo de presentación, 2 botones (catálogo / casos a medida) y foto de la planta CNC con una tarjeta superpuesta.
2. **Compromisos:** 3 tarjetas con icono (Fabricación propia, Implantes a medida, Habilitación y trazabilidad).
3. **Fabricación propia:** título, subtítulo, enlace "Ver catálogo completo" y grilla con las 2 `ProductCard`.
4. **Casos a medida (teaser):** texto con CTA a la izquierda y collage de 3 fotos de casos a la derecha.
5. **Habilitaciones:** 4 tarjetas con las habilitaciones ANMAT y la trazabilidad (organismo, detalle, número).

### `/productos` — Catálogo (`pages/Products.jsx`)
1. **Cabecera:** H1 y párrafo con enlace a casos a medida.
2. **Filtros (aside):** checkboxes de Categoría / Material / Técnica que se generan a partir de los datos, más "Limpiar filtros".
3. **Grilla de productos:** `ProductCard` filtradas, o un mensaje si no hay coincidencias.
   - Si se llega desde el botón del Hero, la página entra con un slide horizontal de GSAP.

### `/productos/:slug` — Ficha de producto (`pages/ProductDetail.jsx`)
1. **Cabecera:** chips de categoría y fabricación, H1 con el nombre, descripción corta, botón "Solicitar…" y botón de descarga de la ficha técnica (solo si hay PDF).
2. **Galería:** imagen principal y miniaturas clicables.
3. **Especificaciones técnicas:** tarjetas Material / Compatibilidad / Indicaciones / Técnica, tabla "Detalle Técnico" y chips de "Medidas Disponibles".
4. **CTA final:** banda azul con un enlace a contacto.
   - Si el slug no existe, muestra un bloque "Producto no encontrado".

### `/casos-a-medida` — Casos a medida (`pages/CustomCases.jsx`)
1. **Hero:** etiqueta, H1 animado, párrafo y foto de una segmentación 3D de pelvis.
2. **Cómo trabajamos cada caso:** 3 pasos numerados (01–03) con icono.
3. **Caso destacado:** implante intercalar de fémur, con 3 fotos con pie, tarjeta "Guías de resección" y tarjeta "Diseño" con 5 viñetas.
4. **Casos desarrollados:** grilla de 8 tarjetas (foto, título, descripción).
5. **CTA final:** banda azul que lleva a contacto.

### `/nosotros` — Nosotros (`pages/About.jsx`)
1. **Hero:** H1 animado, párrafo de trayectoria y foto de la máquina CNC.
2. **Fabricación propia** (`#fabricacion`): 2 tarjetas con foto (manufactura sustractiva / aditiva).
3. **Capacidades:** 4 tarjetas con icono.
4. **Habilitaciones** (`#habilitaciones`): texto a la izquierda y 4 tarjetas con números de disposición.

### `/contacto` — Contacto (`pages/Contact.jsx`)
1. **Cabecera:** H1 y párrafo.
2. **Formulario:** nombre, email, teléfono y mensaje. **No envía nada** (ver sección 9).
3. **Tarjeta WhatsApp:** enlace `wa.me` con un mensaje precargado.
4. **Sede principal:** laboratorio de Caseros, con dirección y 2 teléfonos clicables.
5. **Otras sedes:** planta de Alberti y sucursales de Caleta Olivia y Comodoro Rivadavia.
6. **Cómo llegar:** iframe de Google Maps con la dirección del laboratorio y un enlace "Ver en Google Maps".

### `*` — 404 (`pages/NotFound.jsx`)
1. **Mensaje de error:** "Error 404", H1, texto y 2 botones (inicio / productos).

---

## 5. Componentes

Migración a Next.js (App Router):
- **Casi tal cual:** basta con copiar el archivo y, como mucho, añadir `'use client'` o cambiar un import.
- **Adaptar:** cambios pequeños de API (router, estado de navegación).
- **Reescribir:** hay que cambiar la lógica o la arquitectura.

| Componente / archivo | Qué hace | Migración a Next.js |
|---|---|---|
| `components/Header.jsx` | Logo, navegación de escritorio, botón "Contactar" y menú móvil (Escape, cierre al navegar y al pasar a escritorio). | **Adaptar:** `NavLink`/`useLocation` pasan a `next/link` + `usePathname` (el estado activo se calcula a mano) y lleva `'use client'`. |
| `components/Footer.jsx` | 4 columnas: marca + tagline + ©, productos (generados desde los datos), empresa y contacto. | **Casi tal cual:** cambiar `Link` por `next/link`. Puede ser Server Component. |
| `components/Hero.jsx` | Hero de la home. | **Adaptar:** usa `Link` con `state={{ slideIn: true }}`, algo que Next no tiene (habría que pasarlo por query param o quitarlo). |
| `components/ProductCard.jsx` | Tarjeta de producto: imagen, chip, nombre, descripción, material/técnica y "Ver Detalle". | **Casi tal cual:** `next/link`. Conviene pasar a `next/image`. |
| `components/ProductFilters.jsx` | Aside con grupos de checkboxes de filtros. Componente controlado sin estado propio. | **Casi tal cual** (`'use client'` por los `onChange`). |
| `components/ContactForm.jsx` | Formulario controlado. Al enviar solo muestra "¡Gracias…!". | **UI casi tal cual; lógica a reescribir:** no tiene backend, habría que añadir un Server Action o una route handler con un servicio de email. |
| `components/Reveal.jsx` | Wrapper que aplica fade + slide + blur al entrar en el viewport. Respeta `prefers-reduced-motion`. | **Adaptar:** `'use client'`. Llama a `matchMedia` durante el render, lo que puede provocar un *hydration mismatch* con SSR. Además, el HTML del servidor saldría con `opacity: 0` (contenido invisible sin JS). |
| `components/WordReveal.jsx` | Anima un titular palabra por palabra con GSAP. | **Casi tal cual** (`'use client'`). |
| `components/CountUp.jsx` | Contador animado de cifras ("98%", "25+"). | **No se usa en ninguna página** (código muerto). Si se quiere, casi tal cual con `'use client'`. |
| `components/WhatsAppIcon.jsx` | SVG inline del logo de WhatsApp. | **Casi tal cual.** |
| `hooks/useInView.js` | Hook de `IntersectionObserver` y helper `prefersReducedMotion()`. | **Casi tal cual** (solo cliente). |
| `lib/motion.js` | Constante de retardo escalonado (`step(n) = n*120ms`). | **Casi tal cual.** |
| `data/company.js`, `data/products.js`, `data/customCases.js` | Contenido y datos estructurados (única fuente de verdad del texto institucional). | **Tal cual.** Encajan bien con `generateStaticParams` para las fichas. |
| `App.jsx` (`ScrollToTop`, `Layout`, rutas) | Router, layout y scroll al cambiar de ruta / ancla. | **Reescribir:** lo sustituyen `app/layout.jsx` y la estructura de carpetas de Next (Next ya gestiona el scroll). |
| `pages/*.jsx` | Las 7 vistas. | **Adaptar:** el JSX se reutiliza. `Products` usa `useLocation().state` y GSAP (cliente); `ProductDetail` usa `useParams` (pasa a `params` + `notFound()`). `Home`, `About`, `CustomCases` y `NotFound` son casi directas. |
| `index.css` | Tailwind v4 + tokens `@theme`. | **Tal cual** (Tailwind v4 funciona en Next con `@tailwindcss/postcss`). |

---

## 6. Contenido (textos literales)

Copiados tal cual del código. Los textos que vienen de `src/data/*` se indican con su origen.

### Global — `index.html`

- `<title>`: Innercare — Implantes ortopédicos a medida del paciente
- meta description: Innercare fabrica implantes ortopédicos modulares y a medida del paciente en titanio biocompatible, con planificación quirúrgica 3D. Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en Argentina.
- og:title: Innercare — Innovación tecnológica en beneficio del paciente
- og:description: Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio biocompatible por mecanizado CNC e impresión 3D.

### Global — Header

- Logo: imagen `/logo.png`, alt "Innercare", aria-label "Innercare — Inicio"
- Navegación: Inicio · Productos · Casos a Medida · Nosotros · Contacto
- Botón: Contactar
- Botón móvil (aria-label): Abrir menú / Cerrar menú

### Global — Footer

- Marca (texto): Innercare
- Innovación tecnológica en beneficio del paciente. Fabricación de implantes ortopédicos modulares y a medida del paciente.
- © {año actual} Innercare. Todos los derechos reservados.
- **PRODUCTOS:** Catálogo de productos · Endoprótesis femoral · Prótesis reversa de hombro · Casos a medida
- **EMPRESA:** Sobre nosotros · Habilitaciones ANMAT · Fabricación
- **CONTACTO:** Aráoz de Lamadrid 2741 / B1678EEC Caseros / Provincia de Buenos Aires / +54 9 11 2066-5434 · Contactar

### Inicio (`/`)

**Hero**
- Etiqueta: Innovación Ortopédica
- H1: Innovación tecnológica en beneficio del paciente
- Párrafo: Fabricamos implantes ortopédicos modulares y a medida del paciente en titanio biocompatible, con planificación quirúrgica 3D junto al equipo médico. Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en todo el país.
- Botones: Explorar Catálogo · Ver Casos a Medida
- Tarjeta sobre la imagen: **Planta industrial** — Mecanizado CNC en titanio biocompatible
- Alt de la imagen: Centros de mecanizado CNC en la planta industrial de Innercare

**Compromisos**
- **Fabricación propia** — Mecanizado CNC e impresión 3D en titanio biocompatible, en planta propia y con sistema de gestión de calidad.
- **Implantes a medida** — Planificación quirúrgica virtual 3D, biomodelos y guías de resección desarrollados a pedido médico para cada paciente.
- **Habilitación y trazabilidad** — Habilitados por ANMAT para fabricar, importar y distribuir productos médicos, con trazabilidad de cada unidad.

**Fabricación propia**
- H2: Fabricación propia
- Sistemas modulares en titanio, customizables para adaptarse a la patología de cada paciente.
- Enlace: Ver catálogo completo
- (tarjetas de producto: ver "Componente ProductCard" más abajo)

**Casos a medida**
- Etiqueta: Casos a medida
- H2: Cuando el caso no entra en un catálogo
- Reconstrucciones acetabulares en titanio trabecular, craneoplastías a medida, implantes intercalares de fémur y espaciadores: diseñamos y fabricamos la pieza junto al equipo quirúrgico, a partir de los estudios del paciente.
- Botón: Ver casos desarrollados
- Alts: Craneoplastía a medida en titanio trabecular · Implante acetabular poroso sobre biomodelo del defecto · Implante intercalar de fémur junto a las guías de resección

**Habilitaciones**
- H2: Habilitaciones
- Fabricamos, importamos y distribuimos bajo habilitación de la ANMAT.
- (4 tarjetas: ver `company.js › habilitaciones` más abajo)

### Componente ProductCard (Inicio y Catálogo)

- Chip: Fabricación propia
- Nombre, descripción corta (ver productos)
- DATOS TÉCNICOS — Material: {material} · Técnica: {técnica}
- Botón: Ver Detalle

### Catálogo (`/productos`)

- H1: Catálogo Clínico de Productos
- Sistemas modulares de fabricación propia en titanio biocompatible, customizables para adaptarse a la patología de cada paciente. Para reconstrucciones que requieren una pieza única, trabajamos por [caso a medida].
- Filtros: **Filtros** · CATEGORÍA · MATERIAL · TÉCNICA · Limpiar filtros
  - Opciones generadas a partir de los datos: Reconstrucción articular / Titanio Ti-6Al-4V, Titanio biocompatible / Mecanizado CNC
- Vacío: No hay productos que coincidan con los filtros seleccionados.

### Ficha de producto (`/productos/:slug`)

- Chips: {categoría} · {fabricación}
- H1: {nombre} · párrafo: {descripción corta}
- Botones: Solicitar Este Producto a Medida · Descargar Ficha Técnica (solo si hay PDF)
- Miniaturas (aria-label): Ver imagen {n}: {alt}
- H2: Especificaciones Técnicas
- Tarjetas: **Material** · **Compatibilidad** · **Indicaciones** · **Técnica de fabricación** ("{técnica} en titanio biocompatible")
- Tabla: encabezado "Detalle Técnico"
- H3: Medidas Disponibles
- CTA: **¿Necesitás este producto a medida?** — Nuestros sistemas modulares son customizables y se fabrican a pedido. Contactanos para coordinar las especificaciones exactas que necesita tu paciente. · Botón: Contactar a Innercare
- No encontrado: **Producto no encontrado** — El producto que buscás no existe o fue movido de nuestro catálogo. · Botón: Volver al Catálogo

### Casos a medida (`/casos-a-medida`)

**Hero**
- Etiqueta: Casos a Medida
- H1: Implantes personalizados a medida del paciente
- Planificación quirúrgica virtual 3D. Biomodelos, guías y accesorios desarrollados a pedido médico, fabricados en titanio biocompatible y PMMA.
- Alt: Segmentación 3D de pelvis para planificación quirúrgica virtual

**Cómo trabajamos cada caso**
- Cada implante se desarrolla junto al equipo quirúrgico, desde el estudio del paciente hasta la entrega de la pieza y su instrumental.
- **01 · Planificación quirúrgica virtual 3D** — Sobre los estudios del paciente se segmenta la anatomía, se define el plano de resección y se acuerda la estrategia con el equipo quirúrgico.
- **02 · Diseño del implante y del instrumental** — Se diseña el implante a medida junto con las guías de resección, biomodelos y accesorios que requiere el procedimiento.
- **03 · Fabricación en titanio biocompatible** — Se fabrica por mecanizado CNC o impresión 3D, con estructura trabecular porosa en las áreas de contacto con el hueso.

**Caso destacado**
- Etiqueta: Caso destacado
- H2: Implante intercalar de fémur a medida del paciente
- Reconstrucción de un segmento femoral con implante y guías diseñados a partir de la tomografía del paciente.
- Pies de foto: Estudio del paciente · Guías de resección a medida · Implante y guías fabricados
- **Guías de resección:** Se fabrican dos guías de resección a medida del paciente para realizar las osteotomías. Las mismas se fijan con clavijas roscadas Ø 2,5 mm.
- **Diseño:**
  - Implante intercalar a medida en aleación de titanio (Ti-6Al-4V).
  - Estructura maciza microperforada en las zonas en contacto con tejido blando.
  - Estructura trabecular porosa en las áreas de contacto con el hueso.
  - Alojamientos oblicuos en la parte proximal y distal para tornillos Ø 3,5 mm.
  - Permite la colocación de clavo endomedular anterógrado Ø 10 mm y longitud 360 mm.

**Casos desarrollados**
- Una selección de implantes, guías y espaciadores diseñados y fabricados a pedido médico.
1. **Guías de resección y espaciador en PMMA** — Planificación quirúrgica, fabricación de guías para resección y de espaciador en PMMA con alojamiento para cotilo.
2. **Biomodelos y accesorios a pedido médico** — Biomodelos, guías y accesorios desarrollados a pedido médico a partir de la planificación quirúrgica virtual 3D.
3. **Reconstrucción para anclaje de implantes dentarios** — Planificación quirúrgica y fabricación de implante de reconstrucción de estructura para anclaje de implantes dentarios.
4. **Corrección de desvío con espaciador a medida** — Planificación quirúrgica para corrección de desvío, diseño de espaciador y fabricación de moldes para la confección intraoperatoria del espaciador.
5. **Implante con estructura porosa** — Implante con estructura porosa en las superficies en contacto con el hueso, presentado sobre el biomodelo del defecto.
6. **Reconstrucción acetabular 3D en titanio trabecular** — Segmentación de la prótesis primaria con displasia de cadera, diseño del implante y de los alojamientos para tornillos.
7. **Craneoplastía a medida en PMMA** — A partir de la tomografía se reconstruye el defecto craneal en 3D y se fabrica la pieza a medida en PMMA.
8. **Craneoplastía a medida en titanio trabecular** — Pieza craneal a medida fabricada por impresión 3D en titanio, con estructura trabecular en toda su superficie.

**CTA**
- **¿Tenés un caso para resolver?** — Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a tu equipo. · Botón: Plantear un caso

### Nosotros (`/nosotros`)

**Hero**
- H1: Impulsando la Ortopedia a través de la Precisión
- (trayectoria) Empresa especializada en distribución, fabricación e importación de productos médicos ortopédicos e implantables. Proveedor mediante licitaciones y concursos en todo el país.
- Alt: Centro de mecanizado CNC en la planta industrial de Innercare

**Fabricación propia**
- Producimos implantes en titanio biocompatible con las dos tecnologías, lo que nos permite resolver tanto series modulares como piezas únicas para un paciente.
- MANUFACTURA SUSTRACTIVA — **Mecanizado CNC en titanio biocompatible**
- MANUFACTURA ADITIVA — **Impresión 3D en titanio biocompatible**

**Capacidades**
- Cubrimos el circuito completo: desde la planificación del caso hasta la entrega trazada del producto en cualquier punto del país.
- **Distribución nacional** — Distribución de productos médicos a todo el país.
- **Calidad y trazabilidad** — Sistema de gestión de calidad, depósito geolocalizado y trazabilidad de cada unidad.
- **Implantes a medida** — Planificación, diseño y fabricación de implantes a medida del paciente.
- **Gestión digital de casos** — Sistema digital para la gestión de casos y los registros de producción.

**Habilitaciones**
- Operamos bajo habilitación de la ANMAT para fabricar, importar y distribuir productos médicos, y cada unidad se registra en el Sistema Nacional de Trazabilidad.
- (4 tarjetas: ver `company.js › habilitaciones`)

### Contacto (`/contacto`)

- H1: Contactanos
- Conectate con nuestro equipo. Ya sea que necesites especificaciones técnicas, documentación regulatoria o plantear un caso a medida, estamos para ayudarte.
- **Formulario:** "Enviar un Mensaje"
  - Nombre Completo (placeholder "Dra. Juana Pérez")
  - Email Profesional ("juana.perez@hospital.com.ar")
  - Teléfono ("+54 9 11 1234-5678")
  - Mensaje ("Contanos en detalle tu consulta...")
  - Botón: Enviar Consulta
  - Éxito: **¡Gracias por tu consulta!** — Recibimos tu mensaje. Un especialista de Innercare se pondrá en contacto a la brevedad.
- **WhatsApp:**
  - Título: Escribinos por WhatsApp
  - Subtítulo: Respuesta inmediata · +54 9 11 2066-5434
  - Mensaje precargado: "Hola Innercare, quisiera hacer una consulta."
- **Laboratorio de productos de tecnología médica:**
  - Dirección: Aráoz de Lamadrid 2741 / B1678EEC Caseros / Provincia de Buenos Aires
  - Teléfonos: +54 9 11 2066-5434 · +54 9 11 2063-5071
- **Otras sedes:**
  - Planta industrial — Av. Arquímedes Hernández 192, Parque Industrial N° 1 / Alberti, Provincia de Buenos Aires
  - Sucursal Caleta Olivia — Av. Eva Perón 665 / Caleta Olivia, Provincia de Santa Cruz
  - Sucursal Comodoro Rivadavia — Viamonte 275 / Comodoro Rivadavia, Provincia de Chubut
- **Cómo Llegar:** iframe "Ubicación del laboratorio de productos de tecnología médica de Innercare" · Ver en Google Maps

### 404

- Error 404
- **Página no encontrada** — La página que buscás no existe o cambió de dirección.
- Botones: Volver al inicio · Ver productos

### Datos institucionales y certificaciones (`src/data/company.js`)

| Organismo | Detalle | Referencia |
|---|---|---|
| ANMAT | Importación y fabricación de productos médicos | Disposición 0999/17 |
| ANMAT | Certificado de Buenas Prácticas de Fabricación | N° 298-2023-R |
| ANMAT | Habilitación de empresa distribuidora de productos médicos | Disposición 9682/16 |
| Trazabilidad | Inscripción en el Sistema Nacional de Trazabilidad | GLN 7798276610001 · Sub-GLN 7798276610018 |

Los comentarios del código indican que todos estos datos salen de la "carpeta institucional" (págs. 2–15) y del brochure "rev.300326". El código también señala que la **línea distribuida (AK Medical: cadera, rodilla, maxilofacial, neurocirugía) queda fuera** "hasta resolver permisos de marca e imágenes".

### Datos de productos (`src/data/products.js`)

**1. Endoprótesis no convencional modular para fémur customizable** (slug `endoprotesis-modular-femur-customizable`, nombre corto "Endoprótesis femoral")

| Campo | Valor |
|---|---|
| Descripción corta | Sistema modular customizable a medida para adaptarse a patologías específicas de cada paciente. |
| Categoría | Reconstrucción articular |
| Fabricación | Fabricación propia |
| Técnica | Mecanizado CNC |
| Material | Titanio Ti-6Al-4V |
| Indicaciones | Pérdida de hueso femoral por trauma o resección. |
| Compatibilidad | Cabezas de Cerámica Biolox o Cr-Co con cono morse 12-14 |
| Ficha técnica | `/endoprotesis-modular-femur-innercare.pdf` |
| Imágenes | `femur-componentes.jpg` ("Componentes modulares de titanio de la endoprótesis femoral"), `femur-planificacion.jpg` ("Planificación quirúrgica 3D con el plano de resección femoral sugerido") |

Especificaciones:
- Cuerpo principal de 40mm y 60mm x 135°, con y sin alas para sutura
- Vástagos cementados de Ø10, 11 y 12mm x 120, 140 y 160mm
- Suplementos modulares de 40mm a 90mm
- Tornillo de cierre
- Vástagos curvos disponibles a pedido

Medidas disponibles: 40mm x 135° · 60mm x 135° · Ø10 x 120mm · Ø10 x 140mm · Ø10 x 160mm · Ø11 x 120mm · Ø11 x 140mm · Ø11 x 160mm · Ø12 x 120mm · Ø12 x 140mm · Ø12 x 160mm

**2. Prótesis modular reversa de hombro** (slug `protesis-modular-reversa-hombro`, nombre corto "Prótesis reversa de hombro")

| Campo | Valor |
|---|---|
| Descripción corta | Implante que no se fabricaba en el país. Permite obtener mayor estabilidad articular y sustituir la falta de hueso con suplementos combinables. |
| Categoría | Reconstrucción articular |
| Fabricación | Fabricación propia |
| Técnica | Mecanizado CNC |
| Material | Titanio biocompatible |
| Indicaciones | Reemplazo articular de hombro con déficit óseo que requiere suplementos combinables. |
| Compatibilidad / medidas / PDF | No declarados en la fuente (los campos no existen) |
| Imágenes | `hombro-implante.jpg`, `hombro-planificacion-reseccion.jpg`, `hombro-planificacion-implante.jpg`, `hombro-radiografia.jpg` |

Especificaciones:
- Implante que no se fabricaba en el país
- Permite obtener mayor estabilidad articular
- Permite sustituir la falta de hueso con suplementos combinables
- Planificación quirúrgica previa sobre el estudio del paciente

**Materiales y medidas que aparecen en los casos a medida:** aleación de titanio Ti-6Al-4V, titanio trabecular / poroso, PMMA; clavijas roscadas Ø 2,5 mm, tornillos Ø 3,5 mm, clavo endomedular anterógrado Ø 10 mm × 360 mm.

El contenido del PDF `public/endoprotesis-modular-femur-innercare.pdf` no se ha extraído (no verificado si coincide al 100 % con los datos de `products.js`).

---

## 7. Recursos

**Logo: no está en SVG.** Solo existe `public/logo.png` (PNG 1200×466 con transparencia, 271 KB, azul sobre transparente). No hay versión para fondo oscuro: el Footer muestra la marca como texto por ese motivo. El único SVG del proyecto es el icono de WhatsApp, inline en `WhatsAppIcon.jsx`.

No hay vídeos, archivos 3D (glb/gltf/stl/obj), WebP ni fuentes locales. Las tipografías y los iconos se cargan desde Google Fonts.

### `public/` (se publica)

| Ruta | Formato | Dimensiones | Peso | ¿Se usa? |
|---|---|---|---|---|
| `/logo.png` | PNG RGBA | 1200×466 | 271 KB | Sí (Header) |
| `/favicon.png` | PNG RGBA | 256×256 | 31 KB | Sí (favicon + apple-touch-icon) |
| `/endoprotesis-modular-femur-innercare.pdf` | PDF | — | 439 KB | Sí (ficha del fémur) |
| `/img/caso-acetabular-segmentacion.jpg` | JPG | 371×616 | 25 KB | **No** |
| `/img/caso-acetabular-tornillos.jpg` | JPG | 555×641 | 48 KB | Sí |
| `/img/caso-anclaje-dentario.jpg` | JPG | 353×471 | 16 KB | Sí |
| `/img/caso-anclaje-planificacion.jpg` | JPG | 904×947 | 40 KB | **No** |
| `/img/caso-correccion-desvio.jpg` | JPG | 212×375 | 13 KB | Sí |
| `/img/caso-craneo-3d.jpg` | JPG | 442×354 | 22 KB | **No** |
| `/img/caso-craneo-tc.jpg` | JPG | 326×367 | 20 KB | **No** |
| `/img/caso-craneoplastia-pmma.jpg` | JPG | 467×348 | 18 KB | Sí |
| `/img/caso-craneoplastia-titanio-detalle.jpg` | JPG | 343×379 | 23 KB | **No** |
| `/img/caso-craneoplastia-titanio.jpg` | JPG | 366×390 | 26 KB | Sí |
| `/img/caso-espaciador-molde.jpg` | JPG | 700×1456 | 37 KB | **No** |
| `/img/caso-espaciador-pmma.jpg` | JPG | 1600×893 | 178 KB | Sí |
| `/img/caso-intercalar-guias.jpg` | JPG | 272×692 | 40 KB | Sí |
| `/img/caso-intercalar-implante.jpg` | JPG | 1302×1307 | 171 KB | Sí |
| `/img/caso-intercalar-tc.jpg` | JPG | 782×866 | 125 KB | Sí |
| `/img/caso-planificacion-3d.jpg` | JPG | 1600×622 | 77 KB | Sí |
| `/img/caso-porosa-biomodelo.jpg` | JPG | 601×466 | 26 KB | Sí |
| `/img/caso-porosa-implante.jpg` | JPG | 495×466 | 53 KB | Sí |
| `/img/fabricacion-cnc-maquina.jpg` | JPG | 1600×1131 | 227 KB | Sí |
| `/img/fabricacion-cnc-planta.jpg` | JPG | 1600×678 | 171 KB | Sí (también og:image) |
| `/img/fabricacion-impresion-3d.jpg` | JPG | 1000×594 | 72 KB | Sí |
| `/img/femur-componentes.jpg` | JPG | 900×1600 | 85 KB | Sí |
| `/img/femur-planificacion.jpg` | JPG | 1031×868 | 98 KB | Sí |
| `/img/hombro-implante.jpg` | JPG | 836×1185 | 60 KB | Sí |
| `/img/hombro-planificacion-implante.jpg` | JPG | 584×873 | 34 KB | Sí |
| `/img/hombro-planificacion-reseccion.jpg` | JPG | 696×899 | 42 KB | Sí |
| `/img/hombro-radiografia.jpg` | JPG | 1024×768 | 107 KB | Sí |
| `/img/sistema-gestion-casos.jpg` | JPG | 1600×1236 | 123 KB | **No** |

Total en `public/img`: unas 1,9 MB. 7 imágenes no se usan. Varias son de baja resolución (p. ej. 212×375, 272×692): se verán pixeladas si la nueva web las muestra más grandes.

### Fuera de `public/` (no se publican)

| Ruta | Formato | Peso | Nota |
|---|---|---|---|
| `referencias/ReferenciaMasModerna.png` | PNG 1614×1180 | 1,17 MB | Sin seguimiento en git. Parece una referencia visual para el rediseño (contenido no analizado). |
| `referencias/referenciaTranslucido.png` | PNG 1610×1208 | 1,26 MB | Ídem. |
| `stitch_innercare_corporate_website/*/screen.png` (5) | PNG | 0,35–0,82 MB c/u (~2,8 MB en total) | Capturas de los mockups de Stitch, en git. |
| `stitch_innercare_corporate_website/*/code.html` (5) | HTML | 14–23 KB c/u | HTML de los mockups (origen del diseño). |
| `stitch_innercare_corporate_website/innercare_design_system/DESIGN.md` | MD | 8,5 KB | Especificación del design system (los mismos tokens que `index.css`). |

---

## 8. Diseño

Configuración en `src/index.css` con el bloque `@theme` de Tailwind v4 (no hay `tailwind.config.js`). Los tokens siguen la nomenclatura de Material 3 y salen de `stitch_…/innercare_design_system/DESIGN.md`.

### Colores (`--color-*`)

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| primary | `#003c6f` | | surface / background / surface-bright | `#f4faff` |
| on-primary | `#ffffff` | | surface-dim | `#c0dfee` |
| primary-container | `#0b5394` | | surface-container-lowest | `#ffffff` |
| on-primary-container | `#a2c8ff` | | surface-container-low | `#e6f6ff` |
| inverse-primary | `#a4c9ff` | | surface-container | `#d9f2ff` |
| surface-tint | `#2260a1` | | surface-container-high | `#ceedfd` |
| primary-fixed | `#d4e3ff` | | surface-container-highest / surface-variant | `#c9e7f7` |
| primary-fixed-dim | `#a4c9ff` | | on-surface / on-background | `#001f2a` |
| on-primary-fixed | `#001c39` | | on-surface-variant | `#424750` |
| on-primary-fixed-variant | `#004883` | | inverse-surface | `#163440` |
| secondary | `#4f6169` | | inverse-on-surface | `#e0f4ff` |
| on-secondary | `#ffffff` | | outline | `#727781` |
| secondary-container | `#d2e6ef` | | outline-variant | `#c2c6d2` |
| on-secondary-container | `#55676f` | | error | `#ba1a1a` |
| secondary-fixed | `#d2e6ef` | | on-error | `#ffffff` |
| secondary-fixed-dim | `#b6cad2` | | error-container | `#ffdad6` |
| on-secondary-fixed | `#0b1e24` | | on-error-container | `#93000a` |
| on-secondary-fixed-variant | `#374951` | | tertiary | `#003e63` |
| tertiary-fixed | `#cee5ff` | | on-tertiary | `#ffffff` |
| tertiary-fixed-dim | `#96ccff` | | tertiary-container | `#005687` |
| on-tertiary-fixed | `#001d32` | | on-tertiary-container | `#93cbff` |
| on-tertiary-fixed-variant | `#004a75` | | whatsapp / whatsapp-dark | `#25d366` / `#128c7e` |

`theme-color` en `index.html`: `#003c6f`. No hay modo oscuro.

### Tipografía

- **Hanken Grotesk** (400/600/700) para titulares y labels; **Source Sans 3** (400/500/600) para el cuerpo. Las dos vienen de Google Fonts vía `<link>`.
- `--font-data-mono` también usa Source Sans 3 (con `monospace` como respaldo), así que en la práctica no es una fuente monoespaciada.
- Iconos: **Material Symbols Outlined** (variable, `wght 100..700`, `FILL 0..1`), con clases `.material-symbols-outlined` y `.fill-icon`.

| Token | Tamaño / interlineado | Peso | Tracking |
|---|---|---|---|
| display-lg | 48 / 56 px | 700 | -0.02em |
| headline-lg | 32 / 40 px | 600 | -0.01em |
| headline-md | 24 / 32 px | 600 | — |
| headline-sm | 20 / 28 px | 600 | — |
| body-lg | 18 / 28 px | 400 | — |
| body-md | 16 / 24 px | 400 | — |
| body-sm | 14 / 20 px | 400 | — |
| label-md | 14 / 16 px | 600 | 0.05em |
| data-mono | 14 / 20 px | 500 | — |

**El `display-lg` no es responsive:** mide 48 px también en móvil, y los titulares largos (p. ej. el nombre del producto del fémur) pueden quedar muy grandes en pantallas pequeñas (no verificado visualmente).

### Espaciado y radios

- Espaciado: `xs 4px`, `sm 8px`, `md 16px`, `lg 24px`, `xl 48px`, `section 80px`, `gutter 24px`, `container-max 1280px`.
- Radios: `DEFAULT 0.25rem`, `lg 0.5rem`, `xl 0.75rem`, `full 9999px`.

### Otros

- Regla global `prefers-reduced-motion` que anula las animaciones y transiciones CSS.
- Estética: corporativa clínica, en azules sobre fondos celestes muy claros, con tarjetas con borde fino y sombras suaves.

---

## 9. Integraciones

| Integración | Estado |
|---|---|
| **Formulario de contacto** | **No funcional.** `handleSubmit` solo hace `preventDefault()` y muestra el mensaje de éxito: los datos no se envían a ningún sitio y se pierden. El usuario ve "Recibimos tu mensaje" aunque no se ha recibido nada. |
| WhatsApp | Enlace `https://wa.me/5491120665434?text=…` (el número sale de `company.js`). |
| Google Maps | `iframe` con `https://www.google.com/maps?q=…&output=embed` (sin API key) y un enlace a Maps. |
| Teléfonos | Enlaces `tel:`. |
| Google Fonts | Hanken Grotesk, Source Sans 3 y Material Symbols (CDN externo). |
| APIs / backend | Ninguno. No hay `fetch`, `axios` ni servicios de email (EmailJS, Formspree, Resend, etc.). |
| Analítica | Ninguna (no hay GA/gtag, GTM, Plausible, Hotjar, Meta Pixel ni Vercel Analytics). |
| Cookies / consentimiento | Ninguno. |

**Variables de entorno: ninguna.** No hay referencias a `import.meta.env`, `process.env` ni `VITE_*` en el código, y no existe ningún archivo `.env*` en la raíz.

---

## 10. Despliegue y SEO

### Despliegue

- **`vercel.json`:**
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
  ```
  Es el rewrite típico de una SPA: todas las rutas sirven `index.html` y React Router resuelve la ruta en el navegador.
- **Build:** `vite build` genera `dist/`. No hay configuración de build adicional.
- **Versión de Node:** no está fijada (no hay `engines`, `.nvmrc` ni `.node-version`). En local hay Node v23.11.0 / npm 10.9.2. La versión que usa Vercel se define en su panel (no verificado).
- **Vercel conectado:** probable por el commit "trigger vercel deploy". No verificados el proyecto, el dominio ni la rama de producción. Riesgo: la rama por defecto en GitHub es `main`, que solo tiene un README.

### Renderizado

**100 % en el cliente (CSR).** `index.html` contiene únicamente `<div id="root"></div>` y todo el contenido lo genera el JavaScript (bundle de 361 KB, 115 KB con gzip). No hay SSR ni prerender.

### SEO

| Elemento | Estado |
|---|---|
| `lang` | `es-AR` |
| `<title>` y meta description | Hay uno solo, global. **Es el mismo para todas las rutas**: no hay títulos ni descripciones por página (ni `react-helmet` ni equivalentes). |
| Open Graph | `og:type`, `og:site_name`, `og:locale (es_AR)`, `og:title`, `og:description`, `og:image`. **`og:image` es relativa** (`/img/fabricacion-cnc-planta.jpg`); muchas redes exigen URL absoluta, así que la vista previa puede no mostrar la imagen. No hay `og:url`. |
| Twitter | `twitter:card = summary_large_image` (no hay `twitter:title` ni `twitter:image`; normalmente se toman del OG). |
| Favicon | `favicon.png` (256×256) + `apple-touch-icon`. No hay `manifest.webmanifest`. |
| `sitemap.xml` | **No existe.** |
| `robots.txt` | **No existe.** |
| Canonical | **No hay.** |
| Datos estructurados (JSON-LD) | **No hay** (p. ej. `Organization`, `MedicalDevice`/`Product`). |
| 404 | La ruta `*` muestra la página 404, pero gracias al rewrite **el servidor responde HTTP 200** (*soft 404*). |

---

## 11. Estado

### Build

**`npm run build` funciona.** Se ejecutó `vite build` con `--outDir` hacia una carpeta temporal fuera del repo, para no tocar `dist/`:

```
vite v8.2.2 building client environment for production...
✓ 48 modules transformed.
index.html                  1.97 kB │ gzip:   0.83 kB
assets/index-DVMIjVKG.css  39.67 kB │ gzip:   7.44 kB
assets/index-Ba_MAk7v.js  361.48 kB │ gzip: 114.85 kB
✓ built in 260ms
```

Sin errores ni warnings.

### Lint

`oxlint` termina con código 0 y no muestra ningún aviso.

### Dependencias desactualizadas (`npm outdated`)

| Paquete | Instalado | Último |
|---|---|---|
| react / react-dom | 19.2.8 | 19.3.1 |
| react-router-dom | 7.18.3 | 7.18.5 |
| vite | 8.2.2 | 8.3.5 |
| @vitejs/plugin-react | 6.1.1 | 6.1.2 |
| oxlint | 1.80.0 | 1.90.0 |
| @types/react / @types/react-dom | 19.2.18 / 19.2.5 | 19.3.0 |

`gsap` y `tailwindcss` están al día.

### Seguridad (`npm audit`)

2 vulnerabilidades **altas** en `vite 8.2.0–8.2.2` (y en su dependencia `launch-editor`). Afectan al **servidor de desarrollo** (`server.fs`, middleware, `launch-editor`), no al sitio estático publicado. Tienen solución con una actualización menor de Vite.

### Problemas evidentes

1. **El formulario de contacto no envía nada** pero confirma el envío al usuario. Es el problema más grave: se pierden consultas reales.
2. **SPA sin SSR, con un único título y descripción para todas las páginas, sin sitemap, robots ni canonical.** Es un SEO débil para una web corporativa.
3. **Rama `main` huérfana** (solo README, sin historia en común con `master`) y marcada como rama por defecto en GitHub. Es confuso y puede afectar a Vercel o a quien clone el repo.
4. **El logo solo existe en PNG** (271 KB para mostrarse a 44 px de alto) y no hay versión en negativo.
5. **Imágenes sin optimizar:** JPG sin WebP/AVIF, sin `srcset` y sin `width`/`height` (CLS). Algunas son de baja resolución, 7 no se usan y algunas imágenes principales no tienen `loading="lazy"`.
6. **Código muerto:** `CountUp.jsx`, la carpeta vacía `src/assets/` y el README del starter de Vite.
7. **Contenido oculto sin JS:** `Reveal` empieza con `opacity: 0` y el texto solo aparece cuando se ejecuta JS.
8. **Filtros del catálogo poco útiles con 2 productos:** solo hay una categoría y una técnica, y los dos materiales tienen nombres distintos para lo mismo ("Titanio Ti-6Al-4V" frente a "Titanio biocompatible").
9. **Capitalización inconsistente** en botones y títulos: "Solicitar Este Producto a Medida", "Especificaciones Técnicas", "Cómo Llegar" frente a "Ver casos desarrollados".
10. **Mockups de Stitch en el repo** (~2,8 MB de PNG) mezclados con el código de producción.
11. **Node no fijado** en el proyecto.
12. **Fuente de iconos Material Symbols cargada con todo el rango variable**, cuando bastaría un subconjunto de iconos. El peso no se ha medido (no verificado).

---

## 12. Opinión: ¿migrar o empezar limpio?

**Recomendación: empezar un proyecto Next.js (App Router) limpio y llevar a él las partes que valen la pena, en lugar de migrar el repo actual.**

- El proyecto es pequeño (~2.500 líneas) y lo que no se puede reutilizar es justo el andamiaje de Vite y React Router (`App.jsx`, `main.jsx`, `vercel.json`, `index.html`), así que convertirlo no ahorra trabajo frente a un `create-next-app`.
- Lo valioso se puede copiar casi sin cambios:
  - `src/data/*`: el contenido verificado contra la carpeta institucional.
  - Los tokens `@theme` de `index.css`: Tailwind v4 funciona igual en Next.
  - `public/`.
  - La mayoría de los componentes, con `next/link`, `next/image` y `'use client'` donde haga falta.
- Empezar limpio permite resolver desde el principio lo que este código no tiene:
  - SSG con metadatos por página, `sitemap` y `robots`.
  - Un formulario con envío real.
  - `next/font` e imágenes optimizadas.
  - Animaciones que no oculten contenido en SSR.
- La carpeta `referencias/` sugiere además un cambio de dirección visual ("más moderna", "translúcido"), así que muchas de las clases actuales se reescribirían igualmente.
