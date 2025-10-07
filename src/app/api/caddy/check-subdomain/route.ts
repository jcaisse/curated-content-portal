import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Caddy on-demand TLS validation endpoint
 * 
 * This endpoint is called by Caddy to verify if a subdomain should receive a TLS certificate.
 * Returns 200 if the subdomain is valid (crawler exists), 404 otherwise.
 * 
 * Query param: domain - the full domain being requested (e.g., "coffee.spoot.com")
 */
export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get("domain");
    
    if (!domain) {
      return NextResponse.json(
        { error: "Missing domain parameter" },
        { status: 400 }
      );
    }

    // Extract subdomain from the full domain
    // e.g., "coffee.spoot.com" -> "coffee"
    const subdomain = domain.split(".")[0];
    
    // Special case: main portal site is always valid
    if (subdomain === "portal" || domain === process.env.DOMAIN) {
      return NextResponse.json({ valid: true }, { status: 200 });
    }

    // Check if a crawler portal exists with this subdomain
    const portal = await db.crawlerPortal.findFirst({
      where: {
        subdomain: subdomain,
        subdomainOnHold: false, // Not on hold
        crawler: {
          isActive: true // Only allow active crawlers
        }
      },
      select: {
        id: true,
        subdomain: true
      }
    });

    if (portal) {
      // Subdomain is valid
      return NextResponse.json({ valid: true }, { status: 200 });
    }

    // Subdomain not found or inactive
    return NextResponse.json(
      { error: "Subdomain not found or inactive" },
      { status: 404 }
    );

  } catch (error) {
    console.error("Caddy subdomain check error:", error);
    
    // Return 404 on error to prevent certificate issuance
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 404 }
    );
  }
}

