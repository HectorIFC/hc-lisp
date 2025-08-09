import { parse } from './src/Parse';
import { interpret } from './src/Interpret';
import { HCValue } from './src/Categorize';
import { Environment } from './src/Context';
import { createGlobalEnvironment } from './src/Library';
import { NamespaceManager } from './src/Namespace';
import * as fs from 'fs';

class HCLisp {
    private globalEnv: Environment;
    private nsManager: NamespaceManager;

    constructor() {
        this.globalEnv = createGlobalEnvironment();
        this.nsManager = new NamespaceManager();
    }

    parse(input: string): HCValue {
        return parse(input);
    }

    interpret(expr: HCValue, env?: Environment): HCValue {
        return interpret(expr, env || this.globalEnv, this.nsManager);
    }

    eval(input: string): HCValue {
        // Handle multiline input with multiple expressions
        const cleanInput = input.trim();
        if (!cleanInput) {
            return { type: 'nil', value: null };
        }

        // Split into individual expressions by tracking parentheses
        const expressions = this.splitExpressions(cleanInput);
        let lastResult: HCValue = { type: 'nil', value: null };

        for (const expr of expressions) {
            if (expr.trim()) {
                const ast = this.parse(expr);
                lastResult = this.interpret(ast);
            }
        }

        return lastResult;
    }

    evalFile(filePath: string): HCValue {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            return this.evalFileContent(content);
        } catch (error) {
            throw new Error(`Error reading file ${filePath}: ${(error as Error).message}`);
        }
    }

    private evalFileContent(content: string): HCValue {
        // Better expression parsing that handles multi-line expressions and comments
        const lines = content.split('\n');
        let currentExpr = '';
        let parenCount = 0;
        let inString = false;
        let lastResult: HCValue = { type: 'nil', value: null };

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith(';;')) {
                continue;
            }

            // Add line to current expression
            currentExpr += (currentExpr ? ' ' : '') + trimmedLine;

            // Count parentheses to determine complete expressions
            for (let i = 0; i < trimmedLine.length; i++) {
                const char = trimmedLine[i];

                // Handle string boundaries
                if (char === '"' && (i === 0 || trimmedLine[i - 1] !== '\\')) {
                    inString = !inString;
                }

                // Only count parentheses outside of strings
                if (!inString) {
                    if (char === '(' || char === '[') { parenCount++; }
                    if (char === ')' || char === ']') { parenCount--; }
                }
            }

            // If we have a complete expression, evaluate it
            if (parenCount === 0 && currentExpr.trim()) {
                try {
                    const ast = this.parse(currentExpr.trim());
                    lastResult = this.interpret(ast);
                } catch (error) {
                    throw new Error(`Error evaluating expression "${currentExpr.trim()}": ${(error as Error).message}`);
                }
                currentExpr = '';
            }
        }

        // Handle any remaining expression
        if (currentExpr.trim()) {
            try {
                const ast = this.parse(currentExpr.trim());
                lastResult = this.interpret(ast);
            } catch (error) {
                throw new Error(`Error evaluating expression "${currentExpr.trim()}": ${(error as Error).message}`);
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
            if (char === '"' && (i === 0 || input[i - 1] !== '\\')) {
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
        this.nsManager = new NamespaceManager();
    }

    // Helper method to format output for display
    formatOutput(value: HCValue): string {
        switch (value.type) {
            case 'nil':
                return 'nil';
            case 'string':
                return `"${value.value}"`;
            case 'keyword':
                return `:${value.value}`;
            case 'boolean':
            case 'number':
                return String(value.value);
            case 'symbol':
                return value.value;
            case 'list':
                const listItems = value.value.map(item => this.formatOutput(item)).join(' ');
                return `(${listItems})`;
            case 'vector':
                const vectorItems = value.value.map(item => this.formatOutput(item)).join(' ');
                return `[${vectorItems}]`;
            case 'function':
                return '<function>';
            case 'closure':
                return '<closure>';
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
    evalFile: (filePath: string) => hcLisp.evalFile(filePath),
    formatOutput: (value: HCValue) => hcLisp.formatOutput(value),
    resetContext: () => hcLisp.resetContext()
};
