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

**Aviso de deslizar fuera del centro** (provisional, anotado en la fase 7: falta que el usuario lo confirme). AJUSTES pide el aviso centrado abajo. En escritorio, la espalda del busto pasa por el centro de la pantalla en cualquier proporción menor a ≈ 1,8:1, así que el aviso va abajo a la izquierda, alineado con el texto. En el celular sí va centrado, entre la línea de habilitaciones y el busto. La Taste Skill desaconseja los avisos de scroll y las líneas chicas bajo los botones; manda AJUSTES, y el aviso tiene una función concreta: el recorrido por el cuerpo se maneja con el scroll.

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

Rama `rediseno`. Fase 3 de la landing. Detalle en `docs/landing/BITACORA.md`. Lo provisional (el recorrido como sección propia, con el busto en el hero) está **Reemplazado por** "Un solo cuerpo del hero al recorrido" (2026-10-31); el comportamiento del borrador sigue vigente.

**Provisional** (anotado en la fase 7): el recorrido como sección propia, con el busto en el hero y el cuerpo entero recién abajo, es la solución mientras el hero no se toca (AJUSTES.md). El guion pide un solo cuerpo que va del hero al recorrido; si el hero se reabre, se revisa.

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

## 2026-10-30 · Pase visual de la home y fondo del contacto

Rama `rediseno`. Fase 6 de la landing. Detalle, capturas y mediciones en `docs/landing/BITACORA.md`.

**Decisión.**
- Pulido de ejecución sin tocar composiciones del borrador: el fondo del recorrido se funde en el gris abajo (antes terminaba en un corte recto contra "Cómo trabajamos"), la pieza del proceso lleva la misma luz fija que las animaciones de fabricación, los enlaces tienen el anillo de foco del primario y las sedes, un halo por par.
- El cierre de contacto lleva por detrás la cinta de fibras del hero (`GhostFibers`), en blanco sobre el azul: la página cierra con la pieza con la que abre. Se crea al acercarse el bloque, solo dibuja mientras se ve y se desvanece antes del texto.

**Motivo.** Coherencia entre bandas y un cierre con la firma visual del sitio, sin código ni dependencias nuevas; en ese tramo ni el hero ni el recorrido están a la vista.

**Descartado.** `Noise` de React Bits (único candidato en canvas 2D: ensucia el azul sin sumar), `Topography` (WebGL2 y 1 600 líneas nuevas, líneas de nivel que cruzaban la bajada) y fondos animados en habilitaciones y sedes (tablas de datos: el movimiento no tiene función ahí). Todos los fondos de React Bits evaluados, salvo `Noise`, son hoy WebGL2.

**Corrección (mismo día, verificador).** La cinta en vivo sumaba un cuarto contexto WebGL al pie de la página. Pasa a ser una imagen fija con transparencia (una captura de `GhostFibers`, apaisada para escritorio y vertical para el celular) que deriva con el scroll por CSS (`animation-timeline: view()`), a escala completa y en diagonal; solo en la home, no en las fichas. Habilitaciones va en una banda un tono más oscura (`surface-container-low`) y las sedes que casi coinciden comparten un punto con guías a cada etiqueta.

## 2026-10-30 · Prioridad visual: React Bits y movimiento sin tope de acento

Rama `rediseno`. Decisión del usuario (`docs/landing/AJUSTES.md`, "Diseño"). Reemplaza, de `CLAUDE.md`, "React Bits solo como acento puntual" y el dial "motion 4".

**Decisión.**
- La prioridad es que la página se vea moderna y atractiva, con nivel de producto actual: es lo que la va a vender.
- React Bits se puede usar donde sume, no solo como acento, y el movimiento puede subir por encima de motion 4.
- Se admiten fondos animados donde queden bien, como las fibras del hero, livianos (CSS o canvas 2D antes que otro contexto WebGL), pausados fuera de pantalla y nunca más de uno a la vista junto con el 3D.
- Se mantienen la credibilidad de fabricante médico (datos reales, tokens de marca), el procedimiento de React Bits (`shadcn view`, dependencias justificadas, tokens, movimiento reducido) y la prohibición del fade-up genérico: el movimiento tiene que tener una idea.
- Con "La home, fiel al borrador de la landing": la ambición va en la ejecución, no en rediseñar las composiciones.

**Lo que quedó en la práctica.** Ningún fondo de React Bits entró: todos los evaluados salvo `Noise` son WebGL2, y `Noise` ensuciaba el azul (ver "Pase visual de la home"). El movimiento nuevo es propio: el recorrido 3D atado al scroll, las piezas de partículas en canvas 2D y la cinta fija del cierre que deriva con el scroll.

## 2026-10-30 · Hero y navegación: detalles de la landing

Rama `rediseno`. Fase 1 de la landing. Completa "Una sola página con menú de anclas".

**Decisión.**
- La línea de habilitaciones ANMAT del hero va con un sello de Phosphor y no con un filete a la izquierda, como en el borrador.
- El aviso "Deslizá para recorrer el cuerpo" lleva un riel por el que cae un tramo del primario (`.aviso-deslizar`), quieto con movimiento reducido. La línea y el aviso entran en la línea de tiempo de la intro (`INTRO_AT.credentials` y `INTRO_AT.scrollCue`).
- PillNav marca la sección activa con `aria-current="location"` (antes `page`): es el único cambio de lógica en el componente de React Bits, anotado en su cabecera.
- El menú móvil se cierra al tocar un ancla.

**Motivo.** El filete se repetía con el riel del aviso y parecían dos piezas iguales. `aria-current="page"` anuncia otra página, y son secciones de la misma.

**Descartado.** La Taste Skill desaconseja avisos de scroll y líneas chicas bajo los botones; mandan AJUSTES.md y el usuario.

## 2026-10-30 · Datos de la landing

Rama `rediseno`. Fase 2 de la landing.

**Decisión.**
- Las seis paradas del recorrido viven en `content/recorrido.ts`, que cuenta cada caso con los datos de `customCases.ts` y `products.ts`.
- Habilitaciones con los textos de `content/company.ts` ("Certificado de Buenas Prácticas de Fabricación", GLN y Sub-GLN), no con los recortados del borrador.
- Latitud de cada sede en `content/company.ts` (campo `latitud`, marcado como dato geográfico público y no de la carpeta), para ubicarla en el eje norte-sur. Se muestran con un decimal.
- Rangos sin guiones: "Ø10 a 12 mm × 120 a 160 mm".

**Motivo.** `content/` es la única fuente de verdad; la latitud es un dato público, no una cifra de la empresa.

**Provisional.** Tres specs del borrador no salen tal cual de la carpeta: "Técnica: Impresión 3D" de la craneoplastía (la carpeta lo dice para titanio, no para PMMA) y del acetábulo, y "Desarrollo: A pedido médico" del maxilar (en la carpeta aparece en biomodelos). Hay que confirmarlas con Innercare.

## 2026-10-30 · Tomas, anclas y respaldos del recorrido

