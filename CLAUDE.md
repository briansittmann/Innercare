@AGENTS.md

# Innercare — web corporativa

Web institucional de Innercare, fabricante argentino de implantes ortopédicos modulares y a medida del paciente (titanio, CNC e impresión 3D, habilitado por ANMAT). Público: cirujanos, hospitales y compras institucionales. Los textos de la interfaz van en español rioplatense (voseo: "Contactanos", "Enviános").

## Situación

- **La web no está en uso.** No hay producción que proteger ni usuarios reales: se puede romper, rehacer y reestructurar sin migraciones ni compatibilidad hacia atrás.
- **Habrá un único lanzamiento, al final, con el 3D incluido.** No hay lanzamientos parciales: no hace falta pulir para producción lo que todavía va a cambiar.
- Ramas:
  - `main`: proyecto Next.js, donde se trabaja.
  - `rediseno`: la dirección visual elegida y la landing de una sola página; se integra a `main` cuando esté lista.
  - `cuerpo-unico`: sale de `rediseno` y une el busto del hero y el cuerpo del recorrido en un solo modelo; se integra cuando el usuario lo apruebe.
  - `legacy`: web Vite + React Router anterior, solo como referencia. No se modifica.
  - `master`: igual que `legacy`. Se borra cuando Vercel y GitHub apunten a `main`.

## Stack

- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript `strict` + `noUncheckedIndexedAccess`.
- `next.config.ts` trae activados `cacheComponents` y `partialPrefetching` (los valores por defecto de `create-next-app`). Esto cambia las reglas de datos dinámicos, como `new Date()` o `cookies()` en Server Components: consultá `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` antes de usarlos.
- Tailwind CSS v4 con el loader `@tailwindcss/turbopack`, sin PostCSS ni `tailwind.config`. Los tokens están en `app/globals.css` (`@theme`).
- ESLint 9 con flat config (`eslint.config.mjs`, `eslint-config-next`). No subir a ESLint 10 hasta que `eslint-plugin-react`, `import` y `jsx-a11y` lo admitan.
- Node 24 (`.nvmrc`, `engines: 24.x`).
- Fuentes con `next/font/google` (Hanken Grotesk y Source Sans 3, auto-hospedadas).
- 3D: React Three Fiber, Drei y Three.js. `gsap` solo para `FoldText` y `AnimatedContent`.

## Estructura

- `app/`: rutas, layout y `globals.css`. La home (`app/page.tsx`) es la única página navegable; siguen `/productos/[slug]` (fichas), `/contacto` (panel o página) y `/productos`, que compila pero no tiene ningún enlace.
- `content/`: textos y datos tipados (`types.ts`, `company.ts`, `products.ts`, `customCases.ts`, `contact.ts`, `recorrido.ts`, `planta.ts`). **Es la única fuente de verdad del contenido.** Sale de la carpeta institucional y del brochure: no inventar cifras, indicaciones, resultados clínicos ni certificaciones; si falta un dato, va "[pendiente: …]" visible. La línea distribuida (AK Medical) queda fuera hasta resolver los permisos.
  - `mapa-argentina.ts`: **generado** por `npm run mapa` (`scripts/mapa-argentina.mjs`, Natural Earth 10m admin-1, dominio público): las 24 jurisdicciones, la costa y los límites interiores como trazados SVG ya proyectados (transversa de Mercator, `components/home/mapa-proyeccion.ts`) y simplificados. Malvinas con Tierra del Fuego; sin el sector antártico. No se edita a mano.
  - `recorrido.ts`: las seis paradas del recorrido (craneo, maxilar, hombro, acetabulo, femur, intercalar), con tipo (catálogo o a medida), textos, specs, miniatura, vista de la escena y ficha. Cuenta los casos con los datos de `customCases.ts` y `products.ts`.
- `components/home/`: secciones de la home (`tour` + `tour-scroll`, que llevan el hero y el recorrido; `process` + `process-scroll`, `manufacturing` + `animacion-fabricacion`, `credentials`, `locations`). `hero.tsx` y `hero-intro.tsx` son las piezas del hero (texto y fibras) que se montan dentro de `tour`.
- `components/recorrido-3d/`: **el único 3D de la home**, el cuerpo entero de vidrio del hero al cierre del recorrido, en un solo canvas (cuerpo único).
  - `camara.ts`: el guion (tramos, pesos, tomas, opacidades; la toma 0 es `HERO`), sin three; lo comparten la escena y el HTML.
  - `estado.ts`: el progreso compartido entre `tour-scroll.tsx` y la escena, sin re-renderizar React.
  - `aspecto-hero.ts`: el aspecto del busto de antes en la toma del hero (vidrio, titanio, hueso, corte bajo el cuello, degradé) y `materiales.tsx` (buffer del vidrio y hueso).
  - `escena.tsx`, `recorrido-3d.tsx` (montaje, arranque de la intro y respaldo) y `miniaturas.tsx` (vistas de drei en las tarjetas).
  - **`implantes.ts` es el único lugar que dice de dónde sale cada implante y dónde va.** Contrato: cada entrada tiene `parada`, `fuente` (`{ tipo: 'glb', url, malla }` o `{ tipo: 'primitiva', crear }`), `posicion`, `rotacion`, `escala` y `acabado` (`pulido` o `trabecular`). Para cambiar una pieza: exportarla como `implante_<parada>` en `implantes-recorrido.glb`, apuntar su `fuente` a esa malla y dejar la transformación en cero. La escena, la cámara y las tarjetas no dependen de la forma.
