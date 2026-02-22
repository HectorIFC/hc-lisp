<img src="docs/assets/logo/hclisp-icon-light.svg" alt="HCLisp Icon" width="64">

# HC-Lisp 🦝

[![npm version](https://img.shields.io/npm/v/hc-lisp.svg)](https://www.npmjs.com/package/hc-lisp)
[![npm downloads](https://img.shields.io/npm/dm/hc-lisp.svg)](https://www.npmjs.com/package/hc-lisp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/node/v/hc-lisp.svg)](https://www.npmjs.com/package/hc-lisp)
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
- **Special Functions**: `principles` (display development principles), `family` (show project family story)
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

## Installation

### Global Installation (Recommended)
```bash
# Install globally to use hclisp from anywhere
npm install -g hc-lisp
```

### Local Installation
```bash
# Install locally in a project
npm install hc-lisp
```

## Execution

### After Global Installation
```bash
# Start REPL from anywhere
hclisp 
# or
hc-lisp

# Run a file
hclisp script.hclisp

# Evaluate expression
hclisp -e "(+ 1 2 3)"

# Show help
hclisp --help
```

### After Local Installation
```bash
# Use with npx
npx hclisp

# Or with npm scripts in package.json
npm run hclisp
```

## Install from Github
```bash
# Clone repo
git clone git@github.com:HectorIFC/hc-lisp.git

# Enter into diretory
cd hc-lisp

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
  (:import
    (node.crypto randomUUID)
    (node.fs existsSync)
    (node.path join)))

;; Use imported modules
(crypto/randomUUID)              ; => Generate UUID
(fs/existsSync "package.json")   ; => Check if file exists
(path/join "src" "main.ts")      ; => Join path segments

;; Built-in string functions
(str/upper-case "hello world")   ; => "HELLO WORLD"
(str/lower-case "HELLO")         ; => "hello"

;; Built-in JSON functions
(json/stringify {:name "HC-Lisp" :version "1.0"})  ; => JSON string
(json/parse "{"key": "value"}")                 ; => Parse JSON

;; Process utilities
(process/cwd)                    ; => Current working directory
(process/platform)               ; => Operating system platform
```

### Special HC-Lisp Functions
```lisp
;; Display HC-Lisp development principles
(principles)
;; Shows the 20 principles that guide HC-Lisp development

;; Display the HC-Lisp family story ❤️
(family)
;; Shows the heartwarming story behind HC-Lisp
```

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

## License
[MIT License](./LICENSE)
