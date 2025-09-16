/**
 * AI Adapter for Test Mode
 * Provides deterministic responses and tracks call counts for E2E testing
 */

// Module-level call counter for E2E tests
let aiCallCount = 0;

export interface MockKeyword {
  name: string;
  relevance: number;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  priority: string;
}

export interface AIExtractionResult {
  keywords: MockKeyword[];
  extractedAt: string;
  textLength: number;
  aiModel?: string;
  fallback?: boolean;
}

// Reset call count (test-only)
export function resetCallCount(): void {
  aiCallCount = 0;
}

// Get call count (test-only)
export function getCallCount(): number {
  return aiCallCount;
}

// Deterministic mock keywords based on text content
function generateMockKeywords(text: string, maxKeywords: number): MockKeyword[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'].includes(word));

  const uniqueWords = [...new Set(words)];
  const keywords: MockKeyword[] = [];

  const categories = ['technology', 'business', 'science', 'health', 'education', 'manual'];
  const priorities = ['high', 'medium', 'low'];
  const confidences: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

  for (let i = 0; i < Math.min(maxKeywords, uniqueWords.length); i++) {
    const word = uniqueWords[i];
    const relevance = Math.max(0.9 - (i * 0.05), 0.3);
    const category = categories[i % categories.length];
    const priority = priorities[i % priorities.length];
    const confidence = confidences[i % confidences.length];

    keywords.push({
      name: word,
      relevance,
      category,
      confidence,
      priority
    });
  }

  return keywords.sort((a, b) => b.relevance - a.relevance);
}

export async function mockAIExtraction(
  text: string,
  maxKeywords: number,
  mode: string = 'success'
): Promise<AIExtractionResult> {
  // Increment call count for every invocation
  aiCallCount++;

  const result: AIExtractionResult = {
    keywords: [],
    extractedAt: new Date().toISOString(),
    textLength: text.length,
    aiModel: 'test-mock-model',
    fallback: false
  };

  switch (mode) {
    case 'success':
      result.keywords = generateMockKeywords(text, maxKeywords);
      break;
    
    case 'fail':
      throw new Error('Mock AI extraction failed');
    
    case 'timeout':
      // Simulate timeout by waiting longer than typical request timeout
      await new Promise(resolve => setTimeout(resolve, 10000));
      throw new Error('Request timeout');
    
    default:
      result.keywords = generateMockKeywords(text, maxKeywords);
  }

  return result;
}
