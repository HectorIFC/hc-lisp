import { HCValue } from './Categorize';
import { Environment } from './Context';

export interface NamespaceInfo {
    name: string;
    environment: Environment;
    imports: Map<string, any>; // For external imports (simulated)
    requires: Map<string, string>; // namespace -> alias
}

export class NamespaceManager {
    private readonly namespaces: Map<string, NamespaceInfo>;
    private currentNamespace: string;
    private readonly nodeModulesCache: Map<string, any>; // Cache for loaded modules

    constructor() {
        this.namespaces = new Map();
        this.currentNamespace = 'user';
        this.nodeModulesCache = new Map();

        // Create default "user" namespace
        this.createNamespace('user');
    }

    createNamespace(name: string, baseEnv?: Environment): NamespaceInfo {
        const ns: NamespaceInfo = {
            name,
            environment: new Environment(baseEnv || null),
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

    // Simulates imports of external libraries
    addImport(className: string, mockImplementation: any): void {
        const currentNs = this.getCurrentNamespace();
        currentNs.imports.set(className, mockImplementation);
    }

    // Adds a require (namespace -> alias)
    addRequire(namespace: string, alias: string): void {
        const currentNs = this.getCurrentNamespace();
        currentNs.requires.set(namespace, alias);

        // If namespace doesn't exist, create a basic mock
        if (!this.namespaces.has(namespace)) {
            this.createMockNamespace(namespace);
        }
    }

    private createMockNamespace(name: string): void {
        const mockNs = this.createNamespace(name);

        // Try to dynamically load from node_modules first
        if (this.tryLoadNodeModule(name, mockNs)) {
            return;
        }

        // Fallback to built-in Node.js modules
        if (name === 'node.fs') {
            this.addNodeFsFunctions(mockNs);
        } else if (name === 'node.crypto') {
            this.addNodeCryptoFunctions(mockNs);
        } else if (name === 'node.path') {
            this.addNodePathFunctions(mockNs);
        } else if (name === 'node.http') {
            this.addNodeHttpFunctions(mockNs);
        } else if (name === 'node.url') {
            this.addNodeUrlFunctions(mockNs);
        } else if (name === 'node.os') {
            this.addNodeOsFunctions(mockNs);
        }
    }

    private tryLoadNodeModule(moduleName: string, ns: NamespaceInfo): boolean {
        try {
            // Remove 'node.' prefix for npm packages
            const packageName = moduleName.startsWith('node.')
                ? moduleName.substring(5)
                : moduleName;

            // Check if already cached
            if (this.nodeModulesCache.has(packageName)) {
                const cachedModule = this.nodeModulesCache.get(packageName);
                this.wrapNodeModule(cachedModule, ns, packageName);
                return true;
            }

            // Try to require the module
            const nodeModule = require(packageName);
            this.nodeModulesCache.set(packageName, nodeModule);
            this.wrapNodeModule(nodeModule, ns, packageName);
            return true;

        } catch (error) {
            // Module not found or not installed
            console.log(`Module '${moduleName}' not found in node_modules`);
            if (error instanceof Error) {
                console.debug(`Module loading error: ${error.message}`);
            }
            return false;
        }
    }

    private wrapNodeModule(nodeModule: any, ns: NamespaceInfo, packageName: string): void {
        // Handle different types of exports
        if (typeof nodeModule === 'function') {
            // Default export is a function (like express)
            ns.environment.define(packageName, {
                type: 'function',
                value: (...args: HCValue[]) => {
                    const jsArgs = args.map(arg => this.hcValueToJs(arg));
                    const result = nodeModule(...jsArgs);
                    return this.jsValueToHc(result);
                }
            });

            // Also expose as default export
            ns.environment.define('default', {
                type: 'function',
                value: (...args: HCValue[]) => {
                    const jsArgs = args.map(arg => this.hcValueToJs(arg));
                    const result = nodeModule(...jsArgs);
                    return this.jsValueToHc(result);
                }
            });
        }

        // Handle object exports (methods and properties)
        if (typeof nodeModule === 'object' && nodeModule !== null) {
            for (const [key, value] of Object.entries(nodeModule)) {
                if (typeof value === 'function') {
                    ns.environment.define(key, {
                        type: 'function',
                        value: (...args: HCValue[]) => {
                            const jsArgs = args.map(arg => this.hcValueToJs(arg));
                            const result = value(...jsArgs);
                            return this.jsValueToHc(result);
                        }
                    });
                } else {
                    // Handle constants/properties
                    ns.environment.define(key, this.jsValueToHc(value));
                }
            }
        }
    }

    private hcValueToJs(hcValue: HCValue): any {
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
                return hcValue; // Return closure as-is for HC-Lisp functions
            case 'recur':
                return hcValue.values.map((item: HCValue) => this.hcValueToJs(item));
            default:
                return hcValue;
        }
    }

    private jsValueToHc(jsValue: any): HCValue {
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
            return { type: 'object', value: jsValue };
        }
        if (typeof jsValue === 'function') {
            return { type: 'function', value: jsValue };
        }

        // Fallback: treat as object
        return { type: 'object', value: jsValue };
    }

