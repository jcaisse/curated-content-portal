import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; keywordId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, keywordId } = await params;
    const item = await db.crawlerKeyword.findFirst({ where: { id: keywordId, crawlerId: id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.crawlerKeyword.delete({ where: { id: item.id } });
    return NextResponse.json({ message: "Removed" });
  } catch (error) {
    console.error("Error removing crawler keyword:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


