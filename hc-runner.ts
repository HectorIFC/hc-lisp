import HcLisp from "./hc-lisp";
import * as fs from "fs";

// Simple HC-Lisp file executor
function executeHCFile(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Simple expression splitting - handles basic cases
        const lines = content.split('\n');
        let currentExpr = '';
        let parenCount = 0;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith(';;')) {
                continue;
            }
            
            currentExpr += ' ' + trimmedLine;
            
            // Count parentheses to determine complete expressions
            for (const char of trimmedLine) {
                if (char === '(') parenCount++;
                if (char === ')') parenCount--;
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
