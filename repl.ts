import HcLisp from "./hc-lisp"
import repl from "repl"

// mais dois testesdfsfsdfsdfsdfsdfpoawpqapeqpwppqwpwqpqwpqwpqwp

repl.start({
    prompt: "> ",
    eval: (cmd, context, filename, callback) => {
        const result = HcLisp.interpret(HcLisp.parse(cmd), undefined)
        callback(null, result)
    }
})

