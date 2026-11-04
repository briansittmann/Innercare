# Cómo editar los textos de la web

Guía para quienes mantienen los textos de la web de Innercare. Desde el panel de edición cambiás los textos de la página principal, del menú, del footer, de la pantalla de carga, del panel de contacto y lo que muestran Google y las redes al compartir el enlace. No hace falta saber programar ni tocar ningún otro programa.

## Entrar al panel

1. Te llega por mail una invitación de **Keystatic Cloud** al equipo «Innercare». Aceptala y creá tu cuenta. No hace falta cuenta de GitHub.
2. Abrí la dirección de la web y agregale `/keystatic` al final. Hoy es `https://innercare-web.vercel.app/keystatic`; cuando la web tenga su dominio definitivo, va a ser ese dominio seguido de `/keystatic`.
3. Iniciá sesión con tu cuenta de Keystatic Cloud.

Si la dirección dice «Página no encontrada», el panel todavía no está habilitado: avisale a Brian.

El panel tiene a la izquierda un menú en tres grupos (**Portada**, **Secciones** y **Sitio**). Cada entrada es una parte de la web. Debajo de cada campo hay una ayuda que dice dónde se ve ese texto y cuánto entra: leela antes de cambiarlo.

## Dónde se ve cada sección

| Sección del panel | Dónde se ve en la web |
|---|---|
| Portada › **Hero** | La primera pantalla: titular, bajada, el botón «Recorrer los implantes», la línea de habilitaciones y el aviso para deslizar. El titular también va en el footer y en la tarjeta que aparece al compartir el enlace. |
| Portada › **Recorrido de implantes** | El recorrido por el cuerpo: la tarjeta de cada una de las seis paradas, el índice de la izquierda y el cierre con el cuerpo entero. |
| Portada › **Fichas técnicas (PDF)** | El PDF de cada parada: el enlace «Ficha técnica (PDF)» de su tarjeta y, en Hombro y Fémur proximal, el botón de la página del producto. |
| Secciones › **Cómo trabajamos** | La sección «Cómo trabajamos»: el título, los tres pasos y la leyenda de colores debajo de la pieza. |
| Secciones › **Fabricación** | La sección «Fabricación»: las dos tarjetas animadas y la tira de fotos de la planta. |
| Secciones › **Habilitaciones** | La tabla de habilitaciones ANMAT y del Sistema Nacional de Trazabilidad. |
| Secciones › **Distribución** | El mapa de Argentina con las sedes. La sede principal también va en el footer y en el panel de contacto. |
| Secciones › **Contacto** | El final de la página (las manos y la tarjeta «¿Tenés un caso para resolver?») y el panel que se abre con «Plantear un caso» (también en la página `/contacto`). |
| Sitio › **Menú y footer** | La barra de arriba, el menú del celular, el botón «Plantear un caso» en todo el sitio y el nombre de la marca en el footer. |
| Sitio › **Pantalla de carga** | La pantalla que aparece mientras carga la página principal. |
| Sitio › **SEO y redes** | El título de la pestaña del navegador, lo que muestra Google y la tarjeta al compartir el enlace por WhatsApp, LinkedIn o X. |

## Qué podés cambiar

- **Hero:** titular, bajada, el botón de vidrio, la línea de habilitaciones y el aviso de deslizar.
- **Recorrido de implantes:** en cada parada (Cráneo, Maxilar, Hombro, Acetábulo, Fémur proximal y Diáfisis femoral), la zona anatómica, el título, la descripción, los datos técnicos (de uno a cuatro) y el texto alternativo de la foto. Además, el título y la bajada del cierre, el aviso de continuar y las etiquetas de las tarjetas.
- **Fichas técnicas (PDF):** el PDF de cada una de las seis paradas (ver «La ficha técnica en PDF»).
- **Cómo trabajamos:** el título, el título y la descripción de cada paso, y las tres etiquetas de la leyenda.
- **Fabricación:** título, bajada, el nombre y el texto de las dos tarjetas, el botón «Volver a ver» y, de cada una de las ocho fotos de la tira, el texto alternativo, el pie y la segunda línea.
- **Habilitaciones:** título, bajada y las filas de la tabla. Podés agregar, quitar o reordenar filas (hasta ocho).
- **Distribución:** título, bajada y las sedes: tipo de sede, nombre completo, calle y número, código postal, localidad, provincia (de una lista), latitud y longitud (ubican el pin), teléfonos, cuál es la sede principal y el texto alternativo de la foto. Podés agregar, quitar o reordenar sedes (hasta ocho); en el mapa se ordenan solas de norte a sur.
- **Contacto:** la línea chica y el titular de la intro, el título y la bajada de la tarjeta final y, del panel de contacto, el título, la bajada, el botón de enviar (y lo que dice mientras envía), el mensaje de confirmación, «¿Preferís otro canal?» y las cuatro etiquetas de los motivos de consulta.
- **Menú y footer:** el nombre de la marca, las cuatro etiquetas del menú y el botón «Plantear un caso», que cambia en todos los botones del sitio que lo usan.
- **Pantalla de carga:** las etapas del proceso que van pasando mientras carga (entre tres y diez), «Cargando» y «Listo».
- **SEO y redes:** el título de la página principal, la plantilla del título de las demás páginas (lleva `%s`, que se reemplaza por el nombre de cada página), la descripción para buscadores, la descripción y el texto alternativo de la imagen para redes, y el título y la descripción de la página de contacto.

