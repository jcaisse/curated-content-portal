import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// TODO: Replace with real content sources integration
const MOCK_SOURCES = [
  {
    id: "rss-techcrunch",
    name: "TechCrunch RSS",
    type: "rss",
    url: "https://techcrunch.com/feed/",
    isActive: true,
    lastChecked: new Date().toISOString(),
    itemsFound: 25,
  },
  {
    id: "rss-hackernews",
    name: "Hacker News",
    type: "rss",
    url: "https://hnrss.org/frontpage",
    isActive: true,
    lastChecked: new Date().toISOString(),
    itemsFound: 30,
  },
  {
    id: "web-devto",
    name: "DEV Community",
    type: "web",
    url: "https://dev.to",
    isActive: false,
    lastChecked: null,
    itemsFound: 0,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with real database query
    return NextResponse.json(MOCK_SOURCES);
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, url, isActive = true } = body;

    if (!name || !type || !url) {
      return NextResponse.json(
        { error: "Name, type, and URL are required" },
        { status: 400 }
      );
    }

    // TODO: Implement real source creation
    const newSource = {
      id: `mock-${Date.now()}`,
      name,
      type,
      url,
      isActive,
      lastChecked: null,
      itemsFound: 0,
    };

    return NextResponse.json(newSource, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
