# Registro de decisiones

Por qué el proyecto es como es. `CLAUDE.md` recoge las reglas vigentes; aquí queda el razonamiento detrás de cada una y lo que se descartó. No se lee por defecto: consultalo cuando haga falta entender o revisar una decisión.

Cada entrada: fecha, rama, decisión, motivo, alternativas descartadas y pendientes. Las entradas no se reescriben: si una decisión cambia, se añade una nueva que la reemplace y se marca la vieja como **Reemplazada por** la nueva.

---

## 2026-10-29 · Navegación de escritorio con PillNav

Rama `rediseno`.

**Decisión.** La navegación principal de escritorio usa `PillNav` de React Bits (`components/pill-nav.tsx`), con relleno de marca al pasar el mouse y un punto bajo la página activa. El menú móvil sigue siendo el propio (`components/mobile-nav.tsx`).

**Motivo.**
- Se integra con el router de Next sin reescribirlo: acepta `linkComponent={Link}` y la ruta activa (`activeHref`), así que mantiene la navegación en cliente y la precarga.
- El efecto es sobrio, acorde a un fabricante de productos médicos.
- No añade dependencias, admite nuestros colores por props y respeta `prefers-reduced-motion`.

**Descartado: GooeyNav.**
- Usa `<a>` común, así que cada clic recarga la página entera (incluido el 3D del hero), y marca el activo por posición, no por ruta.
- La gota que se derrite es una estética lúdica, más de portfolio o startup que de un fabricante regulado.
- Dibuja con WebGL y competiría con la escena 3D del hero por la GPU.

## 2026-10-29 · Vidrio solo en la barra de navegación

Rama `rediseno`.

**Decisión.** La barra de escritorio es una pieza de vidrio flotante (`GlassSurface` de React Bits con `PillNav` dentro). Es la **única** excepción a la regla de que la translucidez vive en el objeto 3D y nunca en la interfaz: el vidrio no se extiende a tarjetas, botones ni otras superficies.

**Cómo funciona.**
- Chrome y Edge: refracción real con un filtro SVG en `backdrop-filter`.
- Safari y Firefox: no admiten ese filtro, así que cae a vidrio esmerilado (desenfoque más saturación).
- Con `prefers-reduced-transparency` la barra pasa a opaca (`.nav-glass` en `globals.css`).
- No usa WebGL: funciona aunque el 3D del hero no pueda arrancar.

**Ajustes.** `backgroundOpacity` 0.4 para que se lean los enlaces sobre fotos. Aberración cromática reducida (desplazamientos 0/3/6 en vez de 0/10/20): con los valores por defecto los bordes se teñían de arcoíris y distraían sobre el logo.

**Pendiente.** Al cargar la página, detrás de la barra solo hay fondo liso y el vidrio no se nota hasta hacer scroll. El fondo del hero lo va a cambiar el usuario.

## 2026-10-29 · No instalar React Bits con `shadcn add`

**Decisión.** Los componentes de React Bits se copian a mano desde `npx shadcn@latest view @react-bits/<Nombre>-TS-TW`, no con `shadcn add`.

**Motivo.** `shadcn add` corrompe el archivo en silencio. Su transformación de clases de Tailwind trata como listas de clases cadenas que no lo son y elimina los tokens que ve repetidos: `rgba(255, 255, 255, 0.22)` pasa a `rgba(255, 255, 0.22)`, `.join(' ')` a `.join('')`, y se rompen sombras y `color-mix()`. Ni el lint ni TypeScript lo detectan; solo se ve en pantalla.

**Al copiar un componente.** Nombre en kebab-case en `components/`. Para `noUncheckedIndexedAccess` hacen falta aserciones `!`, y los patrones del componente que chocan con las reglas de hooks de React se desactivan por archivo, con un comentario que lo explique. No se cambia su lógica.

## 2026-10-29 · Páginas separadas e índice lateral en la home

Rama `rediseno`. **Reemplazada por** "Una sola página con menú de anclas" (2026-10-30).

**Decisión.** El sitio sigue teniendo páginas separadas (Productos, fichas, Casos a medida, Nosotros, Contacto). En la home se suma un índice lateral de secciones a la derecha, como complemento de la barra superior y no en su lugar.

**Motivo de mantener las páginas.**
- Cada ficha necesita su propia dirección para compartirse ("pasame la ficha del fémur").
- Los buscadores indexan por página: una búsqueda concreta tiene que caer en su ficha.
- El catálogo y los casos van a crecer; en una sola página se vuelve interminable.

**Cómo es el índice.**
- Roles separados: la barra superior lleva a otro lugar del sitio; el índice dice dónde estás dentro de la home y salta entre sus secciones.
- Marcas finas en lugar de íconos: secciones como "Fabricación propia" no tienen un ícono obvio, y un ícono que hay que adivinar va contra el tono claro y técnico. El nombre aparece con el puntero o el foco y siempre está disponible para lectores de pantalla.
- Enlaces `#id` normales: funcionan con teclado y sin JS. El scroll suave y el hueco del header salen de CSS (`scroll-behavior` y `scroll-padding-top` en `globals.css`, con `data-scroll-behavior="smooth"` en `<html>` para que Next no lo aplique al cambiar de página).
- Sección activa: la última cuyo inicio pasó la mitad de la pantalla, recalculada con un `IntersectionObserver` (sin escuchar el scroll). Así, con el footer a la vista, sigue marcada la última sección.
- Solo desde `lg`: en móvil no hay margen libre.

**Descartado.** Una sola landing con todo el contenido. Un índice solo con íconos.

## 2026-10-29 · Sistema de botones de relieve suave

**Decisión.** Todos los botones siguen `docs/BOTONES.md`, definido por el usuario: relieve sutil (degradado, luz y sombra interiores, sombra de contacto y de color), variables por variante, hover que cambia solo `background-color`, 160 ms con `--ease-out`, hover solo con puntero preciso.

**Aplicado.** Curvas `--ease-out` y `--ease-in-out` en `@theme`, y el `hover:` de Tailwind redefinido para exigir `(hover: hover) and (pointer: fine)`.

