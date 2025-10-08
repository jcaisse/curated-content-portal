"use client"

import { CheckCircle2, Users, Building, TrendingUp } from "lucide-react"

export function TractionStats() {
  const stats = [
    {
      icon: CheckCircle2,
      label: "Platform Status",
      value: "Beta",
      sublabel: "Onboarding Partners",
    },
    {
      icon: Building,
      label: "Pipeline",
      value: "6",
      sublabel: "Owned domains + 3 major studios",
    },
    {
      icon: Users,
      label: "Aggregate Reach",
      value: "100M+",
      sublabel: "Social followers targeted",
    },
    {
      icon: TrendingUp,
      label: "Validated RPM",
      value: "$8-$12",
      sublabel: "Page RPM on pilot sites",
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Early Traction &{" "}
              <span className="gradient-text">Growing Pipeline</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Platform in beta with active conversations across studios, talent agencies, and large domain portfolio owners
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="relative group"
              >
                {/* Card */}
                <div className="glass rounded-3xl p-8 text-center h-full border border-transparent group-hover:border-primary/20 transition-all duration-300">
                  {/* Icon */}
                  <div 
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                  >
                    <stat.icon 
                      className="h-6 w-6" 
                      style={{ color: 'hsl(var(--corsoro-primary))' }} 
                    />
                  </div>

                  {/* Stats */}
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {stat.label}
                  </div>
                  <div className="text-4xl font-bold mb-2 gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.sublabel}
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }} />
              </div>
            ))}
          </div>

          {/* Testimonial / Quote section */}
          <div className="glass-dark rounded-3xl p-12 text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6 opacity-20">"</div>
            <blockquote className="text-2xl font-medium mb-8 leading-relaxed">
              First movers in AEO/GEO capture outsized share. Our speed, AI-first stack, and partner alignment create a defensible position at the intersection of creator demand, domain monetization, and AI-driven search.
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-primary" />
              <div className="text-left">
                <div className="font-semibold">Corsoro Team</div>
                <div className="text-sm text-muted-foreground">Building the future of web monetization</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

