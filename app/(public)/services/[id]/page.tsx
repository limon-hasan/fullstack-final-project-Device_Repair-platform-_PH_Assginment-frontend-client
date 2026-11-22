import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Home,
  Mail,
  MapPin,
  ShieldCheck,
  Store,
  UserCheck,
  Wrench,
} from "lucide-react"
import { BookingRequestCard } from "@/components/services/booking-request-card"
import type { RepairService } from "@/types/service"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function getServiceById(id: string): Promise<RepairService | null> {
  try {
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data?.service || data) as RepairService
  } catch {
    return null
  }
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = await getServiceById(id)

  if (!service || !service._id) {
    notFound()
  }

  const isHomeVisit = service.serviceMode?.toLowerCase().includes("home")

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb Back Link */}
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all services
      </Link>

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Main Content */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Hero Service Image */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-muted shadow-sm">
            <div className="aspect-[16/9] w-full">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-brand-amber/15">
                  <Wrench className="h-14 w-14 text-primary/60" />
                </div>
              )}
            </div>

            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-background/90 px-3.5 py-1 text-xs font-bold text-foreground shadow-sm backdrop-blur-md">
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {isHomeVisit ? (
                  <Home className="h-3.5 w-3.5 text-teal-400" />
                ) : (
                  <Store className="h-3.5 w-3.5 text-amber-400" />
                )}
                {service.serviceMode}
              </span>
            </div>
          </div>

          {/* Service Info Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                Admin-Approved Listing
              </span>
            </div>

            <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {service.title}
            </h1>

            {/* Quick Spec Pills */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Estimated Time
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {service.estimatedDuration || "1–2 hours"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-amber/10 text-brand-amber">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Service Area
                  </p>
                  <p className="truncate text-sm font-bold text-foreground">
                    {service.serviceArea || "Dhaka"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {isHomeVisit ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <Store className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Service Mode
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {service.serviceMode}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-7 border-t border-border pt-6">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {"What's Included"}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {service.description}
              </p>
            </div>

            {/* Repair Pipeline Guarantees */}
            <div className="mt-7 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2">
              {[
                "Live 4-step status tracking inside your dashboard",
                "Cancel anytime for free while status is Requested",
                "Transparent final amount set only after repair",
                "Protected online payment via Stripe Checkout",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Card */}
          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <UserCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Assigned Technician
                </p>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {service.technicianName}
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {service.technicianEmail}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary sm:self-auto">
              <ShieldCheck className="h-4 w-4" />
              Verified FixMate Pro
            </span>
          </div>
        </div>

        {/* Right Sticky Booking Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <BookingRequestCard service={service} />
        </div>
      </div>
    </div>
  )
}
