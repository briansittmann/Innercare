@AGENTS.md

# Innercare — web corporativa

Web institucional de Innercare, fabricante argentino de implantes ortopédicos modulares y a medida del paciente (titanio, CNC e impresión 3D, habilitado por ANMAT). Público: cirujanos, hospitales y compras institucionales. Los textos de la interfaz van en español rioplatense (voseo: "Contactanos", "Enviános").

## Situación

- **La web no está en uso.** No hay producción que proteger ni usuarios reales: se puede romper, rehacer y reestructurar sin migraciones ni compatibilidad hacia atrás.
- **Habrá un único lanzamiento, al final, con el 3D incluido.** No hay lanzamientos parciales: no hace falta pulir para producción lo que todavía va a cambiar.
- Ramas:
  - `main`: proyecto Next.js, donde se trabaja.
  - `rediseno`: la dirección visual elegida y la landing de una sola página; se integra a `main` cuando esté lista.
  - `legacy`: web Vite + React Router anterior, solo como referencia. No se modifica.
  - `master`: igual que `legacy`. Se borra cuando Vercel y GitHub apunten a `main`.

## Stack

- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript `strict` + `noUncheckedIndexedAccess`.
- `next.config.ts` trae activados `cacheComponents` y `partialPrefetching` (los valores por defecto de `create-next-app`). Esto cambia las reglas de datos dinámicos, como `new Date()` o `cookies()` en Server Components: consultá `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` antes de usarlos.
- Tailwind CSS v4 con el loader `@tailwindcss/turbopack`, sin PostCSS ni `tailwind.config`. Los tokens están en `app/globals.css` (`@theme`).
- ESLint 9 con flat config (`eslint.config.mjs`, `eslint-config-next`). No subir a ESLint 10 hasta que `eslint-plugin-react`, `import` y `jsx-a11y` lo admitan.
- Node 24 (`.nvmrc`, `engines: 24.x`).
- Fuentes con `next/font/google` (Hanken Grotesk y Source Sans 3, auto-hospedadas).
- 3D: React Three Fiber, Drei y Three.js. `gsap` solo para `FoldText`.

## Estructura

- `app/`: rutas, layout y `globals.css`. La home (`app/page.tsx`) es la única página navegable; siguen `/productos/[slug]` (fichas), `/contacto` (panel o página) y `/productos`, que compila pero no tiene ningún enlace.
- `content/`: textos y datos tipados (`types.ts`, `company.ts`, `products.ts`, `customCases.ts`, `contact.ts`, `recorrido.ts`). **Es la única fuente de verdad del contenido.** Sale de la carpeta institucional y del brochure: no inventar cifras, indicaciones, resultados clínicos ni certificaciones; si falta un dato, va "[pendiente: …]" visible. La línea distribuida (AK Medical) queda fuera hasta resolver los permisos.
  - `recorrido.ts`: las seis paradas del recorrido (craneo, maxilar, hombro, acetabulo, femur, intercalar), con tipo (catálogo o a medida), textos, specs, miniatura, vista de la escena y ficha. Cuenta los casos con los datos de `customCases.ts` y `products.ts`.
- `components/home/`: secciones de la home (`hero`, `tour` + `tour-scroll`, `process` + `process-scroll`, `manufacturing` + `animacion-fabricacion`, `credentials`, `locations`).
- `components/hero-3d/`: el busto de vidrio del hero (no se toca sin pedido explícito).
- `components/recorrido-3d/`: el cuerpo entero del recorrido.
  - `camara.ts`: el guion del recorrido (tramos, pesos, tomas, opacidades, halo), sin three; lo comparten la escena y el HTML.
  - `estado.ts`: el progreso compartido entre `tour-scroll.tsx` y la escena, sin re-renderizar React.
  - `escena.tsx`, `recorrido-3d.tsx` (carga diferida y respaldo) y `miniaturas.tsx` (vistas de drei en las tarjetas).
  - **`implantes.ts` es el único lugar que dice de dónde sale cada implante y dónde va.** Contrato: cada entrada tiene `parada`, `fuente` (`{ tipo: 'glb', url, malla }` o `{ tipo: 'primitiva', crear }`), `posicion`, `rotacion`, `escala` y `acabado` (`pulido` o `trabecular`). Para cambiar una pieza: exportarla como `implante_<parada>` en `implantes-recorrido.glb`, apuntar su `fuente` a esa malla y dejar la transformación en cero. La escena, la cámara y las tarjetas no dependen de la forma.
