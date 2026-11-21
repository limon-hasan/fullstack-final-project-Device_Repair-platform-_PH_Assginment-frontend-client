import Link from "next/link"

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-start justify-center gap-4 px-4 py-24 sm:px-6 lg:px-8">
      <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        FixMate Platform Setup
      </span>
      <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Broken Device? Get It Fixed by Verified Technicians.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
        Public layout with sticky Navbar, Light/Dark theme switcher, and Footer
        is active. Next up: BetterAuth setup and Authentication pages.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/services"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Browse Services
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Get Started
        </Link>
      </div>
    </section>
  )
}