**Migración (mismo día).** Botones existentes pasados al sistema: clases `.boton` y `.relieve` en `globals.css`, detalle en `docs/BOTONES.md`, sección 7. Se quitaron las flechas decorativas de los primarios (íconos solo a la izquierda y si ayudan a entender la acción). La barra de vidrio pasó a 64 px para que "Contactar" tenga los 48 px táctiles.

**Pendiente.** Radio: el sistema propone 8 px y el sitio usa pill; mientras no se decida, el token `--radius-control` queda en pill. Tarjetas de producto y casos según la sección 6 del sistema.

## 2026-10-29 · El índice lateral también es de vidrio

Rama `rediseno`. Amplía "Vidrio solo en la barra de navegación".

**Decisión.** El índice lateral de la home usa el mismo vidrio que la barra. Los ajustes se comparten en `components/nav-glass.tsx` (`NavGlass`), para que las dos piezas se vean idénticas. La excepción a la regla de translucidez pasa a ser "la navegación de escritorio", no solo la barra; tarjetas, botones y demás superficies siguen sin vidrio.

**Detalle técnico.** En el índice, el vidrio es una capa aparte detrás de la lista: GlassSurface recorta su contenido y cortaría los nombres que asoman a la izquierda.

**A tener en cuenta.** Entre 1024 y unos 1400 px de ancho, el índice se superpone unos 30 px al borde derecho del contenido. El vidrio mantiene legible lo que queda debajo; si molesta, se puede mostrar solo desde 1408 px.

## 2026-10-29 · Barra más angosta y entrada con resorte

Rama `rediseno`. Pedido del usuario, con dos capturas de referencia (barra flotante de "Aether Lane").

**Decisión.**
- La barra de escritorio mide el 62 % del viewport, como en la referencia (893 px a 1440 px), con un mínimo de 46 rem para que entren logo, enlaces y "Contactar". El alto se mantiene en 64 px: en proporción al viewport ya era algo menor que el de la referencia.
- Al cargar el sitio, la barra entra en cuatro tiempos: píldora con el logo al centro (fundido, desenfoque y escala), estiramiento hasta el ancho final con un resorte que se pasa un 4,6 % y vuelve, los enlaces uno tras otro mientras crece, y "Contactar" con un rebote más marcado. Dura unos 2,1 s.
- Solo al entrar al sitio por la home. Quien llega directo a una ficha o a contacto (desde un buscador o un link compartido) viene a hacer algo concreto y no tiene que esperar a que aparezca "Contactar". Volver a la home navegando dentro del sitio no la repite.

**Cómo es.** Solo CSS (`.nav-intro-*` en `globals.css`). El contenido se maqueta siempre al ancho final con unidades de contenedor (`100cqw`) y el vidrio, que anima su `width`, lo recorta: nada se reacomoda y el logo sigue al borde izquierdo sin moverlo aparte. Los resortes son curvas `linear()` calculadas. Los enlaces solo animan opacidad y desenfoque, porque PillNav mide sus posiciones para el punto activo. Con movimiento reducido no hay entrada. `NavIntro` (`components/nav-intro.tsx`) lee la ruta con `usePathname` en el primer render y pone `data-intro` solo si es `/`; el valor queda fijo porque el header no se desmonta. La barra se centra con flex (`justify-center` + `shrink-0`) y no con `mx-auto`: con márgenes automáticos, el exceso del rebote iba todo a la derecha.

**A tener en cuenta.** Es más movimiento que el dial acordado (motion 4); se aceptó por pedido explícito y porque pasa una sola vez. Mientras la barra crece, GlassSurface regenera el mapa de refracción en cada cuadro (ResizeObserver); no se vieron saltos.

## 2026-10-29 · Contacto: una ruta, panel o página

Rama `rediseno`.

**Decisión.** `/contacto` se abre como panel lateral sobre la página actual cuando se llega navegando dentro del sitio, y como página completa con un enlace directo o al recargar. Es la misma ruta: Next la intercepta con `app/@modal/(.)contacto` (rutas paralelas + interceptadas).

**Motivo.**
- El enlace se puede compartir (firma de mail, QR, WhatsApp), cosa que un modal solo no permite.
- Se conserva el contexto: el panel se abre sobre la ficha que se estaba mirando y el formulario llega precargado (`?producto=<slug>` marca el producto; `?motivo=<id>`, el motivo).
- "Atrás" cierra el panel en vez de sacar al usuario de la ficha.

**Cómo es.**
- `<dialog>` nativo con `showModal()`: foco atrapado, Escape y fondo inerte sin código propio.
- Entrada desde la derecha (desde abajo en móvil) con el fondo oscureciéndose; los bloques del formulario entran en cascada (`.field-in`). Salida animada antes de volver atrás en el historial. Todo con CSS; con movimiento reducido, fundido corto.
- Barra de progreso en el borde superior: se llena con cada campo obligatorio completo (motivo, nombre, institución, email, consulta).
- Validación en línea en el navegador (errores al salir de un campo con contenido y al enviar) y de nuevo en el servidor (`sendContact`), con los mismos textos (`content/contact.ts`).
- Clic en el fondo cierra solo si no hay nada escrito.
- Si se cierra sin enviar, al reabrirlo sigue lo escrito (Next conserva la ruta oculta con `<Activity>`). Se empieza de cero tras un envío exitoso o si cambia el contexto.

**Ajustes tras la primera revisión.**
- La X entra última y es la última en el orden del tabulador. Al abrir, el foco va al panel (los lectores de pantalla anuncian "Contacto"), no a la X: antes arrancaba con el anillo de foco pintado.
- Cada pieza entra por separado: título, cada opción de motivo, cada campo, la barra (se llena desde cero), los canales, el pie, el botón y la X. El orden está documentado en `contact-form.tsx`.
- "Enviar consulta" entra con un rebote suave (se pasa un 1,5 % y se asienta). Los errores aparecen con una entrada corta.
- Las entradas usan `backwards` y no `both`: con `both`, el transform final quedaba fijo y tapaba el efecto de apretar del botón.
- Más vidrio: el fondo detrás del panel se oscurece y se desenfoca (6 px). El panel sigue opaco: con fotos de producto detrás, un formulario translúcido pierde contraste justo donde hay que leer y escribir. Con `prefers-reduced-transparency`, el fondo es opaco y sin desenfoque.

