import HcLisp from "../hc-lisp";
import * as fs from "fs";
import * as path from "path";

// Function to execute HC-Lisp files
function executeHCFile(filePath: string): void {
    console.log(`\n=== Executing ${path.basename(filePath)} ===`);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Split the content into expressions (basic approach)
        const expressions = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith(';;'))
            .join(' ')
            .split(/(?<=\))\s+(?=\()/);
        
        for (const expr of expressions) {
            if (expr.trim()) {
                try {
                    HcLisp.eval(expr.trim());
                } catch (error) {
                    console.log(`Error executing "${expr.trim()}": ${(error as Error).message}`);
                }
            }
        }
    } catch (error) {
        console.log(`Error reading file ${filePath}: ${(error as Error).message}`);
    }
}

console.log("Running All HC-Lisp Tests\n");

// Run TypeScript tests
console.log("=== Running Basic TypeScript Tests ===");
try {
    require('./basic-tests');
} catch (error) {
    console.log(`Error running basic tests: ${(error as Error).message}`);
}

console.log("\n=== Running Advanced TypeScript Tests ===");
try {
    require('./advanced-tests');
} catch (error) {
    console.log(`Error running advanced tests: ${(error as Error).message}`);
}

// Run HC files
const testFiles = [
    'basic-test.hc',
    'pi-test.hc', 
    'sqrt-test.hc',
    'first-element-test.hc'
];

for (const testFile of testFiles) {
    const filePath = path.join(__dirname, testFile);
    if (fs.existsSync(filePath)) {
        executeHCFile(filePath);
    } else {
        console.log(`Test file ${testFile} not found`);
    }
}

console.log("\n=== All tests completed! ===");
