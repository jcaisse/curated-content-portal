import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export type GuardSuccess = { authorized: true; user: Awaited<ReturnType<typeof auth>>['user'] }
export type GuardFailure = { authorized: false; response: NextResponse }

export async function requireAdmin(): Promise<GuardSuccess | GuardFailure> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { authorized: true, user: session.user }
}
