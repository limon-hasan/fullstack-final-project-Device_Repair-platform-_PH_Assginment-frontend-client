import { Activity, ClipboardList, CreditCard, Search } from "lucide-react"

const STEPS = [
  {
    step: "01",
    title: "Find a Service",
    description:
      "Browse admin-approved repair listings by category, service mode, area, or starting price.",
    icon: Search,
    accent: "text-primary bg-primary/10 border-primary/20",
  },
  {
    step: "02",
    title: "Send a Request",
    description:
      "Share your address, preferred date, and device issue—no advance payment required to book.",
    icon: ClipboardList,
    accent:
      "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    step: "03",
    title: "Track Repair",
    description:
      "Follow live status updates as your technician moves the job from Accepted to In Progress to Completed.",
    icon: Activity,
    accent: "text-brand-amber bg-brand-amber/10 border-brand-amber/25",
  },
  {
    step: "04",
    title: "Pay After Completion",
    description:
      "Once your device is fixed and marked completed, pay the final verified amount securely with Stripe.",
    icon: CreditCard,
    accent:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
]

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">
          Transparent Workflow
        </p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          How FixMate Works
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every repair follows a clear, tracked four-step pipeline so you always
          know what is happening with your device.
        </p>
      </div>

      <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Desktop Connecting Line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-11 right-12 left-12 hidden h-px bg-gradient-to-r from-primary/30 via-brand-amber/40 to-emerald-500/30 lg:block"
        />

        {STEPS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.step}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border ${item.accent} transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-2xl font-extrabold text-muted-foreground/35">
                  {item.step}
                </span>
              </div>

              <h3 className="mt-5 font-heading text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
