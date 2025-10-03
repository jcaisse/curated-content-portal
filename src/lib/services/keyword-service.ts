import { env } from "@/lib/env"
import { OpenAI } from "openai"
import natural from "natural"

const tokenizer = new natural.WordTokenizer()

let openai: OpenAI | null = null
if (env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
}

type ExtractKeywordsInput = {
  text: string
  existingKeywords: string[]
  max?: number
}

type KeywordCandidate = {
  term: string
  score: number
  source: "ai" | "existing"
}

function tokenize(text: string) {
  return tokenizer.tokenize(text.toLowerCase()).filter((token) => token.length > 2)
}

function scoreTokenFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1)
  }
  return freq
}

function scoreExistingKeywords(textTokens: string[], existing: string[]): KeywordCandidate[] {
  const freq = scoreTokenFrequency(textTokens)
  return existing
    .map((term) => {
      const tokens = tokenize(term)
      if (tokens.length === 0) return null
      const score = tokens.reduce((acc, token) => acc + (freq.get(token) ?? 0), 0)
      return score > 0 ? { term, score, source: "existing" as const } : null
    })
    .filter((candidate): candidate is KeywordCandidate => candidate !== null)
}

async function enrichWithOpenAI(text: string, max: number): Promise<KeywordCandidate[]> {
  if (!openai) return []
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `Extract up to ${max} domain-specific keywords from the following content. Return a JSON array of objects with { term, score } where score is 0-1.

${text.slice(0, 4000)}`,
      response_format: { type: "json_object" },
    })
    const message = response.output[0]
    if (message?.type !== "message") return []
    const parsed = JSON.parse(message.content[0].text ?? "{}")
    const items = Array.isArray(parsed) ? parsed : parsed.keywords
    if (!Array.isArray(items)) return []
    return items
      .map((item: any) => ({
        term: String(item.term ?? item.name ?? "").trim(),
        score: typeof item.score === "number" ? item.score : 0.5,
        source: "ai" as const,
      }))
      .filter((candidate) => candidate.term.length > 2)
  } catch (error) {
    console.warn("OpenAI keyword extraction fallback", error)
    return []
  }
}

export async function extractKeywords({ text, existingKeywords, max = 20 }: ExtractKeywordsInput): Promise<string[]> {
  const tokens = tokenize(text)
  const existing = scoreExistingKeywords(tokens, existingKeywords)
  const enriched = await enrichWithOpenAI(text, max)

  const combined = new Map<string, KeywordCandidate>()
  for (const candidate of [...existing, ...enriched]) {
    const existingCandidate = combined.get(candidate.term)
    if (!existingCandidate || candidate.score > existingCandidate.score) {
      combined.set(candidate.term, candidate)
    }
  }

  return Array.from(combined.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((candidate) => candidate.term)
}

