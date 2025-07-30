import HcLisp from "../hc-lisp";
import * as fs from "fs";
import * as path from "path";

describe('HC-Lisp File Integration Tests', () => {
    beforeEach(() => {
        // Reset context before each test to ensure clean state
        HcLisp.resetContext();
    });

    // Helper function to execute HC-Lisp files
    function executeHCFile(filePath: string): void {
        const content = fs.readFileSync(filePath, 'utf-8');
        HcLisp.eval(content);
    }

    // Helper function to check if file exists
    function getTestFilePath(filename: string): string {
        const filePath = path.join(__dirname, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Test file ${filename} not found`);
        }
        return filePath;
    }

    test('should execute basic-test.hclisp without errors', () => {
        const filePath = getTestFilePath('basic-test.hclisp');
        
        // Capture console output
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        expect(() => executeHCFile(filePath)).not.toThrow();
        
        // Verify that basic tests ran successfully
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== Basic Tests ===');
        expect(output).toContain('Addition test: (+ 1 2 3) => 6');
        expect(output).toContain('Subtraction test: (- 10 3) => 7');
        expect(output).toContain('=== End of Basic Tests ===');
        
        consoleSpy.mockRestore();
    });

    test('should execute pi-test.hclisp without errors', () => {
        const filePath = getTestFilePath('pi-test.hclisp');
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        expect(() => executeHCFile(filePath)).not.toThrow();
        
        // Verify that pi calculation ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== Pi Calculation Test ===');
        expect(output).toContain('Pi approximated with');
        expect(output).toContain('=== End of Pi Test ===');
        
        consoleSpy.mockRestore();
    });

    test('should execute sqrt-test.hclisp without errors', () => {
        const filePath = getTestFilePath('sqrt-test.hclisp');
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        expect(() => executeHCFile(filePath)).not.toThrow();
        
        // Verify that sqrt tests ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== Square Root Test ===');
        expect(output).toContain('Square root of 9: 3');
        expect(output).toContain('=== End of Square Root Test ===');
        
        consoleSpy.mockRestore();
    });

    test('should execute first-element-test.hclisp without errors', () => {
        const filePath = getTestFilePath('first-element-test.hclisp');
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        expect(() => executeHCFile(filePath)).not.toThrow();
        
        // Verify that first element tests ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== First Element Test ===');
        expect(output).toContain('First element of [1 2 3 4]:');
        expect(output).toContain('=== End of First Element Test ===');
        
        consoleSpy.mockRestore();
    });

    test('should execute all HC files in sequence', () => {
        const testFiles = [
            'basic-test.hclisp',
            'pi-test.hclisp', 
            'sqrt-test.hclisp',
            'first-element-test.hclisp'
        ];

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        // Execute all files
        testFiles.forEach(testFile => {
            const filePath = getTestFilePath(testFile);
            expect(() => executeHCFile(filePath)).not.toThrow();
        });
        
        // Verify all tests ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== Basic Tests ===');
        expect(output).toContain('=== Pi Calculation Test ===');
        expect(output).toContain('=== Square Root Test ===');
        expect(output).toContain('=== First Element Test ===');
        
        consoleSpy.mockRestore();
    });
});
