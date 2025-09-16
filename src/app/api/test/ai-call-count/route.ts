import { NextResponse } from "next/server";
import { getCallCount } from "@/lib/ai/adapter";

export async function GET() {
  // Only available in test mode
  if (process.env.E2E_TEST_MODE !== 'true') {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  return NextResponse.json({ callCount: getCallCount() });
}
