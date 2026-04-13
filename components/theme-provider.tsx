import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
})

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement
    const resolved = theme === 'system' ? getSystemTheme() : theme

    if (disableTransitionOnChange) {
      root.style.setProperty('transition', 'none')
    }

    if (attribute === 'class') {
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    } else {
      root.setAttribute(attribute, resolved)
    }

    if (disableTransitionOnChange) {
      // Force reflow
      void root.offsetHeight
      root.style.removeProperty('transition')
    }
  }, [theme, attribute, disableTransitionOnChange])

  React.useEffect(() => {
    if (!enableSystem || theme !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(getSystemTheme())
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [enableSystem, theme])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (t: Theme) => {
        localStorage.setItem('theme', t)
        setTheme(t)
      },
    }),
    [theme]
  )

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
