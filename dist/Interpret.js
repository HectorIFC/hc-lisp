"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpret = interpret;
exports.mapWithClosure = mapWithClosure;
exports.reduceWithClosure = reduceWithClosure;
const Library_1 = require("./Library");
const Keywords_1 = require("./Keywords");
function interpret(input, env, nsManager) {
    if (!env) {
        env = (0, Library_1.createGlobalEnvironment)();
    }
    return evaluateExpression(input, env, nsManager);
}
function evaluateExpression(expr, env, nsManager) {
    switch (expr.type) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'nil':
        case 'keyword':
            return expr;
        case 'symbol':
            try {
                if (nsManager) {
                    return nsManager.resolveSymbol(expr.value, env);
                }
                return env.get(expr.value);
            }
            catch (error) {
                throw new Error(`Undefined symbol: ${expr.value}`);
            }
        case 'vector':
            const evaluatedVector = expr.value.map(item => evaluateExpression(item, env, nsManager));
            return { type: 'vector', value: evaluatedVector };
        case 'list':
            if (expr.value.length === 0) {
                return expr;
            }
            const [first, ...rest] = expr.value;
            if (first.type === 'symbol' && Keywords_1.specialForms[first.value]) {
                return Keywords_1.specialForms[first.value](rest, env, (e, env) => evaluateExpression(e, env, nsManager), nsManager);
            }
            if (first.type === 'symbol') {
                if (first.value === 'map' && rest.length === 2) {
                    const fn = evaluateExpression(rest[0], env, nsManager);
                    const seq = evaluateExpression(rest[1], env, nsManager);
                    return mapWithClosure(fn, seq, env, nsManager);
                }
                if (first.value === 'reduce' && rest.length === 3) {
                    const fn = evaluateExpression(rest[0], env, nsManager);
                    const initial = evaluateExpression(rest[1], env, nsManager);
                    const seq = evaluateExpression(rest[2], env, nsManager);
                    return reduceWithClosure(fn, initial, seq, env, nsManager);
                }
            }
            const fn = evaluateExpression(first, env, nsManager);
            const args = rest.map(arg => evaluateExpression(arg, env, nsManager));
            return callFunction(fn, args, env, nsManager);
        default:
            throw new Error(`Cannot evaluate expression of type: ${expr.type}`);
    }
}
function callFunction(fn, args, env, nsManager) {
    switch (fn.type) {
        case 'function':
            try {
                return fn.value(...args);
            }
            catch (error) {
                throw new Error(`Function call error: ${error.message}`);
            }
        case 'closure':
            const { params, body, env: closureEnv } = fn;
            if (args.length !== params.length) {
                throw new Error(`Function expects ${params.length} arguments, got ${args.length}`);
            }
            const callEnv = closureEnv.extend(params, args);
            try {
                return evaluateExpression(body, callEnv, nsManager);
            }
            catch (error) {
                if (error.type === 'recur') {
                    const newValues = error.values;
                    if (newValues.length !== params.length) {
                        throw new Error(`recur requires ${params.length} arguments, got ${newValues.length}`);
                    }
                    const recurEnv = closureEnv.extend(params, newValues);
                    return evaluateExpression(body, recurEnv, nsManager);
                }
                else {
                    throw error;
                }
            }
        default:
            throw new Error(`Cannot call non-function value: ${fn.type}`);
    }
}
function mapWithClosure(fn, seq, env, nsManager) {
    if (fn.type !== 'function' && fn.type !== 'closure') {
        throw new Error('map requires a function as first argument');
    }
    if (seq.type !== 'list' && seq.type !== 'vector') {
        throw new Error('map requires a sequence as second argument');
    }
    const items = seq.value;
    const mapped = items.map(item => {
        if (fn.type === 'function') {
            return fn.value(item);
        }
        else {
            return callFunction(fn, [item], env, nsManager);
        }
    });
    return { type: 'list', value: mapped };
}
function reduceWithClosure(fn, initial, seq, env, nsManager) {
    if (fn.type !== 'function' && fn.type !== 'closure') {
        throw new Error('reduce requires a function as first argument');
    }
    if (seq.type !== 'list' && seq.type !== 'vector') {
        throw new Error('reduce requires a sequence as third argument');
    }
    const items = seq.value;
    let acc = initial;
    for (const item of items) {
        if (fn.type === 'function') {
            acc = fn.value(acc, item);
        }
        else {
            acc = callFunction(fn, [acc, item], env, nsManager);
        }
    }
    return acc;
}
//# sourceMappingURL=Interpret.js.map