- `components/animaciones/`: las piezas de partículas en canvas 2D (`proceso.ts`, `fabricacion.ts`, `lienzo.ts`).
- `public/`: imágenes (`img/`), `logo.png`, `favicon.png` y el PDF de la ficha del fémur.
  - `public/modelos/`: `cabeza.glb` e `implantes.glb` (hero; `implantes.glb` lleva solo la craneoplastía), `cuerpo.glb` (piel y esqueleto con los recortes de los seis implantes) e `implantes-recorrido.glb` (los otros cinco). Se generan con `npm run modelos` (`3d/scripts/modelos.sh`: Blender y `gltf-transform` con meshopt). Detalle en `3d/README.md`.
  - Respaldos sin WebGL: `img/cuerpo-inicio.webp` y `cuerpo-inicio-movil.webp` (busto) y `img/cuerpo-entero.webp` (recorrido). Si cambian el modelo, la cámara o el material, se recapturan (`docs/ARQUITECTURA_MODELO_3D.md`, sección 3, y la bitácora).
- `3d/`: scripts de Blender (`implantes.py` genera los seis implantes y recorta los huesos; `preview.py` hace renders de control).
- `docs/`: material de referencia que **no se lee por defecto** (ver abajo).

## Comandos

`npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit` · `npm run modelos`

Antes de dar algo por terminado: el build, el lint y `tsc` tienen que pasar sin errores.

## Reglas de herramientas

- **Context7, siempre** antes de usar APIs de Next.js, React, Tailwind, GSAP, React Three Fiber, Drei o Three.js. No te fíes de la memoria.
  - En Next.js, la versión instalada (16.4) es más nueva que la última de Context7 (16.2.x). Contrastá además con la documentación incluida en `node_modules/next/dist/docs/` y, si no coinciden, manda esa.
- **Taste Skill (`design-taste-frontend`)** para cualquier decisión de interfaz.
  - Respetá los tokens de marca (primario `#003c6f`, tipografías y escalas de `globals.css`).
  - Tono de fabricante de productos médicos: datos reales, sin copy de marketing hueco, sin gradientes llamativos ni glassmorphism decorativo.
  - Si la Taste Skill choca con `docs/landing/AJUSTES.md` o con el borrador (por ejemplo, el aviso de scroll del hero), mandan ellos.
- **React Bits, donde sume** (ya no solo como acento), a través del MCP de shadcn (`.mcp.json`) o con `npx shadcn@latest view @react-bits/<Nombre>-TS-TW` (nunca con `shadcn add`: ver "Dirección visual"). Antes de añadir un componente:
  1. Revisá sus `dependencies` (p. ej. `SplitText` añade `gsap` y `@gsap/react`) y justificá cada dependencia nueva.
  2. Adaptalo a nuestros tokens: nada de colores ni fuentes propios del componente.
  3. Comprobá que respete `prefers-reduced-motion`. Si no lo hace, añadilo.
  4. Si dibuja con WebGL, contalo como un contexto más (ver "Rendimiento").
  - `components.json` tiene `cssVariables: false` para que shadcn no escriba sus variables de tema en `globals.css`.

## Dirección visual

- **Prioridad: que la página se vea moderna y atractiva**, con nivel de producto actual y no de web institucional genérica. Es lo que la va a vender (`docs/landing/AJUSTES.md`).
- **Fidelidad al borrador** (`docs/landing/landing-borrador.html`), pedida por el usuario: composición, orden, lado de cada elemento, elementos y presentación de cada sección, salvo las excepciones de `AJUSTES.md` (hero, etiquetas de botones). **La ambición va en la ejecución** (calidad, detalle, tokens de marca), **no en rediseñar**: no recompongas una sección del borrador.
- Lectura: web B2B de un fabricante regulado de productos médicos, para cirujanos y compras hospitalarias. Diales: variance 5, density 4; el movimiento puede subir por encima de motion 4 si tiene una idea (nada de fade-up genérico en cada sección).
- Superficies en grises fríos neutros (`surface`; habilitaciones va en una banda `surface-container-low`) y titulares en peso regular.
- Tema único claro (sin modo oscuro). Un solo acento: `primary`.

### Hero (no se toca salvo pedido explícito)

