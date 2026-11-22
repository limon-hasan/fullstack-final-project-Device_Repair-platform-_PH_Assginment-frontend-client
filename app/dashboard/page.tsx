"use client"

import Link from "next/link"
import { ArrowRight, UserCog } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function DashboardIndexPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; role?: string | null } | undefined
  const role = (user?.role || "customer").toLowerCase()

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold tracking-wider text-primary uppercase">
        FixMate Workspace
      </p>
      <h1 className="mt-2 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
        Welcome back, {user?.name || "User"}!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are signed in as{" "}
        <span className="font-semibold text-foreground capitalize">{role}</span>
        . Use the sidebar on the left to navigate your workspace.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <UserCog className="h-4 w-4" />
          Update Profile
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Browse Services
        </Link>
      </div>
    </div>
  )
}
