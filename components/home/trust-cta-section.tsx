import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Wrench,
} from "lucide-react"

const GUARANTEES = [
  {
    title: "Admin-Moderated Quality",
    description:
      "Every service stays pending until reviewed and approved by FixMate admins before going public.",
    icon: ShieldCheck,
  },
  {
    title: "Strict Step-by-Step Tracking",
    description:
      "Jobs move forward one verified stage at a time—no skipped steps, no confusion, full transparency.",
    icon: CheckCircle2,
  },
  {
    title: "Zero-Risk Stripe Checkout",
    description:
      "The Pay Now button unlocks only after your technician completes the repair and sets the final bill.",
    icon: Lock,
  },
]

export function TrustCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-8 text-white shadow-xl sm:p-12">
        {/* Background Accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Pitch */}
          <div className="space-y-5 lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/15 px-3.5 py-1 text-xs font-semibold text-teal-200">
              <Wrench className="h-3.5 w-3.5 text-amber-300" />
              Built for Trust & Speed
            </span>
            <h2 className="font-heading text-3xl leading-tight font-extrabold tracking-tight text-white">
              Reliable repairs for customers. Steady growth for technicians.
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Whether you need an urgent AC tune-up at home or you are a skilled
              technician looking for structured repair requests, FixMate keeps
              both sides protected.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:bg-teal-400"
              >
                Book a Repair
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Join as Technician
              </Link>
            </div>
          </div>

          {/* Right 3 Guarantee Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-1">
            {GUARANTEES.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors hover:border-teal-400/30 hover:bg-white/[0.08]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
