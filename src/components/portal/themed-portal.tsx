import React from 'react'
import { type ThemeConfig } from '@/lib/themes'

interface Post {
  id: string
  title: string | null
  description: string | null
  imageUrl: string | null
  url: string
  source: string
  publishedAt: Date | null
}

interface ThemedPortalProps {
  portal: {
    title: string | null
    description: string | null
    subdomain: string
  }
  posts: Post[]
  theme: ThemeConfig
}

export function ThemedPortal({ portal, posts, theme }: ThemedPortalProps) {
  // Generate CSS variables for the theme
  const themeStyles = {
    '--primary': theme.colors.primary,
    '--secondary': theme.colors.secondary,
    '--accent': theme.colors.accent,
    '--background': theme.colors.background,
    '--foreground': theme.colors.foreground,
    '--card': theme.colors.card,
    '--card-foreground': theme.colors.cardForeground,
    '--border': theme.colors.border,
    '--muted': theme.colors.muted,
    '--muted-foreground': theme.colors.mutedForeground,
    '--font-heading': theme.fonts.heading,
    '--font-body': theme.fonts.body,
    '--radius': theme.borderRadius === 'full' ? '9999px' : 
                theme.borderRadius === 'lg' ? '0.75rem' :
                theme.borderRadius === 'md' ? '0.5rem' :
                theme.borderRadius === 'sm' ? '0.25rem' : '0'
  } as React.CSSProperties

  const headerClasses = getHeaderClasses(theme)
  const containerPadding = theme.spacing === 'compact' ? 'px-4 py-6' :
                           theme.spacing === 'relaxed' ? 'px-6 py-12' :
                           'px-4 py-10'

  return (
    <div style={themeStyles} className="min-h-screen" 
         style={{ ...themeStyles, backgroundColor: `hsl(var(--background))`, color: `hsl(var(--foreground))`, fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header className={headerClasses}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--foreground))` }}
          >
            {portal.title || portal.subdomain}
          </h1>
          {portal.description && (
            <p 
              className="text-lg"
              style={{ color: `hsl(var(--muted-foreground))` }}
            >
              {portal.description}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`mx-auto max-w-6xl ${containerPadding}`}>
        {posts.length === 0 ? (
          <div className="rounded-lg border p-10 text-center"
               style={{ 
                 backgroundColor: `hsl(var(--card))`,
                 borderColor: `hsl(var(--border))`,
                 borderRadius: 'var(--radius)'
               }}>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              No posts yet
            </h2>
            <p className="text-sm mt-2" style={{ color: `hsl(var(--muted-foreground))` }}>
              Approved posts will appear here once published.
            </p>
          </div>
        ) : (
          <LayoutComponent layout={theme.layout} posts={posts} theme={theme} />
        )}
      </main>
    </div>
  )
}

// Layout Components
function LayoutComponent({ layout, posts, theme }: { layout: ThemeConfig['layout']; posts: Post[]; theme: ThemeConfig }) {
  switch (layout) {
    case 'masonry':
      return <MasonryLayout posts={posts} theme={theme} />
    case 'grid':
      return <GridLayout posts={posts} theme={theme} />
    case 'magazine':
      return <MagazineLayout posts={posts} theme={theme} />
    case 'list':
      return <ListLayout posts={posts} theme={theme} />
    case 'single-column':
      return <SingleColumnLayout posts={posts} theme={theme} />
    default:
      return <MasonryLayout posts={posts} theme={theme} />
  }
}

function MasonryLayout({ posts, theme }: { posts: Post[]; theme: ThemeConfig }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} theme={theme} />
      ))}
    </div>
  )
}

function GridLayout({ posts, theme }: { posts: Post[]; theme: ThemeConfig }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} theme={theme} />
      ))}
    </div>
  )
}

function MagazineLayout({ posts, theme }: { posts: Post[]; theme: ThemeConfig }) {
  const [featured, ...rest] = posts
  return (
    <div className="space-y-8">
      {featured && <FeaturedCard post={featured} theme={theme} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rest.map((post) => (
          <PostCard key={post.id} post={post} theme={theme} />
        ))}
      </div>
    </div>
  )
}

function ListLayout({ posts, theme }: { posts: Post[]; theme: ThemeConfig }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ListCard key={post.id} post={post} theme={theme} />
      ))}
    </div>
  )
}

function SingleColumnLayout({ posts, theme }: { posts: Post[]; theme: ThemeConfig }) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} theme={theme} />
      ))}
    </div>
  )
}

// Card Components
function PostCard({ post, theme }: { post: Post; theme: ThemeConfig }) {
  const cardStyle = getCardStyle(theme)
  
  return (
    <article className="mb-4 break-inside-avoid">
      <div className="overflow-hidden transition hover:scale-[1.02]" style={cardStyle}>
        {post.imageUrl && (
          <div className="aspect-[4/3] w-full" style={{ backgroundColor: `hsl(var(--muted))` }}>
            <img
              src={post.imageUrl}
              alt={post.title || ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h2 
              className="text-lg font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--card-foreground))` }}
            >
              {post.title}
            </h2>
            {post.description && (
              <p className="text-sm line-clamp-3" style={{ color: `hsl(var(--muted-foreground))` }}>
                {post.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: `hsl(var(--muted-foreground))` }}>
            <span>{post.source}</span>
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {new Date(post.publishedAt).toLocaleDateString()}
              </time>
            )}
          </div>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={{
              backgroundColor: `hsl(var(--primary))`,
              color: 'white',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: `hsl(var(--border))`
            }}
          >
            Read More
          </a>
        </div>
      </div>
    </article>
  )
}

