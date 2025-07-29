;; ===========================================
;; HC-LISP - Complex Syntax Highlighting Example
;; ===========================================

;; This file demonstrates various language elements
;; that should have different colors in the editor

;; -------------------------------------------
;; 1. COMMENTS
;; -------------------------------------------
;; Single-line comments start with ;;
;; They should appear in a lighter color (green/gray)

;; -------------------------------------------
;; 2. FUNCTION DEFINITIONS
;; -------------------------------------------

(defn fibonacci
  "Calculates the nth Fibonacci number using recursion"
  [n]
  (if (<= n 1)
    n
    (+ (fibonacci (- n 1))
       (fibonacci (- n 2)))))

(defn factorial
  "Calculates the factorial of a number"
  [n]
  (loop [i n acc 1]
    (if (<= i 1)
      acc
      (recur (- i 1) (* acc i)))))

;; -------------------------------------------
;; 3. DATA TYPES
;; -------------------------------------------

;; Numbers (should appear in blue)
123
-456
78.90
1e-10
3.14159

;; Strings (should appear in red/orange)
"Hello, world!"
"This is a string with spaces"
"String with 'single quotes' inside"

;; Booleans (should have special color)
true
false

;; Nil (should have special color)
nil

;; Keywords (should appear in purple/blue)
:name
:age
:active
:user-type

;; Symbols (default color)
x
y
counter
result

;; -------------------------------------------
;; 4. DATA STRUCTURES
;; -------------------------------------------

;; Lists (parentheses should have different colors by level)
(list 1 2 3 4 5)
'(a b c d e)

;; Vectors (brackets should have different colors)
[1 2 3 4 5]
[:a :b :c]
["string1" "string2" "string3"]

;; -------------------------------------------
;; 5. OPERATIONS AND BUILT-IN FUNCTIONS
;; -------------------------------------------

;; Mathematical operations
(+ 1 2 3 4 5)
(- 100 25)
(* 2 3 4)
(/ 12 3)

;; Comparisons
(= 3 3)
(< 5 10)
(> 15 10)
(<= 5 5)
(>= 10 9)

;; List operations
(first [1 2 3])
(rest [1 2 3])
(count [1 2 3 4])
(map (fn [x] (* x 2)) [1 2 3 4])
(reduce + 0 [1 2 3 4 5])

;; -------------------------------------------
;; 6. CONTROL STRUCTURES
;; -------------------------------------------

;; If statements
(if (> 5 3)
  "greater"
  "less or equal")

;; Let bindings
(let [x 10
      y 20
      sum (+ x y)]
  (println "The sum is:" sum))

;; Loop with recur
(loop [i 0
       result []]
  (if (< i 5)
    (recur (+ i 1) (conj result i))
    result))

;; -------------------------------------------
;; 7. ANONYMOUS FUNCTIONS
;; -------------------------------------------

;; Simple lambda function
(fn [x] (* x x))

;; Lambda function with multiple parameters
(fn [a b c] (+ a b c))

;; Anonymous function application
((fn [x y] (+ x y)) 10 20)

;; -------------------------------------------
;; 8. COMPLEX EXAMPLE - QUICKSORT
;; -------------------------------------------

(defn quicksort
  "Implementation of the quicksort algorithm"
  [list]
  (if (empty? list)
    []
    (let [pivot (first list)
          rest (rest list)
          smaller (filter (fn [x] (< x pivot)) rest)
          larger (filter (fn [x] (>= x pivot)) rest)]
      (concat (quicksort smaller)
              [pivot]
              (quicksort larger)))))

;; -------------------------------------------
;; 9. TESTS AND DEMONSTRATIONS
;; -------------------------------------------

;; Fibonacci test
(println "Fibonacci(10):" (fibonacci 10))

;; Factorial test
(println "Factorial(5):" (factorial 5))

;; Quicksort test
(println "Sorting:" (quicksort [3 1 4 1 5 9 2 6 5]))

;; Example using keywords and maps (if implemented)
(def person {:name "John" :age 30 :active true})

;; -------------------------------------------
;; 10. NESTED PARENTHESES (colorization test)
;; -------------------------------------------

(defn nested-example []
  (let [result (+ (* 2 3) 
                  (- 10 5)
                  (/ 20 4))]
    (if (> result 10)
      (do
        (println "Result greater than 10")
        (map (fn [x] 
               (let [square (* x x)]
                 (if (even? square)
                   (+ square 1)
                   square)))
             (range 1 6)))
      (println "Result less than or equal to 10"))))

;; ===========================================
;; END OF DEMONSTRATION FILE
;; ===========================================
