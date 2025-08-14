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
exports.NamespaceManager = void 0;
const Context_1 = require("./Context");
const fs = __importStar(require("fs"));
class NamespaceManager {
    constructor(globalEnv) {
        this.globalEnv = globalEnv;
        this.namespaces = new Map();
        this.currentNamespace = 'user';
        this.nodeModulesCache = new Map();
        this.createNamespace('user');
    }
    createNamespace(name, baseEnv) {
        const ns = {
            name,
            environment: new Context_1.Environment(baseEnv || this.globalEnv),
            imports: new Map(),
            requires: new Map()
        };
        this.namespaces.set(name, ns);
        return ns;
    }
    setCurrentNamespace(name) {
        if (!this.namespaces.has(name)) {
            throw new Error(`Namespace '${name}' does not exist`);
        }
        this.currentNamespace = name;
    }
    getCurrentNamespace() {
        return this.namespaces.get(this.currentNamespace);
    }
    getNamespace(name) {
        return this.namespaces.get(name);
    }
    addImport(className, mockImplementation) {
        const currentNs = this.getCurrentNamespace();
        currentNs.imports.set(className, mockImplementation);
    }
    addRequire(namespace, alias) {
        const currentNs = this.getCurrentNamespace();
        currentNs.requires.set(namespace, alias);
        if (!this.namespaces.has(namespace)) {
            this.createMockNamespace(namespace);
        }
    }
    createMockNamespace(name) {
        const mockNs = this.createNamespace(name);
        if (this.tryLoadHCLispFile(name, mockNs)) {
            return;
        }
        if (this.tryLoadNodeModule(name, mockNs)) {
            return;
        }
        if (name === 'node.fs') {
            this.addNodeFsFunctions(mockNs);
        }
        else if (name === 'node.crypto') {
            this.addNodeCryptoFunctions(mockNs);
        }
        else if (name === 'node.path') {
            this.addNodePathFunctions(mockNs);
        }
        else if (name === 'node.http') {
            this.addNodeHttpFunctions(mockNs);
        }
        else if (name === 'node.url') {
            this.addNodeUrlFunctions(mockNs);
        }
        else if (name === 'node.os') {
            this.addNodeOsFunctions(mockNs);
        }
    }
    tryLoadHCLispFile(namespaceName, ns) {
        try {
            const possiblePaths = [
                `${namespaceName}.hclisp`,
                `./tests/${namespaceName}.hclisp`,
                `./src/${namespaceName}.hclisp`,
                `./${namespaceName}/${namespaceName}.hclisp`
            ];
            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    this.pendingNamespaces ?? (this.pendingNamespaces = new Set());
                    this.pendingNamespaces.add(namespaceName);
                    this.loadHCLispFileContent(filePath, ns);
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            console.log(`Failed to load HC-Lisp file for namespace '${namespaceName}': ${error}`);
            return false;
        }
    }
    loadHCLispFileContent(filePath, ns) {
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
    evaluateDeferredNamespace(namespaceName, hcLispInstance) {
        const ns = this.getNamespace(namespaceName);
        if (!ns) {
            return;
        }
        let contentValue;
        let filepathValue;
        try {
            contentValue = ns.environment.get('__deferred_content__');
            filepathValue = ns.environment.get('__deferred_filepath__');
        }
        catch (error) {
            console.debug(`No deferred content found in namespace '${namespaceName}': 
        ${error instanceof Error ? error.message : 'Unknown error'}`);
            return;
        }
        if (contentValue && contentValue.type === 'string' &&
            filepathValue && filepathValue.type === 'string') {
            const originalNs = this.currentNamespace;
            this.currentNamespace = namespaceName;
            try {
                console.log(`Evaluating deferred namespace '${namespaceName}' from ${filepathValue.value}`);
                hcLispInstance.evalFileContent(contentValue.value);
                ns.environment.define('__deferred_content__', { type: 'nil', value: null });
                ns.environment.define('__deferred_filepath__', { type: 'nil', value: null });
                console.log(`Successfully loaded namespace '${namespaceName}' from ${filepathValue.value}`);
            }
            catch (error) {
                console.error(`Error evaluating namespace '${namespaceName}':`, error);
            }
            finally {
                this.currentNamespace = originalNs;
            }
        }
    }
    tryLoadNodeModule(moduleName, ns) {
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
        }
        catch (error) {
            console.log(`Module '${moduleName}' not found in node_modules`);
            if (error instanceof Error) {
                console.debug(`Module loading error: ${error.message}`);
            }
            return false;
        }
    }
    wrapNodeModule(nodeModule, ns, packageName) {
        if (typeof nodeModule === 'function') {
            ns.environment.define(packageName, {
                type: 'function',
                value: (...args) => {
                    const jsArgs = args.map(arg => this.hcValueToJs(arg));
                    const result = nodeModule(...jsArgs);
                    return this.jsValueToHc(result);
                }
            });
            ns.environment.define('default', {
                type: 'function',
                value: (...args) => {
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
                        value: (...args) => {
                            const jsArgs = args.map(arg => this.hcValueToJs(arg));
                            const result = value(...jsArgs);
                            return this.jsValueToHc(result);
                        }
                    });
                }
                else {
                    ns.environment.define(key, this.jsValueToHc(value));
                }
            }
        }
    }
    hcValueToJs(hcValue) {
        switch (hcValue.type) {
            case 'string':
            case 'number':
            case 'boolean':
                return hcValue.value;
            case 'nil':
                return null;
            case 'list':
            case 'vector':
                return hcValue.value.map((item) => this.hcValueToJs(item));
            case 'object':
                return hcValue.value;
            case 'function':
                return hcValue.value;
            case 'symbol':
            case 'keyword':
                return hcValue.value;
            case 'closure':
                return hcValue;
            case 'recur':
                return hcValue.values.map((item) => this.hcValueToJs(item));
            default:
                return hcValue;
        }
    }
    jsValueToHc(jsValue) {
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
        return { type: 'object', value: jsValue };
    }
    addNodeFsFunctions(ns) {
        const fs = require('fs');
        ns.environment.define('readFileSync', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('readFileSync expects a string argument (file path)');
                }
                try {
                    const content = fs.readFileSync(args[0].value, 'utf-8');
                    return { type: 'string', value: content };
                }
                catch (error) {
                    throw new Error(`Error reading file: ${error.message}`);
                }
            }
        });
        ns.environment.define('existsSync', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('existsSync expects a string argument (file path)');
                }
                try {
                    const exists = fs.existsSync(args[0].value);
                    return { type: 'boolean', value: exists };
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.debug(`existsSync error for path '${args[0].value}': ${error.message}`);
                    }
                    return { type: 'boolean', value: false };
                }
            }
        });
    }
    addNodeCryptoFunctions(ns) {
        const crypto = require('crypto');
        ns.environment.define('randomUUID', {
            type: 'function',
            value: (...args) => {
                return { type: 'string', value: crypto.randomUUID() };
            }
        });
        ns.environment.define('randomBytes', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'number') {
                    throw new Error('randomBytes expects a number argument');
                }
                const bytes = crypto.randomBytes(args[0].value);
                return { type: 'string', value: bytes.toString('hex') };
            }
        });
        ns.environment.define('createHash', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 2 || args[0].type !== 'string' || args[1].type !== 'string') {
                    throw new Error('createHash expects algorithm and data as string arguments');
                }
                const hash = crypto.createHash(args[0].value).update(args[1].value).digest('hex');
                return { type: 'string', value: hash };
            }
        });
    }
    addNodeHttpFunctions(ns) {
        const http = require('http');
        ns.environment.define('createServer', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'function') {
                    throw new Error('createServer expects a function argument (request handler)');
                }
                const handler = args[0].value;
                const server = http.createServer((req, res) => {
                    const reqObj = { type: 'object', value: req };
                    const resObj = { type: 'object', value: res };
                    handler(reqObj, resObj);
                });
                return { type: 'object', value: server };
            }
        });
        ns.environment.define('request', {
            type: 'function',
            value: (...args) => {
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
    addNodeUrlFunctions(ns) {
        const url = require('url');
        ns.environment.define('parse', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('url.parse expects a string argument');
                }
                const parsed = url.parse(args[0].value);
                return { type: 'object', value: parsed };
            }
        });
        ns.environment.define('resolve', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 2 || args[0].type !== 'string' || args[1].type !== 'string') {
                    throw new Error('url.resolve expects two string arguments');
                }
                const resolved = url.resolve(args[0].value, args[1].value);
                return { type: 'string', value: resolved };
            }
        });
    }
    addNodeOsFunctions(ns) {
        const os = require('os');
        ns.environment.define('platform', {
            type: 'function',
            value: (...args) => {
                return { type: 'string', value: os.platform() };
            }
        });
        ns.environment.define('hostname', {
            type: 'function',
            value: (...args) => {
                return { type: 'string', value: os.hostname() };
            }
        });
        ns.environment.define('tmpdir', {
            type: 'function',
            value: (...args) => {
                return { type: 'string', value: os.tmpdir() };
            }
        });
        ns.environment.define('homedir', {
            type: 'function',
            value: (...args) => {
                return { type: 'string', value: os.homedir() };
            }
        });
    }
    addNodePathFunctions(ns) {
        const path = require('path');
        ns.environment.define('join', {
            type: 'function',
            value: (...args) => {
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
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('basename expects a string argument');
                }
                const base = path.basename(args[0].value);
                return { type: 'string', value: base };
            }
        });
        ns.environment.define('dirname', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('dirname expects a string argument');
                }
                const dir = path.dirname(args[0].value);
                return { type: 'string', value: dir };
            }
        });
        ns.environment.define('extname', {
            type: 'function',
            value: (...args) => {
                if (args.length !== 1 || args[0].type !== 'string') {
                    throw new Error('extname expects a string argument');
                }
                const ext = path.extname(args[0].value);
                return { type: 'string', value: ext };
            }
        });
    }
    resolveSymbol(symbol, currentEnv) {
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
    tryResolveFromLocal(symbol, searchEnv) {
        try {
            return searchEnv.get(symbol);
        }
        catch (error) {
            console.debug(`Symbol '${symbol}' not found in local environment: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }
    resolveNamespacedSymbol(symbol, searchNamespace) {
        const [nsAlias, fnName] = symbol.split('/');
        let foundRealNs = null;
        searchNamespace.requires.forEach((value, key) => {
            if (value === nsAlias) {
                foundRealNs = key;
            }
        });
        if (foundRealNs) {
            const targetNs = this.getNamespace(foundRealNs);
            if (targetNs) {
                return this.getSymbolFromNamespace(fnName, foundRealNs, targetNs);
            }
        }
        throw new Error(`Namespace alias '${nsAlias}' not found`);
    }
    getSymbolFromNamespace(fnName, realNs, targetNs) {
        try {
            return targetNs.environment.get(fnName);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.debug(`Failed to get symbol '${fnName}' from namespace '${realNs}': ${errorMessage}`);
            throw new Error(`Function '${fnName}' not found in namespace '${realNs}'`);
        }
    }
    tryResolveFromImports(symbol, searchNamespace) {
        if (searchNamespace.imports.has(symbol)) {
            return { type: 'function', value: searchNamespace.imports.get(symbol) };
        }
        return null;
    }
}
exports.NamespaceManager = NamespaceManager;
//# sourceMappingURL=Namespace.js.map