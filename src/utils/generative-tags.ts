import path from 'node:path'
import fs from 'node:fs/promises'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateObject } from 'ai'
import { MarkdownFrontmatterExtractor } from './markdown-frontmatter-extractor.js'
import { MarkdownFrontmatterUpdater } from './markdown-frontmatter-updater.js'
import { z } from 'zod'

export interface GenerativeTagsOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  createIfMissing?: boolean
}

export class GenerativeTags {
  private filePath: string
  private options: GenerativeTagsOptions
  private model: any

  constructor (filePath: string, options: GenerativeTagsOptions = {}) {
    this.filePath = path.resolve(filePath)
    this.options = {
      model: process.env.MODEL_NAME || 'gpt-4-turbo-preview',
      maxTokens: parseInt(process.env.MAX_TOKENS || '150'),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      createIfMissing: false,
      ...options
    }

    // Initialize OpenAI-compatible model
    const baseUrl = process.env.BASE_URL || 'https://api.openai.com/v1'
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    this.model = createOpenAICompatible({
      baseURL: baseUrl,
      name: 'gemma3',
      apiKey,
    }).chatModel(this.options.model!)
  }

  /**
   * Run the tag generation process
   */
  async run (): Promise<void> {
    try {
      // Check if file path is a glob pattern or single file
      if (this.isGlobPattern(this.filePath)) {
        await this.processGlobPattern()
      } else {
        await this.processSingleFile(this.filePath)
      }
    } catch (error) {
      throw new Error(`Failed to generate tags: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process a single file
   */
  private async processSingleFile (filePath: string): Promise<void> {
    try {
      // Extract existing frontmatter
      const extractor = new MarkdownFrontmatterExtractor(filePath)
      const existingFrontmatter = await extractor.extract()

      // Generate tags using AI
      const tags = await this.generateTags(existingFrontmatter)

      // Update the file with new tags
      const updater = new MarkdownFrontmatterUpdater(filePath, {
        createIfMissing: this.options.createIfMissing
      })

      if (existingFrontmatter) {
        // Update existing frontmatter with new tags
        await updater.updateFields({ tags })
      } else if (this.options.createIfMissing) {
        // Create new frontmatter with tags
        await updater.updateFrontmatter({ tags })
      } else {
        throw new Error('No frontmatter found and createIfMissing is false')
      }

      console.log(`✅ Generated tags for ${filePath}: ${tags.join(', ')}`)
    } catch (error) {
      console.error(`❌ Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  /**
   * Process glob pattern to find matching files
   */
  private async processGlobPattern (): Promise<void> {
    try {
      // Use Node.js built-in glob matching
      const files = await this.findMatchingFiles()

      if (files.length === 0) {
        console.log('No files found matching the pattern')
        return
      }

      console.log(`Found ${files.length} file(s) to process`)

      // Process each file sequentially
      for (const file of files) {
        try {
          await this.processSingleFile(file)
        } catch (error) {
          console.error(`Failed to process ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          // Continue with other files
        }
      }
    } catch (error) {
      throw new Error(`Failed to process glob pattern: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find files matching the glob pattern
   */
  private async findMatchingFiles (): Promise<string[]> {
    const dir = path.dirname(this.filePath)
    const pattern = path.basename(this.filePath)

    try {
      const files = await fs.readdir(dir)
      const matchingFiles: string[] = []

      for (const file of files) {
        const fullPath = path.join(dir, file)
        const stat = await fs.stat(fullPath)

        if (stat.isFile() && this.matchesGlob(file, pattern)) {
          matchingFiles.push(fullPath)
        }
      }

      return matchingFiles
    } catch (error) {
      throw new Error(`Failed to read directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Simple glob pattern matching (supports basic patterns)
   */
  private matchesGlob (filename: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\*/g, '.*')   // Convert * to .*
      .replace(/\?/g, '.')    // Convert ? to .

    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(filename)
  }

  /**
   * Check if the file path is a glob pattern
   */
  private isGlobPattern (filePath: string): boolean {
    return filePath.includes('*') || filePath.includes('?')
  }

  /**
   * Generate tags using AI
   */
  private async generateTags (frontmatter: Record<string, any> | null): Promise<string[]> {
    try {
      const systemPrompt = `You are a helpful marketing expert that generates relevant tags for blog posts. 

You will be provided a frontmatter JSON object for a blog post.
You need to analyze the provided frontmatter and suggest several tags that would be most relevant for SEO and content discovery.

RULES:
- THIS IS IMPORTANT: ALWAYS RETURN ONLY JSON ARRAY OF TAGS, no other format is acceptable
- Use 1-3 tags that are specific and relevant to the blog post
- DO NOT USE generic words like "blog", "post", "article"
- Think of tags related to the frontmatter title, description and slug to extract the most relevant tags

EXAMPLE RESPONSE:
{
  "tags": ["tag1", "tag2", "tag3"]
}
`
      const userPrompt = frontmatter
        ? JSON.stringify(frontmatter, null, 2)
        : 'No frontmatter available'

      const result = await generateObject({
        model: this.model,
        system: systemPrompt,
        prompt: userPrompt,
        schema: z.object({
          tags: z.array(z.string())
        })
      })

      const { tags } = result.object

      if (tags.length === 0) {
        throw new Error('No tags generated from AI response')
      }

      // Let's pick only 3 tags from the array, in case more are returned
      const selectedTags = tags.slice(0, 3)
      return selectedTags
    } catch (error) {
      throw new Error(`Failed to generate tags with AI: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get the resolved file path
   */
  getFilePath (): string {
    return this.filePath
  }

  /**
   * Get current options
   */
  getOptions (): GenerativeTagsOptions {
    return { ...this.options }
  }
}
