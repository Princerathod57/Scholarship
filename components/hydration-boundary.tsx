'use client'

import { useEffect, useState } from 'react'

interface HydrationBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Prevents hydration errors caused by browser extensions that modify the DOM
 * by only rendering children after hydration is complete
 */
export function HydrationBoundary({ children, fallback = null }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Custom error boundary that suppresses hydration warnings
 * caused by browser extensions adding attributes like fdprocessedid
 */
export function suppressHydrationWarning() {
  if (typeof window !== 'undefined') {
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Suppress hydration warnings related to browser extensions
      if (
        typeof args[0] === 'string' && 
        (
          args[0].includes('Text content does not match server-rendered HTML') ||
          args[0].includes('Prop `fdprocessedid` did not match') ||
          args[0].includes('Extra attributes from the server') ||
          args[0].includes('Warning: Extra attributes from the server')
        )
      ) {
        return
      }
      originalConsoleError(...args)
    }
  }
}
