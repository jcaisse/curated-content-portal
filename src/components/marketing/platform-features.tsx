import { Brain, Megaphone, TrendingUp, BarChart3, Shield, Zap } from "lucide-react"

export function PlatformFeatures() {
  const features = [
    {
      icon: Brain,
      title: "AI-First Optimization",
      description: "SEO, AEO, and GEO architecture designed for search and AI engines",
    },
    {
      icon: Megaphone,
      title: "Enterprise Ad Stack",
      description: "Google Ad Manager, Prebid header bidding with 6-10 SSPs, video & native units",
    },
    {
      icon: TrendingUp,
      title: "Revenue Share Model",
      description: "20-30% gross revenue shared with talent and domain partners",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "GA4 + Looker dashboards with RPM tracking, viewability, and partner QBRs",
    },
    {
      icon: Shield,
      title: "Compliance & Brand Safety",
      description: "DMCA policy, privacy consent, regional compliance, and brand-safe monetization",
    },
    {
      icon: Zap,
      title: "Speed to Market",
      description: "Automated site generation and content curation. Launch in days, not months",
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'hsla(var(--corsoro-secondary) / 0.1)' }}>
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-secondary))' }}>
                PLATFORM CAPABILITIES
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for the <span className="gradient-text">AI Era of Discovery</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to launch, optimize, and monetize authoritative fan destinations
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group glass rounded-3xl p-8 hover:scale-105 transition-all duration-300"
              >
                {/* Icon */}
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 group-hover:glow-primary transition-shadow"
                  style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                >
                  <feature.icon 
                    className="h-7 w-7" 
                    style={{ color: 'hsl(var(--corsoro-primary))' }} 
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