**Problema encontrado.** Con Cache Components, Next no desmonta la ruta al salir: la oculta con `<Activity>`. El diálogo quedaba abierto, invisible y con la página trabada. Se cierra en la limpieza de un `useLayoutEffect`, y el bloqueo de scroll pasó de `html:has(...)` a un atributo `data-contact-open` que pone y quita el panel. Queda anotado en `CLAUDE.md`, "Problemas conocidos".

**Referencia.** La página de contacto de Raomed no tiene formulario (solo teléfonos, mails y dirección). Su envío de casos es un formulario en dos pasos: datos del caso, y después remitente y archivos.

**Descartado.** Solo modal (no se comparte, "atrás" falla). Solo página (se pierde el contexto). Formularios separados de contacto y envío de casos desde el arranque: primero el de contacto; el de casos, cuando se confirme que se va a usar.

**Pendiente.** Envío real (hoy `sendContact` valida y no manda nada). Envío de casos con estudios adjuntos: son datos de salud (datos sensibles, Ley 25.326), así que antes hay que definir con Innercare cómo recibirlos.

## 2026-10-29 · La dirección de `rediseno` es la definitiva

Rama `rediseno`.

**Decisión.** La dirección visual de `rediseno` (grises fríos, titulares en peso regular, navegación de vidrio centrada y 3D en el hero) deja de ser una exploración: es la que va al lanzamiento. Se integra a `main` cuando esté lista.

**Motivo.** Decisión del usuario, después de compararla con `main`.

**Descartado.** La dirección anterior de `main`, que queda solo en el historial de git.

## 2026-10-29 · El 3D del hero: un cuerpo translúcido con seis implantes

Rama `rediseno`. Detalle completo en `ARQUITECTURA_MODELO_3D.md`.

**Decisión.** El hero muestra un cuerpo entero de vidrio, con el esqueleto tenue y seis implantes de titanio (craneoplastía, maxilar, hombro, acetabular, endoprótesis de fémur e intercalar). Arranca en la cabeza y baja con el scroll. Los modelos se generan con scripts de Blender: la anatomía sale de atlas abiertos (Z-Anatomy o BodyParts3D) y los implantes son paramétricos, desde la ficha técnica y las fotos.

**Motivo.**
- Muestra todo el alcance de Innercare en una sola pieza, en lugar de un solo producto.
- Con scripts, el modelo es reproducible y versionable sin depender de un modelador.
- Los atlas abiertos evitan inventar anatomía.
- Anatomía e implantes van en archivos separados para que la licencia CC BY-SA de los atlas no alcance al CAD de Innercare. (El atlas elegido resultó CC BY 4.0, sin "compartir igual": ver "El esqueleto sale de BodyParts3D".)

**Descartado.**
- Solo la endoprótesis de fémur, como el provisional: muestra un producto y no la capacidad a medida.
- Modelar la anatomía a mano: lleva semanas y es menos fiel.
- Comprar modelos anatómicos de pago: tienen licencias de uso más restrictivas y no se pueden reproducir desde el repo.

**Pendiente.** CAD de Innercare (fémur y hombro), confirmar las licencias al descargar y decidir dónde va la atribución.

## 2026-10-29 · El esqueleto sale de BodyParts3D, ajustado a la piel

Rama `rediseno`. Detalle en `ARQUITECTURA_MODELO_3D.md` y `3d/README.md`.

**Decisión.** El esqueleto se toma directo de BodyParts3D 4.0 (versión de 99 % de reducción de polígonos), no de Z-Anatomy. Se ajusta a la piel del maniquí a través de la piel del propio atlas, con `3d/scripts/anatomia.py`.

**Motivo.**
- BodyParts3D 4.0 es CC BY 4.0 (confirmado en la página oficial, actualizada el 2025-02-27). Z-Anatomy, que deriva de él, es CC BY-SA 4.0: obligaría a compartir con la misma licencia lo que derive de la anatomía.
- Se descarga en OBJ sueltos por estructura. Del zip de 62 MB quedan 52 MB de huesos en disco; los dientes salen del otro zip (143 MB) leyendo solo los 1,2 MB que ocupan.
- Ajustar piel contra piel es más fiable que medir referencias a ojo: el atlas trae su piel en el mismo sistema de coordenadas que los huesos.

**Descartado.**
- Z-Anatomy: licencia "compartir igual" y un único `.blend` o FBX completo, mucho más pesado.
- Ajustar los huesos con referencias medidas en los renders (como el cuello en `piel.py`): habría que medir cada articulación a mano y no corrige el grosor del tejido.
- Empujar hacia adentro, vértice por vértice, todo lo que asoma: aplastaba la cara y las falanges. Ahora el hueso se mueve entero si asoma más del 5 %.
- Ajustar la mano con ICP: con los dedos abiertos en el atlas y cerrados en la piel, la mano quedaba corta y con la palma hacia adelante.

**Pendiente.** Atribución visible en el sitio (ver "Créditos" en `ARQUITECTURA_MODELO_3D.md`).

## 2026-10-29 · Prototipo de cabeza: craneoplastía y escena del hero

Rama `rediseno`. Detalle en `ARQUITECTURA_MODELO_3D.md` y `3d/README.md`.

**Decisión.**
- La craneoplastía (`3d/scripts/implantes.py`) se arma plana (contorno polar con pestañas, borde macizo y malla triangular con el modificador Wireframe) y se dobla sobre el cráneo con un mapa exponencial desde su centro, con el radio del hueso suavizado. Medidas estimadas desde la foto del caso, que no trae escala: es un boceto hasta que lleguen los 3D de Innercare.
- El cráneo se recorta debajo borrando las caras que caen dentro del defecto (el contorno achicado 4 mm), no con un booleano.
- Sin pestaña inferior: la foto no la tiene, y detrás de la oreja la refracción del vidrio la convertía en una mancha oscura.
- El prototipo es el busto recortado (`3d/scripts/cabeza.py`, corte horizontal debajo de las clavículas, tapado) en `public/modelos/cabeza.glb`, y la craneoplastía en `public/modelos/implantes.glb`. Se optimizan con `gltf-transform optimize` sin unir mallas (`--join false`), porque la escena asigna los materiales por nombre.
- El vidrio (`MeshTransmissionMaterial`) usa su buffer propio, del tamaño del canvas, en las calidades alta y media; la baja usa 512 px. Tres calidades (alta con `backside`, media y baja), elegidas por `PerformanceMonitor`: primero baja la resolución y después la calidad.
- El entorno de luces lleva una esfera gris de fondo.
- La imagen de respaldo (`public/img/cuerpo-inicio.webp`) es una captura del canvas en la pose inicial, no un render de Blender. Se muestra mientras carga el 3D, sin WebGL y si la escena falla, con `object-cover` para que encuadre igual que la cámara.

