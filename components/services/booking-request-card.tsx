"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import type { RepairService } from "@/types/service"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface BookingRequestCardProps {
  service: RepairService
}

interface FormErrors {
  customerPhone?: string
  customerAddress?: string
  preferredDate?: string
  issueDescription?: string
}

export function BookingRequestCard({ service }: BookingRequestCardProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        role?: string | null
        phone?: string | null
        area?: string | null
      }
    | undefined

  const userRole = (user?.role || "customer").toLowerCase()
  const today = new Date().toISOString().split("T")[0]

  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [preferredDate, setPreferredDate] = useState(today)
  const [issueDescription, setIssueDescription] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      nextErrors.customerPhone = "Please enter a valid contact phone number."
    }
    if (!customerAddress.trim() || customerAddress.trim().length < 5) {
      nextErrors.customerAddress = "Please provide your full service address."
    }
    if (!preferredDate) {
      nextErrors.preferredDate = "Please select a preferred repair date."
    }
    if (!issueDescription.trim() || issueDescription.trim().length < 10) {
      nextErrors.issueDescription =
        "Describe the device issue in at least 10 characters."
    }
    return nextErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          serviceId: service._id,
          serviceTitle: service.title,
          category: service.category,
          serviceMode: service.serviceMode,
          basePrice: service.basePrice,
          technicianName: service.technicianName,
          technicianEmail: service.technicianEmail,
          customerName: user?.name || "Customer",
          customerEmail: user?.email,
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          preferredDate,
          issueDescription: issueDescription.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(
          data.message || "Could not submit booking request. Please try again."
        )
        return
      }

      toast.success(
        "Repair request sent! Track live updates in your dashboard."
      )
      router.push("/dashboard/customer")
      router.refresh()
    } catch {
      toast.error("Network error while sending request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <aside className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-md sm:p-7">
      {/* Pricing Header */}
      <div className="flex items-end justify-between border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Starting Estimate
          </p>
          <p className="mt-1 font-heading text-3xl font-extrabold text-foreground">
            <span className="text-brand-amber">$</span>
            {Number(service.basePrice || 0).toFixed(0)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {service.isAvailable ? "Available Now" : "Currently Paused"}
        </span>
      </div>

      {/* Zero Upfront Banner */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="leading-relaxed text-foreground">
          <strong>$0 upfront cost.</strong> Submit your repair request for free
          and pay securely via Stripe only after completion.
        </p>
      </div>

      {/* Conditional Booking Area */}
      <div className="mt-6">
        {!service.isAvailable ? (
          <div className="rounded-2xl border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            This service is temporarily unavailable for new requests.
          </div>
        ) : isPending ? (
          <div className="space-y-3">
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        ) : !user ? (
          <div className="space-y-4 rounded-2xl border border-border bg-background/70 p-5 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Sign in to book this repair
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sign in with your Customer account to send a repair request and
                track job updates live.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(`/services/${service._id}`)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Sign In to Continue
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Create Customer Account
              </Link>
            </div>
          </div>
        ) : userRole !== "customer" ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Customer account required</p>
              <p className="mt-1">
                You are currently signed in as a{" "}
                <strong className="capitalize">{userRole}</strong>. Only
                Customer accounts can submit repair booking requests.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground">
              Send a Repair Request
            </h3>

            {/* Phone */}
            <div className="space-y-1">
              <label
                htmlFor="booking-phone"
                className="block text-xs font-semibold text-foreground"
              >
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="booking-phone"
                  type="tel"
                  placeholder="+880 17XX-XXXXXX"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value)
                    if (errors.customerPhone)
                      setErrors((p) => ({ ...p, customerPhone: undefined }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    errors.customerPhone
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-primary focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.customerPhone && (
                <p className="text-xs text-destructive">
                  {errors.customerPhone}
                </p>
              )}
            </div>

            {/* Preferred Date */}
            <div className="space-y-1">
              <label
                htmlFor="booking-date"
                className="block text-xs font-semibold text-foreground"
              >
                Preferred Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="booking-date"
                  type="date"
                  min={today}
                  value={preferredDate}
                  onChange={(e) => {
                    setPreferredDate(e.target.value)
                    if (errors.preferredDate)
                      setErrors((p) => ({ ...p, preferredDate: undefined }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground focus:ring-2 focus:outline-none",
                    errors.preferredDate
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-primary focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.preferredDate && (
                <p className="text-xs text-destructive">
                  {errors.preferredDate}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label
                htmlFor="booking-address"
                className="block text-xs font-semibold text-foreground"
              >
                Service Address / Location
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="booking-address"
                  type="text"
                  placeholder="House, Road, Area (e.g. Dhanmondi, Dhaka)"
                  value={customerAddress}
                  onChange={(e) => {
                    setCustomerAddress(e.target.value)
                    if (errors.customerAddress)
                      setErrors((p) => ({ ...p, customerAddress: undefined }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    errors.customerAddress
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-primary focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.customerAddress && (
                <p className="text-xs text-destructive">
                  {errors.customerAddress}
                </p>
              )}
            </div>

            {/* Issue Description */}
            <div className="space-y-1">
              <label
                htmlFor="booking-issue"
                className="block text-xs font-semibold text-foreground"
              >
                Describe the Issue
              </label>
              <div className="relative">
                <FileText className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="booking-issue"
                  rows={3}
                  placeholder="Mention device model, symptoms, or error codes..."
                  value={issueDescription}
                  onChange={(e) => {
                    setIssueDescription(e.target.value)
                    if (errors.issueDescription)
                      setErrors((p) => ({ ...p, issueDescription: undefined }))
                  }}
                  className={cn(
                    "w-full resize-none rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    errors.issueDescription
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-primary focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.issueDescription && (
                <p className="text-xs text-destructive">
                  {errors.issueDescription}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Confirm Repair Request
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-brand-amber" />
              Final bill paid securely after technician completes the job
            </p>
          </form>
        )}
      </div>
    </aside>
  )
}
