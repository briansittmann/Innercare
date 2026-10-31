# Arquitectura del modelo 3D

Cómo se construye y se muestra el cuerpo translúcido de la home: qué se ve, de dónde sale cada pieza, cómo se genera y cómo se integra en la web. Las decisiones con su motivo están en `DECISIONES.md`.

**Estado al 2026-10-31: un solo cuerpo, del hero al cierre del recorrido** (cuerpo único, sección 3, "Cuerpo único"). Lo que sigue en esta lista es la historia en orden: el busto del hero y `cabeza.glb` ya no existen.
- **Hecho:** la piel. `3d/scripts/piel.py` genera `3d/salida/piel.glb`: maniquí de 1,70 m, unas 110 000 caras y 2,2 MB, sin pezones ni vulva, con la cara del busto. Imágenes de control en `3d/salida/preview/`, generadas con `preview.py`.
- **Hecho:** el esqueleto. `3d/scripts/anatomia.py` genera `3d/salida/esqueleto.glb`: 263 huesos de BodyParts3D 4.0 (CC BY 4.0) con dientes, ajustados dentro de la piel y unidos en 25 mallas `hueso_<zona>`. Son unas 117 000 caras y 2,5 MB sin comprimir. Imágenes en `3d/salida/preview/esqueleto/` (solo huesos) y `esqueleto-piel/` (con la piel translúcida encima).
- **Hecho y reemplazado:** el prototipo de cabeza (orden de trabajo, punto 2). El busto (`cabeza.py`, `cabeza.glb`, `components/hero-3d/`) se borró en la fase 5 del cuerpo único; sus valores (cámara, vidrio, titanio, giro, encuadre) viven en la toma del hero de la escena única.
  - `3d/scripts/implantes.py` genera la craneoplastía (`salida/implantes.glb`, unas 5 000 caras) y recorta el cráneo debajo (`salida/anatomia.glb`: piel y esqueleto con los recortes). `3d/scripts/cabeza.py` recorta el busto (`salida/cabeza.glb`). `npm run modelos` corre los dos y los optimiza a `public/modelos/`: `cabeza.glb` (425 KB, 334 KB transferidos con gzip) e `implantes.glb` (73 KB). Son unos 87 000 triángulos.
  - En el hero (`components/hero-3d/`): materiales finales por nombre de malla, parada 1 con giro lento de 3/4 de perfil hacia el frente y vuelta, detección de WebGL con imágenes de respaldo (`public/img/cuerpo-inicio.webp` y `cuerpo-inicio-movil.webp`), carga diferida, sin render fuera de pantalla y sin giro con `prefers-reduced-motion`.
  - El degradé azul ocupa todo el hero y el canvas es transparente, sin panel (sección 3, "Fondo y encuadre").
  - Medición en escritorio (Apple M1, 1440 × 900, dpr 1,5): 60 fps con el vidrio medio, sin que baje la resolución; sin tope de cuadros, unos 70 fps (con el panel y 6 muestras eran 73). En el build de producción, el 3D queda listo a 0,6 s del montaje (1 s de la navegación, medido con la máquina cargada; antes se había medido 0,6 s de la navegación), con 450 KB de JS en la home. Con el hero visible hay unos 12 dibujos por cuadro; fuera de pantalla, ninguno.
  - El vidrio dibuja lo que tiene detrás en un buffer propio con MSAA (`useGlassBuffer`, hoy en `components/recorrido-3d/materiales.tsx`): el de Drei no tiene antialiasing y la malla se dentaba. La resolución arranca en la de la pantalla, hasta 1,5x, y solo baja si faltan cuadros, sin volver a subir. Las tres calidades se ven igual: solo cambian las muestras de la refracción (10, 4 y 3; la media, la de siempre, tenía 6).
  - Para medir había parámetros en la home (`?medir`, `?calidad`, `?hueso`, `?fondo`, `?fibras`); se quitaron en la fase 5 del cuerpo único. Hoy se mide desde afuera, con los scripts de `docs/landing/cuerpo-unico/` (`base/medir.mjs`: capturas, fps y contextos).