**Motivo.**
- El booleano no corta: el cráneo es la unión de los huesos del atlas, que se superponen y no forman una malla cerrada. El borde dentado que deja el borrado queda debajo de la parte del borde del implante que apoya sobre el hueso.
- Con un buffer de 512 px, la malla de la craneoplastía, que es el detalle principal, se pixelaba. `transmissionSampler` es más barato pero no ve objetos transparentes, y el hueso lo es.
- Con el entorno negro entre paneles, el titanio (metalness 1) reflejaba negro.
- Una captura del canvas es igual a lo que se ve en la web, y la transición del respaldo al 3D no se nota.

**Descartado.**
- Proyectar el parche en paralelo sobre el cráneo: estira los bordes de un parche que abarca unos 100° de la bóveda.
- Dibujar el implante por encima del vidrio, sin refracción: más nítido, pero deja de verse dentro del cuerpo.

**Pendiente.** Medir en el celular y ajustar con eso la calidad por defecto, la transmisión y la opacidad del hueso (hoy 0,4).

## 2026-10-29 · El 3D en un panel azul, con vidrio celeste

Rama `rediseno`. Reemplaza, del prototipo de cabeza, el fondo gris, las calidades del vidrio y su ajuste automático. El panel lo reemplaza, a su vez, "Todo el hero sobre el degradé azul, sin panel".

**Decisión.**
- El 3D del hero va en un panel `rounded-xl` con un degradé vertical de azules de la marca (`--color-stage-from` y `--color-stage-to`). Lo dibuja la escena; el CSS lo repite solo mientras carga.
- El vidrio pasa a celeste, con atenuación (más azul donde es más grueso), clearcoat y una contraluz blanca para el brillo de los bordes, como la referencia que pasó el usuario. Sin aberración cromática.
- El vidrio refracta un buffer propio con MSAA de 2 muestras, no el de Drei.
- La resolución arranca en la de la pantalla, con 1,5x de máximo. `PerformanceMonitor` solo baja, de a 0,25x hasta 1x y después las muestras de la refracción, y no vuelve a subir. Las calidades no cambian el aspecto: ya no hay `backside` ni cambios de color o de resolución del buffer entre ellas.

**Motivo.**
- En el celular, la malla de la craneoplastía se veía pixelada: el buffer de Drei no tiene antialiasing y la escena iba a 1x o 1,5x en una pantalla de 3x.
- A mitad del giro el vidrio cambiaba de color y de nitidez: el ajuste automático subía a la calidad alta (con `backside`, que cambia mucho el color), se trababa y bajaba a la baja (buffer de 512 px). Subir y bajar a la vista se nota.
- Con el panel, el fondo que refracta el vidrio es el mismo que lo rodea. Con un fondo CSS detrás de un canvas transparente, el vidrio solo puede refractar un color plano.
- A 2x en una pantalla retina de escritorio caía a 18 fps; la aberración cromática triplica las lecturas de la refracción (de 52 a 60 fps al quitarla).

**Descartado.**
- Fondo de color en toda la sección del hero: queda una franja gris detrás del header, que es fijo, y el vidrio no refracta un degradé CSS.
- Dibujar el implante por encima del vidrio para que se vea nítido (ver la entrada del prototipo).

## 2026-10-29 · Todo el hero sobre el degradé azul, sin panel

Rama `rediseno`. Reemplaza el panel de la entrada anterior. Detalle en `ARQUITECTURA_MODELO_3D.md`, sección 3, "Fondo y encuadre".

**Decisión.**
- El degradé de azules de la marca es el fondo de todo el hero, de borde a borde y por detrás del header (la sección sube 64 px en el celular y 72 en escritorio). Sigue siendo el único fondo de color de la interfaz.
- El canvas vuelve a ser transparente y sin bordes. El vidrio refracta su buffer propio, que lleva como fondo el tramo del degradé que queda detrás del canvas, medido según su posición en la sección.
- Salida hacia la sección siguiente: corte recto, sin fundido. Coincide con el corte del busto, que queda debajo del borde.
- Proporción del busto: la de la captura que pasó el usuario (cabeza a un 22 % del alto del hero, centro de la cabeza a un 75 % del ancho a 1440 px, hombros cortados por el borde inferior). En escritorio, el canvas va abajo a la derecha, con un ancho de 14/15 de su alto, y la figura se ubica con un desplazamiento de lente (`setViewOffset`). En el celular va debajo del texto.
- La calidad media del vidrio baja de 6 a 4 muestras de refracción.
- Imágenes de respaldo con fondo transparente, una para escritorio y otra para el celular.
- Barra móvil del header transparente arriba de todo y esmerilada al hacer scroll. Las marcas inactivas del índice lateral y el subrayado de "Ver casos a medida" pasan de `outline` a `on-surface-variant`.