- Titular en 500 que entra plegado letra por letra con `FoldText` (`components/fold-text.tsx`) y después queda quieto, sin hover.
- 3D provisional: el prototipo de cabeza (`components/hero-3d/`), un busto de vidrio con una craneoplastía de titanio.
- Degradé vertical de azules de la marca (`--color-stage-from` a `--color-stage-to`) de borde a borde y por detrás del header, con un corte recto contra el gris de la sección siguiente que coincide con el corte del busto. El canvas es transparente y el vidrio refracta el mismo degradé (la escena lo dibuja solo en el buffer del vidrio). Si cambian esos colores, cambialos también en `components/hero-3d/body-scene.tsx`.
- Cinta de fibras en tinta azul por detrás del texto y del 3D, en diagonal hacia el cuello (`GhostFibers`, `components/ghost-fibers.tsx`): reflejos blancos, 2x en escritorio y 1x en el celular, reacciona al mouse y al clic con un pulso de luz. El degradé tiene que seguir leyéndose como fondo.
- Botones: "Plantear un caso" (principal) y "Recorrer los implantes" (`BotonVidrio`, `components/boton-vidrio.tsx`, a `#recorrido`). Debajo, la línea de habilitaciones ANMAT con un sello y el aviso "Deslizá para recorrer el cuerpo" con su riel (`.aviso-deslizar`); en escritorio va abajo a la izquierda, no centrado, porque centrado pisa el busto.
- Sin WebGL, o mientras carga, se ven capturas fijas del busto (`public/img/cuerpo-inicio.webp` y `cuerpo-inicio-movil.webp`).

### Secciones de la home

En el orden del borrador: hero, `#recorrido`, `#proceso`, `#fabricacion`, `#habilitaciones`, `#sedes` y `#contacto`. Los ids de las cuatro primeras secciones después del hero son las anclas del menú: no los cambies.

- **Recorrido** (`#recorrido`): ocho pantallas de scroll con una escena fija y el cuerpo entero de vidrio con seis implantes; la cámara va de parada en parada (guion en `camara.ts`). Tarjeta por parada a la derecha (hoja inferior en el celular, por debajo de 820 px), con miniatura 3D que se arma con partículas, y cierre con "Plantear un caso". Los implantes van en su capa, encima del vidrio, como titanio (pulido en CNC, mate en impresión 3D), y el activo lleva halo y resplandor. Hoy es una sección propia con el busto en el hero: **provisional** mientras el hero no se toque.
- **Cómo trabajamos** (`#proceso`): pieza de partículas atada al scroll (cortes de TC, hueso con zona a resecar, implante intercalar con clavo y guías).
- **Fabricación** (`#fabricacion`): las dos animaciones del borrador (CNC e impresión 3D), una vez al entrar, con "Volver a ver". Sin JS, fotos de planta con `PlantPhoto`.
- **Habilitaciones**, **Distribución** (eje norte-sur con las sedes en su latitud) y **Contacto** (bloque en el primario con el logo en blanco y, solo en la home, la cinta de fibras fija `img/cinta-contacto.webp` / `cinta-contacto-movil.webp` que deriva con el scroll por CSS, `.cta-cinta`).
- El hero y el contacto son los únicos fondos de color; el recorrido lleva la luz azul del borrador (`.escenario`), que se funde en el gris abajo.

### Vidrio, formas y botones

- La translucidez vive en el objeto 3D, nunca en la interfaz. Excepciones:
  - La barra de escritorio, de vidrio (`NavGlass` en `components/nav-glass.tsx`, sobre `GlassSurface` de React Bits, con `PillNav` dentro). En Chrome refracta con un filtro SVG; en Safari y Firefox cae a vidrio esmerilado. Con `prefers-reduced-transparency` pasa a opaca (`.nav-glass`). Cualquier pieza de navegación nueva de vidrio usa `NavGlass`.
  - "Recorrer los implantes" del hero (`BotonVidrio`, `.boton-vidrio`), pedido por el usuario.
  - El fondo detrás del panel de contacto se desenfoca (`::backdrop`); el panel es opaco.
  - Las tarjetas del recorrido son opacas: el vidrio no se extiende a tarjetas, botones ni otras superficies.
