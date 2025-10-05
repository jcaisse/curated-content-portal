import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * AI Source Recommendations based on keywords
 * Used in the wizard before a crawler is created
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keywords } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords array required' }, { status: 400 })
    }

    // Lazy-load OpenAI to avoid build-time env validation
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const keywordList = keywords.join(', ')
    
    const prompt = `Given these keywords: ${keywordList}

Suggest 5-7 high-quality, reputable sources (websites, RSS feeds, or blogs) where content related to these keywords can be found.

For each source, provide:
1. The URL (prefer RSS feed URLs when available, otherwise the main website URL)
2. A brief description of why this source is relevant

Format your response as a JSON array of objects with "url" and "description" fields.

Example format:
[
  {
    "url": "https://example.com/feed.xml",
    "description": "Leading industry publication covering these topics daily"
  }
]

Focus on authoritative, regularly updated sources. Prefer RSS feeds when available.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that recommends high-quality content sources. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content || '[]'
    
    // Parse the JSON response
    let recommendations = []
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        recommendations = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json({ 
        error: 'Failed to parse AI recommendations',
        recommendations: [] 
      }, { status: 200 })
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, 7), // Limit to 7
      keywords: keywords,
    })

  } catch (error: any) {
    console.error('[recommend-sources] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
