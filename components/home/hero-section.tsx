"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react"

const QUICK_SEARCHES = [
  "iPhone Screen",
  "AC Servicing",
  "Laptop Repair",
  "Washing Machine",
]

const LIVE_STAGES = [
  { label: "Requested", done: true, active: false },
  { label: "Accepted", done: true, active: false },
  { label: "In Progress", done: false, active: true },
  { label: "Completed", done: false, active: false },
]

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/services?search=${encodeURIComponent(trimmed)}`)
    } else {
      router.push("/services")
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-border/70">
      {/* Dynamic Ambient Mesh + Subtle Dot Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute inset-0 opacity-[0.45] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-16 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-24">
        {/* Left Column: Headline, Search & CTAs */}
        <div className="space-y-7 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
            <span>Admin-Verified Technicians • Pay Only After Repair</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
              Broken Device? Get It Fixed by{" "}
              <span className="bg-gradient-to-r from-primary via-teal-500 to-brand-amber bg-clip-text text-transparent">
                Verified Technicians.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Book trusted local specialists for smartphones, laptops, ACs, TVs,
              and home appliances. Track every repair stage live and pay
              securely online only when the job is completed.
            </p>
          </div>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-2 shadow-md transition-colors focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search e.g. iPhone screen, AC servicing, laptop battery..."
                aria-label="Search repair services"
                className="w-full bg-transparent py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Find Services
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Popular:
            </span>
            {QUICK_SEARCHES.map((term) => (
              <Link
                key={term}
                href={`/services?search=${encodeURIComponent(term)}`}
                className="rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {term}
              </Link>
            ))}
          </div>

          {/* Trust Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 border-t border-border/80 pt-6 sm:max-w-lg">
            <div>
              <p className="font-heading text-2xl font-extrabold text-foreground">
                100%
              </p>
              <p className="text-xs text-muted-foreground">Approved Listings</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-primary">
                4-Step
              </p>
              <p className="text-xs text-muted-foreground">Live Job Pipeline</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-brand-amber">
                $0
              </p>
              <p className="text-xs text-muted-foreground">Upfront Payment</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Visual Showcase Card */}
        <div className="relative lg:col-span-5">
          {/* Decorative Halo */}
          <div
            aria-hidden="true"
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-transparent to-brand-amber/20 blur-2xl"
          />

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            {/* Top Real Device Repair Visual */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-900 sm:h-60">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                alt="Verified technician repairing electronic hardware"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Floating Verified Badge */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <BadgeCheck className="h-3.5 w-3.5 text-teal-400" />
                Verified Specialist
              </div>

              {/* Floating Live Tag */}
              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                Live Tracking
              </div>

              {/* Bottom Caption on Image */}
              <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between text-white">
                <div>
                  <p className="text-[11px] font-medium tracking-wider text-teal-300 uppercase">
                    Active Repair Job
                  </p>
                  <p className="font-heading text-lg leading-snug font-bold">
                    MacBook & Smartphone Diagnostics
                  </p>
                </div>
                <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
                  From $35
                </span>
              </div>
            </div>

            {/* Interactive Pipeline Snapshot */}
            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Home Visit & Shop Drop-off
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" />
                      Mirpur, Dhanmondi, Banani & Uttara
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  <Clock className="h-3 w-3 text-brand-amber" />
                  2-3 hrs
                </span>
              </div>

              {/* 4-Stage Status Bar */}
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Repair Pipeline Status
                  </span>
                  <span className="font-semibold text-brand-amber">
                    Step 3 of 4
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {LIVE_STAGES.map((stage) => (
                    <div key={stage.label} className="space-y-1.5">
                      <div
                        className={`h-1.5 w-full rounded-full ${
                          stage.done
                            ? "bg-primary"
                            : stage.active
                              ? "animate-pulse bg-brand-amber"
                              : "bg-muted"
                        }`}
                      />
                      <p
                        className={`truncate text-[10px] font-semibold ${
                          stage.active
                            ? "text-brand-amber"
                            : stage.done
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Protection Footer */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <p className="text-xs font-medium text-foreground">
                    Stripe Checkout unlocks only after completion
                  </p>
                </div>
                <CreditCard className="h-4 w-4 shrink-0 text-primary" />
              </div>

              {/* Secondary Direct Action */}
              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Free cancellation while requested
                </span>
                <Link
                  href="/about"
                  className="font-semibold text-primary hover:underline"
                >
                  How it works →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