    private addNodeFsFunctions(ns: NamespaceInfo): void {
        const fs = require('fs');

        ns.environment.define('readFileSync', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('readFileSync expects a string argument (file path)');
                }
                try {
                    const content = fs.readFileSync(args[0].value, 'utf-8');
                    return { type: 'string', value: content };
                } catch (error) {
                    throw new Error(`Error reading file: ${(error as Error).message}`);
                }
            }
        });

        ns.environment.define('existsSync', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('existsSync expects a string argument (file path)');
                }
                try {
                    const exists = fs.existsSync(args[0].value);
                    return { type: 'boolean', value: exists };
                } catch (error) {
                    return { type: 'boolean', value: false };
                }
            }
        });
    }

    private addNodeCryptoFunctions(ns: NamespaceInfo): void {
        const crypto = require('crypto');

        ns.environment.define('randomUUID', {
            type: 'function',
            value: (...args: HCValue[]) => {
                return { type: 'string', value: crypto.randomUUID() };
            }
        });

        ns.environment.define('randomBytes', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'number') {
                    throw new Error('randomBytes expects a number argument');
                }
                const bytes = crypto.randomBytes(args[0].value);
                return { type: 'string', value: bytes.toString('hex') };
            }
        });

        ns.environment.define('createHash', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 2 || args[0].type !== 'string' || args[1].type !== 'string') {
                    throw new Error('createHash expects algorithm and data as string arguments');
                }
                const hash = crypto.createHash(args[0].value).update(args[1].value).digest('hex');
                return { type: 'string', value: hash };
            }
        });
    }

    private addNodeHttpFunctions(ns: NamespaceInfo): void {
        const http = require('http');

        ns.environment.define('createServer', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'function') {
                    throw new Error('createServer expects a function argument (request handler)');
                }
                const handler = args[0].value;
                const server = http.createServer((req: any, res: any) => {
                    const reqObj = { type: 'object', value: req };
                    const resObj = { type: 'object', value: res };
                    handler(reqObj, resObj);
                });
                return { type: 'object', value: server };
            }
        });

        ns.environment.define('request', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length < 1 || args[0].type !== 'string') {
                    throw new Error('http.request expects at least a URL string argument');
                }
                const url = args[0].value;
                const callback = args.length > 1 && args[1].type === 'function' ? args[1].value : null;
                const req = http.request(url, callback);
                return { type: 'object', value: req };
            }
        });
    }

    private addNodeUrlFunctions(ns: NamespaceInfo): void {
        const url = require('url');

        ns.environment.define('parse', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('url.parse expects a string argument');
                }
                const parsed = url.parse(args[0].value);
                return { type: 'object', value: parsed };
            }
        });

        ns.environment.define('resolve', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 2 || args[0].type !== 'string' || args[1].type !== 'string') {
                    throw new Error('url.resolve expects two string arguments');
                }
                const resolved = url.resolve(args[0].value, args[1].value);
                return { type: 'string', value: resolved };
            }
        });
    }

    private addNodeOsFunctions(ns: NamespaceInfo): void {
        const os = require('os');

        ns.environment.define('platform', {
            type: 'function',
            value: (...args: HCValue[]) => {
                return { type: 'string', value: os.platform() };
            }
        });

        ns.environment.define('hostname', {
            type: 'function',
            value: (...args: HCValue[]) => {
                return { type: 'string', value: os.hostname() };
            }
        });

        ns.environment.define('tmpdir', {
            type: 'function',
            value: (...args: HCValue[]) => {
                return { type: 'string', value: os.tmpdir() };
            }
        });

        ns.environment.define('homedir', {
            type: 'function',
            value: (...args: HCValue[]) => {
                return { type: 'string', value: os.homedir() };
            }
        });
    }

    private addNodePathFunctions(ns: NamespaceInfo): void {
        const path = require('path');

        ns.environment.define('join', {
            type: 'function',
            value: (...args: HCValue[]) => {
                const paths = args.map(arg => {
                    if (arg.type !== 'string') {
                        throw new Error('path/join expects string arguments');
                    }
                    return arg.value;
                });
                const joined = path.join(...paths);
                return { type: 'string', value: joined };
            }
        });

        ns.environment.define('basename', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('basename expects a string argument');
                }
                const base = path.basename(args[0].value);
                return { type: 'string', value: base };
            }
        });

        ns.environment.define('dirname', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('dirname expects a string argument');
                }
                const dir = path.dirname(args[0].value);
                return { type: 'string', value: dir };
            }
        });

        ns.environment.define('extname', {
            type: 'function',
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('extname expects a string argument');
                }
                const ext = path.extname(args[0].value);
                return { type: 'string', value: ext };
            }
        });
    }

    // Resolves a symbol considering requires and imports
    resolveSymbol(symbol: string, currentEnv: Environment): HCValue {
        // First, try to find in local environment (built-in functions, etc.)
        try {
            return currentEnv.get(symbol);
        } catch (error) {
            // If not found in local environment, check namespaces
            if (error instanceof Error) {
                console.debug(`Symbol '${symbol}' not found in local environment: ${error.message}`);
            }
        }

        const currentNs = this.getCurrentNamespace();

        // Check if it's a symbol with namespace (e.g., str/upper-case)
        if (symbol.includes('/')) {
            const [nsAlias, fnName] = symbol.split('/');

            // Search for the real namespace by alias
            const requiresArray = Array.from(currentNs.requires.entries());
            for (let i = 0; i < requiresArray.length; i++) {
                const [realNs, alias] = requiresArray[i];
                if (alias === nsAlias) {
                    const targetNs = this.getNamespace(realNs);
                    if (targetNs) {
                        try {
                            return targetNs.environment.get(fnName);
                        } catch (error) {
                            if (error instanceof Error) {
                                console.debug(`Function '${fnName}' lookup error in namespace '${realNs}': ${error.message}`);
                            }
                            throw new Error(`Function '${fnName}' not found in namespace '${realNs}'`);
                        }
                    }
                }
            }

            throw new Error(`Namespace alias '${nsAlias}' not found`);
        }

        // Check class imports
        if (currentNs.imports.has(symbol)) {
            return { type: 'function', value: currentNs.imports.get(symbol) };
        }

        // If we got here, symbol was not found
        throw new Error(`Undefined symbol: ${symbol}`);
    }
}
