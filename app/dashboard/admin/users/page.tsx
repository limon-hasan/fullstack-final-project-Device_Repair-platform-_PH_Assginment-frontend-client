"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Calendar,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Users,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type UserRole = "customer" | "technician" | "admin"
type FilterKey = "all" | UserRole

interface AdminUser {
  _id: string
  name?: string
  email: string
  image?: string
  role?: string
  phone?: string
  area?: string
  createdAt?: string
}

interface RoleChangeRequest {
  user: AdminUser
  nextRole: UserRole
}

const ROLE_OPTIONS: UserRole[] = ["customer", "technician", "admin"]

const ROLE_BADGE: Record<UserRole, string> = {
  customer: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  technician:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  admin:
    "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
}

function normalizeRole(role?: string): UserRole {
  const r = String(role || "customer").toLowerCase()
  if (r === "admin" || r === "technician" || r === "customer") return r
  return "customer"
}

function getInitials(name?: string, email?: string) {
  const source = (name || email || "U").trim()
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function AdminManageUsersPage() {
  const { data: session } = authClient.useSession()
  const currentAdmin = session?.user as { email?: string | null } | undefined
  const adminEmail = (currentAdmin?.email || "").trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pendingChange, setPendingChange] = useState<RoleChangeRequest | null>(
    null
  )

  const fetchAllUsers = async () => {
    const authHeaders = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/api/admin/users?role=all`, {
      cache: "no-store",
      headers: authHeaders,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load users.")
    }
    return Array.isArray(data.users) ? (data.users as AdminUser[]) : []
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const list = await fetchAllUsers()
        if (!active) return
        setUsers(list)
      } catch (err) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Network error while loading users."
          toast.error(msg)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const list = await fetchAllUsers()
      setUsers(list)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh users."
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const counts = useMemo(() => {
    let customer = 0
    let technician = 0
    let admin = 0

    for (const u of users) {
      const r = normalizeRole(u.role)
      if (r === "technician") technician += 1
      else if (r === "admin") admin += 1
      else customer += 1
    }

    return { all: users.length, customer, technician, admin }
  }, [users])

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return users.filter((u) => {
      const r = normalizeRole(u.role)
      if (activeFilter !== "all" && r !== activeFilter) return false

      if (!q) return true
      const haystack = [u.name, u.email, u.phone, u.area, r]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [users, activeFilter, searchQuery])

  const handleConfirmRoleChange = async () => {
    if (!pendingChange) return
    const { user, nextRole } = pendingChange

    setUpdatingId(user._id)
    try {
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(
        `${API_BASE}/api/admin/users/${encodeURIComponent(user._id)}/role`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            role: nextRole,
            adminEmail,
          }),
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message || "Failed to update user role.")
        return
      }

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id ? { ...item, role: nextRole } : item
        )
      )
      toast.success(
        `${user.name || user.email} is now a${
          nextRole === "admin" ? "n" : ""
        } ${nextRole}.`
      )
      setPendingChange(null)
    } catch {
      toast.error("Network error while updating user role.")
    } finally {
      setUpdatingId(null)
    }
  }

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All Users", count: counts.all },
    { key: "customer", label: "Customers", count: counts.customer },
    { key: "technician", label: "Technicians", count: counts.technician },
    { key: "admin", label: "Admins", count: counts.admin },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            User Directory
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Manage Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all registered accounts and assign Customer, Technician, or
            Admin roles.
          </p>
        </div>

        <button
          type="button"
          disabled={refreshing || loading}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60 sm:self-center"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                  isSelected
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, phone, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pr-4 pl-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            No matching users
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Try changing the role filter or clearing your search input.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm xl:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-4 py-4">Contact & Area</th>
                    <th className="px-4 py-4">Joined</th>
                    <th className="px-4 py-4">Current Role</th>
                    <th className="px-5 py-4 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredUsers.map((u) => {
                    const role = normalizeRole(u.role)
                    const isSelf =
                      Boolean(adminEmail) &&
                      u.email.toLowerCase() === adminEmail
                    const isUpdating = updatingId === u._id

                    return (
                      <tr
                        key={u._id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name || u.email}
                                className="h-10 w-10 shrink-0 rounded-xl border border-border object-cover"
                              />
                            ) : (
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-primary">
                                {getInitials(u.name, u.email)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-semibold text-foreground">
                                  {u.name || "Unnamed User"}
                                </p>
                                {isSelf && (
                                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          <p>{u.phone || "No phone"}</p>
                          <p className="mt-0.5">{u.area || "Area not set"}</p>
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                              ROLE_BADGE[role]
                            )}
                          >
                            {role === "admin" && <Shield className="h-3 w-3" />}
                            {role === "technician" && (
                              <Wrench className="h-3 w-3" />
                            )}
                            {role}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {isSelf ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                              <Lock className="h-3.5 w-3.5" />
                              Locked
                            </span>
                          ) : (
                            <select
                              aria-label={`Change role for ${u.name || u.email}`}
                              disabled={isUpdating}
                              value={role}
                              onChange={(e) => {
                                const nextRole = normalizeRole(e.target.value)
                                if (nextRole !== role) {
                                  setPendingChange({ user: u, nextRole })
                                }
                              }}
                              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground capitalize focus:border-primary focus:outline-none disabled:opacity-60"
                            >
                              {ROLE_OPTIONS.map((opt) => (
                                <option
                                  key={opt}
                                  value={opt}
                                  className="capitalize"
                                >
                                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Card View */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
            {filteredUsers.map((u) => {
              const role = normalizeRole(u.role)
              const isSelf =
                Boolean(adminEmail) && u.email.toLowerCase() === adminEmail
              const isUpdating = updatingId === u._id

              return (
                <div
                  key={u._id}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={u.name || u.email}
                            className="h-12 w-12 shrink-0 rounded-2xl border border-border object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">
                            {getInitials(u.name, u.email)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <h3 className="truncate font-heading text-base font-bold text-foreground">
                            {u.name || "Unnamed User"}
                            {isSelf && " (You)"}
                          </h3>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                          ROLE_BADGE[role]
                        )}
                      >
                        {role}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {u.phone || "No phone provided"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {u.area || "Area not set"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Joined {formatDate(u.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Role Access
                    </span>
                    {isSelf ? (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        Locked
                      </span>
                    ) : (
                      <select
                        disabled={isUpdating}
                        value={role}
                        onChange={(e) => {
                          const nextRole = normalizeRole(e.target.value)
                          if (nextRole !== role) {
                            setPendingChange({ user: u, nextRole })
                          }
                        }}
                        className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground capitalize focus:border-primary focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Role Change Confirmation Modal */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Confirm Role Change
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Change role for{" "}
                  <span className="font-semibold text-foreground">
                    {pendingChange.user.name || pendingChange.user.email}
                  </span>{" "}
                  from{" "}
                  <span className="font-semibold text-foreground capitalize">
                    {normalizeRole(pendingChange.user.role)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-primary capitalize">
                    {pendingChange.nextRole}
                  </span>
                  ? Their dashboard access will change immediately on next
                  session refresh.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={updatingId === pendingChange.user._id}
                onClick={() => setPendingChange(null)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingId === pendingChange.user._id}
                onClick={handleConfirmRoleChange}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
              >
                {updatingId === pendingChange.user._id && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {updatingId === pendingChange.user._id
                  ? "Updating..."
                  : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
