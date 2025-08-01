import { HCValue } from "./Categorize";
import { Environment } from "./Context";

export interface SpecialForm {
    (args: HCValue[], env: Environment, interpret: (expr: HCValue, env: Environment) => HCValue): HCValue;
}

// Special forms
export const specialForms: { [key: string]: SpecialForm } = {
    "def": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length !== 2) {
            throw new Error("def requires exactly 2 arguments");
        }
        
        const nameExpr = args[0];
        if (nameExpr.type !== "symbol") {
            throw new Error("def requires a symbol as first argument");
        }
        
        const value = interpret(args[1], env);
        env.define(nameExpr.value, value);
        return value;
    },

    "defn": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length < 3) {
            throw new Error("defn requires at least 3 arguments");
        }
        
        const nameExpr = args[0];
        if (nameExpr.type !== "symbol") {
            throw new Error("defn requires a symbol as first argument");
        }
        
        let docstring = "";
        let paramList: HCValue;
        let body: HCValue;
        
        // Check if second argument is a docstring
        if (args[1].type === "string" && args.length >= 4) {
            docstring = args[1].value as string;
            paramList = args[2];
            body = args[3];
        } else {
            paramList = args[1];
            body = args[2];
        }
        
        if (!paramList || (paramList.type !== "list" && paramList.type !== "vector")) {
            throw new Error("defn requires a parameter list");
        }
        
        const params = (paramList.value as HCValue[]).map(param => {
            if (param.type !== "symbol") {
                throw new Error("Parameter names must be symbols");
            }
            return param.value;
        });
        
        const closure: HCValue = {
            type: "closure",
            params,
            body,
            env
        };
        
        env.define(nameExpr.value, closure);
        return closure;
    },

    "fn": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length !== 2) {
            throw new Error("fn requires exactly 2 arguments");
        }
        
        const paramList = args[0];
        const body = args[1];
        
        if (!paramList || (paramList.type !== "list" && paramList.type !== "vector")) {
            throw new Error("fn requires a parameter list");
        }
        
        const params = (paramList.value as HCValue[]).map(param => {
            if (param.type !== "symbol") {
                throw new Error("Parameter names must be symbols");
            }
            return param.value;
        });
        
        return {
            type: "closure",
            params,
            body,
            env
        };
    },

    "let": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length !== 2) {
            throw new Error("let requires exactly 2 arguments");
        }
        
        const bindingList = args[0];
        const body = args[1];
        
        if (!bindingList || (bindingList.type !== "list" && bindingList.type !== "vector")) {
            throw new Error("let requires a binding list");
        }
        
        const bindings = bindingList.value as HCValue[];
        if (bindings.length % 2 !== 0) {
            throw new Error("let binding list must have an even number of elements");
        }
        
        const letEnv = new Environment(env);
        
        for (let i = 0; i < bindings.length; i += 2) {
            const name = bindings[i];
            const valueExpr = bindings[i + 1];
            
            if (name.type !== "symbol") {
                throw new Error("let binding names must be symbols");
            }
            
            const value = interpret(valueExpr, letEnv);
            letEnv.define(name.value, value);
        }
        
        return interpret(body, letEnv);
    },

    "loop": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length !== 2) {
            throw new Error("loop requires exactly 2 arguments");
        }
        
        const bindingList = args[0];
        const body = args[1];
        
        if (!bindingList || (bindingList.type !== "list" && bindingList.type !== "vector")) {
            throw new Error("loop requires a binding list");
        }
        
        const bindings = bindingList.value as HCValue[];
        if (bindings.length % 2 !== 0) {
            throw new Error("loop binding list must have an even number of elements");
        }
        
        const loopEnv = new Environment(env);
        const paramNames: string[] = [];
        const initialValues: HCValue[] = [];
        
        for (let i = 0; i < bindings.length; i += 2) {
            const name = bindings[i];
            const valueExpr = bindings[i + 1];
            
            if (name.type !== "symbol") {
                throw new Error("loop binding names must be symbols");
            }
            
            const value = interpret(valueExpr, env);
            loopEnv.define(name.value, value);
            paramNames.push(name.value);
            initialValues.push(value);
        }
        
        while (true) {
            try {
                const result = interpret(body, loopEnv);
                return result;
            } catch (error) {
                if ((error as any).type === "recur") {
                    const newValues = (error as any).values as HCValue[];
                    if (newValues.length !== paramNames.length) {
                        throw new Error(`recur requires ${paramNames.length} arguments, got ${newValues.length}`);
                    }
                    
                    // Update loop variables
                    for (let i = 0; i < paramNames.length; i++) {
                        loopEnv.set(paramNames[i], newValues[i]);
                    }
                    continue;
                } else {
                    throw error;
                }
            }
        }
    },

    "recur": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        const values = args.map(arg => interpret(arg, env));
        throw { type: "recur", values };
    },

    "if": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length < 2 || args.length > 3) {
            throw new Error("if requires 2 or 3 arguments");
        }
        
        const condition = interpret(args[0], env);
        const isTruthy = condition.type !== "nil" && 
                        (condition.type !== "boolean" || condition.value === true);
        
        if (isTruthy) {
            return interpret(args[1], env);
        } else if (args.length === 3) {
            return interpret(args[2], env);
        } else {
            return { type: "nil", value: null };
        }
    },

    "quote": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        if (args.length !== 1) {
            throw new Error("quote requires exactly 1 argument");
        }
        return args[0];
    },

    "do": (args: HCValue[], env: Environment, interpret: any): HCValue => {
        let result: HCValue = { type: "nil", value: null };
        for (const expr of args) {
            result = interpret(expr, env);
        }
        return result;
    }
};
