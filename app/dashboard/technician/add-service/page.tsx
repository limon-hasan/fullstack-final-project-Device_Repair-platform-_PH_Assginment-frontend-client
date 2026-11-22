"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  DollarSign,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  PlusCircle,
  Trash2,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { uploadImageToImgBB } from "@/lib/imgbb"

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

export default function AddServicePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined

  const technicianName = (user?.name || "").trim()
  const technicianEmail = (user?.email || "").trim().toLowerCase()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0])
  const [description, setDescription] = useState("")
  const [basePrice, setBasePrice] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [serviceMode, setServiceMode] = useState<string>(SERVICE_MODES[0])
  const [serviceArea, setServiceArea] = useState("")

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [submitting, setSubmitting] = useState(false)
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "saving">(
    "idle"
  )

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file (JPG, PNG, or WEBP).")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB.")
      e.target.value = ""
      return
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!technicianEmail) {
      toast.error("Technician session not found. Please sign in again.")
      return
    }

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedDuration = estimatedDuration.trim()
    const trimmedArea = serviceArea.trim()
    const parsedPrice = Number(basePrice)

    if (trimmedTitle.length < 4) {
      toast.error("Service title must be at least 4 characters.")
      return
    }

    if (trimmedDescription.length < 15) {
      toast.error("Description must be at least 15 characters.")
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Base price must be a positive number.")
      return
    }

    if (!trimmedDuration) {
      toast.error("Please provide an estimated duration (e.g. 2-3 hours).")
      return
    }

    if (!trimmedArea) {
      toast.error("Please enter your service area (e.g. Dhanmondi, Dhaka).")
      return
    }

    if (!imageFile) {
      toast.error("Please upload a service banner image.")
      return
    }

    setSubmitting(true)
    try {
      setUploadStep("uploading")
      const uploadedImageUrl = await uploadImageToImgBB(imageFile)

      setUploadStep("saving")
      const res = await fetch(`${API_BASE}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          category,
          description: trimmedDescription,
          image: uploadedImageUrl,
          basePrice: parsedPrice,
          estimatedDuration: trimmedDuration,
          serviceMode,
          serviceArea: trimmedArea,
          technicianName: technicianName || "Technician",
          technicianEmail,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to add repair service.")
        return
      }

      toast.success("Service submitted! It is now waiting for admin approval.")
      router.push("/dashboard/technician/my-services")
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the service."
      toast.error(message)
    } finally {
      setSubmitting(false)
      setUploadStep("idle")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          New Listing
        </p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
          Add a Repair Service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish a new repair service to your catalog. Every new listing starts
          as <span className="font-semibold text-foreground">Pending</span>{" "}
          until an admin approves it.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        {/* Read-only Technician Identity */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="tech-name"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              Technician Name (Read-only)
            </label>
            <input
              id="tech-name"
              type="text"
              readOnly
              value={sessionLoading ? "Loading..." : technicianName}
              className="w-full cursor-not-allowed rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-sm text-muted-foreground focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="tech-email"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              Technician Email (Read-only)
            </label>
            <input
              id="tech-email"
              type="email"
              readOnly
              value={sessionLoading ? "Loading..." : technicianEmail}
              className="w-full cursor-not-allowed rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-sm text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="service-title"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Service Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Wrench className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="service-title"
                type="text"
                required
                minLength={4}
                placeholder="e.g. iPhone OLED Screen Replacement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="service-category"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="service-category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

        {/* Price, Duration & Service Mode */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="base-price"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Base Price (USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="base-price"
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="45"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="estimated-duration"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Estimated Duration <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="estimated-duration"
                type="text"
                required
                placeholder="e.g. 2-3 hours, 1 day"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="service-mode"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Service Mode <span className="text-rose-500">*</span>
            </label>
            <select
              id="service-mode"
              required
              value={serviceMode}
              onChange={(e) => setServiceMode(e.target.value)}
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

        {/* Service Area */}
        <div>
          <label
            htmlFor="service-area"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Service Area <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="service-area"
              type="text"
              required
              placeholder="e.g. Dhanmondi, Dhaka"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="service-description"
              className="block text-sm font-semibold text-foreground"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {description.trim().length} / 15 min chars
            </span>
          </div>
          <textarea
            id="service-description"
            required
            rows={4}
            minLength={15}
            placeholder="Describe what is included in the repair, warranty terms, diagnostic checks, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Service Image Upload (ImgBB File Input) */}
        <div>
          <label
            htmlFor="service-image-file"
            className="mb-1.5 block text-sm font-semibold text-foreground"
          >
            Service Banner Image <span className="text-rose-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            id="service-image-file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
              <img
                src={imagePreview}
                alt="Selected service preview"
                className="h-56 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
                <p className="truncate text-xs font-medium text-foreground">
                  {imageFile?.name}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/60 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ImagePlus className="h-6 w-6" />
              </span>
              <span className="mt-3 text-sm font-semibold text-foreground">
                Click to upload service photo
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, or WEBP up to 5MB (uploaded automatically via ImgBB)
              </span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="submit"
            disabled={submitting || sessionLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadStep === "uploading"
                  ? "Uploading image to ImgBB..."
                  : "Submitting service..."}
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Submit for Admin Approval
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
