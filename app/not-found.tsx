import Link from "next/link"
import { Home, Search, Wrench } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Wrench className="h-8 w-8" />
        </div>

        <p className="mt-6 text-xs font-semibold tracking-widest text-primary uppercase">
          Error 404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The repair service or page you are looking for does not exist, was
          removed, or the link might be incorrect.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/services"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  )
}
