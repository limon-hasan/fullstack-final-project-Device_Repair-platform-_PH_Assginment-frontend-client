import { Wrench } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/* --------------------------------------------------------------------------
 * Branded loaders
 * ------------------------------------------------------------------------ */

export function BrandSpinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "relative flex h-16 w-16 items-center justify-center",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full border-2 border-primary/15" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/50" />
      <Wrench className="h-6 w-6 text-primary" aria-hidden="true" />
    </span>
  )
}

export function PageLoader({
  label = "Loading FixMate...",
  hint = "Preparing your workspace",
  className,
}: {
  label?: string
  hint?: string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[65vh] flex-col items-center justify-center gap-5 px-4 py-16",
        className
      )}
    >
      <BrandSpinner />
      <div className="text-center">
        <p className="font-heading text-sm font-bold text-foreground">{label}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Reusable building blocks
 * ------------------------------------------------------------------------ */

export function PageHeaderSkeleton({
  className,
  showAction = true,
}: {
  className?: string
  showAction?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="w-full space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="h-3.5 w-full max-w-md" />
      </div>
      {showAction ? (
        <Skeleton className="h-10 w-36 shrink-0 rounded-xl" />
      ) : null}
    </div>
  )
}

export function StatCardsSkeleton({
  count = 4,
  columns = "sm:grid-cols-2 xl:grid-cols-4",
  className,
}: {
  count?: number
  columns?: string
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", columns, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-10 rounded-2xl" />
          </div>
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

export function FilterTabsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-24 rounded-xl" />
      ))}
    </div>
  )
}

export function ListRowsSkeleton({
  rows = 3,
  itemClassName = "h-16",
  className,
}: {
  rows?: number
  itemClassName?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("w-full rounded-2xl", itemClassName)}
        />
      ))}
    </div>
  )
}

export function RowsCardSkeleton({
  rows = 5,
  rowClassName = "h-20",
}: {
  rows?: number
  rowClassName?: string
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "w-full rounded-2xl border border-border bg-card",
            rowClassName
          )}
        />
      ))}
    </div>
  )
}

export function TableCardSkeleton({
  rows = 5,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="border-b border-border px-6 py-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <ListRowsSkeleton rows={rows} itemClassName="h-16" />
      </div>
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ServicesGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20" />
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-5 w-52 max-w-full" />
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </div>
        </div>
        <div className="space-y-2 sm:text-right">
          <Skeleton className="h-3 w-24 sm:ml-auto" />
          <Skeleton className="h-7 w-16 sm:ml-auto" />
        </div>
      </div>

      <Skeleton className="mt-5 h-20 w-full rounded-2xl" />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Page-level skeletons
 * ------------------------------------------------------------------------ */

export function HomePageSkeleton() {
  return (
    <div role="status" aria-label="Loading homepage">
      <span className="sr-only">Loading homepage…</span>

      {/* Hero */}
      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-5">
            <Skeleton className="h-7 w-48 rounded-full" />
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-12 w-3/4 max-w-md" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-5/6 max-w-md" />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-11 w-40 rounded-xl" />
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <Skeleton className="mx-auto h-3 w-32" />
          <Skeleton className="mx-auto h-8 w-72 max-w-full" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <Skeleton className="mx-auto h-10 w-10 rounded-xl" />
              <Skeleton className="mx-auto mt-3 h-3 w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured services */}
      <section className="border-y border-border/70 bg-muted/35 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-3 h-8 w-64 max-w-full" />
          <ServicesGridSkeleton className="mt-10" count={6} />
        </div>
      </section>
    </div>
  )
}

export function ServicesPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading services"
      className="relative overflow-hidden pb-20"
    >
      <span className="sr-only">Loading repair services…</span>

      <section className="border-b border-border/70 py-12 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-end lg:px-8">
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-7 w-52 rounded-full" />
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <Skeleton className="h-14 w-64 rounded-2xl" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Skeleton className="h-11 w-full rounded-xl lg:col-span-6" />
            <Skeleton className="h-11 w-full rounded-xl lg:col-span-3" />
            <Skeleton className="h-11 w-full rounded-xl lg:col-span-3" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-24" />
        </div>

        <ServicesGridSkeleton />
      </section>
    </div>
  )
}

