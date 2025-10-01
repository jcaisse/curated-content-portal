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
}

export async function fetchWeb(url: string): Promise<SourceFetchResult[]> {
  const results: SourceFetchResult[] = []
  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 1,
    async requestHandler({ request, $, enqueueLinks }) {
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
      await enqueueLinks({
        strategy: 'same-domain',
        transformRequestFunction(req) {
          req.userData.depth = (request.userData.depth ?? 0) + 1
          return req
        },
      })
    },
    maxRequestRetries: 1,
    maxConcurrency: 2,
    preNavigationHooks: [
      async ({ request }, gotoOptions) => {
        if ((request.userData.depth ?? 0) > 0) {
          gotoOptions.waitUntil = 'domcontentloaded'
        }
      },
    ],
  })

  await crawler.run([url])
  return results
}

export async function crawlSource({ source, limit }: { source: { type: string; url: string }; limit: number }) {
  if (source.type === 'rss') {
    const items = await fetchRss(source.url, limit)
    return { items }
  }

  const items = await fetchWeb(source.url)
  return { items: items.slice(0, limit) }
}


