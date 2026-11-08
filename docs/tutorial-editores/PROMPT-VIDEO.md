# Prompt: video tutorial de Keystatic con Remotion y ElevenLabs

Instrucciones para el chat de Claude Code abierto en `~/Documents/Work/tutoriales-keystatic/`, con los conectores de ElevenLabs y Epidemic Sound disponibles. Esa carpeta ya tiene el guion, las escenas, las capturas y el logo de Innercare (tanda 1 de `PROMPT-CAPTURAS.md`, hecha el 2026-11-05). Copia en el proyecto: `INSTRUCCIONES.md`.

---

Vas a construir un generador del video tutorial "Cómo editar los textos de tu web" para los clientes de Brian que usan Keystatic Cloud. Son empresas, casi siempre argentinas, y sus editores no programan. Keystatic funciona casi igual en todas, así que **la voz es una sola, se genera una vez y se reutiliza en todos los videos**. Cada cliente aporta solo lo que se ve: sus capturas, sus rótulos y su marca. Renderizar el video de un cliente nuevo no gasta créditos de ElevenLabs. Innercare (fabricante argentino de implantes ortopédicos) es el primer cliente y el ejemplo.

No es una grabación de pantalla. Cada escena es una captura real del panel con un cursor animado encima, un clic con sonido y una transición a la captura siguiente.

## Estructura

- `base/GUION.md`: la voz, común a todos. Copia de `docs/tutorial-editores/GUION.md` del repo de Innercare; desde ahora vive acá. Leé sus reglas: la voz nunca lleva datos de un cliente, cada paso es un audio aparte y hay capítulos opcionales.
- `base/voz/`: un audio por paso, generado una vez. Va a git, porque regenerarlo cuesta créditos.
- `base/voz.json`: la voz elegida (su id y su nombre en ElevenLabs, el modelo y los ajustes) y, por paso, el hash del texto con que se generó su audio y su duración.
- `clientes/<cliente>/`: lo de cada cliente.
  - `ESCENAS.md`: qué se ve en cada paso, los rótulos, las tarjetas, sus datos (marca, dominio, contacto) y qué capítulos opcionales usa. El de Innercare es copia de `docs/tutorial-editores/ESCENAS-INNERCARE.md`.
  - `capturas/`: las PNG y `escenas.json`, con las cajas en píxeles de la imagen (`cursor`, con su centro y si hace clic; `resaltado`). Leé el formato real del archivo antes de tiparlo.
  - `marca.json`, que armás con Brian: colores, logo y fuentes. Innercare: primario `#003c6f`, Hanken Grotesk para títulos y Source Sans 3 para texto (Google Fonts) y su `logo.png`, que te pasa Brian.
- Nada de un cliente escrito en los componentes. Si hace falta un cliente nuevo, se agrega su carpeta y se renderiza.

## Antes de escribir código

- Consultá la documentación actual con Context7 de Remotion (composiciones, `calculateMetadata`, audio, `spring`, `interpolate`, render por CLI). No te fíes de la memoria.
- Remotion es gratis para personas y empresas de hasta tres personas: es el caso de Brian. Si eso cambia, hay licencia.
- Remotion baja su propio Chrome para renderizar, de unos cientos de MB. El disco de Brian tiene unos 15 GB libres: mantené el proyecto por debajo de 2 GB en total, sin renders de prueba acumulados (borralos al aprobarse el siguiente) y sin instalar navegadores aparte de ese. No instales aplicaciones de escritorio.

## La voz

- **El conector es "claude.ai ElevenLabs"** (el remoto de la cuenta de Brian). Si aparece otro con el mismo nombre y un "(2)", ignoralo. Fijate cómo devuelve el audio (archivo, enlace o datos) y guardá cada paso como `base/voz/<id del paso>.mp3`; ningún audio puede quedar solo en el chat.
- **La voz es "Malena Tango"**, argentina, que Brian ya agregó a sus voces de ElevenLabs. Buscala entre las voces de la cuenta con el conector y guardá su id en `base/voz.json`. No uses otra voz ni la reemplaces por una parecida: si no aparece, pará y avisale.
- **Probar antes de gastar.** Generá solo la frase del paso 04 y pasásela a Brian. Si suena apurada, robótica o sobreactuada, ajustá estabilidad, similitud y estilo con esa frase sola y volvé a mostrarla. Recién con su visto bueno, generá el resto.
- Cada paso, de `Voz TTS` (o `Voz` si no hay). La pronunciación de "Keystatic" ya viene escrita ("Kistátic"); si suena mal, probá variantes en esa frase sola antes de seguir.
- Usá el modelo multilingüe de mejor calidad que ofrezca el MCP y los mismos ajustes en todos los pasos, guardados en `base/voz.json`, así un paso regenerado más adelante suena igual que los demás.
- Antes de pedir un audio, compará el hash del texto con `base/voz.json`: si no cambió, no se regenera. Al terminar, decile a Brian cuántos caracteres se generaron.
- Si el MCP no está conectado, pará y avisale. No uses la API por tu cuenta sin que te pase una clave.

## Cómo es el video

