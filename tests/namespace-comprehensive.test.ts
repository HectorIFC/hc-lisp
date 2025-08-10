import { NamespaceManager } from '../src/Namespace';
import { Environment } from '../src/Context';
import { HCValue } from '../src/Categorize';

describe('Namespace Comprehensive Coverage Tests', () => {
    let namespaceManager: NamespaceManager;

    beforeEach(() => {
        namespaceManager = new NamespaceManager();
    });

    // Helper function to safely call HC functions
    const callHCFunction = (hcValue: HCValue, ...args: HCValue[]): HCValue => {
        if (hcValue.type === 'function') {
            return hcValue.value(...args);
        }
        throw new Error('Not a function');
    };

    // Helper to get string value safely
    const getStringValue = (hcValue: HCValue): string => {
        if (hcValue.type === 'string') {
            return hcValue.value;
        }
        throw new Error('Not a string');
    };

    // Helper to get boolean value safely
    const getBooleanValue = (hcValue: HCValue): boolean => {
        if (hcValue.type === 'boolean') {
            return hcValue.value;
        }
        throw new Error('Not a boolean');
    };

    describe('Custom Node.js Functions Coverage', () => {
        test('should test built-in namespace functions with error handling', () => {
            // Test by creating namespaces that use the internal functions
            namespaceManager.addRequire('node.fs', 'fs');
            const fsNs = namespaceManager.getNamespace('node.fs')!;

            // The functions should exist and be wrapped
            const readFileSync = fsNs.environment.get('readFileSync');
            const existsSync = fsNs.environment.get('existsSync');

            expect(readFileSync.type).toBe('function');
            expect(existsSync.type).toBe('function');

            // Test node.crypto functions
            namespaceManager.addRequire('node.crypto', 'crypto');
            const cryptoNs = namespaceManager.getNamespace('node.crypto')!;

            const randomUUID = cryptoNs.environment.get('randomUUID');
            const randomBytes = cryptoNs.environment.get('randomBytes');
            const createHash = cryptoNs.environment.get('createHash');

            expect(randomUUID.type).toBe('function');
            expect(randomBytes.type).toBe('function');
            expect(createHash.type).toBe('function');

            // Test all the other modules too
            namespaceManager.addRequire('node.http', 'http');
            namespaceManager.addRequire('node.url', 'url');
            namespaceManager.addRequire('node.os', 'os');

            const httpNs = namespaceManager.getNamespace('node.http')!;
            const urlNs = namespaceManager.getNamespace('node.url')!;
            const osNs = namespaceManager.getNamespace('node.os')!;

            // Verify all have their expected functions
            expect(httpNs.environment.get('createServer').type).toBe('function');
            expect(httpNs.environment.get('request').type).toBe('function');
            expect(urlNs.environment.get('parse').type).toBe('function');
            expect(urlNs.environment.get('resolve').type).toBe('function');
            expect(osNs.environment.get('platform').type).toBe('function');
            expect(osNs.environment.get('hostname').type).toBe('function');
            expect(osNs.environment.get('tmpdir').type).toBe('function');
            expect(osNs.environment.get('homedir').type).toBe('function');
        });
    });

    describe('Node.js Module Functions Coverage', () => {
        test('should handle node.fs functions completely', () => {
            namespaceManager.addRequire('node.fs', 'fs');
            const fsNs = namespaceManager.getNamespace('node.fs')!;

            // Test readFileSync exists and is a function
            const readFileSync = fsNs.environment.get('readFileSync');
            expect(readFileSync.type).toBe('function');

            // Test existsSync works with actual path
            const existsSync = fsNs.environment.get('existsSync');
            expect(existsSync.type).toBe('function');

            // Test with non-existent file (should return false, not throw)
            const existsResult = callHCFunction(existsSync, { type: 'string', value: '/non/existent/file.txt' });
            expect(existsResult.type).toBe('boolean');
            expect(getBooleanValue(existsResult)).toBe(false);
        });

        test('should handle node.crypto functions completely', () => {
            namespaceManager.addRequire('node.crypto', 'crypto');
            const cryptoNs = namespaceManager.getNamespace('node.crypto')!;

            // Test randomUUID function exists and works
            const randomUUID = cryptoNs.environment.get('randomUUID');
            expect(randomUUID.type).toBe('function');
            const uuidResult = callHCFunction(randomUUID);
            expect(uuidResult.type).toBe('string');
            expect(typeof getStringValue(uuidResult)).toBe('string');

            // Test randomBytes function exists
            const randomBytes = cryptoNs.environment.get('randomBytes');
            expect(randomBytes.type).toBe('function');

            // Test createHash function exists
            const createHash = cryptoNs.environment.get('createHash');
            expect(createHash.type).toBe('function');
        });

        test('should handle node.http functions completely', () => {
            namespaceManager.addRequire('node.http', 'http');
            const httpNs = namespaceManager.getNamespace('node.http')!;

            // Test createServer function exists
            const createServer = httpNs.environment.get('createServer');
            expect(createServer.type).toBe('function');

            // Test request function exists
            const request = httpNs.environment.get('request');
            expect(request.type).toBe('function');
        });

        test('should handle node.url functions completely', () => {
            namespaceManager.addRequire('node.url', 'url');
            const urlNs = namespaceManager.getNamespace('node.url')!;

            // Test parse function exists
            const parse = urlNs.environment.get('parse');
            expect(parse.type).toBe('function');

            // Test resolve function exists
            const resolve = urlNs.environment.get('resolve');
            expect(resolve.type).toBe('function');
        });

        test('should handle node.path functions completely', () => {
            namespaceManager.addRequire('node.path', 'path');
            const pathNs = namespaceManager.getNamespace('node.path')!;

            // Test join function exists and works
            const join = pathNs.environment.get('join');
            expect(join.type).toBe('function');

            // Test join with valid arguments
            const joinResult = callHCFunction(join,
                { type: 'string', value: '/home' },
                { type: 'string', value: 'user' },
                { type: 'string', value: 'documents' }
            );
            expect(joinResult.type).toBe('string');
            expect(typeof getStringValue(joinResult)).toBe('string');

            // Test basename function exists and works
            const basename = pathNs.environment.get('basename');
            expect(basename.type).toBe('function');

            const basenameResult = callHCFunction(basename, { type: 'string', value: '/path/to/file.txt' });
            expect(basenameResult.type).toBe('string');
            expect(getStringValue(basenameResult)).toBe('file.txt');

            // Test dirname function exists and works
            const dirname = pathNs.environment.get('dirname');
            expect(dirname.type).toBe('function');

            const dirnameResult = callHCFunction(dirname, { type: 'string', value: '/path/to/file.txt' });
            expect(dirnameResult.type).toBe('string');
            expect(getStringValue(dirnameResult)).toBe('/path/to');

            // Test extname function exists and works
            const extname = pathNs.environment.get('extname');
            expect(extname.type).toBe('function');

            const extnameResult = callHCFunction(extname, { type: 'string', value: '/path/to/file.txt' });
            expect(extnameResult.type).toBe('string');
            expect(getStringValue(extnameResult)).toBe('.txt');
        });

        test('should handle node.os functions completely', () => {
            namespaceManager.addRequire('node.os', 'os');
            const osNs = namespaceManager.getNamespace('node.os')!;

            // Test all OS functions
            const platform = osNs.environment.get('platform');
            const hostname = osNs.environment.get('hostname');
            const tmpdir = osNs.environment.get('tmpdir');
            const homedir = osNs.environment.get('homedir');

            // Call all functions to test conversion
            const platformResult = callHCFunction(platform);
            const hostnameResult = callHCFunction(hostname);
            const tmpdirResult = callHCFunction(tmpdir);
            const homedirResult = callHCFunction(homedir);

            expect(platformResult.type).toBe('string');
            expect(hostnameResult.type).toBe('string');
            expect(tmpdirResult.type).toBe('string');
            expect(homedirResult.type).toBe('string');
        });
    });

    describe('Complex Symbol Resolution Coverage', () => {
        test('should resolve symbols through requires array iteration', () => {
            const env = new Environment(null);

            // Add multiple requires to test array iteration
            namespaceManager.addRequire('node.fs', 'fs');
            namespaceManager.addRequire('node.crypto', 'crypto');
            namespaceManager.addRequire('node.path', 'path');

            // Test resolving a symbol from the second namespace
            const cryptoSymbol = namespaceManager.resolveSymbol('crypto/randomUUID', env);
            expect(cryptoSymbol.type).toBe('function');

            // Test resolving a symbol from the third namespace
            const pathSymbol = namespaceManager.resolveSymbol('path/join', env);
            expect(pathSymbol.type).toBe('function');
        });

        test('should handle imports resolution', () => {
            const env = new Environment(null);

            // Add a mock import
            const mockClass = class MockClass {};
            namespaceManager.addImport('MockClass', mockClass);

            // Test resolving the import
            const importSymbol = namespaceManager.resolveSymbol('MockClass', env);
            expect(importSymbol.type).toBe('function');
            if (importSymbol.type === 'function') {
                expect(importSymbol.value).toBe(mockClass);
            }
        });

        test('should handle environment resolution fallback', () => {
            const env = new Environment(null);
            env.define('localVar', { type: 'string', value: 'local value' });

            // Test resolving from local environment
            const localSymbol = namespaceManager.resolveSymbol('localVar', env);
            expect(localSymbol.type).toBe('string');
            if (localSymbol.type === 'string') {
                expect(localSymbol.value).toBe('local value');
            }
        });

        test('should handle error cases in symbol resolution', () => {
            const env = new Environment(null);

            // Test unknown namespace alias
            expect(() => namespaceManager.resolveSymbol('unknown/function', env))
                .toThrow('Namespace alias \'unknown\' not found');

            // Test function not found in namespace
            namespaceManager.addRequire('node.crypto', 'crypto');
            expect(() => namespaceManager.resolveSymbol('crypto/nonExistentFunction', env))
                .toThrow('Function \'nonExistentFunction\' not found in namespace \'node.crypto\'');

            // Test completely undefined symbol
            expect(() => namespaceManager.resolveSymbol('completelyUndefined', env))
                .toThrow('Undefined symbol: completelyUndefined');
        });
    });

    describe('Dynamic Module Loading and Wrapping Coverage', () => {
        test('should handle module caching behavior', () => {
            // Create two namespaces that use the same module
            namespaceManager.addRequire('node.crypto', 'crypto1');
            namespaceManager.addRequire('node.crypto', 'crypto2');

            const crypto1Ns = namespaceManager.getNamespace('node.crypto')!;
            const crypto2Ns = namespaceManager.getNamespace('node.crypto')!;

            // Both should exist and have the same functions
            expect(crypto1Ns).toBeDefined();
            expect(crypto2Ns).toBeDefined();
            expect(crypto1Ns).toBe(crypto2Ns); // Should be the same namespace object
        });

        test('should handle object modules with methods and properties', () => {
            // Test with a Node.js module that has both methods and properties
            namespaceManager.addRequire('node.path', 'path');
            const pathNs = namespaceManager.getNamespace('node.path')!;

            // Verify multiple functions are wrapped
            const join = pathNs.environment.get('join');
            const basename = pathNs.environment.get('basename');
            const dirname = pathNs.environment.get('dirname');
            const extname = pathNs.environment.get('extname');

            expect(join.type).toBe('function');
            expect(basename.type).toBe('function');
            expect(dirname.type).toBe('function');
            expect(extname.type).toBe('function');
        });

        test('should handle module prefix removal', () => {
            // Test that node. prefix is handled correctly
            namespaceManager.addRequire('node.crypto', 'crypto');
            const cryptoNs = namespaceManager.getNamespace('node.crypto')!;

            // Should have crypto functions even though module name had node. prefix
            const randomUUID = cryptoNs.environment.get('randomUUID');
            expect(randomUUID.type).toBe('function');
        });
    });

    describe('Value Conversion Edge Cases', () => {
        test('should handle various JS to HC value conversions', () => {
            // Test through functions that return different types
            namespaceManager.addRequire('node.os', 'os');
            const osNs = namespaceManager.getNamespace('node.os')!;

            // Test string conversion
            const platform = osNs.environment.get('platform');
            const platformResult = callHCFunction(platform);
            expect(platformResult.type).toBe('string');
            expect(typeof getStringValue(platformResult)).toBe('string');
        });

        test('should handle complex argument conversions', () => {
            // Test with path.join which takes multiple arguments
            namespaceManager.addRequire('node.path', 'path');
            const pathNs = namespaceManager.getNamespace('node.path')!;

            const join = pathNs.environment.get('join');

            // Test with multiple string inputs
            const result = callHCFunction(join,
                { type: 'string', value: '/root' },
                { type: 'string', value: 'subdir' },
                { type: 'string', value: 'file.txt' }
            );

            expect(result.type).toBe('string');
            const resultValue = getStringValue(result);
            expect(resultValue).toContain('root');
            expect(resultValue).toContain('subdir');
            expect(resultValue).toContain('file.txt');
        });
    });
});
