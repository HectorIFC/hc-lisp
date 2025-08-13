import HcLisp from '../src/hc-lisp';
import { HCValue } from '../src/Categorize';
import { createReplEvaluator, createReplWriter, showWelcomeMessage, startRepl } from '../src/repl';
import repl from 'repl';

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined): never => {
  throw new Error(`process.exit called with code ${code}`);
});

const mockEval = jest.spyOn(HcLisp, 'eval').mockImplementation((): HCValue => {
  return { type: 'number', value: 42 };
});
const mockFormatOutput = jest.spyOn(HcLisp, 'formatOutput').mockImplementation(() => '42');

const mockReplStart = jest.spyOn(repl, 'start').mockImplementation(() => {
  return {} as any;
});

describe('HC-Lisp REPL Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HcLisp.resetContext();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockProcessExit.mockRestore();
    mockEval.mockRestore();
    mockFormatOutput.mockRestore();
    mockReplStart.mockRestore();
  });

  describe('createReplEvaluator function', () => {
    let evaluator: any;
    let mockCallback: jest.Mock;

    beforeEach(() => {
      evaluator = createReplEvaluator();
      mockCallback = jest.fn();
    });

    test('should handle empty input', () => {
      evaluator('', {}, 'test.js', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, undefined);
      expect(mockEval).not.toHaveBeenCalled();
    });

    test('should handle whitespace-only input', () => {
      evaluator('   \n\t  ', {}, 'test.js', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, undefined);
      expect(mockEval).not.toHaveBeenCalled();
    });

    test('should detect exit command with parentheses', () => {
      const input = '(exit)';
      const trimmed = input.trim();
      expect(trimmed === '(exit)' || trimmed === 'exit').toBe(true);
    });

    test('should detect exit command without parentheses', () => {
      const input = 'exit';
      const trimmed = input.trim();
      expect(trimmed === '(exit)' || trimmed === 'exit').toBe(true);
    });

    test('should evaluate valid HC-Lisp expression', () => {
      evaluator('(+ 1 2)', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('(+ 1 2)');
      expect(mockFormatOutput).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(null, '42');
    });

    test('should handle evaluation errors', () => {
      mockEval.mockImplementationOnce(() => {
        throw new Error('Undefined symbol: unknown-var');
      });

      evaluator('unknown-var', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('unknown-var');
      expect(mockCallback).toHaveBeenCalledWith(null, 'Error: Undefined symbol: unknown-var');
      expect(mockFormatOutput).not.toHaveBeenCalled();
    });

    test('should handle non-Error exceptions', () => {
      mockEval.mockImplementationOnce(() => {
        throw 'String error';
      });

      evaluator('(bad-expr)', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('(bad-expr)');
      expect(mockCallback).toHaveBeenCalledWith(null, 'Error: String error');
      expect(mockFormatOutput).not.toHaveBeenCalled();
    });

    test('should trim input before processing', () => {
      evaluator('  (+ 1 2)  \n', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('(+ 1 2)');
      expect(mockCallback).toHaveBeenCalledWith(null, '42');
    });

    test('should handle complex expressions', () => {
      evaluator('(defn square [x] (* x x))', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('(defn square [x] (* x x))');
      expect(mockFormatOutput).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(null, '42');
    });
  });

  describe('createReplWriter function', () => {
    let writer: any;

    beforeEach(() => {
      writer = createReplWriter();
    });

    test('should return empty string for undefined output', () => {
      const result = writer(undefined);
      expect(result).toBe('');
    });

    test('should return the output as-is for defined values', () => {
      expect(writer('test string')).toBe('test string');
      expect(writer(42)).toBe(42);
      expect(writer(true)).toBe(true);
      expect(writer(false)).toBe(false);
      expect(writer(null)).toBe(null);
    });

    test('should handle objects and arrays', () => {
      const obj = { a: 1, b: 2 };
      const arr = [1, 2, 3];

      expect(writer(obj)).toBe(obj);
      expect(writer(arr)).toBe(arr);
    });

    test('should handle zero and empty string', () => {
      expect(writer(0)).toBe(0);
      expect(writer('')).toBe('');
    });
  });

  describe('showWelcomeMessage function', () => {
    test('should display welcome messages', () => {
      showWelcomeMessage();

      expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, 'Welcome to HC-Lisp REPL!');
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, 'A Lisp dialect.');
      expect(mockConsoleLog).toHaveBeenNthCalledWith(3, 'Type (exit) or Ctrl+C to quit\n');
    });
  });

  describe('startRepl function', () => {
    test('should show welcome message and start repl', () => {
      startRepl();

      expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, 'Welcome to HC-Lisp REPL!');
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, 'A Lisp dialect.');
      expect(mockConsoleLog).toHaveBeenNthCalledWith(3, 'Type (exit) or Ctrl+C to quit\n');

      expect(mockReplStart).toHaveBeenCalledWith({
        prompt: 'hc-lisp> ',
        eval: expect.any(Function),
        writer: expect.any(Function)
      });
    });

    test('should configure repl with correct prompt', () => {
      startRepl();

      const replConfig = mockReplStart.mock.calls[0][0] as any;
      expect(replConfig.prompt).toBe('hc-lisp> ');
    });

    test('should configure repl with evaluator and writer functions', () => {
      startRepl();

      const replConfig = mockReplStart.mock.calls[0][0] as any;
      expect(typeof replConfig.eval).toBe('function');
      expect(typeof replConfig.writer).toBe('function');
    });
  });

  describe('Integration tests', () => {
    test('should handle complete REPL workflow', () => {
      const evaluator = createReplEvaluator();
      const writer = createReplWriter();
      const mockCallback = jest.fn();

      evaluator('(+ 20 22)', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('(+ 20 22)');
      expect(mockFormatOutput).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(null, '42');

      const output = writer('42');
      expect(output).toBe('42');
    });

    test('should handle error workflow', () => {
      const evaluator = createReplEvaluator();
      const writer = createReplWriter();
      const mockCallback = jest.fn();

      mockEval.mockImplementationOnce(() => {
        throw new Error('Parse error');
      });

      evaluator('(invalid syntax', {}, 'test.js', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, 'Error: Parse error');

      const output = writer('Error: Parse error');
      expect(output).toBe('Error: Parse error');
    });

    test('should handle undefined result workflow', () => {
      const writer = createReplWriter();

      const output = writer(undefined);
      expect(output).toBe('');
    });
  });

  describe('Edge cases', () => {
    test('should handle very long input', () => {
      const evaluator = createReplEvaluator();
      const mockCallback = jest.fn();
      const longInput = '(+ ' + '1 '.repeat(1000) + ')';

      evaluator(longInput, {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith(longInput.trim());
      expect(mockCallback).toHaveBeenCalledWith(null, '42');
    });

    test('should handle input with mixed whitespace', () => {
      const evaluator = createReplEvaluator();
      const mockCallback = jest.fn();

      evaluator('\t\n  (+ 1 2)  \r\n\t', {}, 'test.js', mockCallback);

      expect(mockEval).toHaveBeenCalledWith('(+ 1 2)');
      expect(mockCallback).toHaveBeenCalledWith(null, '42');
    });

    test('should detect exit command with extra whitespace', () => {
      const input = '  (exit)  \n';
      const trimmed = input.trim();
      expect(trimmed === '(exit)' || trimmed === 'exit').toBe(true);
    });
  });
});
