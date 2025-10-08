import { Button } from "@/components/ui/button"
import { Footer } from "@/components/marketing/footer"
import { Target, Eye, Heart, Sparkles, Users, TrendingUp, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "About Us - Corsoro Media",
  description: "Learn about Corsoro Media's mission to monetize the open web with AI-optimized fan destinations. Discover our story, vision, and values.",
}

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Partner-First",
      description: "We succeed when our partners succeed. Revenue share aligns our incentives with talent, domain owners, and agencies."
    },
    {
      icon: Sparkles,
      title: "AI-Native",
      description: "Built for the future of discovery where AI selects authoritative answers. We optimize for both search engines and AI engines."
    },
    {
      icon: Heart,
      title: "Transparency",
      description: "Clear reporting, honest revenue share, and open communication. No hidden fees, no surprises."
    },
    {
      icon: Zap,
      title: "Speed",
      description: "From concept to cash-flowing asset in 30 days. Automation and AI enable rapid deployment at scale."
    }
  ]

  const milestones = [
    {
      year: "2024",
      title: "Platform Beta Launch",
      description: "Launched beta platform with 6 owned domains and AI-first optimization stack"
    },
    {
      year: "2025",
      title: "Studio Partnerships",
      description: "Secured pipeline conversations with 3 major studios and talent agencies representing 100M+ social reach"
    },
    {
      year: "2025",
      title: "Scale Phase",
      description: "Expanding to 25-50 active sites with portfolio-level management and direct advertiser relationships"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-animate opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full glow-accent opacity-20 blur-3xl" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full glass-dark mb-6">
              <span className="text-sm font-semibold" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                ABOUT CORSORO MEDIA
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Monetizing the{" "}
              <span className="gradient-text">Open Web for the AI Era</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              We transform underutilized name domains and fan destinations into revenue-generating assets through AI-first optimization and transparent revenue sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Corsoro Media was founded on a simple observation: the open web is being under-monetized while attention consolidates on social platforms and AI-driven search reshapes how people discover content.
                </p>
                <p>
                  Influencers, celebrities, and content creators have massive social reach but struggle to convert that attention into durable, recurring revenue on the open web. Meanwhile, domain portfolio owners sit on valuable "name domains" that could be generating consistent cash flow.
                </p>
                <p>
                  At the same time, search is evolving. AI engines like ChatGPT, Perplexity, and Google's AI Overviews are selecting authoritative sources to answer user queries. The sites that win in this new landscape are those optimized not just for traditional SEO, but for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO).
                </p>
                <p>
                  We built Corsoro to bridge this gap: deploying AI-optimized fan destinations at scale, sharing revenue transparently with partners, and positioning our sites to win in the AI era of discovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="glass-dark rounded-3xl p-10">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                >
                  <Target className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-primary))' }} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To monetize the open web for influencers, domain owners, and studios by building AI-optimized fan destinations that rank in search and appear as answers in AI engines—at scale, with speed, and with transparent revenue sharing.
                </p>
              </div>

              {/* Vision */}
              <div className="glass-dark rounded-3xl p-10">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ backgroundColor: 'hsla(var(--corsoro-accent) / 0.1)' }}
                >
                  <Eye className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To become the leading platform for AI-native content monetization, empowering creators and domain owners to capture their fair share of the open web economy as search evolves into AI-driven discovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide everything we build
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div 
                    key={index}
                    className="glass-dark rounded-3xl p-8 text-center hover:scale-105 transition-transform"
                  >
                    <div 
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                      style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
                    >
                      <Icon className="h-7 w-7" style={{ color: 'hsl(var(--corsoro-primary))' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-animate opacity-5" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Journey</h2>
              <p className="text-xl text-muted-foreground">
                Building the future of open web monetization
              </p>
            </div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="flex gap-8 items-start group"
                >
                  <div className="flex-shrink-0">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold glass-dark group-hover:scale-110 transition-transform"
                      style={{ color: 'hsl(var(--corsoro-accent))' }}
                    >
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-grow glass-dark rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-3">{milestone.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto glass-dark rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Platform at a Glance
              </h2>
              <p className="text-muted-foreground">
                Current traction and pipeline
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <Users className="h-10 w-10 mx-auto mb-4" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                <div className="text-3xl font-bold gradient-text mb-2">100M+</div>
                <div className="text-sm text-muted-foreground">Aggregate Social Reach</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-10 w-10 mx-auto mb-4" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                <div className="text-3xl font-bold gradient-text mb-2">6</div>
                <div className="text-sm text-muted-foreground">Owned Domains</div>
              </div>
              <div className="text-center">
                <Sparkles className="h-10 w-10 mx-auto mb-4" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                <div className="text-3xl font-bold gradient-text mb-2">3</div>
                <div className="text-sm text-muted-foreground">Studio Partnerships</div>
              </div>
              <div className="text-center">
                <Heart className="h-10 w-10 mx-auto mb-4" style={{ color: 'hsl(var(--corsoro-accent))' }} />
                <div className="text-3xl font-bold gradient-text mb-2">$8-$20</div>
                <div className="text-sm text-muted-foreground">Session RPM Range</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        
        <div className="container relative mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join Us in Monetizing the Open Web
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Partner with Corsoro to turn attention into recurring revenue
            </p>
            <Link href="/#contact">
              <Button 
                size="lg" 
                className="gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                Start the Conversation
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