**Motivo.**
- Texto y modelo en el mismo espacio, sin la caja del panel. La franja gris detrás del header (motivo para descartar esta opción en la entrada anterior) desaparece al subir el hero detrás del header. Que el vidrio no refracte el CSS se resuelve dibujando el mismo degradé en su buffer: las capturas con y sin el degradé en el canvas (`?fondo`) difieren como mucho en 2/255, así que no se ve ningún rectángulo.
- Corte recto: un fundido obligaba a enmascarar el canvas y desvanecer el busto, y a agregar al degradé una tercera parada gris (claro, azul, claro), que se lee menos limpia. Con el corte, el hero termina como el encuadre de una foto.
- El ancho del canvas se ata al alto porque el área cuesta: al 60 % del ancho de la pantalla, el M1 bajaba de 72-74 a 57-59 fps sin tope. Con un canvas más angosto que el busto, los hombros se cortarían con un borde recto en medio del hero.
- Con el busto más grande, el vidrio es lo que más pesa. Con 4 muestras se recuperan unos 3 ms por cuadro (70 fps sin tope, 60 con tope y sin bajar la resolución) sin diferencia visible.
- Dos imágenes de respaldo porque el vidrio refracta otro tramo del degradé en cada diseño. Con fondo transparente, el 3D aparece encima con un fundido y la imagen se quita al terminar; cruzar las opacidades dejaría el busto a medio tono.
- Sobre el azul, `outline` queda por debajo de 3:1 (2,5 a 2,8). El resto del texto pasa AA en el punto más oscuro del degradé: `on-surface-variant`, 4,9; el botón primario contra el fondo, 7,6.

**Descartado.**
- Fundido hacia el gris (ver el motivo).
- Canvas al 60 % del ancho de la pantalla: por el rendimiento.
- Alejar la cámara para achicar el busto y ganar rendimiento: dejaba a la vista la base del busto y no respetaba la proporción elegida.
- Calidad baja (3 muestras) por defecto: deja sin margen el ajuste automático, que la usa como último paso.

## 2026-10-29 · Cinta de fibras detrás del hero (GhostFibers)

Rama `rediseno`.

**Decisión.** Detrás del texto y del 3D del hero corre una cinta de fibras finas en tinta azul (`GhostFibers` de React Bits, `components/ghost-fibers.tsx`). Usa `primary` y `surface-tint` en modo claro, rotación de -39°, una sola cinta con estilo de hilos, sin viñeta, grano, partículas ni interacción, y se dibuja a 1x. Baja en diagonal desde arriba a la izquierda hacia la nuca del busto, a la altura de la barbilla, y reaparece del otro lado, por el hombro.

**Motivo.**
- El usuario quería el efecto de Interference Ribbons. GhostFibers es casi igual, gratis y sin dependencias (WebGL2 propio). Con `prefers-reduced-motion` dibuja un cuadro fijo.
- En modo claro las fibras se componen como tinta sobre el degradé. Así el degradé sigue siendo el fondo y conserva su color, que era el requisito del usuario.
- A 1x se ve igual que a 2x (las fibras ya son blandas por la profundidad de campo) y cuesta menos: el 3D baja de unos 110 a 90 fps sin tope en el M1, en lugar de a 74.
- Una sola cinta: la segunda agregaba una franja vertical por detrás de la barra de navegación.

**Descartado.**
- Interference Ribbons: es de React Bits Pro (USD 129, licencia para un desarrollador) y el código solo se baja con la clave.
- Aero Shards: son esquirlas de vidrio, así que competirían con el busto (la translucidez vive solo en el 3D). Además usa WebGPU y depende de `vgpu`, un paquete 0.x con muchas dependencias.
- Un shader propio: GhostFibers ya resuelve lo mismo.

**Pendiente.** El vidrio del busto refracta solo el degradé, así que las fibras no se ven a través de él: la cinta parece entrar en la nuca. Para refractarlas habría que copiar el canvas de las fibras en la textura de fondo del buffer del vidrio en cada cuadro.

## 2026-10-29 · Fibras interactivas y una segunda cinta

Rama `rediseno`. Amplía la entrada anterior. La segunda cinta en su propio contenedor está **Reemplazada por** "La segunda cinta vuelve a ser la del componente"; la interacción sigue vigente.

**Decisión.**
- Las cintas reaccionan al mouse: la cámara se inclina hacia el puntero con un resorte, y la principal enfoca el tramo que queda bajo el puntero. El pulso al hacer clic sigue apagado.
- Hay una segunda cinta, chica y en un plano más atrás, arriba a la derecha. Cruza de izquierda a derecha por encima de la cabeza, con espacio. Va en su propio contenedor (la mitad derecha del hero, a un 26 % del alto) para poder ubicarla, y tiene el máximo desenfoque, el foco por delante, menos intensidad, poco brillo en los pliegues y viñeta para fundir los bordes. No se dibuja en el celular, donde la cabeza queda debajo del texto.

**Motivo.**
- El usuario la quería más viva: el movimiento de fábrica sin interacción se sentía quieto.
- La segunda cinta de la primera prueba (`layers={2}`) le gustó, pero su ubicación es fija y pasaba por detrás de la barra de navegación. Con una instancia aparte se elige el recorrido.
- Con el brillo de los pliegues de fábrica, la cinta chica formaba manchas oscuras donde se pone de canto y se leía más adelante que la principal.
- Rendimiento con las dos cintas: el 3D da unos 156 fps sin tope en el M1, contra unos 203 sin cintas.

## 2026-10-29 · La segunda cinta vuelve a ser la del componente

Rama `rediseno`. Reemplaza la segunda cinta de la entrada anterior y la decisión de usar una sola cinta de la entrada "Cinta de fibras detrás del hero".

**Decisión.** Una sola instancia de `GhostFibers` con `layers={2}`: la segunda cinta es la que ubica el componente, más tenue y desenfocada, que baja desde arriba al centro por detrás de la barra. Todo lo demás se mantiene: hilos, -39°, colores de marca, 1x e interacción con el mouse.

**Motivo.** Al usuario le gustaba la segunda cinta de la primera prueba. La instancia aparte, por encima de la cabeza, no le gustó.

**Descartado.** La segunda cinta en su propio contenedor arriba a la derecha.

## 2026-10-29 · La segunda cinta pasa por encima de la cabeza

Rama `rediseno`.

**Decisión.** `GhostFibers` recibe una prop propia, `placements`: la ubicación de cada cinta como [desplazamiento, profundidad, pendiente, fase], que de fábrica es fija. La principal conserva la de fábrica. La segunda pasa de `[1.9, -4.6, -0.08, 2.4]` a `[2.1, -4.6, 0.29, 2.4]`: entra por arriba a la altura de la barra (54 % del ancho), pasa por encima de la cabeza y sale por la derecha a un 44 % del alto. Antes bajaba por detrás del cuello.

