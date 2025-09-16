#!/usr/bin/env ts-node

import { CheerioCrawler } from 'crawlee';
import { db } from '../src/lib/db';
import { generateUrlHash, normalizeUrl } from '../src/lib/url-utils';
import { getEmbedding } from '../src/lib/ai';
// Status types are now strings

interface CrawlOptions {
  keyword: string;
  limit: number;
}

async function crawlKeyword({ keyword, limit }: CrawlOptions) {
  console.log(`🚀 Starting crawl for keyword: "${keyword}" (limit: ${limit})`);
  
  // Create or get keyword
  const keywordRecord = await db.keyword.upsert({
    where: { name: keyword },
    update: {},
    create: {
      name: keyword,
      description: `Auto-generated keyword for crawling`,
      isActive: true,
      createdBy: (await db.user.findFirst({ where: { role: 'ADMIN' } }))?.id || 'system'
    }
  });

  // Create crawl run
  const crawlRun = await db.crawlRun.create({
    data: {
      keywordId: keywordRecord.id,
      status: 'PENDING',
      startedAt: new Date()
    }
  });

  try {
    // Update status to running
    await db.crawlRun.update({
      where: { id: crawlRun.id },
      data: { status: 'RUNNING' }
    });

    let itemsFound = 0;
    let itemsProcessed = 0;

    // Configure crawler
    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: limit,
      requestHandler: async ({ request, $, response }) => {
        try {
          itemsFound++;
          
          const url = request.url;
          const title = $('title').text().trim() || $('h1').first().text().trim();
          const description = $('meta[name="description"]').attr('content') || 
                             $('p').first().text().trim().substring(0, 200);
          
          // Extract image
          let imageUrl = $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') ||
                        $('img').first().attr('src');
          
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, url).href;
          }

          // Generate URL hash for deduplication
          const urlHash = generateUrlHash(url);

          // Check if post already exists
          const existingPost = await db.post.findUnique({
            where: { urlHash }
          });

          if (existingPost) {
            console.log(`⚠️  Duplicate found: ${url}`);
            return;
          }

          // Get content text (first few paragraphs)
          const content = $('p').slice(0, 3).map((_, el) => $(el).text()).get().join(' ').trim();

          // Create post
          const post = await db.post.create({
            data: {
              title,
              description: description?.substring(0, 500),
              content: content.substring(0, 2000),
              url,
              imageUrl,
              source: new URL(url).hostname,
              status: 'DRAFT',
              urlHash,
              keywordId: keywordRecord.id,
              runId: crawlRun.id
            }
          });

          // Note: Embedding generation would be added here for vector similarity
          // For now, we'll skip this to keep the setup simple

          itemsProcessed++;
          console.log(`✅ Processed: ${title} (${url})`);

          // Update crawl run progress
          await db.crawlRun.update({
            where: { id: crawlRun.id },
            data: { 
              itemsFound,
              itemsProcessed 
            }
          });

        } catch (error) {
          console.error(`❌ Error processing ${request.url}:`, error);
        }
      },
    });

    // TODO: Implement real content sources integration
    // This is a placeholder - replace with actual RSS feeds and web sources
    const searchUrls = [
      // TODO: Replace with real RSS feeds and content sources
      `https://example.com/search?q=${encodeURIComponent(keyword)}`,
    ];

    await crawler.run(searchUrls);

    // Update crawl run status
    await db.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        itemsFound,
        itemsProcessed
      }
    });

    console.log(`🎉 Crawl completed! Found ${itemsFound} items, processed ${itemsProcessed}`);

  } catch (error) {
    console.error('❌ Crawl failed:', error);
    
    await db.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const keywordArg = args.find(arg => arg.startsWith('--keyword='))?.split('=')[1];
  const limitArg = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
  
  if (!keywordArg) {
    console.error('❌ Keyword is required. Usage: npm run crawl -- --keyword="artificial intelligence" --limit=10');
    process.exit(1);
  }

  const keyword = keywordArg.replace(/"/g, '');
  const limit = limitArg ? parseInt(limitArg) : 50;

  await crawlKeyword({ keyword, limit });
  
  await db.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}
