"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  Search,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface CustomerBooking {
  _id: string
  serviceId: string
  serviceTitle: string
  serviceImage?: string
  category?: string
  basePrice?: number
  finalAmount?: number
  technicianName?: string
  preferredDate?: string
  status: string
  paymentStatus?: string
  createdAt?: string
}

interface CustomerStats {
  total: number
  active: number
  completed: number
  unpaidCompleted: number
  totalSpent: number
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

export default function CustomerOverviewPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined

  const userEmail = user?.email || ""

  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    completed: 0,
    unpaidCompleted: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadOverview = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/bookings/customer?email=${encodeURIComponent(
            userEmail
          )}`,
          { cache: "no-store" }
        )
        const data = await res.json().catch(() => ({}))

        if (!active) return

        if (!res.ok) {
          toast.error(data.message || "Failed to load dashboard overview.")
          return
        }

        setBookings(Array.isArray(data.bookings) ? data.bookings : [])
        if (data.stats) {
          setStats({
            total: Number(data.stats.total || 0),
            active: Number(data.stats.active || 0),
            completed: Number(data.stats.completed || 0),
            unpaidCompleted: Number(data.stats.unpaidCompleted || 0),
            totalSpent: Number(data.stats.totalSpent || 0),
          })
        }
      } catch {
        if (active) {
          toast.error("Network error while loading your overview.")
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

  const recentBookings = bookings.slice(0, 5)

  const statCards = [
    {
      label: "Total Requests",
      value: stats.total,
      hint: "All repair bookings",
      icon: ClipboardList,
      accent: "bg-primary/15 text-primary",
    },
    {
      label: "Active Repairs",
      value: stats.active,
      hint: "Requested, accepted, or in progress",
      icon: Clock,
      accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Completed Jobs",
      value: stats.completed,
      hint: "Finished repair services",
      icon: CheckCircle2,
      accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Spent",
      value: `$${stats.totalSpent.toFixed(0)}`,
      hint: "Paid via Stripe Checkout",
      icon: DollarSign,
      accent: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Customer Overview
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Welcome back, {user?.name?.split(" ")[0] || "Customer"}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your ongoing repair requests, review completed jobs, and
            manage payments in one place.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:self-center"
        >
          <Search className="h-4 w-4" />
          Book a Repair
        </Link>
      </div>

      {/* Unpaid Completed Jobs Reminder Banner */}
      {!loading && stats.unpaidCompleted > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-bold text-foreground">
                {stats.unpaidCompleted} completed{" "}
                {stats.unpaidCompleted === 1 ? "repair is" : "repairs are"}{" "}
                ready for payment
              </p>
              <p className="text-xs text-muted-foreground">
                Open My Bookings to settle the final amount securely via Stripe.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 sm:self-center"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Go to Pay
          </Link>
        </div>
      )}

      {/* Summary Stat Cards */}
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
              <div
                key={card.label}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {card.label}
                  </p>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                      card.accent
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 font-heading text-3xl font-extrabold text-foreground">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.hint}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Bookings */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent Repair Requests
            </h2>
            <p className="text-xs text-muted-foreground">
              Your latest repair activity and live statuses
            </p>
          </div>

          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-20 animate-pulse rounded-2xl bg-muted/60"
              />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-heading text-base font-bold text-foreground">
              No repair requests yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Need help with a smartphone, laptop, AC, or home appliance? Browse
              verified technicians and book with $0 upfront.
            </p>
            <Link
              href="/services"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border/70">
            {recentBookings.map((booking) => {
              const statusKey = (booking.status || "requested").toLowerCase()
              const paymentKey = (
                booking.paymentStatus || "unpaid"
              ).toLowerCase()
              const amount = Number(
                booking.finalAmount ?? booking.basePrice ?? 0
              )

              return (
                <div
                  key={booking._id}
                  className="flex flex-col gap-4 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    {booking.serviceImage ? (
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Wrench className="h-5 w-5" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-bold text-foreground sm:text-base">
                        {booking.serviceTitle}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Tech:{" "}
                          <strong className="font-medium text-foreground">
                            {booking.technicianName || "Assigned Technician"}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(booking.preferredDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          STATUS_BADGE[statusKey] || STATUS_BADGE.requested
                        )}
                      >
                        {formatStatusLabel(statusKey)}
                      </span>

                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                          paymentKey === "paid"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border bg-muted/60 text-muted-foreground"
                        )}
                      >
                        {paymentKey}
                      </span>
                    </div>

                    <p className="min-w-[52px] text-right font-heading text-base font-extrabold text-foreground">
                      ${amount.toFixed(0)}
                    </p>
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
