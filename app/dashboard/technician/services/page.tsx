"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface TechnicianService {
  _id: string
  title: string
  category: string
  description: string
  image?: string
  basePrice: number
  estimatedDuration?: string
  serviceMode?: string
  serviceArea?: string
  approvalStatus?: string
  status?: string
  isAvailable?: boolean
  createdAt?: string
}

interface ServiceStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

type FilterKey = "all" | "approved" | "pending" | "rejected"

function getServiceStatus(
  service: TechnicianService
): "approved" | "pending" | "rejected" {
  const raw = String(
    service.approvalStatus || service.status || "pending"
  ).toLowerCase()
  if (raw === "approved") return "approved"
  if (raw === "rejected") return "rejected"
  return "pending"
}

const APPROVAL_BADGE: Record<
  "approved" | "pending" | "rejected",
  { label: string; className: string }
> = {
  approved: {
    label: "Approved",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  pending: {
    label: "Pending Approval",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  rejected: {
    label: "Rejected",
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

export default function TechnicianMyServicesPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined
  const userEmail = user?.email || ""

  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<TechnicianService[]>([])
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  })
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadServices = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/services/technician?email=${encodeURIComponent(
            userEmail
          )}`,
          { cache: "no-store" }
        )
        const data = await res.json().catch(() => ({}))

        if (!active) return

        if (!res.ok) {
          toast.error(data.message || "Failed to load your services.")
          return
        }

        const list: TechnicianService[] = Array.isArray(data.services)
          ? data.services
          : []
        setServices(list)

        // Compute accurate counts using approvalStatus fallback
        let approved = 0
        let pending = 0
        let rejected = 0
        for (const item of list) {
          const st = getServiceStatus(item)
          if (st === "approved") approved += 1
          else if (st === "rejected") rejected += 1
          else pending += 1
        }

        setStats({
          total: list.length,
          approved,
          pending,
          rejected,
        })
      } catch {
        if (active) {
          toast.error("Network error while loading services.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadServices()
    return () => {
      active = false
    }
  }, [userEmail])

  const filteredServices = useMemo(() => {
    if (activeFilter === "all") return services
    return services.filter((item) => getServiceStatus(item) === activeFilter)
  }, [services, activeFilter])

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "approved", label: "Approved", count: stats.approved },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "rejected", label: "Rejected", count: stats.rejected },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Service Catalog
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            My Services
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track approval status and details for all services you have
            submitted.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:self-center"
        >
          <PlusCircle className="h-4 w-4" />
          Add a Service
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                isSelected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Services List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((skeleton) => (
            <div
              key={skeleton}
              className="h-44 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            No services in this view
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {activeFilter === "all"
              ? "You haven't submitted any repair services yet. Create your first service to get started."
              : `No ${activeFilter} services found under your account.`}
          </p>
          {activeFilter === "all" && (
            <Link
              href="/dashboard/technician/add-service"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" />
              Add a Service
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredServices.map((service) => {
            const statusKey = getServiceStatus(service)
            const badge = APPROVAL_BADGE[statusKey]

            return (
              <div
                key={service._id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/25"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Wrench className="h-6 w-6" />
                        </div>
                      )}

                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-primary" />
                          {service.category || "General"}
                        </span>
                        <h2 className="mt-1 font-heading text-base leading-snug font-bold text-foreground">
                          {service.title}
                        </h2>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        badge.className
                      )}
                    >
                      {statusKey === "approved" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {statusKey === "pending" && <Clock className="h-3 w-3" />}
                      {statusKey === "rejected" && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {badge.label}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {service.serviceMode && (
                      <span className="font-medium text-foreground/80">
                        {service.serviceMode}
                      </span>
                    )}
                    {service.serviceArea && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {service.serviceArea}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Base Price
                    </span>
                    <span className="font-heading text-lg font-extrabold text-foreground">
                      ${Number(service.basePrice || 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
