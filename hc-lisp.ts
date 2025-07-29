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
        // Handle multiline input with multiple expressions
        const cleanInput = input.trim();
        if (!cleanInput) {
            return { type: "nil", value: null };
        }

        // Split into individual expressions by tracking parentheses
        const expressions = this.splitExpressions(cleanInput);
        let lastResult: HCValue = { type: "nil", value: null };
        
        for (const expr of expressions) {
            if (expr.trim()) {
                const ast = this.parse(expr);
                lastResult = this.interpret(ast);
            }
        }
        
        return lastResult;
    }

    private splitExpressions(input: string): string[] {
        const expressions: string[] = [];
        let currentExpr = '';
        let parenCount = 0;
        let inString = false;
        let i = 0;
        
        while (i < input.length) {
            const char = input[i];
            
            // Handle string boundaries
            if (char === '"' && (i === 0 || input[i-1] !== '\\')) {
                inString = !inString;
            }
            
            // Only count parentheses outside of strings
            if (!inString) {
                if (char === '(' || char === '[') {
                    parenCount++;
                    currentExpr += char;
                } else if (char === ')' || char === ']') {
                    parenCount--;
                    currentExpr += char;
                    
                    // If we have a complete expression, save it
                    if (parenCount === 0 && currentExpr.trim()) {
                        expressions.push(currentExpr.trim());
                        currentExpr = '';
                        
                        // Skip whitespace after complete expression
                        while (i + 1 < input.length && /\s/.test(input[i + 1])) {
                            i++;
                        }
                    }
                } else {
                    currentExpr += char;
                }
            } else {
                currentExpr += char;
            }
            
            i++;
        }
        
        // Handle any remaining expression
        if (currentExpr.trim()) {
            expressions.push(currentExpr.trim());
        }
        
        return expressions;
    }

    // Reset the global environment to its initial state
    resetContext(): void {
        this.globalEnv = createGlobalEnvironment();
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
    formatOutput: (value: HCValue) => hcLisp.formatOutput(value),
    resetContext: () => hcLisp.resetContext()
};