- `components/animaciones/`: las piezas de partículas en canvas 2D (`proceso.ts`, `fabricacion.ts`, `lienzo.ts`).
- `public/`: imágenes (`img/`; en `img/carrusel/`, las WebP de la tira de Fabricación, que genera `npm run fotos` desde los JPG originales con `scripts/fotos-carrusel.mjs`; en `img/fabricacion/`, los renders de las piezas en que rematan las animaciones de Fabricación, de `npm run fabricacion`), `logo.png`, `favicon.png` y el PDF de la ficha del fémur.
  - `public/modelos/`: el cuerpo (piel y esqueleto con los recortes de los seis implantes, más el maxilar entero) partido en `cuerpo-cabeza.glb` (lo que se ve en el hero) y `cuerpo-resto.glb`, con la piel en `piel_cabeza`, `piel_torso` y `piel_piernas`; `implantes.glb` (la craneoplastía sola) e `implantes-recorrido.glb` (los otros cinco). Se generan con `npm run modelos` (`3d/scripts/modelos.sh`: Blender y `gltf-transform` con meshopt; `partir.mjs` parte el cuerpo y lo verifica). Detalle en `3d/README.md`.
  - Respaldos sin WebGL: `img/cuerpo-inicio.webp` y `cuerpo-inicio-movil.webp` (la toma del hero) y `img/cuerpo-entero.webp` (el cierre). Si cambian el modelo, la cámara o el material, se recapturan (`docs/ARQUITECTURA_MODELO_3D.md`, sección 3, y la bitácora).
- `3d/`: scripts de Blender (`implantes.py` genera los seis implantes y recorta los huesos; `preview.py` hace renders de control; `render-fabricacion.py` renderiza las piezas de Fabricación en Cycles) y `partir.mjs` (gltf-transform).
- `docs/`: material de referencia que **no se lee por defecto** (ver abajo).

## Comandos

`npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit` · `npm run modelos` · `npm run fabricacion` · `npm run mapa`

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

- **Es la primera toma de la escena única**, no una sección aparte: el texto (`HeroTexto`) y las fibras (`HeroFondo`) de `components/home/hero.tsx` van dentro de la escena fija de `tour-scroll.tsx`, encima y detrás del cuerpo. Con el scroll se funden (seg 0 a 0,35; en el celular, después del desliz) mientras la cámara sube hasta la craneoplastía, sin cambiar de modelo. Se reabrió una sola vez, por pedido del usuario, para unir el busto y el cuerpo sin cambio visual (`AJUSTES.md`); sigue intocable sin pedido explícito.
- Titular en 500 que entra plegado letra por letra con `FoldText` (`components/fold-text.tsx`) y después queda quieto, sin hover.
- 3D: el cuerpo de vidrio en la toma `HERO` (`camara.ts`) con el aspecto del busto de antes (`aspecto-hero.ts`): la cabeza de perfil con una craneoplastía de titanio dentro del vidrio y el cuerpo siguiendo más allá del borde de abajo, **nunca cortado a la vista** (el corte `corteY` va a 1,22 m, debajo de la pantalla en todas las poses del giro), con el maxilar entero, la entrada girando y el vaivén. En el celular, la cabeza va debajo del texto y hacia la derecha (ancla [0,62, 0,74]), con la cara, el cuello y el arranque de los hombros a la vista en la primera pantalla; en las pantallas bajas baja lo justo para que la coronilla quede debajo del texto, hasta 0,8 (`anclaHeroCelular`: `tour-scroll.tsx` mide el pie del texto y lo pasa a la escena y a `--ancla-hero`); el texto es más compacto (botones de 48 px en una fila, márgenes menores). Durante las primeras 0,4 pantallas el texto, las fibras y el degradé suben (`deslizHero`) y el busto sube menos, hasta el busto entero centrado (ancla [0,5, 0,692]): si subiera con el texto, asomaría el corte.
- Degradé vertical de azules de la marca (`--color-stage-from` a `--color-stage-to`) de borde a borde y por detrás del header: es el fondo de toda la escena fija (`.recorrido-escena`) y se funde en el gris de "Cómo trabajamos" al final del cierre (`.recorrido-fundido`). En el celular se mide contra el alto del hero de antes (140,2 %). El canvas es transparente y el vidrio refracta el mismo degradé (la escena lo dibuja solo en el buffer del vidrio). Si cambian esos colores, cambialos también en `components/recorrido-3d/aspecto-hero.ts`.
- Cinta de fibras en tinta azul por detrás del texto y del 3D, en diagonal hacia el cuello (`GhostFibers`, `components/ghost-fibers.tsx`): reflejos blancos, 2x en escritorio y 1x en el celular, reacciona al mouse y al clic con un pulso de luz. El degradé tiene que seguir leyéndose como fondo. Se funde con el texto y, cuando terminó de irse, se pausa (`display: none`).
- Botones: "Plantear un caso" (principal) y "Recorrer los implantes" (`BotonVidrio`, `components/boton-vidrio.tsx`, a `#recorrido`: baja a la craneoplastía). Debajo, la línea de habilitaciones ANMAT con un sello y el aviso "Deslizá para recorrer el cuerpo" con su riel (`.aviso-deslizar`); en escritorio va abajo a la izquierda, no centrado, porque centrado pisa el busto. En el celular va a la izquierda del cuerpo, en dos líneas y centrado en la altura del cuello (`CUELLO_BAJO_ANCLA`), y se apaga en el primer tercio del desliz (`--desliz-t`).
- Sin WebGL, o mientras carga, se ven capturas fijas del busto (`public/img/cuerpo-inicio.webp` y `cuerpo-inicio-movil.webp`). Sin JS, el texto y la captura, en orden.

