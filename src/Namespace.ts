import { HCValue } from "./Categorize";
import { Environment } from "./Context";

export interface NamespaceInfo {
    name: string;
    environment: Environment;
    imports: Map<string, any>; // For external imports (simulated)
    requires: Map<string, string>; // namespace -> alias
}

export class NamespaceManager {
    private namespaces: Map<string, NamespaceInfo>;
    private currentNamespace: string;

    constructor() {
        this.namespaces = new Map();
        this.currentNamespace = "user";
        
        // Create default "user" namespace
        this.createNamespace("user");
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
        
        if (name === "node.fs") {
            this.addNodeFsFunctions(mockNs);
        } else if (name === "node.crypto") {
            this.addNodeCryptoFunctions(mockNs);
        } else if (name === "node.path") {
            this.addNodePathFunctions(mockNs);
        }
    }

    private addNodeFsFunctions(ns: NamespaceInfo): void {
        const fs = require('fs');
        
        ns.environment.define("readFileSync", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== "string") {
                    throw new Error("readFileSync expects a string argument (file path)");
                }
                try {
                    const content = fs.readFileSync(args[0].value, 'utf-8');
                    return { type: "string", value: content };
                } catch (error) {
                    throw new Error(`Error reading file: ${(error as Error).message}`);
                }
            }
        });

        ns.environment.define("existsSync", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== "string") {
                    throw new Error("existsSync expects a string argument (file path)");
                }
                try {
                    const exists = fs.existsSync(args[0].value);
                    return { type: "boolean", value: exists };
                } catch (error) {
                    return { type: "boolean", value: false };
                }
            }
        });
    }

    private addNodeCryptoFunctions(ns: NamespaceInfo): void {
        const crypto = require('crypto');
        
        ns.environment.define("randomUUID", {
            type: "function",
            value: (...args: HCValue[]) => {
                return { type: "string", value: crypto.randomUUID() };
            }
        });

        ns.environment.define("randomBytes", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== "number") {
                    throw new Error("randomBytes expects a number argument");
                }
                const bytes = crypto.randomBytes(args[0].value);
                return { type: "string", value: bytes.toString('hex') };
            }
        });

        ns.environment.define("createHash", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 2 || args[0].type !== "string" || args[1].type !== "string") {
                    throw new Error("createHash expects algorithm and data as string arguments");
                }
                const hash = crypto.createHash(args[0].value).update(args[1].value).digest('hex');
                return { type: "string", value: hash };
            }
        });
    }

    private addNodePathFunctions(ns: NamespaceInfo): void {
        const path = require('path');
        
        ns.environment.define("join", {
            type: "function",
            value: (...args: HCValue[]) => {
                const paths = args.map(arg => {
                    if (arg.type !== "string") {
                        throw new Error("path/join expects string arguments");
                    }
                    return arg.value;
                });
                const joined = path.join(...paths);
                return { type: "string", value: joined };
            }
        });

        ns.environment.define("basename", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== "string") {
                    throw new Error("basename expects a string argument");
                }
                const base = path.basename(args[0].value);
                return { type: "string", value: base };
            }
        });

        ns.environment.define("dirname", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== "string") {
                    throw new Error("dirname expects a string argument");
                }
                const dir = path.dirname(args[0].value);
                return { type: "string", value: dir };
            }
        });

        ns.environment.define("extname", {
            type: "function",
            value: (...args: HCValue[]) => {
                if (args.length !== 1 || args[0].type !== "string") {
                    throw new Error("extname expects a string argument");
                }
                const ext = path.extname(args[0].value);
                return { type: "string", value: ext };
            }
        });
    }

    // Resolves a symbol considering requires and imports
    resolveSymbol(symbol: string, currentEnv: Environment): HCValue {
        // First, try to find in local environment (built-in functions, etc.)
        try {
            return currentEnv.get(symbol);
        } catch {
            // If not found in local environment, check namespaces
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
                        } catch {
                            throw new Error(`Function '${fnName}' not found in namespace '${realNs}'`);
                        }
                    }
                }
            }
            
            throw new Error(`Namespace alias '${nsAlias}' not found`);
        }
        
        // Check class imports
        if (currentNs.imports.has(symbol)) {
            return { type: "function", value: currentNs.imports.get(symbol) };
        }
        
        // If we got here, symbol was not found
        throw new Error(`Undefined symbol: ${symbol}`);
    }
}
