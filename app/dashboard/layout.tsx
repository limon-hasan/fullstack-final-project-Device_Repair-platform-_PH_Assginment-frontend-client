"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Sun,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type UserRole = "customer" | "technician" | "admin"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const ROLE_HOME: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
}

const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Customer Dashboard",
  technician: "Technician Dashboard",
  admin: "Admin Dashboard",
}

const ROLE_NAV: Record<UserRole, NavItem[]> = {
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarCheck2,
    },
    {
      label: "Payment History",
      href: "/dashboard/customer/payments",
      icon: CreditCard,
    },
    { label: "Update Profile", href: "/dashboard/profile", icon: UserCog },
  ],
  technician: [
    { label: "Overview", href: "/dashboard/technician", icon: LayoutDashboard },
    {
      label: "Add a Service",
      href: "/dashboard/technician/add-service",
      icon: PlusCircle,
    },
    {
      label: "My Services",
      href: "/dashboard/technician/my-services",
      icon: Wrench,
    },
    {
      label: "Manage Requests",
      href: "/dashboard/technician/requests",
      icon: ClipboardList,
    },
    { label: "Update Profile", href: "/dashboard/profile", icon: UserCog },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    {
      label: "Service Approval",
      href: "/dashboard/admin/services",
      icon: ShieldCheck,
    },
    {
      label: "All Bookings",
      href: "/dashboard/admin/bookings",
      icon: ClipboardList,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: Receipt,
    },
    { label: "Update Profile", href: "/dashboard/profile", icon: UserCog },
  ],
}

function normalizeRole(role?: string | null): UserRole {
  const r = (role || "customer").toLowerCase()
  if (r === "admin" || r === "technician" || r === "customer") return r
  return "customer"
}

function getInitials(name?: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: session, isPending } = authClient.useSession()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
      }
    | undefined

  const role = normalizeRole(user?.role)

  // Route protection & role-based redirect
  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.replace("/sign-in")
      return
    }

    if (pathname === "/dashboard") {
      router.replace(ROLE_HOME[role])
      return
    }

    if (pathname.startsWith("/dashboard/profile")) {
      return
    }

    if (pathname.startsWith("/dashboard/customer") && role !== "customer") {
      router.replace(ROLE_HOME[role])
    } else if (
      pathname.startsWith("/dashboard/technician") &&
      role !== "technician"
    ) {
      router.replace(ROLE_HOME[role])
    } else if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      router.replace(ROLE_HOME[role])
    }
  }, [isPending, session, pathname, role, router])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await authClient.signOut()
      toast.success("Signed out successfully.")
      router.replace("/sign-in")
    } catch {
      toast.error("Failed to sign out.")
      setSigningOut(false)
    }
  }

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading workspace...
        </div>
      </div>
    )
  }

  const navItems = ROLE_NAV[role]

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sticky Left Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="font-heading text-lg font-extrabold tracking-tight text-foreground">
              Fix<span className="text-primary">Mate</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="shrink-0 px-5 pt-5 pb-2">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Workspace
          </p>
          <span className="mt-1.5 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            {ROLE_LABEL[role]}
          </span>
        </div>

        {/* Scrollable Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="shrink-0 space-y-1 border-t border-border p-3">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Back to Home</span>
          </Link>

          <button
            type="button"
            disabled={signingOut}
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10 disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 shrink-0" />
            )}
            <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Right Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              Home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                type="button"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 rounded-full border border-border bg-background py-1 pr-3.5 pl-1.5 transition-colors hover:border-primary/40"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {getInitials(user?.name)}
                </span>
              )}
              <div className="hidden text-left sm:block">
                <p className="text-xs leading-tight font-bold text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] leading-tight text-primary capitalize">
                  {role}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
