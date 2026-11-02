# Sistema de botones

Norma del proyecto para todos los botones y para lo que tenga que combinar con ellos. La definió el usuario el 2026-10-29. Las secciones 1 a 6 son su texto; la 7 la traduce a los tokens de Innercare y lista lo que falta decidir.

## 1. Estilo: relieve suave (skeuomorphism sutil)

Cada botón tiene cuatro capas, todas discretas:

1. **Degradado vertical**: una luz blanca semitransparente arriba que se desvanece hacia abajo, puesta sobre el color de fondo.
2. **Luz interior arriba**: `inset 0 1px 0` en blanco.
3. **Sombra interior abajo**: `inset 0 -1px 0` en negro muy suave.
4. **Sombra de contacto** corta y oscura, más una **sombra de color** (del color del botón), difusa y con spread negativo.

Tiene que ser sutil. Si se nota "la sombra" antes que el botón, está de más: bajá las opacidades.

## 2. Arquitectura: variables por variante

Una clase base lee custom properties. Cada variante define solo sus valores. El hover cambia **solo `background-color`**: el degradado queda fijo encima.

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --radius-control: 0.5rem;

  /* Ejemplo con colores de marca: reemplazar (ver sección 7) */
  --color-primario: #2E6B34;
  --color-primario-oscuro: #1B4321;
  --color-tinte: #E5F1E4;
  --color-tinte-suave: #F1FDEF;
  --color-borde: #C0C9BC;
  --color-tinta: #141E16;

  --shadow-boton: inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.15),
    0 1px 2px rgb(20 30 22 / 0.15), 0 4px 12px -4px rgb(46 107 52 / 0.3);
  --shadow-boton-claro: inset 0 1px 0 #fff, inset 0 -1px 0 rgb(20 30 22 / 0.04),
    0 1px 2px rgb(20 30 22 / 0.05), 0 3px 8px -4px rgb(46 107 52 / 0.12);
  --shadow-boton-hundido: inset 0 2px 3px rgb(0 0 0 / 0.18);
  --shadow-boton-hundido-claro: inset 0 2px 3px rgb(20 30 22 / 0.08);
}

.boton,
.relieve {
  background-color: var(--relieve-color);
  background-image: var(--relieve-fondo);
  box-shadow: var(--relieve-sombra);
}

.boton {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  min-height: 3rem; padding-inline: 1.25rem;
  border-radius: var(--radius-control);
  font-weight: 600; white-space: nowrap; text-decoration: none;
  transition:
    transform 160ms var(--ease-out),
    translate 160ms var(--ease-out),
    background-color 160ms var(--ease-out),
    border-color 160ms var(--ease-out),
    color 160ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .boton:hover { background-color: var(--relieve-color-hover); }
}

/* Al apretar: se achica un poco, baja 1 px y la sombra pasa adentro */
.boton:active {
  transform: scale(0.97);
  translate: 0 1px;
  box-shadow: var(--relieve-sombra-hundido);
}

/* Primario: fondo de color, texto blanco */
.boton-primario {
  color: #fff;
  --relieve-color: var(--color-primario);
  --relieve-color-hover: color-mix(in oklab, var(--color-primario), var(--color-primario-oscuro));
  --relieve-fondo: linear-gradient(rgb(255 255 255 / 0.1), rgb(255 255 255 / 0));
  --relieve-sombra: var(--shadow-boton);
  --relieve-sombra-hundido: var(--shadow-boton-hundido);
}

