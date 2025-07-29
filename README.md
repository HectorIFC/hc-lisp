# HC-Lisp

Uma implementação de um dialeto Lisp em TypeScript, inspirado em Clojure e no projeto Lispy de Peter Norvig.

## Características

HC-Lisp é uma linguagem de programação funcional que suporta:

- **Tipos de dados básicos**: números, strings, booleans, nil, keywords, símbolos
- **Estruturas de dados**: listas e vetores
- **Funções**: definição de funções com `defn` e funções anônimas com `fn`
- **Controle de fluxo**: `if`, `let`, `loop`/`recur` para recursão de cauda
- **Operações matemáticas**: +, -, *, /, comparações
- **Operações em listas**: `first`, `rest`, `count`, `map`, `reduce`, `range`
- **Predicados**: `even?`, `nil?`, `empty?`
- **I/O**: `println`, `print`

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar o REPL
npm start

# Executar todos os testes
npm test

# Executar testes básicos
npm run test:basic

# Executar testes avançados
npm run test:advanced

# Executar um arquivo .hc
npm run run-hc <arquivo.hc>
```

## Exemplos de Uso

### Operações Básicas
```lisp
;; Aritmética
(+ 1 2 3)        ; => 6
(* 2 3 4)        ; => 24
(/ 12 3)         ; => 4

;; Comparações
(< 3 5)          ; => true
(= 3 3)          ; => true

;; Listas
(first [1 2 3])  ; => 1
(count [1 2 3])  ; => 3
```

### Definição de Variáveis e Funções
```lisp
;; Variáveis
(def x 42)

;; Funções
(defn quadrado [x] (* x x))
(quadrado 5)     ; => 25

;; Funções com docstring
(defn soma
  "Soma dois números"
  [a b]
  (+ a b))
```

### Estruturas de Controle
```lisp
;; If
(if (> 5 3) "maior" "menor")  ; => "maior"

;; Let (binding local)
(let [x 10 y 20] (+ x y))     ; => 30

;; Loop com recursão de cauda
(loop [i 0 acc 1]
  (if (< i 5)
    (recur (+ i 1) (* acc i))
    acc))
```

## Testes Incluídos

### 1. Cálculo de Pi usando Série de Leibniz
```lisp
(defn leibniz-pi
  "Calcula uma aproximação de pi usando a série de Leibniz"
  [n]
  (let [terms (map (fn [k] (/ (if (even? k) 1.0 -1.0) (+ (* 2 k) 1)))
                   (range n))]
    (* 4 (reduce + 0 terms))))

(leibniz-pi 1000)  ; => aproximação de π
```

### 2. Raiz Quadrada usando Newton-Raphson
```lisp
(defn sqrt
  "Calcula a raiz quadrada de x usando o método de Newton-Raphson"
  [x]
  (let [epsilon 1e-10]
    (loop [guess x]
      (let [next (/ (+ guess (/ x guess)) 2)]
        (if (< (Math/abs (- guess next)) epsilon)
          next
          (recur next))))))

(sqrt 9)    ; => 3
(sqrt 2)    ; => 1.414213562373095
```

### 3. Primeiro Elemento de uma Lista
```lisp
(defn primeiro-elemento
  "Retorna o primeiro elemento de uma lista qualquer"
  [lista]
  (first lista))

(primeiro-elemento [1 2 3 4])     ; => 1
(primeiro-elemento [:a :b :c])    ; => :a
(primeiro-elemento [])            ; => nil
```

## Arquivos de Teste

- `tests/basic-test.hc` - Testes básicos de funcionalidade
- `tests/pi-test.hc` - Cálculo de Pi
- `tests/sqrt-test.hc` - Cálculo de raiz quadrada
- `tests/first-element-test.hc` - Teste da função primeiro elemento
- `tests/basic-tests.ts` - Testes unitários básicos em TypeScript
- `tests/advanced-tests.ts` - Testes avançados em TypeScript

## Executando Testes Específicos

```bash
# Teste de Pi
npm run run-hc tests/pi-test.hc

# Teste de raiz quadrada
npm run run-hc tests/sqrt-test.hc

# Teste de primeiro elemento
npm run run-hc tests/first-element-test.hc

# Teste básico completo
npm run run-hc tests/basic-test.hc
```

## REPL Interativo

Execute `npm start` para iniciar o REPL:

```
Welcome to HC-Lisp REPL!
A Lisp dialect.
Type (exit) or Ctrl+C to quit

hc-lisp> (+ 1 2 3)
6
hc-lisp> (defn dobro [x] (* x 2))
<closure>
hc-lisp> (dobro 21)
42
hc-lisp> (exit)
```

## Arquitetura

O projeto está estruturado em módulos:

- `Tokenizer.ts` - Análise léxica (tokenização)
- `Categorize.ts` - Classificação de tokens
- `Parenthesize.ts` - Análise sintática (parsing)
- `Interpret.ts` - Interpretador principal
- `Library.ts` - Biblioteca de funções básicas
- `Keywords.ts` - Formas especiais (def, defn, if, let, etc.)
- `Context.ts` - Gerenciamento de ambiente/escopo
- `hc-lisp.ts` - Interface principal

## Licença

MIT License
