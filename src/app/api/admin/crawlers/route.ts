import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCrawlerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  isActive: z.boolean().default(true).optional(),
  minMatchScore: z.number().min(0).max(1).default(0.75).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const crawlers = await db.crawler.findMany({
      include: {
        _count: { select: { keywords: true, runs: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(crawlers);
  } catch (error) {
    console.error("Error fetching crawlers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCrawlerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, isActive = true, minMatchScore = 0.75 } = parsed.data;

    const crawler = await db.crawler.create({
      data: { name, description, isActive, minMatchScore },
      include: {
        _count: { select: { keywords: true, runs: true } },
      },
    });

    return NextResponse.json(crawler, { status: 201 });
  } catch (error) {
    console.error("Error creating crawler:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Crawler with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


