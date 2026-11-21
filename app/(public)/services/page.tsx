import { Suspense } from "react"
import type { Metadata } from "next"
import { ShieldCheck, Sparkles } from "lucide-react"
import { ServicesBrowser } from "@/components/services/services-browser"

export const metadata: Metadata = {
  title: "Browse Repair Services",
  description:
    "Search and filter admin-verified repair services for smartphones, laptops, ACs, refrigerators, TVs, washing machines, and electrical work.",
}

export default function ServicesPage() {
  return (
    <div className="relative overflow-hidden pb-20">
      {/* Page Header Banner */}
      <section className="relative border-b border-border/70 py-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute top-0 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-amber/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
                Verified Repair Marketplace
              </span>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Browse Approved Repair Services
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Find skilled technicians by category, service mode, or budget.
                Every listing is admin-verified with zero upfront booking fees.
              </p>
            </div>

            <div className="inline-flex items-center gap-2.5 self-start rounded-2xl border border-primary/20 bg-card px-4 py-3 text-xs font-medium text-foreground shadow-sm md:self-auto">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <span>Pay via Stripe only after completion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Browser */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-36 w-full animate-pulse rounded-3xl bg-muted" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            </div>
          }
        >
          <ServicesBrowser />
        </Suspense>
      </section>
    </div>
  )
}
