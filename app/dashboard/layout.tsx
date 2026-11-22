"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarCheck,
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
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type UserRole = "customer" | "technician" | "admin"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

const ROLE_HOME: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
}

const ROLE_NAV_ITEMS: Record<UserRole, NavItem[]> = {
  customer: [
    {
      label: "Overview",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Payment History",
      href: "/dashboard/customer/payments",
      icon: CreditCard,
    },
    {
      label: "Update Profile",
      href: "/dashboard/profile",
      icon: UserCog,
    },
  ],
  technician: [
    {
      label: "Overview",
      href: "/dashboard/technician",
      icon: LayoutDashboard,
      exact: true,
    },
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
    {
      label: "Update Profile",
      href: "/dashboard/profile",
      icon: UserCog,
    },
  ],
  admin: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
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
    {
      label: "Update Profile",
      href: "/dashboard/profile",
      icon: UserCog,
    },
  ],
}

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  customer: "border-primary/30 bg-primary/10 text-primary",
  technician:
    "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  admin:
    "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
}

function normalizeRole(role?: string | null): UserRole {
  const lower = (role || "customer").toLowerCase()
  if (lower === "technician" || lower === "admin") return lower
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
  const { data: session, isPending } = authClient.useSession()

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

  const isRoleMismatch =
    Boolean(user) &&
    ((pathname.startsWith("/dashboard/customer") && role !== "customer") ||
      (pathname.startsWith("/dashboard/technician") && role !== "technician") ||
      (pathname.startsWith("/dashboard/admin") && role !== "admin"))

  useEffect(() => {
    if (isPending) return

    if (!user) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    if (isRoleMismatch) {
      router.replace(ROLE_HOME[role])
    }
  }, [isPending, user, isRoleMismatch, role, pathname, router])

  const handleToggleTheme = () => {
    const root = document.documentElement
    const isCurrentlyDark = root.classList.contains("dark")
    if (isCurrentlyDark) {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await authClient.signOut()
      toast.success("Signed out successfully")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setSigningOut(false)
    }
  }

  // Prevent flicker or premature redirect while session is resolving or redirecting
  if (isPending || !user || isRoleMismatch) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading your dashboard...
        </p>
      </div>
    )
  }

  const navItems = ROLE_NAV_ITEMS[role]

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-tight text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-4 w-4" />
            </span>
            <span>
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

        {/* Role Indicator */}
        <div className="border-b border-border/70 px-5 py-3.5">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Workspace
          </p>
          <span
            className={cn(
              "mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              ROLE_BADGE_STYLES[role]
            )}
          >
            {role} Dashboard
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

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

        {/* Sidebar Footer Actions */}
        <div className="space-y-1.5 border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Back to Home</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sun className="hidden h-4 w-4 text-amber-400 dark:block" />
              <Moon className="block h-4 w-4 dark:hidden" />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-background py-1 pr-3 pl-1.5">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-8 w-8 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-primary">
                  {getInitials(user.name)}
                </span>
              )}

              <div className="hidden leading-tight sm:block">
                <p className="max-w-[140px] truncate text-xs font-bold text-foreground">
                  {user.name || "User"}
                </p>
                <span
                  className={cn(
                    "inline-block text-[10px] font-semibold capitalize",
                    role === "customer" && "text-primary",
                    role === "technician" &&
                      "text-amber-600 dark:text-amber-400",
                    role === "admin" && "text-indigo-600 dark:text-indigo-400"
                  )}
                >
                  {role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content (No Public Footer) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
