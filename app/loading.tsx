import { Wrench } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Wrench className="h-7 w-7 animate-pulse" />
        <span className="absolute inset-0 animate-ping rounded-2xl border border-primary/30" />
      </div>
      <div className="text-center">
        <p className="font-heading text-base font-bold text-foreground">
          Loading FixMate...
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Preparing your workspace
        </p>
      </div>
    </div>
  )
}
