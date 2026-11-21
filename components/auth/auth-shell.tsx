import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react"

interface AuthShellProps {
  badge: string
  headline: string
  description: string
  children: React.ReactNode
}

const PIPELINE_STEPS = [
  { label: "Requested", color: "bg-blue-500" },
  { label: "Accepted", color: "bg-indigo-500" },
  { label: "In Progress", color: "bg-amber-500" },
  { label: "Completed", color: "bg-emerald-500" },
]

export function AuthShell({
  badge,
  headline,
  description,
  children,
}: AuthShellProps) {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16">
      {/* Subtle Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-10 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-brand-amber/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left Visual Brand Showcase (Desktop) */}
        <div className="relative hidden flex-col justify-between overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-10 text-white shadow-xl lg:col-span-5 lg:flex">
          {/* Subtle Dot Grid Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.28) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 -left-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl"
          />

          <div className="relative z-10 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/15 px-3.5 py-1.5 text-xs font-semibold text-teal-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {badge}
            </span>

            <div className="space-y-3">
              <h2 className="font-heading text-3xl leading-tight font-extrabold tracking-tight text-white">
                {headline}
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                {description}
              </p>
            </div>

            {/* Live Job Pipeline Preview Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
                    <Wrench className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      AC Cooling Diagnostics
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Dhanmondi, Dhaka • Home Visit
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  Live Tracked
                </span>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {PIPELINE_STEPS.map((step, idx) => (
                  <div key={step.label} className="space-y-1.5">
                    <div
                      className={`h-1.5 w-full rounded-full ${
                        idx <= 2 ? step.color : "bg-white/15"
                      }`}
                    />
                    <p className="truncate text-[10px] font-medium text-slate-300">
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="relative z-10 mt-8 space-y-3 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <ShieldCheck className="h-4 w-4 shrink-0 text-teal-400" />
              <span>Every technician service is reviewed & admin-approved</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
              <span>Real-time status tracking from request to completion</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <CreditCard className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                Zero upfront risk — pay with Stripe only after completion
              </span>
            </div>
          </div>
        </div>

        {/* Right Interactive Form Container */}
        <div className="flex items-center lg:col-span-7">
          <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
