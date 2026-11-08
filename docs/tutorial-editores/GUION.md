# Guion común del tutorial de Keystatic

La voz del video tutorial para editar una web con Keystatic Cloud. **Es la misma para todos los clientes**: no nombra a ninguna empresa, sección, dominio ni persona. Se genera una sola vez en ElevenLabs y se reutiliza. Lo propio de cada cliente (qué pantalla se ve, dónde va el cursor, los rótulos, las tarjetas) va en su archivo de escenas. El de Innercare es `ESCENAS-INNERCARE.md`, el cliente de ejemplo.

Este archivo nace en el repo de Innercare, pero su lugar es el proyecto del video (`~/Documents/Work/tutoriales-keystatic/base/GUION.md`). Una vez copiado allá, se edita allá.

## Reglas

- Público: personas de empresas argentinas que no programan. Voz argentina, voseo, frases cortas, una idea por frase.
- Duración objetivo: 3 a 4 minutos con todos los capítulos. Cada paso dura lo que dura su voz, más medio segundo.
- **La voz nunca lleva datos de un cliente.** Ni su nombre, ni el de sus secciones, ni su dominio, ni a quién avisar: eso va en los rótulos y las tarjetas, que son texto en pantalla y no cuestan créditos. Para la persona que mantiene la web, la voz dice "quien mantiene tu web".
- La voz describe lo que hace cualquier panel; el ejemplo concreto lo pone la imagen. Por eso dice "la sección donde está el texto" y no "Hero".
- `Voz` es lo que se muestra como subtítulo y se cita en los PDF. `Voz TTS` es lo que recibe ElevenLabs cuando hay que escribir algo como se pronuncia; si no está, se usa `Voz`.
- Cada paso es un audio aparte. Cambiar una frase regenera solo ese audio.
- Los capítulos marcados **opcional** se omiten en los clientes que no los usan. Ningún paso de un capítulo obligatorio depende de uno opcional.
- Supuestos comunes a todos los clientes: Keystatic Cloud, panel en `/keystatic`, guardado directo a la rama principal y publicación automática en Vercel. Un cliente con otra configuración necesita otra voz para los capítulos 1 y 4.
- Copy: sin guiones largos, rangos en palabras.

## Capítulo 1 · Entrar al panel

### 01-invitacion
- Voz: Te va a llegar un mail de Keystatic Cloud con una invitación al equipo de tu web. Aceptala y creá tu cuenta con tu correo.
- Voz TTS: Te va a llegar un mail de Kistátic Claud con una invitación al equipo de tu web. Aceptala y creá tu cuenta con tu correo.

### 02-direccion
- Voz: Abrí la dirección de tu web y agregale barra keystatic al final.
- Voz TTS: Abrí la dirección de tu web y agregale barra kistátic al final.

### 03-iniciar-sesion
- Voz: Iniciá sesión con la cuenta que creaste. No hace falta ningún otro programa.

## Capítulo 2 · El panel

### 04-tablero
- Voz: Este es el panel. A la izquierda está el menú: cada entrada es una parte de tu web.

## Capítulo 3 · Cambiar un texto

### 05-abrir-seccion
- Voz: Para cambiar un texto, entrá a la sección donde está. En este ejemplo, la primera pantalla de la web.

### 06-ayuda
- Voz: Debajo de cada campo hay una ayuda. Dice dónde se ve ese texto y cuánto entra. Leela antes de cambiarlo.

### 07-escribir
- Voz: Hacé clic en el campo y escribí, como en cualquier documento.

## Capítulo 4 · Guardar es publicar

### 08-guardar
- Voz: Cuando terminás, guardá. Guardar es publicar: no hay borrador ni aprobación.

### 09-publicado
- Voz: La web se vuelve a armar con el texto nuevo. Tarda unos minutos. Después, recargá la página.

### 10-celular
- Voz: Revisalo en la computadora y en el celular. Lo que entra en una pantalla puede no entrar en la otra.

## Capítulo 5 · Cuando un texto no entra

### 11-limite
- Voz: Si te pasás del largo, el panel no guarda y marca el campo. El mensaje sale en inglés: quiere decir que no puede tener más de esa cantidad de caracteres.

### 12-sin-publicar
- Voz: Si a los diez minutos no ves tu cambio, avisale a quien mantiene tu web. Mientras tanto, la web sigue como estaba. Nada se rompe.

## Capítulo 6 · Listas (opcional)

### 13-lista
- Voz: Algunas secciones tienen listas. Podés agregar, quitar o reordenar elementos.

### 14-elemento
- Voz: Cada elemento se abre para editarlo. Cuando terminás, guardá la sección.

## Capítulo 7 · Archivos (opcional)

### 15-archivos
- Voz: Si tu web tiene documentos para descargar, como un PDF, se suben desde su campo. Para subir o reemplazar uno, elegí el archivo y guardá. Para quitarlo, sacá el archivo y guardá.

## Capítulo 8 · Lo que no se toca

### 16-ramas
- Voz: El panel tiene un menú de ramas. Dejalo siempre en main. Una rama distinta no se publica.
- Voz TTS: El panel tiene un menú de ramas. Dejalo siempre en méin. Una rama distinta no se publica.

### 17-fuera-del-panel
- Voz: Lo que no aparece en el panel, como el diseño, no se cambia desde acá. Para eso, escribile a quien mantiene tu web.

## Capítulo 9 · Si te equivocás

### 18-registro
- Voz: Cada guardado queda registrado, así que cualquier versión anterior se puede recuperar. Si te equivocaste, avisale a quien mantiene tu web.

### 19-cierre
- Voz: Eso es todo. Los detalles de tu web, como cuánto entra en cada texto, están en la guía que acompaña este video.
