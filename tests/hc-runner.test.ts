import HcLisp from '../src/hc-lisp';
import { HCValue } from '../src/Categorize';
import { executeHCFile, showUsage, main } from '../src/hc-runner';

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined): never => {
  throw new Error(`process.exit called with code ${code}`);
});

const mockEvalFile = jest.spyOn(HcLisp, 'evalFile').mockImplementation((): HCValue => {
  return { type: 'nil', value: null };
});

describe('HC-Runner CLI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HcLisp.resetContext();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
    mockProcessExit.mockRestore();
    mockEvalFile.mockRestore();
  });

  describe('executeHCFile function', () => {
    test('should execute file successfully', () => {
      executeHCFile('test-file.hclisp');

      expect(mockEvalFile).toHaveBeenCalledWith('test-file.hclisp');
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    test('should handle HcLisp.evalFile errors gracefully', () => {
      mockEvalFile.mockImplementationOnce(() => {
        throw new Error('File parsing error');
      });

      expect(() => {
        executeHCFile('invalid-file.hclisp');
      }).toThrow('process.exit called with code 1');

      expect(mockEvalFile).toHaveBeenCalledWith('invalid-file.hclisp');
      expect(mockConsoleError).toHaveBeenCalledWith('Error: File parsing error');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle syntax errors', () => {
      mockEvalFile.mockImplementationOnce(() => {
        throw new Error('Syntax error: Unexpected token');
      });

      expect(() => {
        executeHCFile('syntax-error.hclisp');
      }).toThrow('process.exit called with code 1');

      expect(mockEvalFile).toHaveBeenCalledWith('syntax-error.hclisp');
      expect(mockConsoleError).toHaveBeenCalledWith('Error: Syntax error: Unexpected token');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle runtime errors', () => {
      mockEvalFile.mockImplementationOnce(() => {
        throw new Error('Runtime error: Undefined symbol');
      });

      expect(() => {
        executeHCFile('runtime-error.hclisp');
      }).toThrow('process.exit called with code 1');

      expect(mockEvalFile).toHaveBeenCalledWith('runtime-error.hclisp');
      expect(mockConsoleError).toHaveBeenCalledWith('Error: Runtime error: Undefined symbol');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle non-Error exceptions', () => {
      mockEvalFile.mockImplementationOnce(() => {
        throw 'String error';
      });

      expect(() => {
        executeHCFile('weird-error.hclisp');
      }).toThrow('process.exit called with code 1');

      expect(mockEvalFile).toHaveBeenCalledWith('weird-error.hclisp');
      expect(mockConsoleError).toHaveBeenCalledWith('Error: String error');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle empty file path', () => {
      executeHCFile('');

      expect(mockEvalFile).toHaveBeenCalledWith('');
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    test('should handle file path with spaces', () => {
      executeHCFile('file with spaces.hclisp');

      expect(mockEvalFile).toHaveBeenCalledWith('file with spaces.hclisp');
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });

  describe('showUsage function', () => {
    test('should display usage message and exit', () => {
      expect(() => {
        showUsage();
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith('Usage: npm run hclisp <file.hclisp>');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });

  describe('main function', () => {
    test('should show usage when no file path is provided', () => {
      expect(() => {
        main(['node', 'hc-runner.ts']);
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith('Usage: npm run hclisp <file.hclisp>');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockEvalFile).not.toHaveBeenCalled();
    });

    test('should execute file when valid file path is provided', () => {
      main(['node', 'hc-runner.ts', 'test-file.hclisp']);

      expect(mockEvalFile).toHaveBeenCalledWith('test-file.hclisp');
      expect(mockProcessExit).not.toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test('should handle HcLisp.evalFile errors in main', () => {
      mockEvalFile.mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      expect(() => {
        main(['node', 'hc-runner.ts', 'nonexistent.hclisp']);
      }).toThrow('process.exit called with code 1');

      expect(mockEvalFile).toHaveBeenCalledWith('nonexistent.hclisp');
      expect(mockConsoleError).toHaveBeenCalledWith('Error: File not found');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle empty arguments array', () => {
      expect(() => {
        main(['node']);
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith('Usage: npm run hclisp <file.hclisp>');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockEvalFile).not.toHaveBeenCalled();
    });

    test('should handle undefined file path', () => {
      expect(() => {
        main(['node', 'hc-runner.ts', undefined as any]);
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith('Usage: npm run hclisp <file.hclisp>');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockEvalFile).not.toHaveBeenCalled();
    });

    test('should handle multiple arguments (only first file used)', () => {
      main(['node', 'hc-runner.ts', 'first.hclisp', 'second.hclisp', 'third.hclisp']);

      expect(mockEvalFile).toHaveBeenCalledWith('first.hclisp');
      expect(mockEvalFile).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test('should use process.argv by default', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'hc-runner.ts', 'default-test.hclisp'];

      main();

      expect(mockEvalFile).toHaveBeenCalledWith('default-test.hclisp');
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();

      process.argv = originalArgv;
    });

    test('should show usage with process.argv when no file provided', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'hc-runner.ts'];

      expect(() => {
        main();
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleLog).toHaveBeenCalledWith('Usage: npm run hclisp <file.hclisp>');
      expect(mockProcessExit).toHaveBeenCalledWith(1);

      process.argv = originalArgv;
    });
  });

  describe('Integration tests', () => {
    test('should handle complete workflow with valid file', () => {
      main(['node', 'hc-runner.ts', 'integration-test.hclisp']);

      expect(mockEvalFile).toHaveBeenCalledWith('integration-test.hclisp');
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    test('should handle complete workflow with error', () => {
      mockEvalFile.mockImplementationOnce(() => {
        throw new Error('Integration test error');
      });

      expect(() => {
        main(['node', 'hc-runner.ts', 'integration-error.hclisp']);
      }).toThrow('process.exit called with code 1');

      expect(mockEvalFile).toHaveBeenCalledWith('integration-error.hclisp');
      expect(mockConsoleError).toHaveBeenCalledWith('Error: Integration test error');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});
