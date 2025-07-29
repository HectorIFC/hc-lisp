import { parse } from "./src/Parse";
import { interpret } from "./src/Interpret";
import { HCValue } from "./src/Categorize";
import { Environment } from "./src/Context";
import { createGlobalEnvironment } from "./src/Library";

class HCLisp {
    private globalEnv: Environment;

    constructor() {
        this.globalEnv = createGlobalEnvironment();
    }

    parse(input: string): HCValue {
        return parse(input);
    }

    interpret(expr: HCValue, env?: Environment): HCValue {
        return interpret(expr, env || this.globalEnv);
    }

    eval(input: string): HCValue {
        const ast = this.parse(input);
        return this.interpret(ast);
    }

    // Helper method to format output for display
    formatOutput(value: HCValue): string {
        switch (value.type) {
            case "nil":
                return "nil";
            case "string":
                return `"${value.value}"`;
            case "keyword":
                return `:${value.value}`;
            case "boolean":
            case "number":
                return String(value.value);
            case "symbol":
                return value.value;
            case "list":
                const listItems = value.value.map(item => this.formatOutput(item)).join(" ");
                return `(${listItems})`;
            case "vector":
                const vectorItems = value.value.map(item => this.formatOutput(item)).join(" ");
                return `[${vectorItems}]`;
            case "function":
                return "<function>";
            case "closure":
                return "<closure>";
            default:
                return String(value);
        }
    }
}

const hcLisp = new HCLisp();

export default {
    parse: (input: string) => hcLisp.parse(input),
    interpret: (expr: HCValue, env?: Environment) => hcLisp.interpret(expr, env),
    eval: (input: string) => hcLisp.eval(input),
    formatOutput: (value: HCValue) => hcLisp.formatOutput(value)
};
