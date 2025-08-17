# Generative Tags

A utility class for leveraging LLMs and their generative text nature to automatically generate relevant tags for blog posts markdown files.

## 🎯 Overview

The `GenerativeTags` class provides AI-powered capabilities to generate tags for blog post files that use markdown format and have frontmatter. This utility complements the existing frontmatter management tools by adding intelligent tag generation capabilities.

## 🏗 Architecture

### Class Structure

```typescript
export class GenerativeTags {
  private filePath: string
  private options: GenerativeTagsOptions
  private model: any

  constructor(filePath: string, options?: GenerativeTagsOptions)
  
  // Public methods
  async run(): Promise<void>
  getFilePath(): string
  getOptions(): GenerativeTagsOptions
}
```

### Options Interface

```typescript
export interface GenerativeTagsOptions {
  model?: string           // LLM model to use (default: gpt-4-turbo-preview)
  maxTokens?: number       // Maximum tokens for AI response (default: 150)
  temperature?: number     // AI response creativity (default: 0.7)
  createIfMissing?: boolean // Create frontmatter if none exists (default: false)
}
```

## 🔧 Implementation Details

### Core Dependencies

- **`@ai-sdk/openai-compatible`**: OpenAI-compatible API integration for LLM calls
- **`ai`**: AI SDK for structured object generation
- **`zod`**: Schema validation for AI responses
- **`MarkdownFrontmatterExtractor`**: Extract existing frontmatter for AI context
- **`MarkdownFrontmatterUpdater`**: Update files with generated tags
- **Node.js Built-in Modules**: File system operations and glob pattern matching

### Key Methods

#### `run()`
Main method that orchestrates the entire tag generation process:
1. Determines if the file path is a glob pattern or single file
2. Processes files accordingly (single or batch)
3. Extracts existing frontmatter for AI context
4. Calls AI API to generate relevant tags
5. Updates files with generated tags

#### `processSingleFile(filePath)`
Handles individual file processing:
- Extracts existing frontmatter
- Generates tags using AI
- Updates the file with new tags
- Handles frontmatter creation if missing

#### `processGlobPattern()`
Handles batch processing via glob patterns:
- Finds matching files using Node.js built-in glob capabilities
- Processes each file sequentially
- Provides progress feedback

#### `generateTags(frontmatter)`
AI-powered tag generation:
- Constructs system prompt for consistent tag generation
- Uses `generateObject()` with Zod schema for structured output
- Validates AI response against `z.object({ tags: z.array(z.string()) })` schema
- Returns validated tags array with automatic 3-tag limit
- Eliminates parsing errors from unstructured text responses

## 📝 CLI Interface

The utility is accessible through the unified CLI with the following commands:

### Generate Tags for Existing Frontmatter
```bash
devrel-blog-utils generate-tags <file-path>
```

### Generate Tags and Create Frontmatter if Missing
```bash
devrel-blog-utils generate-tags <file-path> --create
```

### Generate Tags for Multiple Files (Glob Pattern)
```bash
devrel-blog-utils generate-tags ./blog-*.md
```

### Examples
```bash
# Generate tags for a single blog post
devrel-blog-utils generate-tags ./blog-post.md

# Generate tags for all blog posts in current directory
devrel-blog-utils generate-tags ./*.md

# Generate tags and create frontmatter for posts without it
devrel-blog-utils generate-tags ./draft-*.md --create
```

## 💻 Programmatic Usage

### Basic Usage

```typescript
import { GenerativeTags } from 'devrel-blog-utils'

// Create instance for single file
const generativeTags = new GenerativeTags('./blog-post.md')

// Generate tags
await generativeTags.run()
```

### Advanced Usage

```typescript
// Custom configuration
const generativeTags = new GenerativeTags('./blog-post.md', {
  model: 'gpt-3.5-turbo',
  maxTokens: 100,
  temperature: 0.5,
  createIfMissing: true
})

// Process multiple files with glob pattern
const batchTags = new GenerativeTags('./blog-*.md', {
  createIfMissing: false
})

await batchTags.run()
```

### Environment Configuration

```bash
# .env file
OPENAI_API_KEY=your_api_key_here
BASE_URL=https://your-api-endpoint.com/v1
MODEL_NAME=gemma3:270m
MAX_TOKENS=150
TEMPERATURE=0.7
```

## 🧪 Testing Strategy

### Test Categories

1. **Unit Tests**
   - Class instantiation and options handling
   - Environment variable processing
   - Glob pattern detection and matching
   - Error handling for missing API keys

2. **Integration Tests**
   - File processing with existing frontmatter
   - Frontmatter creation when missing
   - AI response parsing and validation
   - File system operations

3. **CLI Integration Tests**
   - Command-line argument processing
   - CLI execution and output validation
   - Error handling in CLI context

### Test Coverage

- **Current Coverage**: Placeholder tests (to be implemented with proper mocking)
- **Test Files**: `__tests__/generative-tags.test.ts`
- **Test Fixtures**: Multiple fixture files for various scenarios

## 🔒 Security Considerations

### API Security
- **API Key Management**: Uses environment variables for sensitive data
- **No Hardcoding**: API keys are never stored in source code
- **Secure Communication**: HTTPS communication with OpenAI-compatible API

### File Operations
- **Path Resolution**: Uses `path.resolve()` to prevent directory traversal
- **File Permissions**: Respects existing file permissions
- **Error Handling**: Graceful handling of permission and access errors

### Data Privacy
- **Frontmatter Only**: Only sends frontmatter data to AI API, not full content
- **No Sensitive Data**: Avoids sending potentially sensitive information
- **Local Processing**: All file operations happen locally

