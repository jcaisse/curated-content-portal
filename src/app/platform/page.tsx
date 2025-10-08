import { Button } from "@/components/ui/button"
import { Footer } from "@/components/marketing/footer"
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Zap,
  Database,
  Network,
  Gauge,
  MessageSquare,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Platform Features - Corsoro Media",
  description: "Explore Corsoro's AI-optimized platform for monetizing name domains and fan destinations. SEO, AEO, and GEO architecture built for the AI era.",
}

export default function PlatformPage() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-First Optimization",
      description: "Unified SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) architecture",
      benefits: [
        "Appear as the answer in AI-driven results",
        "Rank in traditional search engines",
        "Optimized for ChatGPT, Perplexity, and other AI engines"
      ]
    },
    {
      icon: TrendingUp,
      title: "Enterprise Ad Stack",
      description: "Google Ad Manager backbone with Prebid header bidding for maximum revenue",
      benefits: [
        "6-10 SSP integrations for competitive bidding",
        "In-article video and native ad units",
        "Brand-safe, viewable ad placements"
      ]
    },
    {
      icon: DollarSign,
      title: "Revenue Share Model",
      description: "Aligned incentives with transparent 20-30% gross revenue share",
      benefits: [
        "Performance-based earnings for partners",
        "Real-time revenue reporting",
        "Minimum guarantee options for select domains"
      ]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "GA4 + Looker dashboards with executive-level insights",
      benefits: [
        "RPM, session quality, and viewability tracking",
        "Partner-facing performance reports",
        "IVT monitoring and fraud prevention"
      ]
    },
    {
      icon: Shield,
      title: "Compliance & Brand Safety",
      description: "DMCA policy, privacy consent, and regional compliance built-in",
      benefits: [
        "GDPR, CCPA, and COPPA compliance",
        "Consent management platform",
        "Brand-safe monetization controls"
      ]
    },
    {
      icon: Zap,
      title: "Speed to Market",
      description: "Automated site generation and content curation",
      benefits: [
        "Launch in days, not months",
        "AI-powered content aggregation",
        "White-label and co-branded options"
      ]
    }
  ]

  const techStack = [
    {
      icon: Database,
      title: "Schema-Rich Content",
      description: "Structured data for entities, events, products, and creative works"
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description: "Internal linking and topical authority across the portfolio"
    },
    {
      icon: Gauge,
      title: "Core Web Vitals",
      description: "Optimized page load, mobile-first UX, high viewability ad placements"
    },
    {
      icon: MessageSquare,
      title: "LLM-Friendly Patterns",
      description: "Answer formatting, citations, and freshness signals for AI engines"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full glow-primary opacity-20 blur-3xl" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full glass-dark mb-6">
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                PLATFORM OVERVIEW
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Built for the{" "}
              <span className="gradient-text">AI Era of Discovery</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Corsoro's platform combines AI-first optimization, enterprise ad technology, and transparent revenue sharing to turn name domains into cash-flowing assets.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact">
                <Button 
                  size="lg" 
                  className="gradient-primary text-white hover:opacity-90 transition-opacity"
                >
                  Start Monetizing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Six Pillars of Platform Excellence
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to monetize the open web at scale
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div 
                    key={index}
                    className="group glass-dark rounded-3xl p-8 hover:scale-105 transition-all duration-300"
                  >
                    <div 
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 group-hover:glow-primary transition-shadow"
                      style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                    >
                      <Icon className="h-7 w-7" style={{ color: 'hsl(var(--corsoro-primary))' }} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div 
                            className="w-1.5 h-1.5 rounded-full mt-2"
                            style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }}
                          />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Technology That Wins in{" "}
                <span className="gradient-text">AI-Driven Search</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our tech stack is purpose-built for the future of discovery
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => {
                const Icon = tech.icon
                return (
                  <div 
                    key={index}
                    className="glass-dark rounded-3xl p-8 text-center hover:scale-105 transition-transform"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                      style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)' }}
                    >
                      <Icon className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{tech.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tech.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto glass-dark rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Platform Performance
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold gradient-text mb-2">$15-$20</div>
                <div className="text-sm text-muted-foreground">Session RPM at Scale</div>
              </div>
              <div>
                <div className="text-4xl font-bold gradient-text mb-2">55-65%</div>
                <div className="text-sm text-muted-foreground">Gross Margins</div>
              </div>
              <div>
                <div className="text-4xl font-bold gradient-text mb-2">30 Days</div>
                <div className="text-sm text-muted-foreground">Average Time to Launch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-animate opacity-10" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Monetize the Open Web?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the platforms winning in AI-driven discovery
            </p>
            <Link href="/#contact">
              <Button 
                size="lg" 
                className="gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
