import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Servidor de desarrollo abierto a la red local (next dev -H 0.0.0.0), para
  // probar el 3D en un celular
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*'],
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
