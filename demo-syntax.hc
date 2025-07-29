;; Este é um arquivo de demonstração da linguagem HC-Lisp
;; Ele deve ter syntax highlighting de Lisp aplicado

;; Definição de função
(defn saudacao
  "Função que retorna uma saudação"
  [nome]
  (str "Olá, " nome "!"))

;; Chamada da função
(println (saudacao "Mundo"))

;; Operações matemáticas
(+ 1 2 3 4 5)
(* 2 3 4)
(/ 10 2)

;; Estruturas de controle
(if true
  "verdadeiro"
  "falso")

;; Let binding
(let [x 10
      y 20]
  (+ x y))

;; Loop recursivo
(loop [contador 0
       acumulador 0]
  (if (< contador 10)
    (recur (+ contador 1) (+ acumulador contador))
    acumulador))

;; Função de alta ordem
(map (fn [x] (* x x)) [1 2 3 4 5])

;; Keywords e símbolos
:keyword
'simbolo

;; Strings e números
"Esta é uma string"
123
45.67
1e-10

;; Comentários deveriam aparecer em cor diferente
