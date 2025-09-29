import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function ago(hours: number) {
  return new Date(Date.now() - hours * 3600 * 1000)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [hourRuns, dayRuns, weekRuns] = await Promise.all([
      db.crawlRun.findMany({ where: { crawlerId: id, startedAt: { gte: ago(1) } } }),
      db.crawlRun.findMany({ where: { crawlerId: id, startedAt: { gte: ago(24) } } }),
      db.crawlRun.findMany({ where: { crawlerId: id, startedAt: { gte: ago(24 * 7) } } }),
    ])

    function summarize(runs: any[]) {
      const count = runs.length
      const pages = runs.reduce((acc, r) => acc + (r.itemsProcessed || 0), 0)
      const durations = runs
        .map((r) => (r.startedAt && r.completedAt) ? (new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) : 0)
        .filter((d) => d > 0)
      const avgMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
      return { count, pages, avgMs }
    }

    const stats = {
      lastHour: summarize(hourRuns),
      lastDay: summarize(dayRuns),
      lastWeek: summarize(weekRuns),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching crawler stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


