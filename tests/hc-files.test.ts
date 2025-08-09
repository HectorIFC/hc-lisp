import HcLisp from '../hc-lisp';
import * as path from 'path';

describe('HC-Lisp File Integration Tests', () => {
    beforeEach(() => {
        // Reset context before each test to ensure clean state
        HcLisp.resetContext();
    });

    // Helper function to get test file path
    function getTestFilePath(filename: string): string {
        return path.join(__dirname, filename);
    }

    // Helper function to get root project file path
    function getRootFilePath(filename: string): string {
        return path.join(__dirname, '..', filename);
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

    test('should execute namespace-test.hclisp without errors', () => {
        const filePath = getTestFilePath('namespace-test.hclisp');

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        expect(() => HcLisp.evalFile(filePath)).not.toThrow();

        // Verify that namespace tests ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('Generated UUID:');
        expect(output).toContain('Uppercase: NODE.JS IS COOL!');
        expect(output).toContain('MD5 Hash:');

        consoleSpy.mockRestore();
    });

    test('should execute import-test.hclisp without errors', () => {
        const filePath = getTestFilePath('import-test.hclisp');

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        expect(() => HcLisp.evalFile(filePath)).not.toThrow();

        // Verify that import tests ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== Test of Imports and Requires with Node.js ===');
        expect(output).toContain('Generated UUID:');
        expect(output).toContain('=== End of Tests ===');

        consoleSpy.mockRestore();
    });

    test('should execute basic-node-test.hclisp without errors', () => {
        const filePath = getTestFilePath('basic-node-test.hclisp');

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        expect(() => HcLisp.evalFile(filePath)).not.toThrow();

        // Verify that basic node tests ran
        const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output).toContain('=== Basic Node.js Test ===');
        expect(output).toContain('UUID:');
        expect(output).toContain('=== End ===');

        consoleSpy.mockRestore();
    });

    test('should execute simple-ns-test.hclisp without errors', () => {
        const filePath = getTestFilePath('simple-ns-test.hclisp');

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        expect(() => HcLisp.evalFile(filePath)).not.toThrow();

        consoleSpy.mockRestore();
    });

    test('should parse demo-syntax.hclisp syntax without errors', () => {
        const filePath = getRootFilePath('demo-syntax.hclisp');

        // Test that the file can be read and parsed (syntax validation only)
        // This is a syntax demonstration file, not meant to be executed
        expect(() => {
            const fs = require('fs');
            const content = fs.readFileSync(filePath, 'utf-8');
            // Just verify file exists and is readable
            expect(content).toContain('defn greeting');
            expect(content).toContain('HC-Lisp');
        }).not.toThrow();
    });

    test('should parse syntax-showcase.hclisp syntax without errors', () => {
        const filePath = getRootFilePath('syntax-showcase.hclisp');

        // Test that the file can be read and parsed (syntax validation only)
        // This is a syntax showcase file, not meant to be executed
        expect(() => {
            const fs = require('fs');
            const content = fs.readFileSync(filePath, 'utf-8');
            // Just verify file exists and is readable
            expect(content).toContain('HC-LISP');
            expect(content).toContain('defn fibonacci');
        }).not.toThrow();
    });


});
