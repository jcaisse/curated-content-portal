import { Monitor, ShoppingBag, Handshake, TrendingUp } from "lucide-react"

export function BusinessModel() {
  const revenueStreams = [
    {
      icon: Monitor,
      title: "Programmatic Ads",
      description: "Display, video, and native advertising as primary revenue driver",
      highlight: "Immediate revenue",
    },
    {
      icon: ShoppingBag,
      title: "Affiliate Commerce",
      description: "Contextual links for merch, tickets, gear in purchase-heavy verticals",
      highlight: "High-margin uplift",
    },
    {
      icon: Handshake,
      title: "Direct Sponsorships",
      description: "Packaged cross-site inventory for advertisers at scale",
      highlight: "Premium CPMs",
    },
  ]

  const economics = [
    {
      metric: "$15-$20",
      label: "Session RPM at Scale",
      description: "Blended revenue per 1,000 sessions with optimized ad mix",
    },
    {
      metric: "20-30%",
      label: "Partner Revenue Share",
      description: "Gross revenue shared with talent and domain owners",
    },
    {
      metric: "55-65%",
      label: "Gross Margins",
      description: "After rev share and ad-tech fees, at scale",
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}>
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-primary))' }}>
                BUSINESS MODEL
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Transparent Economics,{" "}
              <span className="gradient-text">Aligned Incentives</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Multiple revenue streams with clear unit economics that scale
            </p>
          </div>

          {/* Revenue streams */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {revenueStreams.map((stream, index) => (
              <div key={index} className="glass rounded-3xl p-8 hover:scale-105 transition-transform">
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{ backgroundColor: 'hsla(var(--corsoro-secondary) / 0.1)' }}
                >
                  <stream.icon className="h-7 w-7" style={{ color: 'hsl(var(--corsoro-secondary))' }} />
                </div>
                
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)', color: 'hsl(var(--corsoro-accent))' }}>
                  {stream.highlight}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{stream.title}</h3>
                <p className="text-sm text-muted-foreground">{stream.description}</p>
              </div>
            ))}
          </div>

          {/* Unit economics */}
          <div className="glass-dark rounded-3xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-2">Unit Economics</h3>
              <p className="text-muted-foreground">Proven metrics from pilot sites</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {economics.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="text-5xl font-bold gradient-text">
                      {item.metric}
                    </div>
                    <div className="absolute -inset-4 rounded-full glow-primary opacity-30 blur-2xl -z-10" />
                  </div>
                  <div className="text-lg font-semibold mb-2">{item.label}</div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-border/50 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <TrendingUp className="h-5 w-5" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                <span className="text-sm">
                  From underutilized domain to cash-flowing asset in 30 days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

