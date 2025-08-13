import { parse } from './Parse';
import { interpret } from './Interpret';
import { HCValue } from './Categorize';
import { Environment } from './Context';
import { createGlobalEnvironment } from './Library';
import { NamespaceManager } from './Namespace';
import * as fs from 'fs';

class HCLisp {
  private globalEnv: Environment;
  private nsManager: NamespaceManager;

  constructor() {
    this.globalEnv = createGlobalEnvironment();
    this.nsManager = new NamespaceManager(this.globalEnv);
  }

  parse(input: string): HCValue {
    return parse(input);
  }

  interpret(expr: HCValue, env?: Environment): HCValue {
    return interpret(expr, env || this.globalEnv, this.nsManager);
  }

  getGlobalEnvironment(): Environment {
    return this.globalEnv;
  }

  eval(input: string): HCValue {
    const cleanInput = input.trim();
    if (!cleanInput) {
      return { type: 'nil', value: null };
    }

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
      return this.evalFileContentInternal(content);
    } catch (error) {
      throw new Error(`Error reading file ${filePath}: ${(error as Error).message}`);
    }
  }

  private loadRequiredNamespaces(content: string): void {
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
            } catch (error) {
              console.error(`Error evaluating namespace '${ns}':`, error);
            } finally {
              if (this.nsManager.getNamespace(originalNs)) {
                this.nsManager.setCurrentNamespace(originalNs);
              }
            }
          }
        }
      }
    }
  }

  public evalFileContent(content: string): HCValue {
    return this.evalFileContentInternal(content);
  }

  private evalFileContentInternal(content: string): HCValue {
    const lines = content.split('\n');
    let currentExpr = '';
    let parenCount = 0;
    let inString = false;
    let lastResult: HCValue = { type: 'nil', value: null };
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
          if (char === '(' || char === '[') { parenCount++; }
          if (char === ')' || char === ']') { parenCount--; }
        }
      }

      if (parenCount === 0 && currentExpr.trim()) {
        try {
          const ast = this.parse(currentExpr.trim());
          const currentNs = this.nsManager.getCurrentNamespace();
          lastResult = interpret(ast, currentNs.environment, this.nsManager);
          if (!nsProcessed && currentExpr.trim().includes('(ns ') && currentExpr.trim().includes(':require')) {
            this.loadRequiredNamespaces(currentExpr.trim());
            nsProcessed = true;
          }
        } catch (error) {
          throw new Error(`Error evaluating expression "${currentExpr.trim()}": ${(error as Error).message}`);
        }
        currentExpr = '';
      }
    }

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

      if (char === '"' && (i === 0 || input[i - 1] !== '\\')) {
        inString = !inString;
      }

      if (!inString) {
        if (char === '(' || char === '[') {
          parenCount++;
          currentExpr += char;
        } else if (char === ')' || char === ']') {
          parenCount--;
          currentExpr += char;

          if (parenCount === 0 && currentExpr.trim()) {
            expressions.push(currentExpr.trim());
            currentExpr = '';

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

    if (currentExpr.trim()) {
      expressions.push(currentExpr.trim());
    }

    return expressions;
  }

  resetContext(): void {
    this.globalEnv = createGlobalEnvironment();
    this.nsManager = new NamespaceManager(this.globalEnv);
  }

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
  resetContext: () => hcLisp.resetContext(),
  getGlobalEnvironment: () => hcLisp.getGlobalEnvironment()
};
