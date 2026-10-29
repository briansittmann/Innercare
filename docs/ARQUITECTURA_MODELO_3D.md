# Arquitectura del modelo 3D

Cómo se construye y se muestra el cuerpo translúcido del hero: qué se ve, de dónde sale cada pieza, cómo se genera y cómo se integra en la web. Las decisiones con su motivo están en `DECISIONES.md`.

Estado al 2026-10-29. El hero muestra el prototipo de cabeza; el cuerpo entero viene después.
- **Hecho:** la piel. `3d/scripts/piel.py` genera `3d/salida/piel.glb`: maniquí de 1,70 m, unas 110 000 caras y 2,2 MB, sin pezones ni vulva, con la cara del busto. Imágenes de control en `3d/salida/preview/`, generadas con `preview.py`.
- **Hecho:** el esqueleto. `3d/scripts/anatomia.py` genera `3d/salida/esqueleto.glb`: 263 huesos de BodyParts3D 4.0 (CC BY 4.0) con dientes, ajustados dentro de la piel y unidos en 25 mallas `hueso_<zona>`. Son unas 117 000 caras y 2,5 MB sin comprimir. Imágenes en `3d/salida/preview/esqueleto/` (solo huesos) y `esqueleto-piel/` (con la piel translúcida encima).
- **Hecho:** el prototipo de cabeza (orden de trabajo, punto 2), salvo la medición en el celular.
  - `3d/scripts/implantes.py` genera la craneoplastía (`salida/implantes.glb`, unas 5 000 caras) y recorta el cráneo debajo (`salida/anatomia.glb`: piel y esqueleto con los recortes). `3d/scripts/cabeza.py` recorta el busto (`salida/cabeza.glb`). `npm run modelos` corre los dos y los optimiza a `public/modelos/`: `cabeza.glb` (425 KB, 334 KB transferidos con gzip) e `implantes.glb` (73 KB). Son unos 87 000 triángulos.
  - En el hero (`components/hero-3d/`): materiales finales por nombre de malla, parada 1 con giro lento de 3/4 de perfil hacia el frente y vuelta, detección de WebGL con imagen de respaldo (`public/img/cuerpo-inicio.webp`), carga diferida, sin render fuera de pantalla y sin giro con `prefers-reduced-motion`.
  - Medición en escritorio (Apple M1, build de producción, dpr 1,5): 60 fps con el vidrio medio o bajo y 37 fps con el alto. El 3D queda listo a los 0,6 s de la navegación, con 450 KB de JS en la home.
  - Para medir: `?medir` en la home muestra cuadros por segundo, triángulos, tiempos y bytes; `?calidad=alta|media|baja` fija el vidrio, y `?hueso=0.3`, la opacidad del hueso. Es del prototipo: se quita antes del lanzamiento.
- **Siguiente:** medir en el celular y ajustar la calidad por defecto, la transmisión y la opacidad del hueso. Después, el cuerpo entero (orden de trabajo, punto 3).
- **Del esqueleto, a revisar con el material de vidrio:**
  - El cráneo queda algo bajo dentro de la cabeza, porque la del maniquí es más alta que la del atlas: entra escalado por eje (0,98 × 1,05 × 0,86).
  - La mano del maniquí es más larga que la del atlas (unos 21 cm): los huesos se estiran un 45 % a lo largo. Los dedos del atlas se cierran para seguir los de la piel.
  - Quedan algunas astillas pequeñas en la órbita y el arco cigomático, donde el atlas tiene láminas finas, y un aplanamiento mínimo en la punta de una costilla bajo la axila izquierda.
- **Aceptable por ahora, a revisar con el material de vidrio:** la cara un poco más blanda que la imagen original (sobre todo los ojos), una línea tenue en la columna y marcas mínimas en las axilas.
- **Entorno:** Blender 5.2.3 LTS, en `/Applications/Blender.app` por ahora (el usuario puede moverlo a un disco externo: preguntar la ruta). El Mac tiene poco espacio libre, unos 12 GB: las descargas van a `3d/fuentes/` (excluida de git), en la versión más liviana disponible, y lo que no se use se borra.
- **Comandos:**
  - `Blender -b -P 3d/scripts/piel.py -- 3d/fuentes/CuerpoCompleto.glb 3d/fuentes/busto.glb 3d/salida/piel.glb`
  - `Blender -b -P 3d/scripts/anatomia.py -- 3d/fuentes/bodyparts3d 3d/salida/piel.glb 3d/salida/esqueleto.glb`
  - `Blender -b -P 3d/scripts/preview.py -- <modelo.glb> 3d/salida/preview [<piel.glb>]` (con la piel, se compone translúcida encima)
  - `npm run modelos`: implantes, prototipo de cabeza y optimización (`3d/scripts/modelos.sh`; la ruta de Blender se cambia con `BLENDER`).

