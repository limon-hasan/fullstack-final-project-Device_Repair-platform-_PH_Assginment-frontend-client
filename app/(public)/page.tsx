import { CategoryShowcase } from "@/components/home/category-showcase"
import { FeaturedServices } from "@/components/home/featured-services"
import { HeroSection } from "@/components/home/hero-section"
import { HowItWorksSection } from "@/components/home/how-it-works"
import { TrustCtaSection } from "@/components/home/trust-cta-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedServices />
      <HowItWorksSection />
      <TrustCtaSection />
    </>
  )
}
