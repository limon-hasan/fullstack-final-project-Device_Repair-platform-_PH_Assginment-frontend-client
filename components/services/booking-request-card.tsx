"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/auth-token"
import type { RepairService } from "@/types/service"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface BookingRequestCardProps {
  service: RepairService
}

interface FormErrors {
  customerPhone?: string
  address?: string
  preferredDate?: string
  problemDescription?: string
}

function getLocalTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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
  const today = getLocalTodayString()

  const [formOpen, setFormOpen] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [customerPhone, setCustomerPhone] = useState("")
  const [address, setAddress] = useState("")
  const [preferredDate, setPreferredDate] = useState(today)
  const [problemDescription, setProblemDescription] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleOpenRequestForm = () => {
    if (!user) {
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(`/services/${service._id}`)}`
      )
      return
    }

    if (userRole !== "customer") {
      return
    }

    if (!customerPhone && user.phone) {
      setCustomerPhone(user.phone)
    }
    if (!address && user.area) {
      setAddress(user.area)
    }
    setFormOpen(true)
  }

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      nextErrors.customerPhone = "Please enter a valid contact phone number."
    }
    if (!address.trim() || address.trim().length < 5) {
      nextErrors.address = "Please provide your full service address."
    }
    if (!preferredDate || preferredDate < today) {
      nextErrors.preferredDate =
        "Preferred date must be today or a future date."
    }
    if (!problemDescription.trim() || problemDescription.trim().length < 20) {
      nextErrors.problemDescription =
        "Problem description must be at least 20 characters."
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
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          serviceId: service._id,
          customerName: user?.name || "",
          customerEmail: user?.email || "",
          customerPhone: customerPhone.trim(),
          address: address.trim(),
          preferredDate,
          problemDescription: problemDescription.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(
          data.message || "Could not submit repair request. Please try again."
        )
        return
      }

      toast.success("Repair request submitted! Track status in My Bookings.")
      setSubmittedSuccess(true)
      setFormOpen(false)
    } catch {
      toast.error("Network error while sending request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const descLength = problemDescription.trim().length

  return (
    <aside className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-md sm:p-7">
      {/* Pricing Header */}
      <div className="flex items-end justify-between border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Starting Price
          </p>
          <p className="mt-1 font-heading text-3xl font-extrabold text-foreground">
            <span className="text-brand-amber">$</span>
            {Number(service.basePrice || 0).toFixed(0)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {service.isAvailable ? "Available Now" : "Unavailable"}
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

      {/* Action / Form Area */}
      <div className="mt-6">
        {isPending ? (
          <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
        ) : submittedSuccess ? (
          <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Repair Request Sent!
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your booking is now in <strong>Requested</strong> status. Track
                live updates or cancel before acceptance from My Bookings.
              </p>
            </div>
            <Link
              href="/dashboard/customer/bookings"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Go to My Bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : user && userRole !== "customer" ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-5 py-3 text-sm font-semibold text-muted-foreground opacity-70"
            >
              <Wrench className="h-4 w-4" />
              Request Repair
            </button>
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>Only customers can request a repair.</strong> You are
                currently signed in as{" "}
                <span className="capitalize">{userRole}</span>.
              </p>
            </div>
          </div>
        ) : !formOpen ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleOpenRequestForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              <Wrench className="h-4 w-4" />
              Request Repair
            </button>
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                You will be redirected to Sign In and returned right back to
                this service.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-foreground">
                Repair Request Details
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            {/* Read-only Name */}
            <div className="space-y-1">
              <label
                htmlFor="booking-name"
                className="block text-xs font-semibold text-foreground"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="booking-name"
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/60 py-2.5 pr-3 pl-10 text-sm text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Read-only Email */}
            <div className="space-y-1">
              <label
                htmlFor="booking-email"
                className="block text-xs font-semibold text-foreground"
              >
                Your Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="booking-email"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/60 py-2.5 pr-3 pl-10 text-sm text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label
                htmlFor="booking-phone"
                className="block text-xs font-semibold text-foreground"
              >
                Phone Number
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

            {/* Address */}
            <div className="space-y-1">
              <label
                htmlFor="booking-address"
                className="block text-xs font-semibold text-foreground"
              >
                Service Address
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="booking-address"
                  type="text"
                  placeholder="House, Road, Area (e.g. Dhanmondi, Dhaka)"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (errors.address)
                      setErrors((p) => ({ ...p, address: undefined }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    errors.address
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-primary focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
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

            {/* Problem Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="booking-problem"
                  className="block text-xs font-semibold text-foreground"
                >
                  Problem Description
                </label>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    descLength >= 20
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  {descLength}/20 min
                </span>
              </div>
              <div className="relative">
                <FileText className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="booking-problem"
                  rows={3}
                  placeholder="Describe device model, issue symptoms, or error codes (at least 20 characters)..."
                  value={problemDescription}
                  onChange={(e) => {
                    setProblemDescription(e.target.value)
                    if (errors.problemDescription)
                      setErrors((p) => ({
                        ...p,
                        problemDescription: undefined,
                      }))
                  }}
                  className={cn(
                    "w-full resize-none rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                    errors.problemDescription
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input focus:border-primary focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.problemDescription && (
                <p className="text-xs text-destructive">
                  {errors.problemDescription}
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
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Repair Request
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-brand-amber" />
              Pay online via Stripe only after completion
            </p>
          </form>
        )}
      </div>
    </aside>
  )
}