### Secciones de la home

En el orden del borrador: hero y recorrido (una sola sección, `#inicio`), `#proceso`, `#fabricacion`, `#habilitaciones`, `#sedes` y `#contacto`. `#recorrido`, `#proceso`, `#fabricacion` y `#habilitaciones` son las anclas del menú: no los cambies. `#recorrido` es un ancla dentro de la sección, de la craneoplastía al pie.

- **Recorrido** (`#recorrido`): ocho pantallas de scroll con una escena fija y el cuerpo entero de vidrio con seis implantes, el mismo del hero (cuerpo único, `docs/DECISIONES.md`); la cámara va del hero de parada en parada (guion en `camara.ts`). Tarjeta por parada a la derecha (hoja inferior en el celular, por debajo de 820 px), con miniatura 3D que se arma con partículas, y cierre con "Plantear un caso". Los implantes van en su capa, encima del vidrio, como titanio (pulido en CNC, mate en impresión 3D), y el activo se marca con una retícula (cuatro esquinas del primario, HTML sobre su caja en pantalla) que se cierra al llegar, mientras un corte de luz baja por la pieza una sola vez (shader del implante, `conLuz` en `escena.tsx`) y le deja un borde de luz. Sin resplandor detrás del implante: en Safari salía con ruido de colores. El maxilar se ve entero en el hero y en la craneoplastía, y se funde con el recortado y su implante al llegar a su parada.
- **Cómo trabajamos** (`#proceso`): pieza de partículas atada al scroll, sobre el fémur entero para que se lea qué es (cortes de TC, fémur con la zona a resecar en la diáfisis, implante intercalar con clavo y guías). Con puntero fino, al pasar el mouse se desarma y se vuelve a armar; con movimiento reducido, no.
- **Fabricación** (`#fabricacion`): las dos animaciones del borrador (CNC e impresión 3D), una vez al entrar, con "Volver a ver". **Rematan en la pieza real**: un render en Cycles de la misma malla del recorrido (la endoprótesis y la copa acetabular sin tornillos; `public/img/fabricacion/femur.webp` y `acetabulo.webp`, 4:3 con fondo transparente y sombra de contacto, de `npm run fabricacion`: `3d/scripts/render-fabricacion.py`). La animación (`components/animaciones/fabricacion.ts`) saca del alfa de esa imagen la silueta, el bloque del CNC y las filas del láser: no dibuja la pieza, así que para cambiarla alcanza con reemplazar el WebP (una foto de producto recortada sirve igual). Si cambia un implante (`npm run modelos`), se vuelven a renderizar. Las tarjetas van al 90 % del contenedor (pedido del usuario) y, con el puntero encima, suben 6 px y ganan sombra (`.tarjeta-fabricacion`, sombra en `::after` por opacidad; con movimiento reducido no suben). Es una excepción pedida a `docs/BOTONES.md`, que no hace subir a las tarjetas que no son link. La bajada entra con `AnimatedContent` como los bloques de las fichas (sube 24 px y se aclara de un desenfoque de 6 px). Sin JS, o si el render no carga, fotos de planta con `PlantPhoto`. Al cierre, a sangre, la **tira de fotos reales** (`CarruselPlanta`, `components/home/carrusel-planta.tsx`, sobre el Flex Carousel de React Bits en `components/flex-carousel.tsx`; fotos en `content/planta.ts`): la planta y piezas fabricadas, en color, todas bajo un velo azul salvo la que se señala con el puntero (sin puntero, la del centro). Se arrastra, va con rueda horizontal y teclado; la rueda vertical sigue scrolleando la página (`captureWheel` apagado); sin autoplay. Sin JS o sin WebGL2, la misma tira con scroll horizontal (`.carrusel-respaldo`). Por debajo de 640 px la curva de la lente lleva tope (`maxCurl`), la fila sube (`align`) y la caption baja lo que la curva alcanza, para que las tarjetas curvadas no la pisen. En escritorio el canvas se estira hacia el espacio libre de arriba (hasta las tarjetas) y de abajo (hasta el final de la sección), con la curva acotada a ese espacio, para que ninguna foto se corte contra un borde invisible; solo la franja de las tarjetas recibe el puntero (`hitArea`), así los clics de arriba siguen andando. Es lo único de la home que no es 3D ni partículas: le pone lo real.
- **Habilitaciones** (`#habilitaciones`): la tabla del borrador con la **lectura del registro** (`components/home/lectura-habilitaciones.tsx`): al llegar, una línea de luz baja una vez por la tabla (como el corte de luz del implante activo) y a su paso cada fila aparece, su divisoria se dibuja y los dígitos de la referencia se resuelven de izquierda a derecha desde cifras al azar (`components/cifra-generada.tsx`, la idea de `DecryptedText` sin el componente; solo cambian los dígitos, en cifras tabulares, así nada salta de ancho). Título y bajada entran con `AnimatedContent`; detrás, una luz de la marca se enciende con el scroll (`.habilitaciones-luz`, `animation-timeline: view()`). Estados en `data-lectura` (`espera`, `leyendo`, `quieta`); el HTML del servidor trae los números reales. **Distribución** (`#sedes`, `components/home/locations.tsx`): título y bajada a la izquierda, que entran palabra por palabra con un desenfoque que se aclara (`AnimatedContent` con `as="h2"` y `as="p"`, cada palabra un hijo), y a la derecha (una sola columna hasta 1024 px) el **mapa de Argentina con las cuatro sedes**: `MapaArgentina` (servidor, los trazados de `content/mapa-argentina.ts`) y `MapaSedes` (cliente). Sin halo ni difuminado alrededor del mapa. Entrada en `data-mapa` (`espera`, `dibujando`, `quieto`): primero se dibuja el mapa, después aparece cada pin de a uno de norte a sur, después la **línea se dibuja tramo por tramo** (Caseros, Alberti, Comodoro Rivadavia, Caleta Olivia) y al final una **luz recorre la línea** en bucle: baja de Caseros a Caleta Olivia, sube de nuevo y reinicia. Cada pin tiene un **radar** (dos ondas que se abren y se apagan). Al pasar el mouse, tocar o enfocar una sede, la **card con la miniatura** (`PlantPhoto`, tipo y dirección) aparece **a la derecha del pin**, centrada en su altura, aunque tape etiquetas, y su provincia se tiñe. Radar y luz se pausan fuera de pantalla (`data-a-la-vista`) y no corren con movimiento reducido. Los tiempos salen de `locations.tsx`. Los trazos animados escalan con `--trazo` (sin `vector-effect: non-scaling-stroke`: con él Chrome mide los guiones en píxeles y el dibujo no se ve). Fotos de sedes en `public/img/sedes/` (hoy placeholders "Foto pendiente" salvo la planta: se reemplazan sobrescribiendo el archivo). **Contacto** (bloque en el primario con el logo en blanco, liso: la cinta de fibras de antes se sacó por pedido del usuario; `img/cinta-contacto*.webp` quedan sin uso por si vuelve). Al llegar entra la tarjeta y detrás, de a una, sus piezas: título, bajada, logo y botón (`AnimatedContent` con `targets="[data-entra]"`, sube 24 px y se aclara de un desenfoque de 6 px); con el puntero encima gana sombra, sin subir (`.tarjeta-contacto`, en el envoltorio porque la tarjeta la recortaría). Vale para la home y las fichas. De Distribución al contacto, de fondo, la malla hexagonal de las fichas (`FondoMalla`, `components/fondo-malla.tsx`): el envoltorio pinta el `surface` y la malla, así que `Locations` va sin fondo propio.
- El hero (con el recorrido, que lleva su degradé) y el contacto son los únicos fondos de color. La luz azul del borrador (`.escenario`) queda solo en las vistas de respaldo de las paradas.

