import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { curateContent } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, action } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: "Post ID and action are required" },
        { status: 400 }
      );
    }

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    let updatedPost;

    switch (action) {
      case "curate":
        // Use AI to enhance the post
        const curated = await curateContent({
          title: post.title,
          description: post.description || "",
          content: post.content || "",
          url: post.url,
        });

        updatedPost = await db.post.update({
          where: { id: postId },
          data: {
            description: curated.description,
            tags: curated.tags, // PostgreSQL array, not JSON string
            status: "REVIEW",
          },
        });
        break;

      case "approve":
        updatedPost = await db.post.update({
          where: { id: postId },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
          },
        });
        break;

      case "reject":
        updatedPost = await db.post.update({
          where: { id: postId },
          data: {
            status: "REJECTED",
          },
        });
        break;

      case "draft":
        updatedPost = await db.post.update({
          where: { id: postId },
          data: {
            status: "DRAFT",
          },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error in curation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "REVIEW";
    const limit = parseInt(searchParams.get("limit") || "20");

    const posts = await db.post.findMany({
      where: { status: status as any }, // Cast to enum type
      include: {
        keyword: {
          select: {
            id: true,
            name: true,
          },
        },
        run: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts for review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
