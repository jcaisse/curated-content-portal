import { NextResponse } from "next/server"
import { getArchitectureHealth } from "@/lib/arch-guard"

export async function GET() {
  try {
    const health = await getArchitectureHealth()
    
    return NextResponse.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      database: health.database,
      pgvector: health.pgvector,
      architecture: "locked",
      errors: health.errors
    }, { 
      status: health.status === 'healthy' ? 200 : 500 
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        pgvector: "unknown",
        architecture: "locked",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
