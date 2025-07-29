import HcLisp from "./hc-lisp";
import * as fs from "fs";

// Simple HC-Lisp file executor with improved expression parsing
function executeHCFile(filePath: string): void {
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
                    console.log(`Error: ${(error as Error).message}`);
                }
                currentExpr = '';
            }
        }
        
        // Handle any remaining expression
        if (currentExpr.trim()) {
            try {
                HcLisp.eval(currentExpr.trim());
            } catch (error) {
                console.log(`Error: ${(error as Error).message}`);
            }
        }
        
    } catch (error) {
        console.log(`Error reading file: ${(error as Error).message}`);
    }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
    console.log("Usage: npx ts-node hc-runner.ts <file.hc>");
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    process.exit(1);
}

console.log(`Executing ${filePath}...\n`);
executeHCFile(filePath);
