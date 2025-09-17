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
    const nsRegex = /\(ns\s+\S+\s*\(\s*:require\s+([^)]*)\)\s*\)/;
    const nsMatch = nsRegex.exec(content);
    if (nsMatch) {
      const requiresString = nsMatch[1];

      const bracketRegex = /\[([^\]]+)\]/g;
      const requiredNamespaces: string[] = [];
      let match;

      while ((match = bracketRegex.exec(requiresString)) !== null) {
        const namespaces = match[1].split(/\s+/).filter(ns => ns.trim());
        requiredNamespaces.push(...namespaces);
      }

      for (const ns of requiredNamespaces) {
        if (ns.startsWith('node.')) { continue; }

        const nsInfo = this.nsManager.getNamespace(ns);
        if (nsInfo) {
          let contentValue: any = null;
          try {
            contentValue = nsInfo.environment.get('__deferred_content__');
          } catch (e) {
            continue;
          }
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
      if (this.shouldSkipLine(trimmedLine)) {
        continue;
      }

      currentExpr += (currentExpr ? ' ' : '') + trimmedLine;
      const { newParenCount, newInString } = this.updateParsingState(trimmedLine, parenCount, inString);
      parenCount = newParenCount;
      inString = newInString;

      if (parenCount === 0 && currentExpr.trim()) {
        lastResult = this.processCompleteExpression(currentExpr.trim(), nsProcessed);
        if (!nsProcessed && this.isNamespaceExpression(currentExpr.trim())) {
          this.loadRequiredNamespaces(currentExpr.trim());
          nsProcessed = true;
        }
        currentExpr = '';
      }
    }

    if (currentExpr.trim()) {
      lastResult = this.processRemainingExpression(currentExpr.trim());
    }

    return lastResult;
  }

  private shouldSkipLine(trimmedLine: string): boolean {
    return !trimmedLine || trimmedLine.startsWith(';;');
  }

  private updateParsingState(line: string, parenCount: number, inString: boolean): { newParenCount: number; newInString: boolean } {
    let newParenCount = parenCount;
    let newInString = inString;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        newInString = !newInString;
      }

      if (!newInString) {
        if (char === '(' || char === '[') { newParenCount++; }
        if (char === ')' || char === ']') { newParenCount--; }
      }
    }

    return { newParenCount, newInString };
  }

  private processCompleteExpression(expression: string, nsProcessed: boolean): HCValue {
    try {
      const ast = this.parse(expression);
      const currentNs = this.nsManager.getCurrentNamespace();
      return interpret(ast, currentNs.environment, this.nsManager);
    } catch (error) {
      throw new Error(`Error evaluating expression "${expression}": ${(error as Error).message}`);
    }
  }

  private isNamespaceExpression(expression: string): boolean {
    return expression.includes('(ns ') && expression.includes(':require');
  }

  private processRemainingExpression(expression: string): HCValue {
    try {
      const ast = this.parse(expression);
      return this.interpret(ast);
    } catch (error) {
      throw new Error(`Error evaluating expression "${expression}": ${(error as Error).message}`);
    }
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
  evalFileContent: (content: string) => hcLisp.evalFileContent(content),
  formatOutput: (value: HCValue) => hcLisp.formatOutput(value),
  resetContext: () => hcLisp.resetContext(),
  getGlobalEnvironment: () => hcLisp.getGlobalEnvironment()
};
