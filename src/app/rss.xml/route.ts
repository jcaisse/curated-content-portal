import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  let posts: any[] = []
  
  try {
    posts = await db.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
      include: {
        keyword: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  } catch (error) {
    // Database not available during build time - return empty RSS
    console.warn('Database not available for RSS generation:', error)
    posts = []
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Curated Content Portal</title>
    <description>AI-powered content curation platform</description>
    <link>${process.env.NEXTAUTH_URL || 'http://localhost:3000'}</link>
    <atom:link href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description || ''}]]></description>
      <link>${post.url}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date(post.createdAt).toUTCString()}</pubDate>
      ${post.author ? `<author><![CDATA[${post.author.name || post.author.email}]]></author>` : ''}
      ${post.keyword ? `<category><![CDATA[${post.keyword.name}]]></category>` : ''}
      ${post.imageUrl ? `<enclosure url="${post.imageUrl}" type="image/jpeg"/>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