- **Hecho (2026-10-30, fase 3 de la landing):** el cuerpo entero en el recorrido de la home (`#recorrido`, `components/recorrido-3d/`). `npm run modelos` optimiza `salida/anatomia.glb` a `public/modelos/cuerpo.glb` (918 KB, 695 KB transferidos con gzip; unos 177 000 triángulos). La craneoplastía es la real; los otros cinco implantes son primitivas detrás de `components/recorrido-3d/implantes.ts`, cuyo contrato explica cómo reemplazarlas. Detalle en `docs/landing/BITACORA.md`.
- **Hecho (2026-10-30, fase 4 de la landing):** los otros cinco implantes, generados en `implantes.py` (maxilar, hombro reverso, acetábulo, endoprótesis de fémur e intercalar de fémur), con los huesos que reemplazan recortados. Van en `public/modelos/implantes-recorrido.glb` (313 KB, 195 KB con gzip; unos 41 000 triángulos) y el cuerpo recortado en `cuerpo.glb` (902 KB). El hero no cambia: `cabeza.glb` e `implantes.glb` salen igual que antes (la craneoplastía sola y el esqueleto con el recorte del cráneo). Renders de control en `3d/salida/preview/implantes/`. Detalle y medidas estimadas en `docs/landing/BITACORA.md`.
- **Hecho (2026-10-31, cuerpo único, fase 2):** el cuerpo va partido en dos archivos, `cuerpo-cabeza.glb` (lo que se ve en la toma del hero: 381 KB, 306 KB con gzip) y `cuerpo-resto.glb` (595 KB), en lugar de `cuerpo.glb` (970 KB). La piel va en tres mallas por altura y la columna en dos (ver "Nombres"), con los mismos triángulos, vértices cuantizados, normales y nodo que las mallas enteras: lo hace `3d/scripts/partir.mjs` después de `optimize`, y `npm run modelos` lo comprueba valor por valor. El primer pantallazo del cuerpo único (cabeza del cuerpo y craneoplastía) pesa 454 KB, menos que el del busto (498 KB). Detalle y motivos en `docs/landing/BITACORA.md`, "Cuerpo único, fase 2".
- **Hecho (2026-10-31, cuerpo único, fases 0 a 5):** el busto y el cuerpo del recorrido son un solo modelo en un solo canvas; el hero es la toma 0 de la escena fija del recorrido, con el aspecto del busto. Dos contextos WebGL (la escena y las fibras). Detalle en la sección 3, "Cuerpo único", y en `docs/landing/cuerpo-unico/ESTADO.md`.
- **Siguiente:** medir en un celular real la escena única (hoy medida solo en escritorio y con emulación de celular). En el celular la resolución tope es 1,5x (`DPR_CELULAR` en `recorrido-3d.tsx`) y el vidrio va en calidad baja; `PerformanceMonitor` solo baja la resolución mientras el hero anima (con dibujo a demanda no recibe cuadros seguidos). Ese día, con el build de producción en la red local, ajustar la calidad por defecto, la transmisión, la opacidad del hueso y la resolución de las fibras en el celular (hoy 1x por precaución). Para abrirlo desde el teléfono, el firewall de macOS tiene que dejar entrar conexiones a Node.
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
  - `npm run modelos`: implantes, optimización y partición del cuerpo (`3d/scripts/modelos.sh` y `partir.mjs`; la ruta de Blender se cambia con `BLENDER`).

---

## 1. Qué se ve

Un cuerpo humano de vidrio, entero, con el esqueleto tenue adentro y seis implantes de titanio en su lugar anatómico. Es un mapa de dónde va cada implante, **no un paciente real**: ningún texto lo presenta como caso clínico.

### Capas

| Capa | Aspecto | Material (R3F) |
|---|---|---|
| Piel | Vidrio celeste, más azul donde es más grueso (atenuación), con brillo blanco en los bordes. Maniquí de diseño, liso y sin pezones ni genitales, de pie y con los brazos algo separados del torso. Las imágenes de origen (`3d/fuentes/`) salieron con figura femenina: decidir si se mantiene. | `MeshTransmissionMaterial` (es el único: es caro). |
| Esqueleto | Completo, blanco lechoso y tenue, para que se lea como anatomía. | `MeshPhysicalMaterial` transparente, sin transmisión. |
| Implantes trabeculares (impresión 3D) | Titanio gris mate oscuro, poroso. | `MeshStandardMaterial`, metalness 1 y roughness alto. |
| Implantes de CNC | Titanio pulido. | `MeshStandardMaterial`, metalness 1 y roughness bajo. |

