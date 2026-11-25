"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  DollarSign,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { getAuthHeaders } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface PaymentRecord {
  _id: string
  bookingId?: string
  stripeSessionId?: string
  transactionId?: string
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

function formatTransactionId(id?: string) {
  if (!id) return "N/A"
  if (id.length <= 18) return id
  return `${id.slice(0, 10)}...${id.slice(-6)}`
}

function formatDateParts(dateStr?: string) {
  if (!dateStr) return { date: "—", time: "" }
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" }

  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  }
}

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalTransactions: 0,
    totalRevenue: 0,
    averageAmount: 0,
  })
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchPayments = useCallback(
    async (query: string, isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set("search", query.trim())

        const authHeaders = await getAuthHeaders()
        const res = await fetch(
          `${API_BASE}/api/admin/payments${params.toString() ? `?${params.toString()}` : ""}`,
          { cache: "no-store", headers: authHeaders }
        )
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.message || "Failed to load transactions")
        }

        setPayments(Array.isArray(data.payments) ? data.payments : [])
        setStats({
          totalTransactions: Number(data.stats?.totalTransactions || 0),
          totalRevenue: Number(data.stats?.totalRevenue || 0),
          averageAmount: Number(data.stats?.averageAmount || 0),
        })
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Could not load payment transactions."
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(search)
    }, 250)

    return () => clearTimeout(timer)
  }, [search, fetchPayments])

  const handleCopyId = async (txId: string) => {
    try {
      await navigator.clipboard.writeText(txId)
      setCopiedId(txId)
      toast.success("Transaction ID copied")
      setTimeout(() => {
        setCopiedId((prev) => (prev === txId ? null : prev))
      }, 1800)
    } catch {
      toast.error("Failed to copy transaction ID")
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
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
          disabled={refreshing}
          onClick={() => fetchPayments(search, true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60 sm:self-center"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Total Platform Revenue
              </p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-foreground tabular-nums">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gross completed Stripe payments
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Total Transactions
              </p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-foreground tabular-nums">
                {stats.totalTransactions}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verified payment records
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Average Ticket Size
              </p>
              <p className="mt-2 font-heading text-3xl font-extrabold text-foreground tabular-nums">
                ${stats.averageAmount.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Average charge per paid repair
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>

      {/* Search & Table Card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction ID, service, customer..."
              className="w-full rounded-xl border border-border bg-background py-2 pr-4 pl-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {payments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {stats.totalTransactions}
            </span>{" "}
            records
          </p>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-14 animate-pulse rounded-2xl bg-muted/60"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Receipt className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-heading text-base font-bold text-foreground">
              No payment records found
            </h2>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {search.trim()
                ? "Try adjusting your search keywords to find matching transactions."
                : "Verified Stripe checkout payments will appear here automatically."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/80 bg-muted/35 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  <th className="py-3.5 pr-4 pl-6 whitespace-nowrap">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Service</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Customer</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Technician</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Paid On</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60 text-sm">
                {payments.map((payment) => {
                  const fullTxId =
                    payment.transactionId ||
                    payment.stripeSessionId ||
                    payment._id
                  const { date, time } = formatDateParts(
                    payment.paidAt || payment.createdAt
                  )
                  const amount = Number(payment.amount || 0)
                  const isCopied = copiedId === fullTxId

                  return (
                    <tr
                      key={payment._id}
                      className="transition-colors hover:bg-muted/25"
                    >
                      {/* Transaction ID */}
                      <td className="py-4 pr-4 pl-6 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopyId(fullTxId)}
                          title={`Click to copy: ${fullTxId}`}
                          className="group inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 font-mono text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <span>{formatTransactionId(fullTxId)}</span>
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                          )}
                        </button>
                      </td>

                      {/* Service */}
                      <td className="max-w-[180px] px-4 py-4">
                        <p
                          title={payment.serviceTitle || "Repair Service"}
                          className="truncate font-semibold text-foreground"
                        >
                          {payment.serviceTitle || "Repair Service"}
                        </p>
                        {payment.currency && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Stripe · {payment.currency.toUpperCase()}
                          </p>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="max-w-[150px] px-3 py-4">
                        <p className="truncate font-medium text-foreground">
                          {payment.customerName || "Customer"}
                        </p>
                        <p
                          title={payment.customerEmail || ""}
                          className="truncate text-xs text-muted-foreground"
                        >
                          {payment.customerEmail || "—"}
                        </p>
                      </td>

                      {/* Technician */}
                      <td className="max-w-[150px] px-3 py-4">
                        <p className="truncate font-medium text-foreground">
                          {payment.technicianName || "Technician"}
                        </p>
                        <p
                          title={payment.technicianEmail || ""}
                          className="truncate text-xs text-muted-foreground"
                        >
                          {payment.technicianEmail || "—"}
                        </p>
                      </td>

                      {/* Paid On */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <p className="text-xs font-medium text-foreground">
                          {date}
                        </p>
                        {time && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {time}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {payment.status || "paid"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                        <span className="font-heading text-sm font-extrabold text-foreground tabular-nums">
                          ${amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden">
              {payments.map((payment) => {
                const fullTxId =
                  payment.transactionId ||
                  payment.stripeSessionId ||
                  payment._id
                const { date, time } = formatDateParts(
                  payment.paidAt || payment.createdAt
                )
                const amount = Number(payment.amount || 0)
                const isCopied = copiedId === fullTxId

                return (
                  <div
                    key={payment._id}
                    className="rounded-2xl border border-border/80 bg-background/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {payment.serviceTitle || "Repair Service"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Stripe
                          {payment.currency
                            ? ` · ${payment.currency.toUpperCase()}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 font-heading text-base font-extrabold text-foreground tabular-nums">
                        ${amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
                      <p className="truncate">
                        Customer:{" "}
                        <span className="font-medium text-foreground">
                          {payment.customerName || "Customer"}
                        </span>
                      </p>
                      <p className="truncate">
                        Technician:{" "}
                        <span className="font-medium text-foreground">
                          {payment.technicianName || "Technician"}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {date}
                        {time ? ` · ${time}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 capitalize dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {payment.status || "paid"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyId(fullTxId)}
                      title={`Click to copy: ${fullTxId}`}
                      className="mt-3 inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/80 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <span className="truncate">{fullTxId}</span>
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
