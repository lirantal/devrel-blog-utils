#!/usr/bin/env node

// Simple test script for GenerativeTags utility
import { GenerativeTags } from './src/utils/generative-tags.js'

async function testGenerativeTags () {
  try {
    console.log('Testing GenerativeTags utility...')

    // Test instantiation (without actually calling AI API)
    const generativeTags = new GenerativeTags('__tests__/__fixtures__/blog-post-for-tags.md', {
      createIfMissing: true
    })

    console.log('✅ GenerativeTags instantiated successfully')
    console.log('File path:', generativeTags.getFilePath())
    console.log('Options:', generativeTags.getOptions())

    await generativeTags.run()

    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testGenerativeTags()
