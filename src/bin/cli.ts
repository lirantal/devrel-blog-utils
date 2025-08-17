#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { MarkdownFrontmatterExtractor } from '../utils/markdown-frontmatter-extractor.js'
import { MarkdownFrontmatterUpdater } from '../utils/markdown-frontmatter-updater.js'
import { GenerativeTags } from '../utils/generative-tags.js'

function showUsage() {
  console.error(`Usage: devrel-blog-utils <command> [options]

Commands:
  extract-frontmatter <file-path> [--fields field1,field2]
    Extract frontmatter from a markdown file
  
  update-frontmatter <file-path> [--update '{"field":"value"}' | --set field="value" | --remove field1,field2 | --create]
    Update frontmatter in a markdown file
  
  generate-tags <file-path> [--create]
    Generate AI-powered tags for a markdown file

Examples:
  devrel-blog-utils extract-frontmatter ./blog-post.md
  devrel-blog-utils extract-frontmatter ./blog-post.md --fields=title,author
  devrel-blog-utils update-frontmatter ./blog-post.md --update='{"title":"New Title"}'
  devrel-blog-utils update-frontmatter ./blog-post.md --set title="New Title" author="New Author"
  devrel-blog-utils update-frontmatter ./blog-post.md --remove tags,draft
  devrel-blog-utils update-frontmatter ./blog-post.md --create --update='{"title":"New Post"}'
  devrel-blog-utils generate-tags ./blog-post.md
  devrel-blog-utils generate-tags ./blog-post.md --create`)
  process.exit(1)
}

async function handleExtractFrontmatter(args: string[]) {
  if (args.length === 0) {
    console.error('Error: File path is required for extract-frontmatter command')
    process.exit(1)
  }

  const filePath = args[0]
  if (!filePath) {
    console.error('Error: File path is required for extract-frontmatter command')
    process.exit(1)
  }
  
  const options: { fields?: string[] } = {}

  // Parse --fields option
  const fieldsOption = args.find(arg => arg.startsWith('--fields='))
  if (fieldsOption) {
    const fields = fieldsOption.split('=')[1]
    if (fields) {
      options.fields = fields.split(',').map(f => f.trim())
    }
  }

  try {
    const extractor = new MarkdownFrontmatterExtractor(filePath, options)
    const result = await extractor.extract()

    if (result) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log('No frontmatter found')
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

async function handleUpdateFrontmatter(args: string[]) {
  if (args.length === 0) {
    console.error('Error: File path is required for update-frontmatter command')
    process.exit(1)
  }

  const filePath = args[0]
  if (!filePath) {
    console.error('Error: File path is required for update-frontmatter command')
    process.exit(1)
  }
  
  const parsedArgs = parseArgs({
    args: args.slice(1),
    options: {
      update: { type: 'string' },
      set: { type: 'string', multiple: true },
      remove: { type: 'string' },
      create: { type: 'boolean' }
    },
    allowPositionals: true
  })

  try {
    const updater = new MarkdownFrontmatterUpdater(filePath, {
      createIfMissing: !!parsedArgs.values.create
    })

    if (parsedArgs.values.update && typeof parsedArgs.values.update === 'string') {
      const updateData = JSON.parse(parsedArgs.values.update)
      await updater.updateFields(updateData)
      console.log('Frontmatter updated successfully')
    } else if (parsedArgs.values.set && parsedArgs.values.set.length > 0) {
      // Parse --set key1="value1" key2="value2" format
      const fieldUpdates: Record<string, any> = {}
      
      for (const setArg of parsedArgs.values.set) {
        if (setArg.includes('=')) {
          const parts = setArg.split('=', 2)
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
    } else if (parsedArgs.values.remove && typeof parsedArgs.values.remove === 'string') {
      const fields = parsedArgs.values.remove.split(',').map(f => f.trim())
      await updater.removeFields(fields)
      console.log('Fields removed successfully')
    } else {
      console.error('Error: One of --update, --set, or --remove is required for update-frontmatter command')
      process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

async function handleGenerateTags(args: string[]) {
  if (args.length === 0) {
    console.error('Error: File path is required for generate-tags command')
    process.exit(1)
  }

  const filePath = args[0]
  if (!filePath) {
    console.error('Error: File path is required for generate-tags command')
    process.exit(1)
  }
  
  const parsedArgs = parseArgs({
    args: args.slice(1),
    options: {
      create: { type: 'boolean' }
    },
    allowPositionals: true
  })

  try {
    const generativeTags = new GenerativeTags(filePath, {
      createIfMissing: !!parsedArgs.values.create
    })

    await generativeTags.run()
    console.log('Tags generated successfully')
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showUsage()
  }

  const command = args[0]
  const commandArgs = args.slice(1)

  switch (command) {
    case 'extract-frontmatter':
      await handleExtractFrontmatter(commandArgs)
      break
    case 'update-frontmatter':
      await handleUpdateFrontmatter(commandArgs)
      break
    case 'generate-tags':
      await handleGenerateTags(commandArgs)
      break
    case 'help':
    case '--help':
    case '-h':
      showUsage()
      break
    default:
      console.error(`Error: Unknown command '${command}'`)
      showUsage()
  }
}

main().catch(console.error)
