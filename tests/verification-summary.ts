import HcLisp from "../hc-lisp";

console.log("HC-Lisp Test Verification Summary\n");

// Test results tracker
let totalTests = 0;
let passedTests = 0;

function runTest(name: string, testFn: () => void): void {
    totalTests++;
    try {
        testFn();
        console.log(`✓ ${name}`);
        passedTests++;
    } catch (error) {
        console.log(`✗ ${name}: ${(error as Error).message}`);
    }
}

function assertEqual(actual: any, expected: any, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}${message ? ': ' + message : ''}`);
    }
}

console.log("=== Core Language Features ===");

// Basic arithmetic
runTest("Basic arithmetic operations", () => {
    assertEqual(HcLisp.eval("(+ 1 2 3)"), { type: "number", value: 6 });
    assertEqual(HcLisp.eval("(- 10 3)"), { type: "number", value: 7 });
    assertEqual(HcLisp.eval("(* 2 3 4)"), { type: "number", value: 24 });
    assertEqual(HcLisp.eval("(/ 12 3)"), { type: "number", value: 4 });
});

// Data types
runTest("Data type support", () => {
    assertEqual(HcLisp.eval("123"), { type: "number", value: 123 });
    assertEqual(HcLisp.eval("\"hello\""), { type: "string", value: "hello" });
    assertEqual(HcLisp.eval("true"), { type: "boolean", value: true });
    assertEqual(HcLisp.eval("nil"), { type: "nil", value: null });
    assertEqual(HcLisp.eval(":keyword"), { type: "keyword", value: "keyword" });
});

// Scientific notation
runTest("Scientific notation support", () => {
    assertEqual(HcLisp.eval("1e-10"), { type: "number", value: 1e-10 });
    assertEqual(HcLisp.eval("3.14e2"), { type: "number", value: 314 });
});

// Lists and vectors
runTest("Data structures", () => {
    const list = HcLisp.eval("[1 2 3]");
    assertEqual(list.type, "vector");
    assertEqual((list as any).value.length, 3);
});

// Variables
runTest("Variable definition", () => {
    HcLisp.eval("(def x 42)");
    assertEqual(HcLisp.eval("x"), { type: "number", value: 42 });
});

// Functions
runTest("Function definition and calls", () => {
    HcLisp.eval("(defn square [x] (* x x))");
    assertEqual(HcLisp.eval("(square 5)"), { type: "number", value: 25 });
});

// Control flow
runTest("Control structures", () => {
    assertEqual(HcLisp.eval("(if true 1 2)"), { type: "number", value: 1 });
    assertEqual(HcLisp.eval("(let [x 10] (+ x 5))"), { type: "number", value: 15 });
});

console.log("\n=== Advanced Features ===");

// Anonymous functions
runTest("Anonymous functions", () => {
    assertEqual(HcLisp.eval("((fn [x] (* x 2)) 5)"), { type: "number", value: 10 });
});

// Higher-order functions
runTest("Map function", () => {
    HcLisp.eval("(defn double [x] (* x 2))");
    const result = HcLisp.eval("(map double [1 2 3])");
    assertEqual(result.type, "list");
});

// Tail recursion
runTest("Loop and recur", () => {
    const result = HcLisp.eval("(loop [i 0 acc 0] (if (< i 3) (recur (+ i 1) (+ acc i)) acc))");
    assertEqual(result, { type: "number", value: 3 }); // 0 + 1 + 2 = 3
});

console.log("\n=== Mathematical Examples ===");

// Pi calculation
runTest("Pi calculation (Leibniz series)", () => {
    const leibnizPi = `
    (defn leibniz-pi [n]
      (let [terms (map (fn [k] (/ (if (even? k) 1.0 -1.0) (+ (* 2 k) 1)))
                       (range n))]
        (* 4 (reduce + 0 terms))))
    `;
    HcLisp.eval(leibnizPi);
    const result = HcLisp.eval("(leibniz-pi 100)");
    if (result.type !== "number") throw new Error("Pi calculation failed");
    // Check if result is close to π (within 0.1)
    if (Math.abs(result.value - Math.PI) > 0.1) {
        throw new Error(`Pi approximation too far from actual: ${result.value}`);
    }
});

// Square root
runTest("Square root (Newton-Raphson)", () => {
    const sqrt = `
    (defn sqrt [x]
      (let [epsilon 1e-10]
        (loop [guess x]
          (let [next (/ (+ guess (/ x guess)) 2)]
            (if (< (Math/abs (- guess next)) epsilon)
              next
              (recur next))))))
    `;
    HcLisp.eval(sqrt);
    const result = HcLisp.eval("(sqrt 9)");
    if (result.type !== "number") throw new Error("Square root calculation failed");
    if (Math.abs(result.value - 3) > 0.001) {
        throw new Error(`Square root of 9 should be 3, got ${result.value}`);
    }
});

// First element function
runTest("First element function", () => {
    HcLisp.eval("(defn first-element [list] (first list))");
    assertEqual(HcLisp.eval("(first-element [1 2 3])"), { type: "number", value: 1 });
    assertEqual(HcLisp.eval("(first-element [])"), { type: "nil", value: null });
});

console.log("\n=== Error Handling ===");

runTest("Division by zero error", () => {
    try {
        HcLisp.eval("(/ 1 0)");
        throw new Error("Should have thrown division by zero error");
    } catch (error) {
        if (!(error as Error).message.includes("Division by zero")) {
            throw error;
        }
    }
});

runTest("Undefined symbol error", () => {
    try {
        HcLisp.eval("undefined-symbol");
        throw new Error("Should have thrown undefined symbol error");
    } catch (error) {
        if (!(error as Error).message.includes("Undefined symbol")) {
            throw error;
        }
    }
});

runTest("Type error", () => {
    try {
        HcLisp.eval("(+ \"string\" 1)");
        throw new Error("Should have thrown type error");
    } catch (error) {
        if (!(error as Error).message.includes("requires numbers")) {
            throw error;
        }
    }
});

// Final summary
console.log("\n" + "=".repeat(50));
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
    console.log("🎉 ALL TESTS PASSED! HC-Lisp is working correctly.");
} else {
    console.log(`⚠️  ${totalTests - passedTests} test(s) failed.`);
}

console.log("=".repeat(50));
