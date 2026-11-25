"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calendar,
  ClipboardList,
  MapPin,
  RefreshCw,
  Search,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { getAuthHeaders } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface AdminBooking {
  _id: string
  serviceTitle: string
  serviceImage?: string
  category?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  technicianName?: string
  technicianEmail?: string
  address?: string
  preferredDate?: string
  basePrice?: number
  finalAmount?: number
  status?: string
  paymentStatus?: string
  createdAt?: string
}

type StatusFilter =
  | "all"
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "rejected"

type PaymentFilter = "all" | "paid" | "unpaid"

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

export default function AdminAllBookingsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchAllBookings = async () => {
    const authHeaders = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/api/admin/bookings?status=all`, {
      cache: "no-store",
      headers: authHeaders,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load platform bookings.")
    }
    return Array.isArray(data.bookings) ? (data.bookings as AdminBooking[]) : []
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const list = await fetchAllBookings()
        if (!active) return
        setBookings(list)
      } catch (err) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Network error while loading bookings."
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
      const list = await fetchAllBookings()
      setBookings(list)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh bookings."
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const counts = useMemo(() => {
    const map = {
      all: bookings.length,
      requested: 0,
      accepted: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    }

    for (const b of bookings) {
      const s = (b.status || "requested").toLowerCase()
      if (s in map) {
        map[s as keyof typeof map] += 1
      }
    }

    return map
  }, [bookings])

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return bookings.filter((b) => {
      const s = (b.status || "requested").toLowerCase()
      const p = (b.paymentStatus || "unpaid").toLowerCase()

      if (statusFilter !== "all" && s !== statusFilter) return false
      if (paymentFilter !== "all" && p !== paymentFilter) return false

      if (!q) return true
      const haystack = [
        b.serviceTitle,
        b.category,
        b.customerName,
        b.customerEmail,
        b.technicianName,
        b.technicianEmail,
        b.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [bookings, statusFilter, paymentFilter, searchQuery])

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "requested", label: "Requested", count: counts.requested },
    { key: "accepted", label: "Accepted", count: counts.accepted },
    { key: "in-progress", label: "In Progress", count: counts["in-progress"] },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Operations Monitor
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            All Platform Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every repair request across customers and technicians in real
            time.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing || loading}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60 sm:self-center"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters Row */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search service, customer, technician, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pr-4 pl-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter by payment status"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none sm:w-44"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            No bookings match your filters
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Adjust the status, payment filter, or search term to view other
            bookings.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm xl:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Technician</th>
                    <th className="px-4 py-4">Preferred Date</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredBookings.map((booking) => {
                    const statusKey = (
                      booking.status || "requested"
                    ).toLowerCase()
                    const isPaid =
                      (booking.paymentStatus || "").toLowerCase() === "paid"
                    const amount = Number(
                      booking.finalAmount ?? booking.basePrice ?? 0
                    )

                    return (
                      <tr
                        key={booking._id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {booking.serviceImage ? (
                              <img
                                src={booking.serviceImage}
                                alt={booking.serviceTitle}
                                className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Wrench className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="max-w-xs truncate font-semibold text-foreground">
                                {booking.serviceTitle}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {booking.category || "Repair"} ·{" "}
                                {booking.address || "No address"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-foreground">
                            {booking.customerName || "Customer"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.customerEmail || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-foreground">
                            {booking.technicianName || "Technician"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.technicianEmail || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {formatDate(
                            booking.preferredDate || booking.createdAt
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                                STATUS_BADGE[statusKey] ||
                                  STATUS_BADGE.requested
                              )}
                            >
                              {formatStatusLabel(statusKey)}
                            </span>
                            {statusKey === "completed" && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                  isPaid
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                )}
                              >
                                {isPaid ? "Paid" : "Unpaid"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-heading font-bold text-foreground">
                            ${amount.toFixed(0)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {booking.finalAmount ? "Final" : "Base"}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
            {filteredBookings.map((booking) => {
              const statusKey = (booking.status || "requested").toLowerCase()
              const isPaid =
                (booking.paymentStatus || "").toLowerCase() === "paid"
              const amount = Number(
                booking.finalAmount ?? booking.basePrice ?? 0
              )

              return (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-heading text-base font-bold text-foreground">
                        {booking.serviceTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {booking.category || "Repair"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        STATUS_BADGE[statusKey] || STATUS_BADGE.requested
                      )}
                    >
                      {formatStatusLabel(statusKey)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Customer: {booking.customerName || booking.customerEmail}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      Tech: {booking.technicianName || booking.technicianEmail}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {booking.address || "Address not specified"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {formatDate(booking.preferredDate || booking.createdAt)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    {statusKey === "completed" ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          isPaid
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        )}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {booking.finalAmount ? "Final Charge" : "Base Price"}
                      </span>
                    )}
                    <span className="font-heading text-lg font-extrabold text-foreground">
                      ${amount.toFixed(0)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
