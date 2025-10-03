import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RecommendedSource {
  url: string
  type: 'rss' | 'web'
  title: string
  description: string
  reason: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: crawlerId } = await params

  try {
    // Fetch the crawler with keywords
    const crawler = await db.crawler.findUnique({
      where: { id: crawlerId },
      include: {
        keywords: {
          select: { term: true },
        },
      },
    })

    if (!crawler) {
      return NextResponse.json({ error: 'Crawler not found' }, { status: 404 })
    }

    const keywords = crawler.keywords.map((k) => k.term)

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: 'No keywords configured for this crawler' },
        { status: 400 }
      )
    }

    // Lazy-load OpenAI to avoid build-time env validation
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Use ChatGPT to recommend sources
    const prompt = `You are a content curation expert. Based on the following keywords, recommend high-quality, reliable sources (websites and RSS feeds) that can be scraped for relevant content.

Keywords: ${keywords.join(', ')}

Crawler Name: ${crawler.name}
Crawler Description: ${crawler.description || 'Not provided'}

Requirements:
1. Recommend 5-8 sources total
2. Mix of RSS feeds and web pages
3. Prioritize authoritative, regularly updated sources
4. Include both mainstream and niche sources
5. Verify the sources are scrapable (not behind paywalls, not requiring JavaScript heavy interactions)
6. For RSS feeds, provide the actual RSS feed URL (usually ending in /feed, /rss, or /feed.xml)
7. For web pages, provide pages that list articles or content (like blog index pages)

Format your response as a JSON array with this structure:
[
  {
    "url": "https://example.com/feed/",
    "type": "rss",
    "title": "Example Blog RSS Feed",
    "description": "A leading blog about [topic]",
    "reason": "Comprehensive coverage of [keywords], updated daily"
  },
  {
    "url": "https://example.com/blog",
    "type": "web",
    "title": "Example Blog Articles",
    "description": "Article archive for [topic]",
    "reason": "Well-structured content on [keywords] with clear article listings"
  }
]

Only return the JSON array, no additional text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a content curation expert who recommends high-quality, scrapable sources for web crawlers. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0]?.message?.content?.trim()

    if (!responseText) {
      throw new Error('Empty response from OpenAI')
    }

    // Parse the JSON response
    let recommendations: RecommendedSource[]
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim()
      recommendations = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate recommendations
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error('AI returned invalid recommendations')
    }

    // Filter out sources that already exist
    const existingSources = await db.crawlerSource.findMany({
      where: { crawlerId },
      select: { url: true },
    })

    const existingUrls = new Set(existingSources.map((s) => s.url))
    const newRecommendations = recommendations.filter(
      (rec) => !existingUrls.has(rec.url)
    )

    return NextResponse.json({
      recommendations: newRecommendations,
      existingSourcesFiltered: recommendations.length - newRecommendations.length,
    })
  } catch (error: any) {
    console.error('Source recommendation error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate source recommendations',
        details: error?.stack,
      },
      { status: 500 }
    )
  }
}

