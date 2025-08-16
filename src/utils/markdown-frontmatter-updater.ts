import path from 'node:path'
import fs from 'node:fs/promises'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toMarkdown } from 'mdast-util-to-markdown'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

export interface FrontmatterUpdaterOptions {
  createIfMissing?: boolean
  preserveFormatting?: boolean
}

export class MarkdownFrontmatterUpdater {
  private filePath: string
  private options: FrontmatterUpdaterOptions

  constructor (filePath: string, options: FrontmatterUpdaterOptions = {}) {
    this.filePath = path.resolve(filePath)
    this.options = {
      createIfMissing: false,
      preserveFormatting: true,
      ...options
    }
  }

  /**
   * Update frontmatter in the markdown file
   */
  async updateFrontmatter (updates: Record<string, any>): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8')
      const updatedContent = this.updateFrontmatterInContent(content, updates)
      await fs.writeFile(this.filePath, updatedContent, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to update frontmatter in ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update specific fields in the frontmatter
   */
  async updateFields (fieldUpdates: Record<string, any>): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8')
      const existingFrontmatter = this.extractExistingFrontmatter(content)

      // Merge existing frontmatter with updates
      const updatedFrontmatter = {
        ...existingFrontmatter,
        ...fieldUpdates
      }

      const updatedContent = this.updateFrontmatterInContent(content, updatedFrontmatter)
      await fs.writeFile(this.filePath, updatedContent, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to update fields in ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove specific fields from the frontmatter
   */
  async removeFields (fieldsToRemove: string[]): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8')
      const existingFrontmatter = this.extractExistingFrontmatter(content)

      if (!existingFrontmatter) {
        return // Nothing to remove
      }

      // Remove specified fields
      const updatedFrontmatter = { ...existingFrontmatter }
      for (const field of fieldsToRemove) {
        delete updatedFrontmatter[field]
      }

      const updatedContent = this.updateFrontmatterInContent(content, updatedFrontmatter)
      await fs.writeFile(this.filePath, updatedContent, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to remove fields from ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get the current frontmatter without modifying the file
   */
  async getCurrentFrontmatter (): Promise<Record<string, any> | null> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8')
      return this.extractExistingFrontmatter(content)
    } catch (error) {
      throw new Error(`Failed to read frontmatter from ${this.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update frontmatter in content string
   */
  private updateFrontmatterInContent (content: string, newFrontmatter: Record<string, any>): string {
    try {
      const ast = fromMarkdown(content, {
        extensions: [frontmatter(['yaml'])],
        mdastExtensions: [frontmatterFromMarkdown(['yaml'])]
      })

      let hasFrontmatter = false
      let frontmatterIndex = -1

      // Find existing frontmatter
      for (let i = 0; i < ast.children.length; i++) {
        const child = ast.children[i]
        if (child && child.type === 'yaml') {
          hasFrontmatter = true
          frontmatterIndex = i
          break
        }
      }

      if (hasFrontmatter) {
        // Update existing frontmatter
        const yamlNode = ast.children[frontmatterIndex] as any
        yamlNode.value = stringifyYaml(newFrontmatter, {
          lineWidth: -1,
          defaultStringType: 'PLAIN'
        }).trim()
      } else if (this.options.createIfMissing) {
        // Create new frontmatter at the beginning
        const yamlContent = stringifyYaml(newFrontmatter, {
          lineWidth: -1,
          defaultStringType: 'PLAIN'
        }).trim()
        const yamlNode = {
          type: 'yaml' as const,
          value: yamlContent
        }
        ast.children.unshift(yamlNode as any)
      } else {
        throw new Error('No frontmatter found and createIfMissing is false')
      }

      // Convert back to markdown
      return toMarkdown(ast, {
        extensions: [frontmatterToMarkdown(['yaml'])]
      })
    } catch (error) {
      throw new Error(`Failed to update frontmatter in content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract existing frontmatter from content
   */
  private extractExistingFrontmatter (content: string): Record<string, any> | null {
    try {
      const ast = fromMarkdown(content, {
        extensions: [frontmatter(['yaml'])],
        mdastExtensions: [frontmatterFromMarkdown(['yaml'])]
      })

      for (const node of ast.children) {
        if (node.type === 'yaml') {
          return parseYaml((node as any).value) || {}
        }
      }

      return null
    } catch (error) {
      throw new Error(`Failed to extract existing frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get the resolved file path
   */
  getFilePath (): string {
    return this.filePath
  }
}
