;; Teste de obtenção do primeiro elemento de listas
(println "=== Teste de Primeiro Elemento ===")

(defn primeiro-elemento
  "Retorna o primeiro elemento de uma lista qualquer"
  [lista]
  (first lista))

;; Exemplos de uso
(println "Primeiro elemento de [1 2 3 4]:")
(println (primeiro-elemento [1 2 3 4]))     ;; => 1

(println "Primeiro elemento de [:a :b :c]:")
(println (primeiro-elemento [:a :b :c]))   ;; => :a

(println "Primeiro elemento de lista vazia []:")
(println (primeiro-elemento []))           ;; => nil

(println "Primeiro elemento de [\"hello\" \"world\"]:")
(println (primeiro-elemento ["hello" "world"]))

(println "Primeiro elemento de [true false]:")
(println (primeiro-elemento [true false]))

;; Teste com diferentes tipos de sequências
(println "Primeiro elemento usando first diretamente:")
(println "first [10 20 30] =>" (first [10 20 30]))
(println "first [] =>" (first []))

(println "=== Fim do Teste de Primeiro Elemento ===")