La diferencia entre el mate y el pulido es real (así salen las piezas de cada tecnología) y cuenta las dos fabricaciones de la planta sin texto.

Fondo: el degradé vertical de azules de la marca (`--color-stage-from` a `--color-stage-to`) detrás de todo el cuerpo, del hero al cierre del recorrido, y el vidrio refracta lo mismo que se ve alrededor (sección 3, "Fondo y encuadre"). Al principio iba en un panel `rounded-xl` y después en el hero solo. Nada de los rosas ni violetas de la referencia (`docs/referencias/referenciaTranslucido.png`); sí su vidrio celeste con brillo blanco en los bordes (decidido el 2026-10-29, ver `DECISIONES.md`).

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

Así quedó: el recorrido sigue el guion del borrador, con el hero como toma 0, seis paradas (una por implante: cráneo, maxilar, hombro, acetábulo, fémur proximal y diáfisis) y el cierre con el cuerpo entero (`components/recorrido-3d/camara.ts`). Las tarjetas son las de `content/recorrido.ts`.

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

- `piel` en los intermedios de Blender (`3d/salida/`). En la web va partida por caras completas según la altura de su vértice más alto: `piel_cabeza` (lo que llega arriba de 1,33 m, el corte del busto), `piel_torso` (hasta 0,68 m, debajo de la punta de los dedos, para que la junta no cruce las manos) y `piel_piernas`. Las tres comparten el nodo de la piel entera (la escala de la cuantización, de la que depende el espesor del vidrio) y la junta es estanca: los vértices de los dos lados son los mismos valores. La escena las trata como una sola (el buffer del vidrio oculta el grupo) y, en el cuerpo único, oculta las que quedan enteras debajo del corte.
- `hueso_<nombre>` (por ejemplo `hueso_femur_izq`)
- `hueso_maxilar_entero`: copia del maxilar antes del recorte del implante (`implantes.py`): en el hero y la craneoplastía el maxilar se ve entero, como en el busto, y se funde con el recortado al llegar a su parada.
- `hueso_columna` en Blender; en la web, `hueso_columna_alta` (las vértebras y discos con el centro arriba de 1,35 m, las del busto de antes) y `hueso_columna_baja`.
- `implante_craneoplastia` (en `implantes.glb`: es la pieza de la toma del hero y va en el primer pantallazo) y, en `implantes-recorrido.glb`, `implante_<parada>` con el id de la parada de `content/recorrido.ts`: `implante_maxilar`, `implante_hombro`, `implante_acetabulo`, `implante_femur` (la endoprótesis) e `implante_intercalar`
- Sufijo `_pulido` o `_trabecular` cuando una pieza combina las dos terminaciones. Hoy cada implante es una sola malla con un solo acabado (`implantes.ts`): la base porosa de la glenosfera y el inserto del hombro van pulidos como el resto.

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
    modelos.sh       npm run modelos: implantes.py, optimización y partición
    partir.mjs       parte y verifica el cuerpo (gltf-transform --config)
    preview.py       renders de control en PNG
  salida/            intermedios (en .gitignore)
public/modelos/
  implantes.glb      la craneoplastía (toma del hero y capa de implantes)
  cuerpo-cabeza.glb  lo del cuerpo que entra en el hero: piel_cabeza, cráneo, maxilar
                     entero, mandíbula y columna alta (CUERPO.hero en implantes.ts)
  cuerpo-resto.glb   el resto de la piel y del esqueleto, con los recortes de los
                     seis implantes (el recorrido carga los dos)
  implantes-recorrido.glb  los otros cinco implantes (recorrido)
