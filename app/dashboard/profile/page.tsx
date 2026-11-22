"use client"

import { useEffect, useState } from "react"
import {
  Camera,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface ProfileErrors {
  name?: string
  image?: string
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
  const { data: session } = authClient.useSession()
  const sessionUser = session?.user as
    | {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
      }
    | undefined

  const userEmail = sessionUser?.email || ""

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("customer")
  const [image, setImage] = useState("")
  const [phone, setPhone] = useState("")
  const [area, setArea] = useState("")
  const [bio, setBio] = useState("")
  const [imgFailed, setImgFailed] = useState(false)
  const [errors, setErrors] = useState<ProfileErrors>({})

  useEffect(() => {
    if (!userEmail) return

    let active = true
    const loadProfile = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/users/profile?email=${encodeURIComponent(userEmail)}`,
          { cache: "no-store" }
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

  const validate = (): ProfileErrors => {
    const nextErrors: ProfileErrors = {}
    if (name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters."
    }
    const trimmedImg = image.trim()
    if (
      trimmedImg &&
      !trimmedImg.startsWith("http://") &&
      !trimmedImg.startsWith("https://")
    ) {
      nextErrors.image = "Photo URL must start with http:// or https://"
    }
    return nextErrors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    try {
      const trimmedName = name.trim()
      const trimmedImage = image.trim()

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email || userEmail,
          name: trimmedName,
          image: trimmedImage,
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

      // Sync updated name & photo with BetterAuth session so Top Bar / Navbar updates live
      try {
        await authClient.updateUser({
          name: trimmedName,
          image: trimmedImage || undefined,
        })
      } catch {
        // Non-blocking fallback
      }

      toast.success("Profile updated successfully!")
    } catch {
      toast.error("Network error while saving profile.")
    } finally {
      setSaving(false)
    }
  }

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
          {image.trim() && !imgFailed ? (
            <img
              src={image.trim()}
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
              Keep your contact info, photo, and bio up to date.
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-image"
              className="block text-xs font-semibold text-foreground"
            >
              Photo URL
            </label>
            <div className="relative">
              <Camera className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="profile-image"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value)
                  setImgFailed(false)
                  if (errors.image)
                    setErrors((prev) => ({ ...prev, image: undefined }))
                }}
                className={cn(
                  "w-full rounded-xl border bg-background py-2.5 pr-3 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none",
                  errors.image
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-input focus:border-primary focus:ring-primary/20"
                )}
              />
            </div>
            {errors.image && (
              <p className="text-xs text-destructive">{errors.image}</p>
            )}
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
                Saving Changes...
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
