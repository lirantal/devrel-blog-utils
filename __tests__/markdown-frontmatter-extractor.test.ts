import { test, describe } from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MarkdownFrontmatterExtractor } from '../src/utils/markdown-frontmatter-extractor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixturesDir = path.join(__dirname, '__fixtures__')

describe('MarkdownFrontmatterExtractor', () => {
  describe('Unit Tests', () => {
    test('should create instance with resolved file path', () => {
      const extractor = new MarkdownFrontmatterExtractor('./test.md')
      assert.match(extractor.getFilePath(), /test\.md$/)
    })

    test('should accept options object', () => {
      const extractor = new MarkdownFrontmatterExtractor('./test.md', { fields: ['title'] })
      assert.ok(extractor instanceof MarkdownFrontmatterExtractor)
    })
  })

  describe('Integration Tests', () => {
    test('should extract all frontmatter fields', async () => {
      const filePath = path.join(fixturesDir, 'sample-blog-post.md')
      const extractor = new MarkdownFrontmatterExtractor(filePath)
      
      const result = await extractor.extract()
      
      assert.deepStrictEqual(result, {
        title: "Getting Started with TypeScript",
        author: "John Doe",
        date: "2024-01-15",
        tags: ["typescript", "programming", "tutorial"],
        draft: false
      })
    })

    test('should filter specific fields', async () => {
      const filePath = path.join(fixturesDir, 'sample-blog-post.md')
      const extractor = new MarkdownFrontmatterExtractor(filePath, { 
        fields: ['title', 'author'] 
      })
      
      const result = await extractor.extract()
      
      assert.deepStrictEqual(result, {
        title: "Getting Started with TypeScript",
        author: "John Doe"
      })
    })

    test('should handle files without frontmatter', async () => {
      const filePath = path.join(fixturesDir, 'no-frontmatter.md')
      const extractor = new MarkdownFrontmatterExtractor(filePath)
      
      const result = await extractor.extract()
      
      assert.strictEqual(result, null)
    })
  })

  describe('End-to-End Tests', () => {
    test('should work with real file system operations', async () => {
      const filePath = path.join(fixturesDir, 'minimal-frontmatter.md')
      const extractor = new MarkdownFrontmatterExtractor(filePath)
      
      const result = await extractor.extract()
      
      assert.deepStrictEqual(result, {
        title: "Minimal Post"
      })
    })

    test('should handle invalid file paths', async () => {
      const extractor = new MarkdownFrontmatterExtractor('./nonexistent-file.md')
      
      await assert.rejects(
        extractor.extract(),
        /Failed to extract frontmatter/
      )
    })

    test('should run CLI and extract all frontmatter fields', async () => {
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          'extract-frontmatter',
          path.join(fixturesDir, 'sample-blog-post.md')
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        cliProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        cliProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        cliProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`CLI process exited with code ${code}. Stderr: ${stderr}`))
            return
          }

          try {
            const result = JSON.parse(stdout)
            assert.deepStrictEqual(result, {
              title: "Getting Started with TypeScript",
              author: "John Doe",
              date: "2024-01-15",
              tags: ["typescript", "programming", "tutorial"],
              draft: false
            })
            resolve()
          } catch (error) {
            reject(new Error(`Failed to parse CLI output: ${error}. Stdout: ${stdout}`))
          }
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })

    test('should run CLI with field filtering', async () => {
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          'extract-frontmatter',
          path.join(fixturesDir, 'sample-blog-post.md'),
          '--fields=title,author'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        cliProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        cliProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        cliProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`CLI process exited with code ${code}. Stderr: ${stderr}`))
            return
          }

          try {
            const result = JSON.parse(stdout)
            assert.deepStrictEqual(result, {
              title: "Getting Started with TypeScript",
              author: "John Doe"
            })
            resolve()
          } catch (error) {
            reject(new Error(`Failed to parse CLI output: ${error}. Stdout: ${stdout}`))
          }
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })

    test('should run CLI and handle files without frontmatter', async () => {
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          'extract-frontmatter',
          path.join(fixturesDir, 'no-frontmatter.md')
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        cliProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        cliProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        cliProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`CLI process exited with code ${code}. Stderr: ${stderr}`))
            return
          }

          assert.strictEqual(stdout.trim(), 'No frontmatter found')
          resolve()
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })

    test('should run CLI and show usage for no arguments', async () => {
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        cliProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        cliProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        cliProcess.on('close', (code) => {
          // CLI should exit with error code 1 when no arguments provided
          if (code !== 1) {
            reject(new Error(`CLI process exited with code ${code}, but expected 1`))
            return
          }

          assert.strictEqual(stderr.trim(), 'Usage: devrel-blog-utils <command> [options]\n\nCommands:\n  extract-frontmatter <file-path> [--fields field1,field2]\n    Extract frontmatter from a markdown file\n  \n  update-frontmatter <file-path> [--update \'{"field":"value"}\' | --set field="value" | --remove field1,field2 | --create]\n    Update frontmatter in a markdown file\n  \n  generate-tags <file-path> [--create]\n    Generate AI-powered tags for a markdown file\n\nExamples:\n  devrel-blog-utils extract-frontmatter ./blog-post.md\n  devrel-blog-utils extract-frontmatter ./blog-post.md --fields=title,author\n  devrel-blog-utils update-frontmatter ./blog-post.md --update=\'{"title":"New Title"}\'\n  devrel-blog-utils update-frontmatter ./blog-post.md --set title="New Title" author="New Author"\n  devrel-blog-utils update-frontmatter ./blog-post.md --remove tags,draft\n  devrel-blog-utils update-frontmatter ./blog-post.md --create --update=\'{"title":"New Post"}\'\n  devrel-blog-utils generate-tags ./blog-post.md\n  devrel-blog-utils generate-tags ./blog-post.md --create')
          resolve()
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })
  })
})