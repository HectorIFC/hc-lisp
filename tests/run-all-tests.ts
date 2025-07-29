import HcLisp from "../hc-lisp";
import * as fs from "fs";
import * as path from "path";

// Function to execute HC-Lisp files
function executeHCFile(filePath: string): void {
    console.log(`\n=== Executing ${path.basename(filePath)} ===`);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Better expression parsing that handles multi-line expressions
        const lines = content.split('\n');
        let currentExpr = '';
        let parenCount = 0;
        let inString = false;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith(';;')) {
                continue;
            }
            
            // Add line to current expression
            currentExpr += (currentExpr ? ' ' : '') + trimmedLine;
            
            // Count parentheses to determine complete expressions
            for (let i = 0; i < trimmedLine.length; i++) {
                const char = trimmedLine[i];
                
                // Handle string boundaries
                if (char === '"' && (i === 0 || trimmedLine[i-1] !== '\\')) {
                    inString = !inString;
                }
                
                // Only count parentheses outside of strings
                if (!inString) {
                    if (char === '(' || char === '[') parenCount++;
                    if (char === ')' || char === ']') parenCount--;
                }
            }
            
            // If we have a complete expression, evaluate it
            if (parenCount === 0 && currentExpr.trim()) {
                try {
                    HcLisp.eval(currentExpr.trim());
                } catch (error) {
                    console.log(`Error executing "${currentExpr.trim()}": ${(error as Error).message}`);
                }
                currentExpr = '';
            }
        }
        
        // Handle any remaining expression
        if (currentExpr.trim()) {
            try {
                HcLisp.eval(currentExpr.trim());
            } catch (error) {
                console.log(`Error executing "${currentExpr.trim()}": ${(error as Error).message}`);
            }
        }
        
    } catch (error) {
        console.log(`Error reading file ${filePath}: ${(error as Error).message}`);
    }
}

console.log("Running All HC-Lisp Tests\n");

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
