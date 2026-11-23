"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowDownUp,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
} from "lucide-react"
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/constants"
import { ServiceCard } from "@/components/services/service-card"
import type { RepairService } from "@/types/service"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type SortOption = "newest" | "price_asc" | "price_desc"

export function ServicesBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlSearch = searchParams.get("search") || ""
  const urlCategory = searchParams.get("category") || "All"
  const urlMode = searchParams.get("mode") || "All"
  const urlSort = (searchParams.get("sort") as SortOption) || "newest"

  const [searchInput, setSearchInput] = useState(urlSearch)
  const [services, setServices] = useState<RepairService[]>([])
  const [loadedKey, setLoadedKey] = useState<string>("")

  const queryKey = `${urlSearch}|${urlCategory}|${urlMode}|${urlSort}`
  const isLoading = loadedKey !== queryKey

  const updateQueryParams = (updates: {
    search?: string
    category?: string
    mode?: string
    sort?: SortOption
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    const nextSearch =
      updates.search !== undefined ? updates.search.trim() : urlSearch
    const nextCategory =
      updates.category !== undefined ? updates.category : urlCategory
    const nextMode = updates.mode !== undefined ? updates.mode : urlMode
    const nextSort = updates.sort !== undefined ? updates.sort : urlSort

    if (nextSearch) params.set("search", nextSearch)
    else params.delete("search")

    if (nextCategory && nextCategory !== "All")
      params.set("category", nextCategory)
    else params.delete("category")

    if (nextMode && nextMode !== "All") params.set("mode", nextMode)
    else params.delete("mode")

    if (nextSort && nextSort !== "newest") params.set("sort", nextSort)
    else params.delete("sort")

    const qs = params.toString()
    router.replace(qs ? `/services?${qs}` : "/services", { scroll: false })
  }

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function fetchServices() {
      try {
        const params = new URLSearchParams()
        if (urlSearch) params.set("search", urlSearch)
        if (urlCategory && urlCategory !== "All")
          params.set("category", urlCategory)
        if (urlMode && urlMode !== "All") params.set("serviceMode", urlMode)
        if (urlSort) params.set("sort", urlSort)

        const res = await fetch(
          `${API_BASE}/api/services?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!res.ok) {
          if (active) setServices([])
          return
        }

        const data = await res.json()
        const list: RepairService[] = Array.isArray(data)
          ? data
          : Array.isArray(data.services)
            ? data.services
            : []

        if (active) {
          setServices(list)
        }
      } catch {
        if (active) {
          setServices([])
        }
      } finally {
        if (active) {
          setLoadedKey(queryKey)
        }
      }
    }

    fetchServices()

    return () => {
      active = false
      controller.abort()
    }
  }, [urlSearch, urlCategory, urlMode, urlSort, queryKey])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateQueryParams({ search: searchInput })
  }

  const handleResetFilters = () => {
    setSearchInput("")
    router.replace("/services", { scroll: false })
  }

  const hasActiveFilters =
    Boolean(urlSearch) ||
    urlCategory !== "All" ||
    urlMode !== "All" ||
    urlSort !== "newest"

  return (
    <div className="space-y-8">
      {/* Search & Filter Control Panel */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 lg:col-span-6"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by device, issue, area, or technician..."
                aria-label="Search repair services"
                className="w-full rounded-xl border border-input bg-background py-2.5 pr-9 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("")
                    if (urlSearch) updateQueryParams({ search: "" })
                  }}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Search
            </button>
          </form>

          {/* Service Mode Select */}
          <div className="relative lg:col-span-3">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={urlMode}
              onChange={(e) => updateQueryParams({ mode: e.target.value })}
              aria-label="Filter by service mode"
              className="w-full appearance-none rounded-xl border border-input bg-background py-2.5 pr-4 pl-10 text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="All">All Service Modes</option>
              {SERVICE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="relative lg:col-span-3">
            <ArrowDownUp className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={urlSort}
              onChange={(e) =>
                updateQueryParams({ sort: e.target.value as SortOption })
              }
              aria-label="Sort repair services"
              className="w-full appearance-none rounded-xl border border-input bg-background py-2.5 pr-4 pl-10 text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          <button
            type="button"
            onClick={() => updateQueryParams({ category: "All" })}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
              urlCategory === "All"
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            All Categories
          </button>

          {SERVICE_CATEGORIES.map((category) => {
            const active = urlCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => updateQueryParams({ category })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {category}
              </button>
            )
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-brand-amber" />
          {isLoading ? (
            <span>Loading verified services...</span>
          ) : (
            <span>
              Showing{" "}
              <strong className="font-semibold text-foreground">
                {services.length}
              </strong>{" "}
              approved {services.length === 1 ? "service" : "services"}
              {urlCategory !== "All" && (
                <>
                  {" "}
                  in{" "}
                  <strong className="font-semibold text-primary">
                    {urlCategory}
                  </strong>
                </>
              )}
              {urlSearch && (
                <>
                  {" "}
                  matching{" "}
                  <strong className="font-semibold text-foreground">
                    “{urlSearch}”
                  </strong>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Services Grid / Skeleton / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div className="h-7 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-28 animate-pulse rounded-xl bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="h-7 w-7" />
          </span>
          <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
            {hasActiveFilters
              ? "No matching repair services found"
              : "No approved services listed yet"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your search keywords, switching category, or clearing the active filters."
              : "Once technicians add repair services and admins approve them, they will appear right here."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
