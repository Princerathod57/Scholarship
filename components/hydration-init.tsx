'use client'

import { useEffect } from 'react'
import { suppressHydrationWarning } from './hydration-boundary'

export function HydrationInit() {
  useEffect(() => {
    suppressHydrationWarning()
  }, [])

  return null
}
