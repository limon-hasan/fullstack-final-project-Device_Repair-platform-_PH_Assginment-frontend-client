"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  PlusCircle,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface TechnicianBooking {
  _id: string
  serviceId?: string
  serviceTitle: string
  category?: string
  basePrice?: number
  finalAmount?: number
  customerName?: string
  customerEmail?: string
  address?: string
  preferredDate?: string
  status: string
  paymentStatus?: string
  createdAt?: string
}

interface ServiceStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

interface BookingStats {
  total: number
  requested: number
  accepted: number
  inProgress: number
  completed: number
  earnings: number
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

export default function TechnicianOverviewPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined
  const userEmail = (user?.email || "").trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [serviceStats, setServiceStats] = useState<ServiceStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  })
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0,
    requested: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    earnings: 0,
  })
  const [bookings, setBookings] = useState<TechnicianBooking[]>([])

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadOverview = async () => {
      setLoading(true)
      try {
        const [servicesRes, bookingsRes] = await Promise.all([
          fetch(
            `${API_BASE}/api/services/technician?email=${encodeURIComponent(
              userEmail
            )}`,
            { cache: "no-store" }
          ),
          fetch(
            `${API_BASE}/api/bookings/technician?email=${encodeURIComponent(
              userEmail
            )}`,
            { cache: "no-store" }
          ),
        ])

        const servicesData = await servicesRes.json().catch(() => ({}))
        const bookingsData = await bookingsRes.json().catch(() => ({}))

        if (!active) return

        if (servicesRes.ok && servicesData.stats) {
          setServiceStats(servicesData.stats)
        }

        if (bookingsRes.ok) {
          if (bookingsData.stats) {
            setBookingStats(bookingsData.stats)
          }
          setBookings(
            Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []
          )
        }

        if (!servicesRes.ok && !bookingsRes.ok) {
          toast.error("Failed to load technician dashboard data.")
        }
      } catch {
        if (active) {
          toast.error("Network error while loading dashboard data.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOverview()
    return () => {
      active = false
    }
  }, [userEmail])

  const activeJobsCount = useMemo(
    () => bookingStats.accepted + bookingStats.inProgress,
    [bookingStats.accepted, bookingStats.inProgress]
  )

  const recentBookings = useMemo(() => bookings.slice(0, 4), [bookings])

  const statCards = [
    {
      label: "Total Services",
      value: String(serviceStats.total),
      sub: `${serviceStats.pending} pending · ${serviceStats.rejected} rejected`,
      href: "/dashboard/technician/my-services",
      icon: Wrench,
      iconBg: "bg-primary/15 text-primary",
    },
    {
      label: "Approved Services",
      value: String(serviceStats.approved),
      sub: "Live on FixMate marketplace",
      href: "/dashboard/technician/my-services",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending Requests",
      value: String(bookingStats.requested),
      sub: `${activeJobsCount} active · ${bookingStats.completed} completed`,
      href: "/dashboard/technician/requests",
      icon: Clock,
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Total Earnings",
      value: `$${Number(bookingStats.earnings || 0).toFixed(0)}`,
      sub: `From ${bookingStats.completed} completed jobs`,
      href: "/dashboard/technician/requests",
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
            Technician Workspace
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Welcome back, {user?.name || "Technician"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your repair services, respond to customer requests, and track
            completed jobs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/technician/add-service"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            Add a Service
          </Link>
          <Link
            href="/dashboard/technician/my-services"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            My Services
          </Link>
          <Link
            href="/dashboard/technician/requests"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Manage Requests
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

      {/* Recent Booking Requests */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent Booking Requests
            </h2>
            <p className="text-xs text-muted-foreground">
              Latest customer repair requests assigned to you
            </p>
          </div>

          <Link
            href="/dashboard/technician/requests"
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
              No repair requests yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Once customers book your approved services, new requests will
              appear here.
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
                  className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-heading text-sm font-bold text-foreground">
                        {booking.serviceTitle}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          STATUS_BADGE[statusKey] || STATUS_BADGE.requested
                        )}
                      >
                        {formatStatusLabel(statusKey)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {booking.customerName ||
                          booking.customerEmail ||
                          "Customer"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(booking.preferredDate || booking.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="font-heading text-base font-extrabold text-foreground">
                      ${amount.toFixed(0)}
                    </span>
                    <Link
                      href="/dashboard/technician/requests"
                      className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