**Motivo.** El usuario marcó ese recorrido sobre una captura. Los valores salieron de proyectar el centro de la cinta con la misma cámara que el componente y ajustarlo a los puntos marcados. La profundidad queda en la de fábrica para conservar el desenfoque.

## 2026-10-29 · Una sola cinta

Rama `rediseno`. Reemplaza las dos entradas anteriores en cuanto a la segunda cinta.

**Decisión.** `layers={1}`: solo la cinta principal, con interacción. `FIBER_PLACEMENTS` conserva la ubicación ajustada de la segunda, por si vuelve; con una sola cinta no se usa.

**Motivo.** El usuario filmó las dos variantes y se quedó con una.

## 2026-10-29 · Fibras con más detalle, brillo y pulso al hacer clic

Rama `rediseno`. Reemplaza el dibujo a 1x de "Cinta de fibras detrás del hero".

**Decisión.**
- La cinta se dibuja a 2x, con menos profundidad de campo (0,45) y destellos (`sparkle` 0,6).
- Al hacer clic fuera de enlaces y botones, un pulso de luz corre por las fibras desde el punto del clic.
- Cambio propio en `GhostFibers`: en modo claro, los reflejos (pliegues, destellos y pulso) se separan de la tinta por su color, se suavizan con el resplandor del modo oscuro y se componen en `lineColor` (blanco) por encima de las fibras. De fábrica, el modo claro solo dibuja tinta y apaga el resplandor, así que ni los reflejos ni el pulso se veían sobre el degradé.

**Motivo.** El usuario quería la textura y el brillo del original, y el pulso al hacer clic. A 1x y con la profundidad de campo de fábrica, la cinta se veía borrosa.

**Costo.** El 3D baja de unos 186 a unos 108 fps sin tope en el M1 (medianas de mediciones ruidosas). Con tope sigue en 60. Queda medir en el celular, donde también se dibuja a 2x.

**Textura.** Después, 96 hilos (de fábrica, 72) y un estilo de fibra propio, `strands`: hilos casi continuos con cortes cortos, entre `dashes` y `lines`. Se compararon capturas de cerca de cinco variantes. Con más hilos o con grano casi no cambiaba la textura. `dashes` y `dots` la volvían un flujo de datos o una trama de semitono y dejaba de leerse como fibra.

## 2026-10-29 · Titular del hero plegado con FoldText

Rama `rediseno`.

**Decisión.**
- El titular del hero usa `FoldText` de React Bits (`components/fold-text.tsx`) con el aspecto de la demo (*Paper*): entra desplegándose letra por letra desde arriba y, con el mouse cerca, las letras se vuelven a plegar un poco (`hoverRefold`). Reemplaza al `rise-in` del titular; el párrafo y los botones lo conservan.
- Peso 500 solo en ese titular (el resto sigue en 400), para que el pliegue se marque.
- Escalonado de 30 ms por letra (de fábrica, 45): con 43 letras, la entrada dura unos 2 s en vez de 2,6.
- Primera dependencia de animación: `gsap`, que el componente necesita para el escalonado, las curvas y el ticker. Sin `ScrollTrigger`: el disparo por scroll se resolvió con un `IntersectionObserver`.
- El HTML del servidor trae el texto visible. Con JS, el CSS oculta las letras desde el primer cuadro (`@media (scripting: enabled)`) hasta que el componente toma el control, y si el JS no llega aparecen solas a los 2,5 s. De fábrica venían con opacidad 0 en línea: sin JS, el titular no se veía.
- El repliegue solo con puntero fino, como el resto de los `hover`.

**Motivo.** El usuario pidió el efecto completo de la demo en el texto y más trazo.

**Costo.** El titular se ve recién al hidratar y no con el primer pintado. Según el usuario no importa: va a haber una pantalla de carga y las animaciones arrancan cuando se va (ver la entrada siguiente).

## 2026-10-29 · Entrada de la home orquestada

Rama `rediseno`. Reemplaza los `rise-in` del hero y la entrada propia de la barra.

**Decisión.**
- Una sola línea de tiempo (`components/intro.ts`, tiempos en `intro-timeline.ts`), en el orden que pidió el usuario:
  1. A los 0 ms, header, busto y fibras a la vez, más el índice lateral (a los 750 ms, cuando la barra empieza a estirarse).
  2. A los 1100 ms, mientras eso termina, el título letra por letra (unos 1,7 s, con un escalonado de 25 ms).
  3. A los 2300 ms, el subtítulo.
  4. A los 2700 ms, los botones, de a uno. Fin a los 3600 ms.
- Fases en `data-intro`: `waiting` (oculto, solo con JS), `running` y `done` (sin animaciones, para que `<Activity>` no las repita al volver a la home).
- Busto: aparece desenfocado (14 px) y un poco más chico (0,94) en 1,6 s, y desde la escena gira 55° hasta la pose de perfil, subiendo 2,5 cm, en 2,6 s con curva cúbica. Con una cuártica o con `--ease-out`, casi todo pasaba con el busto todavía transparente.
- Textos y botones: suben 14 px con un desenfoque de 6 px que se aclara (`.intro-in`).
- "Ver catálogo" crece a 1,04 con el puntero encima (`.boton-crece`). Es una excepción a `docs/BOTONES.md`, donde el hover cambia solo el color, y la pidió el usuario. Con `scale`, que se suma al `transform` del `:active`. Con movimiento reducido no crece.
- El índice lateral pasa a vidrio más transparente (`backgroundOpacity` 0,2; la barra sigue en 0,4).
- Arranque: hoy lo dispara `Hero3D` cuando el 3D está listo, y entonces el busto entra girando. Si tarda más de 2,5 s, entra la imagen fija y el 3D la reemplaza después, ya en su pose. Si se llega a la home desde otra página, con movimiento reducido o sin WebGL, arranca enseguida. Cuando haya pantalla de carga, la dispara ella al irse con `startIntro()`.

**Motivo.** El usuario quería una entrada moderna y orquestada, con el 3D incluido.

