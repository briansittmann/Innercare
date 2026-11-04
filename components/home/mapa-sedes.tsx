'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { PlantPhoto } from '@/components/plant-photo'
import type { SedeEnMapa, Tramo } from './mapa-layout'

// Capa interactiva del mapa de Distribución: las sedes (pin con radar,
// etiqueta con guía y card con la miniatura), las provincias que se tiñen
// con la sede activa, la línea que une las sedes de norte a sur y la luz que
// la recorre. El mapa estático viene del servidor como `children`
// (MapaArgentina) y ocupa el "lienzo", una caja con la proporción del
// viewBox a la izquierda de la columna; las etiquetas van en una columna a
// su derecha, sobre el mar. Pines y alturas van en fracciones (variables
// --x, --y, --yg, --k en cada sede) y el CSS las convierte con
// --ancho-lienzo y --paso, que cambian con el ancho de pantalla. Después
// del layout (ResizeObserver) se miden las guías del pin a la etiqueta, que
// se dibujan en píxeles, y --trazo, la escala del viewBox, para que los
// trazos del mapa tengan el mismo grosor en pantalla a cualquier tamaño.
//
// Sede activa (`data-activa` en su <li>): hover o foco en la etiqueta, o en
// el pin, con puntero; en táctil, tocar alterna; Escape y tocar fuera
// cierran. Al activarse aparece la card a la derecha del pin (puede tapar
// etiquetas: lo que importa es que se vea), la provincia se tiñe y la
// etiqueta pasa al primario.
//
// Entrada (`data-mapa`): sin atributo es el HTML del servidor (nada
// oculto); `espera`, montado y a la espera de entrar en pantalla;
// `dibujando`, primero el mapa (costa, límites y provincias), después cada
// pin de a uno, después los tramos de la línea uno tras otro (`--retraso`,
// `--duracion`) y al final la luz; `quieto`, movimiento reducido o la ruta
// volvió a mostrarse: todo en su estado final. El radar de los pines y la
// luz de la línea siguen en bucle y se pausan fuera de pantalla
// (`data-a-la-vista`). Tiempos y keyframes en globals.css (.mapa-*).

type EstadoMapa = 'espera' | 'dibujando' | 'quieto'
type Guia = { id: string; d: string; retraso: number }

const pct = (fraccion: number) => `${(fraccion * 100).toFixed(2)}%`

