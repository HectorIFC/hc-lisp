import HcLisp from "../hc-lisp";
import * as path from "path";

describe('HC-Lisp File Integration Tests', () => {
    beforeEach(() => {
        // Reset context before each test to ensure clean state
        HcLisp.resetContext();
    });

    // Helper function to get test file path
    function getTestFilePath(filename: string): string {
        return path.join(__dirname, filename);
    }

    test('should execute basic-test.hclisp without errors', () => {
        const filePath = getTestFilePath('basic-test.hclisp');
        
        // Capture console output
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        expect(() => HcLisp.evalFile(filePath)).not.toThrow();
        
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
        
        expect(() => HcLisp.evalFile(filePath)).not.toThrow();
        
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
        
        expect(() => HcLisp.evalFile(filePath)).not.toThrow();
        
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
        
        expect(() => HcLisp.evalFile(filePath)).not.toThrow();
        
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
            expect(() => HcLisp.evalFile(filePath)).not.toThrow();
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
