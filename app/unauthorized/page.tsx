import Link from "next/link"
import { Home, LogIn, ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <p className="mt-5 font-mono text-xs font-bold tracking-widest text-rose-500 uppercase">
          Access Denied · 401 / 403
        </p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
          Unauthorized Access
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          You do not have permission to view this page or perform this action.
          Sign in with an authorized account or return home.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
