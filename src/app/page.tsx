import { Navbar } from "@/components/marketing/navbar"
import { HeroSection } from "@/components/marketing/hero-section"
import { ProblemSolution } from "@/components/marketing/problem-solution"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { PlatformFeatures } from "@/components/marketing/platform-features"
import { TargetAudiences } from "@/components/marketing/target-audiences"
import { BusinessModel } from "@/components/marketing/business-model"
import { TechStack } from "@/components/marketing/tech-stack"
import { TractionStats } from "@/components/marketing/traction-stats"
import { CTASection } from "@/components/marketing/cta-section"
import { Footer } from "@/components/marketing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <PlatformFeatures />
      <TargetAudiences />
      <BusinessModel />
      <TechStack />
      <TractionStats />
      <CTASection />
      <Footer />
    </div>
  )
}
