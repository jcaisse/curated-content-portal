import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  let posts: any[] = []
  
  try {
    posts = await db.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        updatedAt: true,
        publishedAt: true
      }
    })
  } catch (error) {
    // Database not available during build time - return empty sitemap
    console.warn('Database not available for sitemap generation:', error)
    posts = []
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const lastModified = new Date().toISOString()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/posts/${post.id}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}
