"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-animate opacity-10" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container relative z-10 mx-auto px-6 py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--corsoro-accent))' }} />
            <span className="text-sm font-medium">Platform in Beta - Onboarding Partners</span>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Turn Brand Names and Domain Names into{" "}
            <span className="gradient-text">Revenue-Generating Assets</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            AI-optimized fan destinations that rank in search and appear as answers in AI engines
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 gradient-primary text-white hover:opacity-90 transition-opacity"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Monetizing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2"
              style={{ borderColor: 'hsl(var(--corsoro-primary))' }}
              onClick={() => window.location.href = '/platform'}
            >
              View Platform Features
            </Button>
          </div>

          {/* Stats ticker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-dark rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                100M+
              </div>
              <div className="text-sm text-muted-foreground">
                Aggregate Social Reach
              </div>
            </div>
            <div className="glass-dark rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                $8-$20+
              </div>
              <div className="text-sm text-muted-foreground">
                Session RPM at Scale
              </div>
            </div>
            <div className="glass-dark rounded-2xl p-6">
              <div className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--corsoro-accent))' }}>
                55-65%
              </div>
              <div className="text-sm text-muted-foreground">
                Gross Margins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full glow-primary opacity-20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full glow-accent opacity-20 blur-3xl" />
    </section>
  )
}

