# Project Requirements

This document outlines the specific utilities developed in this project and their acceptance criteria.

## 🎯 Project Goals

Create a TypeScript CLI project that provides Bloggers and DevRel practitioners with utilities to manage blog-related activities, starting with markdown frontmatter extraction capabilities.

## 📋 Utility Requirements

### 1. Markdown Frontmatter Extractor

#### Overview
A utility to extract structured data from markdown files that contain frontmatter (metadata enclosed in `---` blocks at the top of the file).

### 2. Markdown Frontmatter Updater

#### Overview
A utility to update, modify, and manage frontmatter in markdown files, supporting both existing frontmatter modification and creation of new frontmatter.

### 3. Generative Tags

#### Overview
An AI-powered utility that automatically generates relevant tags for blog posts using OpenAI-compatible Large Language Models (LLMs), supporting both single file and batch processing via glob patterns.

#### Functional Requirements

**Core Functionality:**
- Extract all frontmatter data from markdown files
- Support YAML frontmatter format
- Return structured JSON data
- Handle files with and without frontmatter gracefully

**Field Filtering:**
- Optionally filter specific fields from frontmatter
- Support comma-separated field lists
- Return only requested fields when filtering is applied

**Error Handling:**
- Gracefully handle missing files
- Provide meaningful error messages
- Handle malformed frontmatter gracefully

#### Functional Requirements for Markdown Frontmatter Updater

**Core Functionality:**
- Update entire frontmatter with new data
- Update specific fields while preserving others
- Remove specified fields from frontmatter
- Create new frontmatter when none exists (optional)
- Preserve existing frontmatter structure and formatting

**Field Management:**
- Merge new fields with existing frontmatter
- Support complex data types (arrays, objects, booleans, null)
- Maintain YAML formatting and structure
- Handle field removal without affecting other fields

**Options and Configuration:**
- `createIfMissing`: Option to create frontmatter when none exists
- `preserveFormatting`: Maintain existing YAML structure and formatting

**Error Handling:**
- Gracefully handle missing files
- Provide meaningful error messages for frontmatter operations
- Handle malformed YAML gracefully
- Support rollback or safe operations

#### Technical Requirements

**Architecture:**
- Follow class-based design patterns (not functional)
- Use constructor-based initialization
- Support dependency injection through options object

**Dependencies:**
- Use established npm packages for markdown parsing
- Leverage `mdast-util-from-markdown` for AST parsing
- Use `micromark-extension-frontmatter` for frontmatter support
- Use `yaml` package for YAML parsing

**Performance:**
- Efficient file reading and parsing
- Minimal memory footprint
- Fast execution for typical blog post sizes

#### CLI Interface Requirements

**Command Structure:**
```
devrel-blog-utils extract-frontmatter <file-path> [--fields field1,field2]
```

**Arguments:**
- `file-path`: Required path to markdown file
- `--fields`: Optional comma-separated list of fields to extract

**Output:**
- JSON format for successful extractions
- Clear error messages for failures
- Proper exit codes (0 for success, 1 for errors)

**Usage Examples:**
```bash
# Extract all frontmatter
devrel-blog-utils extract-frontmatter ./blog-post.md

# Extract specific fields
devrel-blog-utils extract-frontmatter ./blog-post.md --fields=title,author,date
```

#### CLI Interface Requirements for Markdown Frontmatter Updater

**Command Structure:**
```
devrel-blog-utils update-frontmatter <file-path> [--update '{"field":"value"}' | --set field="value" | --remove field1,field2 | --create]
```

**Arguments:**
- `file-path`: Required path to markdown file
- `--update`: JSON string with new frontmatter data
- `--set`: Key-value pairs for specific field updates
- `--remove`: Comma-separated list of fields to remove
- `--create`: Flag to create frontmatter if missing

**Output:**
- Success confirmation messages
- Clear error messages for failures
- Proper exit codes (0 for success, 1 for errors)

**Usage Examples:**
```bash
# Update entire frontmatter
devrel-blog-utils update-frontmatter ./blog-post.md --update='{"title":"New Title","status":"published"}'

# Update specific fields
devrel-blog-utils update-frontmatter ./blog-post.md --set title="New Title" author="New Author"

# Remove specific fields
devrel-blog-utils update-frontmatter ./blog-post.md --remove tags,draft

# Create frontmatter if missing
devrel-blog-utils update-frontmatter ./blog-post.md --create --update='{"title":"New Post"}'
```

#### CLI Interface Requirements for Generative Tags

**Command Structure:**
```
devrel-blog-utils generate-tags <file-path> [--create]
```

**Arguments:**
- `file-path`: Required path to markdown file (supports glob patterns)
- `--generate-tags`: Flag to generate AI-powered tags
- `--create`: Optional flag to create frontmatter if missing

**Output:**
- Success confirmation messages with generated tags
- Clear error messages for failures
- Proper exit codes (0 for success, 1 for errors)

**Usage Examples:**
```bash
# Generate tags for existing frontmatter
devrel-blog-utils generate-tags ./blog-post.md

# Generate tags and create frontmatter if missing
devrel-blog-utils generate-tags ./blog-post.md --create

# Generate tags for multiple files using glob pattern
devrel-blog-utils generate-tags ./blog-*.md
```

## ✅ Acceptance Criteria

### Functional Acceptance Criteria