**Descartado.** La animación en un contenedor común para el vidrio y la lista del índice: la opacidad de un ancestro deja al `backdrop-filter` sin nada detrás durante el fundido.

**Costo.** Sin pantalla de carga, el hero se ve vacío (solo el degradé) hasta que el 3D está listo, como mucho 2,5 s.

## 2026-10-30 · Titular quieto, enlaces con hover visible y fibras a 1x en el celular

Rama `rediseno`. Cambia parte de "Titular del hero plegado con FoldText" y de "Fibras con más detalle".

**Decisión.**
- El titular del hero conserva la entrada plegada letra por letra, pero después queda quieto: sin el repliegue bajo el mouse (`hoverRefold`).
- Los enlaces de texto subrayados (CTA secundarios: "Ver casos a medida", "Ver catálogo" en fabricación propia y los del contacto) pasan a una clase, `.enlace` (`@layer components`). Con el puntero encima, texto y subrayado van al primario y el subrayado pasa de 1 a 2 px, en 160 ms. Antes solo se oscurecía el subrayado y casi no se notaba.
- Las fibras se dibujan a 2x en escritorio y a 1x en el celular (menos de 48 rem). Se montan recién en el cliente, porque `GhostFibers` lee la resolución una sola vez. `?fibras=no|1x|2x` las apaga o fija la resolución, para medir.
- La medición en el celular se pasa al cuerpo entero.

**Motivo.** El usuario no quería que el titular se moviera con el mouse y notó que "Ver casos a medida" no respondía al hover. En las fibras, 1x es una precaución: en la Mac ya costaban bastante y no tienen ajuste automático como el vidrio. La medición en el teléfono quedó trabada por el firewall de macOS, y con el cuerpo entero los números van a cambiar igual.

## 2026-10-30 · "Ver casos a medida" del hero, botón de vidrio

Rama `rediseno`. Reemplaza, para ese enlace, el `.enlace` de la entrada anterior.

**Decisión.**
- "Ver casos a medida" del hero pasa de enlace subrayado a botón de vidrio (`BotonVidrio` en `components/boton-vidrio.tsx`, `.boton-vidrio` en `globals.css`), copiado de "Ver la demo" de Mango (`liquid-glass` + `landing-demo`) y adaptado a la marca: vidrio blanco esmerilado, brillo y borde del primario que siguen al puntero, sube 2 px y las letras ruedan hacia arriba. Sin el estado de carga de Mango.
- Mismas medidas que `.boton`, y 16 px entre los dos botones (antes 32 px, pensados para un enlace).
- Es una excepción a "el vidrio solo en la navegación".
- Con la sombra de Mango ganaba protagonismo y parecía flotar más arriba que "Ver catálogo": primero la sombra exterior quedó a la mitad y, como seguía resaltando, se quitó.
- Los dos botones del hero, más grandes que los del resto del sitio para acompañar al titular, con texto de 18 px y 56 px de alto los dos. Primero "Ver casos a medida" tenía 52, para que el principal pesara más, pero la diferencia se leía como un error: en un par, la jerarquía la marca el relleno.

**Motivo.** Al usuario no le gustaba el enlace subrayado y quería el par de Mango: "Empezar" lleno y "Ver la demo" de vidrio.

## 2026-10-30 · Una sola página con menú de anclas

Rama `rediseno`. Aplica `docs/landing/AJUSTES.md` (decisiones del usuario). Reemplaza "Páginas separadas e índice lateral en la home".

**Decisión.**
- La home es la única página navegable: se borró `app/nosotros/`, no se hace Casos a medida y ningún enlace lleva a `/productos` (su código queda). Las fichas siguen, y su miga de pan vuelve a "Implantes" (`/#recorrido`).
- La barra superior es un menú de anclas a la home: Implantes, Cómo trabajamos, Fabricación y Habilitaciones (`components/nav-links.ts`). Van como `/#id` para que funcionen desde las fichas. En la home se marca la sección que cruza la mitad de la pantalla (`components/use-active-section.ts`), con `aria-current="location"`. Las anclas de la misma página bajan con `scrollToAnchor` (`components/anchor-link.tsx`), porque `Link` no vuelve a bajar si el ancla ya está en la URL.
- Sale el índice lateral de secciones (`components/home/section-index.tsx`); lo reemplazará el índice anatómico del recorrido.
- "Plantear un caso" es la única etiqueta de contacto. Va a `/contacto?motivo=caso` (el panel, con "Caso a medida" marcado), salvo en las fichas, que precargan el producto.
- Hero: "Plantear un caso" y "Recorrer los implantes" (vidrio, a `#recorrido`), la línea de habilitaciones ANMAT con un sello y el aviso "Deslizá para recorrer el cuerpo", las dos dentro de la línea de tiempo de la entrada.

**Motivo.** La landing hace de catálogo y de galería de casos (AJUSTES.md).

**Aviso de deslizar fuera del centro.** AJUSTES pide el aviso centrado abajo. En escritorio, la espalda del busto pasa por el centro de la pantalla en cualquier proporción menor a ≈ 1,8:1, así que el aviso va abajo a la izquierda, alineado con el texto. En el celular sí va centrado, entre la línea de habilitaciones y el busto. La Taste Skill desaconseja los avisos de scroll y las líneas chicas bajo los botones; manda AJUSTES, y el aviso tiene una función concreta: el recorrido por el cuerpo se maneja con el scroll.

**Motivo genérico de contacto.** "Plantear un caso" habla de un caso clínico, así que el motivo que más le corresponde es "Caso a medida". Quien venga por otra cosa lo cambia en el formulario.

## 2026-10-30 · Secciones de la landing

Rama `rediseno`. Aplica `docs/landing/LANDING_SPEC.md` (sección 3) y `docs/landing/AJUSTES.md`. Detalle en `docs/landing/BITACORA.md` (fase 2).

