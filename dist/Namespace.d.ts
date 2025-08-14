import { HCValue } from './Categorize';
import { Environment } from './Context';
export interface NamespaceInfo {
    name: string;
    environment: Environment;
    imports: Map<string, any>;
    requires: Map<string, string>;
}
export declare class NamespaceManager {
    private readonly namespaces;
    private currentNamespace;
    private readonly nodeModulesCache;
    private pendingNamespaces?;
    private readonly globalEnv;
    constructor(globalEnv: Environment);
    createNamespace(name: string, baseEnv?: Environment): NamespaceInfo;
    setCurrentNamespace(name: string): void;
    getCurrentNamespace(): NamespaceInfo;
    getNamespace(name: string): NamespaceInfo | undefined;
    addImport(className: string, mockImplementation: any): void;
    addRequire(namespace: string, alias: string): void;
    createMockNamespace(name: string): void;
    tryLoadHCLispFile(namespaceName: string, ns: NamespaceInfo): boolean;
    private loadHCLispFileContent;
    evaluateDeferredNamespace(namespaceName: string, hcLispInstance: any): void;
    tryLoadNodeModule(moduleName: string, ns: NamespaceInfo): boolean;
    wrapNodeModule(nodeModule: any, ns: NamespaceInfo, packageName: string): void;
    hcValueToJs(hcValue: HCValue): any;
    jsValueToHc(jsValue: any): HCValue;
    addNodeFsFunctions(ns: NamespaceInfo): void;
    addNodeCryptoFunctions(ns: NamespaceInfo): void;
    addNodeHttpFunctions(ns: NamespaceInfo): void;
    addNodeUrlFunctions(ns: NamespaceInfo): void;
    addNodeOsFunctions(ns: NamespaceInfo): void;
    addNodePathFunctions(ns: NamespaceInfo): void;
    resolveSymbol(symbol: string, currentEnv: Environment): HCValue;
    tryResolveFromLocal(symbol: string, searchEnv: Environment): HCValue | null;
    resolveNamespacedSymbol(symbol: string, searchNamespace: any): HCValue;
    getSymbolFromNamespace(fnName: string, realNs: string, targetNs: any): HCValue;
    tryResolveFromImports(symbol: string, searchNamespace: any): HCValue | null;
}
//# sourceMappingURL=Namespace.d.ts.map