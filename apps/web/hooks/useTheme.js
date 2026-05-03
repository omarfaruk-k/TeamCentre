import { useEffect } from 'react'

export function useTheme() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      // only auto-follow system if user hasn't manually toggled
      const hasManualOverride = localStorage.getItem('themeOverride')
      if (hasManualOverride) return
      if (e.matches) {
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
}