- En el celular, la barra del header es transparente arriba de todo y se vuelve esmerilada al hacer scroll (`.barra-movil`).
- Formas: lo interactivo es pill (`rounded-full`); superficies e imágenes, `rounded-xl` (12 px). Los botones toman el radio de `--radius-control` (hoy pill); el sistema de botones propone 8 px, sin decidir.
- **Botones: seguí `docs/BOTONES.md`** (relieve suave, variables por variante, hover solo con `background-color`, 160 ms). Están implementados como `.boton` + `.boton-primario` / `.boton-claro` / `.boton-relleno`, y `.relieve` + `.relieve-claro` para lo que combina sin ser clickeable (`@layer components` en `globals.css`); no rehagas botones con utilidades sueltas. Los enlaces de texto subrayados usan `.enlace` (en el primario, `.enlace-marca`). Leelo antes de crear o tocar un botón, o algo que combine con ellos. El `hover:` de Tailwind ya está redefinido para exigir `(pointer: fine)`.
- Foco de teclado: regla base `:where(a, button, summary, [tabindex]):focus-visible` con el anillo del primario (`@layer base`); los componentes con su propio anillo ganan.

### Navegación y enlaces

- **Una sola página.** No hay Nosotros, Casos a medida ni índice lateral de secciones; si hacen falta más páginas, se plantean con el cliente.
- Menú de la barra (escritorio y móvil, `components/nav-links.ts`): Implantes (`/#recorrido`), Cómo trabajamos (`/#proceso`), Fabricación (`/#fabricacion`) y Habilitaciones (`/#habilitaciones`). Van con `/#` para que funcionen desde las fichas. En la home, PillNav marca con el punto la sección que cruza la mitad de la pantalla (`use-active-section.ts`, `aria-current="location"`).
- **Cualquier ancla a la home va con `AnchorLink` o `scrollToAnchor`** (`components/anchor-link.tsx`): `Link` no vuelve a bajar si el ancla ya está en la URL.
- Índice anatómico del recorrido (cráneo, maxilar, hombro, acetábulo, fémur proximal, diáfisis femoral) desde 1100 px, con enlaces a `#parada-<id>`.
- Tres intenciones nada más: recorrer, ver ficha y contactar.
  - **"Plantear un caso" es la única etiqueta de contacto** (`contactLabel`). Abre el panel de `/contacto` con `?motivo=caso` (`contactHref`); en las fichas, con `?producto=<slug>`.
  - Paradas de catálogo: "Ver ficha del producto" (y "Ficha técnica (PDF)" en la endoprótesis). Paradas a medida: "Plantear un caso".
- Fichas (`/productos/[slug]`): la miga de pan dice "Implantes" y va a `/#recorrido`.
- Barra de escritorio: 62 % del viewport (mínimo 46 rem) y 64 px de alto. Entra solo al cargar el sitio por la home (`NavIntro`, `.nav-intro-*`), con la entrada de la home: el contenido se maqueta al ancho final con `100cqw` y el vidrio lo recorta mientras se estira; no lo maquetes al ancho del vidrio.

### Movimiento

- **Entrada de la home orquestada** (`components/intro.ts`, tiempos en `components/intro-timeline.ts`): una sola línea de tiempo con fases `waiting` → `running` → `done` en `data-intro`. Header, busto (desenfoque y escala en CSS, `.intro-3d`; giro hasta su pose en `body-scene.tsx`) y fibras (`introStart`) a la vez; mientras terminan, el título letra por letra; después el subtítulo, los botones, la línea ANMAT (`INTRO_AT.credentials`) y el aviso de deslizar (`INTRO_AT.scrollCue`), con `.intro-in` y `--intro-at`. Hoy la arranca `Hero3D` cuando el 3D está listo (máximo 2,5 s). **Va a haber pantalla de carga**: cuando exista, la arranca ella al irse con `startIntro()`. Cualquier pieza nueva del primer pantallazo se suma a esta línea de tiempo.
- El resto del movimiento tiene una idea: el recorrido y el proceso van atados al scroll (progreso propio, sin librería); fabricación se dispara una vez al entrar; la cinta del contacto deriva con `animation-timeline: view()`. Fuera del hero (fibras y aviso de deslizar), nada se mueve solo en bucle salvo el vaivén leve del cuerpo y las miniaturas con la escena fija.
- Sin JS no se oculta contenido: lo que oculta el JS se oculta con CSS bajo `@media (scripting: enabled)`, nunca con opacidad 0 en el HTML del servidor. Sin JS, el recorrido y el proceso se leen en orden, sin escena fija.
- Con `prefers-reduced-motion`: sin amortiguación, halo ni ensamble; cada pieza muestra su estado final o el del paso activo, quieta.
- Fondos animados: se admiten donde sumen (AJUSTES), livianos (CSS o canvas 2D antes que WebGL), pausados fuera de pantalla y nunca más de uno a la vista junto con el 3D. Los de React Bits evaluados (salvo `Noise`) son WebGL2 y no entraron.

