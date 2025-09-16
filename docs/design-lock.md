# Design Lock - Aesthetics and Visual Standards

**IMPORTANT**: The current design aesthetics are FINAL and must not be changed. This includes all visual elements, spacing, typography, and styling.

## Locked Design Elements

### Typography
- **Font Family**: Inter (as configured in `src/app/layout.tsx`)
- **Font Weights**: As defined in Tailwind CSS classes
- **Text Sizes**: Using Tailwind text size classes (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl)

### Color Palette
- **Primary Colors**: As defined in `src/app/globals.css` CSS variables
- **Background**: `hsl(var(--background))`
- **Foreground**: `hsl(var(--foreground))`
- **Card**: `hsl(var(--card))`
- **Border**: `hsl(var(--border))`
- **Muted**: `hsl(var(--muted))`

### Spacing and Layout
- **Container**: `container mx-auto px-4`
- **Grid Systems**: 
  - Homepage: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
  - Admin Stats: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
  - Admin Layout: `grid grid-cols-1 lg:grid-cols-2 gap-8`
- **Padding**: `p-6`, `p-4`, `py-8`, `px-4`
- **Margins**: `mb-8`, `mt-6`, `gap-4`, `gap-6`

### Component Styling
- **Cards**: `rounded-lg border bg-card text-card-foreground shadow-sm`
- **Buttons**: Using shadcn/ui button variants and sizes
- **Badges**: Using shadcn/ui badge variants
- **Forms**: Using shadcn/ui input, label, and form components

### Visual Hierarchy
- **Page Titles**: `text-3xl font-bold` or `text-4xl font-bold`
- **Section Titles**: `text-2xl font-semibold`
- **Card Titles**: `text-2xl font-semibold leading-none tracking-tight`
- **Body Text**: Default text styling with `text-muted-foreground` for secondary text

### Responsive Design
- **Breakpoints**: Using Tailwind's default breakpoints (sm, md, lg, xl, 2xl)
- **Mobile First**: All layouts are mobile-first responsive

## Prohibited Changes

❌ **DO NOT CHANGE**:
- Typography families, sizes, or weights
- Color palette or CSS variable values
- Spacing, padding, or margin values
- Grid layouts or responsive breakpoints
- Component styling or visual hierarchy
- Border radius, shadows, or visual effects
- Animation or transition timings

## Allowed Changes

✅ **ALLOWED**:
- Adding new components that follow existing design patterns
- Adding new pages that use established layout patterns
- Adding new functionality that maintains visual consistency
- Updating content while preserving styling
- Adding new data without changing visual presentation

## Design System Components

All components must use the established shadcn/ui components:
- `Button` with defined variants and sizes
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Badge` with defined variants
- `Input`, `Label` for forms
- Consistent spacing and typography classes

## Verification

Before any changes, verify:
1. Typography remains consistent
2. Spacing follows established patterns
3. Colors use CSS variables
4. Components use shadcn/ui patterns
5. Responsive behavior is maintained

## Files with Design Lock

- `src/app/globals.css` - CSS variables and global styles
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/*` - shadcn/ui components
- `src/app/layout.tsx` - Typography configuration
- All page and component files using established patterns

**This design lock ensures visual consistency and prevents aesthetic drift.**
