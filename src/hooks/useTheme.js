import { useCallback, useEffect, useState } from 'react'

const KEY = 'tasks.theme'
export const THEMES = ['system', 'light', 'dark']

/** Reads the stored choice. Private browsing can throw, so it is guarded. */
function readStored() {
  try {
    const value = localStorage.getItem(KEY)
    return THEMES.includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

/**
 * Theme preference, persisted per browser. 'system' removes the attribute
 * entirely so the `prefers-color-scheme` block in tokens.css takes over.
 */
export function useTheme() {
  const [theme, setTheme] = useState(readStored)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)

    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // Storage unavailable — the theme still applies for this session.
    }
  }, [theme])

  const cycle = useCallback(
    () => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]),
    [],
  )

  return { theme, setTheme, cycle }
}
