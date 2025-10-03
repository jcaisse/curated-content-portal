import natural from "natural"

const tokenizer = new natural.WordTokenizer()

export interface ScoringInput {
  title: string
  summary: string
  content: string
  keywords: string[]
}

export async function scoreContentAgainstKeywords({ title, summary, content, keywords }: ScoringInput): Promise<number> {
  const fullText = `${title}\n${summary}\n${content}`.toLowerCase()
  if (!fullText.trim() || keywords.length === 0) return 0

  const tokens = tokenizer.tokenize(fullText)
  if (tokens.length === 0) return 0

  const termFrequency = new Map<string, number>()
  for (const token of tokens) {
    termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1)
  }

  let totalScore = 0
  for (const keyword of keywords) {
    const keywordTokens = tokenizer.tokenize(keyword.toLowerCase())
    if (keywordTokens.length === 0) continue

    const occurrences = keywordTokens.reduce((acc, token) => acc + (termFrequency.get(token) ?? 0), 0)
    if (occurrences === 0) continue

    const keywordDensity = occurrences / tokens.length
    const lengthWeight = Math.min(1, keywordTokens.length / 3)
    totalScore += keywordDensity * (1 + lengthWeight)
  }

  return Math.min(1, totalScore * 6)
}

