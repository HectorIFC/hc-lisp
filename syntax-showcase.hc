;; ===========================================
;; HC-LISP - Exemplo Complexo de Syntax Highlighting
;; ===========================================

;; Este arquivo demonstra vários elementos da linguagem
;; que devem ter cores diferentes no editor

;; -------------------------------------------
;; 1. COMENTÁRIOS
;; -------------------------------------------
;; Comentários de linha única começam com ;;
;; Eles devem aparecer em uma cor mais clara (verde/cinza)

;; -------------------------------------------
;; 2. DEFINIÇÕES DE FUNÇÕES
;; -------------------------------------------

(defn fibonacci
  "Calcula o n-ésimo número de Fibonacci usando recursão"
  [n]
  (if (<= n 1)
    n
    (+ (fibonacci (- n 1))
       (fibonacci (- n 2)))))

(defn fatorial
  "Calcula o fatorial de um número"
  [n]
  (loop [i n acc 1]
    (if (<= i 1)
      acc
      (recur (- i 1) (* acc i)))))

;; -------------------------------------------
;; 3. TIPOS DE DADOS
;; -------------------------------------------

;; Números (devem aparecer em azul)
123
-456
78.90
1e-10
3.14159

;; Strings (devem aparecer em vermelho/laranja)
"Olá, mundo!"
"Esta é uma string com espaços"
"String com 'aspas simples' internas"

;; Booleans (devem ter cor especial)
true
false

;; Nil (deve ter cor especial)
nil

;; Keywords (devem aparecer em roxo/azul)
:nome
:idade
:ativo
:tipo-usuario

;; Símbolos (cor padrão)
x
y
contador
resultado

;; -------------------------------------------
;; 4. ESTRUTURAS DE DADOS
;; -------------------------------------------

;; Listas (parênteses devem ter cores diferentes por nível)
(list 1 2 3 4 5)
'(a b c d e)

;; Vetores (colchetes devem ter cores diferentes)
[1 2 3 4 5]
[:a :b :c]
["string1" "string2" "string3"]

;; -------------------------------------------
;; 5. OPERAÇÕES E FUNÇÕES BUILT-IN
;; -------------------------------------------

;; Operações matemáticas
(+ 1 2 3 4 5)
(- 100 25)
(* 2 3 4)
(/ 12 3)

;; Comparações
(= 3 3)
(< 5 10)
(> 15 10)
(<= 5 5)
(>= 10 9)

;; Operações em listas
(first [1 2 3])
(rest [1 2 3])
(count [1 2 3 4])
(map (fn [x] (* x 2)) [1 2 3 4])
(reduce + 0 [1 2 3 4 5])

;; -------------------------------------------
;; 6. ESTRUTURAS DE CONTROLE
;; -------------------------------------------

;; If statements
(if (> 5 3)
  "maior"
  "menor ou igual")

;; Let bindings
(let [x 10
      y 20
      soma (+ x y)]
  (println "A soma é:" soma))

;; Loop com recur
(loop [i 0
       resultado []]
  (if (< i 5)
    (recur (+ i 1) (conj resultado i))
    resultado))

;; -------------------------------------------
;; 7. FUNÇÕES ANÔNIMAS
;; -------------------------------------------

;; Função lambda simples
(fn [x] (* x x))

;; Função lambda com múltiplos parâmetros
(fn [a b c] (+ a b c))

;; Aplicação de função anônima
((fn [x y] (+ x y)) 10 20)

;; -------------------------------------------
;; 8. EXEMPLO COMPLEXO - QUICKSORT
;; -------------------------------------------

(defn quicksort
  "Implementação do algoritmo quicksort"
  [lista]
  (if (empty? lista)
    []
    (let [pivot (first lista)
          resto (rest lista)
          menores (filter (fn [x] (< x pivot)) resto)
          maiores (filter (fn [x] (>= x pivot)) resto)]
      (concat (quicksort menores)
              [pivot]
              (quicksort maiores)))))

;; -------------------------------------------
;; 9. TESTES E DEMONSTRAÇÕES
;; -------------------------------------------

;; Teste do fibonacci
(println "Fibonacci(10):" (fibonacci 10))

;; Teste do fatorial
(println "Fatorial(5):" (fatorial 5))

;; Teste do quicksort
(println "Ordenação:" (quicksort [3 1 4 1 5 9 2 6 5]))

;; Exemplo de uso de keywords e maps (se implementado)
(def pessoa {:nome "João" :idade 30 :ativo true})

;; -------------------------------------------
;; 10. PARÊNTESES ANINHADOS (teste de colorização)
;; -------------------------------------------

(defn exemplo-aninhado []
  (let [resultado (+ (* 2 3) 
                     (- 10 5)
                     (/ 20 4))]
    (if (> resultado 10)
      (do
        (println "Resultado maior que 10")
        (map (fn [x] 
               (let [quadrado (* x x)]
                 (if (even? quadrado)
                   (+ quadrado 1)
                   quadrado)))
             (range 1 6)))
      (println "Resultado menor ou igual a 10"))))

;; ===========================================
;; FIM DO ARQUIVO DE DEMONSTRAÇÃO
;; ===========================================
