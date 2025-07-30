;; Square root calculation test using Newton-Raphson method
(println "=== Square Root Test ===")

(defn sqrt
  "Calculates the square root of x using the Newton-Raphson method"
  [x]
  (let [epsilon 1e-10]
    (loop [guess x]
      (let [next (/ (+ guess (/ x guess)) 2)]
        (if (< (Math/abs (- guess next)) epsilon)
          next
          (recur next))))))

;; Usage examples
(println "Square root of 9:" (sqrt 9))
(println "Square root of 2:" (sqrt 2))
(println "Square root of 0.25:" (sqrt 0.25))
(println "Square root of 16:" (sqrt 16))
(println "Square root of 100:" (sqrt 100))

;; Comparison with known values
(println "Square root of 2 (actual): 1.4142135623730951")
(println "Square root of 0.25 (actual): 0.5")

(println "=== End of Square Root Test ===")
