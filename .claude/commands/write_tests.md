---
description: Automatically write high-quality component unit tests using specified project conventions.
argument-hint: [path/to/file.tsx]
allowed-tools: Bash, Read, Edit
---
Write comprehensive unit tests for the following file: $ARGUMENTS

Testing conventions for our project:
* Use Vitest with React Testing Library
* Place test files in a __tests__ directory in the same folder as the source file
* Name test files as [filename].test.ts(x)
* Use the @/ prefix for local imports

Coverage requirements:
1. Test the default happy paths
2. Test common edge cases
3. Test error states and unexpected payloads


