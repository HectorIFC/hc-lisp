<img src="docs/assets/logo/hclisp-icon-light.svg" alt="HCLisp Icon" width="64">

# HC-Lisp 🦝

[![npm version](https://img.shields.io/npm/v/hc-lisp.svg)](https://www.npmjs.com/package/hc-lisp)
[![npm downloads](https://img.shields.io/npm/dm/hc-lisp.svg)](https://www.npmjs.com/package/hc-lisp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/node/v/hc-lisp.svg)](https://www.npmjs.com/package/hc-lisp)
[![SonarCloud](https://sonarcloud.io/api/project_badges/measure?project=HectorIFC_hc-lisp&metric=alert_status)](https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp)
[![Test Coverage](https://sonarcloud.io/api/project_badges/measure?project=HectorIFC_hc-lisp&metric=coverage)](https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=HectorIFC_hc-lisp&metric=sqale_rating)](https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp)
[![GitHub Issues](https://img.shields.io/github/issues/HectorIFC/hc-lisp.svg)](https://github.com/HectorIFC/hc-lisp/issues)
[![Last Commit](https://img.shields.io/github/last-commit/HectorIFC/hc-lisp.svg)](https://github.com/HectorIFC/hc-lisp/commits/main)
[![GitHub Stars](https://img.shields.io/github/stars/HectorIFC/hc-lisp.svg?style=social)](https://github.com/HectorIFC/hc-lisp/stargazers)
[![REPL](https://img.shields.io/badge/REPL-Interactive-purple.svg)](#interactive-repl)
[![Lisp](https://img.shields.io/badge/Language-Lisp-orange.svg)](#features)
[![Educational](https://img.shields.io/badge/Purpose-Educational-green.svg)](#project-goals)

A modern Lisp dialect implementation in TypeScript, inspired by Clojure and Peter Norvig's Lispy project.

**Meet Quati 🦝, our smart and curious mascot!** Just like a quati explores the forest, HC-Lisp helps you explore the world of functional programming with intelligence and adaptability.

> ⚠️ **Development Status**: HC-Lisp is currently in active development and is **not ready for production use**. This is an experimental project intended for educational purposes and learning how Lisp interpreters work. APIs may change, features may be incomplete, and there may be bugs. Use at your own discretion for learning and experimentation.

🌐 **[Site](https://hectorifc.github.io/hc-lisp)** | 📚 **[Documentation](https://hectorifc.github.io/hc-lisp)** | 🚀 **[Try Examples](https://hectorifc.github.io/hc-lisp#examples)**

## Features

HC-Lisp is a functional programming language that supports:

- **Basic data types**: numbers, strings, booleans, nil, keywords, symbols
- **Data structures**: lists and vectors
- **Functions**: function definition with `defn` or `defun` and anonymous functions with `fn`
- **Control flow**: `if`, `let`, `loop`/`recur` for tail recursion
- **Mathematical operations**: +, -, *, /, comparisons, sqrt
- **List operations**: `first`, `rest`, `count`, `map`, `reduce`, `range`
- **Predicates**: `even?`, `nil?`, `empty?`
- **I/O**: `println`, `print`
- **Namespace System**: Import and require Node.js modules with `(import)` and `(require)`
- **Node.js Integration**: Built-in access to fs, crypto, path, and other Node.js modules
- **Built-in Functions**: String manipulation, JSON handling, process utilities
- **Modern Test Pipeline**: Comprehensive Jest-based testing with isolated test files

## Quick Links

- 🌐 **[Website & Documentation](https://hectorifc.github.io/hc-lisp)**
- 📖 **[API Reference](https://hectorifc.github.io/hc-lisp#docs)**
- 🎯 **[Live Examples](https://hectorifc.github.io/hc-lisp#examples)**
- 🧪 **[Testing Info](https://hectorifc.github.io/hc-lisp#testing)**

## Philosophy & Mascot 🦝

**Quati 🦝** is our intelligent and curious mascot! Just like a quati explores the forest with intelligence and adaptability, HC-Lisp helps you explore functional programming.

**Discover the HC-Lisp Principles:**
```lisp
(principles)  ; Display the 20 principles that guide HC-Lisp development
```

*"Code with curiosity, debug with determination, and always stay curious like a quati!" - Quati 🦝*

## Installation and Execution

```bash
# Install dependencies
npm install

# Start the REPL
npm start

# Run all tests (Jest)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Execute a .hclisp file
npm run hclisp <file.hclisp>
```

## Testing

HC-Lisp uses **Jest** as the modern test framework with complete integration. The test suite includes:

- **Comprehensive test coverage** for all language features  
- **Unit tests** for TypeScript modules (Jest)
- **Integration tests** for .hclisp files (Jest) - each file has isolated tests
- **Type-safe tests** written in TypeScript
- **Error handling validation** with proper exception testing
- **Console output mocking** for I/O testing
- **Multiline expression support** in the language core
- **Namespace/Import Testing**: Comprehensive tests for Node.js integration
- **Individual File Tests**: Each .hclisp file has its own isolated test for better maintainability

All tests are unified under Jest with a clean, isolated test structure - no legacy test runners needed!

### Test Structure
- **Multiple test suites** covering all functionality
- **hc-lisp.test.ts**: Core language functionality
- **hc-lisp-advanced.test.ts**: Advanced features and edge cases  
- **hc-files.test.ts**: Individual .hclisp file execution tests

For detailed testing information, see [TESTING.md](TESTING.md)

## Project Status

HC-Lisp is an **experimental educational project** currently in active development. 

### Current State
- ✅ Core language features implemented and working
- ✅ Comprehensive test suite with 100% pass rate
- ✅ REPL interface for interactive development
- ✅ File execution support (.hclisp files)
- ✅ Modern development tooling (TypeScript, Jest, etc.)
- ✅ **Namespace system** with Node.js module integration
- ✅ **Import/require functionality** for external dependencies
- ✅ **Built-in string, JSON, and utility functions**
- ✅ **Isolated test pipeline** with individual .hclisp file tests

### Limitations & Considerations
- 🚧 **Not production-ready**: This is a learning/research project
- 🚧 **API stability**: Language syntax and APIs may change
- 🚧 **Performance**: Not optimized for production workloads
- 🚧 **Error handling**: May not be robust for all edge cases
- 🚧 **Standard library**: Limited compared to mature Lisp implementations

### Intended Use Cases
- 📚 **Learning**: Understanding how Lisp interpreters work
- 🎓 **Education**: Teaching functional programming concepts
- 🔬 **Experimentation**: Trying out language design ideas
- 🛠️ **Research**: Exploring interpreter implementation techniques

**Recommendation**: Use HC-Lisp for learning, experimentation, and educational purposes. For production applications, consider mature Lisp implementations like Clojure, Common Lisp, or Scheme.

## VS Code Configuration

The project includes configurations for syntax highlighting of `.hclisp` files:

1. VS Code settings in `.vscode/settings.json`
2. `.hclisp` files are associated with the Lisp language

For more details, see [SYNTAX-HIGHLIGHTING.md](SYNTAX-HIGHLIGHTING.md)

## Usage Examples

### Basic Operations
```lisp
;; Arithmetic
(+ 1 2 3)        ; => 6
(* 2 3 4)        ; => 24
(/ 12 3)         ; => 4

;; Comparisons
(< 3 5)          ; => true
(= 3 3)          ; => true

;; Lists
(first [1 2 3])  ; => 1
(count [1 2 3])  ; => 3
```

### Variable and Function Definition
```lisp
;; Variables
(def x 42)

;; Functions
(defn square [x] (* x x))
(square 5)     ; => 25

;; Alternative function definition syntax
(defun cube [x] (* x x x))
(cube 3)       ; => 27

;; Functions with docstring
(defn sum
  "Adds two numbers"
  [a b]
  (+ a b))
```

### Control Structures
```lisp
;; If
(if (> 5 3) "greater" "less")  ; => "greater"

;; Let (local binding)
(let [x 10 y 20] (+ x y))     ; => 30

;; Loop with tail recursion
(loop [i 0 acc 1]
  (if (< i 5)
    (recur (+ i 1) (* acc i))
    acc))
```

### Namespace System & Node.js Integration
```lisp
;; Create namespace and import Node.js modules
(ns my-app
  (:import [crypto]
   :require [fs path]))

;; Use imported modules
(crypto/randomUUID)              ; => Generate UUID
(fs/existsSync "package.json")   ; => Check if file exists
(path/join "src" "main.ts")      ; => Join path segments

;; Built-in string functions
(str/upper-case "hello world")   ; => "HELLO WORLD"
(str/lower-case "HELLO")         ; => "hello"

;; Built-in JSON functions
(json/stringify {:name "HC-Lisp" :version "1.0"})  ; => JSON string
(json/parse "{\"key\": \"value\"}")                 ; => Parse JSON

;; Process utilities
(process/cwd)                    ; => Current working directory
(process/platform)               ; => Operating system platform
```

### Example Test Files
```lisp
;; namespace-test.hclisp - Testing namespace functionality
(ns test-app
  (:import [crypto]
   :require []))

(println "Generated UUID:" (crypto/randomUUID))
(println "Uppercase:" (str/upper-case "Node.js is cool!"))
(println "MD5 Hash:" (crypto/createHash "md5"))

;; import-test.hclisp - Testing import/require functionality  
(ns demo-imports
  (:import [crypto]
   :require [fs]))

(println "=== Test of Imports and Requires with Node.js ===")
(println "Generated UUID:" (crypto/randomUUID))
(println "File system available:" (type fs))
(println "=== End of Tests ===")
```

## Included Tests

### 1. Pi Calculation using Leibniz Series
```lisp
(defn leibniz-pi
  "Calculates a pi approximation using the Leibniz series"
  [n]
  (let [terms (map (fn [k] (/ (if (even? k) 1.0 -1.0) (+ (* 2 k) 1)))
                   (range n))]
    (* 4 (reduce + 0 terms))))

(leibniz-pi 1000)  ; => π approximation
```

### 2. Square Root using Newton-Raphson
```lisp
(defn sqrt
  "Calculates the square root of x using the Newton-Raphson method"
  [x]
  (let [epsilon 1e-10]
    (loop [guess x]
      (let [next (/ (+ guess (/ x guess)) 2)]
        (if (< (Math/abs (- guess next)) epsilon)
          next
          (recur next))))))

(sqrt 9)    ; => 3
(sqrt 2)    ; => 1.414213562373095
```

### 3. First Element of a List
```lisp
(defn first-element
  "Returns the first element of any list"
  [list]
  (first list))

(first-element [1 2 3 4])     ; => 1
(first-element [:a :b :c])    ; => :a
(first-element [])            ; => nil
```

## Test Files

### Integration Test Files (.hclisp)
- `tests/basic-test.hclisp` - Basic functionality tests in HC-Lisp
- `tests/pi-test.hclisp` - Pi calculation demonstration
- `tests/sqrt-test.hclisp` - Square root calculation tests
- `tests/first-element-test.hclisp` - First element function tests
- `tests/namespace-test.hclisp` - Namespace system and Node.js integration tests
- `tests/import-test.hclisp` - Import/require functionality tests
- `tests/basic-node-test.hclisp` - Basic Node.js module usage tests
- `tests/simple-ns-test.hclisp` - Simple namespace creation tests

### Unit Test Files (TypeScript/Jest)
- `tests/hc-lisp.test.ts` - Basic unit tests (Jest/TypeScript)
- `tests/hc-lisp-advanced.test.ts` - Advanced unit tests (Jest/TypeScript)  
- `tests/hc-files.test.ts` - **Individual isolated tests** for each .hclisp file (Jest/TypeScript)

### Syntax Examples (Non-executable)
- `demo-syntax.hclisp` - Syntax highlighting demonstration
- `syntax-showcase.hclisp` - Comprehensive syntax examples

## Running Specific Tests

### Execute Individual .hclisp Test Files
```bash
# Basic functionality tests
npm run hclisp tests/basic-test.hclisp

# Mathematical demonstrations
npm run hclisp tests/pi-test.hclisp
npm run hclisp tests/sqrt-test.hclisp

# Function tests
npm run hclisp tests/first-element-test.hclisp

# Node.js integration tests
npm run hclisp tests/namespace-test.hclisp
npm run hclisp tests/import-test.hclisp
npm run hclisp tests/basic-node-test.hclisp
npm run hclisp tests/simple-ns-test.hclisp
```

### Run Jest Test Suites
```bash
# All tests
npm test

# Specific test suite
npm test tests/hc-lisp.test.ts           # Core language tests
npm test tests/hc-lisp-advanced.test.ts  # Advanced features
npm test tests/hc-files.test.ts          # File integration tests

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 📊 Code Quality & Analysis

### SonarCloud Integration ☁️

HC-Lisp uses **SonarCloud** for continuous code quality analysis:

**🔗 Live Dashboard**: [View on SonarCloud](https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp)

**Automated Analysis**:
- ✅ **Every commit** to master triggers analysis
- ✅ **Pull requests** get automatic quality feedback  
- ✅ **Coverage tracking** with historical trends
- ✅ **Security scanning** for vulnerabilities
- ✅ **Quality gates** enforce code standards

**Setup & Usage**:
```bash
# Quick setup guide
npm run sonarcloud:setup

# Verify configuration
npm run sonarcloud:verify

# Generate coverage for SonarCloud
npm run coverage:sonar
```

**Key Metrics Tracked**:
- **Coverage**: Test coverage percentage (target: 80%+)
- **Maintainability**: Technical debt and code smells
- **Reliability**: Bug detection and error patterns
- **Security**: Vulnerability and hotspot analysis
- **Duplications**: Code duplication detection (target: <3%)

For detailed setup instructions, see [SONARCLOUD_README.md](./SONARCLOUD_README.md).

**⚠️ GitHub Action failing?** See [SONARCLOUD_TROUBLESHOOTING.md](./SONARCLOUD_TROUBLESHOOTING.md)

### Local SonarQube

For local development analysis:
```bash
# Complete local analysis
npm run sonar

# Docker setup (recommended)
npm run sonar:docker:start

# Manual setup guide
./quick-start-sonar.sh
```

For local setup details, see [SONAR_README.md](./SONAR_README.md).

## Interactive REPL

Run `npm start` to start the REPL:

```
Welcome to HC-Lisp REPL!
A Lisp dialect.
Type (exit) or Ctrl+C to quit

hc-lisp> (+ 1 2 3)
6
hc-lisp> (defn double [x] (* x 2))
<closure>
hc-lisp> (double 21)
42
hc-lisp> (exit)
```

## Architecture

The project is structured in modules:

- `Tokenizer.ts` - Lexical analysis (tokenization)
- `Categorize.ts` - Token classification
- `Parenthesize.ts` - Syntactic analysis (parsing)
- `Interpret.ts` - Main interpreter
- `Library.ts` - Basic function library and built-in functions
- `Keywords.ts` - Special forms (def, defn/defun, if, let, ns, import, require, etc.)
- `Context.ts` - Environment/scope management
- `Namespace.ts` - Namespace management and Node.js module integration
- `hc-lisp.ts` - Main interface
- `hc-runner.ts` - Command-line runner for executing HC-Lisp files
- `repl.ts` - Interactive Read-Eval-Print Loop

## Project Goals

**Primary Objective**: Understanding how a Lisp interpreter works from the ground up.

This project serves as:
- A hands-on exploration of interpreter design and implementation
- A practical study of functional programming language concepts  
- An educational resource for learning about lexical analysis, parsing, and evaluation
- A foundation for experimenting with language features and design decisions

**Educational Focus**: Every component is implemented to be readable and understandable, prioritizing clarity over performance optimization.

## License

MIT License
