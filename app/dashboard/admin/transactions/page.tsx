"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface AdminPayment {
  _id: string
  bookingId?: string
  transactionId?: string
  stripeSessionId?: string
  serviceTitle?: string
  customerName?: string
  customerEmail?: string
  technicianName?: string
  technicianEmail?: string
  amount?: number
  currency?: string
  status?: string
  paidAt?: string
  createdAt?: string
}

interface PaymentStats {
  totalTransactions: number
  totalRevenue: number
  averageAmount: number
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatTxnId(p: AdminPayment) {
  const raw = p.transactionId || p.stripeSessionId || p._id || "—"
  if (raw.length <= 20) return raw
  return `${raw.slice(0, 12)}...${raw.slice(-6)}`
}

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    averageAmount: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")

  const fetchAllPayments = async () => {
    const res = await fetch(`${API_BASE}/api/admin/payments`, {
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load payment transactions.")
    }
    return {
      payments: Array.isArray(data.payments)
        ? (data.payments as AdminPayment[])
        : [],
      stats: data.stats as PaymentStats | undefined,
    }
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const data = await fetchAllPayments()
        if (!active) return
        setPayments(data.payments)
        if (data.stats) setStats(data.stats)
      } catch (err) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Network error while loading transactions."
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
      const data = await fetchAllPayments()
      setPayments(data.payments)
      if (data.stats) setStats(data.stats)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh transactions."
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return payments

    return payments.filter((p) => {
      const haystack = [
        p.transactionId,
        p.stripeSessionId,
        p.serviceTitle,
        p.customerName,
        p.customerEmail,
        p.technicianName,
        p.technicianEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [payments, searchQuery])

  const summaryCards = [
    {
      label: "Total Platform Revenue",
      value: `$${Number(stats.totalRevenue || 0).toFixed(2)}`,
      sub: "Gross completed Stripe payments",
      icon: DollarSign,
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Transactions",
      value: String(stats.totalTransactions || 0),
      sub: "Verified payment records",
      icon: CreditCard,
      iconBg: "bg-primary/15 text-primary",
    },
    {
      label: "Average Ticket Size",
      value: `$${Number(stats.averageAmount || 0).toFixed(2)}`,
      sub: "Average charge per paid repair",
      icon: TrendingUp,
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Financial Ledger
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Transactions & Revenue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit all Stripe checkout payments settled by customers across the
            platform.
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

      {/* 3 Revenue KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm"
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
              </div>
            )
          })}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transaction ID, service, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pr-4 pl-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Showing {filteredPayments.length} of {payments.length} records
        </span>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Receipt className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            {payments.length === 0
              ? "No transactions recorded yet"
              : "No matching transactions"}
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {payments.length === 0
              ? "Once customers pay for completed repairs via Stripe Checkout, every verified receipt will appear here."
              : "Try adjusting your search query to find another transaction."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-4">Transaction ID</th>
                    <th className="px-4 py-4">Service</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Technician</th>
                    <th className="px-4 py-4">Paid On</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <span
                          title={
                            payment.transactionId ||
                            payment.stripeSessionId ||
                            payment._id
                          }
                          className="rounded-lg bg-muted px-2.5 py-1 font-mono text-xs text-foreground"
                        >
                          {formatTxnId(payment)}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-medium text-foreground">
                        <p className="max-w-xs truncate">
                          {payment.serviceTitle || "Repair Service"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">
                          {payment.customerName || "Customer"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.customerEmail || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">
                          {payment.technicianName || "Technician"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.technicianEmail || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {formatDateTime(payment.paidAt || payment.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {payment.status || "Paid"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right font-heading font-extrabold text-foreground">
                        ${Number(payment.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
            {filteredPayments.map((payment) => (
              <div
                key={payment._id}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-block rounded-lg bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
                      {formatTxnId(payment)}
                    </span>
                    <h3 className="mt-1.5 truncate font-heading text-base font-bold text-foreground">
                      {payment.serviceTitle || "Repair Service"}
                    </h3>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    {payment.status || "Paid"}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Customer: {payment.customerName || payment.customerEmail}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-primary" />
                    Tech: {payment.technicianName || payment.technicianEmail}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {formatDateTime(payment.paidAt || payment.createdAt)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    Settled Amount
                  </span>
                  <span className="font-heading text-lg font-extrabold text-foreground">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
