# Bitácora de la landing

Memoria compartida entre las fases de la landing: cada fase deja acá qué hizo, qué decidió sin preguntar y qué quedó pendiente, para que la siguiente arranque sabiendo dónde está parada. Las entradas se suman al final y no se reescriben.

---

## Fase 1 · Páginas, navegación y hero (2026-10-30)

**Commits:** `6f3ea17` Make the home a single page with an anchor menu · `0ae95a0` Add the ANMAT line and the scroll cue to the hero · y el commit de esta entrada (docs).

**Qué se hizo.**
- Borrados `app/nosotros/`, `components/home/section-index.tsx` (y su lista de secciones en `app/page.tsx`) y `components/home/custom-cases.tsx` (la sección "Casos a medida" de la home: quitarla era trivial). No existía `app/casos-a-medida/`.
- Sin enlaces a `/nosotros`, `/casos-a-medida` ni `/productos`: barra, menú móvil, footer, hero, "Fabricación propia" (salió "Ver catálogo") y el texto del catálogo. El código de `/productos` sigue y compila.
- Fichas: la miga de pan dice "Implantes" y va a `/#recorrido`.
- Menú de anclas en `components/nav-links.ts`: Implantes (`/#recorrido`), Cómo trabajamos (`/#proceso`), Fabricación (`/#fabricacion`), Habilitaciones (`/#habilitaciones`). Funciona desde las fichas (probado: lleva a la home y baja a la sección, con el hueco del header). En la home, PillNav marca con el punto la sección que cruza la mitad de la pantalla (`components/use-active-section.ts`); arriba de todo, ninguna. El footer tiene las mismas anclas en la columna "Sitio".
- `components/anchor-link.tsx`: `scrollToAnchor` y `AnchorLink`. `Link` de Next no vuelve a bajar si el ancla ya es la de la URL (probado); estando en la home, bajamos nosotros. Lo usan la barra (vía `onItemClick` de PillNav), el menú móvil, el footer y `BotonVidrio`. **Cualquier ancla nueva a la home, con `AnchorLink`.** El menú móvil se cierra al tocar un ancla.
- "Plantear un caso" es la única etiqueta de contacto (barra, menú móvil, hero, CTA de contacto, fichas, footer). `contactHref` y `contactLabel` en `nav-links.ts`.
- Hero: "Plantear un caso" (principal) y "Recorrer los implantes" (vidrio, `#recorrido`). Debajo, la línea de habilitaciones con un sello Phosphor (`habilitacionesResumen` en `content/company.ts`) y el aviso "Deslizá para recorrer el cuerpo" con un riel por el que cae un tramo del primario (`.aviso-deslizar` en `globals.css`; quieto con movimiento reducido). Las dos entran con `.intro-in`: `INTRO_AT.credentials` (3000 ms) y `INTRO_AT.scrollCue` (3200 ms); el fin de la entrada pasó a 4000 ms. Sin JS se ven (el CSS solo oculta con `scripting: enabled`).
- Entrada de la barra: se sumó el retraso del cuarto enlace (`nth-child(4)`).
- Entrada en `docs/DECISIONES.md` ("Una sola página con menú de anclas"), que marca como reemplazada la de páginas separadas e índice lateral.

**Decidido sin preguntar.**
- **"Plantear un caso" genérico va con `?motivo=caso`** ("Caso a medida" marcado): la etiqueta habla de un caso clínico. En las fichas va `?producto=<slug>`. Quien venga por otra cosa cambia el motivo en el formulario.
- **El aviso de deslizar no va centrado en escritorio.** Centrado pisa la espalda del busto en cualquier pantalla de proporción menor a ≈ 1,8:1 (probado a 1440×900 y 1280×720). En escritorio va abajo a la izquierda, alineado con el texto, con el riel a la izquierda; en el celular, centrado entre la línea ANMAT y el busto. Si el usuario lo quiere centrado sí o sí, la salida es mover el busto, y eso es tocar el hero.
- **Línea ANMAT con sello y no con filete**, como en el borrador: el filete a la izquierda se repetía con el riel del aviso y parecían dos piezas iguales.
- **`aria-current="location"` en PillNav** (antes `page`): son secciones de una página. Es el único cambio de lógica en el componente de React Bits, anotado en su cabecera.
- La Taste Skill desaconseja avisos de scroll y líneas chicas bajo los botones; mandan AJUSTES.md y el usuario.
- **No toqué `CLAUDE.md`**: este subagente no tiene autorización del usuario para editarlo. Quedó desactualizado (ver pendientes).

**Comprobado en el navegador** (build de producción, Chrome sin interfaz): hero a 1440×900, 1280×720 y 390×844 sin choques; anclas desde una ficha, desde la barra, repetidas y desde el menú móvil; el botón del hero abre el panel con "Caso a medida" marcado; con movimiento reducido todo visible y el riel quieto. Sin errores de consola.

**Pendiente.**
- **Fase 2:** las secciones `#recorrido` y `#proceso` no existen todavía; los enlaces están puestos y no hacen nada hasta entonces (desde una ficha, llevan al inicio de la home). Al crearlas, el punto activo de la barra las toma solo (lee los ids de `nav-links.ts`). `#habilitaciones` (`Statement`) y `#fabricacion` (`OwnManufacturing`) son las secciones viejas, que la fase 2 reemplaza: los ids tienen que mantenerse.
- `components/home/process.tsx` ya estaba sin usar antes de esta fase, y `components/plant-photo.tsx` quedó sin usar al borrar Nosotros. Se dejaron para la fase 2 ("Cómo trabajamos" y "Fabricación").
- En el celular, entre el aviso y la cabeza del busto queda un hueco de unos 80 px (el canvas trae aire arriba del busto). Se podría ajustar con el `-mt` de `Hero3D` en el celular, pero eso es tocar el hero: no lo hice.
- **`CLAUDE.md` desactualizado**, para que lo actualice el usuario o una fase autorizada: nombra el índice lateral (`section-index.tsx`, "Navegación", la entrada de la home y la excepción de vidrio), "Ver casos a medida" como `BotonVidrio`, las etiquetas de CTA ("Ver catálogo", "Ver casos a medida", "Contactar") y las páginas Casos a medida y Nosotros en "Estado".
- La advertencia de `metadataBase` en el build es anterior y sigue (pendiente de `CLAUDE.md`).
