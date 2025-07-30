# HC-Lisp

A modern Lisp dialect implementation in TypeScript, inspired by Clojure and Peter Norvig's Lispy project.

> ⚠️ **Development Status**: HC-Lisp is currently in active development and is **not ready for production use**. This is an experimental project intended for educational purposes and learning how Lisp interpreters work. APIs may change, features may be incomplete, and there may be bugs. Use at your own discretion for learning and experimentation.

🌐 **[Site](https://hectorifc.github.io/hc-lisp)** | 📚 **[Documentation](https://hectorifc.github.io/hc-lisp)** | 🚀 **[Try Examples](https://hectorifc.github.io/hc-lisp#examples)**

## Features

HC-Lisp is a functional programming language that supports:

- **Basic data types**: numbers, strings, booleans, nil, keywords, symbols
- **Data structures**: lists and vectors
- **Functions**: function definition with `defn` and anonymous functions with `fn`
- **Control flow**: `if`, `let`, `loop`/`recur` for tail recursion
- **Mathematical operations**: +, -, *, /, comparisons, sqrt
- **List operations**: `first`, `rest`, `count`, `map`, `reduce`, `range`
- **Predicates**: `even?`, `nil?`, `empty?`
- **I/O**: `println`, `print`

## Quick Links

- 🌐 **[Website & Documentation](https://hectorifc.github.io/hc-lisp)**
- 📖 **[API Reference](https://hectorifc.github.io/hc-lisp#docs)**
- 🎯 **[Live Examples](https://hectorifc.github.io/hc-lisp#examples)**
- 🧪 **[Testing Info](https://hectorifc.github.io/hc-lisp#testing)**

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

# Run legacy test suite
npm run test:legacy

# Execute a .hclisp file
npm run hclisp <file.hclisp>
```

## Testing

HC-Lisp uses **Jest** as the modern test framework with complete integration. The test suite includes:

- **45 test cases** covering all language features  
- **Unit tests** for TypeScript modules (Jest)
- **Integration tests** for .hclisp files (Jest)
- **Type-safe tests** written in TypeScript
- **Error handling validation** with proper exception testing
- **Console output mocking** for I/O testing
- **Multiline expression support** in the language core

All tests are unified under Jest - no legacy test runners needed!

For detailed testing information, see [TESTING.md](TESTING.md)

## Project Status

HC-Lisp is an **experimental educational project** currently in active development. 

### Current State
- ✅ Core language features implemented and working
- ✅ Comprehensive test suite (45 tests) with 100% pass rate
- ✅ REPL interface for interactive development
- ✅ File execution support (.hclisp files)
- ✅ Modern development tooling (TypeScript, Jest, etc.)

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

- `tests/basic-test.hclisp` - Basic functionality tests in HC-Lisp
- `tests/pi-test.hclisp` - Pi calculation demonstration
- `tests/sqrt-test.hclisp` - Square root calculation tests
- `tests/first-element-test.hclisp` - First element function tests
- `tests/hc-lisp.test.ts` - Basic unit tests (Jest/TypeScript)
- `tests/hc-lisp-advanced.test.ts` - Advanced unit tests (Jest/TypeScript)  
- `tests/hc-files.test.ts` - Integration tests for .hclisp files (Jest/TypeScript)

## Running Specific Tests

```bash
# Pi test
npm run run-hc tests/pi-test.hc

# Square root test
npm run run-hc tests/sqrt-test.hc

# First element test
npm run run-hc tests/first-element-test.hc

# Complete basic test
npm run run-hc tests/basic-test.hc
```

## Interactive REPL

Run `npm start` to start the REPL:

```
Welcome to HC-Lisp REPL!
A Lisp dialect inspired by Clojure
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
- `Library.ts` - Basic function library
- `Keywords.ts` - Special forms (def, defn, if, let, etc.)
- `Context.ts` - Environment/scope management
- `hc-lisp.ts` - Main interface

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
