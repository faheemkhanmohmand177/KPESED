'use client'

import * as React from 'react'

/** Register the service worker from the public entry page so install eligibility
 * is established before the authenticated shell renders. */
export function PwaRegister() {
  React.useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let cancelled = false
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        if (!cancelled) void registration.update()
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
