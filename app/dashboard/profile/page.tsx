"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { getAuthHeaders } from "@/lib/auth-token"
import { uploadImageToImgBB } from "@/lib/imgbb"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ProfileErrors {
  name?: string
}

function getInitials(name?: string) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function UpdateProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: session, refetch: refetchSession } = authClient.useSession()
  const sessionUser = session?.user as
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
      }
    | undefined

  const userEmail = (sessionUser?.email || "").trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStep, setSaveStep] = useState<"idle" | "uploading" | "saving">(
    "idle"
  )

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("customer")
  const [image, setImage] = useState("")
  const [phone, setPhone] = useState("")
  const [area, setArea] = useState("")
  const [bio, setBio] = useState("")

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [imgFailed, setImgFailed] = useState(false)
  const [errors, setErrors] = useState<ProfileErrors>({})

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadProfile = async () => {
      try {
        const authHeaders = await getAuthHeaders()
        const res = await fetch(
          `${API_BASE}/api/users/profile?email=${encodeURIComponent(userEmail)}`,
          { cache: "no-store", headers: authHeaders }
        )
        const data = await res.json().catch(() => ({}))

        if (!active) return

        if (res.ok && data?.user) {
          setName(data.user.name || "")
          setEmail(data.user.email || userEmail)
          setRole((data.user.role || "customer").toLowerCase())
          setImage(data.user.image || "")
          setPhone(data.user.phone || "")
          setArea(data.user.area || "")
          setBio(data.user.bio || "")
          setImgFailed(false)
        } else {
          setName(sessionUser?.name || "")
          setEmail(userEmail)
          setRole((sessionUser?.role || "customer").toLowerCase())
          setImage(sessionUser?.image || "")
        }
      } catch {
        if (active) {
          toast.error("Failed to load profile details.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [userEmail, sessionUser?.name, sessionUser?.role, sessionUser?.image])

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, or WEBP).")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 5MB.")
      e.target.value = ""
      return
    }

    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setImgFailed(false)
  }

  const handleClearNewPhoto = () => {
    if (photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoFile(null)
    setPhotoPreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setErrors({ name: "Name must be at least 2 characters." })
      return
    }
    setErrors({})

    setSaving(true)
    try {
      let finalImageUrl = image.trim()

      if (photoFile) {
        setSaveStep("uploading")
        finalImageUrl = await uploadImageToImgBB(photoFile)
      }

      setSaveStep("saving")
      const authHeaders = await getAuthHeaders({
        "Content-Type": "application/json",
      })
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          email: email || userEmail,
          name: trimmedName,
          image: finalImageUrl,
          phone: phone.trim(),
          area: area.trim(),
          bio: bio.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message || "Could not update profile.")
        return
      }

      setImage(finalImageUrl)
      handleClearNewPhoto()

      // Sync updated name & photo with BetterAuth session so Navbar & Dashboard Top Bar update live
      try {
        await authClient.updateUser({
          name: trimmedName,
          image: finalImageUrl || undefined,
        })
        await refetchSession?.()
      } catch {
        // Non-blocking fallback
      }

      router.refresh()
      toast.success("Profile updated successfully!")
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Network error while saving profile."
      toast.error(msg)
    } finally {
      setSaving(false)
      setSaveStep("idle")
    }
  }

  const activeAvatarSrc = photoPreview || image.trim()

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-24 animate-pulse rounded-3xl border border-border bg-card" />
        <div className="h-96 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {activeAvatarSrc && !imgFailed ? (
            <img
              src={activeAvatarSrc}
              alt={name || "Profile"}
              onError={() => setImgFailed(true)}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-primary/20"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-heading text-xl font-bold text-primary">
              {getInitials(name)}
            </span>
          )}

          <div>
            <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
              Update Profile
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Keep your contact info, profile photo, and bio up to date.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary capitalize sm:self-center">
          <Shield className="h-3.5 w-3.5" />
          {role}
        </span>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        {/* Locked Account Fields (Email & Role) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-email"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
            >
              Email Address
              <Lock className="h-3 w-3 text-muted-foreground" />
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="profile-email"
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/60 py-2.5 pr-3 pl-10 text-sm text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-role"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
            >
              Account Role
              <Lock className="h-3 w-3 text-muted-foreground" />
            </label>
            <div className="relative">
              <Shield className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="profile-role"
                type="text"
                value={role.charAt(0).toUpperCase() + role.slice(1)}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-border bg-muted/60 py-2.5 pr-3 pl-10 text-sm text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-border/70" />

        {/* Profile Photo File Upload (ImgBB) */}
        <div className="space-y-2">
          <label
            htmlFor="profile-photo-file"
            className="block text-xs font-semibold text-foreground"
          >
            Profile Photo (ImgBB Upload)
          </label>
          <input
            ref={fileInputRef}
            id="profile-photo-file"
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              {activeAvatarSrc && !imgFailed ? (
                <img
                  src={activeAvatarSrc}
                  alt="Avatar preview"
                  onError={() => setImgFailed(true)}
                  className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ImagePlus className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {photoFile
                    ? photoFile.name
                    : image
                      ? "Current profile photo"
                      : "No profile photo uploaded"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  JPG, PNG, or WEBP up to 5MB — uploaded via ImgBB on save
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <ImagePlus className="h-3.5 w-3.5 text-primary" />
                {photoFile ? "Change Photo" : "Upload Photo"}
              </button>

              {photoFile && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleClearNewPhoto}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold text-foreground"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="profile-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                className={cn(
                  "w-full rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                  errors.name
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-input focus:border-primary focus:ring-primary/20"
                )}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-phone"
              className="block text-xs font-semibold text-foreground"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="profile-phone"
                type="tel"
                placeholder="+880 17XX-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="profile-area"
            className="block text-xs font-semibold text-foreground"
          >
            Service Area / Location
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="profile-area"
              type="text"
              placeholder="e.g. Dhanmondi, Dhaka"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-input bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="profile-bio"
            className="block text-xs font-semibold text-foreground"
          >
            Short Bio
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-muted-foreground" />
            <textarea
              id="profile-bio"
              rows={4}
              placeholder="Write a brief bio about yourself or your repair expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-xl border border-input bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {saveStep === "uploading"
                  ? "Uploading photo to ImgBB..."
                  : "Saving Changes..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
