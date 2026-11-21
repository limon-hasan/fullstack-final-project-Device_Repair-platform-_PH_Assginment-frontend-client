import Link from "next/link"
import {
  ArrowRight,
  Laptop,
  Refrigerator,
  Smartphone,
  Tv,
  WashingMachine,
  Wind,
  Zap,
} from "lucide-react"

const CATEGORIES = [
  {
    name: "Smartphone",
    subtitle: "Screens, batteries & ports",
    icon: Smartphone,
  },
  {
    name: "Laptop & PC",
    subtitle: "Hardware, SSD & thermal",
    icon: Laptop,
  },
  {
    name: "AC",
    subtitle: "Gas refill & deep servicing",
    icon: Wind,
  },
  {
    name: "Refrigerator",
    subtitle: "Cooling & compressor fix",
    icon: Refrigerator,
  },
  {
    name: "TV",
    subtitle: "Display, backlight & board",
    icon: Tv,
  },
  {
    name: "Washing Machine",
    subtitle: "Drum, pump & sensor repair",
    icon: WashingMachine,
  },
  {
    name: "Electrical",
    subtitle: "Wiring, breakers & panels",
    icon: Zap,
  },
]

export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            Repair Categories
          </p>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            What needs fixing today?
          </h2>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
        >
          Explore all services
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <Link
              key={category.name}
              href={`/services?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4">
                <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {category.subtitle}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
