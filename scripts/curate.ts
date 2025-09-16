#!/usr/bin/env node

import { db } from '../src/lib/db';
import { curateContent } from '../src/lib/ai';

async function curatePendingPosts() {
  console.log('🤖 Starting AI content curation...');
  
  try {
    // Get posts that need curation (DRAFT status)
    const posts = await db.post.findMany({
      where: { status: 'DRAFT' },
      take: 10, // Process in batches
      orderBy: { createdAt: 'asc' }
    });

    if (posts.length === 0) {
      console.log('No posts found for curation');
      return;
    }

    console.log(`Found ${posts.length} posts to curate`);

    let curated = 0;
    let errors = 0;

    for (const post of posts) {
      try {
        console.log(`Curating: ${post.title}`);
        
        // Use AI to enhance the post
        const curatedData = await curateContent({
          title: post.title,
          description: post.description || '',
          content: post.content || '',
          url: post.url
        });

        // Update the post with curated data
        await db.post.update({
          where: { id: post.id },
          data: {
            description: curatedData.description,
            tags: curatedData.tags, // PostgreSQL array, not JSON string
            status: 'REVIEW', // Move to review queue
          }
        });

        console.log(`✅ Curated: ${post.title}`);
        curated++;

      } catch (error) {
        console.error(`❌ Error curating ${post.title}:`, error);
        errors++;
      }
    }

    console.log(`🎉 Curation completed! Curated: ${curated}, Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Curation failed:', error);
    process.exit(1);
  }
}

async function main() {
  await curatePendingPosts();
  await db.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}