Rama `rediseno`. Fases 3 y 4 de la landing. Completa "Recorrido 3D de la home". La carga (después de la intro y con el recorrido asomando) y el respaldo de la entrada están **Reemplazados por** "Un solo cuerpo del hero al recorrido" (2026-10-31).

**Decisión.**
- Cada parada tiene, además del encuadre del borrador (implante al 34 % del ancho), un azimut y una elevación: el 3D deja girar alrededor del cuerpo, y la cabeza se ve de tres cuartos y desde arriba para que se lea la craneoplastía. La toma del maxilar está más cerrada (`vis` 82) para que la pieza ocupe cerca del 14 % del ancho.
- Celular por debajo de 820 px (el del borrador, no `md`): cuerpo centrado y abajo, implante al 25 % del alto y la tarjeta como hoja inferior sin specs. Índice anatómico desde 1100 px.
- `#parada-<id>` son marcas a k pantallas del principio del recorrido, así el índice lleva a la toma exacta; `#recorrido` tiene `scroll-margin-top` negativo para que el menú y "Recorrer los implantes" dejen la escena entera.
- Respaldo sin WebGL o mientras carga: las vistas de planificación de cada parada y, en la entrada y el cierre, `public/img/cuerpo-entero.webp` (captura del 3D con los implantes reales). Sin JS, la escena deja de ser fija y se lee en orden: título, seis tarjetas y cierre.
- Con movimiento reducido, sin amortiguación, halo ni desplazamiento de tarjetas: cada parada cambia en la mitad de su tramo.
- Carga lo más conservadora: `cuerpo.glb` y el contexto WebGL se piden cuando termina la entrada del hero **y** el recorrido asoma un 5 %.

**Motivo.** Composición del borrador, aprovechando lo que el 3D agrega (girar). Un 5 % y no margen 0, porque el borde del recorrido toca el de la pantalla al cargar y ya contaba como visible.

**Descartado.** Cargar en un momento ocioso después de la entrada (si alguien no baja, se descarga igual).

## 2026-10-30 · Implantes del recorrido generados en Blender

Rama `rediseno`. Fase 4 de la landing. Detalle y renders de control en `docs/landing/BITACORA.md`.

**Provisional:** son modelos propios hechos a partir de fotos y fichas de `content/`; los reemplazan los CAD de Innercare cuando lleguen, respetando el nombre de malla.

**Decisión.**
- `3d/scripts/implantes.py` genera maxilar, hombro reverso, acetábulo, endoprótesis de fémur e intercalar sobre el esqueleto ajustado, con el método de la craneoplastía (partes paramétricas apoyadas sobre el hueso con rayos), y recorta los huesos que reemplazan.
- Archivos aparte para el recorrido: `public/modelos/implantes-recorrido.glb` (los cinco) y `cuerpo.glb` (piel y esqueleto con los seis recortes). `implantes.glb` y `cabeza.glb` (hero) quedan idénticos; la craneoplastía del recorrido sale de `implantes.glb`, que ya está en caché.
- Nombres de malla por parada (`implante_<parada>`), los del contrato de `components/recorrido-3d/implantes.ts`.
- Un acabado por pieza (`pulido` o `trabecular`); celosías en geometría y no con `alphaMap`.
- Maxilar del lado derecho, como en la foto del caso, no centrado.
- Tornillos acetabulares buscados dentro del coxal (la dirección que entra más largo sin salir del hueso, de 20 a 55 mm), no con ángulos fijos.

**Motivo.** Sumar las piezas a `implantes.glb` habría puesto el hombro flotando junto al busto y multiplicado la descarga del hero. Con el implante dibujado encima del vidrio, la celosía se lee mejor en geometría.

**Provisional también.** Medidas estimadas que no están en `content/` y no se publican: glenosfera de 36 mm, copa del hombro de 41 mm, cuerpo del hombro de Ø19 mm, cabeza femoral de Ø42 mm, cuerpo de la endoprótesis de Ø22 mm, copa acetabular de Ø58 mm a 45°, segmento intercalar de 130 mm y postes del maxilar de Ø4,2 mm. Hay que confirmarlas con Innercare, sobre todo las del hombro.

**Descartado.** Los nombres viejos de la arquitectura (`implante_acetabular`, `implante_endoprotesis`); el inserto del hombro en blanco (el contrato admite un solo acabado por pieza); el ala acetabular apoyada con rayos (se enroscaba sobre el reborde).

**Costo.** El recorrido dibuja unos 222 000 triángulos, un 11 % arriba del objetivo de partida de la arquitectura. Para bajarlo: celdas más grandes en las dos celosías o un esqueleto más simple.

## 2026-10-30 · Piezas de partículas: detalles de ejecución

Rama `rediseno`. Fase 5 de la landing. Completa "Partículas y animaciones de la home".

**Decisión.**
- Miniaturas: el hueco de la tarjeta se abre con `data-minis`, 760 ms después de que el canvas termina su fundido, y el ensamble espera a que esté abierto. Usan `track` de drei aunque está marcado como obsoleto: las vistas en línea pondrían drei y three en el bundle de las tarjetas, que son HTML del servidor.
- Proceso: planos de corte anchos y punteados en el azul del hueso (como el borrador), que en el paso 3 pasan a ser las guías en caja; celosía del implante solo en la cara visible.
- Fabricación: piezas dibujadas en 2D con las partes de la ficha (no capturas del 3D, que no permitían muestrear la silueta), copa al 60 % y endoprótesis al 90 % del recuadro para que pesen parecido, y partículas al 17 % sobre el metal final. "Volver a ver" se oculta con movimiento reducido y sin JS.

**Motivo.** Que nunca se vea un cuadro vacío ni una pieza a medio armar; fidelidad al borrador en la idea, más detalle en la ejecución.

**Pendiente.** En los fundidos de la tarjeta se ve un marco alrededor de la miniatura: el fondo que la miniatura pinta en el canvas no compone igual que la sombra de la tarjeta con la misma opacidad. No se arregla en CSS; la salida es que el canvas no pinte fondo y la tarjeta conserve el suyo bajo el hueco. Aparte, a algunos zooms puede asomar 1 px de costura entre el recorte del canvas y el hueco (el filete interior de 2 px lo tapa en las pruebas).

## 2026-10-30 · Contextos WebGL de la home

Rama `rediseno`. Fases 3 a 6 de la landing. Resume la regla de rendimiento de AJUSTES.md tal como quedó. **Reemplazada por** "Un solo cuerpo del hero al recorrido" (2026-10-31): dos contextos en lugar de tres.

**Decisión.**
- Tres contextos WebGL en toda la home: busto y fibras del hero, y el del recorrido. Las miniaturas son vistas del canvas del recorrido; el proceso y la fabricación son canvas 2D (`components/animaciones/`); la cinta del cierre es una imagen fija.
- Cada uno dibuja solo cuando hace falta: el hero se detiene fuera de pantalla; el recorrido dibuja a demanda (cuando cambia el progreso, o a 30 cuadros por segundo para el vaivén con la escena fija) y se apaga fuera de pantalla; las animaciones 2D no dibujan fuera de pantalla y se detienen al terminar.
- El recorrido no se carga hasta que termina la intro del hero y asoma.

