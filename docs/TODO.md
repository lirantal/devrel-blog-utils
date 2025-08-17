# TODOs

A list of issues to address in the project

## 1. ✅ Refactor to use the built-in Node.js API for argument parsing

The Node.js API has a built-in utility function to assist with argument parsing for CLIs. Use that instead of heavy-lifting argument matching and other arguments handling that is handled right now in `cli.ts` file.

**Status: COMPLETED**
- Refactored CLI to use `util.parseArgs()` from Node.js built-in API
- Implemented command-based structure with `extract-frontmatter`, `update-frontmatter`, and `generate-tags` commands
- Replaced manual argument parsing with proper command namespacing
- Updated all test files to use new command structure
- All tests passing (42/42)

## 2. Update test suite for proper tests

The test suite for generative tags, in `generative-tags.test.ts` file have placeholders entirely through-out instead of actual tests. This is due to missing mocking and other test harness capabilities to properly handle the dependency on the LLM calls with the AI SDK, and maybe other dependencies.