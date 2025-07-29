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

function assertApproximatelyEqual(actual: number, expected: number, tolerance: number = 0.001, message?: string): void {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`Expected approximately ${expected} but got ${actual}${message ? ': ' + message : ''}`);
    }
}

function assertEqual(actual: any, expected: any, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}${message ? ': ' + message : ''}`);
    }
}

console.log("Running HC-Lisp Advanced Tests\n");

// Test 1: Calculate Pi using Leibniz series
runTest("Pi calculation using Leibniz series", () => {
    // Define the Leibniz pi function
    const leibnizPi = `
    (defn leibniz-pi
      [n]
      (let [terms (map (fn [k] (/ (if (even? k) 1.0 -1.0) (+ (* 2 k) 1)))
                       (range n))]
        (* 4 (reduce + 0 terms))))
    `;
    
    HcLisp.eval(leibnizPi);
    
    // Test with a smaller number for faster execution
    const result = HcLisp.eval("(leibniz-pi 1000)");
    
    if (result.type !== "number") {
        throw new Error(`Expected number but got ${result.type}`);
    }
    
    // Pi should be approximately 3.14159
    assertApproximatelyEqual(result.value, Math.PI, 0.01, "Pi calculation");
});

// Test 2: Square root using Newton-Raphson method
runTest("Square root calculation using Newton-Raphson", () => {
    const sqrtFn = `
    (defn sqrt
      [x]
      (let [epsilon 1e-10]
        (loop [guess x]
          (let [next (/ (+ guess (/ x guess)) 2)]
            (if (< (Math/abs (- guess next)) epsilon)
              next
              (recur next))))))
    `;
    
    HcLisp.eval(sqrtFn);
    
    // Test square root of 9
    const result9 = HcLisp.eval("(sqrt 9)");
    if (result9.type !== "number") {
        throw new Error(`Expected number but got ${result9.type}`);
    }
    assertApproximatelyEqual(result9.value, 3, 0.0001, "Square root of 9");
    
    // Test square root of 2
    const result2 = HcLisp.eval("(sqrt 2)");
    if (result2.type !== "number") {
        throw new Error(`Expected number but got ${result2.type}`);
    }
    assertApproximatelyEqual(result2.value, Math.sqrt(2), 0.0001, "Square root of 2");
    
    // Test square root of 0.25
    const result025 = HcLisp.eval("(sqrt 0.25)");
    if (result025.type !== "number") {
        throw new Error(`Expected number but got ${result025.type}`);
    }
    assertApproximatelyEqual(result025.value, 0.5, 0.0001, "Square root of 0.25");
});

// Test 3: First element function
runTest("First element function", () => {
    const firstElementFn = `
    (defn first-element
      [list]
      (first list))
    `;
    
    HcLisp.eval(firstElementFn);
    
    // Test with numeric vector
    const result1 = HcLisp.eval("(first-element [1 2 3 4])");
    assertEqual(result1, { type: "number", value: 1 }, "First element of [1 2 3 4]");
    
    // Test with keyword list
    const result2 = HcLisp.eval("(first-element [:a :b :c])");
    assertEqual(result2, { type: "keyword", value: "a" }, "First element of [:a :b :c]");
    
    // Test with empty list
    const result3 = HcLisp.eval("(first-element [])");
    assertEqual(result3, { type: "nil", value: null }, "First element of empty list");
});

// Test additional math functions needed for the calculations
runTest("Math/abs function", () => {
    const result = HcLisp.eval("(Math/abs -5)");
    assertEqual(result, { type: "number", value: 5 });
});

// Test map function with anonymous functions
runTest("Map with anonymous function", () => {
    const result = HcLisp.eval("(map (fn [x] (* x 2)) [1 2 3])");
    if (result.type !== "list") {
        throw new Error(`Expected list but got ${result.type}`);
    }
    
    const expected = [
        { type: "number", value: 2 },
        { type: "number", value: 4 },
        { type: "number", value: 6 }
    ];
    assertEqual(result.value, expected);
});

// Test reduce function
runTest("Reduce function", () => {
    const result = HcLisp.eval("(reduce + 0 [1 2 3 4])");
    assertEqual(result, { type: "number", value: 10 });
});

console.log("\nAdvanced tests completed!");
