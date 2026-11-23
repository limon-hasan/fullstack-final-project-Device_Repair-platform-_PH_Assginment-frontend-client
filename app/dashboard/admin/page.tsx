"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  PieChart,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { getAuthHeaders } from "@/lib/auth-token"

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

interface BookingStatusCounts {
  requested: number
  accepted: number
  "in-progress": number
  completed: number
  cancelled: number
  rejected: number
}

interface CategoryCountItem {
  category: string
  count: number
}

interface AdminChartsData {
  bookingStatusCounts: BookingStatusCounts
  servicesByCategory: CategoryCountItem[]
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

const INITIAL_CHARTS: AdminChartsData = {
  bookingStatusCounts: {
    requested: 0,
    accepted: 0,
    "in-progress": 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  },
  servicesByCategory: [],
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

const DONUT_META = [
  {
    key: "requested",
    label: "Requested",
    stroke: "#0ea5e9",
    dot: "bg-sky-500",
  },
  {
    key: "accepted",
    label: "Accepted",
    stroke: "#6366f1",
    dot: "bg-indigo-500",
  },
  {
    key: "in-progress",
    label: "In Progress",
    stroke: "#f59e0b",
    dot: "bg-amber-500",
  },
  {
    key: "completed",
    label: "Completed",
    stroke: "#10b981",
    dot: "bg-emerald-500",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    stroke: "#f43f5e",
    dot: "bg-rose-500",
  },
  {
    key: "rejected",
    label: "Rejected",
    stroke: "#64748b",
    dot: "bg-slate-500",
  },
] as const

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
  const [charts, setCharts] = useState<AdminChartsData>(INITIAL_CHARTS)
  const [pendingServices, setPendingServices] = useState<PendingServiceItem[]>(
    []
  )
  const [recentBookings, setRecentBookings] = useState<RecentBookingItem[]>([])
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)