Los campos de **texto alternativo** y los grupos **Lectores de pantalla** no se ven en la página: los leen en voz alta los lectores de pantalla que usan las personas ciegas, y también los leen los buscadores. Describí lo que muestra la foto o qué hace el botón, en una oración.

## Qué no se cambia desde el panel

- **Fotos e imágenes** (la tira de Fabricación, las sedes, las paradas, los pasos): se cambian reemplazando el archivo, y eso lo hace Brian. Mandale la foto nueva. La única excepción es la ficha PDF de cada parada, que se sube desde el panel.
- **El cuerpo 3D, los implantes y las animaciones:** son modelos y programación. Lo mismo el orden de las paradas y cuáles son a medida o de catálogo.
- **La cantidad de pasos, tarjetas y fotos:** Cómo trabajamos tiene tres pasos, Fabricación dos tarjetas y ocho fotos. La animación de cada sección está hecha para esa cantidad.
- **Los enlaces del menú y las direcciones internas de cada sección:** otras páginas y los buscadores apuntan a ellas.
- **El formulario de contacto:** los nombres de los campos y sus mensajes de error quedan fijos.
- **Las fichas de producto** (la página de cada producto) y el botón «Ver ficha del producto»: quedan para una etapa posterior.
- **Los identificadores** de las filas de Habilitaciones y de las sedes: no se ven en la página, pero el sistema los usa (el de cada sede elige su foto). No los cambies una vez creados.
- El mapa, los colores y las tipografías.

## Los límites de largo

Cada texto que se ve en la página se midió en la computadora y en el celular. El límite es lo que entra sin romper el diseño: una línea de más en el hero baja el cuerpo 3D en el celular, un botón largo ya no entra en su fila, un menú largo se descentra. Cuando un texto ya está justo en el límite, la ayuda del campo lo dice: para alargarlo hay que acortar otra cosa o hablarlo con Brian.

Los caracteres se cuentan con espacios y signos incluidos.

**Si te pasás, el panel no guarda** y marca el campo con un mensaje en inglés (es un detalle del programa):

- «must be no longer than 50 characters»: no puede tener más de 50 caracteres.
- «must not be empty»: no puede quedar vacío.
- En los campos con formato (teléfonos, referencias ANMAT, código postal), el mensaje está en castellano y dice cómo escribirlo.

**Algunos límites son de varios textos juntos, y esos el panel no los controla al guardar:**

- Las cuatro etiquetas del menú, entre todas: hasta 52 caracteres.
- «Plantear un caso» más el botón de vidrio del hero: hasta 41 (van en la misma fila en el celular).
- Las tres etiquetas de la leyenda de Cómo trabajamos: hasta 40.
- En cada sede, «calle, localidad»: hasta 61; y el nombre que muestra la tarjeta (las sucursales dicen solo «Sucursal») más la calle y la localidad: hasta 78.
- En cada sede, «localidad, provincia» (la etiqueta del mapa): hasta 38. Y si la sede es la planta industrial, su nombre completo va entero bajo la etiqueta: hasta 23.
- En una parada con cuatro datos técnicos, la descripción: hasta 100.
- La sede principal tiene que tener al menos un teléfono (es el WhatsApp del footer y del contacto), y dos sedes no pueden tener las mismas coordenadas.
- Una lista que el panel deja vacía (filas de la tabla, sedes, datos técnicos de una parada, etapas de la carga) frena la publicación: el panel avisa al guardar, pero por las dudas la web también lo controla.
- «Innercare | » más el titular del hero, que es el título de la tarjeta al compartir el enlace: hasta 60.
- Tiene que haber exactamente una sede principal.