**Motivo.** Medido en Chrome con la GPU del M1: recorrido a 60 fps con tope en escritorio y celular; el paso del hero al recorrido queda en unos 51 fps, que es el costo del hero solo.

**Descartado.** Un cuarto contexto para la cinta del contacto (era `GhostFibers` en vivo); un canvas aparte para las miniaturas; `Waves` y los demás fondos WebGL2 de React Bits.

**Pendiente.** Los dos contextos del hero nunca se liberan. Llevar el paso del hero al recorrido a 60 fps en escritorio implica tocar el hero (por ejemplo, bajar la resolución de las fibras o del busto mientras se hace scroll). Falta medir todo en un celular real.

## 2026-10-30 · Logo claro y lema en el footer

Rama `rediseno`. Fases 2 y 6 de la landing.

**Provisional:** hasta que haya un logo claro y uno sin lema en `public/`.

**Decisión.** El logo en blanco del cierre de contacto es el mismo PNG con `brightness-0 invert`. El footer conserva el lema en texto aunque el logo ya lo trae, porque al tamaño del footer el del logo no se lee.

**Motivo.** No hay archivos de logo claro ni sin lema; no se inventan.

## 2026-10-31 · Un solo cuerpo del hero al recorrido

Rama `cuerpo-unico`. Pedido del usuario, que reabrió el hero con una condición: que quede igual de lindo. Plan y fases en `docs/landing/BITACORA.md` (entradas "Cuerpo único") y `docs/landing/cuerpo-unico/ESTADO.md`. Reemplaza lo provisional de "Recorrido 3D de la home" (el recorrido como sección propia), la carga de "Tomas, anclas y respaldos del recorrido" y "Contextos WebGL de la home".

**Decisión.** El busto del hero y el cuerpo entero del recorrido pasan a ser un solo modelo en un solo canvas. El hero es la toma 0 de la escena fija del recorrido: con el scroll, el texto se va, la cámara sube hasta la craneoplastía y sigue el recorrido.

**Reglas resultantes.**
- **Un canvas.** La escena única (`components/recorrido-3d/escena.tsx`) se monta apenas el navegador queda libre (como mucho, 1,5 s) y arranca la intro (`startIntro()`) al estar lista, o a los 2,5 s. Dos contextos WebGL en la home: la escena y las fibras. `components/hero-3d/` ya no existe.
- **El look es el del hero, no el del recorrido.** En la toma 0, el vidrio, el titanio de la craneoplastía (dentro del vidrio, refractado), el hueso y la luz son los del busto de antes (`aspecto-hero.ts`). El degradé del hero es el fondo de toda la escena fija y lo refracta el vidrio. Con el scroll, el aspecto pasa al del recorrido con el peso del hero (`pesoHero`, la misma curva que la cámara del primer tramo). El estudio de luz gira con la cámara.
- **Corte bajo el cuello (`corteY`).** En la toma del hero, la piel se corta a 1,33 m y el hueso a 1,35 m, rectos (en materiales opacos se descarta sin tocar el alfa: así no aparece el filo blanco). Con el scroll, el corte baja hasta debajo de los pies y la banda se ensancha de 4 mm a 40 cm. Las vértebras del busto (`hueso_columna_alta`) van enteras.
- **Keyframe `hero`** (`HERO` en `camara.ts`): objetivo en el centro de la cabeza (1,56 m), de perfil (azimut −62°), a 0,92 m, con el estiramiento de 1,11 que tenía el busto en escritorio. En el celular, la cabeza arranca debajo de la primera pantalla (ancla 1,092), como el hero de antes, y durante las primeras 0,4 pantallas el texto, las fibras, el degradé y el busto suben juntos (`deslizHero`); después la cámara va a la craneoplastía. La entrada (+55° en 2,6 s) y el vaivén (62° a 22° cada 22 s) del busto son giros de la cámara y se amortiguan a cero al empezar el scroll.
- **Maxilar entero → recortado.** En el hero y en la craneoplastía se ve `hueso_maxilar_entero`; entre seg 1,4 y 1,78 se funde con el recortado y aparece el implante (`pesoMaxilar`).
- **Fibras pausadas.** Se funden con el texto del hero y, cuando terminan de irse, su capa pasa a `display: none`: su IntersectionObserver deja de dibujar. Al volver arriba, despiertan.
- **Dos archivos de cuerpo.** `cuerpo-cabeza.glb` (lo que se ve en el hero) e `implantes.glb` van en el primer pantallazo (454 KB, contra 498 KB del busto); `cuerpo-resto.glb` e `implantes-recorrido.glb`, después de la intro. Mientras llega el resto, sigue el cuerpo del hero (lo que falta queda debajo del corte). La craneoplastía sigue sola en `implantes.glb` (`implantes.ts` explica por qué).
- **Piel por zonas.** `piel_cabeza`, `piel_torso` y `piel_piernas` (y la columna en dos), partidas después de `optimize`, en la misma pasada que la compresión (`3d/scripts/partir.mjs`): mismos triángulos, junta estanca. La escena oculta los trozos que quedan enteros debajo del corte.
- **Vidrio opaco fuera del hero.** El vidrio es transparente solo mientras el corte baja (peso del hero entre 0,001 y 0,999); en el hero entero y desde la craneoplastía es opaco. Transparente, el esqueleto se dibujaba entero debajo del vidrio en cada cuadro y el recorrido de escritorio caía a 52 fps.
- **Recorte a la caja del busto.** Con la toma del hero entera y sin miniaturas a la vista, la escena dibuja solo en la caja que ocupaba el busto (tijera en la pasada principal y en el buffer del vidrio), con el mismo costo por píxel que el busto.
- Sin WebGL, la toma 0 muestra las capturas del busto (`cuerpo-inicio*.webp`) y las paradas, sus vistas. Sin JS, el hero se lee con su captura y las tarjetas en orden.

**Motivo.** Es la idea original del usuario, la del guion y la del borrador: el objeto del hero es el protagonista de todo el relato (como Apple en AirPods Pro o iPhone). Las dos tomas ya eran casi la misma (la craneoplastía está a 0,92 m y apenas más arriba). Un modelo elimina un contexto WebGL y una descarga, el paso a ≈51 fps entre el hero y el recorrido (dos cuerpos dibujando a la vez) y el corte recto entre el degradé y el gris, y deja una sola fuente de verdad para materiales y luz. La compuerta de paridad (el cuadro 0 indistinguible del hero) pasó en la segunda pasada del verificador; la paridad se mantuvo en las fases siguientes. Medido con la GPU del M1: hero quieto en escritorio a 109 a 119 fps sin tope (la base, 71 a 72), recorrido a 60 con tope en escritorio y celular.

**Descartado.**
- Dos instancias de la misma escena (hero y recorrido): fue solo el prototipo, para medir y comparar sin rearmar las secciones.
- Canvas del tamaño de la caja del busto en el hero: rinde parecido al recorte con tijera, pero obliga a cambiar el tamaño del canvas al empezar el scroll.
- Partir la piel en Blender antes de optimizar: 107 914 triángulos en lugar de 62 412 (la simplificación es relativa a cada malla) y juntas abiertas.
- El cuerpo entero en un archivo: 1 049 KB en el primer pantallazo.
- Fundido largo entre las dos craneoplastías (la refractada y la de la capa de implantes): se veían dos piezas corridas. Quedó un cruce corto.
- Llevar la craneoplastía a `implantes-recorrido.glb`: obligaba a bajarlo entero antes de la intro o a partirlo, y a regenerar los modelos.

