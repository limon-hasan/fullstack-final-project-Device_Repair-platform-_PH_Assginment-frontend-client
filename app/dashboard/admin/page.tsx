"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface AdminOverviewStats {
  totalUsers: number
  totalCustomers: number
  totalTechnicians: number
  totalAdmins: number
  totalServices: number
  approvedServices: number
  pendingServices: number
  rejectedServices: number
  totalBookings: number
  activeBookings: number
  completedBookings: number
  paidBookings: number
  totalRevenue: number
}

interface PendingServiceItem {
  _id: string
  title: string
  category?: string
  image?: string
  basePrice?: number
  technicianName?: string
  technicianEmail?: string
  serviceMode?: string
  createdAt?: string
}

interface RecentBookingItem {
  _id: string
  serviceTitle: string
  customerName?: string
  customerEmail?: string
  technicianName?: string
  status?: string
  paymentStatus?: string
  basePrice?: number
  finalAmount?: number
  preferredDate?: string
  createdAt?: string
}

const INITIAL_STATS: AdminOverviewStats = {
  totalUsers: 0,
  totalCustomers: 0,
  totalTechnicians: 0,
  totalAdmins: 0,
  totalServices: 0,
  approvedServices: 0,
  pendingServices: 0,
  rejectedServices: 0,
  totalBookings: 0,
  activeBookings: 0,
  completedBookings: 0,
  paidBookings: 0,
  totalRevenue: 0,
}

const STATUS_BADGE: Record<string, string> = {
  requested: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  accepted:
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "in-progress":
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  completed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  cancelled:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  rejected:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

function formatStatusLabel(status?: string) {
  const s = (status || "requested").toLowerCase()
  if (s === "in-progress") return "In Progress"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function AdminOverviewPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as { name?: string | null } | undefined

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<AdminOverviewStats>(INITIAL_STATS)
  const [pendingServices, setPendingServices] = useState<PendingServiceItem[]>(
    []
  )
  const [recentBookings, setRecentBookings] = useState<RecentBookingItem[]>([])

  const fetchOverviewData = async () => {
    const res = await fetch(`${API_BASE}/api/admin/overview`, {
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load admin overview.")
    }
    return data
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const data = await fetchOverviewData()
        if (!active) return

        if (data.stats) setStats(data.stats)
        setPendingServices(
          Array.isArray(data.recentPendingServices)
            ? data.recentPendingServices
            : []
        )
        setRecentBookings(
          Array.isArray(data.recentBookings) ? data.recentBookings : []
        )
      } catch (err) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Network error while loading overview."
          toast.error(msg)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const data = await fetchOverviewData()
      if (data.stats) setStats(data.stats)
      setPendingServices(
        Array.isArray(data.recentPendingServices)
          ? data.recentPendingServices
          : []
      )
      setRecentBookings(
        Array.isArray(data.recentBookings) ? data.recentBookings : []
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh overview."
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const statCards = [
    {
      label: "Total Users",
      value: String(stats.totalUsers),
      sub: `${stats.totalCustomers} customers · ${stats.totalTechnicians} techs · ${stats.totalAdmins} admins`,
      href: "/dashboard/admin/users",
      icon: Users,
      iconBg: "bg-primary/15 text-primary",
    },
    {
      label: "Total Services",
      value: String(stats.totalServices),
      sub: `${stats.approvedServices} approved · ${stats.pendingServices} pending`,
      href: "/dashboard/admin/services",
      icon: Wrench,
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Total Bookings",
      value: String(stats.totalBookings),
      sub: `${stats.activeBookings} active · ${stats.completedBookings} completed`,
      href: "/dashboard/admin/bookings",
      icon: ClipboardList,
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Platform Revenue",
      value: `$${Number(stats.totalRevenue || 0).toFixed(0)}`,
      sub: `Across ${stats.paidBookings} paid bookings`,
      href: "/dashboard/admin/transactions",
      icon: DollarSign,
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Platform Control Center
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Admin Overview, {user?.name || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor users, moderate technician service submissions, and track
            platform bookings and revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={refreshing || loading}
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
            Refresh
          </button>

          <Link
            href="/dashboard/admin/services"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <ShieldCheck className="h-4 w-4" />
            Review Services
            {stats.pendingServices > 0 && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                {stats.pendingServices}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.label}
                href={card.href}
                className="block rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {card.label}
                  </p>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                      card.iconBg
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 font-heading text-3xl font-extrabold text-foreground">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              </Link>
            )
          })}
        </div>
      )}

      {/* Two-Column Preview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Service Approvals */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Pending Service Approvals
              </h2>
              <p className="text-xs text-muted-foreground">
                New or edited technician listings waiting for review
              </p>
            </div>
            <Link
              href="/dashboard/admin/services"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Moderate
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-16 animate-pulse rounded-2xl bg-muted/60"
                />
              ))}
            </div>
          ) : pendingServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                All caught up!
              </h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                There are no pending service submissions waiting for moderation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {pendingServices.map((service) => (
                <div
                  key={service._id}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/25"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wrench className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-bold text-foreground">
                        {service.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {service.technicianName || service.technicianEmail} ·{" "}
                        {service.category || "Service"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                    <span className="font-heading text-sm font-extrabold text-foreground">
                      ${Number(service.basePrice || 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Bookings */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Recent Platform Bookings
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest customer repair requests across FixMate
              </p>
            </div>
            <Link
              href="/dashboard/admin/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-16 animate-pulse rounded-2xl bg-muted/60"
                />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                No bookings yet
              </h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Customer repair bookings will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {recentBookings.map((booking) => {
                const statusKey = (booking.status || "requested").toLowerCase()
                const amount = Number(
                  booking.finalAmount ?? booking.basePrice ?? 0
                )

                return (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/25"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-heading text-sm font-bold text-foreground">
                          {booking.serviceTitle}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            STATUS_BADGE[statusKey] || STATUS_BADGE.requested
                          )}
                        >
                          {formatStatusLabel(statusKey)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {booking.customerName ||
                            booking.customerEmail ||
                            "Customer"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(
                            booking.preferredDate || booking.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="shrink-0 font-heading text-sm font-extrabold text-foreground">
                      ${amount.toFixed(0)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