### Vidrio, formas y botones

- La translucidez vive en el objeto 3D, nunca en la interfaz. Excepciones:
  - La barra de escritorio, de vidrio (`NavGlass` en `components/nav-glass.tsx`, sobre `GlassSurface` de React Bits, con `PillNav` dentro). En Chrome refracta con un filtro SVG; en Safari y Firefox cae a vidrio esmerilado. Con `prefers-reduced-transparency` pasa a opaca (`.nav-glass`). Cualquier pieza de navegación nueva de vidrio usa `NavGlass`.
  - "Recorrer los implantes" del hero (`BotonVidrio`, `.boton-vidrio`), pedido por el usuario.
  - El fondo detrás del panel de contacto se desenfoca (`::backdrop`); el panel es opaco. En escritorio se ensancha con el tirador del borde izquierdo, hasta el 60 % de la pantalla (`contact-modal.tsx`).
  - Las tarjetas del recorrido son opacas: el vidrio no se extiende a tarjetas, botones ni otras superficies.
- En el celular, la barra es una píldora de vidrio flotante como la de escritorio (`NavGlass`, 56 px, más transparente: `backgroundOpacity` 0,25), dentro de `MobileNav` (`components/mobile-nav.tsx`). El menú es un panel esmerilado casi opaco debajo (`.menu-movil-panel`; no es `NavGlass` porque el vidrio refractivo dejaba leer el titular del hero a través de los enlaces): se despliega hacia abajo, los enlaces entran de a uno y "Plantear un caso" llega con un rebote chico; al cerrar sale todo en orden inverso y se pliega hacia arriba, más despacio (`data-estado`: `abierto`, `cerrando`). Se cierra con un enlace, Escape o tocando fuera.
- Formas: lo interactivo es pill (`rounded-full`); superficies e imágenes, `rounded-xl` (12 px). Los botones toman el radio de `--radius-control` (hoy pill); el sistema de botones propone 8 px, sin decidir.
- **Botones: seguí `docs/BOTONES.md`** (relieve suave, variables por variante, hover solo con `background-color`, 160 ms). Están implementados como `.boton` + `.boton-primario` / `.boton-claro` / `.boton-relleno`, y `.relieve` + `.relieve-claro` para lo que combina sin ser clickeable (`@layer components` en `globals.css`); no rehagas botones con utilidades sueltas. Los enlaces de texto subrayados usan `.enlace` (en el primario, `.enlace-marca`). Leelo antes de crear o tocar un botón, o algo que combine con ellos. El `hover:` de Tailwind ya está redefinido para exigir `(pointer: fine)`.
- Foco de teclado: regla base `:where(a, button, summary, [tabindex]):focus-visible` con el anillo del primario (`@layer base`); los componentes con su propio anillo ganan.