Si alguno de estos no se cumple, el cambio se guarda pero **no se publica**: la web sigue como estaba (ver «Qué pasa al guardar»).

## La ficha técnica en PDF

Los PDF tienen su propia sección, Portada › **Fichas técnicas (PDF)**, con un campo por parada («Fémur proximal: ficha técnica», «Hombro: ficha técnica»…). Si una parada tiene archivo, su tarjeta en el recorrido muestra el enlace «Ficha técnica (PDF)»; en Hombro y Fémur proximal, la página del producto también lo ofrece. Están aparte de los textos del recorrido a propósito: así un guardado nunca mezcla archivos con las listas de datos técnicos.

- **Subir:** en Fichas técnicas (PDF), elegí el archivo en el campo de la parada y guardá.
- **Reemplazar:** elegí el archivo nuevo en el mismo campo y guardá. Se guarda siempre con el mismo nombre, así que el enlace no cambia.
- **Quitar:** quitá el archivo del campo y guardá. El enlace desaparece de la tarjeta.

Tiene que ser un PDF: el panel deja elegir cualquier archivo, pero si no es PDF la publicación se frena. No importa cómo se llame tu archivo: quien lo descarga lo recibe con un nombre que dice de qué parada o producto es. Cuanto más liviano, más rápido se descarga en el celular.

## Qué pasa al guardar

- **Guardar es publicar.** No hay borrador ni aprobación: al guardar, la web se vuelve a armar con el texto nuevo.
- **Tarda unos minutos en verse.** Después, recargá la página o abrila en una ventana nueva.
- **Si pasados diez minutos no se ve, avisale a Brian** y decile qué sección cambiaste. Quiere decir que la publicación se frenó porque algún control no pasó: la web siguió como estaba y nada se rompió. Hasta que se corrija, los cambios que guarden después tampoco se publican.
- **Todo queda registrado:** cada guardado deja constancia de quién cambió qué y cuándo, así que cualquier texto anterior se puede recuperar. Si te equivocaste y no te acordás cómo estaba, avisale a Brian.
- **No hace falta tocar GitHub** ni ningún otro programa.
- **No cambies de rama.** El panel tiene un menú de «ramas»: dejalo en la que viene (`main`). Una rama distinta no se publica.
- Si las dos van a editar el mismo día, repártanse las secciones: mejor que dos personas no cambien la misma a la vez.

## Consejos

- **Revisá cada cambio en la computadora y en el celular.** Lo que entra en una pantalla puede no entrar en la otra.
- **El tono de la web:** voseo («Contactanos», «Enviános»), frases directas, sin guiones largos (—) y con rangos en palabras («10 a 12 mm», no «10-12 mm»).
- **No agregues datos que no estén en la documentación de Innercare:** cifras, indicaciones, resultados clínicos y certificaciones salen de la carpeta institucional, el brochure y las disposiciones.
- **Referencias ANMAT:** copialas tal cual figuran en la disposición o el certificado y con el formato de las que ya están: «Disposición 0999/17», «N° 298-2023-R». Dos números van separados por « · » (espacio, punto medio, espacio), como «GLN 7798276610001 · Sub-GLN 7798276610018», y cada parte va en su propia línea. El punto medio es más fácil de copiar de una fila existente que de escribir.
- **Teléfonos:** con el código de país, espacios y guion, como `+54 9 11 2066-5434`. El primer teléfono de la sede principal es el de WhatsApp.
- **Coordenadas de una sede:** en Google Maps, hacé clic derecho sobre el lugar y copiá los dos números que aparecen arriba: el primero es la latitud y el segundo la longitud (en Argentina, los dos son negativos).
- **Sede nueva:** su foto la agrega Brian; mientras tanto, el mapa muestra «Foto pendiente».
- **Titular de la intro del contacto:** una oración corta; entra palabra por palabra mientras se arman las manos.
- **«Plantear un caso»** cambia en todos los botones de contacto del sitio. Mantenelo corto.
- **Pantalla de carga:** las etapas son pasos del proceso real de Innercare y cada una se ve al menos medio segundo; con más etapas, cada una dura menos en pantalla.
