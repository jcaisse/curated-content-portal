"use client"

import React from 'react'
import { THEMES, type ThemeConfig } from '@/lib/themes'
import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface ThemeSelectorProps {
  selectedThemeId: string
  onThemeChange: (themeId: string) => void
}

export function ThemeSelector({ selectedThemeId, onThemeChange }: ThemeSelectorProps) {
  const themes = Object.values(THEMES)
  const selectedTheme = THEMES[selectedThemeId] || THEMES['modern-tech']

  return (
    <div className="space-y-6">
      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={theme.id === selectedThemeId}
            onClick={() => onThemeChange(theme.id)}
          />
        ))}
      </div>

      {/* Selected Theme Preview */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Selected Theme Preview</div>
              <div className="text-xs text-muted-foreground mb-4">
                This is how your portal will look with the selected theme
              </div>
            </div>

            {/* Live Preview */}
            <div 
              className="rounded-lg border-2 overflow-hidden"
              style={{
                backgroundColor: `hsl(${selectedTheme.colors.background})`,
                color: `hsl(${selectedTheme.colors.foreground})`,
                fontFamily: selectedTheme.fonts.body
              }}
            >
              {/* Preview Header */}
              <div 
                className="p-6 border-b"
                style={{
                  backgroundColor: `hsl(${selectedTheme.colors.card})`,
                  borderColor: `hsl(${selectedTheme.colors.border})`
                }}
              >
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: selectedTheme.fonts.heading,
                    color: `hsl(${selectedTheme.colors.foreground})`
                  }}
                >
                  {selectedTheme.name}
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: `hsl(${selectedTheme.colors.mutedForeground})` }}
                >
                  {selectedTheme.description}
                </p>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-4">
                {/* Sample Cards */}
                <div className={`grid gap-4 ${
                  selectedTheme.layout === 'masonry' ? 'grid-cols-2' :
                  selectedTheme.layout === 'grid' ? 'grid-cols-2' :
                  selectedTheme.layout === 'single-column' ? 'grid-cols-1' :
                  'grid-cols-2'
                }`}>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="overflow-hidden"
                      style={{
                        backgroundColor: `hsl(${selectedTheme.colors.card})`,
                        borderRadius: selectedTheme.borderRadius === 'full' ? '9999px' :
                                      selectedTheme.borderRadius === 'lg' ? '0.75rem' :
                                      selectedTheme.borderRadius === 'md' ? '0.5rem' :
                                      selectedTheme.borderRadius === 'sm' ? '0.25rem' : '0',
                        border: selectedTheme.cardStyle === 'border' ? `1px solid hsl(${selectedTheme.colors.border})` : 'none',
                        boxShadow: selectedTheme.cardStyle === 'shadow' ? '0 1px 3px rgba(0,0,0,0.1)' :
                                  selectedTheme.cardStyle === 'elevated' ? '0 4px 6px rgba(0,0,0,0.3)' :
                                  selectedTheme.cardStyle === 'glass' ? '0 8px 32px rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      {/* Card Image Placeholder */}
                      <div 
                        className="h-24 w-full"
                        style={{
                          backgroundColor: `hsl(${selectedTheme.colors.muted})`
                        }}
                      />
                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        <h3 
                          className="font-semibold text-sm"
                          style={{
                            fontFamily: selectedTheme.fonts.heading,
                            color: `hsl(${selectedTheme.colors.cardForeground})`
                          }}
                        >
                          Sample Post Title
                        </h3>
                        <p 
                          className="text-xs"
                          style={{ color: `hsl(${selectedTheme.colors.mutedForeground})` }}
                        >
                          This is a sample post description showing how content will appear.
                        </p>
                        <button
                          className="w-full text-xs font-medium py-2 px-3 rounded transition"
                          style={{
                            backgroundColor: `hsl(${selectedTheme.colors.primary})`,
                            color: 'white',
                            borderRadius: selectedTheme.borderRadius === 'full' ? '9999px' :
                                        selectedTheme.borderRadius === 'lg' ? '0.5rem' :
                                        selectedTheme.borderRadius === 'md' ? '0.375rem' :
                                        selectedTheme.borderRadius === 'sm' ? '0.25rem' : '0'
                          }}
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Layout:</span>
                <span className="ml-2 font-medium capitalize">{selectedTheme.layout}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Card Style:</span>
                <span className="ml-2 font-medium capitalize">{selectedTheme.cardStyle}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Spacing:</span>
                <span className="ml-2 font-medium capitalize">{selectedTheme.spacing}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Border Radius:</span>
                <span className="ml-2 font-medium capitalize">{selectedTheme.borderRadius}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ThemeCardProps {
  theme: ThemeConfig
  isSelected: boolean
  onClick: () => void
}

function ThemeCard({ theme, isSelected, onClick }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left transition-all ${
        isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'
      }`}
      style={{ borderRadius: '0.75rem' }}
    >
      <Card className="overflow-hidden h-full">
        <CardContent className="p-0">
          {/* Theme Preview */}
          <div 
            className="h-32 relative flex items-center justify-center text-4xl"
            style={{
              background: `linear-gradient(135deg, hsl(${theme.colors.primary}) 0%, hsl(${theme.colors.accent}) 100%)`
            }}
          >
            <span className="filter drop-shadow-lg">{theme.preview}</span>
            
            {/* Selected Badge */}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            )}
          </div>

          {/* Theme Info */}
          <div className="p-4 space-y-2">
            <div>
              <h3 className="font-semibold">{theme.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {theme.description}
              </p>
            </div>

            {/* Color Swatches */}
            <div className="flex gap-1">
              {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: `hsl(${color})` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

