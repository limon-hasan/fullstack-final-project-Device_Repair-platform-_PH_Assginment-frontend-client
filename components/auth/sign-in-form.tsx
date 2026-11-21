"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface FieldErrors {
  email?: string
  password?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSafeCallbackUrl(rawUrl: string | null): string | null {
  if (!rawUrl) return null
  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) {
    return rawUrl
  }
  return null
}

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const callbackUrl = getSafeCallbackUrl(
    searchParams.get("callbackUrl") || searchParams.get("redirect")
  )

  // Redirect already logged-in users straight to their dashboard
  useEffect(() => {
    if (!sessionLoading && session?.user) {
      const userRole = (session.user as { role?: string | null }).role
      router.replace(callbackUrl || getDashboardPath(userRole))
    }
  }, [session, sessionLoading, callbackUrl, router])

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {}
    if (!email.trim()) {
      nextErrors.email = "Email address is required."
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address."
    }
    if (!password) {
      nextErrors.password = "Password is required."
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
      const { error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        toast.error(error.message || "Invalid email or password.")
        return
      }

      const freshSession = await authClient.getSession()
      const userRole = (
        freshSession.data?.user as { role?: string | null } | undefined
      )?.role

      toast.success("Welcome back to FixMate!")
      router.push(callbackUrl || getDashboardPath(userRole))
      router.refresh()
    } catch {
      toast.error("Failed to sign in. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage repair requests, track live job updates, or review
          payments.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signin-email"
            className="block text-sm font-semibold text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signin-email"
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

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signin-password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to FixMate?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-primary transition-colors hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
