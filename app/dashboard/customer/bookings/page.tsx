"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Search,
  User,
  Wrench,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/auth-token"
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
  technicianEmail?: string
  customerPhone?: string
  address?: string
  preferredDate?: string
  problemDescription?: string
  status: string
  paymentStatus?: string
  createdAt?: string
}

type FilterTab = "all" | "active" | "completed" | "closed"

const PIPELINE_STEPS = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
] as const

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

export default function CustomerBookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()
  const user = session?.user as { email?: string | null } | undefined
  const userEmail = user?.email || ""

  const [loading, setLoading] = useState(true)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const verifiedSessionRef = useRef<string | null>(null)
  const cancelledNotifiedRef = useRef(false)

  const loadBookings = async (email: string) => {
    const authHeaders = await getAuthHeaders()
    const res = await fetch(
      `${API_BASE}/api/bookings/customer?email=${encodeURIComponent(email)}`,
      { cache: "no-store", headers: authHeaders }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load your bookings.")
    }
    return Array.isArray(data.bookings)
      ? (data.bookings as CustomerBooking[])
      : []
  }

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const init = async () => {
      setLoading(true)
      try {
        const list = await loadBookings(userEmail)
        if (!active) return
        setBookings(list)
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Network error while loading your bookings."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [userEmail])

  // Verify Stripe Checkout return session
  useEffect(() => {
    const paymentStatusParam = searchParams.get("payment")
    const sessionId = searchParams.get("session_id")

    if (paymentStatusParam === "cancelled" && !cancelledNotifiedRef.current) {
      cancelledNotifiedRef.current = true
      toast.info("Stripe payment was cancelled.")
      router.replace("/dashboard/customer/bookings")
      return
    }

    if (
      paymentStatusParam === "success" &&
      sessionId &&
      userEmail &&
      verifiedSessionRef.current !== sessionId
    ) {
      verifiedSessionRef.current = sessionId

      const verify = async () => {
        setVerifyingPayment(true)
        try {
          const authHeaders = await getAuthHeaders({
            "Content-Type": "application/json",
          })
          const res = await fetch(`${API_BASE}/api/payments/verify-session`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ sessionId }),
          })

          const data = await res.json().catch(() => ({}))

          if (!res.ok) {
            toast.error(data.message || "Could not verify Stripe payment.")
            return
          }

          if (data.bookingId) {
            setBookings((prev) =>
              prev.map((item) =>
                item._id === data.bookingId
                  ? { ...item, paymentStatus: "paid" }
                  : item
              )
            )
          }

          toast.success(
            data.message || "Payment completed and verified via Stripe!"
          )

          try {
            const refreshed = await loadBookings(userEmail)
            setBookings(refreshed)
          } catch {
            // Local state is already updated above
          }

          router.replace("/dashboard/customer/bookings")
        } catch {
          toast.error("Network error while verifying Stripe payment.")
        } finally {
          setVerifyingPayment(false)
        }
      }

      verify()
    }
  }, [searchParams, router, userEmail])

  const tabCounts = useMemo(() => {
    const activeSet = new Set(["requested", "accepted", "in-progress"])
    const closedSet = new Set(["cancelled", "rejected"])

    let activeCount = 0
    let completedCount = 0
    let closedCount = 0

    for (const item of bookings) {
      const s = (item.status || "").toLowerCase()
      if (activeSet.has(s)) activeCount += 1
      else if (s === "completed") completedCount += 1
      else if (closedSet.has(s)) closedCount += 1
    }

    return {
      all: bookings.length,
      active: activeCount,
      completed: completedCount,
      closed: closedCount,
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (activeTab === "all") return bookings
    if (activeTab === "active") {
      return bookings.filter((b) =>
        ["requested", "accepted", "in-progress"].includes(
          (b.status || "").toLowerCase()
        )
      )
    }
    if (activeTab === "completed") {
      return bookings.filter(
        (b) => (b.status || "").toLowerCase() === "completed"
      )
    }
    return bookings.filter((b) =>
      ["cancelled", "rejected"].includes((b.status || "").toLowerCase())
    )
  }, [bookings, activeTab])

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !userEmail) return

    setCancelling(true)
    try {
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(
        `${API_BASE}/api/bookings/${cancelTarget._id}/cancel`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ customerEmail: userEmail }),
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message || "Could not cancel this booking.")
        return
      }

      setBookings((prev) =>
        prev.map((item) =>
          item._id === cancelTarget._id
            ? { ...item, status: "cancelled" }
            : item
        )
      )
      toast.success("Repair request cancelled successfully.")
      setCancelTarget(null)
    } catch {
      toast.error("Network error while cancelling request.")
    } finally {
      setCancelling(false)
    }
  }

  const handlePayNowClick = async (booking: CustomerBooking) => {
    if (!userEmail) {
      toast.error("Please sign in again to complete payment.")
      return
    }

    setPayingBookingId(booking._id)
    try {
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(
        `${API_BASE}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            bookingId: booking._id,
            customerEmail: userEmail,
          }),
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        toast.error(data.message || "Could not start Stripe Checkout.")
        setPayingBookingId(null)
        return
      }

      window.location.assign(data.url)
    } catch {
      toast.error("Network error while starting Stripe Checkout.")
      setPayingBookingId(null)
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: tabCounts.all },
    { key: "active", label: "Active", count: tabCounts.active },
    { key: "completed", label: "Completed", count: tabCounts.completed },
    { key: "closed", label: "Cancelled / Rejected", count: tabCounts.closed },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Payment Verification Banner */}
      {verifyingPayment && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Verifying your Stripe payment and updating receipt...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Repair Pipeline
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track live repair progress, cancel pending requests, or settle
            completed jobs via Stripe.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:self-center"
        >
          <Search className="h-4 w-4" />
          Book New Service
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px]",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
            {activeTab === "all"
              ? "No bookings found yet"
              : "No bookings in this category"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {activeTab === "all"
              ? "Explore verified local technicians and request a repair with $0 upfront."
              : "Switch tabs to view your other repair requests."}
          </p>
          {activeTab === "all" && (
            <Link
              href="/services"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => {
            const statusKey = (booking.status || "requested").toLowerCase()
            const paymentKey = (booking.paymentStatus || "unpaid").toLowerCase()
            const isClosed =
              statusKey === "cancelled" || statusKey === "rejected"
            const currentStepIdx = PIPELINE_STEPS.findIndex(
              (step) => step.key === statusKey
            )
            const amount = Number(booking.finalAmount ?? booking.basePrice ?? 0)
            const canCancel = statusKey === "requested"
            const canPay = statusKey === "completed" && paymentKey !== "paid"
            const isPayingThis = payingBookingId === booking._id

            return (
              <article
                key={booking._id}
                className="overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/25 sm:p-6"
              >
                {/* Top Info Row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    {booking.serviceImage ? (
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
                      />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground sm:h-20 sm:w-20">
                        <Wrench className="h-6 w-6" />
                      </span>
                    )}

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {booking.category && (
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            {booking.category}
                          </span>
                        )}
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

                      <h2 className="font-heading text-base font-extrabold text-foreground sm:text-lg">
                        <Link
                          href={`/services/${booking.serviceId}`}
                          className="hover:text-primary hover:underline"
                        >
                          {booking.serviceTitle}
                        </Link>
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {booking.technicianName || "Assigned Technician"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Preferred: {formatDate(booking.preferredDate)}
                        </span>
                        {booking.address && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {booking.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {statusKey === "completed"
                        ? "Final Amount"
                        : "Estimated Base"}
                    </p>
                    <p className="font-heading text-2xl font-extrabold text-foreground">
                      ${amount.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Problem Note */}
                {booking.problemDescription && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="leading-relaxed">
                      <span className="font-semibold text-foreground">
                        Issue Note:{" "}
                      </span>
                      {booking.problemDescription}
                    </p>
                  </div>
                )}

                {/* 4-Step Pipeline OR Cancelled/Rejected Notice */}
                <div className="mt-5">
                  {isClosed ? (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>
                        {statusKey === "cancelled"
                          ? "You cancelled this repair request before technician acceptance."
                          : "This repair request was declined by the technician."}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {PIPELINE_STEPS.map((step, index) => {
                          const isDone =
                            currentStepIdx > index ||
                            (statusKey === "completed" && index === 3)
                          const isCurrent =
                            currentStepIdx === index &&
                            statusKey !== "completed"

                          return (
                            <div
                              key={step.key}
                              className="flex items-center gap-2.5"
                            >
                              <span
                                className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                                  isDone
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : isCurrent
                                      ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/25"
                                      : "border-border bg-muted text-muted-foreground"
                                )}
                              >
                                {isDone ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  index + 1
                                )}
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "text-xs leading-tight font-semibold break-words",
                                    isDone || isCurrent
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {step.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {isDone
                                    ? "Done"
                                    : isCurrent
                                      ? "Current"
                                      : "Pending"}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Requested on {formatDate(booking.createdAt)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(booking)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel Request
                      </button>
                    )}

                    {canPay && (
                      <button
                        type="button"
                        disabled={isPayingThis || verifyingPayment}
                        onClick={() => handlePayNowClick(booking)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPayingThis ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3.5 w-3.5" />
                            Pay Now (${amount.toFixed(0)})
                          </>
                        )}
                      </button>
                    )}

                    {statusKey === "completed" && paymentKey === "paid" && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Paid in Full
                      </span>
                    )}

                    {!canCancel &&
                      !canPay &&
                      !(statusKey === "completed" && paymentKey === "paid") &&
                      !isClosed && (
                        <span className="text-xs text-muted-foreground">
                          Payment unlocks once repair is completed
                        </span>
                      )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
          onClick={() => !cancelling && setCancelTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 font-heading text-lg font-extrabold text-foreground">
              Cancel this repair request?
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              You are about to cancel{" "}
              <span className="font-semibold text-foreground">
                {cancelTarget.serviceTitle}
              </span>
              . Since it is still in Requested status, there is no cancellation
              fee.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
              >
                Keep Request
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-60"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