function FeaturedCard({ post, theme }: { post: Post; theme: ThemeConfig }) {
  const cardStyle = getCardStyle(theme)
  
  return (
    <article className="overflow-hidden transition hover:scale-[1.01]" style={{...cardStyle, gridColumn: '1 / -1'}}>
      <div className="grid md:grid-cols-2 gap-0">
        {post.imageUrl && (
          <div className="aspect-[16/9] md:aspect-auto" style={{ backgroundColor: `hsl(var(--muted))` }}>
            <img
              src={post.imageUrl}
              alt={post.title || ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-8 flex flex-col justify-center">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--card-foreground))` }}
          >
            {post.title}
          </h2>
          {post.description && (
            <p className="text-base mb-6" style={{ color: `hsl(var(--muted-foreground))` }}>
              {post.description}
            </p>
          )}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium transition hover:opacity-90 self-start"
            style={{
              backgroundColor: `hsl(var(--primary))`,
              color: 'white',
              borderRadius: 'var(--radius)'
            }}
          >
            Read Full Article
          </a>
        </div>
      </div>
    </article>
  )
}

function ListCard({ post, theme }: { post: Post; theme: ThemeConfig }) {
  const cardStyle = getCardStyle(theme)
  
  return (
    <article className="overflow-hidden transition hover:scale-[1.01]" style={cardStyle}>
      <div className="flex gap-4 p-4">
        {post.imageUrl && (
          <div className="w-32 h-32 flex-shrink-0" style={{ backgroundColor: `hsl(var(--muted))`, borderRadius: 'var(--radius)' }}>
            <img
              src={post.imageUrl}
              alt={post.title || ""}
              className="h-full w-full object-cover"
              style={{ borderRadius: 'var(--radius)' }}
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: `hsl(var(--card-foreground))` }}
          >
            {post.title}
          </h2>
          {post.description && (
            <p className="text-sm mb-3 line-clamp-2" style={{ color: `hsl(var(--muted-foreground))` }}>
              {post.description}
            </p>
          )}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium transition hover:underline"
            style={{ color: `hsl(var(--primary))` }}
          >
            Read More →
          </a>
        </div>
      </div>
    </article>
  )
}

// Helper Functions
function getHeaderClasses(theme: ThemeConfig): string {
  const base = "border-b"
  
  switch (theme.headerStyle) {
    case 'minimal':
      return base
    case 'gradient':
      return `${base} bg-gradient-to-r`
    case 'bold':
      return `${base} bg-card shadow-lg`
    default:
      return `${base} bg-card/70 backdrop-blur`
  }
}

function getCardStyle(theme: ThemeConfig): React.CSSProperties {
  const base: React.CSSProperties = {
    backgroundColor: `hsl(var(--card))`,
    borderRadius: 'var(--radius)'
  }

  switch (theme.cardStyle) {
    case 'flat':
      return base
    case 'border':
      return { ...base, border: `1px solid hsl(var(--border))` }
    case 'shadow':
      return { ...base, border: `1px solid hsl(var(--border))`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
    case 'glass':
      return { ...base, backdropFilter: 'blur(10px)', backgroundColor: `hsla(var(--card) / 0.8)`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }
    case 'elevated':
      return { ...base, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: `1px solid hsl(var(--border))` }
    default:
      return base
  }
}

