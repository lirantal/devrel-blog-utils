# TODOs

A list of issues to address in the project

## 1. Refactor to use the built-in Node.js API for argument parsing

The Node.js API has a built-in utility function to assist with argument parsing for CLIs. Use that instead of heavy-lifting argument matching and other arguments handling that is handled right now in `cli.ts` file.

## 2. Update test suite for proper tests

The test suite for generative tags, in `generative-tags.test.ts` file have placeholders entirely through-out instead of actual tests. This is due to missing mocking and other test harness capabilities to properly handle the dependency on the LLM calls with the AI SDK, and maybe other dependencies.