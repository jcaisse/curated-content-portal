import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schemas for bulk operations
const bulkCreateSchema = z.object({
  keywords: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isActive: z.boolean().default(true),
  })).min(1).max(50),
});

const bulkUpdateSchema = z.object({
  keywordIds: z.array(z.string()).min(1).max(50),
  updates: z.object({
    isActive: z.boolean().optional(),
  }),
});

const bulkDeleteSchema = z.object({
  keywordIds: z.array(z.string()).min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { operation } = body;

    switch (operation) {
      case 'create':
        return await bulkCreate(request, session.user.id);
      case 'update':
        return await bulkUpdate(request);
      case 'delete':
        return await bulkDelete(request);
      default:
        return NextResponse.json(
          { error: "Invalid operation. Must be 'create', 'update', or 'delete'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk keyword operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function bulkCreate(request: NextRequest, userId: string) {
  const body = await request.json();
  
  const validationResult = bulkCreateSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: "Validation failed", 
        details: validationResult.error.flatten().fieldErrors 
      },
      { status: 400 }
    );
  }

  const { keywords } = validationResult.data;

  try {
    // Use transaction to ensure all keywords are created or none
    const result = await db.$transaction(async (tx) => {
      const createdKeywords = [];
      
      for (const keywordData of keywords) {
        const keyword = await tx.keyword.create({
          data: {
            ...keywordData,
            createdBy: userId,
          },
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
        createdKeywords.push(keyword);
      }
      
      return createdKeywords;
    });

    return NextResponse.json({
      message: `Successfully created ${result.length} keywords`,
      keywords: result,
    }, { status: 201 });

  } catch (error) {
    console.error("Error in bulk keyword creation:", error);
    
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "One or more keywords with these names already exist" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create keywords" },
      { status: 500 }
    );
  }
}

async function bulkUpdate(request: NextRequest) {
  const body = await request.json();
  
  const validationResult = bulkUpdateSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: "Validation failed", 
        details: validationResult.error.flatten().fieldErrors 
      },
      { status: 400 }
    );
  }

  const { keywordIds, updates } = validationResult.data;

  try {
    const result = await db.keyword.updateMany({
      where: {
        id: {
          in: keywordIds,
        },
      },
      data: updates,
    });

    return NextResponse.json({
      message: `Successfully updated ${result.count} keywords`,
      count: result.count,
    });

  } catch (error) {
    console.error("Error in bulk keyword update:", error);
    return NextResponse.json(
      { error: "Failed to update keywords" },
      { status: 500 }
    );
  }
}

async function bulkDelete(request: NextRequest) {
  const body = await request.json();
  
  const validationResult = bulkDeleteSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: "Validation failed", 
        details: validationResult.error.flatten().fieldErrors 
      },
      { status: 400 }
    );
  }

  const { keywordIds } = validationResult.data;

  try {
    // Check if any keywords have associated posts or runs
    const keywordsWithDependencies = await db.keyword.findMany({
      where: {
        id: {
          in: keywordIds,
        },
      },
      include: {
        _count: {
          select: {
            posts: true,
            runs: true,
          },
        },
      },
    });

    const protectedKeywords = keywordsWithDependencies.filter(
      kw => kw._count.posts > 0 || kw._count.runs > 0
    );

    if (protectedKeywords.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete keywords with associated posts or crawl runs",
          protectedKeywords: protectedKeywords.map(kw => ({
            id: kw.id,
            name: kw.name,
            postsCount: kw._count.posts,
            runsCount: kw._count.runs,
          })),
        },
        { status: 409 }
      );
    }

    const result = await db.keyword.deleteMany({
      where: {
        id: {
          in: keywordIds,
        },
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} keywords`,
      count: result.count,
    });

  } catch (error) {
    console.error("Error in bulk keyword deletion:", error);
    return NextResponse.json(
      { error: "Failed to delete keywords" },
      { status: 500 }
    );
  }
}