**Pendiente.** Detalle y rutas en `docs/landing/cuerpo-unico/ESTADO.md`: medir en un celular real; el tramo corto del hero (0,3 pantallas) rinde menos que la base sin tope; el hombro asoma bajo el corte desde seg 0,33 en escritorio; el degradé del cierre se oscurece antes de fundirse; el contexto de las fibras queda vivo, pausado.

## 2026-11-01 · Hover por proximidad en el índice anatómico

**Decisión.** El índice lateral del recorrido (desde 1100 px) toma el hover de `LineSidebar` de React Bits, sin su diseño (ni números ni marcas): los enlaces cercanos al cursor se corren a la derecha (hasta 14 px) y pasan al primario, con caída suave en un radio de 80 px y amortiguación de 100 ms (`components/home/use-proximidad.ts`, CSS en `.indice-enlace` y `.indice-texto`). Solo con mouse; con movimiento reducido, solo el color. La barra de la parada activa queda sobre el riel.

**Motivo.** Pedido del usuario: le gusta el diseño actual del índice y quería el efecto de que los nombres se desplacen uno tras otro al pasar el cursor.

**Descartado.** Copiar el componente entero: trae su lista, sus colores y sus marcas; solo hacía falta la lógica del efecto. Sin dependencias nuevas.

## 2026-11-01 · El cuerpo del hero no se ve cortado nunca

**Decisión.** El corte por altura de la toma del hero baja de 1,33 m (piel) y 1,35 m (hueso) a 1,22 m, debajo de la pantalla en todas las poses: el cuerpo sigue más allá del borde de abajo y se lee como un cuerpo gigante, no como un busto. `3d/scripts/partir.mjs` parte la piel (`piel_cabeza`) y la columna (`hueso_columna_alta`) a la misma altura, así el hero carga lo que llega hasta ahí (`cuerpo-cabeza.glb`, de 381 a 436 KB; mismos triángulos en total, verificado). Se recapturaron los respaldos `cuerpo-inicio*.webp` (`docs/landing/cuerpo-unico/respaldos.mjs`).

**Motivo.** Pedido del usuario: en el giro (la entrada desde 117° y el vaivén hasta 22°) asomaba cortado el hombro del lado lejano, a la altura del pecho. Medido sobre la malla con la cámara del guion: en la toma del hero llega a verse piel desde 1,286 m (vaivén de frente; en reposo, 1,302 m), en escritorio y celular, con cualquier ancho (el alto visible en metros es fijo). El corte a 1,22 m deja 6 cm de margen. La caja del recorte del hero (`recorteHero`) no corta: el cuerpo entra entero en ella en todas las poses.

**Descartado.** Sin corte en el hero (el cuerpo entero): obliga a bajar `cuerpo-resto.glb` antes de la intro y a dibujar las piernas debajo de la pantalla. Sumar al hero clavículas, costillas y húmeros: cambia el aspecto del busto aprobado; el hueso del hero sigue siendo el del busto, con la columna más larga para que no termine a la vista.

## 2026-11-01 · Retícula y corte de luz en el implante activo

**Decisión.** Fuera el anillo que latía alrededor del implante activo (`.recorrido-halo`) y el resplandor azul de detrás (un sprite con degradé). En su lugar:
- **Retícula.** Cuatro esquinas finas del primario sobre la caja del implante en pantalla, con 16 px de margen y acotada a lo visible debajo del header (`.recorrido-reticula`; la escena escribe `--ret-*`). Al llegar a la parada se cierran una vez (escala de 1,22 a 1 en 560 ms, con la Web Animations API) y quedan quietas siguiendo la pieza. La idea es la de `TargetCursor` de React Bits, sin el componente ni gsap.
- **Corte de luz.** Cuando la tarjeta pasa de 0,8, un plano horizontal baja por la pieza en 1,5 s, como un corte de tomografía: una línea azul clara sobre el titanio, con lo que todavía no pasó atenuado hacia el azul del hueso, y la misma línea en la retícula. Después queda un borde de luz suave en el contorno (Fresnel). Va en el shader del implante (`conLuz` en `escena.tsx`, `onBeforeCompile` del `MeshStandardMaterial`), mezclado sobre el color final: sumado como emisión no se veía, porque el titanio pulido ya está casi blanco.
- Con movimiento reducido, la retícula quieta, sin cierre ni corte.

**Motivo.** Pedido del usuario: las "partículas" alrededor del implante no le gustaban y, quietas, no quedaban bien; quería algo más moderno. Eran los puntos de colores que Safari (WebKit) dibujaba dentro del resplandor: ruido de color donde el degradé de su textura casi no tiene opacidad. En Chrome no se veían. La retícula y el corte cuentan lo que hace Innercare (implantes diseñados desde la tomografía del paciente) y no se mueven en bucle. No suman contexto WebGL ni dependencias.

**Descartado.** Solo la retícula (más sobria, pero el implante quedaba sin ningún gesto propio) y solo el corte de luz (sin nada en la interfaz, la parada activa se distinguía menos). Los fondos y anillos animados de React Bits (`MagicRings`, `Radar`, `Scanner`, `GridScan`) dibujan con WebGL propio y son en bucle.

## 2026-11-01 · Cómo trabajamos: el fémur entero y hover en la pieza

**Decisión.** La pieza de partículas de "Cómo trabajamos" (`components/animaciones/proceso.ts`) pasa del tramo de diáfisis del borrador al fémur entero: cabeza, cuello, trocánteres, diáfisis y cóndilos, armados con primitivas (un tubo de radio variable, elipsoides y un cilindro) y muestreados sobre la superficie de su unión. La zona a resecar, los planos de corte, el implante intercalar, el clavo y las guías siguen en la diáfisis, con las mismas tres formas, los mismos tiempos y el mismo vaivén. Al pasar el mouse (puntero fino), las partículas cerca del cursor se apartan y vuelven a armarse con un resorte en menos de un segundo. Con movimiento reducido, no hay hover.

**Motivo.** Pedido del usuario: el efecto le gustaba, pero no se entendía qué se estaba viendo (un tubo con los extremos abiertos y unas cajas). La silueta del fémur se reconoce enseguida. El hover también fue pedido suyo.

**Descartado (por ahora).** Rótulos con líneas guía, guías de resección con forma real (apoyadas en el hueso) y una leyenda según el paso: se ofrecieron y el usuario eligió solo el fémur entero.

## 2026-11-01 · Ancho ajustable del panel de contacto

