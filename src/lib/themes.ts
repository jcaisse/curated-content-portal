export interface ThemeConfig {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    border: string
    muted: string
    mutedForeground: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: 'masonry' | 'grid' | 'list' | 'magazine' | 'single-column'
  spacing: 'compact' | 'normal' | 'relaxed'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  cardStyle: 'flat' | 'shadow' | 'border' | 'glass' | 'elevated'
  headerStyle: 'minimal' | 'standard' | 'bold' | 'gradient'
}

export const THEMES: Record<string, ThemeConfig> = {
  'modern-tech': {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean and minimalist design perfect for tech content, startups, and SaaS',
    preview: '🚀',
    colors: {
      primary: '214 100% 50%',      // Bright blue #0066FF
      secondary: '220 13% 91%',     // Light gray
      accent: '214 100% 60%',       // Lighter blue
      background: '0 0% 100%',      // White
      foreground: '222 47% 11%',    // Dark gray/black
      card: '0 0% 100%',            // White
      cardForeground: '222 47% 11%',
      border: '214 32% 91%',        // Light blue-gray
      muted: '210 40% 96%',         // Very light blue
      mutedForeground: '215 16% 47%'
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, sans-serif',
      body: 'Inter, system-ui, -apple-system, sans-serif'
    },
    layout: 'masonry',
    spacing: 'normal',
    borderRadius: 'lg',
    cardStyle: 'shadow',
    headerStyle: 'standard'
  },

  'luxury-magazine': {
    id: 'luxury-magazine',
    name: 'Luxury Magazine',
    description: 'Elegant and sophisticated with gold accents for premium lifestyle content',
    preview: '✨',
    colors: {
      primary: '45 100% 51%',       // Gold #FFD700
      secondary: '0 0% 0%',         // Black
      accent: '45 100% 60%',        // Lighter gold
      background: '0 0% 100%',      // White
      foreground: '0 0% 0%',        // Black
      card: '0 0% 98%',             // Off-white
      cardForeground: '0 0% 0%',
      border: '45 10% 85%',         // Light gold-gray
      muted: '45 10% 95%',          // Very light gold
      mutedForeground: '0 0% 40%'
    },
    fonts: {
      heading: 'Playfair Display, Georgia, serif',
      body: 'Montserrat, -apple-system, sans-serif'
    },
    layout: 'magazine',
    spacing: 'relaxed',
    borderRadius: 'none',
    cardStyle: 'border',
    headerStyle: 'bold'
  },

  'nature-wellness': {
    id: 'nature-wellness',
    name: 'Nature & Wellness',
    description: 'Calm and organic with earth tones for health, wellness, and sustainability',
    preview: '🌿',
    colors: {
      primary: '142 43% 54%',       // Sage green #8BA888
      secondary: '30 25% 90%',      // Cream
      accent: '142 43% 64%',        // Light sage
      background: '30 20% 98%',     // Off-white cream #FAF9F6
      foreground: '30 5% 25%',      // Warm dark brown
      card: '0 0% 100%',            // White
      cardForeground: '30 5% 25%',
      border: '142 20% 85%',        // Light green-gray
      muted: '142 20% 95%',         // Very light sage
      mutedForeground: '30 5% 45%'
    },
    fonts: {
      heading: 'Lora, Georgia, serif',
      body: 'Open Sans, -apple-system, sans-serif'
    },
    layout: 'masonry',
    spacing: 'relaxed',
    borderRadius: 'lg',
    cardStyle: 'shadow',
    headerStyle: 'minimal'
  },

  'bold-vibrant': {
    id: 'bold-vibrant',
    name: 'Bold & Vibrant',
    description: 'Electric colors with dark background for music, entertainment, and youth brands',
    preview: '⚡',
    colors: {
      primary: '270 91% 65%',       // Electric purple #8B5CF6
      secondary: '328 86% 70%',     // Hot pink #EC4899
      accent: '200 98% 60%',        // Cyan
      background: '240 10% 10%',    // Dark background
      foreground: '0 0% 98%',       // Nearly white
      card: '240 10% 15%',          // Slightly lighter dark
      cardForeground: '0 0% 98%',
      border: '240 10% 25%',        // Medium dark
      muted: '240 10% 20%',         // Dark muted
      mutedForeground: '240 5% 65%'
    },
    fonts: {
      heading: 'Poppins, -apple-system, sans-serif',
      body: 'Poppins, -apple-system, sans-serif'
    },
    layout: 'grid',
    spacing: 'normal',
    borderRadius: 'md',
    cardStyle: 'glass',
    headerStyle: 'gradient'
  },

  'corporate-professional': {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Conservative and business-like for finance, legal, consulting, and B2B',
    preview: '💼',
    colors: {
      primary: '217 91% 60%',       // Navy blue #3B82F6
      secondary: '215 20% 65%',     // Gray-blue
      accent: '217 91% 70%',        // Lighter navy
      background: '0 0% 100%',      // White
      foreground: '222 47% 11%',    // Dark text
      card: '0 0% 98%',             // Light gray
      cardForeground: '222 47% 11%',
      border: '215 20% 85%',        // Light gray-blue
      muted: '215 20% 95%',         // Very light gray
      mutedForeground: '215 20% 45%'
    },
    fonts: {
      heading: 'Arial, Helvetica, sans-serif',
      body: 'Arial, Helvetica, sans-serif'
    },
    layout: 'grid',
    spacing: 'normal',
    borderRadius: 'sm',
    cardStyle: 'border',
    headerStyle: 'standard'
  },

  'minimalist-japanese': {
    id: 'minimalist-japanese',
    name: 'Minimalist Japanese',
    description: 'Zen aesthetics with maximum white space for design and architecture',
    preview: '🎌',
    colors: {
      primary: '0 70% 50%',         // Red accent #D32F2F
      secondary: '0 0% 18%',        // Charcoal #2D2D2D
      accent: '0 70% 60%',          // Lighter red
      background: '0 0% 96%',       // Off-white #F5F5F5
      foreground: '0 0% 18%',       // Charcoal
      card: '0 0% 100%',            // Pure white
      cardForeground: '0 0% 18%',
      border: '0 0% 88%',           // Light gray
      muted: '0 0% 94%',            // Very light gray
      mutedForeground: '0 0% 40%'
    },
    fonts: {
      heading: 'Noto Sans, Inter, sans-serif',
      body: 'Noto Sans, Inter, sans-serif'
    },
    layout: 'single-column',
    spacing: 'relaxed',
    borderRadius: 'none',
    cardStyle: 'flat',
    headerStyle: 'minimal'
  },

  'retro-newspaper': {
    id: 'retro-newspaper',
    name: 'Retro Newspaper',
    description: 'Vintage newspaper style for journalism and editorial content',
    preview: '📰',
    colors: {
      primary: '0 65% 50%',         // Red headline
      secondary: '0 0% 0%',         // Black
      accent: '0 65% 60%',          // Lighter red
      background: '43 50% 92%',     // Cream paper #F4E8C1
      foreground: '0 0% 0%',        // Black text
      card: '43 50% 95%',           // Lighter cream
      cardForeground: '0 0% 0%',
      border: '43 20% 75%',         // Tan
      muted: '43 30% 88%',          // Light tan
      mutedForeground: '0 0% 30%'
    },
    fonts: {
      heading: 'Merriweather, Georgia, serif',
      body: 'Georgia, serif'
    },
    layout: 'list',
    spacing: 'compact',
    borderRadius: 'none',
    cardStyle: 'border',
    headerStyle: 'standard'
  },

  'dark-elite': {
    id: 'dark-elite',
    name: 'Dark Mode Elite',
    description: 'High-contrast dark theme for gaming, tech, crypto, and developers',
    preview: '🌙',
    colors: {
      primary: '187 100% 50%',      // Cyan #00D9FF
      secondary: '217 91% 60%',     // Blue
      accent: '187 100% 65%',       // Lighter cyan
      background: '0 0% 4%',        // Deep black #0A0A0A
      foreground: '0 0% 98%',       // White text
      card: '0 0% 8%',              // Slightly lighter black
      cardForeground: '0 0% 98%',
      border: '0 0% 15%',           // Dark gray
      muted: '0 0% 12%',            // Very dark gray
      mutedForeground: '0 0% 65%'
    },
    fonts: {
      heading: 'Inter, -apple-system, sans-serif',
      body: 'Inter, -apple-system, sans-serif'
    },
    layout: 'grid',
    spacing: 'normal',
    borderRadius: 'md',
    cardStyle: 'elevated',
    headerStyle: 'gradient'
  },

  'pastel-creative': {
    id: 'pastel-creative',
    name: 'Pastel Creative',
    description: 'Soft and playful with pastel colors for art, crafts, and creative content',
    preview: '🎨',
    colors: {
      primary: '340 100% 90%',      // Soft pink #FFD1DC
      secondary: '160 50% 85%',     // Mint #B4E7CE
      accent: '270 60% 85%',        // Lavender #E0BBE4
      background: '0 0% 100%',      // White
      foreground: '0 0% 20%',       // Dark gray
      card: '340 100% 98%',         // Very light pink
      cardForeground: '0 0% 20%',
      border: '340 30% 90%',        // Light pink
      muted: '340 30% 95%',         // Very light pink
      mutedForeground: '0 0% 45%'
    },
    fonts: {
      heading: 'Quicksand, -apple-system, sans-serif',
      body: 'Nunito, -apple-system, sans-serif'
    },
    layout: 'masonry',
    spacing: 'relaxed',
    borderRadius: 'full',
    cardStyle: 'shadow',
    headerStyle: 'standard'
  },

  'academic-scholar': {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    description: 'Traditional and authoritative for education, research, and academic content',
    preview: '📚',
    colors: {
      primary: '213 100% 14%',      // Oxford blue #002147
      secondary: '0 40% 40%',       // Burgundy
      accent: '213 100% 24%',       // Lighter oxford
      background: '0 0% 100%',      // White
      foreground: '0 0% 10%',       // Near black
      card: '48 50% 96%',           // Parchment tint
      cardForeground: '0 0% 10%',
      border: '48 20% 80%',         // Light tan
      muted: '48 30% 93%',          // Light parchment
      mutedForeground: '0 0% 35%'
    },
    fonts: {
      heading: 'Garamond, Georgia, serif',
      body: 'Garamond, Georgia, serif'
    },
    layout: 'list',
    spacing: 'compact',
    borderRadius: 'sm',
    cardStyle: 'border',
    headerStyle: 'standard'
  }
}

export const DEFAULT_THEME_ID = 'modern-tech'

export function getTheme(themeId?: string): ThemeConfig {
  if (!themeId || !THEMES[themeId]) {
    return THEMES[DEFAULT_THEME_ID]
  }
  return THEMES[themeId]
}

export function getThemeList(): ThemeConfig[] {
  return Object.values(THEMES)
}