```

`3d/scripts/partir.mjs` (comandos propios de la CLI de gltf-transform, con `--config`) parte el cuerpo: `optimize --compress false` lo simplifica, `partir` lo cuantiza y comprime con meshopt como `optimize --compress meshopt` y, antes de escribir, separa la piel, la columna y los dos archivos copiando los valores ya cuantizados; `verificar` compara el resultado con el cuerpo comprimido entero. No se parte en Blender: `optimize` simplifica cada malla con un error relativo a su tamaño y la cuantiza en su propia grilla, así que partida antes la piel quedaba en 108 000 triángulos en lugar de 62 000 (1,17 MB) y con la junta en dos grillas distintas. Tampoco se parte el archivo ya comprimido: volver a comprimir pasa otra vez las normales por el filtro octaédrico de meshopt y corre unas 3900.

`npm run modelos` corre los scripts y la optimización con `gltf-transform`.

**Anatomía e implantes van en archivos separados.** BodyParts3D es CC BY 4.0: no obliga a compartir las obras derivadas con la misma licencia, pero sí a atribuir. Separarlos mantiene claro qué deriva del atlas (la anatomía y los implantes hechos sobre sus superficies, como la craneoplastía o el intercalar) y qué no. El CAD que entregue Innercare **nunca se mezcla** en los archivos del cuerpo (`cuerpo-*.glb`).

### Presupuesto

Son objetivos de partida, a ajustar con la medición del primer prototipo.

- El cuerpo (`cuerpo-cabeza.glb` + `cuerpo-resto.glb`) ≤ 2 MB y los implantes ≤ 1 MB, comprimidos. Hoy: 976 KB y 386 KB. El primer pantallazo (`cuerpo-cabeza.glb` + `implantes.glb`), 454 KB.
- Unos 200 000 triángulos en total. El esqueleto se simplifica fuerte: con el vidrio delante, el detalle fino no se ve.
- Compresión **meshopt**, no Draco: `useGLTF` trae el decodificador de meshopt, mientras que Draco descarga el suyo de un CDN de Google.

---

## 3. Cómo se integra en la web

### Componentes

```
components/recorrido-3d/      el único 3D de la home
  camara.ts         guion sin three: tomas (HERO, seis paradas, cierre), pesos,
                    opacidades, desliz del hero en el celular, giro del busto
  estado.ts         progreso compartido con el HTML (seg, reducido, celular,
                    entrada, invalidar), sin re-renderizar React
  recorrido-3d.tsx  montaje (carga diferida sin SSR), detección de WebGL, límite
                    de errores, resolución y arranque de la intro
  escena.tsx        Canvas, cámara, cuerpo, craneoplastía del hero, implantes,
                    pasadas, estudio de luz y PerformanceMonitor
  aspecto-hero.ts   aspecto del busto en la toma del hero: vidrio, titanio, hueso,
                    corte por altura (corteY) y textura del degradé
  materiales.tsx    buffer del vidrio (useGlassBuffer) y hueso
  implantes.ts      contrato de los seis implantes y de los dos archivos del cuerpo
  miniaturas.tsx    vistas de drei en las tarjetas (partículas que arman la pieza)
components/home/tour-scroll.tsx  escena fija, scroll, texto del hero, fibras,
                    tarjetas, índice y lugar reservado
