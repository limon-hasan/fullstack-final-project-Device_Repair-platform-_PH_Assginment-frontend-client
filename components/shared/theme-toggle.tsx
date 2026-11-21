"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Switch Light / Dark theme (Press D)"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-foreground"
    >
      <Sun className="hidden h-4 w-4 text-brand-amber dark:block" />
      <Moon className="block h-4 w-4 text-slate-700 dark:hidden" />
    </button>
  )
}
