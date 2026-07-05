import { useSyncExternalStore } from 'react'

/**
 * App theme — warm light is the default; dark is opt-in and persisted.
 * Uses the shared `tl:theme` key so a toggle on any Chronic Trading site
 * (same origin) applies across all three. Sets <html data-theme="…">.
 */
export type Theme = 'light' | 'dark'

const KEY = 'tl:theme'

function current(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* private mode */ }
  return 'light'
}

// Apply at import time so there's no flash before React mounts.
function apply(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
apply(current())

const listeners = new Set<() => void>()
function subscribe(fn: () => void) {
  listeners.add(fn)
  // Cross-tab / cross-site sync
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) fn() }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage) }
}
function getSnapshot(): Theme { return current() }

export function setTheme(theme: Theme) {
  try { localStorage.setItem(KEY, theme) } catch { /* private mode */ }
  apply(theme)
  listeners.forEach(fn => fn())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as Theme)
  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light')
  return { theme, setTheme, toggle }
}
