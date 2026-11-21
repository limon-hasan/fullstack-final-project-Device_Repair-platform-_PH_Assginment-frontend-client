import { Suspense } from "react"
import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your FixMate account to access your Customer, Technician, or Admin dashboard.",
}

export default function SignInPage() {
  return (
    <AuthShell
      badge="Role-Based Workspace"
      headline="Pick up right where your repairs left off."
      description="Customers track live fixes and pay after completion, technicians manage active requests, and admins keep service quality high."
    >
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthShell>
  )
}