/* Claro / secundario: blanco con borde y un tinte de marca abajo */
.boton-claro {
  color: var(--color-primario-oscuro);
  border: 1px solid var(--color-borde);
  --relieve-color: #fff;
  --relieve-color-hover: var(--color-tinte-suave);
  --relieve-fondo: linear-gradient(transparent, color-mix(in oklab, var(--color-tinte) 60%, transparent));
  --relieve-sombra: var(--shadow-boton-claro);
  --relieve-sombra-hundido: var(--shadow-boton-hundido-claro);
}
@media (hover: hover) and (pointer: fine) {
  .boton-claro:hover { border-color: var(--color-primario); }
}
```

**Variante "con borde que se rellena".** Para un botón que se repite muchas veces en la página (por ejemplo, uno por tarjeta). En reposo es igual a `.boton-claro`. Con hover o `:focus-visible` pasa al color lleno y cambia `--relieve-fondo` por la luz blanca del primario. Así no quedan varios botones rellenos compitiendo en la misma pantalla.

## 3. Reglas

- **Jerarquía**: a lo sumo un botón relleno por bloque. Las acciones secundarias van como botón claro o como link simple. Un link no se convierte en botón con el hover.
- **Tokens**: colores, sombras, radios y curvas van siempre como variables (en `@theme`, porque usamos Tailwind v4), nunca escritos a mano en los componentes.
- **Tamaño táctil**: `min-height` de 48 px como mínimo.
- **Contraste**: texto blanco sobre el color *más claro* del degradado con 4,5:1 o más. Con un color brillante (como el verde de WhatsApp), el texto va oscuro.
- **Íconos**: de una sola familia, de 20 px, `aria-hidden`, a la izquierda del texto. Solo si ayudan a entender la acción.
- **Foco**: `:focus-visible` tiene que verse igual de claro que el hover.

## 4. Movimiento

- Solo se animan `transform`, `translate`, `opacity`, `background-color`, `border-color` y `color`. **Nunca `transition: all`**, nunca `ease-in`, nunca `scale(0)`.
- Botones: 160 ms con `--ease-out`. Cualquier interacción de UI dura menos de 300 ms.
- **El hover va siempre dentro de `@media (hover: hover) and (pointer: fine)`**. Si un borde o color de hover se pone con clases utilitarias, revertilo fuera de esa media query para que no quede pegado en pantallas táctiles.
- Respetá `prefers-reduced-motion`: el efecto pasa a ser más suave, no desaparece del todo.

## 5. Lo que NO hay que hacer

- **No hagas el hover con una capa `::before` o `::after` animada por opacidad** encima del botón. Chrome la pasa a una capa propia y a veces no repinta el borde al terminar: el botón queda "pegado" en hover y sin borde. El hover cambia `background-color` y nada más.
- No le pongas hover ni efecto de apretar a lo que no es clickeable.
- No agregues brillos, glow ni sombras exageradas.

## 6. Elementos que combinan con los botones sin serlo

- **Clase `.relieve` + variante** (pestañas, tarjetas, sellos): mismo degradado y mismas sombras, pero sin hover ni efecto de apretar. Ejemplos de fondo: tarjeta `linear-gradient(#fff 60%, crema)`, tinte de marca `linear-gradient(tinte-suave, tinte)`, acento `color-mix(acento 8%, blanco)`.
- **Tarjeta que se ilumina** con el mouse sin ser link: acá sí va la sombra en `::after` por opacidad (no hay borde que se pueda romper). Sombra en reposo `0 1px 2px rgb(0 0 0 / .06), 0 4px 12px -4px <color de marca /.14>`. Con hover, `0 2px 4px rgb(0 0 0 / .05), 0 18px 36px -14px <color de marca /.26>`. Aparece en 400 ms `ease-in-out` y se va en 300 ms `ease-out`. No sube.
- **Tarjeta que es un link entero**: la misma sombra, más `translate: 0 -3px` y un borde del color de marca al 35 %, en 400 ms `ease-in-out` (300 ms `ease-out` al salir). Con `:focus-visible`, lo mismo.

- **Enlace de texto subrayado** (CTA secundario suelto, como "Ver catálogo" en fabricación propia): clase `.enlace`. Con el puntero encima, texto y subrayado pasan al primario y el subrayado pasa de 1 a 2 px, en 160 ms. El subrayado en reposo es `outline`; sobre el degradé del hero, `on-surface-variant` (`--enlace-subrayado`).

## 7. Adaptación a Innercare

### Ya aplicado

- `--ease-out` y `--ease-in-out` están en `@theme` (`app/globals.css`). Reemplazan las curvas de Tailwind: las utilidades `ease-out` e `ease-in-out` usan estas.
- El `hover:` de Tailwind está redefinido con `@custom-variant` para exigir `(hover: hover) and (pointer: fine)`. Cualquier `hover:` del proyecto, incluido `group-hover:`, cumple la regla de la sección 4 sin hacer nada más.

### Implementación

En `app/globals.css`: tokens en `@theme` y clases en `@layer components` (las utilidades pueden ajustar tamaño o ancho en cada uso).

| Clase | Uso |
|---|---|
| `.boton .boton-primario` | Acción principal de un bloque. Uno por bloque. |
| `.boton .boton-claro` | Acción secundaria (p. ej. descargar la ficha técnica). |
| `.boton .boton-relleno` | Botón que se repite (uno por tarjeta): claro en reposo, primario con hover o foco. |
| `.relieve .relieve-claro` | Sellos o pestañas que combinan sin ser clickeables (p. ej. las medidas de una ficha). |

Con movimiento reducido, el botón conserva los cambios de color y sombra (160 ms) pero no se achica ni baja al apretarlo.

### Equivalencia de colores (aplicada)

| Token del sistema | Token de Innercare | Valor |
|---|---|---|
| `--color-primario` | `--color-primary` | `#003c6f` |
| `--color-primario-oscuro` | `--color-on-primary-fixed` | `#001c39` (hover resultante ≈ `#002c54`) |
| `--color-tinte` | `--color-primary-fixed` | `#d4e3ff` |
| `--color-tinte-suave` | `--color-primary-faint` (nuevo) | `#f0f5fc` |
| `--color-borde` | `--color-outline-variant` | `#d3d9df` |
| `--color-tinta` | `--color-on-surface` | `#0d1b2a` |
| color de las sombras de marca | `--color-primary` | `rgb(0 60 111 / …)` |
| color de las sombras de contacto | `--color-on-surface` | `rgb(13 27 42 / …)` |

Contraste del primario: texto blanco sobre el tono más claro del degradado (`#003c6f` con 10 % de blanco, ≈ `#1a4f7d`) da alrededor de 8:1. Cumple.

### Por decidir

- **Radio.** El sistema propone 8 px (`0.5rem`); la dirección visual del sitio es pill. Por ahora `--radius-control` vale `9999px` (pill), igual que PillNav y el índice lateral. Cambiar ese token cambia todos los botones a la vez.

### Migración (2026-10-29)

- Pasados al sistema: "Ver catálogo" del hero, "Contactar" del CTA de contacto, de la barra y del menú móvil, y los botones de la ficha (primario y "Ficha técnica (PDF)" como claro). Las medidas de la ficha son `.relieve .relieve-claro`.
- Se quitaron las flechas a la derecha de los primarios: el sistema pide íconos a la izquierda y solo si ayudan a entender la acción. El de descarga se queda (a la izquierda, 20 px).
- El botón de menú móvil pasó a 48 px de área táctil.
- La barra de vidrio pasó a 64 px de alto para que "Contactar" tenga 48 px.

### Excepción: crecer con el hover (2026-10-29)

- "Ver catálogo" del hero crece a 1,04 con el puntero encima (`.boton-crece`), además del cambio de color. Lo pidió el usuario. Es solo para ese botón: el resto sigue cambiando únicamente el color. Usa la propiedad `scale` para sumarse al efecto de apretar.

### Excepción: botón de vidrio (2026-10-30)

- "Ver casos a medida" del hero es de vidrio (`BotonVidrio`, `.boton-vidrio`), como "Ver la demo" de Mango. Lo pidió el usuario. Mismas medidas que `.boton`; vidrio blanco esmerilado (`backdrop-filter: blur(22px) saturate(180%)`) con un brillo arriba y sin sombra exterior (la de Mango lo hacía resaltar). En el hero, los dos botones van más grandes que el resto (texto de 18 px y 56 px de alto los dos; la jerarquía la marca el relleno, no el tamaño). Con el puntero encima sube 2 px, un brillo y un borde del primario siguen al puntero y las letras ruedan hacia arriba. Con movimiento reducido no sube ni rueda; con transparencia reducida, fondo opaco. Es solo para ese botón.

### Pendiente

- Tarjetas de la sección 6: implementadas como `.tarjeta-enlace` (`globals.css`) en "Más implantes" de la ficha de producto, con la sombra transicionada en `box-shadow` directo (la tarjeta tiene borde, y el `::after` lo pisaba en Chrome, sección 5). `ProductTile` (`components/product-tile.tsx`, solo en `/productos`, sin enlaces que lleguen) sigue con su efecto propio (zoom de la foto y flecha que se desplaza).
- PillNav y GlassSurface son de React Bits y tienen sus propios estilos: si se adaptan al sistema, que quede anotado en `docs/DECISIONES.md`.
