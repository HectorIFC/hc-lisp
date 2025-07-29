import { HCValue } from "./Categorize";

export class Environment {
    private bindings: Map<string, HCValue>;
    private parent: Environment | null;

    constructor(parent: Environment | null = null) {
        this.bindings = new Map();
        this.parent = parent;
    }

    define(name: string, value: HCValue): void {
        this.bindings.set(name, value);
    }

    get(name: string): HCValue {
        if (this.bindings.has(name)) {
            return this.bindings.get(name)!;
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Undefined symbol: ${name}`);
    }

    set(name: string, value: HCValue): void {
        if (this.bindings.has(name)) {
            this.bindings.set(name, value);
            return;
        }
        if (this.parent) {
            this.parent.set(name, value);
            return;
        }
        throw new Error(`Undefined symbol: ${name}`);
    }

    extend(params: string[], args: HCValue[]): Environment {
        const newEnv = new Environment(this);
        for (let i = 0; i < params.length; i++) {
            newEnv.define(params[i], args[i] || { type: "nil", value: null });
        }
        return newEnv;
    }
}

// Legacy Context class for backward compatibility
export class Context {
    private scope: any;
    private parent: any;

    constructor(scope: any, parent: any) {
        this.scope = scope;
        this.parent = parent;
    }

    public getScope(identifier: string): any {
        if (identifier in this.scope) {
            return this.scope[identifier];
        } else if (this.parent !== undefined) {
            return this.parent.getScope(identifier);
        }
        return undefined;
    }
}