### Rendimiento

- **Tres contextos WebGL en la home, y no más:** busto y fibras del hero, y el del recorrido. Las miniaturas son vistas (`View` de drei con `track`) del canvas del recorrido; el proceso y la fabricación son canvas 2D; la cinta del contacto es una imagen. Una pieza nueva no suma un contexto: reutilizá uno o usá canvas 2D o CSS.
- **El recorrido se carga después de la intro:** `cuerpo.glb` y su contexto se piden cuando la entrada del hero terminó (`useIntroPhase() === 'done'`, en `tour-scroll.tsx`) y el recorrido asoma un 5 %, con `next/dynamic` sin SSR.
- **Pausa fuera de pantalla:** el hero se detiene con su IntersectionObserver; el recorrido usa `frameloop="demand"` (dibuja solo cuando cambia el progreso) y pasa a `never` fuera de pantalla; las animaciones 2D no dibujan fuera de pantalla y se detienen al terminar.
- Para medir, seguí la memoria del proyecto (Chrome con GPU, comparar alternando variantes). Referencia actual: recorrido a 60 fps con tope en escritorio y celular; el paso del hero al recorrido, unos 51 fps en escritorio por el costo del hero.

### Otras reglas

- Titulares: `display-xl` (hero) y `display-lg` (secciones), fluidos con `clamp()`. Datos técnicos (specs, disposiciones, latitudes) en `font-data-mono tabular-nums`.
- Iconos: Phosphor (`@phosphor-icons/react/ssr`, peso `light` en iconos de contenido). `content/` usa claves semánticas (`IconKey`) y `components/icon.tsx` las traduce.
- Componentes de React Bits: no instalarlos con `shadcn add`, porque corrompe las cadenas de sombras y colores. Sacá el código con `npx shadcn@latest view @react-bits/<Nombre>-TS-TW` y copialo a mano a `components/` (nombre en kebab-case).
- Copy visible: sin guiones largos (`—`) ni rangos con guion ("10 a 12 mm") y como máximo un eyebrow cada tres secciones.
- Contenedor de página: utilidad `page-container`.
- Fotos de planta (máquinas, instalaciones): siempre con `PlantPhoto` (blanco y negro con tinte de marca). Las de producto y casos, sin tratamiento.

## Datos

- Las páginas leen productos solo con `getProducts()` y `getProductBySlug()` (asíncronas) de `content/products.ts`. Así el origen puede pasar a un CMS sin tocar las vistas.
- Fichas: `generateStaticParams` + `notFound()`. Con Cache Components no existe `dynamicParams`. La primera visita a un slug desconocido responde 200 con `noindex` y después queda cacheada como 404.

## Problemas conocidos

