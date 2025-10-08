import { AlertCircle, TrendingDown, Zap } from "lucide-react"

export function ProblemSolution() {
  const problems = [
    {
      icon: TrendingDown,
      title: "Social Platforms Capture Attention",
      description: "Not durable monetization for talent",
    },
    {
      icon: AlertCircle,
      title: "Domains Sit Under-Monetized",
      description: "Portfolio owners lack the tools to turn names into revenue",
    },
    {
      icon: Zap,
      title: "AI-Driven Search Consolidates Traffic",
      description: "Only authoritative sources win in the new discovery landscape",
    },
  ]

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Problem Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {problems.map((problem, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-dark mb-4">
                  <problem.icon className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                </div>
                <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </div>
            ))}
          </div>

          {/* Solution Statement */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}>
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-primary))' }}>
                THE SOLUTION
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Corsoro builds and optimizes fan destinations that{" "}
              <span className="gradient-text">win in the AI era</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              We unify SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) 
              to maximize traffic and revenue per thousand sessions (RPMs).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