**Decisión.**
- La home sigue el guion: recorrido por el cuerpo, cómo trabajamos, fabricación, habilitaciones, distribución y contacto. Reemplazan a "Fabricación propia" (grilla de productos) y al bloque editorial con habilitaciones.
- Recorrido: escena fija a todo el ancho y tarjetas que pasan por encima a la derecha, una por pantalla. Es el armazón de la escena 3D (fase 3); mientras no exista, muestra la planificación de cada parada. Los datos de las paradas viven en `content/recorrido.ts`.
- Datos técnicos (specs, números de disposición, latitudes) en cifras tabulares, como elemento gráfico.
- El contacto final va en el azul de marca con el logo en blanco: es el segundo fondo de color de la interfaz, después del hero, porque el guion pide el logo en versión clara.
- Sin fondos animados nuevos: `Waves` de React Bits usa WebGL2 y AJUSTES pide CSS o canvas 2D. El único movimiento nuevo es el eje de las sedes, que se llena con el scroll (CSS).

**Motivo.** La landing hace de catálogo y de galería de casos, con nivel visual de producto (AJUSTES.md), sin perder la credibilidad de fabricante médico.

## 2026-10-30 · La home, fiel al borrador de la landing

Rama `rediseno`. Pedido del usuario. Reemplaza, de "Secciones de la landing", lo que habla de composición y del eje que se llena con el scroll.

**Decisión.**
- Cada sección de la home sigue la composición, el orden, los elementos y la presentación de `docs/landing/landing-borrador.html`, salvo las excepciones de `AJUSTES.md`. La mejora visual va en la ejecución (calidad, detalle, tokens de marca), no en reinventar el diseño.
- Las animaciones del borrador ("Mecanizado e impresión 3D" y la pieza de "Cómo trabajamos") se replican fielmente en la fase 5.
- El footer pasa a ser el del borrador en todo el sitio: marca, dirección y teléfonos.

**Motivo.** Al usuario le gusta el borrador; la fase 2 había recompuesto secciones para darles más variedad visual y no lo quiere.

**Descartado.** Proceso apilado con fila de ejemplos, sedes con el eje a la izquierda en un panel con degradé, eje recortado a 33°–48° con marcas, contacto con el título a tamaño de portada y anillos.

## 2026-10-30 · Recorrido 3D de la home

Rama `rediseno`. Fase 3 de la landing. Detalle en `docs/landing/BITACORA.md`.

**Decisión.**
- El recorrido es su propia sección (`#recorrido`) debajo del hero, con el cuerpo entero (`public/modelos/cuerpo.glb`); el hero sigue con el busto.
- Comportamiento del borrador (`updateTour` y `camFor`): ocho pantallas de scroll, siete tramos, pausa al principio y al final de cada tramo, alto visible en escala logarítmica, pesos de las tarjetas, opacidades de los implantes, halo e índice anatómico. El guion vive en `components/recorrido-3d/camara.ts` y lo comparten la escena y el HTML.
- Progreso del scroll sin librería, con una amortiguación exponencial corta; el canvas dibuja solo cuando cambia (`frameloop="demand"`).
- Implantes en su propia capa, dibujados encima del vidrio y no refractados. El hueso queda adentro del vidrio, como en el busto.
- Un único módulo (`components/recorrido-3d/implantes.ts`) define de dónde sale cada implante y dónde va: la fase 4 cambia primitivas por modelos tocando solo ese archivo.
- Lados de los implantes de `ARQUITECTURA_MODELO_3D.md` (acetábulo e intercalar a la derecha, endoprótesis a la izquierda), aunque el borrador 2D los dibuja al revés.

**Motivo.** Fidelidad al borrador en el comportamiento, con la mejora en la ejecución (el cuerpo de vidrio real). Refractado, el titanio se veía azul oscuro y sin brillo.

**Correcciones (mismo día).** El 3D del recorrido no se carga hasta que termina la entrada del hero y el recorrido asoma, y solo dibuja cuando cambia el progreso: un solo contexto anima a la vez. El vidrio del recorrido es propio (el del busto, más claro) con un borde de luz fresnel; el implante activo lleva un resplandor azul, como en el borrador, y los implantes tienen una luz propia por capa.

**Descartado.** GSAP y `ScrollControls` (otro contenedor de scroll); `PerformanceMonitor` (con dibujo a demanda mide mal y bajaría la calidad sin motivo); vidrio sin profundidad para dibujar los implantes encima (el hueso también quedaba encima, blanco y fuerte).

## 2026-10-30 · Partículas y animaciones de la home

Rama `rediseno`. Fase 5 de la landing. Detalle en `docs/landing/BITACORA.md`.

**Decisión.**
- Miniaturas del recorrido: vistas (`View` de drei con `track`) del mismo canvas del recorrido, sin otro contexto WebGL. Partículas de `MeshSurfaceSampler` sobre los implantes reales; el ensamble se dispara al activarse la tarjeta y queda sólido. Como el canvas está debajo de las tarjetas, con la escena lista la tarjeta pierde el fondo y la miniatura lo pinta alrededor con una sombra extendida: un hueco por el que se ve el canvas.
- "Cómo trabajamos": nube 3D de un segmento de fémur proyectada en canvas 2D, atada al scroll de la sección como en el borrador (cortes de TC, hueso con zona a resecar, implante con clavo y guías).
- Fabricación: las dos animaciones del borrador en canvas 2D, con las mismas reglas y tiempos, más detalle en las piezas (endoprótesis de fémur y copa acetabular trabecular) y un reflejo al terminar.

**Motivo.** Fidelidad al borrador en la idea y el comportamiento, con la mejora en la ejecución; un solo contexto WebGL por zona de la página (AJUSTES.md, "Rendimiento").

**Descartado.** Un canvas aparte para las miniaturas (un segundo contexto WebGL); copiar el canvas del recorrido a canvas 2D por tarjeta (lectura de píxeles en cada cuadro); 3D para el proceso (otro contexto, y la idea del borrador es de partículas); ensamble atado al scroll en lugar de dispararse (el pedido de la fase dice que se dispara al activarse la tarjeta).

## Pendientes abiertos

- ~~**Respaldo del 3D sin WebGL.**~~ Resuelto el 2026-10-29 con el prototipo de cabeza: se comprueba el contexto antes de montar el canvas, que va dentro de un límite de errores, y sin WebGL queda la imagen fija (`public/img/cuerpo-inicio.webp`).
