;; Teste de cálculo de Pi usando série de Leibniz
(println "=== Teste de Cálculo de Pi ===")

(defn leibniz-pi
  "Calcula uma aproximação de pi usando a série de Leibniz"
  [n]
  (let [terms (map (fn [k] (/ (if (even? k) 1.0 -1.0) (+ (* 2 k) 1)))
                   (range n))]
    (* 4 (reduce + 0 terms))))

;; Exemplo de uso com diferentes números de termos
(println "Pi aproximado com 100 termos:")
(println (leibniz-pi 100))

(println "Pi aproximado com 1000 termos:")
(println (leibniz-pi 1000))

(println "Pi aproximado com 10000 termos:")
(println (leibniz-pi 10000))

(println "Pi real (para comparação): 3.141592653589793")

(println "=== Fim do Teste de Pi ===")
