"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  PlusCircle,
  Sparkles,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Appliance",
  "TV & Audio",
  "Plumbing & Electrical",
  "Other",
]

const SERVICE_MODES = ["Home Visit", "Shop Drop-off", "Both"]

export default function AddServicePage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Smartphone")
  const [basePrice, setBasePrice] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("1-2 hours")
  const [serviceMode, setServiceMode] = useState("Home Visit")
  const [serviceArea, setServiceArea] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const cleanTitle = title.trim()
    const cleanDescription = description.trim()
    const cleanArea = serviceArea.trim()
    const cleanImage = image.trim()
    const parsedPrice = Number(basePrice)
    const technicianEmail = (user?.email || "").trim().toLowerCase()
    const technicianName = (user?.name || "Technician").trim()

    if (!technicianEmail) {
      toast.error("Technician session not found. Please sign in again.")
      return
    }

    if (!cleanTitle || cleanTitle.length < 4) {
      toast.error("Please enter a clear service title (at least 4 characters).")
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid base price greater than 0.")
      return
    }

    if (!cleanDescription || cleanDescription.length < 15) {
      toast.error(
        "Please write a helpful description (at least 15 characters)."
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          category,
          description: cleanDescription,
          image: cleanImage,
          basePrice: parsedPrice,
          estimatedDuration: estimatedDuration.trim() || "1-2 hours",
          serviceMode,
          serviceArea: cleanArea,
          technicianName,
          technicianEmail,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message || "Failed to submit service.")
        return
      }

      toast.success("Service submitted for admin approval!")
      router.push("/dashboard/technician/services")
    } catch {
      toast.error("Network error while creating service.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Service Catalog
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Add a New Service
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a repair service. It will be reviewed by an admin before
            appearing on the public marketplace.
          </p>
        </div>

        <Link
          href="/dashboard/technician"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="service-title"
            className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
          >
            <Wrench className="h-3.5 w-3.5 text-primary" />
            Service Title *
          </label>
          <input
            id="service-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., iPhone 14 OLED Screen & Battery Replacement"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Category & Base Price */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="service-category"
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Category *
            </label>
            <select
              id="service-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="base-price"
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
            >
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              Base Price (USD) *
            </label>
            <input
              id="base-price"
              type="number"
              min="1"
              step="0.01"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="e.g., 45"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Duration & Service Mode */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="estimated-duration"
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
            >
              <Clock className="h-3.5 w-3.5 text-primary" />
              Estimated Duration
            </label>
            <input
              id="estimated-duration"
              type="text"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="e.g., 1-2 hours"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-mode"
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
            >
              <Wrench className="h-3.5 w-3.5 text-primary" />
              Service Mode
            </label>
            <select
              id="service-mode"
              value={serviceMode}
              onChange={(e) => setServiceMode(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {SERVICE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Area & Image URL */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="service-area"
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Service Area
            </label>
            <input
              id="service-area"
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g., Dhanmondi, Dhaka"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-image"
              className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
            >
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              Cover Image URL
            </label>
            <input
              id="service-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="service-description"
            className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            Service Description *
          </label>
          <textarea
            id="service-description"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what issues this repair covers, spare parts quality, diagnostic steps, and warranty details..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/dashboard/technician/services"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            My Services
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Submit for Approval
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
