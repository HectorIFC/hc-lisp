import { NamespaceManager } from '../src/Namespace';

describe('Namespace Functions Simple Coverage Tests', () => {
    let manager: NamespaceManager;

    beforeEach(() => {
        manager = new NamespaceManager();
    });

    describe('Error Handling', () => {
        test('should handle tryLoadNodeModule with non-existent module', () => {
            const result = (manager as any).tryLoadNodeModule('non-existent-module-xyz123');
            expect(result).toBe(false); // Returns false, not null
        });

        test('should handle tryLoadNodeModule with invalid module name', () => {
            const result = (manager as any).tryLoadNodeModule('../invalid/path');
            expect(result).toBe(false); // Returns false, not null
        });
    });

    describe('Value Conversion', () => {
        test('should convert different JS values to HC values', () => {
            // Test null
            const nullValue = (manager as any).jsValueToHc(null);
            expect(nullValue).toEqual({ type: 'nil', value: null });

            // Test undefined
            const undefinedValue = (manager as any).jsValueToHc(undefined);
            expect(undefinedValue).toEqual({ type: 'nil', value: null }); // undefined also becomes nil

            // Test string
            const stringValue = (manager as any).jsValueToHc('hello');
            expect(stringValue).toEqual({ type: 'string', value: 'hello' });

            // Test number
            const numberValue = (manager as any).jsValueToHc(42);
            expect(numberValue).toEqual({ type: 'number', value: 42 });

            // Test boolean
            const booleanValue = (manager as any).jsValueToHc(true);
            expect(booleanValue).toEqual({ type: 'boolean', value: true });

            // Test array
            const arrayValue = (manager as any).jsValueToHc([1, 2, 3]);
            expect(arrayValue.type).toBe('vector'); // Arrays become vectors

            // Test object
            const objectValue = (manager as any).jsValueToHc({ key: 'value' });
            expect(objectValue.type).toBe('object');

            // Test function
            const functionValue = (manager as any).jsValueToHc(() => {});
            expect(functionValue.type).toBe('function');
        });

        test('should convert HC values to JS values', () => {
            // Test string
            const stringResult = (manager as any).hcValueToJs({ type: 'string', value: 'hello' });
            expect(stringResult).toBe('hello');

            // Test number
            const numberResult = (manager as any).hcValueToJs({ type: 'number', value: 42 });
            expect(numberResult).toBe(42);

            // Test boolean
            const booleanResult = (manager as any).hcValueToJs({ type: 'boolean', value: true });
            expect(booleanResult).toBe(true);

            // Test function
            const mockFn = jest.fn();
            const functionResult = (manager as any).hcValueToJs({ type: 'function', value: mockFn });
            expect(functionResult).toBe(mockFn);

            // Test object
            const obj = { key: 'value' };
            const objectResult = (manager as any).hcValueToJs({ type: 'object', value: obj });
            expect(objectResult).toBe(obj);
        });
    });

    describe('Basic Module Loading', () => {
        test('should handle fs module loading', () => {
            const result = (manager as any).tryLoadNodeModule('fs');
            expect(result).toBe(false); // Returns false when module not found
        });

        test('should handle path module loading', () => {
            const result = (manager as any).tryLoadNodeModule('path');
            expect(result).toBe(false); // Returns false when module not found
        });

        test('should handle crypto module loading', () => {
            const result = (manager as any).tryLoadNodeModule('crypto');
            expect(result).toBe(false); // Returns false when module not found
        });
    });

    describe('Module Wrapping', () => {
        test('should create namespace for wrapping', () => {
            const ns = manager.createNamespace('test');
            expect(ns).toBeDefined();
            expect(ns.environment).toBeDefined();
        });

        test('should test wrapNodeModule method exists', () => {
            expect(typeof (manager as any).wrapNodeModule).toBe('function');
        });
    });

    describe('Namespace Creation', () => {
        test('should create namespace with environment', () => {
            manager.createNamespace('test.namespace');
            const namespace = manager.getNamespace('test.namespace');

            expect(namespace).toBeDefined();
            expect(namespace!.environment).toBeDefined();
        });

        test('should return existing namespace', () => {
            const first = manager.createNamespace('test.existing');
            const second = manager.getNamespace('test.existing');

            expect(second).toBe(first);
        });

        test('should return undefined for non-existent namespace', () => {
            const namespace = manager.getNamespace('non.existent');
            expect(namespace).toBeUndefined();
        });

        test('should set and get current namespace', () => {
            manager.createNamespace('test.current');
            manager.setCurrentNamespace('test.current');
            const current = manager.getCurrentNamespace();
            expect(current.name).toBe('test.current');
        });

        test('should throw error for setting non-existent namespace as current', () => {
            expect(() => {
                manager.setCurrentNamespace('non.existent');
            }).toThrow('Namespace \'non.existent\' does not exist');
        });
    });

    describe('Additional Coverage Tests', () => {
        test('should test cache operations', () => {
            // Test cache miss first
            const cached1 = (manager as any).nodeModulesCache.get('test-module');
            expect(cached1).toBeUndefined();

            // Test cache set and get
            (manager as any).nodeModulesCache.set('test-module', { test: true });
            const cached2 = (manager as any).nodeModulesCache.get('test-module');
            expect(cached2).toEqual({ test: true });
        });

        test('should test more JS value conversions', () => {
            // Test BigInt becomes object
            const bigintValue = (manager as any).jsValueToHc(BigInt(123));
            expect(bigintValue.type).toBe('object');

            // Test Date object
            const dateValue = (manager as any).jsValueToHc(new Date());
            expect(dateValue.type).toBe('object');

            // Test RegExp
            const regexValue = (manager as any).jsValueToHc(/test/g);
            expect(regexValue.type).toBe('object');
        });

        test('should test HC value to JS conversion edge cases', () => {
            // Test unsupported type returns the full object
            const unknownType = (manager as any).hcValueToJs({ type: 'unknown', value: 'test' });
            expect(unknownType).toEqual({ type: 'unknown', value: 'test' });

            // Test nil type
            const nilValue = (manager as any).hcValueToJs({ type: 'nil', value: null });
            expect(nilValue).toBeNull();

            // Test vector type
            const vectorValue = (manager as any).hcValueToJs({ type: 'vector', value: [1, 2, 3] });
            expect(Array.isArray(vectorValue)).toBe(true);
        });
    });
});
