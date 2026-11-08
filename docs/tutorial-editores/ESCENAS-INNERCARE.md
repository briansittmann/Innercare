# Escenas del tutorial: Innercare

Lo que se ve en cada paso del guion común (`GUION.md`) con el panel de Innercare, el cliente de ejemplo. La voz no cambia; esto sí: las capturas, el cursor, los resaltados, los rótulos y las tarjetas. Los ids son los del guion. Las sacan el script y el prompt de `PROMPT-CAPTURAS.md`; si este archivo y `docs/EDITORES.md` no coinciden, manda `EDITORES.md`.

En el proyecto del video, este archivo es `clientes/innercare/ESCENAS.md`. Otro cliente copia este formato.

## Datos del cliente

- Marca: Innercare
- Dominio: innercare-web.vercel.app (cambia cuando compren el dominio; entonces se vuelven a sacar las capturas 02 y 03)
- Contacto: Brian
- Capítulos opcionales: Listas sí, Archivos sí

## Tipos de pantalla

- `captura`: una captura real del panel o de la web.
- `antes-despues`: dos capturas del mismo encuadre; el video pasa de una a otra con un barrido dentro de la caja del campo, con un cursor de texto, como si se escribiera.
- `tarjeta`: una pantalla dibujada en el video con la marca del cliente. No es una captura.

`Cursor`: el elemento sobre el que se posa el cursor; si dice "clic", suena el clic y pasa a la pantalla siguiente. `Resaltado`: el recuadro y el zoom lento hacia esa zona. `Rótulo`: la pastilla de texto abajo a la izquierda.

## Escenas

### 01-invitacion
- Pantalla: tarjeta. Un sobre de mail con el asunto "Te invitaron al equipo Innercare" y el remitente Keystatic Cloud. Dibujo genérico, sin imitar Gmail ni otro cliente de correo.
- Rótulo: La invitación

### 02-direccion
- Pantalla: captura. La pantalla de inicio de sesión del panel, con la dirección escrita arriba en una barra de navegador dibujada.
- Resaltado: la barra de dirección.
- Rótulo: innercare-web.vercel.app/keystatic

### 03-iniciar-sesion
- Pantalla: captura. La misma pantalla de inicio de sesión.
- Cursor: el botón para iniciar sesión, clic.
- Rótulo: Iniciar sesión

### 04-tablero
- Pantalla: captura. El tablero del panel con el menú de la izquierda.
- Resaltado: el menú de la izquierda; el cursor pasa por los grupos Portada, Secciones y Sitio sin hacer clic.
- Rótulo: Portada, Secciones y Sitio

### 05-abrir-seccion
- Pantalla: captura. El tablero.
- Cursor: Hero en el menú, clic.
- Rótulo: Portada › Hero

### 06-ayuda
- Pantalla: captura. La sección Hero, con el campo Bajada a la vista.
- Resaltado: la ayuda debajo de la etiqueta Bajada.
- Rótulo: La ayuda de cada campo

### 07-escribir
- Pantalla: antes-despues. El campo Bajada con el texto actual y con el texto de ejemplo.
- Texto de ejemplo: Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio en nuestra planta.
- Cursor: el campo Bajada, clic; después el cursor de texto avanza con el barrido.
- Rótulo: Bajada

### 08-guardar
- Pantalla: captura. La sección Hero con el cambio hecho y el botón Save arriba a la derecha (el panel lo muestra en inglés).
- Cursor: el botón Save, clic.
- Rótulo: Save = Guardar

### 09-publicado
- Pantalla: captura. La primera pantalla de la web en la computadora, con la bajada nueva.
- Resaltado: la bajada.
- Rótulo: Unos minutos después

### 10-celular
- Pantalla: captura. La primera pantalla de la web en el celular, con la bajada nueva, dentro de un marco de teléfono dibujado.
- Resaltado: la bajada.
- Rótulo: También en el celular

### 11-limite
- Pantalla: captura. El campo Bajada con un texto de más de 100 caracteres y el mensaje de error del panel debajo, después de intentar guardar.
- Resaltado: el mensaje de error.
- Rótulo: "must be no longer than…" = no puede tener más de…

### 12-sin-publicar
- Pantalla: tarjeta. Dos líneas: "¿No ves tu cambio a los diez minutos?" y "Avisale a Brian. La web sigue como estaba."
- Rótulo: Si no ves el cambio

### 13-lista
- Pantalla: captura. La sección Habilitaciones con las filas de la tabla.
- Cursor: el botón para agregar una fila, sin clic.
- Rótulo: Secciones › Habilitaciones

### 14-elemento
- Pantalla: captura. Una fila de Habilitaciones abierta para editar.
- Resaltado: el campo de la disposición o el número.
- Rótulo: Una fila de la tabla

### 15-archivos
- Pantalla: captura. La sección Fichas técnicas (PDF), con el campo del Fémur proximal y su archivo cargado.
- Cursor: el campo del Fémur proximal, sin clic.
- Rótulo: Portada › Fichas técnicas (PDF)

### 16-ramas
- Pantalla: tarjeta. Un selector de ramas dibujado, genérico, con "main" elegido y una marca de verificación. El selector real solo existe en Keystatic Cloud y las capturas salen del panel en modo local; si más adelante se captura en Cloud, vuelve a ser una captura.
- Rótulo: Siempre en main

### 17-fuera-del-panel
- Pantalla: tarjeta. Tres líneas: "Las fotos", "El cuerpo 3D y las animaciones", "La cantidad de pasos, tarjetas y fotos". Debajo: "Para cambiarlos, escribile a Brian."
- Rótulo: Lo que no está en el panel

### 18-registro
- Pantalla: tarjeta. "Cada guardado queda registrado: quién, qué y cuándo."
- Rótulo: Nada se pierde

### 19-cierre
- Pantalla: tarjeta. El logo de Innercare y "La guía completa está en el PDF".
- Rótulo: Listo
