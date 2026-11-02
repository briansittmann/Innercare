'use client'

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { CifraGenerada } from '@/components/cifra-generada'
import type { Habilitacion } from '@/content/types'

// Lectura del registro: la tabla de habilitaciones se lee una sola vez al
// llegar con el scroll. Una línea de luz baja por la tabla (como el corte de
// luz que recorre el implante activo en el recorrido) y, a su paso, cada fila
// aparece, su divisoria se dibuja de izquierda a derecha y los dígitos de la
// referencia se resuelven (CifraGenerada). El CSS está en globals.css
// (.lectura, .lectura-fila, .lectura-barrido, .cifra).
//
// `data-lectura` lleva el estado:
// - sin atributo: HTML del servidor. Sin JS no se oculta nada; con JS, las
//   filas se ocultan hasta que el componente toma el control (y si el JS no
//   llega, aparecen solas).
// - espera: montado, filas ocultas hasta que la tabla entra en pantalla.
// - leyendo: el barrido en marcha; cada fila lleva su --retraso (cuándo la
//   alcanza la línea, en proporción a su altura en la tabla).
// - quieta: movimiento reducido, o la ruta volvió a mostrarse (Cache
//   Components la conserva con <Activity> y repite los efectos): todo
//   visible, sin barrido.

// Lo que tarda la línea en bajar por la tabla entera, en ms
export const DURACION_BARRIDO = 1400
// Desde que la línea alcanza la fila hasta que sus dígitos empiezan a
// resolverse
const DEMORA_CIFRA = 200

type Lectura = 'espera' | 'leyendo' | 'quieta'

// Bajo cada habilitación, quién la otorga (borrador): la ANMAT, o la
// inscripción en el sistema de trazabilidad.
const otorga = (organismo: Habilitacion['organismo']) => (organismo === 'ANMAT' ? 'ANMAT' : 'Inscripción')

export function LecturaHabilitaciones({ habilitaciones }: { habilitaciones: readonly Habilitacion[] }) {
  const lista = useRef<HTMLDListElement>(null)
  const leida = useRef(false)
  const [lectura, setLectura] = useState<Lectura>()
  const [retrasos, setRetrasos] = useState<number[]>([])

  useLayoutEffect(() => {
    const dl = lista.current
    if (!dl) return
    if (leida.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLectura('quieta')
      return
    }
    setLectura('espera')

    // Dispara cuando el borde superior de la tabla pasa el 80 % de la
    // ventana (como FoldText y AnimatedContent)
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return
        observador.disconnect()
        const alto = dl.offsetHeight || 1
        const filas = Array.from(dl.querySelectorAll<HTMLElement>('.lectura-fila'))
        setRetrasos(filas.map((fila) => Math.round((fila.offsetTop / alto) * DURACION_BARRIDO)))
        leida.current = true
        setLectura('leyendo')
      },
      { rootMargin: '0px 0px -20% 0px' },
    )
    observador.observe(dl)
    return () => observador.disconnect()
  }, [])

  const leyendo = lectura === 'leyendo'

  return (
    <dl
      ref={lista}
      data-lectura={lectura}
      className="lectura relative"
      style={{ '--duracion': `${DURACION_BARRIDO}ms` } as CSSProperties}
    >
      {habilitaciones.map((habilitacion, i) => {
        const retraso = retrasos[i] ?? 0
        return (
          <div
            key={habilitacion.id}
            className="lectura-fila relative grid gap-x-lg gap-y-[0.375rem] py-[1.25rem] md:grid-cols-[minmax(0,1fr)_auto]"
            style={{ '--retraso': `${retraso}ms` } as CSSProperties}
          >
            <dt className="text-[1.09375rem] font-medium text-on-surface">
              {habilitacion.detalle}
              <small className="mt-[2px] block text-body-sm font-normal text-on-surface-variant">
                {otorga(habilitacion.organismo)}
              </small>
            </dt>
            {/* Una referencia puede tener dos partes (GLN y Sub-GLN):
                una por línea. */}
            <dd className="font-data-mono text-[1.125rem] leading-snug font-semibold tabular-nums text-primary md:text-right">
              {habilitacion.referencia.split(' · ').map((parte) => (
                <CifraGenerada
                  key={parte}
                  texto={parte}
                  activo={leyendo}
                  retraso={retraso + DEMORA_CIFRA}
                  className="block md:whitespace-nowrap"
                />
              ))}
            </dd>
          </div>
        )
      })}
      {/* La línea de luz que baja por la tabla; solo con JS y movimiento */}
      <span aria-hidden className="lectura-barrido" />
    </dl>
  )
}
