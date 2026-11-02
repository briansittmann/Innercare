'use client'

import { Fragment, useEffect, useRef } from 'react'

// Cifra que se genera: un número de registro ("Disposición 0999/17",
// "GLN 7798276610001") cuyos dígitos aparecen cifrados (al azar) y se
// resuelven de izquierda a derecha hasta el número real. Es la idea de
// DecryptedText de React Bits, sin el componente: solo cambian los dígitos
// (las palabras y las letras quedan quietas) y el contenedor va en cifras
// tabulares, así nada salta de ancho.
//
// El HTML del servidor trae el texto real: sin JS, con movimiento reducido o
// si `activo` nunca llega, no cambia nada. Al activarse, los dígitos se cifran
// enseguida (la fila todavía está oculta) y, pasado `retraso`, empiezan a
// resolverse uno por paso. Escribe el DOM directamente, sin estado de React
// por cuadro. Para el lector de pantalla, el texto real en un sr-only.

// Milisegundos entre pasos: cada paso resuelve un dígito y vuelve a sortear
// los que faltan.
const PASO = 40
const DIGITO = /\d/

const azar = () => String(Math.floor(Math.random() * 10))

export function CifraGenerada({
  texto,
  activo,
  retraso = 0,
  className,
}: {
  texto: string
  // Arranca el cifrado (una vez)
  activo: boolean
  // Espera, en ms, desde `activo` hasta que empiezan a resolverse los dígitos
  retraso?: number
  className?: string
}) {
  const raiz = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const nodo = raiz.current
    if (!activo || !nodo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cifras = Array.from(nodo.querySelectorAll<HTMLSpanElement>('[data-cifra]'))
    if (!cifras.length) return
    const reales = cifras.map((cifra) => cifra.dataset.cifra ?? '')

    // Cuántas ya se resolvieron, de izquierda a derecha
    let resueltas = 0
    let cuadro = 0
    let ultimoPaso = 0
    const inicio = performance.now() + retraso

    const sortear = () => {
      for (const cifra of cifras.slice(resueltas)) cifra.textContent = azar()
    }
    const restaurar = () => {
      cifras.forEach((cifra, i) => {
        cifra.textContent = reales[i] ?? ''
        delete cifra.dataset.estado
      })
    }

    for (const cifra of cifras) cifra.dataset.estado = 'cifrando'
    sortear()

    const pintar = (ahora: number) => {
      cuadro = 0
      if (ahora - ultimoPaso >= PASO) {
        ultimoPaso = ahora
        if (ahora >= inicio) {
          const cifra = cifras[resueltas]
          if (cifra) {
            cifra.textContent = reales[resueltas] ?? ''
            delete cifra.dataset.estado
            resueltas++
          }
        }
        sortear()
      }
      if (resueltas < cifras.length) cuadro = requestAnimationFrame(pintar)
    }
    cuadro = requestAnimationFrame(pintar)

    return () => {
      cancelAnimationFrame(cuadro)
      restaurar()
    }
  }, [activo, retraso])

  return (
    <span className={className}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden ref={raiz}>
        {Array.from(texto).map((caracter, i) =>
          DIGITO.test(caracter) ? (
            <span key={i} className="cifra" data-cifra={caracter}>
              {caracter}
            </span>
          ) : (
            <Fragment key={i}>{caracter}</Fragment>
          ),
        )}
      </span>
    </span>
  )
}
