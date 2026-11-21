import Link from "next/link"
import { Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

interface FixMateLogoProps {
  href?: string
  className?: string
}

export function FixMateLogo({ href = "/", className }: FixMateLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 select-none focus:outline-none",
        className
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-105">
        <Wrench className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
        Fix<span className="text-primary">Mate</span>
      </span>
    </Link>
  )
}
