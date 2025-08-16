import path from 'node:path'
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import { parse as parseYaml } from 'yaml'

export interface FrontmatterExtractorOptions {
  fields?: string[]
}

export class MarkdownFrontmatterExtractor {
  private filePath: string
  private options: FrontmatterExtractorOptions

  constructor (filePath: string, options: FrontmatterExtractorOptions = {}) {
    this.filePath = path.resolve(filePath)
    this.options = options
  }

  /**
   * Extract frontmatter data from the markdown file
   */
  async extract (): Promise<Record<string, any> | null> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8')
      const frontmatterData = this.parseFrontmatter(content)

      if (!frontmatterData) {
        return null
      }

      // Filter fields if specified
      if (this.options.fields && this.options.fields.length > 0) {
        return this.filterFields(frontmatterData, this.options.fields)
      }

      return frontmatterData
    } catch (error) {
      throw new Error(`Failed to extract frontmatter from ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Parse frontmatter from markdown content
   */
  private parseFrontmatter (content: string): Record<string, any> | null {
    try {
      const ast = fromMarkdown(content, {
        extensions: [frontmatter(['yaml'])],
        mdastExtensions: [frontmatterFromMarkdown(['yaml'])]
      })

      for (const node of ast.children) {
        if (node.type === 'yaml') {
          return parseYaml(node.value) || {}
        }
      }

      return null
    } catch (error) {
      throw new Error(`Failed to parse frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Filter frontmatter data to only include specified fields
   */
  private filterFields (data: Record<string, any>, fields: string[]): Record<string, any> {
    const filtered: Record<string, any> = {}

    for (const field of fields) {
      if (field in data) {
        filtered[field] = data[field]
      }
    }

    return filtered
  }

  /**
   * Get the resolved file path
   */
  getFilePath (): string {
    return this.filePath
  }
}
