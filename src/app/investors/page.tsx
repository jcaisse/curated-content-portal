import { Button } from "@/components/ui/button"
import { Footer } from "@/components/marketing/footer"
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Sparkles,
  Mail,
  FileText,
  BarChart3,
  ArrowRight
} from "lucide-react"

export const metadata = {
  title: "Investors - Corsoro Media",
  description: "Investment opportunity in Corsoro Media. AI-optimized platform monetizing the open web with 100M+ social reach pipeline and $5M raise.",
}

export default function InvestorsPage() {
  const investmentHighlights = [
    {
      icon: TrendingUp,
      title: "Market Opportunity",
      description: "AI-driven search consolidates traffic to authoritative sources. First movers in AEO/GEO capture outsized share of the evolving discovery landscape."
    },
    {
      icon: Sparkles,
      title: "Product Differentiation",
      description: "Unified SEO+AEO+GEO optimization stack, enterprise ad technology, and aligned revenue share create defensible competitive advantage."
    },
    {
      icon: Users,
      title: "Pipeline Traction",
      description: "100M+ aggregate social reach targeted across influencers, studios, and domain portfolio owners. Active conversations with 3 major studios."
    },
    {
      icon: DollarSign,
      title: "Unit Economics",
      description: "$15-$20 session RPM at scale with 55-65% gross margins. Revenue share model aligns incentives and reduces IP risk."
    }
  ]

  const useOfFunds = [
    { category: "Domain Acquisition & Partnerships", percentage: "35%", amount: "$1.75M" },
    { category: "Platform & AI/AEO/GEO Development", percentage: "30%", amount: "$1.50M" },
    { category: "Ad-Ops, Compliance & Analytics", percentage: "15%", amount: "$0.75M" },
    { category: "Sales & Business Development", percentage: "10%", amount: "$0.50M" },
    { category: "Working Capital & Contingency", percentage: "10%", amount: "$0.50M" },
  ]

  const projections = [
    {
      year: "Year 1",
      sessions: "60M",
      rpm: "$15",
      revenue: "$0.9M",
      ebitda: "-$2.0M"
    },
    {
      year: "Year 2",
      sessions: "180M",
      rpm: "$16.5",
      revenue: "$3.0M",
      ebitda: "-$1.3M"
    },
    {
      year: "Year 3",
      sessions: "400M",
      rpm: "$20",
      revenue: "$8.0M",
      ebitda: "+$0.7M"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-10" />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full glow-primary opacity-20 blur-3xl" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full glass-dark mb-6">
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                INVESTMENT OPPORTUNITY
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Monetizing the Open Web in the{" "}
              <span className="gradient-text">AI Era</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Corsoro Media is raising $5M to scale AI-optimized fan destinations across influencers, celebrities, and large domain portfolios.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:investors@corsoro.com">
                <Button 
                  size="lg" 
                  className="gradient-primary text-white hover:opacity-90 transition-opacity"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Investors Team
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-dark rounded-3xl p-10">
              <h2 className="text-3xl font-bold mb-6">Executive Summary</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">The Problem:</strong> Social platforms capture attention, not durable monetization. Domain portfolios sit under-monetized. AI-driven search consolidates traffic to authoritative sources.
                </p>
                <p>
                  <strong className="text-foreground">The Solution:</strong> Corsoro builds and operates AI-optimized fan destinations that rank in search and appear as answers in AI engines. We unify SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) to maximize traffic and RPMs.
                </p>
                <p>
                  <strong className="text-foreground">The Opportunity:</strong> 100M+ aggregate social reach in pipeline. Conversations with 3 major studios, talent agencies, and large domain portfolio owners representing thousands of premium domains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Invest in Corsoro?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Four reasons this is the right opportunity at the right time
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {investmentHighlights.map((highlight, index) => {
                const Icon = highlight.icon
                return (
                  <div 
                    key={index}
                    className="glass-dark rounded-3xl p-8 hover:scale-105 transition-transform"
                  >
                    <div 
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                      style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                    >
                      <Icon className="h-7 w-7" style={{ color: 'hsl(var(--corsoro-primary))' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{highlight.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Use of Funds
              </h2>
              <p className="text-xl text-muted-foreground">
                $5M deployment strategy
              </p>
            </div>

            <div className="glass-dark rounded-3xl p-10">
              <div className="space-y-6">
                {useOfFunds.map((item, index) => (
                  <div key={index} className="flex items-center justify-between pb-6 border-b border-border/50 last:border-0">
                    <div className="flex-grow">
                      <div className="font-semibold mb-2">{item.category}</div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full gradient-primary" 
                          style={{ width: item.percentage }}
                        />
                      </div>
                    </div>
                    <div className="ml-8 text-right">
                      <div className="text-2xl font-bold gradient-text">{item.amount}</div>
                      <div className="text-sm text-muted-foreground">{item.percentage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Projections */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-animate opacity-5" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                3-Year Financial Outlook
              </h2>
              <p className="text-xl text-muted-foreground">
                Path to profitability and scale
              </p>
            </div>

            <div className="glass-dark rounded-3xl p-10 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-4 font-semibold">Metric</th>
                    {projections.map((proj, i) => (
                      <th key={i} className="text-right py-4 px-4 font-semibold">{proj.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground">Annual Sessions</td>
                    {projections.map((proj, i) => (
                      <td key={i} className="text-right py-4 px-4 font-semibold">{proj.sessions}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground">Session RPM</td>
                    {projections.map((proj, i) => (
                      <td key={i} className="text-right py-4 px-4 font-semibold">{proj.rpm}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground">Revenue</td>
                    {projections.map((proj, i) => (
                      <td key={i} className="text-right py-4 px-4 font-bold gradient-text">{proj.revenue}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-muted-foreground">EBITDA</td>
                    {projections.map((proj, i) => (
                      <td key={i} className="text-right py-4 px-4 font-bold" style={{ 
                        color: proj.ebitda.startsWith('+') ? 'hsl(var(--corsoro-accent))' : 'inherit'
                      }}>
                        {proj.ebitda}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Figures are illustrative and depend on traffic scale, ad mix, and market conditions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Milestones */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Key Milestones
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-dark rounded-2xl p-8 text-center">
                <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--corsoro-accent))' }}>90 DAYS</div>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>• 3 beta sites live</li>
                  <li>• $8-$12 page RPM</li>
                  <li>• 2 LOIs signed</li>
                </ul>
              </div>
              <div className="glass-dark rounded-2xl p-8 text-center">
                <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--corsoro-accent))' }}>6 MONTHS</div>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>• 20-40M quarterly sessions</li>
                  <li>• $16+ session RPM</li>
                  <li>• 5 rev-share partners</li>
                </ul>
              </div>
              <div className="glass-dark rounded-2xl p-8 text-center">
                <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--corsoro-accent))' }}>12 MONTHS</div>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>• 60M+ annual sessions</li>
                  <li>• 25-50 active sites</li>
                  <li>• 2 direct renewals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Let's Talk About the Opportunity
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact our investors team to learn more about Corsoro's growth trajectory
            </p>
            
            <div className="glass-dark rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Mail className="h-6 w-6" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                <a 
                  href="mailto:investors@corsoro.com"
                  className="text-2xl font-semibold hover:underline"
                  style={{ color: 'hsl(var(--corsoro-accent))' }}
                >
                  investors@corsoro.com
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Investment deck, financial model, and additional materials available upon request
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
