'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useEffect } from 'react'

export function ThemeProvider({ children, ...props }) {
  useEffect(() => {
    // Remove the temporary class that prevents theme transition flashes after hydration
    try {
      document.documentElement.classList.remove('disable-theme-transition')
    } catch (e) {
      // noop
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