---

## 1. Qué se ve

Un cuerpo humano de vidrio, entero, con el esqueleto tenue adentro y seis implantes de titanio en su lugar anatómico. Es un mapa de dónde va cada implante, **no un paciente real**: ningún texto lo presenta como caso clínico.

### Capas

| Capa | Aspecto | Material (R3F) |
|---|---|---|
| Piel | Vidrio frío casi blanco, tirando al azul de marca, con brillo en los bordes. Maniquí de diseño, liso y sin pezones ni genitales, de pie y con los brazos algo separados del torso. Las imágenes de origen (`3d/fuentes/`) salieron con figura femenina: decidir si se mantiene. | `MeshTransmissionMaterial` (es el único: es caro). |
| Esqueleto | Completo, blanco lechoso y tenue, para que se lea como anatomía. | `MeshPhysicalMaterial` transparente, sin transmisión. |
| Implantes trabeculares (impresión 3D) | Titanio gris mate oscuro, poroso. | `MeshStandardMaterial`, metalness 1 y roughness alto. |
| Implantes de CNC | Titanio pulido. | `MeshStandardMaterial`, metalness 1 y roughness bajo. |

La diferencia entre el mate y el pulido es real (así salen las piezas de cada tecnología) y cuenta las dos fabricaciones de la planta sin texto.

Fondo: el gris de la página (`--color-surface`). Nada de los rosas ni violetas de la referencia (`docs/referencias/referenciaTranslucido.png`).

### Los seis implantes

Los lados son los del cuerpo: izquierdo es el izquierdo de la figura.

| # | Implante | Zona | Lado | Tecnología | Fuente en `content/` |
|---|---|---|---|---|---|
| 1 | Craneoplastía en titanio trabecular | Cráneo, parieto-temporal | Derecho | Impresión 3D | `customCases`: `craneoplastia-titanio` |
| 2 | Reconstrucción maxilar para anclaje dentario | Maxilar superior | Centro | Impresión 3D | `customCases`: `anclaje-dentario` |
| 3 | Prótesis modular reversa de hombro | Hombro | Derecho | CNC | `products`: `protesis-modular-reversa-hombro` |
| 4 | Reconstrucción acetabular trabecular | Pelvis | Derecha | Impresión 3D | `customCases`: `reconstruccion-acetabular` |
| 5 | Endoprótesis modular de fémur | Fémur proximal | Izquierdo | CNC | `products`: `endoprotesis-modular-femur-customizable` |
| 6 | Implante intercalar de fémur | Diáfisis femoral | Derecho | Impresión 3D | `featuredCase`: `implante-intercalar-femur` |

Restricciones que fijan los lados:
- El hero muestra la figura de perfil mirando a la derecha de la pantalla, así que se ve su lado **derecho**. Por eso la craneoplastía y el hombro van a la derecha: están a la vista desde la primera parada.
- El 5 y el 6 no pueden ir en el mismo fémur: el vástago de la endoprótesis ocupa la diáfisis.
- El 4 y el 6 conviven en el lado derecho: el clavo endomedular del intercalar entra por el fémur proximal, que conserva su cabeza.
- El 4 y el 5 quedan enfrentados en la pelvis: en una misma parada se ven la pieza a medida y la modular.

Fuera del cuerpo (piezas de PMMA, moldes o repetidas): craneoplastía en PMMA, espaciador con cotilo, corrección de desvío y el segundo implante acetabular poroso.

### Recorrido

| Parada | Encuadre | Implantes |
|---|---|---|
| 1. Inicio | Busto en 3/4, de perfil mirando a la derecha de la pantalla (el texto del hero queda a la izquierda). La cabeza gira despacio hacia el frente. | 1, y después 2 |
| 2. Hombro | La cámara baja por el lado derecho, que ya está a la vista. | 3 |
| 3. Cadera | De frente. | 4 y 5 |
| 4. Muslo | Plano medio del muslo derecho. | 6 |
| 5. Cierre | Cuerpo entero. | Los seis |

Cada parada lleva una etiqueta breve en HTML (no dentro del canvas), con el nombre del implante y un enlace a su ficha o a su caso. Los textos salen de `content/`.

---

## 2. Cómo se crea