export function ServiceDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading service details"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading service details…</span>

      <Skeleton className="h-4 w-40" />

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <Skeleton className="aspect-[16/9] w-full rounded-3xl" />

          <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-9 w-3/4 max-w-md" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
            <Skeleton className="mt-4 h-3.5 w-full" />
            <Skeleton className="mt-2 h-3.5 w-4/5" />
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AboutPageSkeleton() {
  return (
    <div role="status" aria-label="Loading about page">
      <span className="sr-only">Loading page…</span>

      <section className="border-b border-border/70 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-5 px-4 text-center sm:px-6 lg:px-8">
          <Skeleton className="mx-auto h-7 w-44 rounded-full" />
          <Skeleton className="mx-auto h-12 w-full max-w-2xl" />
          <Skeleton className="mx-auto h-4 w-full max-w-xl" />
          <Skeleton className="mx-auto h-4 w-4/5 max-w-lg" />
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Skeleton className="h-11 w-48 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-8 w-80 max-w-full" />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <Skeleton className="h-8 w-10" />
              </div>
              <Skeleton className="mt-5 h-6 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/35 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  )
}

export function AuthPageSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading sign in form"
      className="relative overflow-hidden py-10 sm:py-16"
    >
      <span className="sr-only">Loading form…</span>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 bg-white/10 p-10 lg:col-span-5 lg:block">
          <Skeleton className="h-7 w-44 rounded-full bg-white/10" />
          <Skeleton className="mt-6 h-10 w-full bg-white/10" />
          <Skeleton className="mt-3 h-10 w-4/5 bg-white/10" />
          <Skeleton className="mt-4 h-4 w-full bg-white/10" />
          <Skeleton className="mt-2 h-4 w-5/6 bg-white/10" />
          <Skeleton className="mt-8 h-36 w-full rounded-2xl bg-white/5" />
        </div>

        <div className="flex items-center lg:col-span-7">
          <div className="w-full space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function DashboardPageSkeleton({
  stats = 4,
  statsColumns = "sm:grid-cols-2 xl:grid-cols-4",
  rows = 3,
  rowClassName = "h-16",
  charts = false,
}: {
  stats?: number
  statsColumns?: string
  rows?: number
  rowClassName?: string
  charts?: boolean
}) {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="mx-auto max-w-6xl space-y-6"
    >
      <span className="sr-only">Loading dashboard…</span>

      <PageHeaderSkeleton />
      <StatCardsSkeleton count={stats} columns={statsColumns} />

      {charts ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
        <ListRowsSkeleton
          className="p-6"
          rows={rows}
          itemClassName={rowClassName}
        />
      </section>
    </div>
  )
}

export function DashboardListPageSkeleton({
  tabs = 4,
  rows = 3,
  variant = "cards",
}: {
  tabs?: number
  rows?: number
  variant?: "cards" | "rows" | "table"
}) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto max-w-6xl space-y-6"
    >
      <span className="sr-only">Loading page…</span>

      <PageHeaderSkeleton />
      <FilterTabsSkeleton count={tabs} />

      {variant === "cards" ? (
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, index) => (
            <BookingCardSkeleton key={index} />
          ))}
        </div>
      ) : variant === "table" ? (
        <RowsCardSkeleton rows={rows} rowClassName="h-24" />
      ) : (
        <RowsCardSkeleton rows={rows} />
      )}
    </div>
  )
}

export function DashboardFormPageSkeleton({
  className,
  fields = 4,
}: {
  className?: string
  fields?: number
}) {
  return (
    <div
      role="status"
      aria-label="Loading form"
      className={cn("mx-auto max-w-3xl space-y-6", className)}
    >
      <span className="sr-only">Loading form…</span>

      <PageHeaderSkeleton showAction={false} />

      <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="flex justify-end border-t border-border pt-4">
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function PaymentPageSkeleton({
  label = "Loading payment details...",
}: {
  label?: string
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12"
    >
      <span className="sr-only">{label}</span>

      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BrandSpinner className="h-12 w-12" />
        </div>
        <Skeleton className="mx-auto mt-6 h-7 w-56" />
        <Skeleton className="mx-auto mt-3 h-4 w-full max-w-sm" />
        <div className="mt-8 space-y-3 rounded-2xl border border-border/80 bg-background/60 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function NoticePageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center px-4 py-12"
    >
      <span className="sr-only">Loading page…</span>

      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
        <Skeleton className="mx-auto mt-6 h-5 w-40" />
        <Skeleton className="mx-auto mt-3 h-8 w-64 max-w-full" />
        <Skeleton className="mx-auto mt-3 h-4 w-full max-w-md" />
        <Skeleton className="mx-auto mt-2 h-4 w-4/5 max-w-sm" />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
