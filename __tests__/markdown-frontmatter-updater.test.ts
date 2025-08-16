import { test, describe } from 'node:test'
import assert from 'node:assert'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { MarkdownFrontmatterUpdater } from '../src/utils/markdown-frontmatter-updater.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fixturesDir = path.join(__dirname, '__fixtures__')

describe('MarkdownFrontmatterUpdater', () => {
  async function createTestFile(): Promise<{ testFilePath: string; originalContent: string }> {
    const testFilePath = path.join(fixturesDir, 'test-update-post.md')
    const sourcePath = path.join(fixturesDir, 'updatable-post.md')
    const originalContent = await fs.readFile(sourcePath, 'utf-8')
    await fs.writeFile(testFilePath, originalContent, 'utf-8')
    return { testFilePath, originalContent }
  }

  async function cleanupTestFile(testFilePath: string): Promise<void> {
    try {
      await fs.unlink(testFilePath)
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  describe('Unit Tests', () => {
    test('should create instance with resolved file path', () => {
      const updater = new MarkdownFrontmatterUpdater('./test.md')
      assert.match(updater.getFilePath(), /test\.md$/)
    })

    test('should accept options object', () => {
      const updater = new MarkdownFrontmatterUpdater('./test.md', { createIfMissing: true })
      assert.ok(updater instanceof MarkdownFrontmatterUpdater)
    })

    test('should use default options when none provided', () => {
      const updater = new MarkdownFrontmatterUpdater('./test.md')
      assert.strictEqual(updater.getFilePath(), path.resolve('./test.md'))
    })
  })

  describe('Integration Tests', () => {
    test('should update entire frontmatter', async () => {
      const { testFilePath, originalContent } = await createTestFile()
      try {
        const updater = new MarkdownFrontmatterUpdater(testFilePath)
        const newFrontmatter = {
          title: 'Updated Title',
          author: 'Updated Author',
          date: '2024-01-16'
        }

        await updater.updateFrontmatter(newFrontmatter)

        const updatedContent = await fs.readFile(testFilePath, 'utf-8')
        assert.match(updatedContent, /title: Updated Title/)
        assert.match(updatedContent, /author: Updated Author/)
        assert.match(updatedContent, /date: 2024-01-16/)
      } finally {
        await cleanupTestFile(testFilePath)
      }
    })

    test('should update specific fields while preserving others', async () => {
      const fixturePath = path.join(fixturesDir, 'integration-test-update.md')
      const updater = new MarkdownFrontmatterUpdater(fixturePath)
      const fieldUpdates = {
        title: 'Partially Updated Title',
        draft: false
      }

      await updater.updateFields(fieldUpdates)

      const updatedContent = await fs.readFile(fixturePath, 'utf-8')
      assert.match(updatedContent, /title: Partially Updated Title/)
      assert.match(updatedContent, /draft: false/)
      assert.match(updatedContent, /author: Original Author/) // Preserved
      assert.match(updatedContent, /date: 2024-01-15/) // Preserved
    })

    test('should remove specified fields', async () => {
      const fixturePath = path.join(fixturesDir, 'integration-test-remove.md')
      const updater = new MarkdownFrontmatterUpdater(fixturePath)
      const fieldsToRemove = ['tags', 'draft']

      await updater.removeFields(fieldsToRemove)

      const updatedContent = await fs.readFile(fixturePath, 'utf-8')
      assert.match(updatedContent, /title: Original Title/) // Preserved
      assert.match(updatedContent, /author: Original Author/) // Preserved
      assert.doesNotMatch(updatedContent, /tags:/) // Removed
      assert.doesNotMatch(updatedContent, /draft:/) // Removed
    })

    test('should create frontmatter if missing and createIfMissing is true', async () => {
      const { testFilePath } = await createTestFile()
      try {
        // Create a file without frontmatter
        const noFrontmatterContent = '# No Frontmatter Post\n\nThis post has no frontmatter.'
        await fs.writeFile(testFilePath, noFrontmatterContent, 'utf-8')

        const updater = new MarkdownFrontmatterUpdater(testFilePath, { createIfMissing: true })
        const newFrontmatter = {
          title: 'New Title',
          author: 'New Author'
        }

        await updater.updateFrontmatter(newFrontmatter)

        const updatedContent = await fs.readFile(testFilePath, 'utf-8')
        assert.match(updatedContent, /^---\n/)
        assert.match(updatedContent, /title: New Title/)
        assert.match(updatedContent, /author: New Author/)
        assert.match(updatedContent, /\n---\n/)
        assert.match(updatedContent, /# No Frontmatter Post/) // Content preserved
      } finally {
        await cleanupTestFile(testFilePath)
      }
    })

    test('should throw error when trying to update non-existent frontmatter without createIfMissing', async () => {
      const { testFilePath } = await createTestFile()
      try {
        // Create a file without frontmatter
        const noFrontmatterContent = '# No Frontmatter Post\n\nThis post has no frontmatter.'
        await fs.writeFile(testFilePath, noFrontmatterContent, 'utf-8')

        const updater = new MarkdownFrontmatterUpdater(testFilePath, { createIfMissing: false })

        await assert.rejects(
          updater.updateFrontmatter({ title: 'New Title' }),
          /No frontmatter found and createIfMissing is false/
        )
      } finally {
        await cleanupTestFile(testFilePath)
      }
    })

    test('should get current frontmatter without modifying file', async () => {
      const fixturePath = path.join(fixturesDir, 'integration-test-current.md')
      const updater = new MarkdownFrontmatterUpdater(fixturePath)
      const currentFrontmatter = await updater.getCurrentFrontmatter()

      assert.deepStrictEqual(currentFrontmatter, {
        title: "Original Title",
        author: "Original Author",
        date: "2024-01-15",
        tags: ["original", "test"],
        draft: true
      })

      // Verify file content hasn't changed
      const fileContent = await fs.readFile(fixturePath, 'utf-8')
      assert.match(fileContent, /title: "Original Title"/)
      assert.match(fileContent, /author: "Original Author"/)
      assert.match(fileContent, /date: "2024-01-15"/)
      assert.match(fileContent, /tags:/)
      assert.match(fileContent, /draft: true/)
    })

    test('should handle complex data types in frontmatter', async () => {
      const { testFilePath } = await createTestFile()
      try {
        const updater = new MarkdownFrontmatterUpdater(testFilePath)
        const complexUpdates = {
          numbers: [1, 2, 3, 4, 5],
          nested: {
            key: 'value',
            array: ['a', 'b', 'c']
          },
          boolean: false,
          nullValue: null
        }

        await updater.updateFields(complexUpdates)

        const updatedContent = await fs.readFile(testFilePath, 'utf-8')
        assert.match(updatedContent, /numbers:\n  - 1\n  - 2\n  - 3\n  - 4\n  - 5/)
        assert.match(updatedContent, /nested:\n  key: value\n  array:\n    - a\n    - b\n    - c/)
        assert.match(updatedContent, /boolean: false/)
        assert.match(updatedContent, /nullValue: null/)
      } finally {
        await cleanupTestFile(testFilePath)
      }
    })
  })

  describe('End-to-End Tests', () => {
    test('should run CLI and update frontmatter successfully', async () => {
      // Use the actual fixture file that exists on disk
      const fixturePath = path.join(fixturesDir, 'updatable-post.md')
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          fixturePath,
          '--update={"title":"CLI Updated Title","status":"published"}'
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

          assert.strictEqual(stdout.trim(), 'Frontmatter updated successfully')
          
          // Verify the file was actually updated
          fs.readFile(fixturePath, 'utf-8').then(content => {
            assert.match(content, /title: CLI Updated Title/)
            assert.match(content, /status: published/)
            resolve()
          }).catch(reject)
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })

    test('should run CLI and set specific fields', async () => {
      // Use the actual fixture file that exists on disk
      const fixturePath = path.join(fixturesDir, 'updatable-post.md')
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          fixturePath,
          '--set',
          'title="CLI Set Title"',
          'author="CLI Set Author"'
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

          assert.strictEqual(stdout.trim(), 'Fields updated successfully')
          
          // Verify the file was actually updated
          fs.readFile(fixturePath, 'utf-8').then(content => {
            assert.match(content, /title: CLI Set Title/)
            assert.match(content, /author: CLI Set Author/)
            resolve()
          }).catch(reject)
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })

    test('should run CLI and remove fields', async () => {
      // Use a separate fixture file that exists on disk
      const fixturePath = path.join(fixturesDir, 'cli-test-remove.md')
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          fixturePath,
          '--remove=tags,draft'
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

          assert.strictEqual(stdout.trim(), 'Fields removed successfully')
          
          // Verify the fields were actually removed
          fs.readFile(fixturePath, 'utf-8').then(content => {
            assert.doesNotMatch(content, /tags:/)
            assert.doesNotMatch(content, /draft:/)
            assert.match(content, /title: Original Title/) // Preserved
            resolve()
          }).catch(reject)
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })

    test('should run CLI and create frontmatter if missing', async () => {
      // Use a separate no-frontmatter fixture file that exists on disk
      const fixturePath = path.join(fixturesDir, 'cli-test-create.md')
      const { spawn } = await import('node:child_process')
      
      return new Promise<void>((resolve, reject) => {
        const cliProcess = spawn('node', [
          'dist/bin/cli.cjs',
          fixturePath,
          '--create',
          '--update={"title":"Created Title","author":"Created Author"}'
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

          assert.strictEqual(stdout.trim(), 'Frontmatter updated successfully')
          
          // Verify the frontmatter was created
          fs.readFile(fixturePath, 'utf-8').then(content => {
            assert.match(content, /^---\n/)
            assert.match(content, /title: Created Title/)
            assert.match(content, /author: Created Author/)
            assert.match(content, /\n---\n/)
            assert.match(content, /# No Frontmatter Post/) // Content preserved
            resolve()
          }).catch(reject)
        })

        cliProcess.on('error', (error) => {
          reject(new Error(`Failed to spawn CLI process: ${error}`))
        })
      })
    })
  })
})