- 1920 × 1080 a 30 cuadros, H.264.
- **Tiempos:** cada escena dura lo que dura su audio más 0,5 s (`calculateMetadata`, con las duraciones de `base/voz.json`). Como la voz es la misma, las escenas de cualquier cliente duran lo mismo; lo que se anima dentro de una escena se acomoda a esa duración.
- **Apertura** (unos 4 s): fondo claro, el logo del cliente y "Cómo editar los textos de tu web". Sin degradés ni efectos llamativos.
- **Escena `captura`:** la captura a pantalla completa, escalada desde 2x. Zoom lento (de 1 a 1,15 como mucho) hacia la caja `resaltado`, si la hay, con un recuadro redondeado en el color primario del cliente que aparece con un fundido. El cursor es un SVG de flecha de sistema, con sombra suave, que viaja desde donde quedó en la escena anterior hasta el centro de `cursor` con una curva amortiguada (`spring`), no en línea recta mecánica. Si hace clic: se achica al 85 % y vuelve, se abre una onda circular desde la punta y suena el clic; poco después, fundido cruzado a la escena siguiente. Convertí las cajas de los píxeles de la imagen a los del cuadro, para que el cursor y el zoom caigan justo en cualquier escala.
- **Escena `antes-despues`:** la captura "antes"; el cursor hace clic en el campo; aparece un cursor de texto parpadeante y la captura "después" se revela de izquierda a derecha recortada a la caja del campo, al ritmo de escritura del texto de ejemplo (unos 25 caracteres por segundo, sin pasarse del audio), con el cursor de texto en el borde del barrido. No escribas texto con una fuente propia encima de la captura: no coincidiría con la del panel.
- **Escena `tarjeta`:** una pantalla dibujada con la marca del cliente, según la descripción de sus escenas (el mail de invitación, los avisos, el cierre). Genérica: nada que imite Gmail, Outlook u otra marca.
- **Barra de navegador** y **marco de teléfono**, donde las escenas los piden: dibujados, genéricos, sin logos de navegador ni de fabricante.
- **Rótulo:** abajo a la izquierda, el `rotulo` de la escena en una pastilla blanca con sombra suave y texto en el primario. Es lo que nombra lo propio del cliente (la sección, el dominio, a quién avisar), así que tiene que leerse bien.
- **Subtítulos:** el texto `Voz` del paso, abajo al centro, encima del rótulo o al lado, sin taparlo. Se pueden apagar por cliente.
- **Capítulos:** al empezar cada capítulo, su título un segundo y medio arriba, chico. Los capítulos opcionales que el cliente no usa no aparecen, y la numeración se recalcula.
- **Cierre** (unos 4 s): el logo y el texto de cierre de las escenas del cliente.
- **Efectos de sonido, ya hechos.** Nada generado por IA: ni los efectos de sonido de ElevenLabs ni otro generador. Buscalos en la biblioteca de Epidemic Sound con su conector (Brian tiene cuenta): un clic de mouse limpio y suave (no uno mecánico ruidoso), un golpe de teclado muy bajo durante el barrido de escritura, un "whoosh" corto y discreto para el cambio de capítulo y la apertura, y una notificación suave para el paso que publica. Pocos y bajos: acompañan, no se escuchan más que la voz. Si el conector no está, pará y avisale.
- **Música, también de Epidemic Sound.** Instrumental, tranquila y moderna, de tempo medio (unos 90 a 110 BPM), sin voces ni melodía protagonista: algo entre corporativo tecnológico y lo-fi suave, que no se canse en cuatro minutos. Pasale a Brian tres opciones con su enlace y elegí con él. Va unos 20 dB por debajo de la voz, baja aún más mientras se habla y se funde al final.
- **Licencia:** guardá en `base/sonidos/CREDITOS.md` el título, el autor y el id de cada pista y efecto. Avisale a Brian que, para subir el video a YouTube sin reclamos, su canal tiene que estar vinculado a su cuenta de Epidemic Sound, y que el plan tiene que cubrir trabajos para clientes.
- Los sonidos y la música van en `base/sonidos/`, comunes a todos los clientes como la voz.

## Salidas, en `out/<cliente>/`

- `tutorial.mp4`.
- `capitulos.json`: por capítulo, su título y el segundo de inicio, calculados de la composición, no a mano.
- `descripcion-youtube.txt`: un párrafo corto y la lista de capítulos con sus tiempos (`0:00 Entrar al panel`…). YouTube exige que el primero sea `0:00`, que haya al menos tres y que cada uno dure al menos 10 s: comprobalo.
- `miniatura.png` (1280 × 720, para YouTube) y `miniatura-pdf.png` (el mismo cuadro con un botón de reproducir dibujado al centro): un cuadro de la escena 07 con el título encima.

Brian sube el video a YouTube como **no listado** y le pasa al chat de capturas de cada cliente la URL, `capitulos.json` y `miniatura-pdf.png` para su PDF.

## Cómo trabajar

1. Proyecto Remotion con TypeScript y la estructura de arriba.
2. La voz: la frase del paso 04 con Malena Tango a Brian; con su visto bueno, todos los pasos. Después, la música (tres opciones) y los efectos.
3. Primer control: renderizá solo las escenas 04 a 08 de Innercare (incluyen un clic, un `antes-despues` y un rótulo) y mostráselas a Brian antes de seguir. Ahí se ajustan tiempos, curva del cursor y tamaño del zoom.
4. El video entero de Innercare, revisado en los cambios de escena con cuadros sueltos (`remotion still`): que el cursor caiga sobre su elemento, que no haya saltos entre capturas y que el recuadro coincida.
5. Probá que el proyecto sea de verdad reutilizable: armá un cliente `clientes/prueba/` con dos o tres capturas de cualquier panel de Keystatic, sin los capítulos opcionales, y renderizalo sin generar audio nuevo. Después borralo.
6. Un `README.md` corto: cómo agregar un cliente (qué capturas sacar, el formato de `ESCENAS.md` y `escenas.json`), cómo cambiar una frase de la voz y qué cuesta, y los comandos.
7. Al final, resumen: qué quedó y dónde, cuánto dura el video de Innercare, cuántos caracteres de ElevenLabs se usaron y qué no se pudo hacer.

Copy en pantalla: voseo, sin guiones largos, rangos en palabras.
