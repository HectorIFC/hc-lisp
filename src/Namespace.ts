import { HCValue } from './Categorize';
import { Environment } from './Context';
import * as fs from 'fs';

export interface NamespaceInfo {
  name: string;
  environment: Environment;
  imports: Map<string, any>;
  requires: Map<string, string>;
}

export class NamespaceManager {
  private readonly namespaces: Map<string, NamespaceInfo>;
  private currentNamespace: string;
  private readonly nodeModulesCache: Map<string, any>;
  private pendingNamespaces?: Set<string>;
  private readonly globalEnv: Environment;

  constructor(globalEnv: Environment) {
    this.globalEnv = globalEnv;
    this.namespaces = new Map();
    this.currentNamespace = 'user';
    this.nodeModulesCache = new Map();
    this.createNamespace('user');
  }

  createNamespace(name: string, baseEnv?: Environment): NamespaceInfo {
    const ns: NamespaceInfo = {
      name,
      environment: new Environment(baseEnv || this.globalEnv),
      imports: new Map(),
      requires: new Map()
    };

    this.namespaces.set(name, ns);
    return ns;
  }

  setCurrentNamespace(name: string): void {
    if (!this.namespaces.has(name)) {
      throw new Error(`Namespace '${name}' does not exist`);
    }
    this.currentNamespace = name;
  }

  getCurrentNamespace(): NamespaceInfo {
    return this.namespaces.get(this.currentNamespace)!;
  }

  getNamespace(name: string): NamespaceInfo | undefined {
    return this.namespaces.get(name);
  }

  addImport(className: string, mockImplementation: any): void {
    const currentNs = this.getCurrentNamespace();
    currentNs.imports.set(className, mockImplementation);
  }

  addRequire(namespace: string, alias: string): void {
    const currentNs = this.getCurrentNamespace();
    currentNs.requires.set(namespace, alias);

    if (!this.namespaces.has(namespace)) {
      this.createMockNamespace(namespace);
    }
  }

  createMockNamespace(name: string): void {
    const mockNs = this.createNamespace(name);

    if (this.tryLoadHCLispFile(name, mockNs)) {
      return;
    }

    if (this.tryLoadNodeModule(name, mockNs)) {
      return;
    }
  }

