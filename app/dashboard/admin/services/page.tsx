"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Wrench,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { getAuthHeaders } from "@/lib/auth-token"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface AdminService {
  _id: string
  title: string
  category: string
  description: string
  image?: string
  basePrice: number
  estimatedDuration?: string
  serviceMode?: string
  serviceArea?: string
  technicianName?: string
  technicianEmail?: string
  approvalStatus?: string
  status?: string
  isAvailable?: boolean
  rejectionReason?: string
  createdAt?: string
}

type FilterKey = "all" | "pending" | "approved" | "rejected"

function getApprovalKey(
  service: AdminService
): "approved" | "pending" | "rejected" {
  const raw = String(
    service.approvalStatus || service.status || "pending"
  ).toLowerCase()
  if (raw === "approved") return "approved"
  if (raw === "rejected") return "rejected"
  return "pending"
}

export default function AdminServiceApprovalPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [services, setServices] = useState<AdminService[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Reject Reason Modal
  const [rejectTarget, setRejectTarget] = useState<AdminService | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchAllServices = async () => {
    const authHeaders = await getAuthHeaders()
    const res = await fetch(`${API_BASE}/api/admin/services?status=all`, {
      cache: "no-store",
      headers: authHeaders,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "Failed to load services.")
    }
    return Array.isArray(data.services) ? (data.services as AdminService[]) : []
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const list = await fetchAllServices()
        if (!active) return
        setServices(list)
      } catch (err) {
        if (active) {
          const msg =
            err instanceof Error
              ? err.message
              : "Network error while loading services."
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
      const list = await fetchAllServices()
      setServices(list)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to refresh services."
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const counts = useMemo(() => {
    let pending = 0
    let approved = 0
    let rejected = 0

    for (const s of services) {
      const key = getApprovalKey(s)
      if (key === "approved") approved += 1
      else if (key === "rejected") rejected += 1
      else pending += 1
    }

    return { all: services.length, pending, approved, rejected }
  }, [services])

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return services.filter((s) => {
      const key = getApprovalKey(s)
      if (activeFilter !== "all" && key !== activeFilter) return false

      if (!q) return true
      const haystack = [
        s.title,
        s.category,
        s.technicianName,
        s.technicianEmail,
        s.serviceArea,
        s.serviceMode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [services, activeFilter, searchQuery])

  const handleModeration = async (
    service: AdminService,
    approvalStatus: "approved" | "rejected",
    reason?: string
  ): Promise<boolean> => {
    setUpdatingId(service._id)
    try {
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(
        `${API_BASE}/api/admin/services/${service._id}/approval`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            approvalStatus,
            ...(approvalStatus === "rejected" && reason
              ? { rejectionReason: reason }
              : {}),
          }),
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message || "Failed to update approval status.")
        return false
      }

      if (data.service) {
        setServices((prev) =>
          prev.map((item) => (item._id === service._id ? data.service : item))
        )
      } else {
        setServices((prev) =>
          prev.map((item) =>
            item._id === service._id
              ? {
                  ...item,
                  approvalStatus,
                  rejectionReason:
                    approvalStatus === "rejected" ? reason || "" : "",
                }
              : item
          )
        )
      }

      toast.success(
        approvalStatus === "approved"
          ? `"${service.title}" approved and published!`
          : `"${service.title}" marked as rejected.`
      )
      return true
    } catch {
      toast.error("Network error while updating service approval.")
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  const openRejectModal = (service: AdminService) => {
    setRejectTarget(service)
    setRejectionReason(service.rejectionReason || "")
  }

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectTarget) return

    const ok = await handleModeration(
      rejectTarget,
      "rejected",
      rejectionReason.trim()
    )
    if (ok) {
      setRejectTarget(null)
      setRejectionReason("")
    }
  }

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ]

  const renderStatusBadge = (service: AdminService) => {
    const key = getApprovalKey(service)
    if (key === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </span>
      )
    }
    if (key === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Moderation Queue
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Service Approval
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve technician listings to make them visible on public pages, or
            reject incomplete submissions with feedback.
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
            placeholder="Search service, category, technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pr-4 pl-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            No matching services
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Try switching the status tab or clearing your search filter.
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
                    <th className="px-5 py-4">Service</th>
                    <th className="px-4 py-4">Technician</th>
                    <th className="px-4 py-4">Category & Price</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredServices.map((service) => {
                    const statusKey = getApprovalKey(service)
                    const isUpdating = updatingId === service._id

                    return (
                      <tr
                        key={service._id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3.5">
                            {service.image ? (
                              <img
                                src={service.image}
                                alt={service.title}
                                className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Wrench className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-semibold text-foreground">
                                {service.title}
                              </p>
                              <p
                                title={service.description}
                                className="mt-0.5 max-w-[260px] truncate text-xs text-muted-foreground"
                              >
                                {service.description}
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {service.serviceMode || "Home Visit"} ·{" "}
                                {service.serviceArea || "Area not set"} ·{" "}
                                {service.isAvailable === false
                                  ? "Paused by tech"
                                  : "Available"}
                              </p>
                              {statusKey === "rejected" &&
                                service.rejectionReason && (
                                  <p className="mt-1 text-[11px] text-rose-500">
                                    Reason: {service.rejectionReason}
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-foreground">
                            {service.technicianName || "Technician"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.technicianEmail || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                            {service.category}
                          </span>
                          <p className="mt-1 font-heading font-bold text-foreground">
                            ${Number(service.basePrice || 0).toFixed(0)}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          {renderStatusBadge(service)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {statusKey !== "approved" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleModeration(service, "approved")
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Approve
                              </button>
                            )}

                            {statusKey !== "rejected" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => openRejectModal(service)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 disabled:opacity-60 dark:text-rose-400"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            )}
                          </div>
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
            {filteredServices.map((service) => {
              const statusKey = getApprovalKey(service)
              const isUpdating = updatingId === service._id

              return (
                <div
                  key={service._id}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.title}
                            className="h-14 w-14 shrink-0 rounded-2xl border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Wrench className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {service.category}
                          </span>
                          <h3 className="mt-1 font-heading text-base font-bold text-foreground">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                      <div className="shrink-0">{renderStatusBadge(service)}</div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {service.technicianName || service.technicianEmail}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {service.serviceMode} · {service.serviceArea}
                      </span>
                    </div>

                    {statusKey === "rejected" && service.rejectionReason && (
                      <p className="mt-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-500">
                        Rejection Reason: {service.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="font-heading text-lg font-extrabold text-foreground">
                      ${Number(service.basePrice || 0).toFixed(0)}
                    </span>

                    <div className="flex items-center gap-2">
                      {statusKey !== "approved" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleModeration(service, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                      )}

                      {statusKey !== "rejected" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => openRejectModal(service)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 disabled:opacity-60 dark:text-rose-400"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Reject Service Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Reject Service Listing
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rejecting{" "}
                  <span className="font-semibold text-foreground">
                    “{rejectTarget.title}”
                  </span>{" "}
                  will hide it from public pages. You can include a note for the
                  technician.
                </p>
              </div>
              <button
                type="button"
                disabled={updatingId === rejectTarget._id}
                onClick={() => setRejectTarget(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="rejection-reason"
                  className="mb-1.5 block text-xs font-semibold text-foreground"
                >
                  Rejection Reason (Optional)
                </label>
                <textarea
                  id="rejection-reason"
                  rows={3}
                  placeholder="e.g. Please provide a clearer description and accurate pricing."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={updatingId === rejectTarget._id}
                  onClick={() => setRejectTarget(null)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === rejectTarget._id}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                >
                  {updatingId === rejectTarget._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {updatingId === rejectTarget._id
                    ? "Rejecting..."
                    : "Confirm Reject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
