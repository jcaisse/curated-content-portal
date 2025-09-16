import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for updates
const updateKeywordSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const keyword = await db.keyword.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            posts: true,
            runs: true,
          },
        },
      },
    });

    if (!keyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    return NextResponse.json(keyword);
  } catch (error) {
    console.error("Error fetching keyword:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = updateKeywordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    const { id } = await params;
    
    // Check if keyword exists
    const existingKeyword = await db.keyword.findUnique({
      where: { id },
    });

    if (!existingKeyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    const keyword = await db.keyword.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            posts: true,
            runs: true,
          },
        },
      },
    });

    return NextResponse.json(keyword);
  } catch (error) {
    console.error("Error updating keyword:", error);
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Keyword with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if keyword exists
    const existingKeyword = await db.keyword.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
            runs: true,
          },
        },
      },
    });

    if (!existingKeyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    // Check if keyword has associated posts or runs
    if (existingKeyword._count.posts > 0 || existingKeyword._count.runs > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete keyword with associated posts or crawl runs. Consider deactivating instead.",
          postsCount: existingKeyword._count.posts,
          runsCount: existingKeyword._count.runs,
        },
        { status: 409 }
      );
    }

    await db.keyword.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Keyword deleted successfully" });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