1. **Basic Extraction**
   - [x] Successfully extract frontmatter from markdown files with YAML frontmatter
   - [x] Return null for files without frontmatter
   - [x] Handle various YAML data types (strings, numbers, booleans, arrays, objects)

2. **Field Filtering**
   - [x] Extract only specified fields when `--fields` option is provided
   - [x] Support multiple fields in comma-separated format
   - [x] Return empty object when none of the requested fields exist

3. **Error Handling**
   - [x] Provide clear error message for missing files
   - [x] Handle malformed YAML gracefully
   - [x] Exit with appropriate error codes

4. **CLI Interface**
   - [x] Show usage instructions when no arguments provided
   - [x] Process command line arguments correctly
   - [x] Output JSON in readable format
   - [x] Handle both success and error cases

### Functional Acceptance Criteria for Markdown Frontmatter Updater

1. **Basic Updates**
   - [x] Successfully update entire frontmatter with new data
   - [x] Update specific fields while preserving others
   - [x] Remove specified fields without affecting others
   - [x] Create new frontmatter when none exists (with createIfMissing option)

2. **Field Management**
   - [x] Merge new fields with existing frontmatter
   - [x] Support complex data types (arrays, objects, booleans, null)
   - [x] Maintain YAML formatting and structure
   - [x] Handle field removal gracefully

3. **Error Handling**
   - [x] Provide clear error messages for frontmatter operations
   - [x] Handle missing files gracefully
   - [x] Handle malformed YAML gracefully
   - [x] Support safe operations with proper error codes

4. **CLI Interface**
   - [x] Process all update commands correctly (--update, --set, --remove, --create)
   - [x] Show success confirmation messages
   - [x] Handle both success and error cases
   - [x] Support all specified command-line options

### Functional Acceptance Criteria for Generative Tags

1. **AI Integration**
   - [x] Successfully initialize OpenAI-compatible API client
   - [x] Handle API configuration via environment variables
   - [x] Generate relevant tags using LLM technology
   - [x] Handle API errors gracefully with meaningful messages

2. **File Processing**
   - [x] Process single files and glob patterns correctly
   - [x] Extract existing frontmatter for AI context
   - [x] Update files with generated tags
   - [x] Create new frontmatter when none exists (with createIfMissing option)

3. **Tag Generation**
   - [x] Generate relevant, SEO-friendly tags
   - [x] Use structured AI responses with Zod schema validation
   - [x] Handle AI responses reliably with consistent format
   - [x] Support batch processing for multiple files

4. **CLI Interface**
   - [x] Process --generate-tags command correctly
   - [x] Support --create flag for missing frontmatter
   - [x] Show success confirmation messages
   - [x] Handle both success and error cases

### Technical Acceptance Criteria

1. **Code Quality**
   - [x] Follow TypeScript best practices
   - [x] Use class-based architecture as specified
   - [x] Implement proper error handling
   - [x] Follow project coding standards

2. **Testing**
   - [x] Unit tests for class methods
   - [x] Integration tests with real files
   - [x] End-to-end tests for CLI functionality
   - [x] Minimum 90% code coverage
   - [x] Test both success and failure scenarios

3. **Build & Distribution**
   - [x] Successful TypeScript compilation
   - [x] Generate both ESM and CJS outputs
   - [x] Create proper type definitions
   - [x] CLI binary generation working

4. **Documentation**
   - [x] Clear API documentation
   - [x] Usage examples
   - [x] Installation instructions
   - [x] Contributing guidelines

### Performance Acceptance Criteria

1. **Speed**
   - [x] Extract frontmatter from typical blog posts (< 100ms)
   - [x] Handle files up to 1MB efficiently

2. **Reliability**
   - [x] No memory leaks during operation
   - [x] Consistent behavior across different file sizes
   - [x] Graceful degradation for edge cases

## 🔍 Test Scenarios

### Unit Tests
- [x] Class instantiation with various options
- [x] Method behavior with different inputs
- [x] Error handling in individual methods

### Integration Tests
- [x] Real file system operations
- [x] Various frontmatter formats and content
- [x] Field filtering functionality
- [x] Edge cases (empty files, malformed YAML)

### End-to-End Tests
- [x] CLI process spawning
- [x] Real CLI execution with various arguments
- [x] Output validation
- [x] Error handling in CLI context

## 📊 Success Metrics

- **Test Coverage**: ≥ 90% (Achieved: 95.13%)
- **Build Success**: 100% successful compilations
- **CLI Functionality**: All specified commands working for both utilities
- **Error Handling**: Graceful handling of all error scenarios
- **Performance**: Sub-second response time for typical files
- **Utilities**: 3 fully functional utilities with comprehensive testing

## 🚀 Future Enhancements

### Potential Additional Utilities
- **Blog Post Validator**: Validate blog post structure and required fields
- **Frontmatter Template Generator**: Create frontmatter templates
- **Blog Post Metadata Updater**: Update existing frontmatter
- **Blog Series Manager**: Manage related blog posts
- **SEO Metadata Extractor**: Extract SEO-related frontmatter fields

### Technical Improvements
- **Plugin System**: Allow custom frontmatter processors
- **Batch Processing**: Handle multiple files at once
- **Output Formats**: Support different output formats (JSON, YAML, CSV)
- **Configuration Files**: Support for project-specific configurations