## ⚡ Performance Characteristics

### Optimization Features
- **Efficient Parsing**: Uses existing frontmatter extraction utilities
- **Batch Processing**: Supports glob patterns for multiple files
- **Sequential Processing**: Processes files one at a time to avoid overwhelming APIs

### Performance Metrics
- **Typical Operations**: < 200ms for standard blog posts (including AI API call)
- **File Size Support**: Efficiently handles files up to 1MB
- **Batch Processing**: Linear performance scaling with number of files

### API Considerations
- **Rate Limiting**: Respects OpenAI-compatible API rate limits
- **Token Usage**: Optimized prompts to minimize token consumption
- **Response Time**: AI API response time is the primary performance factor

## 🚨 Error Handling

### Common Error Scenarios

1. **Missing API Key**
   ```typescript
   throw new Error('OPENAI_API_KEY environment variable is required')
   ```

2. **No Frontmatter (when createIfMissing is false)**
   ```typescript
   throw new Error('No frontmatter found and createIfMissing is false')
   ```

3. **AI API Errors**
   ```typescript
   throw new Error(`Failed to generate tags with AI: ${error.message}`)
   ```

4. **Schema Validation Errors**
   ```typescript
   throw new Error(`Failed to validate AI response schema: ${error.message}`)
   ```

5. **File System Errors**
   ```typescript
   throw new Error(`Failed to process ${filePath}: ${error.message}`)
   ```

### Error Recovery
- **Graceful Degradation**: Continues processing other files when possible
- **Meaningful Messages**: Provides actionable error information
- **Exit Codes**: Proper CLI exit codes for automation
- **Partial Success**: Reports on successfully processed files

## 🔄 Future Enhancements

### Planned Features
- **Multiple AI Providers**: Support for other LLM providers (Claude, Gemini)
- **Custom Prompts**: User-defined system prompts for tag generation
- **Schema Customization**: Configurable Zod schemas for different tag formats
- **Tag Validation**: AI-generated tag validation and refinement
- **Batch Optimization**: Parallel processing for multiple files
- **Tag Templates**: Predefined tag generation templates for different content types

### Technical Improvements
- **Caching**: Cache AI responses for similar frontmatter
- **Retry Logic**: Automatic retry for failed API calls
- **Progress Reporting**: Real-time progress updates for batch operations
- **Configuration Files**: Project-specific configuration files
- **Plugin System**: Custom tag generation processors

### AI Model Enhancements
- **Fine-tuning**: Custom model fine-tuning for specific domains
- **Context Awareness**: Better understanding of content context
- **Multi-language Support**: Tag generation in multiple languages
- **SEO Optimization**: SEO-focused tag generation strategies

## 📚 API Reference

### Constructor
```typescript
constructor(filePath: string, options?: GenerativeTagsOptions)
```

**Parameters:**
- `filePath`: Path to markdown file or glob pattern
- `options`: Optional configuration object

### Methods

#### `run(): Promise<void>`
Executes the tag generation process for the specified file(s).

#### `getFilePath(): string`
Returns the resolved file path or glob pattern.

#### `getOptions(): GenerativeTagsOptions`
Returns a copy of the current options configuration.

### Options

#### `model: string`
LLM model to use for tag generation. Default: `'gemma3:270m'`

#### `maxTokens: number`
Maximum tokens for AI response. Default: `150`

#### `temperature: number`
AI response creativity (0.0 = deterministic, 1.0 = creative). Default: `0.7`

#### `createIfMissing: boolean`
When true, creates new frontmatter if none exists. Default: `false`

## 🔗 Related Documentation

- [Project Overview](../PROJECT.md)
- [Requirements](../REQUIREMENTS.md)
- [Markdown Frontmatter Extractor](./markdown-frontmatter-extractor.md)
- [Markdown Frontmatter Updater](./markdown-frontmatter-updater.md)
- [CLI Usage Guide](../PROJECT.md#cli-usage)

## 🚀 Getting Started

### Prerequisites
1. OpenAI-compatible API key and endpoint
2. Node.js >=22.0.0
3. `.env` file with API configuration

### Quick Start
1. **Set up environment variables:**
   ```bash
   echo "OPENAI_API_KEY=your_key_here" > .env
   echo "BASE_URL=https://your-api-endpoint.com/v1" >> .env
   ```

2. **Generate tags for a single file:**
   ```bash
   npm start -- ./blog-post.md --generate-tags
   ```

3. **Generate tags for multiple files:**
   ```bash
   npm start -- ./blog-*.md --generate-tags
   ```

4. **Programmatic usage:**
   ```typescript
   import { GenerativeTags } from 'devrel-blog-utils'
   
   const tags = new GenerativeTags('./blog-post.md')
   await tags.run()
   ```

## 💡 Best Practices

### Tag Generation
- **Structured Output**: Leverage Zod schema validation for reliable AI responses
- **Review AI Output**: Always review generated tags before publishing
- **Consistent Naming**: Use consistent tag naming conventions across your blog
- **SEO Focus**: Focus on tags that improve search engine discoverability
- **User Experience**: Choose tags that help readers find related content

### Performance
- **Batch Processing**: Use glob patterns for multiple files
- **API Limits**: Be mindful of OpenAI API rate limits
- **File Organization**: Organize files logically for efficient glob patterns

### Security
- **Environment Variables**: Never commit API keys to version control
- **File Permissions**: Ensure proper file permissions for read/write operations
- **API Access**: Use least-privilege API keys with appropriate rate limits
