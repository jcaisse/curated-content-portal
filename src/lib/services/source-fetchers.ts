import rssParser from "rss-parser"
import { CheerioCrawler } from "crawlee"

export interface SourceFetchResult {
  url: string
  title?: string
  summary?: string
  content?: string
  imageUrl?: string
  author?: string
  source?: string
  language?: string
  publishedAt?: string
}

const rss = new rssParser()

export async function fetchRss(url: string, limit: number): Promise<SourceFetchResult[]> {
  try {
    const feed = await rss.parseURL(url)
    return (feed.items ?? []).slice(0, limit).map((item) => ({
      url: item.link ?? '',
      title: item.title ?? undefined,
      summary: item.contentSnippet ?? item.summary ?? undefined,
      content: item['content:encoded'] ?? item.content ?? undefined,
      author: item.creator ?? item.author ?? undefined,
      publishedAt: item.isoDate ?? undefined,
      source: feed.title ?? undefined,
    })).filter((item) => !!item.url)
  } catch (error: any) {
    // Log the error but return empty array instead of crashing
    console.error(`Failed to parse RSS feed ${url}:`, error.message)
    throw new Error(`RSS feed parsing failed: ${error.message}`)
  }
}

export async function fetchWeb(
  url: string, 
  options?: { 
    maxPages?: number
    maxDepth?: number
    followLinks?: boolean
  }
): Promise<SourceFetchResult[]> {
  const maxPages = options?.maxPages ?? 1
  const maxDepth = options?.maxDepth ?? 0
  const followLinks = options?.followLinks ?? false
  
  const results: SourceFetchResult[] = []
  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: maxPages,
    persistStorage: false,
    async requestHandler({ request, $, enqueueLinks }) {
      const currentDepth = (request.userData.depth ?? 0) as number
      
      const title = $('title').text().trim() || $('h1').first().text().trim()
      const summary = $('meta[name="description"]').attr('content') || $('p').first().text().trim()
      let imageUrl = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content')
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = new URL(imageUrl, request.url).href
      }
      const content = $('p').slice(0, 5).map((_, el) => $(el).text()).get().join('\n')
      
      results.push({
        url: request.url,
        title,
        summary,
        content,
        imageUrl: imageUrl ?? undefined,
        source: new URL(request.url).hostname,
      })
      
      // Follow links if enabled and within depth limit
      if (followLinks && currentDepth < maxDepth) {
        await enqueueLinks({
          strategy: 'same-domain',
          transformRequestFunction(req) {
            req.userData.depth = currentDepth + 1
            return req
          },
          // Only enqueue if we haven't hit maxPages
          globs: results.length < maxPages ? ['**'] : [],
        })
      }
    },
    maxRequestRetries: 2,
    maxConcurrency: 3,
    preNavigationHooks: [
      async ({ request }, gotoOptions) => {
        // Faster loading for deeper pages
        if ((request.userData.depth ?? 0) > 0) {
          gotoOptions.waitUntil = 'domcontentloaded'
        }
      },
    ],
  })

  await crawler.run([{ url, userData: { depth: 0 } }])
  return results
}

export async function crawlSource({ 
  source, 
  limit,
  webOptions 
}: { 
  source: { type: string; url: string }
  limit: number
  webOptions?: {
    maxPages?: number
    maxDepth?: number
    followLinks?: boolean
  }
}) {
  if (source.type === 'rss') {
    const items = await fetchRss(source.url, limit)
    return { items }
  }

  // Web crawling with optional link following
  const items = await fetchWeb(source.url, {
    maxPages: webOptions?.maxPages ?? limit,
    maxDepth: webOptions?.maxDepth ?? 2,
    followLinks: webOptions?.followLinks ?? true,
  })
  return { items: items.slice(0, limit) }
}


