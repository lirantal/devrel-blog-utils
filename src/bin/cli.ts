#!/usr/bin/env node

import { MarkdownFrontmatterExtractor } from '../utils/markdown-frontmatter-extractor.js'

async function main () {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: extract-frontmatter <file-path> [--fields field1,field2]')
    process.exit(1)
  }

  const filePath = args[0]
  if (!filePath) {
    console.error('Usage: extract-frontmatter <file-path> [--fields field1,field2]')
    process.exit(1)
  }

  const fieldsOption = args.find(arg => arg.startsWith('--fields='))

  const options: { fields?: string[] } = {}

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

main().catch(console.error)
