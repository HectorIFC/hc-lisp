"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
class Environment {
    constructor(parent = null) {
        this.bindings = new Map();
        this.parent = parent;
    }
    define(name, value) {
        this.bindings.set(name, value);
    }
    get(name) {
        if (this.bindings.has(name)) {
            return this.bindings.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Undefined symbol: ${name}`);
    }
    set(name, value) {
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
    extend(params, args) {
        const newEnv = new Environment(this);
        for (let i = 0; i < params.length; i++) {
            newEnv.define(params[i], args[i] || { type: 'nil', value: null });
        }
        return newEnv;
    }
}
exports.Environment = Environment;
//# sourceMappingURL=Context.js.map