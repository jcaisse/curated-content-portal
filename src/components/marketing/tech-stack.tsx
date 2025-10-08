import { Search, Cpu, Database, Gauge, MessageSquare, Network } from "lucide-react"

export function TechStack() {
  const technologies = [
    {
      icon: Search,
      title: "SEO/AEO/GEO",
      description: "Triple optimization for traditional search, answer engines, and generative AI",
    },
    {
      icon: Cpu,
      title: "Google Ad Manager",
      description: "Enterprise ad serving with Prebid header bidding across 6-10 SSPs",
    },
    {
      icon: Database,
      title: "Schema-Rich Content",
      description: "Structured data for entities, events, products, and creative works",
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description: "Internal linking and topical authority across the portfolio",
    },
    {
      icon: Gauge,
      title: "Core Web Vitals",
      description: "Optimized page load, mobile-first UX, high viewability ad placements",
    },
    {
      icon: MessageSquare,
      title: "LLM-Friendly Patterns",
      description: "Answer formatting, citations, and freshness signals for AI engines",
    },
  ]

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />
      
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--corsoro-primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--corsoro-primary)) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container relative mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)' }}>
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                TECHNOLOGY
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Engineered for{" "}
              <span className="gradient-text">AI-Driven Discovery</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              First movers with AEO/GEO-native sites capture outsized share in a rapidly evolving search landscape
            </p>
          </div>

          {/* Tech grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <div 
                key={index}
                className="relative group"
              >
                {/* Card */}
                <div className="glass-dark rounded-3xl p-8 h-full border border-transparent group-hover:border-primary/20 transition-all duration-300">
                  {/* Icon */}
                  <div 
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)' }}
                  >
                    <tech.icon 
                      className="h-7 w-7" 
                      style={{ color: 'hsl(var(--corsoro-accent))' }} 
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{tech.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tech.description}
                  </p>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)' }} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="text-lg font-semibold mb-2">
                Appear as the answer in AI-driven results
              </div>
              <p className="text-sm text-muted-foreground">
                Our stack is purpose-built for the future of search, where AI selects authoritative answers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