No se modela a mano en una interfaz. **Todo se genera con scripts de Python para Blender (`bpy`) en modo sin interfaz**, versionados en el repo. Cada cambio es reproducible, y el resultado se revisa con renders de prueba que el script guarda como PNG.

### Herramientas

| Herramienta | Para qué | Estado |
|---|---|---|
| Blender (LTS vigente) | Importar, recortar, ajustar, generar implantes y exportar glTF. Se usa desde la terminal: `blender -b -P script.py`. | **Sin instalar.** `brew install --cask blender`. Anotar la versión usada en `3d/README.md`. |
| `@gltf-transform/cli` | Comprimir y optimizar los `.glb` (meshopt, deduplicación, cuantización). | Con `npx`, sin instalar global. |

### Origen de cada pieza

**Anatomía (esqueleto y piel): de atlas abiertos, no se inventa.**
- Esqueleto: **BodyParts3D 4.0** (DBCLS), **CC BY 4.0**, confirmado en la página oficial de la licencia (actualizada el 2025-02-27). Sin la cláusula "compartir igual" de las versiones anteriores. Los huesos vienen en milímetros reales y por separado, y el atlas trae también su piel, que sirve de referencia para el ajuste. Fuentes, archivos y comandos en `3d/README.md`.
  - Se descartó Z-Anatomy: deriva del mismo atlas, pero se distribuye como CC BY-SA 4.0 y solo como un `.blend` o FBX completo, mucho más pesado.
  - **Cómo se ajusta** (`anatomia.py`): se ajusta la piel del atlas a la nuestra y los huesos la siguen. Primero un ajuste articulado: tronco y cabeza con escala por eje, y cada segmento de los miembros girando sobre su articulación, en cadena. La mano se orienta por sus ejes principales, y el radio la acompaña en la pronación (el atlas tiene las palmas hacia adelante y la piel, hacia los muslos). Después, un ajuste fino que lleva a los huesos la diferencia suavizada entre las dos pieles; la cabeza y las manos quedan rígidas. Al final, lo que asome se mete adentro: el hueso entero si asoma más del 5 %, y si no, vértice por vértice.
  - Se descartan los huesos internos del cráneo (etmoides, vómer y cornetes), que no se ven desde afuera. Los huesos finos de la cara no se simplifican, porque se rompen en astillas.
- Piel, por orden de preferencia:
  1. **Un maniquí generado con IA y convertido a 3D.** Primero se genera una imagen de un maniquí opaco, de color arcilla, en pose A, con vista frontal y, si se puede, también de perfil. No se usa una imagen de vidrio: la transparencia confunde la reconstrucción, y el vidrio lo pone el material. Después una herramienta de imagen a 3D la convierte en un GLB u OBJ. Da la silueta de maniquí de diseño de la referencia, que un atlas no da. En Blender se remalla, se simplifica y se ajusta el esqueleto adentro, escalando por regiones. Si la cabeza sale con poco detalle, se genera un busto aparte y se injerta. Anotar en `3d/README.md` la herramienta y el plan usados, y confirmar que permite uso comercial.
     - **La IA se usa solo para la piel.** El esqueleto y los implantes nunca: el público son cirujanos, y los implantes tienen que ser los productos reales.
  2. La superficie corporal del mismo atlas, si la trae. Encaja con el esqueleto sin ajustes. Se suaviza (remallado por vóxeles y suavizado) hasta que quede como maniquí, sin detalle anatómico externo.
  3. Una figura de **MakeHuman** (sus exportaciones son CC0), escalada y alineada al esqueleto con puntos de referencia (coronilla, pelvis, rodillas, tobillos). Como la piel es de vidrio, un ajuste aproximado no se nota.

**Limpieza de la piel generada.** Se hizo con Tripo el 2026-10-29 y quedan dos archivos en `3d/fuentes/`: `CuerpoCompleto.glb` y `busto.glb`, de unos 2 millones de caras cada uno y sin textura. Las imágenes de control salen de `3d/scripts/preview.py`. Lo que hay que hacer, en orden:
1. **Simplificar** el cuerpo de unos 2 millones de caras a unas 40 000.
2. **Suavizar.** El 3D salió más marcado que las imágenes de ChatGPT, con abdominales, clavículas y facetas. Se busca el acabado redondeado de maniquí de las imágenes: remallado por vóxeles más suavizado, cuidando que no se pierdan los rasgos de la cara.
3. **Eliminar los pezones y la vulva**, que se ven mucho. Hay que dejar el pecho y la entrepierna lisos, como un maniquí de vidriera.
4. **Injertar la cara del busto.** La del cuerpo sale con los párpados rotos y la boca torcida, y la del busto está mucho mejor. Se conserva la nuca del cuerpo.
5. **Quitar el grumo de la coronilla**: un defecto de la reconstrucción en la parte de arriba y atrás de la cabeza.
6. **Escalar** a una altura humana real (unos 1,70 m). Tripo la entrega normalizada a 1 unidad de alto.

