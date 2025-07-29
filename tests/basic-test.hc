;; Basic arithmetic test
(println "=== Basic Tests ===")

;; Addition test
(println "Addition test: (+ 1 2 3) =>" (+ 1 2 3))

;; Subtraction test
(println "Subtraction test: (- 10 3) =>" (- 10 3))

;; Multiplication test
(println "Multiplication test: (* 2 3 4) =>" (* 2 3 4))

;; Division test
(println "Division test: (/ 12 3) =>" (/ 12 3))

;; Comparison test
(println "Less than test: (< 3 5) =>" (< 3 5))
(println "Greater than test: (> 5 3) =>" (> 5 3))
(println "Equality test: (= 3 3) =>" (= 3 3))

;; List test
(println "First element [1 2 3]: (first [1 2 3]) =>" (first [1 2 3]))
(println "Count elements [1 2 3 4]: (count [1 2 3 4]) =>" (count [1 2 3 4]))

;; Predicate test
(println "Is 4 even?: (even? 4) =>" (even? 4))
(println "Is 3 even?: (even? 3) =>" (even? 3))

;; Variable definition test
(def x 42)
(println "Variable x defined as 42: x =>" x)

;; If test
(println "If true: (if true 1 2) =>" (if true 1 2))
(println "If false: (if false 1 2) =>" (if false 1 2))

;; Let test
(println "Let binding: (let [a 10 b 20] (+ a b)) =>" (let [a 10 b 20] (+ a b)))

;; Function definition test
(defn square [x] (* x x))
(println "Square function of 5: (square 5) =>" (square 5))

;; Range test
(println "How many elements in range 5?: (count (range 5)) =>" (count (range 5)))

(println "=== End of Basic Tests ===")
