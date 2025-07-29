
import { HCValue } from "./Categorize";
import { Environment } from "./Context";

// Utility functions
function isNumber(value: HCValue): value is { type: "number"; value: number } {
    return value.type === "number";
}

function isList(value: HCValue): value is { type: "list"; value: HCValue[] } {
    return value.type === "list";
}

function isVector(value: HCValue): value is { type: "vector"; value: HCValue[] } {
    return value.type === "vector";
}

function isSeq(value: HCValue): value is { type: "list"; value: HCValue[] } | { type: "vector"; value: HCValue[] } {
    return isList(value) || isVector(value);
}

function toJSValue(value: HCValue): any {
    switch (value.type) {
        case "number":
        case "string":
        case "boolean":
            return value.value;
        case "nil":
            return null;
        case "symbol":
        case "keyword":
            return value.value;
        case "list":
        case "vector":
            return value.value.map(toJSValue);
        case "function":
            return value.value;
        case "closure":
            return `<closure>`;
        default:
            return value;
    }
}

// Core functions
const coreFunctions = {
    // Arithmetic
    "+": (...args: HCValue[]): HCValue => {
        const sum = args.reduce((acc, val) => {
            if (!isNumber(val)) throw new Error("+ requires numbers");
            return acc + val.value;
        }, 0);
        return { type: "number", value: sum };
    },

    "-": (...args: HCValue[]): HCValue => {
        if (args.length === 0) throw new Error("- requires at least one argument");
        if (args.length === 1) {
            if (!isNumber(args[0])) throw new Error("- requires numbers");
            return { type: "number", value: -args[0].value };
        }
        const first = args[0];
        if (!isNumber(first)) throw new Error("- requires numbers");
        const result = args.slice(1).reduce((acc, val) => {
            if (!isNumber(val)) throw new Error("- requires numbers");
            return acc - val.value;
        }, first.value);
        return { type: "number", value: result };
    },

    "*": (...args: HCValue[]): HCValue => {
        const product = args.reduce((acc, val) => {
            if (!isNumber(val)) throw new Error("* requires numbers");
            return acc * val.value;
        }, 1);
        return { type: "number", value: product };
    },

    "/": (...args: HCValue[]): HCValue => {
        if (args.length === 0) throw new Error("/ requires at least one argument");
        const first = args[0];
        if (!isNumber(first)) throw new Error("/ requires numbers");
        const result = args.slice(1).reduce((acc, val) => {
            if (!isNumber(val)) throw new Error("/ requires numbers");
            if (val.value === 0) throw new Error("Division by zero");
            return acc / val.value;
        }, first.value);
        return { type: "number", value: result };
    },

    // Comparison
    "=": (a: HCValue, b: HCValue): HCValue => {
        return { type: "boolean", value: JSON.stringify(a) === JSON.stringify(b) };
    },

    "<": (a: HCValue, b: HCValue): HCValue => {
        if (!isNumber(a) || !isNumber(b)) throw new Error("< requires numbers");
        return { type: "boolean", value: a.value < b.value };
    },

    ">": (a: HCValue, b: HCValue): HCValue => {
        if (!isNumber(a) || !isNumber(b)) throw new Error("> requires numbers");
        return { type: "boolean", value: a.value > b.value };
    },

    "<=": (a: HCValue, b: HCValue): HCValue => {
        if (!isNumber(a) || !isNumber(b)) throw new Error("<= requires numbers");
        return { type: "boolean", value: a.value <= b.value };
    },

    ">=": (a: HCValue, b: HCValue): HCValue => {
        if (!isNumber(a) || !isNumber(b)) throw new Error(">= requires numbers");
        return { type: "boolean", value: a.value >= b.value };
    },

    // List operations
    "first": (seq: HCValue): HCValue => {
        if (!isSeq(seq)) throw new Error("first requires a sequence");
        const items = seq.value;
        return items.length > 0 ? items[0] : { type: "nil", value: null };
    },

    "rest": (seq: HCValue): HCValue => {
        if (!isSeq(seq)) throw new Error("rest requires a sequence");
        const items = seq.value;
        return { type: "list", value: items.slice(1) };
    },

    "cons": (item: HCValue, seq: HCValue): HCValue => {
        if (!isSeq(seq)) throw new Error("cons requires a sequence as second argument");
        const items = seq.value;
        return { type: "list", value: [item, ...items] };
    },

    "count": (seq: HCValue): HCValue => {
        if (seq.type === "nil") return { type: "number", value: 0 };
        if (!isSeq(seq)) throw new Error("count requires a sequence");
        return { type: "number", value: seq.value.length };
    },

    // Predicates
    "nil?": (value: HCValue): HCValue => {
        return { type: "boolean", value: value.type === "nil" };
    },

    "empty?": (seq: HCValue): HCValue => {
        if (seq.type === "nil") return { type: "boolean", value: true };
        if (!isSeq(seq)) return { type: "boolean", value: false };
        return { type: "boolean", value: seq.value.length === 0 };
    },

    "even?": (n: HCValue): HCValue => {
        if (!isNumber(n)) throw new Error("even? requires a number");
        return { type: "boolean", value: n.value % 2 === 0 };
    },

    "odd?": (n: HCValue): HCValue => {
        if (!isNumber(n)) throw new Error("odd? requires a number");
        return { type: "boolean", value: n.value % 2 !== 0 };
    },

    // Math functions
    "Math/abs": (n: HCValue): HCValue => {
        if (!isNumber(n)) throw new Error("Math/abs requires a number");
        return { type: "number", value: Math.abs(n.value) };
    },

    "sqrt": (n: HCValue): HCValue => {
        if (!isNumber(n)) throw new Error("sqrt requires a number");
        if (n.value < 0) throw new Error("sqrt requires a non-negative number");
        return { type: "number", value: Math.sqrt(n.value) };
    },

    // I/O
    "println": (...args: HCValue[]): HCValue => {
        const output = args.map(arg => {
            if (arg.type === "string") return arg.value;
            if (arg.type === "nil") return "nil";
            if (arg.type === "keyword") return `:${arg.value}`;
            return JSON.stringify(toJSValue(arg));
        }).join(" ");
        console.log(output);
        return { type: "nil", value: null };
    },

    "print": (...args: HCValue[]): HCValue => {
        const output = args.map(arg => {
            if (arg.type === "string") return arg.value;
            if (arg.type === "nil") return "nil";
            if (arg.type === "keyword") return `:${arg.value}`;
            return JSON.stringify(toJSValue(arg));
        }).join(" ");
        process.stdout.write(output);
        return { type: "nil", value: null };
    },

    // Collection functions
    "map": (fn: HCValue, seq: HCValue): HCValue => {
        if (fn.type !== "function" && fn.type !== "closure") {
            throw new Error("map requires a function as first argument");
        }
        if (!isSeq(seq)) throw new Error("map requires a sequence as second argument");
        
        // This will be handled by mapWithClosure in the interpreter
        throw new Error("map with closures should be handled by the interpreter");
    },

    "reduce": (fn: HCValue, initial: HCValue, seq: HCValue): HCValue => {
        if (fn.type !== "function" && fn.type !== "closure") {
            throw new Error("reduce requires a function as first argument");
        }
        if (!isSeq(seq)) throw new Error("reduce requires a sequence as third argument");
        
        // This will be handled by reduceWithClosure in the interpreter
        throw new Error("reduce with closures should be handled by the interpreter");
    },

    "range": (...args: HCValue[]): HCValue => {
        if (args.length === 0 || args.length > 3) {
            throw new Error("range takes 1-3 arguments");
        }
        
        let start = 0, end = 0, step = 1;
        
        if (args.length === 1) {
            if (!isNumber(args[0])) throw new Error("range requires numbers");
            end = args[0].value;
        } else if (args.length === 2) {
            if (!isNumber(args[0]) || !isNumber(args[1])) throw new Error("range requires numbers");
            start = args[0].value;
            end = args[1].value;
        } else {
            if (!isNumber(args[0]) || !isNumber(args[1]) || !isNumber(args[2])) {
                throw new Error("range requires numbers");
            }
            start = args[0].value;
            end = args[1].value;
            step = args[2].value;
        }
        
        const result: HCValue[] = [];
        if (step > 0) {
            for (let i = start; i < end; i += step) {
                result.push({ type: "number", value: i });
            }
        } else {
            for (let i = start; i > end; i += step) {
                result.push({ type: "number", value: i });
            }
        }
        
        return { type: "list", value: result };
    }
};

export function createGlobalEnvironment(): Environment {
    const globalEnv = new Environment();
    
    // Add core functions
    Object.entries(coreFunctions).forEach(([name, fn]) => {
        globalEnv.define(name, { type: "function", value: fn });
    });
    
    return globalEnv;
}

// Legacy export for backward compatibility
export default {
    first: (value: any) => value[0],
    rest: (value: any) => value.slice(1),
    print: (value: any) => {
        console.log(value);
        return undefined;
    },
    add: (...args: any) => args.reduce((previous: any, current: any) => previous + current),
    dec: (...args: any) => args.reduce((previous: any, current: any) => previous - current)
};