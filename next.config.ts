import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Servidor de desarrollo abierto a la red local (next dev -H 0.0.0.0), para
  // probar el 3D en un celular. 127.0.0.1: el panel de Keystatic en modo
  // Cloud cambia localhost por 127.0.0.1 y sin esto queda en blanco en
  // `next dev` (issue thinkmill/keystatic#1549).
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '127.0.0.1'],
  experimental: {
    // 404 de todo el sitio (app/global-not-found.tsx): con dos raíces, la
    // del sitio y la del panel, no hay un layout del que colgar not-found.tsx
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
