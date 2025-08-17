#!/usr/bin/env node

import { MarkdownFrontmatterExtractor } from '../utils/markdown-frontmatter-extractor.js'
import { MarkdownFrontmatterUpdater } from '../utils/markdown-frontmatter-updater.js'
import { GenerativeTags } from '../utils/generative-tags.js'

async function main () {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error(`Usage: 
              Extract frontmatter: extract-frontmatter <file-path> [--fields field1,field2]
              Update frontmatter: extract-frontmatter <file-path> --update '{"title":"New Title","author":"New Author"}'
              Update fields: extract-frontmatter <file-path> --set title="New Title" author="New Author"
              Remove fields: extract-frontmatter <file-path> --remove field1,field2
              Create if missing: extract-frontmatter <file-path> --create --update '{"title":"New Title"}'
              Generate tags: extract-frontmatter <file-path> --generate-tags [--create]`)
    process.exit(1)
  }

  const filePath = args[0]
  if (!filePath) {
    console.error('Usage: extract-frontmatter <file-path> [--fields field1,field2]')
    process.exit(1)
  }

  const fieldsOption = args.find(arg => arg.startsWith('--fields='))
  const updateOption = args.find(arg => arg.startsWith('--update='))
  const setOption = args.find(arg => arg === '--set')
  const removeOption = args.find(arg => arg.startsWith('--remove='))
  const createOption = args.find(arg => arg === '--create')
  const generateTagsOption = args.find(arg => arg === '--generate-tags')

  try {
    if (generateTagsOption) {
      // Generate tags operation
      const generativeTags = new GenerativeTags(filePath, {
        createIfMissing: !!createOption
      })

      await generativeTags.run()
      console.log('Tags generated successfully')
    } else if (updateOption || setOption || removeOption) {
      // Update operations
      const updater = new MarkdownFrontmatterUpdater(filePath, {
        createIfMissing: !!createOption
      })

      if (updateOption) {
        const updates = updateOption.split('=')[1]
        if (updates) {
          const updateData = JSON.parse(updates)
          await updater.updateFields(updateData)
          console.log('Frontmatter updated successfully')
        }
      } else if (setOption) {
        // Parse --set key1="value1" key2="value2" format
        const setArgs = args.slice(args.indexOf('--set') + 1)
        const fieldUpdates: Record<string, any> = {}

        for (const arg of setArgs) {
          if (arg.includes('=')) {
            const parts = arg.split('=', 2)
            if (parts.length === 2) {
              const key = parts[0]
              const value = parts[1]
              if (key && value) {
                fieldUpdates[key] = value.replace(/^["']|["']$/g, '') // Remove quotes
              }
            }
          }
        }

        if (Object.keys(fieldUpdates).length > 0) {
          await updater.updateFields(fieldUpdates)
          console.log('Fields updated successfully')
        }
      } else if (removeOption) {
        const fieldsToRemove = removeOption.split('=')[1]
        if (fieldsToRemove) {
          const fields = fieldsToRemove.split(',').map(f => f.trim())
          await updater.removeFields(fields)
          console.log('Fields removed successfully')
        }
      }
    } else {
      // Extract operation
      const options: { fields?: string[] } = {}

      if (fieldsOption) {
        const fields = fieldsOption.split('=')[1]
        if (fields) {
          options.fields = fields.split(',').map(f => f.trim())
        }
      }

      const extractor = new MarkdownFrontmatterExtractor(filePath, options)
      const result = await extractor.extract()

      if (result) {
        console.log(JSON.stringify(result, null, 2))
      } else {
        console.log('No frontmatter found')
      }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main().catch(console.error)
