import { Star, Globe, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TargetAudiences() {
  const audiences = [
    {
      icon: Star,
      title: "Influencers & Celebrities",
      description: "New revenue stream with zero lift. White-label options available.",
      benefits: [
        "20-30% revenue share on all monetization",
        "Co-branded or white-label fan destinations",
        "Zero content creation required",
        "Amplification opportunities through your channels",
      ],
      cta: "For Talent",
    },
    {
      icon: Globe,
      title: "Domain Portfolio Owners",
      description: "Monetize underutilized name domains through revenue share or minimum guarantees.",
      benefits: [
        "Turn parked domains into cash-flowing assets",
        "Rev share or minimum guarantee options",
        "Portfolio-level management and reporting",
        "Launch sites at scale with automation",
      ],
      cta: "For Domains",
    },
    {
      icon: Building2,
      title: "Studios & Agencies",
      description: "Portfolio programs with executive dashboards and brand-safe compliance.",
      benefits: [
        "White-label managed services for talent rosters",
        "Executive-level performance dashboards",
        "Brand safety and compliance built-in",
        "Cross-portfolio optimization and insights",
      ],
      cta: "For Agencies",
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 gradient-primary opacity-5" />
      
      <div className="container relative mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="gradient-text">Every Stakeholder</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aligned incentives drive amplification, reduce IP risk, and create sustainable partnerships
            </p>
          </div>

          {/* Audience cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {audiences.map((audience, index) => (
              <div 
                key={index}
                className="glass-dark rounded-3xl p-8 flex flex-col hover:scale-105 transition-all duration-300"
              >
                {/* Icon */}
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)' }}
                >
                  <audience.icon 
                    className="h-8 w-8" 
                    style={{ color: 'hsl(var(--corsoro-accent))' }} 
                  />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3">{audience.title}</h3>
                <p className="text-muted-foreground mb-6">{audience.description}</p>

                {/* Benefits list */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {audience.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.2)' }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }} />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  variant="outline" 
                  className="w-full border-2"
                  style={{ borderColor: 'hsl(var(--corsoro-accent))' }}
                >
                  {audience.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