**Implantes: paramétricos, a partir de la ficha técnica y las fotos.** Cuando Innercare pase sus archivos CAD (STL o STEP), reemplazan a los generados sin tocar la escena (ver "Nombres", más abajo).

| # | Cómo se genera | Medidas |
|---|---|---|
| 1. Craneoplastía | Se recorta un parche de la superficie del cráneo en la zona parieto-temporal, se le da espesor (2 mm) y se remalla en triángulos. El modificador Wireframe de Blender da la malla triangular de la foto. Borde macizo con pestañas y agujeros para tornillos. | Estimadas, desde la foto. |
| 2. Maxilar | Curva que sigue el arco alveolar del maxilar, con perfil de placa calada, y postes verticales para los implantes dentarios. | Estimadas, desde la foto. |
| 3. Hombro | Glenosfera semiesférica con base porosa y tornillo central sobre la escápula. Componente humeral con vástago estriado, cuerpo con tornillo de fijación y cúpula con el inserto blanco. | **Sin datos.** Estimadas desde la foto: no publicarlas como medidas. |
| 4. Acetabular | Casquete semiesférico con ala superior de dos agujeros, exterior trabecular, agujeros interiores y tornillos hacia el ilíaco (en titanio, no en los colores de la captura). | Estimadas, desde la captura de diseño. |
| 5. Endoprótesis | Ensamble modular con las piezas de la ficha (`public/endoprotesis-modular-femur-innercare.pdf`): cuerpo principal de 60 mm a 135° con alas para sutura, un suplemento, vástago cementado (Ø11 × 140 mm), tornillo de cierre y cabeza con cono morse. Se corta el fémur izquierdo a la altura del ensamble y se borra la parte proximal. | Largos y ángulo, de la ficha. Diámetros del cuerpo y del suplemento, y diámetro de la cabeza: estimados. |
| 6. Intercalar | Se corta un segmento de la diáfisis del fémur derecho y se reemplaza por un tubo poroso con la forma del hueso. Clavo endomedular que sigue el canal, con los tornillos oblicuos. | Clavo Ø10 × 360 mm y tornillos Ø3,5 mm, de `featuredCase`. Largo del segmento: estimado. |

**Porosidad.** La geometría porosa real es pesada. Donde se ve el contorno (la malla de la craneoplastía) va en geometría. En superficies porosas (copa acetabular, intercalar, base de la glenosfera), textura de transparencia (`alphaMap` con `alphaTest`) más un mapa de normales.

**Escala.** Se trabaja en milímetros (los del atlas) y se exporta en metros, la convención de glTF.

### Nombres en el `.glb`

La escena asigna los materiales por nombre de malla. Así se ajusta el aspecto en el código sin reexportar, y una pieza CAD de Innercare reemplaza a la generada solo con respetar el nombre.

- `piel`
- `hueso_<nombre>` (por ejemplo `hueso_femur_izq`)
- `implante_craneoplastia`, `implante_maxilar`, `implante_hombro`, `implante_acetabular`, `implante_endoprotesis`, `implante_intercalar`
- Sufijo `_pulido` o `_trabecular` cuando una pieza combina las dos terminaciones.

### Archivos

```
3d/
  README.md          fuentes, versiones, licencias y comandos
  fuentes/           descargas del atlas (en .gitignore: pesan decenas de MB)
  scripts/
    piel.py          limpia la piel de Tripo: une busto y cuerpo, suaviza, borra
                     pezones y vulva, simplifica y exporta (hecho)
    anatomia.py      importa, selecciona huesos, simplifica, los ajusta a la piel y exporta
    implantes.py     genera los seis implantes y recorta los huesos que reemplazan
    preview.py       renders de control en PNG
  salida/            intermedios (en .gitignore)
public/modelos/
  anatomia.glb       piel y esqueleto, optimizados
  implantes.glb      los seis implantes, optimizados
```

`npm run modelos` corre los scripts y la optimización con `gltf-transform`.

**Anatomía e implantes van en archivos separados.** BodyParts3D es CC BY 4.0: no obliga a compartir las obras derivadas con la misma licencia, pero sí a atribuir. Separarlos mantiene claro qué deriva del atlas (la anatomía y los implantes hechos sobre sus superficies, como la craneoplastía o el intercalar) y qué no. El CAD que entregue Innercare **nunca se mezcla** en `anatomia.glb`.

