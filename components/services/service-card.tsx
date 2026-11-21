import Link from "next/link"
import {
  ArrowUpRight,
  Clock,
  Home,
  MapPin,
  Store,
  UserCheck,
  Wrench,
} from "lucide-react"
import type { RepairService } from "@/types/service"

interface ServiceCardProps {
  service: RepairService
}

export function ServiceCard({ service }: ServiceCardProps) {
  const isHomeVisit = service.serviceMode?.toLowerCase().includes("home")

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* Service Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-brand-amber/15">
            <Wrench className="h-10 w-10 text-primary/60" />
          </div>
        )}

        {/* Subtle Dark Gradient Overlay for Badge Readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />

        {/* Category & Mode Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-md">
            {service.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {isHomeVisit ? (
              <Home className="h-3 w-3 text-teal-400" />
            ) : (
              <Store className="h-3 w-3 text-amber-400" />
            )}
            {service.serviceMode}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-heading text-lg leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
          {service.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate font-medium text-foreground/90">
              {service.technicianName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {service.serviceArea && (
              <span className="inline-flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{service.serviceArea}</span>
              </span>
            )}
            {service.estimatedDuration && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {service.estimatedDuration}
              </span>
            )}
          </div>
        </div>

        {/* Footer pushed to bottom for equal card heights */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/80 pt-4">
          <div className="pt-1">
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Starting from
            </p>
            <p className="font-heading text-xl font-extrabold text-foreground">
              <span className="text-brand-amber">$</span>
              {Number(service.basePrice || 0).toFixed(0)}
            </p>
          </div>

          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            View Details
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