  tryLoadHCLispFile(namespaceName: string, ns: NamespaceInfo): boolean {
    try {

      const possiblePaths = [
        `${namespaceName}.hclisp`,
        `./tests/${namespaceName}.hclisp`,
        `./src/${namespaceName}.hclisp`,
        `./${namespaceName}/${namespaceName}.hclisp`
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          this.pendingNamespaces ??= new Set();
          this.pendingNamespaces.add(namespaceName);

          this.loadHCLispFileContent(filePath, ns);
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private loadHCLispFileContent(filePath: string, ns: NamespaceInfo): void {
    const content = fs.readFileSync(filePath, 'utf-8');

    ns.environment.define('__deferred_content__', {
      type: 'string',
      value: content
    });

    ns.environment.define('__deferred_filepath__', {
      type: 'string',
      value: filePath
    });
  }

  evaluateDeferredNamespace(namespaceName: string, hcLispInstance: any): void {
    const ns = this.getNamespace(namespaceName);
    if (!ns) {return;}

    let contentValue: any;
    let filepathValue: any;

    try {
      contentValue = ns.environment.get('__deferred_content__');
      filepathValue = ns.environment.get('__deferred_filepath__');
    } catch (error) {
      return;
    }

    if (contentValue && contentValue.type === 'string' &&
        filepathValue && filepathValue.type === 'string') {

      const originalNs = this.currentNamespace;
      this.currentNamespace = namespaceName;

      try {
        hcLispInstance.evalFileContent(contentValue.value);
        ns.environment.define('__deferred_content__', { type: 'nil', value: null });
        ns.environment.define('__deferred_filepath__', { type: 'nil', value: null });
      } catch (error) {
        console.error(`Error evaluating namespace '${namespaceName}':`, error);
      } finally {
        this.currentNamespace = originalNs;
      }
    }
  }

  tryLoadNodeModule(moduleName: string, ns: NamespaceInfo): boolean {
    try {
      const packageName = moduleName.startsWith('node.')
        ? moduleName.substring(5)
        : moduleName;

      if (this.nodeModulesCache.has(packageName)) {
        const cachedModule = this.nodeModulesCache.get(packageName);
        this.wrapNodeModule(cachedModule, ns, packageName);
        return true;
      }

      const nodeModule = require(packageName);
      this.nodeModulesCache.set(packageName, nodeModule);
      this.wrapNodeModule(nodeModule, ns, packageName);
      return true;
    } catch (error) {
      console.error(`Module '${moduleName}' not found in node_modules`);
      if (error instanceof Error) {
        console.error(`Module loading error: ${error.message}`);
      }
      return false;
    }
  }

  wrapNodeModule(nodeModule: any, ns: NamespaceInfo, packageName: string): void {
    if (typeof nodeModule === 'function') {
      ns.environment.define(packageName, {
        type: 'function',
        value: (...args: HCValue[]) => {
          const jsArgs = args.map(arg => this.hcValueToJs(arg));
          const result = nodeModule(...jsArgs);
          return this.jsValueToHc(result);
        }
      });

      ns.environment.define('default', {
        type: 'function',
        value: (...args: HCValue[]) => {
          const jsArgs = args.map(arg => this.hcValueToJs(arg));
          const result = nodeModule(...jsArgs);
          return this.jsValueToHc(result);
        }
      });
    }

    if ((typeof nodeModule === 'object' && nodeModule !== null) || typeof nodeModule === 'function') {
      for (const [key, value] of Object.entries(nodeModule)) {
        if (typeof value === 'function') {
          ns.environment.define(key, {
            type: 'function',
            value: (...args: HCValue[]) => {
              const jsArgs = args.map(arg => this.hcValueToJs(arg));

              if (packageName === 'http' && key === 'createServer') {
                const requestHandlerArg = jsArgs[0];
                const originalClosure = args[0];
                const wrappedHandler = (req: any, res: any) => {
                  const hcReq = this.jsValueToHc(req);
                  const hcRes = this.jsValueToHc(res);

                  if (originalClosure.type === 'closure') {
                    const { callFunction } = require('./Interpret');
                    const currentEnv = this.getCurrentNamespace().environment;
                    return callFunction(originalClosure, [hcReq, hcRes], currentEnv, this);
                  } else {
                    return requestHandlerArg(hcReq, hcRes);
                  }
                };
                const server = value(wrappedHandler);
                return this.jsValueToHc(server);
              }

              const result = value(...jsArgs);
              return this.jsValueToHc(result);
            }
          });
        } else {
          ns.environment.define(key, this.jsValueToHc(value));
        }
      }
    }
  }

  hcValueToJs(hcValue: HCValue): any {
    switch (hcValue.type) {
    case 'string':
    case 'number':
    case 'boolean':
      return hcValue.value;
    case 'nil':
      return null;
    case 'list':
    case 'vector':
      return hcValue.value.map((item: HCValue) => this.hcValueToJs(item));
    case 'object':
      return hcValue.value;
    case 'function':
      return hcValue.value;
    case 'symbol':
    case 'keyword':
      return hcValue.value;
    case 'closure':
      return (...args: any[]) => {
        const hcArgs = args.map(arg => this.jsValueToHc(arg));
        const { callFunction } = require('./Interpret');
        return callFunction(hcValue, hcArgs, null, this);
      };
    case 'recur':
      return hcValue.values.map((item: HCValue) => this.hcValueToJs(item));
    default:
      return hcValue;
    }
  }

  jsValueToHc(jsValue: any): HCValue {
    if (jsValue === null || jsValue === undefined) {
      return { type: 'nil', value: null };
    }
    if (typeof jsValue === 'string') {
      return { type: 'string', value: jsValue };
    }
    if (typeof jsValue === 'number') {
      return { type: 'number', value: jsValue };
    }
    if (typeof jsValue === 'boolean') {
      return { type: 'boolean', value: jsValue };
    }
    if (Array.isArray(jsValue)) {
      return {
        type: 'vector',
        value: jsValue.map(item => this.jsValueToHc(item))
      };
    }
    if (typeof jsValue === 'object') {
      if (jsValue && jsValue.constructor) {
        const constructorName = jsValue.constructor.name;
        if (constructorName === 'Server' ||
            constructorName === 'IncomingMessage' ||
            constructorName === 'ServerResponse' ||
            constructorName === 'Socket') {
          return {
            type: 'js-object',
            jsRef: jsValue,
            __direct_js__: true
          } as any;
        }
      }
      return { type: 'object', value: jsValue };
    }
    if (typeof jsValue === 'function') {
      return { type: 'function', value: jsValue };
    }

    return { type: 'object', value: jsValue };
  }

  resolveSymbol(symbol: string, currentEnv: Environment): HCValue {
    const localResult = this.tryResolveFromLocal(symbol, currentEnv);
    if (localResult) {
      return localResult;
    }

    const currentNs = this.getCurrentNamespace();

    if (symbol.includes('/')) {
      return this.resolveNamespacedSymbol(symbol, currentNs);
    }

    const importResult = this.tryResolveFromImports(symbol, currentNs);
    if (importResult) {
      return importResult;
    }

    throw new Error(`Undefined symbol: ${symbol}`);
  }

  tryResolveFromLocal(symbol: string, searchEnv: Environment): HCValue | null {
    try {
      return searchEnv.get(symbol);
    } catch (error) {
      console.error(`Symbol '${symbol}' not found in local environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  resolveNamespacedSymbol(symbol: string, searchNamespace: any): HCValue {
    const [nsAlias, fnName] = symbol.split('/');

    let foundRealNs: string | null = null;
    searchNamespace.requires.forEach((value: string, key: string) => {
      if (value === nsAlias) {
        foundRealNs = key;
      }
    });

    if (foundRealNs) {
      const targetNs = this.getNamespace(foundRealNs);
      if (targetNs) {
        return this.getSymbolFromNamespace(fnName, foundRealNs, targetNs);
      } else {
      }
    } else {
    }

    throw new Error(`Namespace alias '${nsAlias}' not found`);
  }

  getSymbolFromNamespace(fnName: string, realNs: string, targetNs: any): HCValue {
    try {
      return targetNs.environment.get(fnName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to get symbol '${fnName}' from namespace '${realNs}': ${errorMessage}`);
      throw new Error(`Function '${fnName}' not found in namespace '${realNs}'`);
    }
  }

  tryResolveFromImports(symbol: string, searchNamespace: any): HCValue | null {
    if (searchNamespace.imports.has(symbol)) {
      return { type: 'function', value: searchNamespace.imports.get(symbol) };
    }
    return null;
  }
}
