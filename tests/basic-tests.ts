import HcLisp from "../hc-lisp";

// Test runner
function runTest(name: string, testFn: () => void): void {
    try {
        testFn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.log(`✗ ${name}: ${(error as Error).message}`);
    }
}

function assertEqual(actual: any, expected: any, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}${message ? ': ' + message : ''}`);
    }
}

console.log("Running HC-Lisp Basic Tests\n");

// Test arithmetic operations
runTest("Addition", () => {
    const result = HcLisp.eval("(+ 1 2 3)");
    assertEqual(result, { type: "number", value: 6 });
});

runTest("Subtraction", () => {
    const result = HcLisp.eval("(- 10 3 2)");
    assertEqual(result, { type: "number", value: 5 });
});

runTest("Multiplication", () => {
    const result = HcLisp.eval("(* 2 3 4)");
    assertEqual(result, { type: "number", value: 24 });
});

runTest("Division", () => {
    const result = HcLisp.eval("(/ 12 3)");
    assertEqual(result, { type: "number", value: 4 });
});

// Test comparison operations
runTest("Less than", () => {
    const result = HcLisp.eval("(< 3 5)");
    assertEqual(result, { type: "boolean", value: true });
});

runTest("Greater than", () => {
    const result = HcLisp.eval("(> 5 3)");
    assertEqual(result, { type: "boolean", value: true });
});

runTest("Equality", () => {
    const result = HcLisp.eval("(= 3 3)");
    assertEqual(result, { type: "boolean", value: true });
});

// Test list operations
runTest("First element", () => {
    const result = HcLisp.eval("(first [1 2 3])");
    assertEqual(result, { type: "number", value: 1 });
});

runTest("First of empty list", () => {
    const result = HcLisp.eval("(first [])");
    assertEqual(result, { type: "nil", value: null });
});

runTest("Count elements", () => {
    const result = HcLisp.eval("(count [1 2 3 4])");
    assertEqual(result, { type: "number", value: 4 });
});

// Test predicates
runTest("Even predicate", () => {
    const result1 = HcLisp.eval("(even? 4)");
    const result2 = HcLisp.eval("(even? 3)");
    assertEqual(result1, { type: "boolean", value: true });
    assertEqual(result2, { type: "boolean", value: false });
});

// Test variable definition
runTest("Variable definition", () => {
    HcLisp.eval("(def x 42)");
    const result = HcLisp.eval("x");
    assertEqual(result, { type: "number", value: 42 });
});

// Test if statement
runTest("If statement - true", () => {
    const result = HcLisp.eval("(if true 1 2)");
    assertEqual(result, { type: "number", value: 1 });
});

runTest("If statement - false", () => {
    const result = HcLisp.eval("(if false 1 2)");
    assertEqual(result, { type: "number", value: 2 });
});

// Test let binding
runTest("Let binding", () => {
    const result = HcLisp.eval("(let [x 10 y 20] (+ x y))");
    assertEqual(result, { type: "number", value: 30 });
});

// Test function definition and call
runTest("Function definition and call", () => {
    HcLisp.eval("(defn square [x] (* x x))");
    const result = HcLisp.eval("(square 5)");
    assertEqual(result, { type: "number", value: 25 });
});

// Test range function
runTest("Range function", () => {
    const result = HcLisp.eval("(count (range 5))");
    assertEqual(result, { type: "number", value: 5 });
});

console.log("\nBasic tests completed!");