  const fetchOverviewData = async () => {
    const authHeaders = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/api/admin/overview`, {
      cache: "no-store",
      headers: authHeaders,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load admin overview.")
    }
    return data
  }

  const applyOverviewData = (data: Record<string, unknown>) => {
    if (data.stats) setStats(data.stats as AdminOverviewStats)
    if (data.charts) {
      const c = data.charts as Partial<AdminChartsData>
      setCharts({
        bookingStatusCounts: {
          ...INITIAL_CHARTS.bookingStatusCounts,
          ...(c.bookingStatusCounts || {}),
        },
        servicesByCategory: Array.isArray(c.servicesByCategory)
          ? c.servicesByCategory
          : [],
      })
    }
    setPendingServices(
      Array.isArray(data.recentPendingServices)
        ? (data.recentPendingServices as PendingServiceItem[])
        : []
    )
    setRecentBookings(
      Array.isArray(data.recentBookings)
        ? (data.recentBookings as RecentBookingItem[])
        : []
    )
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const data = await fetchOverviewData()
        if (!active) return
        applyOverviewData(data)
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
      applyOverviewData(data)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh overview."
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  // Donut chart slices (falls back cleanly if backend has not been restarted yet)
  const donutSlices = useMemo(() => {
    const counts = charts.bookingStatusCounts
    const sumFromApi = Object.values(counts).reduce((acc, v) => acc + v, 0)

    const resolvedCounts: BookingStatusCounts =
      sumFromApi > 0
        ? counts
        : {
            requested: stats.activeBookings,
            accepted: 0,
            "in-progress": 0,
            completed: stats.completedBookings,
            cancelled: Math.max(
              0,
              stats.totalBookings -
                stats.activeBookings -
                stats.completedBookings
            ),
            rejected: 0,
          }

    const total = Object.values(resolvedCounts).reduce((acc, v) => acc + v, 0)
    const radius = 56
    const circumference = 2 * Math.PI * radius

    const items = DONUT_META.reduce<
      Array<
        (typeof DONUT_META)[number] & {
          count: number
          pct: number
          segment: number
          dashOffset: number
        }
      >
    >((acc, meta) => {
      const count = resolvedCounts[meta.key] || 0
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      const segment = total > 0 ? (count / total) * circumference : 0
      const prevCumulative = acc.reduce((sum, item) => sum + item.segment, 0)
      const dashOffset = -prevCumulative

      return [
        ...acc,
        {
          ...meta,
          count,
          pct,
          segment,
          dashOffset,
        },
      ]
    }, [])

    return { items, total, radius, circumference }
  }, [charts.bookingStatusCounts, stats])

  const activeSlice = useMemo(() => {
    if (!hoveredStatus) return null
    return donutSlices.items.find((item) => item.key === hoveredStatus) || null
  }, [hoveredStatus, donutSlices.items])

  const maxCategoryCount = useMemo(() => {
    return Math.max(...charts.servicesByCategory.map((item) => item.count), 1)
  }, [charts.servicesByCategory])

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

  const userRoleBars = [
    {
      label: "Customers",
      count: stats.totalCustomers,
      color: "bg-sky-500",
    },
    {
      label: "Technicians",
      count: stats.totalTechnicians,
      color: "bg-primary",
    },
    {
      label: "Admins",
      count: stats.totalAdmins,
      color: "bg-amber-500",
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

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Booking Pipeline Donut Chart */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Booking Status Distribution
              </h2>
              <p className="text-xs text-muted-foreground">
                Live pipeline breakdown across all customer repair requests
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PieChart className="h-4 w-4" />
            </span>
          </div>

          {loading ? (
            <div className="mt-6 h-48 animate-pulse rounded-2xl bg-muted/60" />
          ) : (
            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
              {/* Interactive SVG Donut */}
              <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
                <svg
                  viewBox="0 0 140 140"
                  className="h-full w-full -rotate-90"
                  aria-label="Booking status donut chart"
                >
                  <circle
                    cx="70"
                    cy="70"
                    r={donutSlices.radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="16"
                    className="text-muted/40"
                  />
                  {donutSlices.total > 0 &&
                    donutSlices.items.map((slice) =>
                      slice.count > 0 ? (
                        <circle
                          key={slice.key}
                          cx="70"
                          cy="70"
                          r={donutSlices.radius}
                          fill="none"
                          stroke={slice.stroke}
                          strokeWidth={hoveredStatus === slice.key ? 19 : 16}
                          strokeDasharray={`${slice.segment} ${
                            donutSlices.circumference - slice.segment
                          }`}
                          strokeDashoffset={slice.dashOffset}
                          className="cursor-pointer transition-all duration-300"
                          onMouseEnter={() => setHoveredStatus(slice.key)}
                          onMouseLeave={() => setHoveredStatus(null)}
                        />
                      ) : null
                    )}
                </svg>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-heading text-2xl font-extrabold text-foreground tabular-nums">
                    {activeSlice ? activeSlice.count : donutSlices.total}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {activeSlice
                      ? `${activeSlice.label} (${activeSlice.pct}%)`
                      : "Total Jobs"}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid w-full grid-cols-2 gap-2.5">
                {donutSlices.items.map((slice) => (
                  <div
                    key={slice.key}
                    onMouseEnter={() => setHoveredStatus(slice.key)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs transition-colors",
                      hoveredStatus === slice.key &&
                        "border-primary/40 bg-primary/5"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate text-muted-foreground">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          slice.dot
                        )}
                      />
                      <span className="truncate font-medium text-foreground">
                        {slice.label}
                      </span>
                    </span>
                    <span className="ml-2 font-heading font-bold text-foreground tabular-nums">
                      {slice.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Chart 2: Services by Category Bar Chart + User Roles */}
        <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Services by Category
                </h2>
                <p className="text-xs text-muted-foreground">
                  Distribution of repair listings across appliance categories
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                <BarChart3 className="h-4 w-4" />
              </span>
            </div>

            {loading ? (
              <div className="mt-6 h-48 animate-pulse rounded-2xl bg-muted/60" />
            ) : charts.servicesByCategory.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                Category metrics will appear once repair services are listed.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {charts.servicesByCategory.slice(0, 6).map((item) => {
                  const widthPct = Math.max(
                    8,
                    Math.round((item.count / maxCategoryCount) * 100)
                  )
                  const sharePct =
                    stats.totalServices > 0
                      ? Math.round((item.count / stats.totalServices) * 100)
                      : 0

                  return (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {item.category}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          <strong className="font-semibold text-foreground">
                            {item.count}
                          </strong>{" "}
                          ({sharePct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* User Role Mini Breakdown */}
          {!loading && stats.totalUsers > 0 && (
            <div className="mt-6 border-t border-border/70 pt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  User Role Split
                </span>
                <span className="text-muted-foreground">
                  {stats.totalUsers} registered accounts
                </span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                {userRoleBars.map((role) => {
                  const pct = (role.count / stats.totalUsers) * 100
                  if (pct <= 0) return null
                  return (
                    <div
                      key={role.label}
                      title={`${role.label}: ${role.count}`}
                      className={cn("h-full transition-all", role.color)}
                      style={{ width: `${pct}%` }}
                    />
                  )
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                {userRoleBars.map((role) => (
                  <span
                    key={role.label}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span className={cn("h-2 w-2 rounded-full", role.color)} />
                    <span>
                      {role.label}:{" "}
                      <strong className="text-foreground">{role.count}</strong>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

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
