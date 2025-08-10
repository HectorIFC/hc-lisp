import { NamespaceManager } from '../src/Namespace';
import { Environment } from '../src/Context';

describe('Namespace Coverage Tests', () => {
    let nsManager: NamespaceManager;

    beforeEach(() => {
        nsManager = new NamespaceManager();
    });

    describe('Basic Namespace Operations Coverage', () => {
        it('should throw error when setting non-existent namespace', () => {
            expect(() => {
                nsManager.setCurrentNamespace('non-existent');
            }).toThrow('Namespace \'non-existent\' does not exist');
        });

        it('should get existing namespace', () => {
            nsManager.createNamespace('test');
            const ns = nsManager.getNamespace('test');
            expect(ns).toBeDefined();
            expect(ns!.name).toBe('test');
        });

        it('should return undefined for non-existent namespace', () => {
            const ns = nsManager.getNamespace('non-existent');
            expect(ns).toBeUndefined();
        });

        it('should create namespace with base environment', () => {
            const baseEnv = new Environment(null);
            baseEnv.define('test-var', { type: 'number', value: 42 });

            const ns = nsManager.createNamespace('test-with-base', baseEnv);
            expect(ns.environment.get('test-var')).toEqual({ type: 'number', value: 42 });
        });

        it('should add import to current namespace', () => {
            const mockImplementation = () => 'mock';
            nsManager.addImport('TestClass', mockImplementation);

            const currentNs = nsManager.getCurrentNamespace();
            expect(currentNs.imports.get('TestClass')).toBe(mockImplementation);
        });

        it('should add require and create mock namespace', () => {
            nsManager.addRequire('test.namespace', 'test');

            const currentNs = nsManager.getCurrentNamespace();
            expect(currentNs.requires.get('test.namespace')).toBe('test');

            const targetNs = nsManager.getNamespace('test.namespace');
            expect(targetNs).toBeDefined();
        });
    });

    describe('Node.js Module Creation Coverage', () => {
        it('should create node.fs namespace with functions', () => {
            nsManager.addRequire('node.fs', 'fs');
            const fsNs = nsManager.getNamespace('node.fs');
            expect(fsNs).toBeDefined();

            const readFileSync = fsNs!.environment.get('readFileSync');
            expect(readFileSync.type).toBe('function');
            const existsSync = fsNs!.environment.get('existsSync');
            expect(existsSync.type).toBe('function');
        });

        it('should create node.crypto namespace with functions', () => {
            nsManager.addRequire('node.crypto', 'crypto');
            const cryptoNs = nsManager.getNamespace('node.crypto');
            expect(cryptoNs).toBeDefined();

            // Check that some crypto functions were added
            const randomUUID = cryptoNs!.environment.get('randomUUID');
            expect(randomUUID.type).toBe('function');
        });

        it('should create node.path namespace with functions', () => {
            nsManager.addRequire('node.path', 'path');
            const pathNs = nsManager.getNamespace('node.path');
            expect(pathNs).toBeDefined();
        });

        it('should create node.http namespace with functions', () => {
            nsManager.addRequire('node.http', 'http');
            const httpNs = nsManager.getNamespace('node.http');
            expect(httpNs).toBeDefined();
        });

        it('should create node.url namespace with functions', () => {
            nsManager.addRequire('node.url', 'url');
            const urlNs = nsManager.getNamespace('node.url');
            expect(urlNs).toBeDefined();
        });

        it('should create node.os namespace with functions', () => {
            nsManager.addRequire('node.os', 'os');
            const osNs = nsManager.getNamespace('node.os');
            expect(osNs).toBeDefined();
        });

        it('should handle unknown module names by creating empty namespace', () => {
            nsManager.addRequire('unknown.module', 'unknown');
            const unknownNs = nsManager.getNamespace('unknown.module');
            expect(unknownNs).toBeDefined();
        });

        it('should handle npm module loading attempt', () => {
            // This will try to load a module, fail, and create a fallback namespace
            nsManager.addRequire('non-existent-npm-module', 'npm');
            const ns = nsManager.getNamespace('non-existent-npm-module');
            expect(ns).toBeDefined();
        });
    });

    describe('Symbol Resolution Coverage', () => {
        let testEnv: Environment;

        beforeEach(() => {
            testEnv = new Environment(null);
            testEnv.define('local-symbol', { type: 'string', value: 'local' });
        });

        it('should resolve symbol from local environment', () => {
            const result = nsManager.resolveSymbol('local-symbol', testEnv);
            expect(result).toEqual({ type: 'string', value: 'local' });
        });

        it('should resolve namespaced symbol', () => {
            // Setup a namespace with a function
            nsManager.addRequire('test.namespace', 'test');
            const testNs = nsManager.getNamespace('test.namespace')!;
            testNs.environment.define('test-function', { type: 'string', value: 'test-result' });

            const result = nsManager.resolveSymbol('test/test-function', testEnv);
            expect(result).toEqual({ type: 'string', value: 'test-result' });
        });

        it('should throw error for undefined symbol in namespace', () => {
            nsManager.addRequire('test.namespace', 'test');

            expect(() => {
                nsManager.resolveSymbol('test/non-existent', testEnv);
            }).toThrow('Function \'non-existent\' not found in namespace \'test.namespace\'');
        });

        it('should throw error for unknown namespace alias', () => {
            expect(() => {
                nsManager.resolveSymbol('unknown/function', testEnv);
            }).toThrow('Namespace alias \'unknown\' not found');
        });

        it('should resolve symbol from imports', () => {
            const mockImplementation = () => 'imported';
            nsManager.addImport('ImportedClass', mockImplementation);

            const result = nsManager.resolveSymbol('ImportedClass', testEnv);
            expect(result.type).toBe('function');
            expect((result as any).value).toBe(mockImplementation);
        });

        it('should throw error for completely undefined symbol', () => {
            expect(() => {
                nsManager.resolveSymbol('completely-undefined', testEnv);
            }).toThrow('Undefined symbol: completely-undefined');
        });
    });

    describe('Namespace Caching and Module Loading', () => {
        it('should handle module loading failure gracefully', () => {
            // Test by trying to load a module that doesn't exist
            nsManager.addRequire('definitely-non-existent-module', 'nem');

            // Should create the namespace anyway (fallback behavior)
            const ns = nsManager.getNamespace('definitely-non-existent-module');
            expect(ns).toBeDefined();
        });

        it('should handle module loading with potential cache behavior', () => {
            // Load the same node module twice to potentially trigger cache behavior
            nsManager.addRequire('node.path', 'path1');
            nsManager.addRequire('node.path', 'path2');

            const ns1 = nsManager.getNamespace('node.path');
            expect(ns1).toBeDefined();
        });

        it('should handle various types of module names', () => {
            const testCases = [
                ['node.fs', 'fs'],
                ['node.crypto', 'crypto'],
                ['node.path', 'path'],
                ['node.http', 'http'],
                ['node.url', 'url'],
                ['node.os', 'os'],
                ['some-npm-package', 'pkg'],
                ['another-package', 'another']
            ];

            testCases.forEach(([moduleName, alias]) => {
                nsManager.addRequire(moduleName, alias);
                const ns = nsManager.getNamespace(moduleName);
                expect(ns).toBeDefined();
                expect(ns!.name).toBe(moduleName);
            });
        });
    });

    describe('Namespace Require Resolution Edge Cases', () => {
        it('should handle namespace resolution with multiple requires', () => {
            // Set up multiple namespaces
            nsManager.addRequire('ns1', 'alias1');
            nsManager.addRequire('ns2', 'alias2');
            nsManager.addRequire('ns3', 'alias3');

            const ns1 = nsManager.getNamespace('ns1')!;
            const ns2 = nsManager.getNamespace('ns2')!;
            const ns3 = nsManager.getNamespace('ns3')!;

            ns1.environment.define('func1', { type: 'string', value: 'result1' });
            ns2.environment.define('func2', { type: 'string', value: 'result2' });
            ns3.environment.define('func3', { type: 'string', value: 'result3' });

            const testEnv = new Environment(null);

            // Test resolving from different namespaces
            expect(nsManager.resolveSymbol('alias1/func1', testEnv)).toEqual({ type: 'string', value: 'result1' });
            expect(nsManager.resolveSymbol('alias2/func2', testEnv)).toEqual({ type: 'string', value: 'result2' });
            expect(nsManager.resolveSymbol('alias3/func3', testEnv)).toEqual({ type: 'string', value: 'result3' });
        });

        it('should handle symbol resolution priority order', () => {
            const testEnv = new Environment(null);

            // Define a symbol locally
            testEnv.define('test-symbol', { type: 'string', value: 'local-value' });

            // Also add it as an import
            nsManager.addImport('test-symbol', () => 'imported-value');

            // Local environment should take priority
            const result = nsManager.resolveSymbol('test-symbol', testEnv);
            expect(result).toEqual({ type: 'string', value: 'local-value' });
        });

        it('should search through requires array correctly', () => {
            // Add multiple requires to test the array iteration
            nsManager.addRequire('namespace1', 'alias1');
            nsManager.addRequire('namespace2', 'alias2');
            nsManager.addRequire('namespace3', 'alias2'); // Same alias, different namespace

            const ns1 = nsManager.getNamespace('namespace1')!;
            const ns2 = nsManager.getNamespace('namespace2')!;

            ns1.environment.define('test-func', { type: 'string', value: 'from-ns1' });
            ns2.environment.define('test-func', { type: 'string', value: 'from-ns2' });

            const testEnv = new Environment(null);

            // Should find the first match in the requires array
            const result = nsManager.resolveSymbol('alias2/test-func', testEnv);
            expect(result).toEqual({ type: 'string', value: 'from-ns2' });
        });
    });

    describe('Module Prefix Handling', () => {
        it('should handle module names with and without node prefix', () => {
            // Test that the cache mechanism works for modules with 'node.' prefix
            nsManager.addRequire('node.fs', 'fs1');

            // Verify namespace was created
            const fs1Ns = nsManager.getNamespace('node.fs');
            expect(fs1Ns).toBeDefined();

            // Test again to potentially trigger cache
            nsManager.addRequire('node.fs', 'fs2');
            const fs2Ns = nsManager.getNamespace('node.fs');
            expect(fs2Ns).toBeDefined();
            expect(fs1Ns).toBe(fs2Ns); // Should be the same namespace
        });
    });
});
