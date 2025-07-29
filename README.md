# HC-Lisp

A Lisp dialect implementation in TypeScript, inspired by Clojure and Peter Norvig's Lispy project.

![HC LISP](https://i.ibb.co/rchyKBy/hc-lisp-example.gif)

## Features

HC-Lisp is a functional programming language that supports:

- **Basic data types**: numbers, strings, booleans, nil, keywords, symbols
- **Data structures**: lists and vectors
- **Functions**: function definition with `defn` and anonymous functions with `fn`
- **Control flow**: `if`, `let`, `loop`/`recur` for tail recursion
- **Mathematical operations**: +, -, *, /, comparisons
- **List operations**: `first`, `rest`, `count`, `map`, `reduce`, `range`
- **Predicates**: `even?`, `nil?`, `empty?`
- **I/O**: `println`, `print`

## Installation and Execution

```bash
# Install dependencies
npm install

# Start the REPL
npm start

# Run all tests
npm test

# Run basic tests
npm run test:basic

# Run advanced tests
npm run test:advanced

# Execute a .hc file
npm run run-hc <file.hc>
```

## VS Code Configuration

The project includes configurations for syntax highlighting of `.hc` files:

1. The "Lisp" extension will be installed automatically
2. `.hc` files are associated with the Lisp language
3. Indentation and colors are pre-configured

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

- `tests/basic-test.hc` - Basic functionality tests
- `tests/pi-test.hc` - Pi calculation
- `tests/sqrt-test.hc` - Square root calculation
- `tests/first-element-test.hc` - First element function test
- `tests/basic-tests.ts` - Basic unit tests in TypeScript
- `tests/advanced-tests.ts` - Advanced tests in TypeScript

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

## Target

Understanding how a Lisp works.

## License

MIT License
