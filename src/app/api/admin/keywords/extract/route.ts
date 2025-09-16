import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { z } from "zod";
import { openai } from "@/lib/ai";
import { mockAIExtraction } from "@/lib/ai/adapter";
import crypto from "crypto";

// Validation schema for AI extraction
const extractKeywordsSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(5000, "Text cannot exceed 5000 characters"),
  maxKeywords: z.number().min(1).max(50).default(20),
  categories: z.array(z.string()).optional(),
});

// Simple in-memory cache for test mode
const cache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(text: string, maxKeywords: number): string {
  return crypto.createHash('sha256').update(`${text}:${maxKeywords}`).digest('hex');
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.result;
}

function setCache(key: string, result: any): void {
  cache.set(key, { result, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = extractKeywordsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { text, maxKeywords, categories } = validationResult.data;

    // Check cache first
    const cacheKey = getCacheKey(text, maxKeywords);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Test mode - use mock AI
    if (process.env.E2E_TEST_MODE === 'true') {
      try {
        const mode = process.env.E2E_AI_MODE || 'success';
        const result = await mockAIExtraction(text, maxKeywords, mode);
        
        // Cache the result
        setCache(cacheKey, result);
        
        return NextResponse.json(result);
      } catch (error) {
        console.error("Mock AI extraction error:", error);
        
        return NextResponse.json({
          keywords: generateFallbackKeywords(text, maxKeywords),
          extractedAt: new Date().toISOString(),
          textLength: text.length,
          fallback: true,
          error: "Mock AI extraction failed, using fallback method"
        });
      }
    }

    // Production mode - use real AI
    if (config.ai.disabled || !config.ai.apiKey) {
      return NextResponse.json(
        { 
          error: "AI features are disabled or API key is not configured",
          fallbackKeywords: generateFallbackKeywords(text, maxKeywords)
        },
        { status: 503 }
      );
    }

    try {
      // Create the AI prompt for keyword extraction
      const prompt = createKeywordExtractionPrompt(text, maxKeywords, categories);
      
      if (!openai) {
        throw new Error("OpenAI client not available");
      }
      
      const response = await openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          {
            role: "system",
            content: "You are an expert content curator and SEO specialist. Extract relevant keywords from text content for web scraping and content discovery."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Parse the AI response
      const keywords = parseAIKeywordResponse(aiResponse);
      const result = {
        keywords,
        extractedAt: new Date().toISOString(),
        textLength: text.length,
        aiModel: config.ai.model,
      };

      // Cache the result
      setCache(cacheKey, result);

      return NextResponse.json(result);

    } catch (aiError) {
      console.error("AI extraction error:", aiError);
      
      // Fallback to simple keyword extraction
      const fallbackResult = {
        keywords: generateFallbackKeywords(text, maxKeywords),
        extractedAt: new Date().toISOString(),
        textLength: text.length,
        fallback: true,
        error: "AI extraction failed, using fallback method"
      };
      
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error("Error in keyword extraction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function createKeywordExtractionPrompt(text: string, maxKeywords: number, categories?: string[]): string {
  const categoryContext = categories ? `\nFocus on these categories: ${categories.join(", ")}` : "";
  
  return `Analyze the following text and extract the most relevant keywords for content curation and web scraping. Focus on:

1. Main topics and themes
2. Industry-specific terminology  
3. Trending keywords and phrases
4. Long-tail keywords for better targeting
5. Related concepts and synonyms

${categoryContext}

Return exactly ${maxKeywords} keywords in this JSON format:
{
  "keywords": [
    {
      "name": "keyword name",
      "relevance": 0.95,
      "category": "category name",
      "confidence": "high|medium|low"
    }
  ]
}

Text to analyze:
${text}`;
}

function parseAIKeywordResponse(response: string): Array<{
  name: string;
  relevance: number;
  category: string;
  confidence: "high" | "medium" | "low";
}> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.keywords && Array.isArray(parsed.keywords)) {
        return parsed.keywords.map((kw: any) => ({
          name: kw.name || "",
          relevance: typeof kw.relevance === "number" ? kw.relevance : 0.5,
          category: kw.category || "general",
          confidence: ["high", "medium", "low"].includes(kw.confidence) ? kw.confidence : "medium"
        }));
      }
    }
    
    // Fallback: extract keywords from text response
    const lines = response.split('\n').filter(line => line.trim());
    const keywords = lines.slice(0, 20).map((line, index) => ({
      name: line.replace(/^\d+\.?\s*/, '').replace(/[:\-].*$/, '').trim(),
      relevance: Math.max(0.9 - (index * 0.05), 0.3),
      category: "general",
      confidence: (index < 5 ? "high" : index < 10 ? "medium" : "low") as "high" | "medium" | "low"
    })).filter(kw => kw.name.length > 0);

    return keywords;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return generateFallbackKeywords(response, 10);
  }
}

function generateFallbackKeywords(text: string, maxKeywords: number): Array<{
  name: string;
  relevance: number;
  category: string;
  confidence: "high" | "medium" | "low";
}> {
  // Simple keyword extraction using word frequency and common patterns
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isCommonWord(word));

  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords);

  return sortedWords.map(([word, count], index) => ({
    name: word,
    relevance: Math.max(0.9 - (index * 0.05), 0.3),
    category: "general",
    confidence: (index < 3 ? "high" : index < 8 ? "medium" : "low") as "high" | "medium" | "low"
  }));
}

function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'use', 'way', 'been', 'call', 'come', 'does', 'each', 'find', 'give', 'good', 'have', 'here', 'just', 'like', 'long', 'look', 'made', 'make', 'many', 'more', 'most', 'much', 'name', 'need', 'only', 'over', 'part', 'said', 'same', 'seem', 'she', 'some', 'take', 'than', 'that', 'them', 'they', 'this', 'time', 'very', 'want', 'well', 'went', 'were', 'what', 'when', 'will', 'with', 'your', 'about', 'after', 'again', 'being', 'before', 'below', 'between', 'during', 'first', 'from', 'into', 'little', 'other', 'right', 'should', 'these', 'through', 'under', 'where', 'would'
  ]);
  return commonWords.has(word);
}