```

### Cuerpo único: del hero al recorrido

El hero es la toma 0 de la escena del recorrido. Con el scroll, el texto del hero se va, la cámara sube hasta la craneoplastía y desde ahí sigue el recorrido, con el mismo modelo. La regla que mandó: el cuadro 0 tiene que ser indistinguible del busto de antes (verificado, `docs/landing/cuerpo-unico/ESTADO.md`).

- **Archivos y mallas.** `cuerpo-cabeza.glb` (381 KB: `piel_cabeza`, `hueso_craneo`, `hueso_maxilar_entero`, `hueso_mandibula`, `hueso_columna_alta`; `CUERPO.mallasHero` en `implantes.ts`) y `cuerpo-resto.glb` (595 KB: el resto de la piel y del esqueleto, con el maxilar recortado). La escena busca cada malla por nombre en los dos. La craneoplastía sigue sola en `implantes.glb` (73 KB) y los otros cinco en `implantes-recorrido.glb` (313 KB).
- **Carga en dos tiempos.** La escena se monta apenas el navegador queda libre (como mucho, 1,5 s) con `cuerpo-cabeza.glb` e `implantes.glb`, que se piden al cargar el módulo; arranca la intro al tener dos cuadros dibujados, o a los 2,5 s. `cuerpo-resto.glb`, `implantes-recorrido.glb` y las miniaturas se piden cuando la intro terminó: hasta que llegan, sigue el cuerpo del hero como `fallback` del Suspense (lo que falta queda debajo del corte, así que la toma no cambia).
- **Toma del hero** (`HERO` en `camara.ts`). La cámara del busto (0,92 m, fov 30°, a 0,02 m de altura, el busto girado 62°) pasada al cuerpo quieto: objetivo [0, 1,56, 0], azimut −62°, elevación 0,0217 rad, distancia fija de 0,92 m (el fov sale de ella). Escritorio: ancla [0,740, 0,5] y estiramiento horizontal de 1,11 (el del busto, que tomaba el aspecto del canvas antes de correr la figura). Celular: ancla [0,5, 1,092], la cabeza debajo de la primera pantalla; durante las primeras 0,4 pantallas la toma se desliza hacia arriba con el texto, las fibras y el degradé (`deslizHero`), y recién después la cámara va a la craneoplastía (`segCuerpo`). Entre tomas la distancia se interpola en escala logarítmica.
- **Giro.** La entrada del busto (+55° y 2,5 cm más abajo, 2,6 s con cúbica de salida; estados hold, play y skip en `estadoRecorrido.entrada`) y su vaivén (62° a 22° y vuelta cada 22 s) son giros de la cámara alrededor de la cabeza, a cada cuadro, multiplicados por el peso del hero. El estudio de luz gira con la cámara (`scene.environmentRotation`): en el busto la luz quedaba quieta respecto de la cámara.
- **Aspecto** (`aspecto-hero.ts`). Con el peso del hero (`pesoHero`: 1 en la toma 0 y 0 desde la craneoplastía, con la curva de la cámara del primer tramo), el vidrio pasa de `VIDRIO_HERO` a `VIDRIO_RECORRIDO`, el hueso de 0,4 a 0,34 y el borde fresnel de 0 a 0,85. El espesor del vidrio va en metros del mundo (meshopt guarda la cuantización en la escala del nodo: la piel del busto tenía 0,2117 y la del cuerpo 0,8496). En el hero se ven solo los huesos del busto; la craneoplastía va con el titanio del busto dentro del vidrio (capa 0, refractada) y le cede el lugar a la de la capa de implantes en un cruce corto (peso del hero de 0,56 a 0,44).
- **Corte por altura (`corteY`).** Un desvanecido inyectado en los materiales (piel, hueso y borde) sin pisar el `onBeforeCompile` del vidrio de drei. En la toma del hero, la piel se corta a 1,33 m y el hueso a 1,35 m con una banda de 4 mm; en materiales opacos el corte es recto (`discard`, sin tocar el alfa: con alfa menor que 1 el canvas premultiplicado aclaraba el borde hasta el blanco). Con el scroll baja hasta −0,4 m y la banda llega a 40 cm. Los trozos de piel que quedan enteros debajo del corte no se dibujan.
- **Maxilar.** `hueso_maxilar_entero` pesa 1 − m y `hueso_maxilar` (el recortado) (1 − h) × m, con m = `pesoMaxilar` (0 hasta seg 1,4 y 1 desde 1,78). El implante maxilar, su brillo y su halo se multiplican por m.
- **Rendimiento.** Con la toma del hero entera y sin miniaturas a la vista, la escena dibuja solo en la caja que ocupaba el busto (`recorteHero`: tijera en la pasada principal y en el buffer del vidrio), una sola pasada. El vidrio es transparente solo mientras el corte baja (peso del hero entre 0,001 y 0,999); en el hero entero y desde la craneoplastía es opaco, así la prueba de profundidad descarta el esqueleto de atrás (transparente todo el recorrido, el escritorio caía a 52 fps). Las fibras del hero se pausan cuando terminan de irse (`display: none` en su capa).
- **Mediciones** (Chrome sin interfaz con la GPU del M1, alternando con la base): tabla en `docs/landing/cuerpo-unico/ESTADO.md`.

### Fondo y encuadre

- El degradé vertical de azules (`--color-stage-from` a `--color-stage-to`) es el fondo CSS de la escena fija entera (`.recorrido-escena`), que sube por detrás del header. Al final del cierre se funde en el gris de "Cómo trabajamos" (`.recorrido-fundido`). En el celular (menos de 768 px) mide el 140,2 % de la escena, el alto que tenía el hero como sección, y sube con el desliz (`--desliz`). El canvas es transparente.
- El vidrio refracta un buffer propio (`useGlassBuffer`), que se dibuja con `scene.background` puesto y lo quita al terminar. Ese fondo es una textura con el mismo degradé (`useTexturaDegrade` en `aspecto-hero.ts`); en el celular, el tramo de 0 a 1/1,402, repintado con el desliz. Los colores se repiten en `STAGE_FROM` y `STAGE_TO`: si cambian en `globals.css`, cambian ahí también.
- La cámara sale del guion (`camaraPara`): mira al objetivo desde su azimut y elevación, a la distancia que hace entrar `alto` metros en la pantalla, y con `setViewOffset` deja el objetivo en el ancla (la pantalla es un recorte de una vista más grande centrada en él: la perspectiva no cambia). `camera.manual` evita que R3F pise el aspecto.
- Historia del encuadre del busto (de donde salen los valores de `HERO` y la caja de `recorteHero`): el canvas iba abajo a la derecha, con 14/15 de su alto de ancho y el alto del hero, como máximo 80vw, y la figura al 55,5 % del ancho; en el celular, debajo del texto, al 62 % del alto de la pantalla. El área del canvas pesaba (MSAA, limpieza y la pasada de fondo del buffer): por eso la escena única dibuja solo esa caja mientras se ve el hero.

### Recorrido con scroll

- La sección del hero y del recorrido mide ocho pantallas, con la escena fija (`position: sticky`). Después, la home sigue como está.
- El progreso sale de la posición de la sección en la página (`tour-scroll.tsx`), con una amortiguación exponencial corta, y lo comparten la escena y el HTML (`estado.ts`). **Sin librería** (ni GSAP ni `ScrollControls` de Drei, que crea su propio contenedor de scroll y pelea con el de la página).
- El canvas dibuja a demanda (`frameloop="demand"`): cuando cambia el progreso, a cada cuadro en la toma del hero (entrada y vaivén) y a 30 cuadros en las paradas (vaivén leve). Fuera de pantalla, `never`.
- Con `prefers-reduced-motion`: sin giro automático ni interpolación. Cada toma se muestra fija y cambia de golpe en la mitad del tramo, a la par de las tarjetas.

### Respaldo sin WebGL

- Antes de montar el canvas se comprueba que haya contexto WebGL (y se libera el de la prueba), y el canvas va dentro de un límite de errores.
- Toma del hero: `public/img/cuerpo-inicio.webp` (escritorio, 960 × 900 px CSS a 1,5x) y `cuerpo-inicio-movil.webp` (celular, 720 × 523 a 2x), capturas del busto de antes en la pose inicial (movimiento reducido), con fondo transparente y la figura centrada. Van en la caja que tenía el busto (`VistaHero` en `components/home/tour.tsx`) y entran con la intro (`.intro-3d`). Sin JS se ven en lugar del 3D.
- **Siguen coincidiendo con la toma 0**: la escena única da la misma imagen que el busto (diferencia media de 1 a 2,6 sobre 255, sin corrimiento, contra las capturas de la base), así que no hace falta recapturarlas mientras no cambie la toma del hero. Si cambia: capturar la escena en seg 0 con movimiento reducido y `omitBackground`, con todo lo que no es el canvas oculto, y pasarla a WebP con `cwebp -q 82 -alpha_q 90`. Ojo: con la toma del hero entera la escena dibuja solo la caja del busto (`recorteHero`), y las capturas son más anchas que esa caja, así que para recapturarlas hay que desactivar el recorte en un build local. Borrar `.next/dev/cache/images` después, porque el optimizador de imágenes de desarrollo sirve la versión anterior.
- Paradas: las vistas de planificación de cada una (fotos de `content/recorrido.ts`). Cierre: `public/img/cuerpo-entero.webp`, una captura del cuerpo con los implantes en la antigua toma de entrada (azimut −0,42; el cierre está a −0,30), con el aspecto del recorrido.
- Pendiente: una imagen por parada (`public/img/cuerpo-<parada>.webp`).

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
