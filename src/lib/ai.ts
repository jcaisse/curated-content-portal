import OpenAI from 'openai'
import { config } from './config'

const openai = config.ai.apiKey ? new OpenAI({
  apiKey: config.ai.apiKey,
}) : null

/**
 * Generate embedding for text using OpenAI
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!openai) {
    console.warn('OpenAI API key not configured, returning null embedding')
    return null
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    return response.data[0]?.embedding || null
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}

/**
 * Find similar posts using vector similarity
 * Note: This would use pgvector for similarity search
 */
export async function findSimilarPosts(
  embedding: number[],
  threshold: number = 0.88,
  limit: number = 10
) {
  // This would use a raw SQL query with pgvector
  // For now, we'll return empty array
  return []
}

/**
 * Generate AI summary for content
 */
export async function generateSummary(content: string, maxLength: number = 200): Promise<string> {
  if (!openai) {
    console.warn('OpenAI API key not configured, returning placeholder summary')
    return 'Summary generation requires OpenAI API key configuration.'
  }

  try {
    const response = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        {
          role: 'system',
          content: `You are a content curator. Generate a concise, engaging summary of the provided content. Keep it under ${maxLength} characters and focus on the key insights.`
        },
        {
          role: 'user',
          content: content.substring(0, 4000) // Limit input length
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })
    
    return response.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('Error generating summary:', error)
    return 'Summary generation failed due to API error.'
  }
}

/**
 * Generate tags for content
 */
export async function generateTags(title: string, content: string): Promise<string[]> {
  if (!openai) {
    console.warn('OpenAI API key not configured, returning placeholder tags')
    return ['content', 'article']
  }

  try {
    const response = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [
        {
          role: 'system',
          content: 'You are a content tagging expert. Generate 3-5 relevant tags for the provided content. Return only the tags, separated by commas, no other text.'
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nContent: ${content.substring(0, 2000)}`
        }
      ],
      max_tokens: 100,
      temperature: 0.5
    })
    
    const tagsText = response.choices[0]?.message?.content?.trim() || ''
    return tagsText.split(',').map(tag => tag.trim()).filter(Boolean)
  } catch (error) {
    console.error('Error generating tags:', error)
    return ['content', 'article']
  }
}

/**
 * Curate content with AI analysis
 */
export async function curateContent(post: {
  title: string
  description?: string
  content?: string
  url: string
}) {
  try {
    const fullContent = `${post.title}\n\n${post.description || ''}\n\n${post.content || ''}`
    
    // Generate enhanced description if missing
    let enhancedDescription = post.description
    if (!enhancedDescription || enhancedDescription.length < 50) {
      enhancedDescription = await generateSummary(fullContent, 300)
    }
    
    // Generate tags
    const tags = await generateTags(post.title, fullContent)
    
    // Generate embedding (only if API key is available)
    const embedding = await getEmbedding(fullContent)
    
    return {
      description: enhancedDescription,
      tags,
      embedding
    }
  } catch (error) {
    console.error('Error curating content:', error)
    return {
      description: post.description || '',
      tags: [],
      embedding: null
    }
  }
}

/**
 * Check for duplicate content using similarity
 */
export async function checkForDuplicates(
  embedding: number[],
  threshold: number = 0.88
): Promise<boolean> {
  // This would query the database for similar embeddings
  // For now, return false (no duplicates)
  return false
}
