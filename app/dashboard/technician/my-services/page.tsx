"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ImagePlus,
  Loader2,
  MapPin,
  Pencil,
  PlusCircle,
  RefreshCw,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/auth-token"
import { uploadImageToImgBB } from "@/lib/imgbb"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const

const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const

interface TechnicianService {
  _id: string
  title: string
  category: string
  description: string
  image?: string
  basePrice: number
  estimatedDuration?: string
  serviceMode?: string
  serviceArea?: string
  approvalStatus?: string
  status?: string
  isAvailable?: boolean
  rejectionReason?: string
  createdAt?: string
}

type FilterKey = "all" | "approved" | "pending" | "rejected"

function getApprovalKey(
  service: TechnicianService
): "approved" | "pending" | "rejected" {
  const raw = String(
    service.approvalStatus || service.status || "pending"
  ).toLowerCase()
  if (raw === "approved") return "approved"
  if (raw === "rejected") return "rejected"
  return "pending"
}

export default function TechnicianMyServicesPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined
  const userEmail = (user?.email || "").trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [services, setServices] = useState<TechnicianService[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Edit Modal State
  const [editingService, setEditingService] =
    useState<TechnicianService | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState<string>(
    SERVICE_CATEGORIES[0]
  )
  const [editDescription, setEditDescription] = useState("")
  const [editBasePrice, setEditBasePrice] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editServiceMode, setEditServiceMode] = useState<string>(
    SERVICE_MODES[0]
  )
  const [editServiceArea, setEditServiceArea] = useState("")
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const editFileInputRef = useRef<HTMLInputElement | null>(null)

  // Delete Confirmation Modal State
  const [deletingService, setDeletingService] =
    useState<TechnicianService | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadServices = useCallback(async () => {
    if (!userEmail) return
    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(
        `${API_BASE}/api/services/technician?email=${encodeURIComponent(
          userEmail
        )}`,
        { cache: "no-store", headers: authHeaders }
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to load your services.")
        return
      }

      setServices(Array.isArray(data.services) ? data.services : [])
    } catch {
      toast.error("Network error while loading your services.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userEmail])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadServices()
  }

  useEffect(() => {
    if (!userEmail) return
    let active = true

    const init = async () => {
      try {
        const authHeaders = await getAuthHeaders()
        const res = await fetch(
          `${API_BASE}/api/services/technician?email=${encodeURIComponent(
            userEmail
          )}`,
          { cache: "no-store", headers: authHeaders }
        )
        const data = await res.json().catch(() => ({}))
        if (!active) return

        if (!res.ok) {
          toast.error(data.message || "Failed to load your services.")
          return
        }

        setServices(Array.isArray(data.services) ? data.services : [])
      } catch {
        if (active) {
          toast.error("Network error while loading your services.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [userEmail])

  useEffect(() => {
    return () => {
      if (editImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(editImagePreview)
      }
    }
  }, [editImagePreview])

  const counts = useMemo(() => {
    let approved = 0
    let pending = 0
    let rejected = 0

    for (const s of services) {
      const key = getApprovalKey(s)
      if (key === "approved") approved += 1
      else if (key === "rejected") rejected += 1
      else pending += 1
    }

    return { all: services.length, approved, pending, rejected }
  }, [services])

  const filteredServices = useMemo(() => {
    if (activeFilter === "all") return services
    return services.filter((s) => getApprovalKey(s) === activeFilter)
  }, [services, activeFilter])

  // Toggle Availability (isAvailable)
  const handleToggleAvailability = async (service: TechnicianService) => {
    const nextAvailable = !(service.isAvailable !== false)
    setTogglingId(service._id)

    try {
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(`${API_BASE}/api/services/${service._id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          technicianEmail: userEmail,
          isAvailable: nextAvailable,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to update availability.")
        return
      }

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? { ...item, isAvailable: nextAvailable }
            : item
        )
      )
      toast.success(
        nextAvailable
          ? "Service is now visible on public pages (if approved)."
          : "Service paused and hidden from public pages."
      )
    } catch {
      toast.error("Network error while updating availability.")
    } finally {
      setTogglingId(null)
    }
  }

  // Open Edit Modal
  const openEditModal = (service: TechnicianService) => {
    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview)
    }

    const matchedCategory = SERVICE_CATEGORIES.includes(
      service.category as (typeof SERVICE_CATEGORIES)[number]
    )
      ? service.category
      : SERVICE_CATEGORIES[0]

    const matchedMode = SERVICE_MODES.includes(
      service.serviceMode as (typeof SERVICE_MODES)[number]
    )
      ? (service.serviceMode as string)
      : SERVICE_MODES[0]

    setEditingService(service)
    setEditTitle(service.title || "")
    setEditCategory(matchedCategory)
    setEditDescription(service.description || "")
    setEditBasePrice(String(service.basePrice ?? ""))
    setEditDuration(service.estimatedDuration || "1-2 hours")
    setEditServiceMode(matchedMode)
    setEditServiceArea(service.serviceArea || "")
    setEditImageFile(null)
    setEditImagePreview(service.image || "")
  }

  const closeEditModal = () => {
    if (savingEdit) return
    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview)
    }
    setEditingService(null)
    setEditImageFile(null)
    setEditImagePreview("")
  }

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.")
      e.target.value = ""
      return
    }

    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview)
    }
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  const hasEditChanges = useMemo(() => {
    if (!editingService) return false

    const initialCategory = SERVICE_CATEGORIES.includes(
      editingService.category as (typeof SERVICE_CATEGORIES)[number]
    )
      ? editingService.category
      : SERVICE_CATEGORIES[0]

    const initialMode = SERVICE_MODES.includes(
      editingService.serviceMode as (typeof SERVICE_MODES)[number]
    )
      ? (editingService.serviceMode as string)
      : SERVICE_MODES[0]

    const initialDuration = (
      editingService.estimatedDuration || "1-2 hours"
    ).trim()

    return (
      editTitle.trim() !== (editingService.title || "").trim() ||
      editCategory !== initialCategory ||
      editDescription.trim() !== (editingService.description || "").trim() ||
      Number(editBasePrice) !== Number(editingService.basePrice ?? 0) ||
      editDuration.trim() !== initialDuration ||
      editServiceMode !== initialMode ||
      editServiceArea.trim() !== (editingService.serviceArea || "").trim() ||
      editImageFile !== null
    )
  }, [
    editingService,
    editTitle,
    editCategory,
    editDescription,
    editBasePrice,
    editDuration,
    editServiceMode,
    editServiceArea,
    editImageFile,
  ])

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    if (!hasEditChanges) {
      toast.info("No changes detected. Edit at least one field to save.")
      return
    }

    const trimmedTitle = editTitle.trim()
    const trimmedDesc = editDescription.trim()
    const trimmedDuration = editDuration.trim()
    const trimmedArea = editServiceArea.trim()
    const parsedPrice = Number(editBasePrice)

    if (trimmedTitle.length < 4) {
      toast.error("Title must be at least 4 characters.")
      return
    }
    if (trimmedDesc.length < 15) {
      toast.error("Description must be at least 15 characters.")
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Base price must be a positive number.")
      return
    }
    if (!trimmedDuration || !trimmedArea) {
      toast.error("Estimated duration and service area are required.")
      return
    }

    setSavingEdit(true)
    try {
      let imageUrl = editingService.image || ""
      if (editImageFile) {
        imageUrl = await uploadImageToImgBB(editImageFile)
      }

      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(
        `${API_BASE}/api/services/${editingService._id}`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            technicianEmail: userEmail,
            title: trimmedTitle,
            category: editCategory,
            description: trimmedDesc,
            basePrice: parsedPrice,
            estimatedDuration: trimmedDuration,
            serviceMode: editServiceMode,
            serviceArea: trimmedArea,
            ...(imageUrl ? { image: imageUrl } : {}),
          }),
        }
      )

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message || "Failed to update service.")
        return
      }

      if (data.service) {
        setServices((prev) =>
          prev.map((item) =>
            item._id === editingService._id ? data.service : item
          )
        )
      } else {
        await loadServices()
      }

      toast.success("Service updated and sent back for admin approval.")
      closeEditModal()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save service changes."
      toast.error(msg)
    } finally {
      setSavingEdit(false)
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingService) return
    setDeleting(true)

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(
        `${API_BASE}/api/services/${deletingService._id}?email=${encodeURIComponent(
          userEmail
        )}`,
        { method: "DELETE", headers: authHeaders }
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to delete service.")
        return
      }

      setServices((prev) =>
        prev.filter((item) => item._id !== deletingService._id)
      )
      toast.success("Service deleted permanently.")
      setDeletingService(null)
    } catch {
      toast.error("Network error while deleting service.")
    } finally {
      setDeleting(false)
    }
  }

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ]

  const renderStatusBadge = (service: TechnicianService) => {
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
            Service Catalog
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            My Services
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your repair listings, toggle public availability, or edit
            service details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={refreshing || loading}
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
            Refresh
          </button>

          <Link
            href="/dashboard/technician/add-service"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            Add a Service
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
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
            <Wrench className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            No services found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {activeFilter === "all"
              ? "You haven't published any repair services yet. Add your first service to start receiving bookings."
              : `You have no services with "${activeFilter}" status.`}
          </p>
          {activeFilter === "all" && (
            <Link
              href="/dashboard/technician/add-service"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Your First Service
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Base Price</th>
                    <th className="px-4 py-4">Approval</th>
                    <th className="px-4 py-4">Availability</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredServices.map((service) => {
                    const isAvailable = service.isAvailable !== false
                    const isToggling = togglingId === service._id

                    return (
                      <tr
                        key={service._id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
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
                              <p className="max-w-xs truncate font-semibold text-foreground">
                                {service.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {service.serviceMode || "Home Visit"} ·{" "}
                                {service.serviceArea || "Area not set"}
                              </p>
                              {getApprovalKey(service) === "rejected" &&
                                service.rejectionReason && (
                                  <p className="mt-1 text-[11px] text-rose-500">
                                    Reason: {service.rejectionReason}
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                            {service.category}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-heading font-bold text-foreground">
                          ${Number(service.basePrice || 0).toFixed(0)}
                        </td>

                        <td className="px-4 py-4">
                          {renderStatusBadge(service)}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isAvailable}
                            disabled={isToggling}
                            onClick={() => handleToggleAvailability(service)}
                            className="inline-flex items-center gap-2.5 disabled:opacity-60"
                          >
                            <span
                              className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                                isAvailable
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground/30"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                  isAvailable
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                )}
                              />
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {isToggling
                                ? "Updating..."
                                : isAvailable
                                  ? "Available"
                                  : "Hidden"}
                            </span>
                          </button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(service)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingService(service)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
            {filteredServices.map((service) => {
              const isAvailable = service.isAvailable !== false
              const isToggling = togglingId === service._id

              return (
                <div
                  key={service._id}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
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
                        <div>
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {service.category}
                          </span>
                          <h3 className="mt-1 font-heading text-base font-bold text-foreground">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                      {renderStatusBadge(service)}
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                      {service.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {service.serviceMode} · {service.serviceArea}
                      </span>
                      <span className="font-heading text-base font-extrabold text-foreground">
                        ${Number(service.basePrice || 0).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isAvailable}
                      disabled={isToggling}
                      onClick={() => handleToggleAvailability(service)}
                      className="inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <span
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                          isAvailable
                            ? "bg-emerald-500"
                            : "bg-muted-foreground/30"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                            isAvailable ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {isAvailable ? "Available" : "Hidden"}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingService(service)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Edit Repair Service
                </h2>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Note: Saving edits resets approval status to Pending until an
                  admin reviews it again.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={4}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Base Price (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={editBasePrice}
                      onChange={(e) => setEditBasePrice(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Estimated Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Service Mode *
                  </label>
                  <select
                    value={editServiceMode}
                    onChange={(e) => setEditServiceMode(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {SERVICE_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Service Area *
                </label>
                <input
                  type="text"
                  required
                  value={editServiceArea}
                  onChange={(e) => setEditServiceArea(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Description * (min 15 chars)
                </label>
                <textarea
                  required
                  rows={3}
                  minLength={15}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Optional Image Replacement via ImgBB */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Service Image (Optional — leave unchanged to keep current
                  photo)
                </label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-3">
                  {editImagePreview ? (
                    <img
                      src={editImagePreview}
                      alt="Service preview"
                      className="h-16 w-24 shrink-0 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {editImageFile
                        ? editImageFile.name
                        : "Current service banner"}
                    </span>
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Upload New Photo
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={closeEditModal}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !hasEditChanges}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEdit && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Delete this service?
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  You are about to permanently delete{" "}
                  <span className="font-semibold text-foreground">
                    “{deletingService.title}”
                  </span>
                  . Existing bookings will keep a snapshot of the service
                  details.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingService(null)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