### Navegación y enlaces

- **Una sola página.** No hay Nosotros, Casos a medida ni índice lateral de secciones; si hacen falta más páginas, se plantean con el cliente.
- Menú de la barra (escritorio y móvil, `components/nav-links.ts`): Implantes (`/#recorrido`), Cómo trabajamos (`/#proceso`), Fabricación (`/#fabricacion`) y Habilitaciones (`/#habilitaciones`). Van con `/#` para que funcionen desde las fichas. En la home, PillNav marca con el punto la sección que cruza la mitad de la pantalla (`use-active-section.ts`, `aria-current="location"`).
- El logo del header lleva al hero (`/#inicio`, con `AnchorLink`): en la home sube arriba de todo; desde las fichas, vuelve a la home. En el celular, tocarlo cierra el menú.
- **Cualquier ancla a la home va con `AnchorLink` o `scrollToAnchor`** (`components/anchor-link.tsx`): `Link` no vuelve a bajar si el ancla ya está en la URL.
- Índice anatómico del recorrido (cráneo, maxilar, hombro, acetábulo, fémur proximal, diáfisis femoral) desde 1100 px, con enlaces a `#parada-<id>` y el hover por proximidad de `LineSidebar` de React Bits (`components/home/use-proximidad.ts`): los nombres cerca del cursor se corren y pasan al primario.
- Tres intenciones nada más: recorrer, ver ficha y contactar.
  - **"Plantear un caso" es la única etiqueta de contacto** (`contactLabel`). Abre el panel de `/contacto` con `?motivo=caso` (`contactHref`); en las fichas, con `?producto=<slug>`.
  - **Todo enlace a `/contacto` va con `ContactLink`** (`components/contact-link.tsx`, `Link` con `scroll={false}`): con `Link` a secas, Next sube la página al hero al abrir el panel y queda ahí al cerrarlo.
  - Paradas de catálogo: "Ver ficha del producto" (y "Ficha técnica (PDF)" en la endoprótesis). Paradas a medida: "Plantear un caso".
- Fichas (`/productos/[slug]`): la miga de pan dice "Implantes" y va a `/#recorrido` (con `AnchorLink`). Diseño de la landing: hero en una sola pantalla (texto, datos clave y botones a la izquierda; la primera foto a la derecha sobre `.ficha-escenario`, con `.mini-imagen` y `.ficha-imagen-hero`), "Del estudio del paciente al implante" con las demás imágenes y su `alt` como pie, especificaciones, "Más implantes" (tarjetas `.tarjeta-enlace`, la sección 6 de `docs/BOTONES.md`: los demás productos y "Volver al recorrido") y `ContactCta`. Desde "Más implantes" hasta el cierre, de fondo, la malla hexagonal (`FondoMalla`, `components/fondo-malla.tsx`, sobre `ShapeGrid`) en el primario al 10 % que deriva hacia arriba y enciende las celdas bajo el cursor: la estructura porosa de los implantes impresos. La misma va en la home, de Distribución al contacto; el ajuste vive en `FondoMalla`. Los costados y el borde de arriba se desvanecen en proporción a la caja; abajo, la malla sigue hasta la línea del footer (2,5 rem más allá del envoltorio) y se desvanece en 3 rem (`fadeBottom`), así el bloque de contacto queda centrado en ella. Sin galería ni miniaturas; la radiografía del hombro sigue ahí hasta que se anonimice.
- Barra de escritorio: 62 % del viewport (mínimo 46 rem) y 64 px de alto. Entra solo al cargar el sitio por la home (`NavIntro`, `.nav-intro-*`), con la entrada de la home: el contenido se maqueta al ancho final con `100cqw` y el vidrio lo recorta mientras se estira; no lo maquetes al ancho del vidrio.

