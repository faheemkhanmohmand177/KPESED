'use client'

import * as React from 'react'
import { Toaster, type ToasterProps } from 'sonner'

/**
 * Sonner toaster that keeps the viewport clear on phones.
 *
 * Desktop keeps the captured top-right placement. On narrow screens the toast
 * docks to the bottom (above the home indicator) so it never covers the header
 * or the drawer close button.
 */
export function ResponsiveToaster(props: ToasterProps) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <Toaster
      position={isMobile ? 'bottom-center' : 'top-right'}
      richColors
      closeButton
      // Keep toasts clear of the notch / home indicator on phones.
      style={
        isMobile
          ? { bottom: 'calc(1rem + env(safe-area-inset-bottom))' }
          : undefined
      }
      {...props}
    />
  )
}
