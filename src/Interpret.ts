import { HCValue } from "./Categorize";
import { Environment } from "./Context";
import { createGlobalEnvironment } from "./Library";
import { specialForms } from "./Keywords";

export function interpret(input: HCValue, env?: Environment): HCValue {
    if (!env) {
        env = createGlobalEnvironment();
    }
    
    return evaluateExpression(input, env);
}

function evaluateExpression(expr: HCValue, env: Environment): HCValue {
    switch (expr.type) {
        case "number":
        case "string":
        case "boolean":
        case "nil":
        case "keyword":
            return expr;
            
        case "symbol":
            try {
                return env.get(expr.value);
            } catch (error) {
                throw new Error(`Undefined symbol: ${expr.value}`);
            }
            
        case "vector":
            // Vectors evaluate their elements
            const evaluatedVector = expr.value.map(item => evaluateExpression(item, env));
            return { type: "vector", value: evaluatedVector };
            
        case "list":
            if (expr.value.length === 0) {
                return expr; // Empty list evaluates to itself
            }
            
            const [first, ...rest] = expr.value;
            
            // Check if it's a special form
            if (first.type === "symbol" && specialForms[first.value]) {
                return specialForms[first.value](rest, env, evaluateExpression);
            }
            
            // Regular function call
            const fn = evaluateExpression(first, env);
            const args = rest.map(arg => evaluateExpression(arg, env));
            
            return callFunction(fn, args, env);
            
        default:
            throw new Error(`Cannot evaluate expression of type: ${expr.type}`);
    }
}

function callFunction(fn: HCValue, args: HCValue[], env: Environment): HCValue {
    switch (fn.type) {
        case "function":
            try {
                return fn.value(...args);
            } catch (error) {
                throw new Error(`Function call error: ${(error as Error).message}`);
            }
            
        case "closure":
            const { params, body, env: closureEnv } = fn;
            
            if (args.length !== params.length) {
                throw new Error(`Function expects ${params.length} arguments, got ${args.length}`);
            }
            
            const callEnv = closureEnv.extend(params, args);
            
            try {
                return evaluateExpression(body, callEnv);
            } catch (error) {
                // Handle recur for tail recursion
                if ((error as any).type === "recur") {
                    const newValues = (error as any).values as HCValue[];
                    if (newValues.length !== params.length) {
                        throw new Error(`recur requires ${params.length} arguments, got ${newValues.length}`);
                    }
                    
                    // Create a new environment with updated parameters
                    const recurEnv = closureEnv.extend(params, newValues);
                    return evaluateExpression(body, recurEnv);
                } else {
                    throw error;
                }
            }
            
        default:
            throw new Error(`Cannot call non-function value: ${fn.type}`);
    }
}

// Enhanced map and reduce that work with closures
export function mapWithClosure(fn: HCValue, seq: HCValue, env: Environment): HCValue {
    if (fn.type !== "function" && fn.type !== "closure") {
        throw new Error("map requires a function as first argument");
    }
    
    if (seq.type !== "list" && seq.type !== "vector") {
        throw new Error("map requires a sequence as second argument");
    }
    
    const items = seq.value;
    const mapped = items.map(item => {
        if (fn.type === "function") {
            return fn.value(item);
        } else {
            return callFunction(fn, [item], env);
        }
    });
    
    return { type: "list", value: mapped };
}

export function reduceWithClosure(fn: HCValue, initial: HCValue, seq: HCValue, env: Environment): HCValue {
    if (fn.type !== "function" && fn.type !== "closure") {
        throw new Error("reduce requires a function as first argument");
    }
    
    if (seq.type !== "list" && seq.type !== "vector") {
        throw new Error("reduce requires a sequence as third argument");
    }
    
    const items = seq.value;
    let acc = initial;
    
    for (const item of items) {
        if (fn.type === "function") {
            acc = fn.value(acc, item);
        } else {
            acc = callFunction(fn, [acc, item], env);
        }
    }
    
    return acc;
}