### Movimiento

- **Entrada de la home orquestada** (`components/intro.ts`, tiempos en `components/intro-timeline.ts`): una sola línea de tiempo con fases `waiting` → `running` → `done` en `data-intro`. Header, cuerpo (desenfoque y escala en CSS, `.intro-3d`; giro hasta su pose en `escena.tsx`, con `estadoRecorrido.entrada`) y fibras (`introStart`) a la vez; mientras terminan, el título letra por letra; después el subtítulo, los botones, la línea ANMAT (`INTRO_AT.credentials`) y el aviso de deslizar (`INTRO_AT.scrollCue`), con `.intro-in` y `--intro-at`. Hoy la arranca la escena única (`Recorrido3D`, `components/recorrido-3d/recorrido-3d.tsx`) cuando el cuerpo está listo (máximo 2,5 s). **Va a haber pantalla de carga**: cuando exista, la arranca ella al irse con `startIntro()`. Cualquier pieza nueva del primer pantallazo se suma a esta línea de tiempo.
- El resto del movimiento tiene una idea: el recorrido y el proceso van atados al scroll (progreso propio, sin librería); fabricación se dispara una vez al entrar; habilitaciones se lee una vez al entrar (barrido, filas y cifras); la luz de habilitaciones deriva con `animation-timeline: view()`. Las fichas, el título de Habilitaciones, la bajada de Fabricación y el cierre de contacto entran con `AnimatedContent` (`components/animated-content.tsx`, React Bits copiado a mano: sin ScrollTrigger, el disparo `scroll` es un IntersectionObserver que corre una vez; al montar en el hero, con el scroll en el resto). Con `stagger` anima los **hijos directos** (para escalonar `li`, el componente es el `ul` con `as="ul"`), o lo que marque el selector `targets`, en el orden del documento. El desenfoque va en `filter` en línea: un elemento con `filter` propio (el logo en blanco) se anima desde un envoltorio. Sin JS no oculta nada: el ocultado previo vive en `.contenido-animado` (`globals.css`, bajo `scripting: enabled`), y `data-contenido-listo` se pone después del `fromTo`, nunca antes. Fuera del hero (fibras, aviso de deslizar y el vaivén del busto), nada se mueve solo en bucle salvo el vaivén leve del cuerpo, las miniaturas con la escena fija, la deriva lenta de la malla hexagonal del cierre, y el radar de los pines y la luz de la línea del mapa de Distribución (pedidos por el usuario).
- Sin JS no se oculta contenido: lo que oculta el JS se oculta con CSS bajo `@media (scripting: enabled)`, nunca con opacidad 0 en el HTML del servidor. Sin JS, el recorrido y el proceso se leen en orden, sin escena fija.
- Con `prefers-reduced-motion`: sin amortiguación, barrido ni ensamble (la retícula, quieta); cada pieza muestra su estado final o el del paso activo, quieta.
- Fondos animados: se admiten donde sumen (AJUSTES), livianos (CSS o canvas 2D antes que WebGL), pausados fuera de pantalla y nunca más de uno a la vista junto con el 3D. De React Bits, los de líneas, puntos y grillas (Waves, Threads, DotGrid, MagnetLines, RippleGrid…) pasaron a WebGL2 y no entraron; los de canvas 2D son `Noise` y `ShapeGrid`, que va al cierre de la home y de las fichas (`FondoMalla`) y no cuenta como contexto WebGL. `ShapeGrid` acepta tokens (`var(--color-…)`, `color-mix()`) y los resuelve con una sonda sin transición (la regla global de movimiento reducido le pone 0,01 ms a todo y el estilo calculado devolvía el color de partida); mientras solo deriva dibuja a 30 cuadros (`idleFps`).

### Rendimiento