- Si un cambio de `globals.css` no aparece en el build, borrá `.next/` (la caché de Turbopack con `@tailwindcss/turbopack` no siempre se invalida). Pasó varias veces; no borres `.next/dev` si el usuario tiene `next dev` corriendo.
- **Cache Components conserva las rutas ocultas con `<Activity>` en vez de desmontarlas.** El estado y el DOM sobreviven a la navegación y los efectos se limpian al ocultarse. Todo lo que abra algo global (diálogos con `showModal()`, bloqueo de scroll, menús) tiene que cerrarlo en la limpieza de un `useLayoutEffect`; si no, queda abierto e invisible y la página se traba. Para estado global usá atributos `data-*` que maneje React, no `:has()`. Guía: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`. Ejemplo: `components/contact/contact-modal.tsx`.

## Referencias (no leer por defecto)

- `docs/landing/`: la landing de una sola página.
  - `AJUSTES.md`: decisiones del usuario sobre el guion. **Mandan sobre el guion y sobre este archivo** donde choquen (salvo stack).
  - `LANDING_SPEC.md`: el guion de la landing (secciones, recorrido, cámara).
  - `landing-borrador.html`: el borrador visual; abrilo como archivo para comparar composición y animaciones.
  - `BITACORA.md`: qué hizo cada fase, qué decidió y qué quedó pendiente. Las entradas se suman al final.
- `docs/BOTONES.md`: sistema de botones (norma; leelo siempre que toques botones).
- `docs/DECISIONES.md`: registro de decisiones con su motivo y lo descartado. Al tomar una decisión de diseño o de arquitectura, añadí una entrada; las reglas resultantes van además en este archivo.
- `docs/INFORME_PROYECTO.md`: diagnóstico de la web anterior (`legacy`). Es largo: consultalo solo cuando haga falta un dato concreto.
- `docs/referencias/`: dos capturas de referencia visual para el rediseño ("más moderna", "translucido").
- `docs/ARQUITECTURA_MODELO_3D.md`: el cuerpo translúcido con seis implantes. Qué se ve, cómo se generan los modelos (Blender por script y atlas anatómicos abiertos), nombres de malla y cómo se recapturan los respaldos. Leelo antes de tocar `components/hero-3d/`, `components/recorrido-3d/` o `3d/`.

## Estado

### Fase 0: base del proyecto (completada)

- [x] Rama `legacy`, Next.js limpio en `main`, MCP de shadcn con `@react-bits`, contenido porteado a `content/`, build y lint, y Vercel desplegando `main`.

### Fase 1: diseño visual (completada)

- [x] Header, footer, hero, fichas de producto, `/productos` y contacto (panel lateral por ruta interceptada en `app/@modal` y página completa; formulario con progreso, validación en línea y precarga por `?producto=` y `?motivo=`).

### Landing de una sola página (rama `rediseno`, fases 1 a 6 hechas)

- [x] 1 · Una sola página, menú de anclas, "Plantear un caso" y línea ANMAT y aviso de deslizar en el hero.
- [x] 2 · Secciones del borrador: recorrido, cómo trabajamos, fabricación, habilitaciones, distribución, contacto y footer.
- [x] 3 · Recorrido 3D con el cuerpo entero, atado al scroll.
- [x] 4 · Los cinco implantes que faltaban, generados en Blender.
- [x] 5 · Miniaturas de partículas, pieza del proceso y animaciones de fabricación.
- [x] 6 · Pase visual: bordes entre secciones, foco de teclado, bandas de datos y cinta fija en el contacto.

### Pendiente

- **Medir en un celular real** el hero, el recorrido con las miniaturas y el contacto (si no llega a 60, bajar `DPR_CELULAR`, hoy 1,5, en `components/recorrido-3d/recorrido-3d.tsx`).
- **Confirmar con Innercare:** tres specs del recorrido ("Técnica: Impresión 3D" de la craneoplastía y del acetábulo, "Desarrollo: A pedido médico" del maxilar) y las medidas estimadas de los implantes (sobre todo el hombro). Cuando lleguen sus CAD, reemplazan a los generados respetando el nombre de malla.
- **Fotos de baja resolución:** varias de casos tienen menos de 650 px (`caso-craneo-3d`, `caso-acetabular-segmentacion`, `caso-intercalar-guias`) y se ven blandas.
- **Ficha de producto** con el diseño viejo: falta pasarla al estilo de la landing.
- **Logo:** no hay versión clara ni sin lema; el contacto usa el PNG invertido y el footer repite el lema.
- **Contextos WebGL del hero:** nunca se liberan, y el paso del hero al recorrido queda en unos 51 fps en escritorio (llevarlo a 60 es tocar el hero).
- **Miniaturas del recorrido:** costura de 1 px posible a algunos zooms y un marco visible durante los fundidos de la tarjeta (arreglarlo pide que el canvas no pinte fondo).
- **Aviso de deslizar** no centrado en escritorio (centrado pisa el busto): confirmar con el usuario o mover el busto.
- **Recorrido como sección propia** con el busto en el hero: provisional; se revisa si el hero se reabre. Después, el cuerpo entero en el hero (`docs/ARQUITECTURA_MODELO_3D.md`).
- Detalles del 3D: ala acetabular algo separada del hueso de frente; unos 222 000 triángulos en el recorrido (11 % arriba del objetivo); respaldos por parada (`cuerpo-<parada>.webp`) sin hacer.
- Envío real del formulario: `sendContact` (`app/contacto/actions.ts`) valida pero no manda nada. Envío de casos con estudios adjuntos: antes, definir con Innercare cómo recibir datos de salud.
- `metadataBase` con el dominio definitivo (el build avisa), metadatos por página, `sitemap` y `robots`.
- Pantalla de carga que arranque la intro con `startIntro()`.
- Los parámetros `?medir`, `?calidad`, `?hueso`, `?fondo` y `?fibras` de la home son del prototipo: se quitan antes del lanzamiento.

## Convenciones

- Código: comillas simples, sin punto y coma, comentarios en español.
- Commits en inglés, en imperativo.
