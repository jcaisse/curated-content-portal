import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// TODO: Replace with real content ingestion logic
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keywordId, sources = [] } = body;

    if (!keywordId) {
      return NextResponse.json(
        { error: "Keyword ID is required" },
        { status: 400 }
      );
    }

    // Verify keyword exists
    const keyword = await db.keyword.findUnique({
      where: { id: keywordId },
    });

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword not found" },
        { status: 404 }
      );
    }

    // Create crawl run
    const run = await db.crawlRun.create({
      data: {
        keywordId,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // TODO: Implement real content ingestion from sources
    // For now, simulate the process with placeholder data
    const mockItems = [
      {
        title: `TODO: Real article about ${keyword.name}`,
        description: `TODO: This is placeholder content for ${keyword.name}`,
        url: `TODO://example.com/article-${Date.now()}`,
        imageUrl: null, // TODO: Real image URL
        source: "TODO: Real Source",
        publishedAt: new Date(),
        tags: [keyword.name, "TODO: real-tag"],
      },
    ];

    let itemsProcessed = 0;
    
    for (const item of mockItems) {
      try {
        // Check if URL already exists
        const existingPost = await db.post.findUnique({
          where: { url: item.url },
        });

        if (existingPost) {
          continue; // Skip duplicates
        }

        // Create post
        await db.post.create({
          data: {
            title: item.title,
            description: item.description,
            url: item.url,
            imageUrl: item.imageUrl,
            source: item.source,
            publishedAt: item.publishedAt,
            status: "DRAFT",
            tags: item.tags, // PostgreSQL array, not JSON string
            urlHash: Buffer.from(item.url).toString("base64"),
            keywordId,
            runId: run.id,
          },
        });

        itemsProcessed++;
      } catch (error) {
        console.error("Error processing item:", error);
      }
    }

    // Update crawl run
    await db.crawlRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        itemsFound: mockItems.length,
        itemsProcessed,
      },
    });

    return NextResponse.json({
      runId: run.id,
      itemsFound: mockItems.length,
      itemsProcessed,
      status: "completed",
    });
  } catch (error) {
    console.error("Error in content ingestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
