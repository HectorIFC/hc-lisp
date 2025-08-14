# Modern Testing with Jest

HC-Lisp now uses Jest as the modern test framework, replacing the previous custom test runner. This provides better developer experience, coverage reporting, and integration with modern tooling.

## Test Structure

### Test Files

- **`tests/hc-lisp.test.ts`** - Basic operations and core functionality tests
- **`tests/hc-lisp-advanced.test.ts`** - Advanced features, recursion, and complex operations
- **`tests/setup.ts`** - Jest setup and configuration utilities

### Test Categories

1. **Arithmetic Operations** - Addition, subtraction, multiplication, division, sqrt
2. **Comparison Operations** - Equality, less than, greater than, etc.
3. **List Operations** - first, rest, cons, count
4. **Predicates** - even?, odd?, nil?, empty?
5. **Math Functions** - Math/abs, sqrt
6. **Variables and Functions** - def, defn, if, let
7. **I/O Functions** - print, println
8. **Higher-Order Functions** - map, reduce
9. **Error Handling** - Division by zero, undefined symbols
10. **Recursion** - Factorial, Fibonacci
11. **Complex Data Structures** - Nested vectors, data access

## Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Run legacy test suite (for comparison)
npm run test:legacy
```

## Coverage Information

The current test suite achieves **~65% code coverage** across the codebase:

- **Categorize.ts**: 92.85% coverage
- **Context.ts**: 75% coverage
- **Interpret.ts**: 77.21% coverage
- **Keywords.ts**: 44.44% coverage (many special forms not tested)
- **Library.ts**: 63.37% coverage
- **Parenthesize.ts**: 85.18% coverage
- **Parse.ts**: 85.71% coverage
- **Tokenizer.ts**: 100% coverage

## Jest Configuration

The Jest configuration (`jest.config.js`) includes:

- **TypeScript Support**: Via `ts-jest` preset
- **Test Discovery**: Automatic detection of `.test.ts` and `.spec.ts` files
- **Coverage Collection**: From all `src/**/*.ts` files
- **Setup Files**: Custom setup in `tests/setup.ts`
- **Coverage Reports**: Text, LCOV, and HTML formats

## Test Features

### Type Safety
All tests are written in TypeScript with proper type checking for HC-Lisp values:

```typescript
const result = HcLisp.eval('(+ 1 2 3)');
expect(result).toEqual({ type: 'number', value: 6 });
```

### Context Reset
Each test starts with a fresh HC-Lisp environment:

```typescript
beforeEach(() => {
  HcLisp.resetContext();
});
```

### Error Testing
Proper error handling validation:

```typescript
expect(() => HcLisp.eval('(sqrt -1)')).toThrow('sqrt requires a non-negative number');
```

### Console Mocking
I/O function testing with Jest spies:

```typescript
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
HcLisp.eval('(println "Hello, World!")');
expect(consoleSpy).toHaveBeenCalledWith('Hello, World!');
consoleSpy.mockRestore();
```

### Complex Test Cases
Advanced mathematical operations like Pi calculation:

```typescript
test('should calculate pi using Leibniz series', () => {
  // Complex multi-line function definition and testing
  const piFunction = `(defn leibniz-pi [n] ...)`;
  HcLisp.eval(piFunction);
  
  const pi1000 = HcLisp.eval('(leibniz-pi 1000)');
  expect(pi1000.value).toBeCloseTo(Math.PI, 2);
});
```

## Benefits over Legacy Tests

1. **Better Error Messages**: Jest provides detailed diff output for failing assertions
2. **Coverage Reports**: Built-in coverage analysis with multiple output formats
3. **Watch Mode**: Automatic test re-running during development
4. **Parallel Execution**: Tests run in parallel for faster feedback
5. **Standard Tooling**: Integration with VS Code, CI/CD, and other tools
6. **Mocking Support**: Built-in mocking for console, modules, and functions
7. **Snapshot Testing**: Available for complex data structure validation
8. **Test Organization**: Better grouping and description of test cases

## Development Workflow

1. **Writing Tests**: Create descriptive test cases with proper grouping
2. **Running Tests**: Use `npm test` for quick feedback
3. **Coverage Analysis**: Run `npm run test:coverage` to identify untested code
4. **Watch Mode**: Use `npm run test:watch` during active development
5. **CI Integration**: Jest integrates seamlessly with GitHub Actions and other CI systems

## Legacy Compatibility

The legacy test suite is still available for comparison and verification:

- Original tests: `npm run test:legacy`
- .hclisp file tests: Still executed by the legacy runner
- TypeScript tests: Available as `npm run test:basic-legacy` and `npm run test:advanced-legacy`

This dual approach ensures backward compatibility while providing modern testing capabilities.