### Presupuesto

Son objetivos de partida, a ajustar con la medición del primer prototipo.

- `anatomia.glb` ≤ 2 MB y `implantes.glb` ≤ 1 MB, comprimidos.
- Unos 200 000 triángulos en total. El esqueleto se simplifica fuerte: con el vidrio delante, el detalle fino no se ve.
- Compresión **meshopt**, no Draco: `useGLTF` trae el decodificador de meshopt, mientras que Draco descarga el suyo de un CDN de Google.

---

## 3. Cómo se integra en la web

### Componentes

```
components/hero-3d/
  hero-3d.tsx         envoltorio: carga diferida sin SSR, detección de WebGL,
                      respaldo, prefers-reduced-motion, visibilidad y medición
  body-scene.tsx      Canvas, luces (Lightformer), cámara, giro y PerformanceMonitor
  body-model.tsx      useGLTF de los dos .glb y asignación de materiales por nombre
  materials.tsx       vidrio (tres calidades), hueso y titanio trabecular
  stops.ts            paradas: posición y objetivo de la cámara, y giro de la figura (pendiente)
  use-scroll-progress.ts  (pendiente)
content/cuerpo3d.ts   etiqueta y enlace de cada parada (pendiente)
```

### Recorrido con scroll

- El hero se vuelve una sección alta, una pantalla por parada aproximadamente, con el canvas fijo (`position: sticky`). Después, la home sigue como está.
- El progreso sale de la posición de la sección en la página. En `useFrame` se interpola entre paradas con amortiguación (`MathUtils.damp`). **Sin librería** (ni GSAP ni `ScrollControls` de Drei, que crea su propio contenedor de scroll y pelea con el de la página).
- Con `prefers-reduced-motion`: sin giro automático ni interpolación. Cada parada se muestra fija y cambia de golpe.
- Fuera de pantalla no se renderiza (`frameloop="never"`, como hoy).

### Respaldo sin WebGL

- Antes de montar el canvas se comprueba que haya contexto WebGL, y el canvas va dentro de un límite de errores. Hecho con el prototipo de cabeza.
- La imagen fija (`public/img/cuerpo-inicio.webp`) es una captura del canvas en la pose inicial, con movimiento reducido. Se ve mientras carga el 3D, sin WebGL y si la escena falla, con `object-cover`: recorta los costados igual que la cámara, así el paso de la imagen al 3D no se nota. Hay que volver a capturarla cuando cambie el modelo o el encuadre.
- Con el recorrido, una imagen por parada (`public/img/cuerpo-<parada>.webp`).

### Accesibilidad

- El canvas lleva `role="img"` y una descripción que enumera los seis implantes.
- Las etiquetas de las paradas son HTML real: se leen, se indexan y se navegan con el teclado.

### Créditos

CC BY 4.0 exige atribución, con este texto: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International". Hay que decidir dónde va (pie de página o una página de créditos) y confirmarlo con Innercare.

---

## 4. Orden de trabajo

1. **Herramientas y fuentes.** Instalar Blender, descargar el atlas, confirmar las licencias y anotarlas en `3d/README.md`.
2. **Prototipo de cabeza, de punta a punta.** Cráneo, piel del busto y craneoplastía, pasando por todo el circuito: script, `.glb`, escena en el hero y materiales finales. Sirve para validar el aspecto y medir el rendimiento en un celular antes de escalar.
3. **Cuerpo entero y recorrido.** Esqueleto completo, piel y paradas con scroll, todavía sin el resto de los implantes.
4. **Los otros cinco implantes**, en este orden: endoprótesis (la de mejores datos), intercalar, acetabular, hombro y maxilar.
5. **Respaldo, accesibilidad y peso.** Renders de respaldo, comprobación sin WebGL y con movimiento reducido, y control del presupuesto.
6. **CAD de Innercare**, si llega: reemplazar las piezas generadas que correspondan.

Antes de escribir código de R3F, Drei o three.js: Context7 (ver `CLAUDE.md`).

## 5. Pendientes con Innercare

- Archivos CAD (STL o STEP) de los implantes. Innercare va a pasar los 3D originales (confirmado el 2026-10-29): hasta entonces, los implantes generados son bocetos hechos con la información disponible (fotos y fichas).
- Medidas del hombro, si no hay CAD.
- Visto bueno a la atribución de los atlas anatómicos en el sitio.
