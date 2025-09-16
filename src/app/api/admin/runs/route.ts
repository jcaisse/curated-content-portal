import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keywordId = searchParams.get("keywordId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where = keywordId ? { keywordId } : {};

    const runs = await db.crawlRun.findMany({
      where,
      include: {
        keyword: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("Error fetching crawl runs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keywordId } = body;

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

    // Create new crawl run
    const run = await db.crawlRun.create({
      data: {
        keywordId,
        status: "PENDING",
      },
      include: {
        keyword: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // TODO: Trigger actual crawling process in background
    console.log(`Created crawl run ${run.id} for keyword "${keyword.name}"`);

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error("Error creating crawl run:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
