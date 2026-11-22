"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
  Play,
  RefreshCw,
  User,
  Wrench,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface TechnicianBooking {
  _id: string
  serviceId?: string
  serviceTitle: string
  serviceImage?: string
  category?: string
  basePrice?: number
  finalAmount?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  address?: string
  preferredDate?: string
  problemDescription?: string
  status: string
  paymentStatus?: string
  createdAt?: string
}

type FilterKey =
  "all" | "requested" | "accepted" | "in-progress" | "completed" | "closed"

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

export default function TechnicianManageRequestsPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined
  const userEmail = (user?.email || "").trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bookings, setBookings] = useState<TechnicianBooking[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [finalAmounts, setFinalAmounts] = useState<Record<string, string>>({})

  const fetchBookings = useCallback(async () => {
    if (!userEmail) return
    setRefreshing(true)

    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/technician?email=${encodeURIComponent(
          userEmail
        )}`,
        { cache: "no-store" }
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to load booking requests.")
        return
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : [])
    } catch {
      toast.error("Network error while loading booking requests.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userEmail])

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadInitial = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/bookings/technician?email=${encodeURIComponent(
            userEmail
          )}`,
          { cache: "no-store" }
        )
        const data = await res.json().catch(() => ({}))

        if (!active) return

        if (!res.ok) {
          toast.error(data.message || "Failed to load booking requests.")
          return
        }

        setBookings(Array.isArray(data.bookings) ? data.bookings : [])
      } catch {
        if (active) {
          toast.error("Network error while loading booking requests.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInitial()
    return () => {
      active = false
    }
  }, [userEmail])

  const counts = useMemo(() => {
    let requested = 0
    let accepted = 0
    let inProgress = 0
    let completed = 0
    let closed = 0

    for (const item of bookings) {
      const s = (item.status || "requested").toLowerCase()
      if (s === "requested") requested += 1
      else if (s === "accepted") accepted += 1
      else if (s === "in-progress") inProgress += 1
      else if (s === "completed") completed += 1
      else if (s === "cancelled" || s === "rejected") closed += 1
    }

    return {
      all: bookings.length,
      requested,
      accepted,
      "in-progress": inProgress,
      completed,
      closed,
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings
    if (activeFilter === "closed") {
      return bookings.filter((b) => {
        const s = (b.status || "").toLowerCase()
        return s === "cancelled" || s === "rejected"
      })
    }
    return bookings.filter(
      (b) => (b.status || "requested").toLowerCase() === activeFilter
    )
  }, [bookings, activeFilter])

  const handleStatusUpdate = async (
    booking: TechnicianBooking,
    nextStatus: "accepted" | "rejected" | "in-progress" | "completed"
  ) => {
    const payload: {
      status: string
      technicianEmail: string
      finalAmount?: number
    } = {
      status: nextStatus,
      technicianEmail: userEmail,
    }

    if (nextStatus === "completed") {
      const rawValue =
        finalAmounts[booking._id] ??
        String(booking.finalAmount ?? booking.basePrice ?? "")
      const parsed = Number(rawValue)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast.error("Please enter a valid final amount greater than 0.")
        return
      }
      payload.finalAmount = parsed
    }

    setUpdatingId(booking._id)
    try {
      const res = await fetch(
        `${API_BASE}/api/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to update booking status.")
        return
      }

      if (data.booking) {
        setBookings((prev) =>
          prev.map((item) => (item._id === booking._id ? data.booking : item))
        )
      } else {
        await fetchBookings()
      }

      toast.success(`Request updated to ${formatStatusLabel(nextStatus)}.`)
    } catch {
      toast.error("Network error while updating booking status.")
    } finally {
      setUpdatingId(null)
    }
  }

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "requested", label: "Requested", count: counts.requested },
    { key: "accepted", label: "Accepted", count: counts.accepted },
    { key: "in-progress", label: "In Progress", count: counts["in-progress"] },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "closed", label: "Closed", count: counts.closed },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Job Queue
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Manage Booking Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accept incoming repair jobs, track work in progress, and finalize
            completed service charges.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing || loading}
          onClick={() => fetchBookings()}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60 sm:self-center"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
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

      {/* Booking Request Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            No booking requests found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {activeFilter === "all"
              ? "When customers book your repair services, their requests will appear here."
              : `You currently have no requests in the "${formatStatusLabel(
                  activeFilter
                )}" tab.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusKey = (booking.status || "requested").toLowerCase()
            const isPaid =
              (booking.paymentStatus || "").toLowerCase() === "paid"
            const isUpdating = updatingId === booking._id
            const currentAmount = Number(
              booking.finalAmount ?? booking.basePrice ?? 0
            )
            const finalAmountInput =
              finalAmounts[booking._id] ?? String(currentAmount)

            return (
              <div
                key={booking._id}
                className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/25 sm:p-6"
              >
                {/* Top Row: Service Info & Badges */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    {booking.serviceImage ? (
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Wrench className="h-6 w-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
                          {booking.serviceTitle}
                        </h2>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            STATUS_BADGE[statusKey] || STATUS_BADGE.requested
                          )}
                        >
                          {formatStatusLabel(statusKey)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            isPaid
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-border bg-muted text-muted-foreground"
                          )}
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.category || "Repair Service"} · Requested on{" "}
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {statusKey === "completed"
                        ? "Final Charge"
                        : "Est. Price"}
                    </span>
                    <span className="font-heading text-xl font-extrabold text-foreground">
                      ${currentAmount.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Customer Info Grid */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 rounded-2xl border border-border/70 bg-background/60 p-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate font-medium text-foreground">
                      {booking.customerName ||
                        booking.customerEmail ||
                        "Customer"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">
                      {booking.customerPhone || "No phone provided"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">
                      {booking.address || "Address not specified"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>Preferred: {formatDate(booking.preferredDate)}</span>
                  </div>
                </div>

                {/* Problem Description */}
                {booking.problemDescription && (
                  <div className="mt-3 rounded-2xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Problem Note:{" "}
                    </span>
                    {booking.problemDescription}
                  </div>
                )}

                {/* Workflow Action Footer */}
                <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {statusKey === "requested" &&
                      "Review customer details and accept or decline this request."}
                    {statusKey === "accepted" &&
                      "Ready to begin? Start work once you arrive or receive the device."}
                    {statusKey === "in-progress" &&
                      "Confirm the final repair charge before marking this job complete."}
                    {statusKey === "completed" &&
                      (isPaid
                        ? "Repair completed and customer payment settled."
                        : "Repair completed. Waiting for customer online payment.")}
                    {(statusKey === "cancelled" || statusKey === "rejected") &&
                      "This booking request is closed."}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {statusKey === "requested" && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(booking, "rejected")
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 disabled:opacity-60 dark:text-rose-400"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(booking, "accepted")
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Accept Request
                        </button>
                      </>
                    )}

                    {statusKey === "accepted" && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusUpdate(booking, "in-progress")
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Start Work
                      </button>
                    )}

                    {statusKey === "in-progress" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex items-center">
                          <DollarSign className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="number"
                            min="1"
                            step="1"
                            aria-label="Final charge amount"
                            value={finalAmountInput}
                            onChange={(e) =>
                              setFinalAmounts((prev) => ({
                                ...prev,
                                [booking._id]: e.target.value,
                              }))
                            }
                            className="w-28 rounded-xl border border-border bg-background py-2 pr-3 pl-7 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(booking, "completed")
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Mark Completed
                        </button>
                      </div>
                    )}
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
