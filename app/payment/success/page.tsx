"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ReceiptData {
  bookingId: string
  serviceTitle: string
  technicianName: string
  amount: number
  currency?: string
  transactionId: string
  paidAt: string
}

function formatReceiptDate(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id") || ""

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    sessionId ? "verifying" : "error"
  )
  const [errorMessage, setErrorMessage] = useState<string>(
    sessionId ? "" : "Missing Stripe payment session ID."
  )
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [copied, setCopied] = useState(false)

  const verifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!sessionId || verifiedRef.current === sessionId) return
    verifiedRef.current = sessionId

    const verifyPayment = async () => {
      await Promise.resolve()

      const cacheKey = `fixmate_receipt_${sessionId}`
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const parsed = JSON.parse(cached) as ReceiptData
          setReceipt(parsed)
          setStatus("success")
          return
        }
      } catch {
        // Ignore storage read errors and verify via API
      }

      try {
        const res = await fetch(`${API_BASE}/api/payments/verify-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setStatus("error")
          setErrorMessage(
            data.message || "Could not verify your Stripe payment."
          )
          toast.error(data.message || "Payment verification failed.")
          return
        }

        const verifiedReceipt: ReceiptData = {
          bookingId: data.bookingId || "",
          serviceTitle: data.serviceTitle || "Repair Service",
          technicianName: data.technicianName || "Your technician",
          amount: Number(data.amount || 0),
          currency: data.currency || "USD",
          transactionId: data.transactionId || sessionId,
          paidAt: data.paidAt || new Date().toISOString(),
        }

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(verifiedReceipt))
        } catch {
          // Ignore storage quota errors
        }

        setReceipt(verifiedReceipt)
        setStatus("success")
        toast.success("Payment verified successfully!")
      } catch {
        setStatus("error")
        setErrorMessage("Network error while verifying your payment.")
        toast.error("Network error while verifying payment.")
      }
    }

    verifyPayment()
  }, [sessionId])

  const handleCopyTx = async () => {
    if (!receipt?.transactionId) return
    try {
      await navigator.clipboard.writeText(receipt.transactionId)
      setCopied(true)
      toast.success("Transaction ID copied")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Failed to copy transaction ID")
    }
  }

  if (status === "verifying") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-extrabold text-foreground">
            Verifying your payment...
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait a moment while we confirm your Stripe transaction and
            generate your receipt.
          </p>
        </div>
      </div>
    )
  }

  if (status === "error" || !receipt) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-extrabold text-foreground">
            Unable to verify payment
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage ||
              "We could not confirm this payment session. Please check your bookings."}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/customer/bookings"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Bookings
            </Link>
            <Link
              href="/dashboard/customer/payments"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Payment History
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Payment received
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Thanks.{" "}
            <span className="font-semibold text-foreground">
              {receipt.technicianName}
            </span>{" "}
            has been notified and your repair job is now marked paid.
          </p>
        </div>

        <div className="mt-7 divide-y divide-border/70 rounded-2xl border border-border/80 bg-background/60 px-5">
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <span className="text-muted-foreground">Service</span>
            <span className="text-right font-semibold text-foreground">
              {receipt.serviceTitle}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-heading text-base font-extrabold text-emerald-500 tabular-nums">
              ${receipt.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <span className="shrink-0 text-muted-foreground">
              Transaction ID
            </span>
            <button
              type="button"
              onClick={handleCopyTx}
              title={`Click to copy: ${receipt.transactionId}`}
              className="inline-flex max-w-[230px] items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <span className="truncate">{receipt.transactionId}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-semibold text-foreground">
              {formatReceiptDate(receipt.paidAt)}
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Bookings
          </Link>
          <Link
            href="/dashboard/customer/payments"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Receipt className="h-4 w-4" />
            Payment History
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading payment receipt...
            </p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