export function MapaSedes({
  nombre,
  sedes,
  provinciasConSede,
  tramos,
  linea,
  inicioLuz,
  viewBox,
  children,
}: {
  // Lo que anuncia el mapa a los lectores de pantalla
  nombre: string
  sedes: readonly SedeEnMapa[]
  provinciasConSede: readonly { id: string; d: string }[]
  tramos: readonly Tramo[]
  linea: string
  inicioLuz: number
  viewBox: { ancho: number; alto: number }
  children: ReactNode
}) {
  const raiz = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLDivElement>(null)
  const dibujado = useRef(false)
  const ultimoPuntero = useRef<string>('mouse')
  const [estado, setEstado] = useState<EstadoMapa>()
  const [activa, setActiva] = useState<string>()
  const [guias, setGuias] = useState<{ ancho: number; alto: number; lineas: Guia[] }>()
  const idBase = useId()

  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    if (dibujado.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEstado('quieto')
      return
    }
    setEstado('espera')
    // Dispara cuando el borde superior del mapa pasa el 80 % de la ventana
    // (como LecturaHabilitaciones y AnimatedContent)
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return
        observador.disconnect()
        dibujado.current = true
        setEstado('dibujando')
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  // Radar y luz en bucle: solo mientras el mapa está a la vista
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const observador = new IntersectionObserver((entradas) => {
      const visible = entradas.some((e) => e.isIntersecting)
      el.toggleAttribute('data-a-la-vista', visible)
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  // Guías del pin a su etiqueta y escala de los trazos, medidas sobre el
  // layout real
  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const medir = () => {
      const caja = el.getBoundingClientRect()
      const anchoLienzo = lienzo.current?.getBoundingClientRect().width
      if (anchoLienzo) el.style.setProperty('--trazo', (viewBox.ancho / anchoLienzo).toFixed(3))
      const lineas: Guia[] = []
      for (const li of el.querySelectorAll<HTMLElement>('.mapa-sede')) {
        const pin = li.querySelector('.mapa-pin')?.getBoundingClientRect()
        const etiqueta = li.querySelector('.mapa-etiqueta')?.getBoundingClientRect()
        if (!pin || !etiqueta) continue
        const x0 = pin.x + pin.width / 2 - caja.x
        const y0 = pin.y + pin.height / 2 - caja.y
        const x1 = etiqueta.x - caja.x
        const y1 = etiqueta.y + etiqueta.height / 2 - caja.y
        lineas.push({
          id: li.dataset.sede ?? '',
          retraso: Number(li.dataset.retraso ?? 0),
          d: `M${x0.toFixed(1)} ${y0.toFixed(1)}L${(x1 - 10).toFixed(1)} ${y1.toFixed(1)}H${(x1 - 4).toFixed(1)}`,
        })
      }
      setGuias({ ancho: caja.width, alto: caja.height, lineas })
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [sedes, viewBox.ancho])

  // Tocar fuera cierra la card abierta en táctil
  useEffect(() => {
    if (!activa) return
    const cerrar = (e: globalThis.PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setActiva(undefined)
    }
    document.addEventListener('pointerdown', cerrar)
    return () => document.removeEventListener('pointerdown', cerrar)
  }, [activa])

  const entrar = (id: string) => (e: PointerEvent) => {
    if (e.pointerType !== 'touch') setActiva(id)
  }
  const salir = (id: string) => (e: PointerEvent) => {
    if (e.pointerType !== 'touch') setActiva((actual) => (actual === id ? undefined : actual))
  }
  const alternar = (id: string) => setActiva((actual) => (actual === id ? undefined : id))

  const provinciaActiva = sedes.find((s) => s.id === activa)?.provinciaId

  return (
    <div
      ref={raiz}
      data-mapa={estado}
      role="group"
      aria-label={nombre}
      className="mapa relative isolate"
    >
      <div
        ref={lienzo}
        className="relative"
        style={{ width: 'var(--ancho-lienzo)', aspectRatio: `${viewBox.ancho} / ${viewBox.alto}` }}
      >
        {children}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${viewBox.ancho} ${viewBox.alto}`}
        >
          {provinciasConSede.map((p) => (
            <path
              key={p.id}
              className="mapa-provincia-activa"
              data-encendida={p.id === provinciaActiva ? '' : undefined}
              d={p.d}
            />
          ))}
          {tramos.map((t) => (
            <path
              key={t.d}
              className="mapa-tramo"
              d={t.d}
              pathLength={1}
              style={{ '--retraso': `${t.retraso}ms`, '--duracion': `${t.duracion}ms` } as CSSProperties}
            />
          ))}
          {/* La luz que recorre la línea: un halo ancho y tenue y un núcleo
              fino, los dos con el mismo tramo de guiones */}
          <g style={{ '--inicio-luz': `${inicioLuz}ms` } as CSSProperties}>
            <path className="mapa-luz mapa-luz-halo" d={linea} pathLength={1} />
            <path className="mapa-luz" d={linea} pathLength={1} />
          </g>
        </svg>
      </div>

      {guias && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${guias.ancho} ${guias.alto}`}
          preserveAspectRatio="none"
        >
          {guias.lineas.map((g) => (
            <path
              key={g.id}
              className="mapa-guia"
              style={{ '--retraso': `${g.retraso}ms` } as CSSProperties}
              d={g.d}
            />
          ))}
        </svg>
      )}

      <ul>
        {sedes.map((s) => {
          const idCard = `${idBase}-${s.id}`
          const abierta = activa === s.id
          return (
            <li
              key={s.id}
              data-sede={s.id}
              data-retraso={s.retraso}
              data-activa={abierta ? '' : undefined}
              className="mapa-sede"
              style={
                {
                  '--x': s.x,
                  '--y': pct(s.y),
                  '--yg': pct(s.yGrupo),
                  '--k': s.k,
                  '--retraso': `${s.retraso}ms`,
                } as CSSProperties
              }
              onPointerEnter={entrar(s.id)}
              onPointerLeave={salir(s.id)}
            >
              <span aria-hidden className="mapa-pin" />
              <button
                type="button"
                className="mapa-etiqueta"
                aria-label={`${s.rol}, ${s.ciudad}, ${s.provincia}`}
                aria-expanded={abierta}
                aria-describedby={idCard}
                onPointerDown={(e) => {
                  ultimoPuntero.current = e.pointerType
                }}
                onClick={(e) => {
                  // Con mouse, el hover ya la abrió: el clic no la cierra.
                  // Teclado (detail 0) y táctil alternan.
                  if (e.detail > 0 && ultimoPuntero.current === 'mouse') return
                  alternar(s.id)
                }}
                onFocus={() => setActiva(s.id)}
                onBlur={() => setActiva((actual) => (actual === s.id ? undefined : actual))}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setActiva(undefined)
                }}
              >
                {s.ciudad}, {s.provincia}
                <span className="mt-[2px] block text-body-sm font-normal text-on-surface-variant">{s.rol}</span>
              </button>
              <div id={idCard} role="tooltip" className="mapa-globo">
                <PlantPhoto src={s.foto.src} alt={s.foto.alt} sizes="12rem" className="aspect-[16/10] rounded-lg" />
                <p className="mt-sm text-body-sm leading-[1.35] text-on-surface">
                  {s.tipo}
                  <span className="block text-on-surface-variant">
                    {s.calle}, {s.ciudad}
                  </span>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
