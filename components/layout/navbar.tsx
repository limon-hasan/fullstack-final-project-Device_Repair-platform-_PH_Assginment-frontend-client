"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { formatRoleLabel, getDashboardPath } from "@/lib/constants"
import { FixMateLogo } from "@/components/shared/fixmate-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/about" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null)
  const [dropdownOpenPath, setDropdownOpenPath] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const mobileOpen = mobileOpenPath === pathname
  const dropdownOpen = dropdownOpenPath === pathname

  const setMobileOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setMobileOpenPath((prev) => {
      const current = prev === pathname
      const value = typeof next === "function" ? next(current) : next
      return value ? pathname : null
    })
  }

  const setDropdownOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setDropdownOpenPath((prev) => {
      const current = prev === pathname
      const value = typeof next === "function" ? next(current) : next
      return value ? pathname : null
    })
  }

  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
      }
    | undefined

  const userRole = (user?.role || "customer").toLowerCase()
  const dashboardHref = getDashboardPath(userRole)
  const roleLabel = formatRoleLabel(userRole)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenPath(null)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpenPath(null)
        setMobileOpenPath(null)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      setDropdownOpenPath(null)
      setMobileOpenPath(null)
      toast.success("Signed out successfully")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Failed to sign out. Please try again.")
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "FM"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const roleBadgeClass =
    userRole === "admin"
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
      : userRole === "technician"
        ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <FixMateLogo />

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {PUBLIC_LINKS.map((link) => {
            const active = isActiveRoute(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />

          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-2.5 pl-1 transition-colors hover:border-primary/40 hover:bg-secondary"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {getInitials(user.name)}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name || "FixMate User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        roleBadgeClass
                      )}
                    >
                      {roleLabel}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href={dashboardHref}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      Update Profile
                    </Link>
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Right Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pt-3 pb-5 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {PUBLIC_LINKS.map((link) => {
              const active = isActiveRoute(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 border-t border-border pt-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User avatar"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {getInitials(user.name)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name || "FixMate User"}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        roleBadgeClass
                      )}
                    >
                      {roleLabel}
                    </span>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-3.5 py-2.5 text-sm font-semibold text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                  Update Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
