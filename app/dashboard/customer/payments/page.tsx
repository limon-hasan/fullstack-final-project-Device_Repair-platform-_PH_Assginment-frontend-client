"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Copy,
  CreditCard,
  DollarSign,
  Receipt,
  ShieldCheck,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface CustomerPayment {
  _id: string
  bookingId?: string
  serviceTitle?: string
  technicianName?: string
  technicianEmail?: string
  amount?: number
  currency?: string
  transactionId?: string
  stripeSessionId?: string
  status?: string
  paidAt?: string
  createdAt?: string
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

function formatAmount(amount?: number, currency?: string) {
  const value = Number(amount || 0)
  const code = (currency || "USD").toUpperCase()
  if (code === "USD") return `$${value.toFixed(2)}`
  return `${value.toFixed(2)} ${code}`
}

export default function CustomerPaymentsPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as { email?: string | null } | undefined
  const userEmail = user?.email || ""

  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<CustomerPayment[]>([])

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadPayments = async () => {
      setLoading(true)
      try {
        const authHeaders = await getAuthHeaders()
        const res = await fetch(
          `${API_BASE}/api/payments/customer?email=${encodeURIComponent(
            userEmail
          )}`,
          { cache: "no-store", headers: authHeaders }
        )
        const data = await res.json().catch(() => ({}))

        if (!active) return

        if (!res.ok) {
          toast.error(data.message || "Failed to load payment history.")
          return
        }

        setPayments(Array.isArray(data.payments) ? data.payments : [])
      } catch {
        if (active) {
          toast.error("Network error while loading payment history.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPayments()
    return () => {
      active = false
    }
  }, [userEmail])

  const summary = useMemo(() => {
    let totalPaid = 0
    for (const item of payments) {
      totalPaid += Number(item.amount || 0)
    }
    return {
      totalPaid,
      count: payments.length,
    }
  }, [payments])

  const handleCopyTxn = async (txnId: string) => {
    try {
      await navigator.clipboard.writeText(txnId)
      toast.success("Transaction ID copied!")
    } catch {
      toast.error("Could not copy transaction ID.")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Billing & Receipts
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Payment History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your completed Stripe Checkout transactions and repair
            receipts.
          </p>
        </div>

        <Link
          href="/dashboard/customer/bookings"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:self-center"
        >
          <ClipboardList className="h-4 w-4 text-primary" />
          My Bookings
        </Link>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Total Paid
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-extrabold text-foreground">
              ${summary.totalPaid.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all settled repairs
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Transactions
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Receipt className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-extrabold text-foreground">
              {summary.count}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified Stripe receipts
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Payment Policy
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-heading text-xl font-extrabold text-foreground">
              Pay After Repair
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stripe unlocks only when marked completed
            </p>
          </div>
        </div>
      )}

      {/* Transactions Section */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Transactions
          </h2>
          <p className="text-xs text-muted-foreground">
            Latest payments appear at the top
          </p>
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
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
              No payments yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              FixMate never charges upfront. Once a technician marks your repair
              as completed, you can pay securely via Stripe from My Bookings and
              your receipts will show up here.
            </p>
            <Link
              href="/dashboard/customer/bookings"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to My Bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Service</th>
                    <th className="px-6 py-3.5 font-semibold">Technician</th>
                    <th className="px-6 py-3.5 font-semibold">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3.5 font-semibold">Paid On</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {payments.map((payment) => {
                    const txnId =
                      payment.transactionId ||
                      payment.stripeSessionId ||
                      payment._id
                    const statusLabel = (payment.status || "paid").toLowerCase()

                    return (
                      <tr
                        key={payment._id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {payment.serviceTitle || "Repair Service"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {payment.technicianName ||
                            payment.technicianEmail ||
                            "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleCopyTxn(txnId)}
                            title="Copy transaction ID"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                          >
                            <span className="max-w-[140px] truncate">
                              {txnId}
                            </span>
                            <Copy className="h-3 w-3 shrink-0" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatDate(payment.paidAt || payment.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                              statusLabel === "paid" ||
                                statusLabel === "succeeded"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-heading text-base font-extrabold text-foreground">
                          {formatAmount(payment.amount, payment.currency)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-border/70 md:hidden">
              {payments.map((payment) => {
                const txnId =
                  payment.transactionId ||
                  payment.stripeSessionId ||
                  payment._id
                const statusLabel = (payment.status || "paid").toLowerCase()

                return (
                  <div key={payment._id} className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-sm font-bold text-foreground">
                          {payment.serviceTitle || "Repair Service"}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {payment.technicianName ||
                            payment.technicianEmail ||
                            "—"}
                        </p>
                      </div>
                      <p className="font-heading text-base font-extrabold text-foreground">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        {statusLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyTxn(txnId)}
                      className="inline-flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      <span className="truncate">TXN: {txnId}</span>
                      <Copy className="ml-2 h-3.5 w-3.5 shrink-0" />
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