**Decisión.** En escritorio (desde 64rem), el panel de contacto lleva un tirador en el borde izquierdo (`DotsSixVertical` de Phosphor en una pill, `role="separator"`) que cambia su ancho entre el de siempre (36rem) y el 60 % de la pantalla. Se arrastra, se mueve con las flechas (Inicio y Fin van a los extremos) y con doble clic salta del mínimo al máximo y vuelta. El ancho se guarda como fracción entre los dos extremos (`--panel-ancho`, `.contact-panel` en `globals.css`), así acompaña a la ventana si cambia de tamaño. Dura mientras el panel vive en la sesión; no se guarda entre recargas.

**Motivo.** Pedido del usuario: una marca visible que indique que el panel se puede ensanchar, hasta el 60 % en escritorio. Por debajo de 64rem el 60 % no llega a 36rem, así que ahí no hay tirador.

## 2026-11-01 · Fotos reales en Fabricación: Flex Carousel con velo

**Decisión.** Al cierre de `#fabricacion`, a sangre, una tira de fotos reales de la planta y de piezas fabricadas con el Flex Carousel de React Bits (`components/flex-carousel.tsx`, copiado a mano; envoltorio `components/home/carrusel-planta.tsx`; fotos en `content/planta.ts`, WebP generadas por `npm run fotos`). Las fotos van **en color**, todas bajo un velo azul monocromo (`--color-on-primary-fixed`) salvo la que se señala con el puntero o, sin puntero, la del centro; el velo es un cambio propio al shader del componente. Sin autoplay, con `captureWheel` apagado (la rueda vertical sigue scrolleando la página), lente `liquid` con la dispersión cromática bajada a 0,15, sin el contador "01 / 08" de las captions. Es el **tercer contexto WebGL** de la home: se monta al acercarse la sección y se desmonta un segundo después de alejarse (la escena y las fibras ya están pausadas ahí). Sin JS o sin WebGL2, la misma tira con scroll horizontal.

**Motivo.** Pedido del usuario: la home es toda 3D y partículas y le faltaba lo humano, lo real. Eligió el Flex Carousel y decidió el lugar (Fabricación, porque las fotos que hay son de la planta y de piezas; `#proceso` es sticky y no tiene un "debajo"), el tercer contexto (antes que rehacer el carrusel en canvas 2D sin la lente) y el color con velo (en vez del blanco y negro con tinte de `PlantPhoto`: lo real se ve a color, y el velo baja la tira a la paleta hasta que se señala una foto).

**Descartado.** Una banda propia entre Proceso y Fabricación (apagaba el punto del menú); generar imágenes con IA como placeholders (un fabricante regulado no muestra una planta que no es la suya; se usan solo fotos reales y se le piden más a Innercare); `hombro-radiografia.jpg` (datos de una paciente a la vista), los renders de planificación (no son fotos) y el molde del espaciador (un bulto blanco sobre blanco).

## 2026-11-01 · Ficha de producto: hero en una pantalla y entradas con AnimatedContent

**Decisión.** La ficha (`app/productos/[slug]/page.tsx`) deja el diseño viejo (visor 4/5 a pantalla entera, `dl` con rayas, cuatro miniaturas, "Otros productos" con una tarjeta huérfana) y pasa al estilo de la landing. Primera pantalla entera en escritorio (`min-h` de 100dvh menos el header, con tope): a la izquierda el eyebrow, el título, la bajada, Material y Técnica como fichas de dato, Indicaciones y Compatibilidad en línea, y los botones; a la derecha la primera foto, más chica (62 % del alto como máximo), sobre un escenario con la luz azul de la marca (`.ficha-escenario`), fundida con `mix-blend-multiply` y máscara radial (`.mini-imagen`, más la desaturación y la máscara más ancha de `.ficha-imagen-hero`). Las demás imágenes van en "Del estudio del paciente al implante", cada una con su `alt` como pie debajo y la frase de `proceso[1]` de `content/customCases.ts`. "Más implantes" son tarjetas enlace (`.tarjeta-enlace`, la sección 6 de `docs/BOTONES.md`): los otros productos y "Volver al recorrido" con `cuerpo-entero.webp`. Las entradas van con `AnimatedContent` de React Bits (`components/animated-content.tsx`, copiado a mano): al montar en el hero (texto escalonado con desenfoque, la foto con escala y desenfoque) y al llegar con el scroll en el resto. Es el primer uso de `gsap` fuera del hero de la home; no suma dependencias.

**Motivo.** Pedido del usuario: la ficha parecía una página de carrito vieja de WordPress, con la imagen demasiado grande y todo lo demás bajo el pliegue; quería algo moderno con entradas animadas y eligió `AnimatedContent`. Las entradas de la ficha son decisión suya, no un "fade-up genérico" (`AJUSTES.md`). El usuario eligió la foto real antes que el implante 3D del recorrido (un contexto WebGL más y un modelo con medidas sin confirmar) y la sección narrativa antes que una galería con miniaturas; la radiografía del hombro se queda hasta que llegue una versión sin datos de paciente.

**Cambios al componente.** Sin ScrollTrigger (el disparo `scroll` es un IntersectionObserver que corre una vez, como en FoldText), sin `scrub`, `wipe`, `tilt`, `rotate` ni desaparición; sin la clase `invisible` (sin JS el contenido se ve; con JS, `.contenido-animado` lo oculta hasta `data-contenido-listo`, que se pone después del `fromTo`); prop `as` porque `stagger` anima los hijos directos; una sola reproducción por montaje (`<Activity>` repite los efectos) y nada con movimiento reducido.

**Descartado.** `ScrollTrigger` y `@gsap/react` (dependencia y plugin nuevos para algo que resuelve un observer); el `::after` con opacidad para la sombra de la tarjeta enlace (tiene borde y en Chrome se pisaba: la sombra se transiciona directa); `ProductGallery` (borrado; `ProductTile` queda para `/productos`).

## 2026-11-01 · Habilitaciones: lectura del registro

**Decisión.** La tabla de `#habilitaciones` se lee una sola vez al llegar con el scroll (`components/home/lectura-habilitaciones.tsx`): una línea de luz baja por la tabla en 1,4 s (la misma idea del corte de luz que recorre el implante activo en el recorrido) y, a su paso, cada fila aparece, su divisoria se dibuja de izquierda a derecha y los dígitos de la referencia se resuelven de izquierda a derecha desde cifras al azar (`components/cifra-generada.tsx`, 40 ms por dígito, en el primario atenuado mientras se cifran). Solo cambian los dígitos: las palabras y las letras quedan quietas y el contenedor va en cifras tabulares, así nada salta de ancho. El título y la bajada entran con `AnimatedContent` (desenfoque que se aclara y 14 px de subida, como los textos del hero); detrás de la tabla, la luz de la marca de `.proceso-luz` se enciende con el scroll (`animation-timeline: view()`, sin JS). Composición del borrador intacta.
- El HTML del servidor trae los números reales; con JS las filas se ocultan hasta que el componente toma el control (`data-lectura`: `espera`, `leyendo`, `quieta`) y, si el JS no llega, aparecen solas a los 2,5 s. Sin JS, todo visible y quieto.
- Con movimiento reducido, `quieta`: todo visible, sin barrido ni cifrado. Al volver a la home desde una ficha (`<Activity>` repite los efectos), también `quieta`: no se repite la lectura.
- Sin dependencias nuevas ni contextos WebGL: un rAF de unos 2 s por lectura y animaciones CSS de `transform` y `opacity`.

