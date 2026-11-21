import type { Metadata } from "next"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
} from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works & About",
  description:
    "Learn how FixMate connects customers with admin-verified technicians, tracks repairs step-by-step, and keeps payments safe until job completion.",
}

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Find an Approved Service",
    badge: "Browse & Filter",
    description:
      "Search across 7 repair categories—from smartphones and laptops to ACs and washing machines. Filter by Home Visit or Shop Drop-off, area, and starting price.",
    icon: Search,
    accent: "text-primary bg-primary/10 border-primary/20",
  },
  {
    step: "02",
    title: "Send a Booking Request",
    badge: "Zero Upfront Fee",
    description:
      "Describe the device issue, share your address and preferred date, and submit your request. No advance payment is charged when booking.",
    icon: ClipboardList,
    accent:
      "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    step: "03",
    title: "Track Every Repair Stage",
    badge: "Live Pipeline",
    description:
      "Your technician moves the job sequentially through Requested, Accepted, In Progress, and Completed—so you always see real-time progress.",
    icon: Activity,
    accent: "text-brand-amber bg-brand-amber/10 border-brand-amber/25",
  },
  {
    step: "04",
    title: "Pay Only After Completion",
    badge: "Stripe Protected",
    description:
      "Once the repair is finished and marked Completed with the final bill, the Pay Now button unlocks for secure online checkout via Stripe.",
    icon: CreditCard,
    accent:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
]

const ROLES = [
  {
    role: "For Customers",
    icon: User,
    accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    points: [
      "Browse only admin-reviewed and verified repair listings",
      "Cancel freely anytime while a booking is still in Requested state",
      "Track repair status live and pay securely after the job is done",
    ],
  },
  {
    role: "For Technicians",
    icon: Wrench,
    accent: "text-primary bg-primary/10",
    points: [
      "Publish services with transparent pricing, area, and service mode",
      "Manage incoming bookings through a clean step-by-step job queue",
      "Set the final repair bill upon completion and track paid earnings",
    ],
  },
  {
    role: "Platform Moderation",
    icon: ShieldCheck,
    accent: "text-brand-amber bg-brand-amber/10",
    points: [
      "Every new technician service is reviewed before going public",
      "Role-based dashboards keep customer, technician, and admin actions isolated",
      "Verified Stripe webhooks record every transaction reliably",
    ],
  },
]

const FAQS = [
  {
    q: "Do I have to pay anything when sending a repair request?",
    a: "No. Sending a booking request on FixMate is completely free. Online payment via Stripe only unlocks after your technician completes the repair and confirms the final amount.",
  },
  {
    q: "Can I cancel my booking if my plans change?",
    a: "Yes. Customers can cancel a booking directly from their dashboard as long as its status is still 'Requested'. Once a technician accepts and starts working on the job, cancellation is locked.",
  },
  {
    q: "How do I know the listed technicians are genuine?",
    a: "Every newly created service starts in a 'Pending' review state. Only listings reviewed and approved by a FixMate Admin appear publicly on the Services page.",
  },
  {
    q: "What is the difference between Home Visit and Shop Drop-off?",
    a: "Home Visit means the technician comes to your provided address (ideal for ACs, refrigerators, and washing machines). Shop Drop-off lets you bring compact devices like phones or laptops directly to the service center.",
  },
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Banner */}
      <section className="relative border-b border-border/70 py-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute top-0 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-amber/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
            How FixMate Works
          </span>

          <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Device & Appliance Repair,{" "}
            <span className="text-primary">Rebuilt Around Trust.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            FixMate replaces guesswork and unverified local calls with a
            transparent repair pipeline—admin-approved listings, sequential job
            tracking, and pay-after-completion security.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Browse Repair Services
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
            >
              Join as a Technician
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Step Detailed Pipeline */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Step-by-Step Lifecycle
          </p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            From broken device to verified fix
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Every booking moves forward strictly one verified stage at a time so
            both customers and technicians stay protected.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {WORKFLOW_STEPS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.accent}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold text-foreground">
                        {item.badge}
                      </span>
                    </div>
                    <span className="font-mono text-3xl font-extrabold text-muted-foreground/30">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Role Breakdown */}
      <section className="border-y border-border/70 bg-muted/35 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Three Dedicated Workspaces
            </p>
            <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Designed for every role on the platform
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {ROLES.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.role}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      {item.role}
                    </h3>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Common Questions
          </p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors open:border-primary/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-bold text-foreground">
                <span>{faq.q}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary" />
              </summary>
              <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        {/* Bottom CTA Strip */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-3xl border border-primary/25 bg-primary/5 p-7 text-center sm:flex-row sm:text-left">
          <div className="flex items-start gap-3.5">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:flex">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Ready to get your device repaired?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore verified services now or register as a technician to
                start receiving bookings.
              </p>
            </div>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Explore Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
