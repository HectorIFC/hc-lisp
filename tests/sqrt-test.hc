;; Teste de cálculo de raiz quadrada usando método de Newton-Raphson
(println "=== Teste de Raiz Quadrada ===")

(defn sqrt
  "Calcula a raiz quadrada de x usando o método de Newton-Raphson"
  [x]
  (let [epsilon 1e-10]
    (loop [guess x]
      (let [next (/ (+ guess (/ x guess)) 2)]
        (if (< (Math/abs (- guess next)) epsilon)
          next
          (recur next))))))

;; Exemplos de uso
(println "Raiz quadrada de 9:" (sqrt 9))
(println "Raiz quadrada de 2:" (sqrt 2))
(println "Raiz quadrada de 0.25:" (sqrt 0.25))
(println "Raiz quadrada de 16:" (sqrt 16))
(println "Raiz quadrada de 100:" (sqrt 100))

;; Comparação com valores conhecidos
(println "Raiz de 2 (real): 1.4142135623730951")
(println "Raiz de 0.25 (real): 0.5")

(println "=== Fim do Teste de Raiz Quadrada ===")
