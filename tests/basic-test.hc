;; Teste básico de aritmética
(println "=== Testes Básicos ===")

;; Teste de soma
(println "Teste soma: (+ 1 2 3) =>" (+ 1 2 3))

;; Teste de subtração
(println "Teste subtração: (- 10 3) =>" (- 10 3))

;; Teste de multiplicação
(println "Teste multiplicação: (* 2 3 4) =>" (* 2 3 4))

;; Teste de divisão
(println "Teste divisão: (/ 12 3) =>" (/ 12 3))

;; Teste de comparação
(println "Teste menor que: (< 3 5) =>" (< 3 5))
(println "Teste maior que: (> 5 3) =>" (> 5 3))
(println "Teste igualdade: (= 3 3) =>" (= 3 3))

;; Teste de listas
(println "Primeiro elemento [1 2 3]: (first [1 2 3]) =>" (first [1 2 3]))
(println "Contar elementos [1 2 3 4]: (count [1 2 3 4]) =>" (count [1 2 3 4]))

;; Teste de predicados
(println "4 é par?: (even? 4) =>" (even? 4))
(println "3 é par?: (even? 3) =>" (even? 3))

;; Teste de definição de variável
(def x 42)
(println "Variável x definida como 42: x =>" x)

;; Teste de if
(println "If true: (if true 1 2) =>" (if true 1 2))
(println "If false: (if false 1 2) =>" (if false 1 2))

;; Teste de let
(println "Let binding: (let [a 10 b 20] (+ a b)) =>" (let [a 10 b 20] (+ a b)))

;; Teste de definição de função
(defn quadrado [x] (* x x))
(println "Função quadrado de 5: (quadrado 5) =>" (quadrado 5))

;; Teste de range
(println "Range 5 tem quantos elementos?: (count (range 5)) =>" (count (range 5)))

(println "=== Fim dos Testes Básicos ===")
