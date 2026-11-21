"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Wrench } from "lucide-react"
import { ServiceCard } from "@/components/services/service-card"
import type { RepairService } from "@/types/service"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function FeaturedServices() {
  const [services, setServices] = useState<RepairService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchFeaturedServices() {
      try {
        const res = await fetch(
          `${API_BASE}/api/services?limit=6&sort=newest`,
          { cache: "no-store" }
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
          setServices(list.slice(0, 6))
        }
      } catch {
        if (active) setServices([])
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchFeaturedServices()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="border-y border-border/70 bg-muted/35 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
              Latest Approved Services
            </span>
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Featured Repair Services
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Freshly verified services from skilled technicians ready for home
              visits or quick shop drop-offs.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-secondary sm:self-auto"
          >
            View All Services
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
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
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          /* Clean Empty State before services are seeded/approved */
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wrench className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
              Approved repair services will appear here
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Once technicians list services and an admin approves them, the 6
              latest available repairs will automatically showcase in this grid.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse Services Page
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Join as a Technician
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
