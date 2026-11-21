import Link from "next/link"
import { ArrowLeft, Search, Wrench } from "lucide-react"
import { FixMateLogo } from "@/components/shared/fixmate-logo"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <FixMateLogo />

      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <Wrench className="h-8 w-8" />
      </div>

      <p className="mt-5 font-mono text-sm font-bold tracking-widest text-brand-amber uppercase">
        Error 404
      </p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page or repair listing you are looking for does not exist or may
        have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Search className="h-4 w-4 text-primary" />
          Browse Services
        </Link>
      </div>
    </div>
  )
}