- **Tres contextos WebGL en la home, y no más:** la escena única (el cuerpo, del hero al cierre), las fibras del hero y la tira de fotos de Fabricación (Flex Carousel, `ogl`), que se monta solo cuando la sección se acerca (60 % de pantalla) y se desmonta un segundo después de alejarse, cuando la escena y las fibras ya están pausadas. Las miniaturas son vistas (`View` de drei con `track`) del canvas de la escena; el proceso y la fabricación son canvas 2D. Una pieza nueva no suma un contexto: reutilizá uno o usá canvas 2D o CSS.
- **Carga en dos tiempos:** la escena se monta apenas el navegador queda libre (como mucho, 1,5 s; `next/dynamic` sin SSR) con `cuerpo-cabeza.glb` e `implantes.glb` (509 KB; el busto de antes, 498); `cuerpo-resto.glb`, `implantes-recorrido.glb` y las miniaturas se piden cuando la intro terminó (`useIntroPhase() === 'done'`, en `escena.tsx`). Mientras tanto queda el cuerpo del hero: lo que falta está debajo del corte.
- **Pausa fuera de pantalla:** la escena usa `frameloop="demand"` (dibuja cuando cambia el progreso; en la toma del hero, a cada cuadro por la entrada y el vaivén, y en las paradas el vaivén a 30 cuadros) y pasa a `never` fuera de pantalla; las fibras se pausan al irse con el texto del hero y fuera de pantalla; las animaciones 2D no dibujan fuera de pantalla y se detienen al terminar.
- **Vidrio opaco fuera del hero:** el vidrio del cuerpo es transparente solo mientras el corte bajo el cuello baja (peso del hero entre 0 y 1); en la toma del hero y desde la craneoplastía es opaco (transparente, el recorrido de escritorio caía a 52 fps). Con la toma del hero entera, la escena dibuja solo la caja que ocupaba el busto (`recorteHero`).
- Para medir, seguí la memoria del proyecto (Chrome con GPU, comparar alternando variantes) y los scripts de `docs/landing/cuerpo-unico/`. Referencia actual: recorrido y paso a la craneoplastía a 60 fps con tope en escritorio y celular; hero quieto en escritorio a 109 a 119 fps sin tope (el busto de antes, 71); el tramo corto del hero (0,3 pantallas), 58 con tope y 46 sin tope (antes, 67).

### Otras reglas

- Titulares: `display-xl` (hero) y `display-lg` (secciones), fluidos con `clamp()`. Datos técnicos (specs, disposiciones, latitudes) en `font-data-mono tabular-nums`.
- Iconos: Phosphor (`@phosphor-icons/react/ssr`, peso `light` en iconos de contenido). `content/` usa claves semánticas (`IconKey`) y `components/icon.tsx` las traduce.
- Componentes de React Bits: no instalarlos con `shadcn add`, porque corrompe las cadenas de sombras y colores. Sacá el código con `npx shadcn@latest view @react-bits/<Nombre>-TS-TW` y copialo a mano a `components/` (nombre en kebab-case).
- Copy visible: sin guiones largos (`—`) ni rangos con guion ("10 a 12 mm") y como máximo un eyebrow cada tres secciones.
- Contenedor de página: utilidad `page-container`.
- Fotos de planta (máquinas, instalaciones): siempre con `PlantPhoto` (blanco y negro con tinte de marca). Las de producto y casos, sin tratamiento. Excepción: la tira de Fabricación va en color con el velo del carrusel (`docs/DECISIONES.md`).

## Datos

- Las páginas leen productos solo con `getProducts()` y `getProductBySlug()` (asíncronas) de `content/products.ts`. Así el origen puede pasar a un CMS sin tocar las vistas.
- Fichas: `generateStaticParams` + `notFound()`. Con Cache Components no existe `dynamicParams`. La primera visita a un slug desconocido responde 200 con `noindex` y después queda cacheada como 404.

## Problemas conocidos

- Si un cambio de `globals.css` no aparece en el build, borrá `.next/` (la caché de Turbopack con `@tailwindcss/turbopack` no siempre se invalida). Pasó varias veces; no borres `.next/dev` si el usuario tiene `next dev` corriendo. Con `next dev` corriendo, suele alcanzar con `touch app/globals.css` (pasó el 2026-11-01 con las reglas del carrusel: el servidor seguía sirviendo el CSS viejo hasta tocar el archivo). Si el `touch` tampoco alcanza, un cambio real en el archivo (una línea en blanco al final, y sacarla) sí recompila (pasó el mismo día con las reglas de habilitaciones). No siempre: el mismo día, con las reglas de la ficha, una declaración quedó una edición atrás aunque el resto del archivo estaba al día, y `touch` no la destrabó. Para saber qué se está sirviendo, pedí el chunk CSS del HTML con `curl` y buscá la regla; si está vieja, reiniciá `next dev` borrando `.next/dev`.
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
- `docs/ARQUITECTURA_MODELO_3D.md`: el cuerpo translúcido con seis implantes. Qué se ve, cómo se generan los modelos (Blender por script y atlas anatómicos abiertos), nombres de malla y cómo se recapturan los respaldos. Leelo antes de tocar `components/recorrido-3d/` o `3d/`.
- `docs/landing/cuerpo-unico/`: el material del cuerpo único. `ESTADO.md` es el índice: qué hay en cada carpeta, el veredicto de la compuerta, las mediciones finales y los pendientes. Los scripts de capturas y fps (`base/medir.mjs`, `comparar.mjs`, `fase4/recorrido.mjs`, `fase5/paridad.mjs`) sirven para medir cualquier cambio del 3D.

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
- [x] 7 · Tira de fotos reales al cierre de Fabricación (Flex Carousel con velo).

