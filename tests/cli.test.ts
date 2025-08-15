import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import HcLisp from '../src/hc-lisp';
import { startRepl } from '../src/repl';
import {
  getVersion,
  showBanner,
  showEnhancedHelp,
  executeExpression,
  executeFile,
  watchFile,
  loadConfig,
  startEnhancedRepl,
  createProgram,
  executeCliAction,
  setupErrorHandlers,
  main
} from '../src/cli';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
  watchFile: jest.fn()
}));
jest.mock('path');
jest.mock('../src/hc-lisp');
jest.mock('../src/repl');
jest.mock('chalk', () => ({
  cyan: jest.fn((...args) => args.join(' ')),
  yellow: jest.fn((...args) => args.join(' ')),
  white: jest.fn((...args) => args.join(' ')),
  gray: jest.fn((...args) => args.join(' ')),
  blue: jest.fn((...args) => args.join(' ')),
  green: jest.fn((...args) => args.join(' ')),
  red: jest.fn((...args) => args.join(' '))
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockHcLisp = HcLisp as jest.Mocked<typeof HcLisp>;
const mockStartRepl = startRepl as jest.MockedFunction<typeof startRepl>;

const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined): never => {
  throw new Error(`process.exit called with code ${code}`);
});

describe('CLI Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPath.join.mockReturnValue('/mock/path/package.json');
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.3.2' }));
    mockFs.existsSync.mockReturnValue(true);

    mockHcLisp.eval.mockReturnValue({ type: 'number', value: 42 });
    mockHcLisp.formatOutput.mockReturnValue('42');
    mockHcLisp.evalFile.mockReturnValue({ type: 'number', value: 0 });
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockProcessExit.mockRestore();
  });

  describe('getVersion', () => {
    test('should return version from package.json', () => {
      const version = getVersion();

      expect(version).toBe('1.3.2');
      expect(mockPath.join).toHaveBeenCalledWith(expect.stringContaining('hc-lisp'), '../package.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith('/mock/path/package.json', 'utf8');
    });

    test('should return "unknown" when package.json cannot be read', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const version = getVersion();

      expect(version).toBe('unknown');
    });

    test('should return "unknown" when package.json has invalid JSON', () => {
      mockFs.readFileSync.mockReturnValue('invalid json');

      const version = getVersion();

      expect(version).toBe('unknown');
    });
  });

  describe('showBanner', () => {
    test('should display banner with version', () => {
      showBanner();

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('HC-Lisp'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('1.3.2'));
    });
  });

  describe('showEnhancedHelp', () => {
    test('should return formatted help text', () => {
      const help = showEnhancedHelp();

      expect(help).toContain('HC-Lisp');
      expect(help).toContain('Usage Examples');
      expect(help).toContain('REPL Commands');
      expect(help).toContain('Configuration');
    });
  });

  describe('executeExpression', () => {
    test('should evaluate expression and print result', () => {
      executeExpression('(+ 1 2)', { verbose: false });

      expect(mockHcLisp.eval).toHaveBeenCalledWith('(+ 1 2)');
      expect(mockHcLisp.formatOutput).toHaveBeenCalledWith({ type: 'number', value: 42 });
      expect(mockConsoleLog).toHaveBeenCalledWith('42');
    });

    test('should show verbose output when verbose is enabled', () => {
      executeExpression('(+ 1 2)', { verbose: true });

      expect(mockConsoleLog).toHaveBeenCalledWith('Evaluating:', '(+ 1 2)');
      expect(mockConsoleLog).toHaveBeenCalledWith('42');
    });    test('should handle evaluation errors', () => {
      mockHcLisp.eval.mockImplementation(() => {
        throw new Error('Syntax error');
      });

      expect(() => {
        executeExpression('(invalid', { verbose: false });
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'Syntax error');
    });

    test('should handle non-Error exceptions', () => {
      mockHcLisp.eval.mockImplementation(() => {
        throw 'String error';
      });

      expect(() => {
        executeExpression('(invalid', { verbose: false });
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'String error');
    });
  });

  describe('executeFile', () => {
    test('should execute file successfully', () => {
      executeFile('test.hclisp', { verbose: false });

      expect(mockFs.existsSync).toHaveBeenCalledWith('test.hclisp');
      expect(mockHcLisp.evalFile).toHaveBeenCalledWith('test.hclisp');
    });

    test('should show verbose output when verbose is enabled', () => {
      executeFile('test.hclisp', { verbose: true });

      expect(mockConsoleLog).toHaveBeenCalledWith('Executing file:', 'test.hclisp');
      expect(mockConsoleLog).toHaveBeenCalledWith('File executed successfully');
    });    test('should handle file not found error', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        executeFile('nonexistent.hclisp', { verbose: false });
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'File not found: nonexistent.hclisp');
    });

    test('should handle file execution errors', () => {
      mockHcLisp.evalFile.mockImplementation(() => {
        throw new Error('Runtime error');
      });

      expect(() => {
        executeFile('error.hclisp', { verbose: false });
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'Runtime error');
    });
  });

  describe('watchFile', () => {
    test('should require existing file', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        watchFile('nonexistent.hclisp', { verbose: false });
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'File not found: nonexistent.hclisp');
    });
  });

  describe('loadConfig', () => {
    test('should load configuration file successfully', () => {
      const mockConfig = { verbose: true, debug: false };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = loadConfig('config.json');

      expect(config).toEqual(mockConfig);
      expect(mockFs.existsSync).toHaveBeenCalledWith('config.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith('config.json', 'utf8');
      expect(mockConsoleLog).toHaveBeenCalledWith('Loaded configuration:', 'config.json');
    });    test('should handle configuration file not found', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => {
        loadConfig('nonexistent.json');
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'Configuration file not found: nonexistent.json');
    });

    test('should handle invalid JSON in configuration file', () => {
      mockFs.readFileSync.mockReturnValue('invalid json');

      expect(() => {
        loadConfig('config.json');
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error loading configuration:'), expect.any(String));
    });
  });

  describe('startEnhancedRepl', () => {
    test('should start REPL with default options', () => {
      startEnhancedRepl({ verbose: false });

      expect(mockStartRepl).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Starting HC-Lisp REPL'));
    });

    test('should show banner when verbose is enabled', () => {
      startEnhancedRepl({ verbose: true });

      expect(mockStartRepl).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('HC-Lisp'));
    });

    test('should show debug message when debug is enabled', () => {
      startEnhancedRepl({ debug: true });

      expect(mockStartRepl).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Debug mode enabled'));
    });

    test('should show both banner and debug when both options are enabled', () => {
      startEnhancedRepl({ verbose: true, debug: true });

      expect(mockStartRepl).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('HC-Lisp'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Debug mode enabled'));
    });
  });

  describe('createProgram', () => {
    test('should create and configure commander program', () => {
      const program = createProgram();

      expect(program).toBeInstanceOf(Command);
      expect(program.name()).toBe('hc-lisp');
      expect(program.description()).toBe('HC-Lisp - A Modern Lisp Dialect');
    });

    test('should have all required options configured', () => {
      const program = createProgram();
      const options = program.options;

      const optionFlags = options.map(opt => opt.flags);
      expect(optionFlags).toContain('-c, --config <file>');
      expect(optionFlags).toContain('--verbose');
      expect(optionFlags).toContain('--debug');
      expect(optionFlags).toContain('-e, --eval <expression>');
      expect(optionFlags).toContain('-w, --watch');
      expect(optionFlags).toContain('-v, --version');
    });
  });

  describe('executeCliAction', () => {
    test('should execute expression when eval option is provided', () => {
      executeCliAction('', { eval: '(+ 1 2)', verbose: false });

      expect(mockHcLisp.eval).toHaveBeenCalledWith('(+ 1 2)');
    });

    test('should execute file when file is provided without watch', () => {
      executeCliAction('test.hclisp', { verbose: false });

      expect(mockHcLisp.evalFile).toHaveBeenCalledWith('test.hclisp');
    });

    test('should watch file when file and watch option are provided', () => {
      const mockProgram = {
        opts: jest.fn().mockReturnValue({ watch: true, verbose: false })
      } as any;

      expect(() => {
        executeCliAction('test.hclisp', { watch: true, verbose: false });
      }).not.toThrow();
    });

    test('should start REPL when no file or eval option is provided', () => {
      executeCliAction('', { verbose: false });

      expect(mockStartRepl).toHaveBeenCalled();
    });

    test('should load config when config option is provided', () => {
      const mockConfig = { verbose: true };
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      executeCliAction('', { config: 'config.json', verbose: false });

      expect(mockFs.readFileSync).toHaveBeenCalledWith('config.json', 'utf8');
    });
  });

  describe('setupErrorHandlers', () => {
    let mockProcessOn: jest.SpyInstance;
    let uncaughtExceptionHandler: (error: Error) => void;
    let unhandledRejectionHandler: (reason: any) => void;

    beforeEach(() => {
      mockProcessOn = jest.spyOn(process, 'on').mockImplementation((event: string | symbol, handler: any) => {
        if (event === 'uncaughtException') {
          uncaughtExceptionHandler = handler;
        } else if (event === 'unhandledRejection') {
          unhandledRejectionHandler = handler;
        }
        return process as any;
      });
    });

    afterEach(() => {
      mockProcessOn.mockRestore();
    });

    test('should setup uncaught exception and unhandled rejection handlers', () => {
      setupErrorHandlers();

      expect(mockProcessOn).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(mockProcessOn).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });

    test('should handle uncaught exception without debug mode', () => {
      setupErrorHandlers();

      const testError = new Error('Test error');

      expect(() => {
        uncaughtExceptionHandler(testError);
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'Test error');
    });

    test('should handle uncaught exception with debug mode', () => {
      const mockProgram = {
        opts: jest.fn().mockReturnValue({ debug: true })
      } as any;

      setupErrorHandlers(mockProgram);

      const testError = new Error('Test error');
      testError.stack = 'Test stack trace';

      expect(() => {
        uncaughtExceptionHandler(testError);
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'Test error');
      expect(mockConsoleError).toHaveBeenCalledWith('Test stack trace');
    });

    test('should handle unhandled rejection', () => {
      setupErrorHandlers();

      expect(() => {
        unhandledRejectionHandler('Test rejection reason');
      }).toThrow('process.exit called with code 1');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.anything(), 'Test rejection reason');
    });
  });

  describe('main', () => {
    test('should not throw on valid command line arguments', () => {
      expect(() => main(['node', 'cli.js', '--help'])).toThrow('process.exit called with code 0');
    });
  });
});
