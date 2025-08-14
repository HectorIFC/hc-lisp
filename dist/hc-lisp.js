"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Parse_1 = require("./Parse");
const Interpret_1 = require("./Interpret");
const Library_1 = require("./Library");
const Namespace_1 = require("./Namespace");
const fs = __importStar(require("fs"));
class HCLisp {
    constructor() {
        this.globalEnv = (0, Library_1.createGlobalEnvironment)();
        this.nsManager = new Namespace_1.NamespaceManager(this.globalEnv);
    }
    parse(input) {
        return (0, Parse_1.parse)(input);
    }
    interpret(expr, env) {
        return (0, Interpret_1.interpret)(expr, env || this.globalEnv, this.nsManager);
    }
    getGlobalEnvironment() {
        return this.globalEnv;
    }
    eval(input) {
        const cleanInput = input.trim();
        if (!cleanInput) {
            return { type: 'nil', value: null };
        }
        const expressions = this.splitExpressions(cleanInput);
        let lastResult = { type: 'nil', value: null };
        for (const expr of expressions) {
            if (expr.trim()) {
                const ast = this.parse(expr);
                lastResult = this.interpret(ast);
            }
        }
        return lastResult;
    }
    evalFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            return this.evalFileContentInternal(content);
        }
        catch (error) {
            throw new Error(`Error reading file ${filePath}: ${error.message}`);
        }
    }
    loadRequiredNamespaces(content) {
        const nsMatch = content.match(/\(ns\s+\S+\s*\(\s*:require\s+\[([\s\S]*?)\]\s*\)/);
        if (nsMatch) {
            const requiresString = nsMatch[1];
            const requiredNamespaces = requiresString.split(/\s+/).filter(ns => ns.trim());
            for (const ns of requiredNamespaces) {
                const nsInfo = this.nsManager.getNamespace(ns);
                if (nsInfo) {
                    const contentValue = nsInfo.environment.get('__deferred_content__');
                    if (contentValue && contentValue.type === 'string') {
                        const originalNs = this.nsManager.getCurrentNamespace().name;
                        this.nsManager.setCurrentNamespace(ns);
                        try {
                            this.evalFileContentInternal(contentValue.value);
                            nsInfo.environment.define('__deferred_content__', { type: 'nil', value: null });
                            nsInfo.environment.define('__deferred_filepath__', { type: 'nil', value: null });
                        }
                        catch (error) {
                            console.error(`Error evaluating namespace '${ns}':`, error);
                        }
                        finally {
                            if (this.nsManager.getNamespace(originalNs)) {
                                this.nsManager.setCurrentNamespace(originalNs);
                            }
                        }
                    }
                }
            }
        }
    }
    evalFileContent(content) {
        return this.evalFileContentInternal(content);
    }
    evalFileContentInternal(content) {
        const lines = content.split('\n');
        let currentExpr = '';
        let parenCount = 0;
        let inString = false;
        let lastResult = { type: 'nil', value: null };
        let nsProcessed = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith(';;')) {
                continue;
            }
            currentExpr += (currentExpr ? ' ' : '') + trimmedLine;
            for (let i = 0; i < trimmedLine.length; i++) {
                const char = trimmedLine[i];
                if (char === '"' && (i === 0 || trimmedLine[i - 1] !== '\\')) {
                    inString = !inString;
                }
                if (!inString) {
                    if (char === '(' || char === '[') {
                        parenCount++;
                    }
                    if (char === ')' || char === ']') {
                        parenCount--;
                    }
                }
            }
            if (parenCount === 0 && currentExpr.trim()) {
                try {
                    const ast = this.parse(currentExpr.trim());
                    const currentNs = this.nsManager.getCurrentNamespace();
                    lastResult = (0, Interpret_1.interpret)(ast, currentNs.environment, this.nsManager);
                    if (!nsProcessed && currentExpr.trim().includes('(ns ') && currentExpr.trim().includes(':require')) {
                        this.loadRequiredNamespaces(currentExpr.trim());
                        nsProcessed = true;
                    }
                }
                catch (error) {
                    throw new Error(`Error evaluating expression "${currentExpr.trim()}": ${error.message}`);
                }
                currentExpr = '';
            }
        }
        if (currentExpr.trim()) {
            try {
                const ast = this.parse(currentExpr.trim());
                lastResult = this.interpret(ast);
            }
            catch (error) {
                throw new Error(`Error evaluating expression "${currentExpr.trim()}": ${error.message}`);
            }
        }
        return lastResult;
    }
    splitExpressions(input) {
        const expressions = [];
        let currentExpr = '';
        let parenCount = 0;
        let inString = false;
        let i = 0;
        while (i < input.length) {
            const char = input[i];
            if (char === '"' && (i === 0 || input[i - 1] !== '\\')) {
                inString = !inString;
            }
            if (!inString) {
                if (char === '(' || char === '[') {
                    parenCount++;
                    currentExpr += char;
                }
                else if (char === ')' || char === ']') {
                    parenCount--;
                    currentExpr += char;
                    if (parenCount === 0 && currentExpr.trim()) {
                        expressions.push(currentExpr.trim());
                        currentExpr = '';
                        while (i + 1 < input.length && /\s/.test(input[i + 1])) {
                            i++;
                        }
                    }
                }
                else {
                    currentExpr += char;
                }
            }
            else {
                currentExpr += char;
            }
            i++;
        }
        if (currentExpr.trim()) {
            expressions.push(currentExpr.trim());
        }
        return expressions;
    }
    resetContext() {
        this.globalEnv = (0, Library_1.createGlobalEnvironment)();
        this.nsManager = new Namespace_1.NamespaceManager(this.globalEnv);
    }
    formatOutput(value) {
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
exports.default = {
    parse: (input) => hcLisp.parse(input),
    interpret: (expr, env) => hcLisp.interpret(expr, env),
    eval: (input) => hcLisp.eval(input),
    evalFile: (filePath) => hcLisp.evalFile(filePath),
    formatOutput: (value) => hcLisp.formatOutput(value),
    resetContext: () => hcLisp.resetContext(),
    getGlobalEnvironment: () => hcLisp.getGlobalEnvironment()
};
//# sourceMappingURL=hc-lisp.js.map