### Cuerpo único (rama `cuerpo-unico`, fases 0 a 5 hechas)

- [x] 0 · Línea de base del hero (capturas y fps).
- [x] 1 · Prototipo de paridad: keyframe `hero`, aspecto del busto, `corteY` y degradé. Compuerta: pasa (segunda pasada del verificador).
- [x] 2 · Blender: maxilar entero, piel por zonas y cuerpo en dos archivos.
- [x] 3 · El hero dentro de la escena fija del recorrido; un canvas, dos contextos.
- [x] 4 · Fundido del maxilar, fibras pausadas, desliz del hero en el celular y vidrio opaco fuera del hero (recorrido otra vez a 60 fps).
- [x] 5 · Limpieza (sin `components/hero-3d/`, `cabeza.glb` ni los parámetros de prototipo) y documentación.

### Pendiente

- **Radiografía con datos de paciente:** `public/img/hombro-radiografia.jpg` (ficha del hombro, `content/products.ts`) muestra nombre e identificación de una paciente en el visor PACS. Sacarla o pixelarla antes del lanzamiento. Quedó fuera de la tira de Fabricación.
- **Fotos de las sedes:** el laboratorio de Caseros y las sucursales de Comodoro Rivadavia y Caleta Olivia tienen placeholders en `public/img/sedes/` (el mapa de Distribución los muestra con "Foto pendiente"); pedirlas a Innercare y sobrescribir los archivos (`foto` en `content/company.ts`).
- **Fotos de la planta:** pedirle a Innercare fotos con gente trabajando (planificación, control de calidad, embalaje) y confirmar que `fabricacion-impresion-3d.jpg` es de su planta (parece del fabricante de la máquina) y qué máquina es `fabricacion-cnc-maquina.jpg` (parece electroerosión, no un centro CNC). Se suman a `scripts/fotos-carrusel.mjs` y `content/planta.ts`.
- **Medir en un celular real** el hero, el recorrido con las miniaturas y el contacto (si no llega a 60, bajar `DPR_CELULAR`, hoy 1,5, en `components/recorrido-3d/recorrido-3d.tsx`).
- **Confirmar con Innercare:** tres specs del recorrido ("Técnica: Impresión 3D" de la craneoplastía y del acetábulo, "Desarrollo: A pedido médico" del maxilar) y las medidas estimadas de los implantes (sobre todo el hombro). Cuando lleguen sus CAD, reemplazan a los generados respetando el nombre de malla.
- **Fotos de baja resolución:** varias de casos tienen menos de 650 px (`caso-craneo-3d`, `caso-acetabular-segmentacion`, `caso-intercalar-guias`) y se ven blandas.
- **Logo:** no hay versión clara ni sin lema; el contacto usa el PNG invertido y el footer repite el lema.
- **Contexto de las fibras:** queda vivo (pausado, sin dibujar) después del hero; no se libera.
- **Tramo corto del hero** (las primeras 0,3 pantallas, con el vidrio transparente mientras baja el corte): 46 fps sin tope contra 67 del busto de antes en escritorio (58 con tope). Ver `docs/landing/cuerpo-unico/ESTADO.md`.
- **Detalles del cuerpo único:** en escritorio, el hombro y su implante asoman bajo el corte desde seg 0,33; en el cierre, el degradé se oscurece antes de fundirse al gris; la luz de las paradas gira con la cámara (cambió respecto del recorrido original), falta revisarla a ojo.
- **Miniaturas del recorrido:** costura de 1 px posible a algunos zooms y un marco visible durante los fundidos de la tarjeta (arreglarlo pide que el canvas no pinte fondo).
- **Aviso de deslizar** no centrado en escritorio (centrado pisa el busto): confirmar con el usuario o mover el busto.
- **Integrar `cuerpo-unico`** a `rediseno` y `main` cuando el usuario lo apruebe.
- Detalles del 3D: ala acetabular algo separada del hueso de frente; unos 222 000 triángulos en el recorrido (11 % arriba del objetivo); respaldos por parada (`cuerpo-<parada>.webp`) sin hacer.
- Envío real del formulario: `sendContact` (`app/contacto/actions.ts`) valida pero no manda nada. Envío de casos con estudios adjuntos: antes, definir con Innercare cómo recibir datos de salud.
- `metadataBase` con el dominio definitivo (el build avisa), metadatos por página, `sitemap` y `robots`.
- Pantalla de carga que arranque la intro con `startIntro()`.
- `npm run modelos` regenera `implantes-recorrido.glb` con unos bytes distintos (Blender no es determinista en los booleanos): se deja el del repo mientras no cambie un implante.

## Convenciones

- Código: comillas simples, sin punto y coma, comentarios en español.
- Commits en inglés, en imperativo.
