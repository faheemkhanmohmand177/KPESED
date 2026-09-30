import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Integrated EMIS',
    short_name: 'Integrated EMIS',
    description: 'Education Management Information System',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    lang: 'en',
    background_color: '#ffffff',
    theme_color: '#1565c0',
    categories: ['education', 'government', 'productivity'],
    icons: [
      { src: '/hrmis/app-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/hrmis/app-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/hrmis/app-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Home', url: '/?module=home', icons: [{ src: '/hrmis/app-icon-192.png', sizes: '192x192' }] },
      { name: 'Employee Profiles', url: '/?module=employee-search', icons: [{ src: '/hrmis/app-icon-192.png', sizes: '192x192' }] },
      { name: 'Student Attendance', url: '/?module=student-attendence', icons: [{ src: '/hrmis/app-icon-192.png', sizes: '192x192' }] },
    ],
  }
}
