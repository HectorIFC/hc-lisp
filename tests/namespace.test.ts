import { NamespaceManager } from '../src/Namespace';
import { Environment } from '../src/Context';
import { HCValue } from '../src/Categorize';
import HcLisp from '../hc-lisp';

describe('Namespace Unified Tests - Complete Coverage', () => {
  let namespaceManager: NamespaceManager;

  beforeEach(() => {
    namespaceManager = new NamespaceManager();
    HcLisp.resetContext();
  });

  // Helper functions for testing
  const callHCFunction = (hcValue: HCValue, ...args: HCValue[]): HCValue => {
    if (hcValue.type === 'function') {
      return hcValue.value(...args);
    }
    throw new Error('Not a function');
  };

  const getStringValue = (hcValue: HCValue): string => {
    if (hcValue.type === 'string') {
      return hcValue.value;
    }
    throw new Error('Not a string');
  };

  const getBooleanValue = (hcValue: HCValue): boolean => {
    if (hcValue.type === 'boolean') {
      return hcValue.value;
    }
    throw new Error('Not a boolean');
  };

  const getObjectValue = (hcValue: HCValue): any => {
    if (hcValue.type === 'object') {
      return hcValue.value;
    }
    throw new Error('Not an object');
  };

  // ============================================================================
  // BASIC NAMESPACE OPERATIONS
  // ============================================================================
  describe('Basic Namespace Operations', () => {
    test('should create and manage namespaces', () => {
      // Test createNamespace
      const ns1 = namespaceManager.createNamespace('test-ns');
      expect(ns1.name).toBe('test-ns');
      expect(ns1.environment).toBeInstanceOf(Environment);
      expect(ns1.imports.size).toBe(0);
      expect(ns1.requires.size).toBe(0);

      // Test getNamespace
      const retrieved = namespaceManager.getNamespace('test-ns');
      expect(retrieved).toBe(ns1);

      // Test non-existent namespace
      const nonExistent = namespaceManager.getNamespace('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    test('should create namespace with base environment', () => {
      const baseEnv = new Environment(null);
      baseEnv.define('test-var', { type: 'number', value: 42 });

      const ns = namespaceManager.createNamespace('test-with-base', baseEnv);
      expect(ns.environment.get('test-var')).toEqual({ type: 'number', value: 42 });
    });

    test('should set and get current namespace', () => {
      // Test getCurrentNamespace - should start with 'user'
      const currentNs = namespaceManager.getCurrentNamespace();
      expect(currentNs.name).toBe('user');

      // Create new namespace and set as current
      namespaceManager.createNamespace('new-current');
      namespaceManager.setCurrentNamespace('new-current');

      const newCurrent = namespaceManager.getCurrentNamespace();
      expect(newCurrent.name).toBe('new-current');
    });

    test('should throw error when setting non-existent namespace as current', () => {
      expect(() => {
        namespaceManager.setCurrentNamespace('non-existent');
      }).toThrow('Namespace \'non-existent\' does not exist');
    });

    test('should add imports to current namespace', () => {
      const mockImplementation = jest.fn();
      namespaceManager.addImport('TestClass', mockImplementation);

      const currentNs = namespaceManager.getCurrentNamespace();
      expect(currentNs.imports.has('TestClass')).toBe(true);
      expect(currentNs.imports.get('TestClass')).toBe(mockImplementation);
    });

    test('should add requires and create mock namespaces', () => {
      namespaceManager.addRequire('external-lib', 'ext');

      const currentNs = namespaceManager.getCurrentNamespace();
      expect(currentNs.requires.has('external-lib')).toBe(true);
      expect(currentNs.requires.get('external-lib')).toBe('ext');

      // Should create the namespace if it doesn't exist
      const externalNs = namespaceManager.getNamespace('external-lib');
      expect(externalNs).toBeDefined();
    });
  });

  // ============================================================================
  // NODE.JS MODULE CREATION
  // ============================================================================
  describe('Node.js Module Creation', () => {
    test('should create node.fs namespace with functions', () => {
      namespaceManager.addRequire('node.fs', 'fs');
      const fsNs = namespaceManager.getNamespace('node.fs');

      expect(fsNs).toBeDefined();
      if (fsNs) {
        // Test that fs functions are defined
        expect(() => fsNs.environment.get('readFileSync')).not.toThrow();
        expect(() => fsNs.environment.get('existsSync')).not.toThrow();
      }
    });

    test('should create node.crypto namespace with functions', () => {
      namespaceManager.addRequire('node.crypto', 'crypto');
      const cryptoNs = namespaceManager.getNamespace('node.crypto');

      expect(cryptoNs).toBeDefined();
      if (cryptoNs) {
        expect(() => cryptoNs.environment.get('randomUUID')).not.toThrow();
        expect(() => cryptoNs.environment.get('randomBytes')).not.toThrow();
        expect(() => cryptoNs.environment.get('createHash')).not.toThrow();
      }
    });

    test('should create node.path namespace with functions', () => {
      namespaceManager.addRequire('node.path', 'path');
      const pathNs = namespaceManager.getNamespace('node.path');

      expect(pathNs).toBeDefined();
      if (pathNs) {
        expect(() => pathNs.environment.get('join')).not.toThrow();
        expect(() => pathNs.environment.get('basename')).not.toThrow();
        expect(() => pathNs.environment.get('dirname')).not.toThrow();
        expect(() => pathNs.environment.get('extname')).not.toThrow();
      }
    });

    test('should create node.http namespace with functions', () => {
      namespaceManager.addRequire('node.http', 'http');
      const httpNs = namespaceManager.getNamespace('node.http');

      expect(httpNs).toBeDefined();
      if (httpNs) {
        expect(() => httpNs.environment.get('createServer')).not.toThrow();
        expect(() => httpNs.environment.get('request')).not.toThrow();
      }
    });

    test('should create node.url namespace with functions', () => {
      namespaceManager.addRequire('node.url', 'url');
      const urlNs = namespaceManager.getNamespace('node.url');

      expect(urlNs).toBeDefined();
      if (urlNs) {
        expect(() => urlNs.environment.get('parse')).not.toThrow();
        expect(() => urlNs.environment.get('resolve')).not.toThrow();
      }
    });

    test('should create node.os namespace with functions', () => {
      namespaceManager.addRequire('node.os', 'os');
      const osNs = namespaceManager.getNamespace('node.os');

      expect(osNs).toBeDefined();
      if (osNs) {
        expect(() => osNs.environment.get('platform')).not.toThrow();
        expect(() => osNs.environment.get('hostname')).not.toThrow();
        expect(() => osNs.environment.get('tmpdir')).not.toThrow();
        expect(() => osNs.environment.get('homedir')).not.toThrow();
      }
    });

    test('should handle unknown module names by creating empty namespace', () => {
      namespaceManager.addRequire('unknown-module', 'unknown');
      const unknownNs = namespaceManager.getNamespace('unknown-module');

      expect(unknownNs).toBeDefined();
      expect(unknownNs?.name).toBe('unknown-module');
    });
  });

  // ============================================================================
  // SYMBOL RESOLUTION
  // ============================================================================
  describe('Symbol Resolution', () => {
    test('should resolve symbol from local environment', () => {
      const currentNs = namespaceManager.getCurrentNamespace();
      currentNs.environment.define('test-var', { type: 'number', value: 42 });

      const result = namespaceManager.resolveSymbol('test-var', currentNs.environment);
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should resolve namespaced symbol', () => {
      // Create a namespace with a function
      namespaceManager.addRequire('node.crypto', 'crypto');
      const cryptoNs = namespaceManager.getNamespace('node.crypto');

      // Resolve namespaced symbol
      const result = namespaceManager.resolveSymbol('crypto/randomUUID', cryptoNs!.environment);
      expect(result.type).toBe('function');
    });

    test('should throw error for undefined symbol in namespace', () => {
      namespaceManager.addRequire('node.crypto', 'crypto');
      const cryptoNs = namespaceManager.getNamespace('node.crypto');

      expect(() => {
        namespaceManager.resolveSymbol('crypto/nonExistentFunction', cryptoNs!.environment);
      }).toThrow('Function \'nonExistentFunction\' not found in namespace \'node.crypto\'');
    });

    test('should throw error for unknown namespace alias', () => {
      const currentNs = namespaceManager.getCurrentNamespace();

      expect(() => {
        namespaceManager.resolveSymbol('unknown/function', currentNs.environment);
      }).toThrow('Namespace alias \'unknown\' not found');
    });

    test('should resolve symbol from imports', () => {
      const mockFn = jest.fn();
      namespaceManager.addImport('TestClass', mockFn);

      const currentNs = namespaceManager.getCurrentNamespace();
      const result = namespaceManager.resolveSymbol('TestClass', currentNs.environment);

      expect(result.type).toBe('function');
      if (result.type === 'function') {
        expect(result.value).toBe(mockFn);
      }
    });

    test('should throw error for completely undefined symbol', () => {
      const currentNs = namespaceManager.getCurrentNamespace();

      expect(() => {
        namespaceManager.resolveSymbol('completely-undefined', currentNs.environment);
      }).toThrow('Undefined symbol: completely-undefined');
    });

    test('should handle symbol resolution with parent environment fallback', () => {
      const parentEnv = new Environment();
      parentEnv.define('parent-symbol', { type: 'string', value: 'parent-value' });

      const childEnv = new Environment(parentEnv);

      const result = namespaceManager.resolveSymbol('parent-symbol', childEnv);
      expect(result.type).toBe('string');
      if (result.type === 'string') {
        expect(result.value).toBe('parent-value');
      }
    });
  });

  // ============================================================================
  // VALUE CONVERSION SYSTEM
  // ============================================================================
  describe('Value Conversion System', () => {
    test('should convert JS values to HC values', () => {
      const manager = namespaceManager as any;

      // Test null/undefined
      expect(manager.jsValueToHc(null)).toEqual({ type: 'nil', value: null });
      expect(manager.jsValueToHc(undefined)).toEqual({ type: 'nil', value: null });

      // Test primitives
      expect(manager.jsValueToHc('hello')).toEqual({ type: 'string', value: 'hello' });
      expect(manager.jsValueToHc(42)).toEqual({ type: 'number', value: 42 });
      expect(manager.jsValueToHc(true)).toEqual({ type: 'boolean', value: true });

      // Test array
      const arrayValue = manager.jsValueToHc([1, 2, 3]);
      expect(arrayValue.type).toBe('vector');
      expect(arrayValue.value).toHaveLength(3);

      // Test object
      const obj = { key: 'value' };
      const objectValue = manager.jsValueToHc(obj);
      expect(objectValue.type).toBe('object');
      expect(objectValue.value).toBe(obj);

      // Test function
      const fn = () => {};
      const functionValue = manager.jsValueToHc(fn);
      expect(functionValue.type).toBe('function');
      expect(functionValue.value).toBe(fn);
    });

    test('should convert HC values to JS values', () => {
      const manager = namespaceManager as any;

      // Test primitives
      expect(manager.hcValueToJs({ type: 'string', value: 'hello' })).toBe('hello');
      expect(manager.hcValueToJs({ type: 'number', value: 42 })).toBe(42);
      expect(manager.hcValueToJs({ type: 'boolean', value: true })).toBe(true);
      expect(manager.hcValueToJs({ type: 'nil', value: null })).toBe(null);

      // Test collections
      const listValue = { type: 'list', value: [{ type: 'number', value: 1 }] };
      expect(manager.hcValueToJs(listValue)).toEqual([1]);

      const vectorValue = { type: 'vector', value: [{ type: 'string', value: 'test' }] };
      expect(manager.hcValueToJs(vectorValue)).toEqual(['test']);

      // Test object/function
      const obj = { key: 'value' };
      expect(manager.hcValueToJs({ type: 'object', value: obj })).toBe(obj);

      const fn = () => {};
      expect(manager.hcValueToJs({ type: 'function', value: fn })).toBe(fn);

      // Test symbol/keyword
      expect(manager.hcValueToJs({ type: 'symbol', value: 'symbol-name' })).toBe('symbol-name');
      expect(manager.hcValueToJs({ type: 'keyword', value: ':keyword' })).toBe(':keyword');

      // Test closure (should return as-is)
      const closure = { type: 'closure', params: [], body: { type: 'nil', value: null }, env: null };
      expect(manager.hcValueToJs(closure)).toBe(closure);

      // Test recur
      const recurValue = { type: 'recur', values: [{ type: 'number', value: 1 }] };
      expect(manager.hcValueToJs(recurValue)).toEqual([1]);
    });
  });

  // ============================================================================
  // NODE.JS MODULE LOADING
  // ============================================================================
  describe('Node.js Module Loading', () => {
    test('should handle tryLoadNodeModule with non-existent module', () => {
      const manager = namespaceManager as any;
      const mockNs = namespaceManager.createNamespace('test');

      const result = manager.tryLoadNodeModule('non-existent-module-xyz123', mockNs);
      expect(result).toBe(false);
    });

    test('should handle tryLoadNodeModule with invalid module name', () => {
      const manager = namespaceManager as any;
      const mockNs = namespaceManager.createNamespace('test');

      const result = manager.tryLoadNodeModule('../invalid/path', mockNs);
      expect(result).toBe(false);
    });

    test('should handle wrapNodeModule with function export', () => {
      const manager = namespaceManager as any;
      const mockNs = namespaceManager.createNamespace('test');
      const mockModule = jest.fn(() => 'result');

      manager.wrapNodeModule(mockModule, mockNs, 'testModule');

      // Should create both named and default exports
      expect(() => mockNs.environment.get('testModule')).not.toThrow();
      expect(() => mockNs.environment.get('default')).not.toThrow();
    });

    test('should handle wrapNodeModule with object export', () => {
      const manager = namespaceManager as any;
      const mockNs = namespaceManager.createNamespace('test');
      const mockModule = {
        method1: jest.fn(() => 'result1'),
        method2: jest.fn(() => 'result2'),
        constant: 'value'
      };

      manager.wrapNodeModule(mockModule, mockNs, 'testModule');

      // Should create exports for each property
      expect(() => mockNs.environment.get('method1')).not.toThrow();
      expect(() => mockNs.environment.get('method2')).not.toThrow();
      expect(() => mockNs.environment.get('constant')).not.toThrow();
    });

    test('should cache loaded modules', () => {
      const manager = namespaceManager as any;
      const mockNs1 = namespaceManager.createNamespace('test1');
      const mockNs2 = namespaceManager.createNamespace('test2');

      // First call should try to load
      manager.tryLoadNodeModule('fs', mockNs1);

      // Second call should use cache
      const spy = jest.spyOn(manager, 'wrapNodeModule');
      manager.tryLoadNodeModule('fs', mockNs2);

      expect(spy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NODE.JS BUILT-IN MODULES FUNCTIONALITY
  // ============================================================================
  describe('Node.js Built-in Module Functions', () => {
    test('should test fs module functions', () => {
      namespaceManager.addRequire('node.fs', 'fs');
      const fsNs = namespaceManager.getNamespace('node.fs');

      const readFileSync = fsNs!.environment.get('readFileSync');
      const existsSync = fsNs!.environment.get('existsSync');

      expect(readFileSync.type).toBe('function');
      expect(existsSync.type).toBe('function');
    });

    test('should test crypto module functions', () => {
      namespaceManager.addRequire('node.crypto', 'crypto');
      const cryptoNs = namespaceManager.getNamespace('node.crypto');

      const randomUUID = cryptoNs!.environment.get('randomUUID');
      const randomBytes = cryptoNs!.environment.get('randomBytes');
      const createHash = cryptoNs!.environment.get('createHash');

      expect(randomUUID.type).toBe('function');
      expect(randomBytes.type).toBe('function');
      expect(createHash.type).toBe('function');
    });

    test('should test path module functions', () => {
      namespaceManager.addRequire('node.path', 'path');
      const pathNs = namespaceManager.getNamespace('node.path');

      const join = pathNs!.environment.get('join');
      const basename = pathNs!.environment.get('basename');
      const dirname = pathNs!.environment.get('dirname');
      const extname = pathNs!.environment.get('extname');

      expect(join.type).toBe('function');
      expect(basename.type).toBe('function');
      expect(dirname.type).toBe('function');
      expect(extname.type).toBe('function');
    });

    test('should test http module functions', () => {
      namespaceManager.addRequire('node.http', 'http');
      const httpNs = namespaceManager.getNamespace('node.http');

      const createServer = httpNs!.environment.get('createServer');
      const request = httpNs!.environment.get('request');

      expect(createServer.type).toBe('function');
      expect(request.type).toBe('function');
    });

    test('should test url module functions', () => {
      namespaceManager.addRequire('node.url', 'url');
      const urlNs = namespaceManager.getNamespace('node.url');

      const parse = urlNs!.environment.get('parse');
      const resolve = urlNs!.environment.get('resolve');

      expect(parse.type).toBe('function');
      expect(resolve.type).toBe('function');
    });

    test('should test os module functions', () => {
      namespaceManager.addRequire('node.os', 'os');
      const osNs = namespaceManager.getNamespace('node.os');

      const platform = osNs!.environment.get('platform');
      const hostname = osNs!.environment.get('hostname');
      const tmpdir = osNs!.environment.get('tmpdir');
      const homedir = osNs!.environment.get('homedir');

      expect(platform.type).toBe('function');
      expect(hostname.type).toBe('function');
      expect(tmpdir.type).toBe('function');
      expect(homedir.type).toBe('function');
    });
  });

  // ============================================================================
  // INTEGRATION AND EDGE CASES
  // ============================================================================
  describe('Integration and Edge Cases', () => {
    test('should handle multiple namespace imports and requires', () => {
      namespaceManager.addImport('TestClass1', jest.fn());
      namespaceManager.addImport('TestClass2', jest.fn());
      namespaceManager.addRequire('module1', 'mod1');
      namespaceManager.addRequire('module2', 'mod2');

      const currentNs = namespaceManager.getCurrentNamespace();
      expect(currentNs.imports.size).toBe(2);
      expect(currentNs.requires.size).toBe(2);
      expect(currentNs.imports.has('TestClass1')).toBe(true);
      expect(currentNs.imports.has('TestClass2')).toBe(true);
      expect(currentNs.requires.has('module1')).toBe(true);
      expect(currentNs.requires.has('module2')).toBe(true);
    });

    test('should handle complex namespace switching', () => {
      // Create multiple namespaces
      namespaceManager.createNamespace('ns1');
      namespaceManager.createNamespace('ns2');
      namespaceManager.createNamespace('ns3');

      // Switch between them
      namespaceManager.setCurrentNamespace('ns1');
      expect(namespaceManager.getCurrentNamespace().name).toBe('ns1');

      namespaceManager.setCurrentNamespace('ns2');
      expect(namespaceManager.getCurrentNamespace().name).toBe('ns2');

      namespaceManager.setCurrentNamespace('ns3');
      expect(namespaceManager.getCurrentNamespace().name).toBe('ns3');

      // Switch back to user
      namespaceManager.setCurrentNamespace('user');
      expect(namespaceManager.getCurrentNamespace().name).toBe('user');
    });

    test('should handle namespace with complex requires hierarchy', () => {
      // Create a complex require hierarchy
      namespaceManager.addRequire('node.fs', 'fs');
      namespaceManager.addRequire('node.crypto', 'crypto');
      namespaceManager.addRequire('node.path', 'path');

      const currentNs = namespaceManager.getCurrentNamespace();

      // Test symbol resolution with multiple namespaces
      const fsSymbol = namespaceManager.resolveSymbol('fs/readFileSync', currentNs.environment);
      const cryptoSymbol = namespaceManager.resolveSymbol('crypto/randomUUID', currentNs.environment);
      const pathSymbol = namespaceManager.resolveSymbol('path/join', currentNs.environment);

      expect(fsSymbol.type).toBe('function');
      expect(cryptoSymbol.type).toBe('function');
      expect(pathSymbol.type).toBe('function');
    });

    test('should handle empty and null values in conversions', () => {
      const manager = namespaceManager as any;

      // Test edge cases in conversion
      expect(manager.jsValueToHc('')).toEqual({ type: 'string', value: '' });
      expect(manager.jsValueToHc(0)).toEqual({ type: 'number', value: 0 });
      expect(manager.jsValueToHc(false)).toEqual({ type: 'boolean', value: false });
      expect(manager.jsValueToHc([])).toEqual({ type: 'vector', value: [] });
      expect(manager.jsValueToHc({})).toEqual({ type: 'object', value: {} });
    });

    test('should handle namespace creation order independence', () => {
      // Add require before namespace exists
      namespaceManager.addRequire('future-namespace', 'future');

      // Namespace should be created automatically
      const futureNs = namespaceManager.getNamespace('future-namespace');
      expect(futureNs).toBeDefined();
      expect(futureNs?.name).toBe('future-namespace');

      // Current namespace should have the require
      const currentNs = namespaceManager.getCurrentNamespace();
      expect(currentNs.requires.has('future-namespace')).toBe(true);
      expect(currentNs.requires.get('future-namespace')).toBe('future');
    });
  });

  // ============================================================================
  // PUBLIC METHODS DETAILED TESTING
  // ============================================================================
  describe('Public Methods Detailed Testing', () => {

    describe('createMockNamespace', () => {
      test('should create mock namespace for node.fs', () => {
        namespaceManager.createMockNamespace('node.fs');
        const fsNs = namespaceManager.getNamespace('node.fs');

        expect(fsNs).toBeDefined();
        expect(fsNs?.name).toBe('node.fs');
        expect(() => fsNs!.environment.get('readFileSync')).not.toThrow();
        expect(() => fsNs!.environment.get('existsSync')).not.toThrow();
      });

      test('should create mock namespace for node.crypto', () => {
        namespaceManager.createMockNamespace('node.crypto');
        const cryptoNs = namespaceManager.getNamespace('node.crypto');

        expect(cryptoNs).toBeDefined();
        expect(cryptoNs?.name).toBe('node.crypto');
        expect(() => cryptoNs!.environment.get('randomUUID')).not.toThrow();
        expect(() => cryptoNs!.environment.get('randomBytes')).not.toThrow();
        expect(() => cryptoNs!.environment.get('createHash')).not.toThrow();
      });

      test('should create mock namespace for node.path', () => {
        namespaceManager.createMockNamespace('node.path');
        const pathNs = namespaceManager.getNamespace('node.path');

        expect(pathNs).toBeDefined();
        expect(pathNs?.name).toBe('node.path');
        expect(() => pathNs!.environment.get('join')).not.toThrow();
        expect(() => pathNs!.environment.get('basename')).not.toThrow();
        expect(() => pathNs!.environment.get('dirname')).not.toThrow();
        expect(() => pathNs!.environment.get('extname')).not.toThrow();
      });

      test('should create mock namespace for node.http', () => {
        namespaceManager.createMockNamespace('node.http');
        const httpNs = namespaceManager.getNamespace('node.http');

        expect(httpNs).toBeDefined();
        expect(httpNs?.name).toBe('node.http');
        expect(() => httpNs!.environment.get('createServer')).not.toThrow();
        expect(() => httpNs!.environment.get('request')).not.toThrow();
      });

      test('should create mock namespace for node.url', () => {
        namespaceManager.createMockNamespace('node.url');
        const urlNs = namespaceManager.getNamespace('node.url');

        expect(urlNs).toBeDefined();
        expect(urlNs?.name).toBe('node.url');
        expect(() => urlNs!.environment.get('parse')).not.toThrow();
        expect(() => urlNs!.environment.get('resolve')).not.toThrow();
      });

      test('should create mock namespace for node.os', () => {
        namespaceManager.createMockNamespace('node.os');
        const osNs = namespaceManager.getNamespace('node.os');

        expect(osNs).toBeDefined();
        expect(osNs?.name).toBe('node.os');
        expect(() => osNs!.environment.get('platform')).not.toThrow();
        expect(() => osNs!.environment.get('hostname')).not.toThrow();
        expect(() => osNs!.environment.get('tmpdir')).not.toThrow();
        expect(() => osNs!.environment.get('homedir')).not.toThrow();
      });

      test('should create empty namespace for unknown modules', () => {
        namespaceManager.createMockNamespace('unknown-module');
        const unknownNs = namespaceManager.getNamespace('unknown-module');

        expect(unknownNs).toBeDefined();
        expect(unknownNs?.name).toBe('unknown-module');
      });

      test('should try loading from node_modules first', () => {
        // This should first try to load 'fs' from node_modules (which will fail)
        // Then fallback to built-in node.fs functions
        namespaceManager.createMockNamespace('fs');
        const fsNs = namespaceManager.getNamespace('fs');

        expect(fsNs).toBeDefined();
        expect(fsNs?.name).toBe('fs');
      });
    });

    describe('tryLoadNodeModule', () => {
      test('should return false for non-existent modules', () => {
        const testNs = namespaceManager.createNamespace('test');
        const result = namespaceManager.tryLoadNodeModule('non-existent-module', testNs);

        expect(result).toBe(false);
      });

      test('should handle modules with node. prefix', () => {
        const testNs = namespaceManager.createNamespace('test');
        const result = namespaceManager.tryLoadNodeModule('node.invalid-module', testNs);

        expect(result).toBe(false);
      });

      test('should successfully load existing modules like fs', () => {
        const testNs = namespaceManager.createNamespace('test');
        const result = namespaceManager.tryLoadNodeModule('fs', testNs);

        expect(result).toBe(true);
        // Should have wrapped the fs module
        expect(() => testNs.environment.get('readFileSync')).not.toThrow();
      });

      test('should use cache for previously loaded modules', () => {
        const testNs1 = namespaceManager.createNamespace('test1');
        const testNs2 = namespaceManager.createNamespace('test2');

        // First load
        const result1 = namespaceManager.tryLoadNodeModule('fs', testNs1);
        expect(result1).toBe(true);

        // Second load should use cache
        const result2 = namespaceManager.tryLoadNodeModule('fs', testNs2);
        expect(result2).toBe(true);

        // Both should have the same functions
        expect(() => testNs1.environment.get('readFileSync')).not.toThrow();
        expect(() => testNs2.environment.get('readFileSync')).not.toThrow();
      });
    });

    describe('wrapNodeModule', () => {
      test('should wrap function modules correctly', () => {
        const testNs = namespaceManager.createNamespace('test');
        const mockFn = jest.fn(() => 'test-result');

        namespaceManager.wrapNodeModule(mockFn, testNs, 'testFunction');

        // Should create both named and default exports
        const namedExport = testNs.environment.get('testFunction');
        const defaultExport = testNs.environment.get('default');

        expect(namedExport.type).toBe('function');
        expect(defaultExport.type).toBe('function');
      });

      test('should wrap object modules with methods', () => {
        const testNs = namespaceManager.createNamespace('test');
        const mockModule = {
          method1: jest.fn(() => 'result1'),
          method2: jest.fn(() => 'result2'),
          constant: 'test-value'
        };

        namespaceManager.wrapNodeModule(mockModule, testNs, 'testModule');

        // Should create exports for all properties
        expect(() => testNs.environment.get('method1')).not.toThrow();
        expect(() => testNs.environment.get('method2')).not.toThrow();
        expect(() => testNs.environment.get('constant')).not.toThrow();

        const method1 = testNs.environment.get('method1');
        const constant = testNs.environment.get('constant');

        expect(method1.type).toBe('function');
        expect(constant.type).toBe('string');
        if (constant.type === 'string') {
          expect(constant.value).toBe('test-value');
        }
      });

      test('should handle modules that are both function and object', () => {
        const testNs = namespaceManager.createNamespace('test');
        const mockModule = jest.fn(() => 'main-result') as any;
        mockModule.subMethod = jest.fn(() => 'sub-result');
        mockModule.property = 'test-prop';

        namespaceManager.wrapNodeModule(mockModule, testNs, 'complexModule');

        // Should handle both function and object aspects
        expect(() => testNs.environment.get('complexModule')).not.toThrow();
        expect(() => testNs.environment.get('default')).not.toThrow();
        expect(() => testNs.environment.get('subMethod')).not.toThrow();
        expect(() => testNs.environment.get('property')).not.toThrow();
      });
    });

    describe('hcValueToJs and jsValueToHc', () => {
      test('should convert all HC value types to JS', () => {
        // Test all possible HC value types
        expect(namespaceManager.hcValueToJs({ type: 'string', value: 'test' })).toBe('test');
        expect(namespaceManager.hcValueToJs({ type: 'number', value: 42 })).toBe(42);
        expect(namespaceManager.hcValueToJs({ type: 'boolean', value: true })).toBe(true);
        expect(namespaceManager.hcValueToJs({ type: 'nil', value: null })).toBe(null);

        // Test collections
        const listValue: HCValue = { type: 'list', value: [{ type: 'number', value: 1 }, { type: 'string', value: 'test' }] };
        expect(namespaceManager.hcValueToJs(listValue)).toEqual([1, 'test']);

        const vectorValue: HCValue = { type: 'vector', value: [{ type: 'boolean', value: true }] };
        expect(namespaceManager.hcValueToJs(vectorValue)).toEqual([true]);

        // Test object and function
        const objValue = { key: 'value' };
        expect(namespaceManager.hcValueToJs({ type: 'object', value: objValue })).toBe(objValue);

        const fnValue = () => 'test';
        expect(namespaceManager.hcValueToJs({ type: 'function', value: fnValue })).toBe(fnValue);

        // Test symbol and keyword
        expect(namespaceManager.hcValueToJs({ type: 'symbol', value: 'my-symbol' })).toBe('my-symbol');
        expect(namespaceManager.hcValueToJs({ type: 'keyword', value: ':my-keyword' })).toBe(':my-keyword');

        // Test closure (should return as-is)
        const closure: HCValue = { type: 'closure', params: [], body: { type: 'nil', value: null }, env: null };
        expect(namespaceManager.hcValueToJs(closure)).toBe(closure);

        // Test recur
        const recurValue: HCValue = { type: 'recur', values: [{ type: 'number', value: 1 }, { type: 'string', value: 'test' }] };
        expect(namespaceManager.hcValueToJs(recurValue)).toEqual([1, 'test']);

        // Test default case
        const unknownValue: any = { type: 'unknown-type', value: 'something' };
        expect(namespaceManager.hcValueToJs(unknownValue)).toBe(unknownValue);
      });

      test('should convert all JS value types to HC', () => {
        // Test null and undefined
        expect(namespaceManager.jsValueToHc(null)).toEqual({ type: 'nil', value: null });
        expect(namespaceManager.jsValueToHc(undefined)).toEqual({ type: 'nil', value: null });

        // Test primitives
        expect(namespaceManager.jsValueToHc('hello')).toEqual({ type: 'string', value: 'hello' });
        expect(namespaceManager.jsValueToHc(123)).toEqual({ type: 'number', value: 123 });
        expect(namespaceManager.jsValueToHc(false)).toEqual({ type: 'boolean', value: false });

        // Test array (converts to vector)
        const jsArray = [1, 'test', true];
        const hcArray = namespaceManager.jsValueToHc(jsArray);
        expect(hcArray.type).toBe('vector');
        if (hcArray.type === 'vector') {
          expect(hcArray.value).toHaveLength(3);
          expect(hcArray.value[0]).toEqual({ type: 'number', value: 1 });
          expect(hcArray.value[1]).toEqual({ type: 'string', value: 'test' });
          expect(hcArray.value[2]).toEqual({ type: 'boolean', value: true });
        }

        // Test object
        const jsObj = { key: 'value', num: 42 };
        expect(namespaceManager.jsValueToHc(jsObj)).toEqual({ type: 'object', value: jsObj });

        // Test function
        const jsFn = () => 'test';
        expect(namespaceManager.jsValueToHc(jsFn)).toEqual({ type: 'function', value: jsFn });

        // Test fallback case
        const symbol = Symbol('test');
        expect(namespaceManager.jsValueToHc(symbol)).toEqual({ type: 'object', value: symbol });
      });

      test('should handle nested conversions correctly', () => {
        // Test deeply nested array
        const nestedJs = [1, [2, [3, 'deep']], { nested: true }];
        const nestedHc = namespaceManager.jsValueToHc(nestedJs);

        expect(nestedHc.type).toBe('vector');
        if (nestedHc.type === 'vector') {
          expect(nestedHc.value[0]).toEqual({ type: 'number', value: 1 });
          expect(nestedHc.value[1].type).toBe('vector');
          expect(nestedHc.value[2]).toEqual({ type: 'object', value: { nested: true } });
        }

        // Test converting back
        const backToJs = namespaceManager.hcValueToJs(nestedHc);
        expect(backToJs).toEqual([1, [2, [3, 'deep']], { nested: true }]);
      });
    });

    describe('addNodeFsFunctions', () => {
      test('should add readFileSync function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeFsFunctions(testNs);

        const readFileSync = testNs.environment.get('readFileSync');
        expect(readFileSync.type).toBe('function');

        // Test error case - invalid arguments
        expect(() => {
          callHCFunction(readFileSync, { type: 'number', value: 123 });
        }).toThrow('readFileSync expects a string argument (file path)');

        expect(() => {
          callHCFunction(readFileSync);
        }).toThrow('readFileSync expects a string argument (file path)');
      });

      test('should add existsSync function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeFsFunctions(testNs);

        const existsSync = testNs.environment.get('existsSync');
        expect(existsSync.type).toBe('function');

        // Test error case - invalid arguments
        expect(() => {
          callHCFunction(existsSync, { type: 'number', value: 123 });
        }).toThrow('existsSync expects a string argument (file path)');

        expect(() => {
          callHCFunction(existsSync);
        }).toThrow('existsSync expects a string argument (file path)');

        // Test with valid but non-existent path
        const result = callHCFunction(existsSync, { type: 'string', value: '/path/that/does/not/exist' });
        expect(result.type).toBe('boolean');
        expect(getBooleanValue(result)).toBe(false);
      });
    });

    describe('addNodeCryptoFunctions', () => {
      test('should add randomUUID function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeCryptoFunctions(testNs);

        const randomUUID = testNs.environment.get('randomUUID');
        expect(randomUUID.type).toBe('function');

        const result = callHCFunction(randomUUID);
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');
        expect(getStringValue(result).length).toBeGreaterThan(0);
      });

      test('should add randomBytes function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeCryptoFunctions(testNs);

        const randomBytes = testNs.environment.get('randomBytes');
        expect(randomBytes.type).toBe('function');

        // Test valid call
        const result = callHCFunction(randomBytes, { type: 'number', value: 16 });
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');

        // Test error cases
        expect(() => {
          callHCFunction(randomBytes);
        }).toThrow('randomBytes expects a number argument');

        expect(() => {
          callHCFunction(randomBytes, { type: 'string', value: 'not-number' });
        }).toThrow('randomBytes expects a number argument');
      });

      test('should add createHash function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeCryptoFunctions(testNs);

        const createHash = testNs.environment.get('createHash');
        expect(createHash.type).toBe('function');

        // Test valid call
        const result = callHCFunction(createHash,
          { type: 'string', value: 'sha256' },
          { type: 'string', value: 'test data' }
        );
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');

        // Test error cases
        expect(() => {
          callHCFunction(createHash, { type: 'string', value: 'sha256' });
        }).toThrow('createHash expects algorithm and data as string arguments');

        expect(() => {
          callHCFunction(createHash,
            { type: 'number', value: 256 },
            { type: 'string', value: 'data' }
          );
        }).toThrow('createHash expects algorithm and data as string arguments');
      });
    });

    describe('addNodePathFunctions', () => {
      test('should add join function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodePathFunctions(testNs);

        const join = testNs.environment.get('join');
        expect(join.type).toBe('function');

        // Test valid call
        const result = callHCFunction(join,
          { type: 'string', value: '/home' },
          { type: 'string', value: 'user' },
          { type: 'string', value: 'documents' }
        );
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');

        // Test error case
        expect(() => {
          callHCFunction(join, { type: 'number', value: 123 });
        }).toThrow('path/join expects string arguments');
      });

      test('should add basename function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodePathFunctions(testNs);

        const basename = testNs.environment.get('basename');
        expect(basename.type).toBe('function');

        // Test valid call
        const result = callHCFunction(basename, { type: 'string', value: '/path/to/file.txt' });
        expect(result.type).toBe('string');
        expect(getStringValue(result)).toBe('file.txt');

        // Test error cases
        expect(() => {
          callHCFunction(basename);
        }).toThrow('basename expects a string argument');

        expect(() => {
          callHCFunction(basename, { type: 'number', value: 123 });
        }).toThrow('basename expects a string argument');
      });

      test('should add dirname function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodePathFunctions(testNs);

        const dirname = testNs.environment.get('dirname');
        expect(dirname.type).toBe('function');

        // Test valid call
        const result = callHCFunction(dirname, { type: 'string', value: '/path/to/file.txt' });
        expect(result.type).toBe('string');
        expect(getStringValue(result)).toBe('/path/to');

        // Test error cases
        expect(() => {
          callHCFunction(dirname);
        }).toThrow('dirname expects a string argument');

        expect(() => {
          callHCFunction(dirname, { type: 'number', value: 123 });
        }).toThrow('dirname expects a string argument');
      });

      test('should add extname function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodePathFunctions(testNs);

        const extname = testNs.environment.get('extname');
        expect(extname.type).toBe('function');

        // Test valid call
        const result = callHCFunction(extname, { type: 'string', value: '/path/to/file.txt' });
        expect(result.type).toBe('string');
        expect(getStringValue(result)).toBe('.txt');

        // Test error cases
        expect(() => {
          callHCFunction(extname);
        }).toThrow('extname expects a string argument');

        expect(() => {
          callHCFunction(extname, { type: 'number', value: 123 });
        }).toThrow('extname expects a string argument');
      });
    });

    describe('addNodeHttpFunctions', () => {
      test('should add createServer function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeHttpFunctions(testNs);

        const createServer = testNs.environment.get('createServer');
        expect(createServer.type).toBe('function');

        // Test valid call
        const handlerFn: HCValue = { type: 'function', value: jest.fn() };
        const result = callHCFunction(createServer, handlerFn);
        expect(result.type).toBe('object');
        expect(getObjectValue(result)).toBeDefined();

        // Test error case
        expect(() => {
          callHCFunction(createServer, { type: 'string', value: 'not-function' });
        }).toThrow('createServer expects a function argument (request handler)');

        expect(() => {
          callHCFunction(createServer);
        }).toThrow('createServer expects a function argument (request handler)');
      });

      test('should add request function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeHttpFunctions(testNs);

        const request = testNs.environment.get('request');
        expect(request.type).toBe('function');

        // Test error case
        expect(() => {
          callHCFunction(request);
        }).toThrow('http.request expects at least a URL string argument');

        expect(() => {
          callHCFunction(request, { type: 'number', value: 123 });
        }).toThrow('http.request expects at least a URL string argument');
      });
    });

    describe('addNodeUrlFunctions', () => {
      test('should add parse function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeUrlFunctions(testNs);

        const parse = testNs.environment.get('parse');
        expect(parse.type).toBe('function');

        // Test valid call
        const result = callHCFunction(parse, { type: 'string', value: 'https://example.com/path' });
        expect(result.type).toBe('object');
        expect(getObjectValue(result)).toBeDefined();

        // Test error cases
        expect(() => {
          callHCFunction(parse);
        }).toThrow('url.parse expects a string argument');

        expect(() => {
          callHCFunction(parse, { type: 'number', value: 123 });
        }).toThrow('url.parse expects a string argument');
      });

      test('should add resolve function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeUrlFunctions(testNs);

        const resolve = testNs.environment.get('resolve');
        expect(resolve.type).toBe('function');

        // Test valid call
        const result = callHCFunction(resolve,
          { type: 'string', value: 'https://example.com/' },
          { type: 'string', value: 'path/file.html' }
        );
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');

        // Test error cases
        expect(() => {
          callHCFunction(resolve, { type: 'string', value: 'base' });
        }).toThrow('url.resolve expects two string arguments');

        expect(() => {
          callHCFunction(resolve,
            { type: 'number', value: 123 },
            { type: 'string', value: 'path' }
          );
        }).toThrow('url.resolve expects two string arguments');
      });
    });

    describe('addNodeOsFunctions', () => {
      test('should add platform function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeOsFunctions(testNs);

        const platform = testNs.environment.get('platform');
        expect(platform.type).toBe('function');

        const result = callHCFunction(platform);
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');
      });

      test('should add hostname function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeOsFunctions(testNs);

        const hostname = testNs.environment.get('hostname');
        expect(hostname.type).toBe('function');

        const result = callHCFunction(hostname);
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');
      });

      test('should add tmpdir function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeOsFunctions(testNs);

        const tmpdir = testNs.environment.get('tmpdir');
        expect(tmpdir.type).toBe('function');

        const result = callHCFunction(tmpdir);
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');
      });

      test('should add homedir function', () => {
        const testNs = namespaceManager.createNamespace('test');
        namespaceManager.addNodeOsFunctions(testNs);

        const homedir = testNs.environment.get('homedir');
        expect(homedir.type).toBe('function');

        const result = callHCFunction(homedir);
        expect(result.type).toBe('string');
        expect(typeof getStringValue(result)).toBe('string');
      });
    });
  });
});