**Motivo.** Pedido del usuario: la sección era la única de la home sin una idea de movimiento y se leía como web institucional genérica; quería los números "generándose, como encriptados" y entradas modernas para cada pieza, con el fondo. La lectura del registro cuenta lo que es la sección (un registro que se verifica) y usa el mismo gesto de luz que el recorrido.

**Descartado.** `DecryptedText` de React Bits entero: pide `motion` (12.x) y trae hover, loop y 600 líneas para un efecto que acá son 90; se tomó la idea, como con `TargetCursor` y `LineSidebar`. Cifrar también las letras: Source Sans 3 no es monoespaciada y el texto saltaba de ancho. Un sello por fila al resolverse: se leía como checklist. Fondos animados de React Bits: WebGL2 en una tabla de datos.

## 2026-11-01 · Ficha de producto: malla hexagonal de fondo al cierre

**Decisión.** Desde "Más implantes" hasta el bloque de contacto, la ficha lleva de fondo `ShapeGrid` de React Bits (`components/shape-grid.tsx`, copiado a mano) con celdas hexagonales de 64 px, línea de 1 px en el primario al 10 %, deriva lenta hacia arriba (0,12) y bordes desvanecidos. Bajo el cursor (solo puntero fino) las celdas se encienden con el `primary-container` y un relleno del primario al 6 %, y se apagan en casi un segundo. Sin resplandor ni arcoíris, sin cascada al hacer clic. La entrada de fábrica (la malla se abre desde el centro) se queda: se ve al llegar a la sección, porque fuera de pantalla no corre. Con movimiento reducido, quieta y sin brillo.

**Motivo.** Pedido del usuario: el cierre de la ficha se veía monótono y quería una textura de React Bits que fuera con el tema. La malla hexagonal es la estructura porosa de los implantes impresos en titanio (la base de la glenoesfera del hombro, en la foto de la ficha, es eso), no un adorno genérico. Es el único fondo de React Bits evaluado que dibuja en canvas 2D: no suma contexto WebGL (la ficha no tiene ninguno) y ya se pausaba fuera de pantalla.

**Cambios al componente.** Colores con tokens (resueltos con una sonda sin transición), brillo solo con puntero fino y sin movimiento reducido, cascada apagada por defecto, opciones al motor en un efecto (no durante el render), `aria-hidden`, aserciones para `noUncheckedIndexedAccess` y `idleFps`: mientras solo deriva dibuja a 30 cuadros. Medido en Chrome sin cabeza a 2x y sin tope de cuadros, el tiempo de script con la malla a la vista bajó de 93 % a 11 %; fuera de pantalla, 0,2 %.

**Descartado.** Waves, Threads y FloatingLines (líneas que repetirían las fibras del hero, y son WebGL2), DotGrid, MagnetLines y RippleGrid (WebGL2), `Noise` (grano: no le saca la monotonía), la malla en perspectiva (`tiltX`: más llamativa, pero compite con las tarjetas).

## 2026-11-01 · La malla hexagonal también al cierre de la home

**Decisión.** La home lleva la misma malla de fondo que las fichas, desde Distribución (`#sedes`) hasta el bloque de contacto inclusive. El ajuste pasa a un solo componente, `FondoMalla` (`components/fondo-malla.tsx`), que usan la home y las fichas: pinta el `surface` de la página, aísla el apilamiento y pone la malla entre ese fondo y el contenido. `Locations` deja su `bg-surface` (lo pinta el envoltorio). Es la primera cosa fuera del hero de la home que deriva sola en bucle: la regla de `CLAUDE.md` lo anota como excepción.

**Motivo.** Pedido del usuario, después de verla en la ficha: el cierre de la home también se veía plano. La malla es canvas 2D (no suma a los tres contextos WebGL), se pausa fuera de pantalla y dibuja a 30 cuadros mientras solo deriva; cuando está a la vista, la escena del recorrido y las fibras ya están pausadas y la tira de Fabricación desmontada.

## 2026-11-01 · Distribución: mapa de Argentina en lugar del eje norte-sur

**Decisión.** La pieza de sedes de `#sedes` pasa del eje abstracto del borrador a un mapa de Argentina clásico: contorno con las provincias (relleno `surface-container-lowest`, límites interiores en `outline-variant`, costa en el primario), las cuatro sedes en su latitud y longitud, una ruta que sale de la planta de Alberti (al laboratorio de Caseros y, en curva por el interior, a Comodoro Rivadavia y Caleta Olivia) y, al pasar el mouse, tocar o enfocar una sede, un globo con su miniatura (`PlantPhoto`), su tipo y su dirección, mientras su provincia se tiñe. Composición de la sección intacta (título y bajada a la izquierda, la pieza a la derecha).
- **Datos.** Natural Earth 10m admin-1 (dominio público), bajado una vez por `scripts/mapa-argentina.mjs` a una caché fuera del repo y convertido a `content/mapa-argentina.ts` (generado, se commitea): topología con `topojson`, simplificación que conserva los límites compartidos, costa y límites interiores como mallas (cada límite una sola vez), 2 600 puntos, 51 KB. El IGN no respondía desde la máquina. Las Malvinas (que Natural Earth trae aparte) se suman a Tierra del Fuego; el sector antártico queda afuera porque el mapa bicontinental no entra en la sección. Proyección transversa de Mercator esférica con meridiano central 64° O (`components/home/mapa-proyeccion.ts`), la familia de los mapas oficiales; la comparten el script y los pines.
- **Dibujo.** SVG puro, sin canvas ni WebGL: `MapaArgentina` (servidor, los trazados en el HTML y no en el bundle) y `MapaSedes` (cliente: pines, etiquetas, guías medidas con `ResizeObserver`, ruta, provincias teñidas y globos). Las medidas responsive son variables de `.mapa` (`--ancho-lienzo`, `--x-etiquetas`, `--paso`) y una container query para columnas angostas; la sección pasa a dos columnas recién a 1024 px (a 768 las etiquetas no entraban).
- **Globo.** Cuelga de la etiqueta extrema de su grupo (arriba del par del norte, abajo del par del sur), así nunca tapa una etiqueta ni el mapa; en una columna es una tarjeta horizontal bajo el mapa (arriba está la bajada). Opaco, `rounded-xl`, `--shadow-escena`.
- **Entrada.** `data-mapa` (`espera`, `dibujando`, `quieto`): la costa se dibuja en 1,4 s, los límites interiores desde los 300 ms, la ruta sale de la planta a los 900 ms y cada pin aparece cuando la ruta lo alcanza (retraso proporcional al largo recorrido). La idea es la de la sección: la distribución sale de la planta. Sin JS, todo visible; con movimiento reducido, `quieto`; al volver a la home, no se repite.
- **Contenido.** `Sede` suma `longitud` (dato geográfico público, como `latitud`) y `foto`. Sale la latitud en texto de las etiquetas: con el mapa es redundante. Placeholders "Foto pendiente" en `public/img/sedes/` para el laboratorio y las sucursales (no hay fotos); la planta usa `fabricacion-cnc-planta.jpg`.

