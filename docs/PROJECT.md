# DevRel Blog Utils

A TypeScript CLI project providing utilities for Bloggers and DevRel practitioners to manage blog-related activities.

## 🎯 Project Overview

This project aims to streamline common blog management tasks by providing command-line utilities that can be easily integrated into development workflows, CI/CD pipelines, and automation scripts.

## 🚀 Features

- **Markdown Frontmatter Extraction**: Extract structured data from markdown files with frontmatter
- **Markdown Frontmatter Updates**: Update, modify, and manage frontmatter in markdown files
- **AI-Powered Tag Generation**: Automatically generate relevant tags using OpenAI-compatible LLMs
- **Field Filtering**: Optionally filter specific fields from frontmatter data
- **Field Management**: Add, remove, and modify specific frontmatter fields
- **CLI Interface**: Easy-to-use command-line interface
- **Programmatic API**: Use utilities as libraries in your own code
- **Comprehensive Testing**: Full test coverage including end-to-end CLI testing

## 🛠 Tech Stack

### Core Technologies
- **TypeScript**: Primary language for type safety and modern JavaScript features
- **Node.js**: Runtime environment (requires Node.js >=22.0.0)
- **ESM Modules**: Modern ES module system for better tree-shaking and performance

### Build & Development Tools
- **tsup**: Fast TypeScript bundler for ESM/CJS dual output
- **tsx**: TypeScript execution engine for development
- **c8**: Code coverage tool for Node.js built-in test runner
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

### Testing Framework
- **Node.js Built-in Test Runner**: Native testing without external dependencies
- **c8**: Coverage reporting for the test suite

### Package Management
- **npm**: Package manager with lockfile validation
- **Changesets**: Version management and changelog generation

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/lirantal/devrel-blog-utils.git
cd devrel-blog-utils

# Install dependencies
npm install

# Build the project
npm run build
```

## 🔧 Development

### Prerequisites
- Node.js >=22.0.0
- npm >=8.4.0

### Available Scripts

```bash
# Development
npm start -- <args>          # Run CLI in development mode
npm run build                # Build the project (TypeScript + tsup)
npm run lint                 # Run linting checks
npm run lint:fix             # Auto-fix linting issues

# Testing
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode
npm run coverage:view       # Open coverage report in browser

# Release Management
npm run version              # Version packages using changesets
npm run release              # Publish packages
```

### Project Structure

```
devrel-blog-utils/
├── src/
│   ├── utils/                    # Utility classes
│   │   ├── markdown-frontmatter-extractor.ts
│   │   ├── markdown-frontmatter-updater.ts
│   │   └── generative-tags.ts
│   ├── bin/                      # CLI entry points
│   │   └── cli.ts
│   └── main.ts                   # Library exports
├── __tests__/                    # Test files
│   ├── __fixtures__/             # Test data files
│   ├── markdown-frontmatter-extractor.test.ts
│   ├── markdown-frontmatter-updater.test.ts
│   └── generative-tags.test.ts
├── dist/                         # Built outputs
├── docs/                         # Project documentation
└── package.json
```

## 📚 Usage

### CLI Usage

```bash
# Extract all frontmatter from a markdown file
npx devrel-blog-utils ./blog-post.md

# Extract specific fields only
npx devrel-blog-utils ./blog-post.md --fields=title,author,date

# Update frontmatter with new data
npx devrel-blog-utils ./blog-post.md --update='{"title":"New Title","status":"published"}'

# Update specific fields
npx devrel-blog-utils ./blog-post.md --set title="New Title" author="New Author"

# Remove specific fields
npx devrel-blog-utils ./blog-post.md --remove tags,draft

# Create frontmatter if missing
npx devrel-blog-utils ./blog-post.md --create --update='{"title":"New Post"}'

# Generate AI-powered tags
npx devrel-blog-utils ./blog-post.md --generate-tags

# Generate tags and create frontmatter if missing
npx devrel-blog-utils ./blog-post.md --generate-tags --create

# Run in development mode
npm start -- ./blog-post.md --fields=title,author
```

### Programmatic Usage

```typescript
import { MarkdownFrontmatterExtractor, MarkdownFrontmatterUpdater } from 'devrel-blog-utils'

// Extract all frontmatter
const extractor = new MarkdownFrontmatterExtractor('./blog-post.md')
const result = await extractor.extract()

// Extract specific fields only
const extractor = new MarkdownFrontmatterExtractor('./blog-post.md', {
  fields: ['title', 'author']
})
const result = await extractor.extract()

// Update frontmatter fields
const updater = new MarkdownFrontmatterUpdater('./blog-post.md')
await updater.updateFields({
  title: 'Updated Title',
  status: 'published'
})

// Remove specific fields
await updater.removeFields(['draft', 'tags'])

// Create frontmatter if missing
const updater = new MarkdownFrontmatterUpdater('./blog-post.md', { createIfMissing: true })
await updater.updateFrontmatter({ title: 'New Post' })

// Generate AI-powered tags
const generativeTags = new GenerativeTags('./blog-post.md')
await generativeTags.run()

// Generate tags for multiple files using glob pattern
const generativeTags = new GenerativeTags('./blog-*.md')
await generativeTags.run()
```

## 🧪 Testing

The project uses Node.js built-in test runner with comprehensive coverage:

- **Unit Tests**: Test individual class methods and functionality
- **Integration Tests**: Test with real file system operations
- **End-to-End Tests**: Test CLI process spawning and real CLI behavior
- **Coverage**: 97.7% code coverage with detailed reporting

Run tests with:
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode for development
npm run coverage:view      # View coverage report
```

## 📋 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

Apache-2.0 License - see [LICENSE](../LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/lirantal/devrel-blog-utils/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lirantal/devrel-blog-utils/discussions)
- **Author**: [Liran Tal](https://github.com/lirantal)
