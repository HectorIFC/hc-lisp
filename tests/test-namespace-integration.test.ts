import HcLisp from '../src/hc-lisp';
import * as path from 'path';

describe('HC-Lisp Namespace Integration Tests', () => {
  beforeEach(() => {
    HcLisp.resetContext();
  });

  function getTestFilePath(filename: string): string {
    return path.join(__dirname, filename);
  }

  test('should execute test-namespace-1.hclisp with proper dependency resolution', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');

    expect(output).toContain('=== Testing dependencies between files ===');
    expect(output).toContain('Calculating 10 + 20 = 30');
    expect(output).toContain('Result 5 * 3 = 15');
    expect(output).toContain('Calling test-namespace-2/add directly: 40');
    expect(output).toContain('=== Test completed ===');

    consoleSpy.mockRestore();
  });

  test('should verify that test-namespace-2 namespace functions are accessible', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    const addResult = HcLisp.eval('(test-namespace-2/add 5 7)');
    expect(addResult.type).toBe('number');
    if (addResult.type === 'number') {
      expect(addResult.value).toBe(12);
    }

    const multiplyResult = HcLisp.eval('(test-namespace-2/multiply 3 4)');
    expect(multiplyResult.type).toBe('number');
    if (multiplyResult.type === 'number') {
      expect(multiplyResult.value).toBe(12);
    }
  });

  test('should verify direct access to test-namespace-2 namespace functions', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');
    HcLisp.evalFile(filePath);

    const addResult = HcLisp.eval('(test-namespace-2/add 100 200)');
    expect(addResult.type).toBe('number');
    if (addResult.type === 'number') {
      expect(addResult.value).toBe(300);
    }

    const multiplyResult = HcLisp.eval('(test-namespace-2/multiply 6 7)');
    expect(multiplyResult.type).toBe('number');
    if (multiplyResult.type === 'number') {
      expect(multiplyResult.value).toBe(42);
    }
  });

  test('should handle namespace isolation correctly', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');
    HcLisp.evalFile(filePath);

    expect(() => HcLisp.eval('(add 1 2)')).toThrow();
    expect(() => HcLisp.eval('(multiply 3 4)')).toThrow();

    const addResult = HcLisp.eval('(test-namespace-2/add 1 2)');
    expect(addResult.type).toBe('number');
    if (addResult.type === 'number') {
      expect(addResult.value).toBe(3);
    }
  });

  test('should verify that built-in functions are still available in namespaces', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    expect(consoleSpy.mock.calls.length).toBeGreaterThan(0);

    consoleSpy.mockRestore();
  });

  test('should handle error cases gracefully', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');
    HcLisp.evalFile(filePath);

    expect(() => HcLisp.eval('(test-namespace-2/nonexistent 1 2)')).toThrow();

    expect(() => HcLisp.eval('(nonexistent/add 1 2)')).toThrow();
  });

  test('should support complex namespace interactions within file execution', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    expect(() => HcLisp.evalFile(filePath)).not.toThrow();

    const output = consoleSpy.mock.calls.map(call => call.join(' ')).join('\n');
    expect(output).toContain('Calculating 10 + 20 = 30');
    expect(output).toContain('Result 5 * 3 = 15');

    consoleSpy.mockRestore();
  });

  test('should maintain namespace state across multiple evaluations', () => {
    const filePath = getTestFilePath('test-namespace-1.hclisp');
    HcLisp.evalFile(filePath);

    const result1 = HcLisp.eval('(test-namespace-2/add 10 20)');
    expect(result1.type).toBe('number');
    if (result1.type === 'number') {
      expect(result1.value).toBe(30);
    }

    const result2 = HcLisp.eval('(test-namespace-2/multiply 6 7)');
    expect(result2.type).toBe('number');
    if (result2.type === 'number') {
      expect(result2.value).toBe(42);
    }

    const result3 = HcLisp.eval('(+ (test-namespace-2/add 1 2) (test-namespace-2/multiply 3 4))');
    expect(result3.type).toBe('number');
    if (result3.type === 'number') {
      expect(result3.value).toBe(15);
    }
  });
});