**Motivo.** Pedido del usuario: quería "el típico contorno con provincias" con los puntos de las sucursales, un conector entre ellas y una miniatura flotante al pasar el mouse, con buen efecto de entrada. La malla hexagonal de fondo se queda (`.mapa-fondo` la atenúa bajo la silueta); el usuario autorizó quitarla si molestaba y no hizo falta.

**Descartado.** Trama de puntos (silueta de puntos, como las partículas del recorrido): el usuario prefirió el contorno. Globo anclado al pin: con dos pares de sedes a 6 y 9 px se pisaban. Tooltip con posicionamiento por anclas CSS: todavía no está en Firefox. Equirectangular: ensanchaba Tierra del Fuego un tercio. Mapa bicontinental: demasiado alto para la sección.

## 2026-11-01 · Malla hexagonal: el desvanecido de abajo, hasta el footer

**Decisión.** `ShapeGrid` suma `fadeBottom` (un largo de CSS) que reemplaza el desvanecido del borde de abajo; `FondoMalla` lo pone en 3 rem. Los costados y el borde de arriba siguen en proporción a la caja (`fade` 0,6, unos 210 px de alto).

**Motivo.** Pedido del usuario: abajo del bloque "¿Tenés un caso para resolver?" la malla casi no se veía, porque el desvanecido de abajo medía unos 210 px y entre el bloque y el footer hay 117. Los costados quedan como estaban porque mantienen los márgenes. Vale para la home y las fichas.

## 2026-11-01 · Distribución: entrada por pasos, radar, luz y card junto al pin

**Decisión.** Segunda pasada sobre el mapa de Distribución, pedida por el usuario.
- **Título y bajada** entran palabra por palabra con un desenfoque que se aclara y una subida corta (`AnimatedContent`, que ahora admite `as="h2"` y `as="p"`; cada palabra es un hijo `inline-block`). La bajada arranca 350 ms después.
- **Sin difuminado alrededor del mapa:** sale `.mapa-fondo` (el halo en `surface` que atenuaba la malla). Para que la línea se lea sobre la malla, una **luz recorre la línea** de norte a sur: un guion corto en `surface-tint` con un halo ancho y tenue (sin `filter`, que Safari no aplica a trazos de SVG), en bucle de 5 s: baja de Caseros a Caleta Olivia, se detiene un instante y sube de nuevo antes de reiniciar (pedido del usuario: ida y vuelta da más sensación de conexión que bajar siempre).
- **Orden de la entrada:** primero el mapa (costa, límites y provincias), después los pines de a uno de norte a sur (cada 220 ms desde 1 s), después la **línea tramo por tramo**: Caseros, Alberti, Comodoro Rivadavia y Caleta Olivia, cada tramo en proporción a su largo y arqueado hacia el oeste. La línea deja de salir de la planta: ahora es una cadena 1, 2, 3, 4.
- **Radar en los pines:** dos ondas que se abren a 4,2 veces y se apagan, desfasadas 1,2 s. Radar y luz son bucles: se pausan fuera de pantalla y no corren con movimiento reducido.
- **Card a la derecha del pin**, centrada en su altura y con una punta hacia él, en escritorio y en el celular. Puede tapar etiquetas: lo que importa es que se vea siempre junto al punto.
- **Trazos sin `vector-effect: non-scaling-stroke`:** con él, Chrome medía los guiones en píxeles y el dibujo con `pathLength` no se veía (la línea aparecía entera de entrada). El grosor en pantalla se mantiene con `--trazo`, la escala del viewBox, que mide el componente.
- **Malla de fondo:** sigue hasta la línea del footer (2,5 rem más allá del envoltorio) y se desvanece en 3 rem, para que el bloque de contacto quede centrado en ella.

**Descartado.** El globo colgado de la etiqueta extrema de cada par (versión anterior): el usuario lo quiere junto al punto. Un `drop-shadow` para el brillo de la luz: no anda en Safari.

## 2026-11-01 · Celular: barra flotante y menú desplegable animado

**Decisión.** La barra del celular pasa a ser una píldora de vidrio flotante como la de escritorio (`NavGlass`, 56 px de alto a 12 px de los bordes, 8 px del techo; el header sigue midiendo 64 px), algo más transparente (`backgroundOpacity` 0,25 contra 0,4 de escritorio). Sale `.barra-movil` (transparente arriba y esmerilada con el scroll). El menú es un panel flotante debajo de la píldora: se despliega hacia abajo con un recorte (480 ms), los enlaces entran de a uno (55 ms entre cada uno) y "Plantear un caso" llega al final con `--spring-bouncy` (un rebote chico: se pasa unos 2 px y un 2 % de escala). Al cerrar, todo sale en orden inverso, primero el botón, y el panel se pliega hacia arriba en 620 ms, más despacio que al abrir. Tocar fuera del panel también lo cierra.

**Motivo.** Pedido del usuario: la barra móvil no era la convencional y el menú aparecía de golpe.

**Descartado.** El panel con `NavGlass`: en Chrome el vidrio refractivo dejaba leer el titular del hero a través de los enlaces y lo espejaba en el borde de arriba. Queda esmerilado al 90 % de `surface`, opaco con `prefers-reduced-transparency`. Animar un envoltorio del panel: la opacidad o el recorte de un ancestro le quitan al `backdrop-filter` lo que hay detrás; se anima el panel mismo.

## 2026-11-01 · Celular: la cabeza del hero, más alta y a la vista

**Decisión.** En la toma del hero del celular la cabeza pasa del ancla [0,5, 1,092] (debajo de la primera pantalla: solo asomaba la coronilla) a [0,58, 0,8]: en 390 × 844 se ven la cara y el cuello debajo del texto. Para hacerle lugar, el texto del hero se compacta por debajo de 768 px: 24 px arriba del título en vez de 48, márgenes de 16 y 24 px, y los dos botones en una sola fila, de 48 px de alto y texto de 15 px (en pantallas más angostas pasan a dos filas). Durante el desliz (0,4 pantallas) el texto sigue subiendo entero y la cabeza va hasta el encuadre de antes al final del desliz, [0,5, 0,692]: desde ahí el recorrido no cambia y el respaldo sin WebGL (capturado en ese encuadre) sirve igual, corrido a 49dvh y al 58 % del ancho.

**Motivo.** Pedido del usuario: en el celular solo se veía la punta de la cabeza; quería la cara y algo del cuello, con libertad para subir o achicar los botones y correr la cabeza a la derecha (la cara mira a la derecha, así que no se corta).

**Descartado.** Que la cabeza suba lo mismo que el texto: al final del desliz quedaba al 40 % del alto y asomaba el corte plano bajo los hombros (`corteY`, 1,22 m). Achicar la cabeza: cambiaba el busto que le gusta al usuario.

**Pendiente.** En pantallas bajas (375 × 667) la coronilla queda detrás de la línea ANMAT y del aviso de deslizar; se leen, pero conviene mirarlo en un celular real.

