"use client"

import * as React from "react"
import { Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

const FADE_DELAY = 120
const FADE_DURATION = 500

/**
 * Full-screen branded loader shown on the initial page load (including hard
 * refreshes of statically rendered routes). It fades out shortly after the
 * app hydrates, so a refresh always gives visible feedback.
 */
export function InitialPageLoader() {
  const [fading, setFading] = React.useState(false)
  const [removed, setRemoved] = React.useState(false)

  React.useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), FADE_DELAY)
    const removeTimer = window.setTimeout(
      () => setRemoved(true),
      FADE_DELAY + FADE_DURATION
    )

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  if (removed) {
    return null
  }

  return (
    <div
      aria-hidden={fading}
      className={cn(
        "initial-page-loader fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-500 ease-out",
        fading && "pointer-events-none opacity-0"
      )}
    >
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-2xl bg-primary/10" />
          <span className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-primary border-r-primary/40" />
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wrench className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
          </span>
        </div>

        <div className="text-center">
          <p className="font-heading text-lg font-extrabold tracking-tight text-foreground">
            Fix<span className="text-primary">Mate</span>
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Loading your workspace…
          </p>
        </div>
      </div>
    </div>
  )
}
