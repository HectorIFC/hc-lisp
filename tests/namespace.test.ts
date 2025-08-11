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
});
