import { Rocket, Target, DollarSign, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Rocket,
      title: "Launch",
      description: "Deploy AI-optimized fan sites in days, not months",
      features: [
        "Automated site generation",
        "Name domain acquisition",
        "White-label or co-branded options",
      ],
    },
    {
      number: "02",
      icon: Target,
      title: "Optimize",
      description: "SEO + AEO + GEO architecture for maximum visibility",
      features: [
        "Schema-rich content",
        "Answer engine formatting",
        "LLM-friendly patterns",
      ],
    },
    {
      number: "03",
      icon: DollarSign,
      title: "Monetize",
      description: "Programmatic ads, affiliate, and direct sponsorships at scale",
      features: [
        "Google Ad Manager + Prebid",
        "20-30% revenue share",
        "$8-$20+ session RPM",
      ],
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container relative mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Launch. Optimize. Monetize.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our three-step process transforms underutilized domains into revenue-generating assets
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/4 -right-4 z-10">
                    <ArrowRight className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                  </div>
                )}

                <div className="glass rounded-3xl p-8 h-full hover:scale-105 transition-transform duration-300">
                  {/* Step number */}
                  <div 
                    className="text-6xl font-bold mb-4 opacity-30"
                    style={{ color: 'hsl(var(--corsoro-primary))' }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                    style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                  >
                    <step.icon className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-primary))' }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-6">{step.description}</p>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

