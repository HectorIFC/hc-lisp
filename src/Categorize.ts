// Types for HC-Lisp values
export type HCValue = 
    | { type: "number"; value: number }
    | { type: "string"; value: string }
    | { type: "boolean"; value: boolean }
    | { type: "nil"; value: null }
    | { type: "symbol"; value: string }
    | { type: "keyword"; value: string }
    | { type: "list"; value: HCValue[] }
    | { type: "vector"; value: HCValue[] }
    | { type: "function"; value: (...args: any[]) => any; arity?: number }
    | { type: "closure"; params: string[]; body: HCValue; env: any }
    | { type: "recur"; values: HCValue[] };

export function categorize(token: string): HCValue {
    // Handle numbers (including floats and negatives)
    if (/^-?\d+(\.\d+)?$/.test(token)) {
        return { type: "number", value: parseFloat(token) };
    }
    
    // Handle strings
    if (token[0] === '"' && token.slice(-1) === '"') {
        return { type: "string", value: token.slice(1, -1) };
    }
    
    // Handle booleans
    if (token === "true") {
        return { type: "boolean", value: true };
    }
    if (token === "false") {
        return { type: "boolean", value: false };
    }
    
    // Handle nil
    if (token === "nil") {
        return { type: "nil", value: null };
    }
    
    // Handle keywords (starting with :)
    if (token[0] === ":") {
        return { type: "keyword", value: token.slice(1) };
    }
    
    // Everything else is a symbol
    return { type: "symbol", value: token };
}