## 2026-11-01 · Fabricación: la pieza final es un render de los modelos del recorrido

**Decisión.** Las dos animaciones de `#fabricacion` (la fresa que talla el bloque, la pieza que se imprime capa por capa) se quedan como están, pero rematan en **la pieza real**: un render en Cycles de la misma malla del recorrido 3D (`implante_femur` para el CNC, `implante_acetabulo` sin los tornillos del caso para la impresión), con titanio (pulido con cepillado radial para el CNC; gris mate para la impresión), luz de estudio (HDRI de Blender más tres áreas) y sombra de contacto, sobre fondo transparente, en 4:3 como la escena de la tarjeta (`3d/scripts/render-fabricacion.py`, `npm run fabricacion`, `public/img/fabricacion/`). La animación (`components/animaciones/fabricacion.ts`) ya no dibuja la pieza: saca del alfa de la imagen la silueta (alfa casi pleno y no negro, así la sombra queda fuera), el bloque del CNC y las filas del láser, y al final funde la imagen con el reflejo que la cruza. Sobre la pieza terminada las partículas bajan casi a cero (antes, 17 %). La endoprótesis flota (de pie sobre la punta del vástago, la sombra se leía como un apoyo imposible); la copa apoya en el reborde con su sombra. Reemplaza la decisión de la fase 5 de dibujar las formas en 2D "porque las capturas del 3D no permitían muestrear la silueta": el alfa de una imagen se muestrea igual que una máscara dibujada. Las tarjetas van al 90 % del contenedor, alineadas a la izquierda con el título (empezó en 95 % y el usuario pidió más).

**Motivo.** Pedido del usuario: la animación le gusta mucho, pero lo que aparecía al final (formas planas con degradés, hechas en el canvas) se veía "de juguete". Con la misma malla del recorrido, la pieza es la que el visitante ya vio en el cuerpo. El contrato queda abierto: para cambiar la pieza alcanza con reemplazar el WebP (una foto de producto recortada sirve igual).

**Descartado.** Video (no hay filmación de la planta; uno de stock o generado por IA no sería su máquina ni su producto, y pisaría la animación). Foto real hoy (las que hay son de componentes en caja o de 495 px; se pueden pedir a Innercare). 3D en vivo en la tarjeta (un cuarto contexto WebGL, o una `View` del canvas del recorrido, que en esa sección está pausado y fuera de pantalla). El dibujo 2D con más detalle: por más que se afine, no tiene volumen ni reflejos de estudio.

## 2026-11-01 · Fabricación: tarjetas que suben con el puntero y bajada animada

**Decisión.** Las dos tarjetas de Fabricación suben 6 px y ganan una sombra azul de la marca con el puntero encima (400 ms al entrar, 300 ms al salir, como las tarjetas de enlace; sombra en `::after` por opacidad). Con movimiento reducido no suben, solo aparece la sombra. La bajada de la sección entra con `AnimatedContent` con los valores de las fichas (24 px, desenfoque de 6 px), una vez, al llegar con el scroll.

**Motivo.** Pedido del usuario. `docs/BOTONES.md` (sección 6) dice que una tarjeta que no es link no sube; acá el usuario lo pidió explícitamente, y la regla sigue valiendo para el resto.

**Descartado.** Subir 3 px como las tarjetas de enlace: en tarjetas de este tamaño casi no se nota.

## 2026-11-02 · Cierre de contacto: liso, con entrada escalonada y sombra

**Decisión.** La tarjeta del cierre de contacto (home y fichas) pierde la cinta de fibras fija que llevaba en la home y queda lisa, en el primario con su luz. Al llegar con el scroll entra la tarjeta y detrás, de a una, sus cuatro piezas en orden: título, bajada, logo y botón (`AnimatedContent`, sube 24 px y se aclara de un desenfoque de 6 px, 0,15 s entre cada una). Con el puntero encima gana una sombra azul de la marca, sin subir (`.tarjeta-contacto`, en `::after` del envoltorio, porque la tarjeta recorta lo que sale de su borde). `AnimatedContent` suma `targets`, un selector de las piezas que entran, porque el título y el botón van en columnas distintas y no son hijos directos de un mismo bloque.

**Motivo.** Pedido del usuario. Liso "de momento": las imágenes de la cinta (`public/img/cinta-contacto*.webp`) quedan en el repo por si vuelve.

**Descartado.** Un `AnimatedContent` por pieza con demoras: cada uno dispara al cruzar su propio borde, así que el orden dependería de la velocidad del scroll. El desenfoque directo en el logo: el `filter` en línea pisaba el que lo pasa a blanco y se veía azul durante la entrada; anima un envoltorio.

## 2026-11-02 · Celular: el aviso de deslizar junto al cuello y la cabeza a la derecha

**Decisión.** En la toma del hero del celular la cabeza pasa del ancla [0,58, 0,8] a [0,62, 0,74]: más arriba y más a la derecha, con la cara, el cuello y el arranque de los hombros a la vista (en 390 × 844 cae a 625 px). El aviso "Deslizá para recorrer el cuerpo" sale del flujo del texto: va a la izquierda del cuerpo, en dos líneas, centrado en la altura del cuello (1,45 m, unos 3 cm bajo el mentón; `CUELLO_BAJO_ANCLA` en `camara.ts`). Como sube con el texto y la cabeza sube menos, se apaga en el primer tercio del desliz (`--desliz-t`, de `tour-scroll.tsx`). En las pantallas bajas la cabeza baja lo justo para que la coronilla quede debajo del texto, hasta 0,8 (`anclaHeroCelular`): `tour-scroll.tsx` mide el pie de la línea de habilitaciones (`data-pie-hero`) con un ResizeObserver y lo deja en `estadoRecorrido.anclaHero` (la cámara) y en `--ancla-hero` (el aviso y la captura sin WebGL). Sin JS, el ancla de las pantallas altas (74dvh). El final del desliz no cambia ([0,5, 0,692]), así que el recorrido y la captura de respaldo siguen igual.

**Motivo.** Pedido del usuario, con capturas marcadas: el aviso en el hueco a la izquierda del cuello y la cara más arriba y a la derecha, para que se vea más cuerpo y el texto tenga lugar.

**Descartado.** Ubicar el aviso con un valor fijo en dvh: en las pantallas bajas la cabeza va más abajo y el aviso quedaba sobre la cara. Dejar la cabeza en 0,74 en todas las pantallas: en 375 × 667 quedaba detrás de los botones y de la línea ANMAT.

**Pendiente.** En 375 × 667 la cabeza queda en 0,8, como antes, y la coronilla sigue detrás de la línea ANMAT. Entre 768 y 819 px el aviso queda abajo a la izquierda, como en escritorio.

## Pendientes abiertos

- ~~**Respaldo del 3D sin WebGL.**~~ Resuelto el 2026-10-29 con el prototipo de cabeza: se comprueba el contexto antes de montar el canvas, que va dentro de un límite de errores, y sin WebGL queda la imagen fija (`public/img/cuerpo-inicio.webp`).
- Los de la landing están en `CLAUDE.md` ("Estado") y, con su contexto, en `docs/landing/BITACORA.md`.
