"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/constants"
import { cn } from "@/lib/utils"

type SelectableRole = "customer" | "technician"

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  role?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignUpForm() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<SelectableRole>("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Logged-in users must be redirected to their dashboard
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      const userRole = (session.user as { role?: string | null }).role
      router.replace(getDashboardPath(userRole))
    }
  }, [session, sessionLoading, router])

  const hasMinLength = password.length >= 6
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {}

    if (!name.trim()) {
      nextErrors.name = "Full name is required."
    } else if (name.trim().length < 2) {
      nextErrors.name = "Full name must be at least 2 characters."
    }

    if (!email.trim()) {
      nextErrors.email = "Email address is required."
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address."
    }

    const passwordIssues: string[] = []
    if (!password) {
      nextErrors.password = "Password is required."
    } else {
      if (!hasMinLength) passwordIssues.push("at least 6 characters")
      if (!hasUppercase) passwordIssues.push("one uppercase letter")
      if (!hasLowercase) passwordIssues.push("one lowercase letter")
      if (passwordIssues.length > 0) {
        nextErrors.password = `Password must contain ${passwordIssues.join(", ")}.`
      }
    }

    if (role !== "customer" && role !== "technician") {
      nextErrors.role = "Please select either Customer or Technician."
    }

    return nextErrors
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      })

      if (error) {
        toast.error(
          error.message || "Could not create account. Please try again."
        )
        return
      }

      const savedRole =
        (data?.user as { role?: string | null } | undefined)?.role || role
      toast.success("Account created! Welcome to FixMate.")
      router.push(getDashboardPath(savedRole))
      router.refresh()
    } catch {
      toast.error("Something went wrong while signing up.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Create your FixMate account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join as a customer to book verified repairs or as a technician to grow
          your repair business.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Interactive Role Selection Cards */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            I want to join as
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setRole("customer")
                setErrors((prev) => ({ ...prev, role: undefined }))
              }}
              aria-pressed={role === "customer"}
              className={cn(
                "group relative flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200",
                role === "customer"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  role === "customer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground group-hover:text-foreground"
                )}
              >
                <User className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Customer</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  Browse services, book repairs & pay after completion.
                </p>
              </div>
              {role === "customer" && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("technician")
                setErrors((prev) => ({ ...prev, role: undefined }))
              }}
              aria-pressed={role === "technician"}
              className={cn(
                "group relative flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200",
                role === "technician"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  role === "technician"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Wrench className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Technician</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  List repair services, manage jobs & earn securely.
                </p>
              </div>
              {role === "technician" && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </button>
          </div>
          {errors.role && (
            <p className="text-xs font-medium text-destructive">
              {errors.role}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block text-sm font-semibold text-foreground"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Maksudul Hasan"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              className={cn(
                "w-full rounded-xl border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                errors.name
                  ? "border-destructive focus:ring-destructive/25"
                  : "border-input focus:border-primary focus:ring-primary/20"
              )}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-sm font-semibold text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              className={cn(
                "w-full rounded-xl border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                errors.email
                  ? "border-destructive focus:ring-destructive/25"
                  : "border-input focus:border-primary focus:ring-primary/20"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password + Real-time Checklist */}
        <div className="space-y-2">
          <label
            htmlFor="signup-password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              className={cn(
                "w-full rounded-xl border bg-background py-2.5 pr-11 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                errors.password
                  ? "border-destructive focus:ring-destructive/25"
                  : "border-input focus:border-primary focus:ring-primary/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Live Rule Pills */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            {[
              { label: "6+ characters", met: hasMinLength },
              { label: "1 uppercase (A-Z)", met: hasUppercase },
              { label: "1 lowercase (a-z)", met: hasLowercase },
            ].map((rule) => (
              <span
                key={rule.label}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  rule.met
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-muted/60 text-muted-foreground"
                )}
              >
                {rule.met ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                {rule.label}
              </span>
            ))}
          </div>

          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password}
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
              Creating account...
            </>
          ) : (
            <>
              Create {role === "technician" ? "Technician" : "Customer"} Account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
