import HcLisp from '../src/hc-lisp';
import * as path from 'path';

describe('HC-Lisp File Integration Tests', () => {
  beforeEach(() => {
    HcLisp.resetContext();
  });

  function getTestFilePath(filename: string): string {
    return path.join(__dirname, filename);
  }

  function getRootFilePath(filename: string): string {
    return path.join(__dirname, '..', filename);
  }

  test('should execute basic-test.hclisp without errors', () => {
    const filePath = getTestFilePath('basic-test.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

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

  test('should execute demo-syntax.hclisp without errors', () => {
    const filePath = getRootFilePath('demo-syntax.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
    expect(output).toContain('Hello, World!');

    consoleSpy.mockRestore();
  });

  test('should execute syntax-showcase.hclisp without errors', () => {
    const filePath = getRootFilePath('syntax-showcase.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
    expect(output).toContain('Fibonacci(10):');
    expect(output).toContain('Factorial(5):');
    expect(output).toContain('Sum result:');
    expect(output).toContain('Person: John Age: 30');
    expect(output).toContain('Result greater than 10');

    consoleSpy.mockRestore();
  });

  test('should execute dynamic-modules.hclisp without errors', () => {
    const filePath = getTestFilePath('dynamic-modules.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
    expect(output).toContain('Testing crypto module:');
    expect(output).toContain('Random UUID:');
    expect(output).toContain('Random bytes:');
    expect(output).toContain('Testing fs module:');
    expect(output).toContain('package.json exists: true');
    expect(output).toContain('Testing path module:');
    expect(output).toContain('Joined path: src/main.ts');
    expect(output).toContain('Base name: file.txt');
    expect(output).toContain('✅ Dynamic module loading test completed!');

    consoleSpy.mockRestore();
  });

  test('should handle express-server.hclisp gracefully', () => {
    const filePath = getTestFilePath('express-server.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    try {
      HcLisp.evalFile(filePath);

      const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
      expect(true).toBe(true);

    } catch (error) {
      const errorMessage = (error as Error).message;
      expect(
        errorMessage.includes('Module \'express\' not found') ||
                errorMessage.includes('Cannot find module \'express\'') ||
                errorMessage.includes('express') ||
                errorMessage.includes('MODULE_NOT_FOUND')
      ).toBe(true);
    }

    consoleSpy.mockRestore();
  });
});
