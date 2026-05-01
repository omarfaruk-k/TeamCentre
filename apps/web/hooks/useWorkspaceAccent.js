import { useEffect } from 'react'
import { useWorkspaceStore } from '../stores/workspaceStore'

export function useWorkspaceAccent() {
  const accent = useWorkspaceStore((s) => s.active?.accentColor || '#7C3AED')

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--accent-subtle', accent + '10')
    document.documentElement.style.setProperty('--accent-muted', accent + '20')
  }, [accent])
}