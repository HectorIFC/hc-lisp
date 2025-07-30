;; Pi calculation test using Leibniz series
(println "=== Pi Calculation Test ===")

(defn leibniz-pi
  "Calculates a pi approximation using the Leibniz series"
  [n]
  (let [terms (map (fn [k] (/ (if (even? k) 1.0 -1.0) (+ (* 2 k) 1)))
                   (range n))]
    (* 4 (reduce + 0 terms))))

;; Usage examples with different numbers of terms
(println "Pi approximated with 100 terms:")
(println (leibniz-pi 100))

(println "Pi approximated with 1000 terms:")
(println (leibniz-pi 1000))

(println "Pi approximated with 10000 terms:")
(println (leibniz-pi 10000))

(println "Actual Pi (for comparison): 3.141592653589793")

(println "=== End of Pi Test ===")
