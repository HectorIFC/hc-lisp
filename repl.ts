import HcLisp from "./hc-lisp"

console.log(HcLisp.interpret(HcLisp.parse("(add 1 1 2)"), undefined));
