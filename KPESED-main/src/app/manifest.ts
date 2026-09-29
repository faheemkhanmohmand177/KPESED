import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Integrated EMIS',
    short_name: 'Integrated EMIS',
    description: 'Education Management Information System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b6fc4',
    icons: [
      { src: '/hrmis/app-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/hrmis/app-icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
  }
}
