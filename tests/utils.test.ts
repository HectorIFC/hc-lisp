import { toJSValue, jsonToHcValue } from '../src/Utils';
import { HCValue } from '../src/Categorize';

describe('Utils', () => {
  describe('toJSValue', () => {
    it('should handle nil type', () => {
      const value: HCValue = { type: 'nil', value: null };
      const result = toJSValue(value);
      expect(result).toBe(null);
    });

    it('should handle symbol type', () => {
      const value: HCValue = { type: 'symbol', value: 'test-symbol' };
      const result = toJSValue(value);
      expect(result).toBe('test-symbol');
    });

    it('should handle keyword type', () => {
      const value: HCValue = { type: 'keyword', value: 'test-keyword' };
      const result = toJSValue(value);
      expect(result).toBe('test-keyword');
    });

    it('should handle js-object type with jsRef', () => {
      const mockObject = { test: 'value' };
      const value: HCValue = {
        type: 'js-object',
        value: null,
        jsRef: mockObject
      } as any;

      const result = toJSValue(value);
      expect(result).toBe(mockObject);
    });

    it('should handle js-object type without jsRef', () => {
      const value: HCValue = {
        type: 'js-object',
        value: null
      } as any;

      const result = toJSValue(value);
      expect(result).toBeUndefined();
    });

    it('should handle object type with nodejs context and original object', () => {
      const originalObject = { original: 'data' };
      const value: HCValue = {
        type: 'object',
        value: { wrapped: 'data' },
        __nodejs_context__: true,
        __original_object__: originalObject
      } as any;

      const result = toJSValue(value);
      expect(result).toBe(originalObject);
    });

    it('should handle Server object type', () => {
      const mockServer = { constructor: { name: 'Server' }, port: 3000 };
      const value: HCValue = {
        type: 'object',
        value: mockServer
      };

      const result = toJSValue(value);
      expect(result).toBe(mockServer);
    });

    it('should handle Buffer object type', () => {
      const mockBuffer = {
        constructor: { name: 'Buffer' },
        toString: jest.fn().mockReturnValue('buffer-content')
      };
      const value: HCValue = {
        type: 'object',
        value: mockBuffer
      };

      const result = toJSValue(value);
      expect(mockBuffer.toString).toHaveBeenCalled();
      expect(result).toBe('buffer-content');
    });

    it('should handle Buffer-like object (object with numeric keys)', () => {
      const bufferLikeObject = { '0': 72, '1': 101, '2': 108, '3': 108, '4': 111 };
      const value: HCValue = {
        type: 'object',
        value: bufferLikeObject
      };

      const result = toJSValue(value);
      expect(result).toBe('Hello');
    });

    it('should handle nested HCValue structure with string type', () => {
      const value: HCValue = {
        type: 'object',
        value: {
          type: 'string',
          value: 'nested-string'
        }
      };

      const result = toJSValue(value);
      expect(result).toBe('nested-string');
    });

    it('should handle nested HCValue structure with number type', () => {
      const value: HCValue = {
        type: 'object',
        value: {
          type: 'number',
          value: 42
        }
      };

      const result = toJSValue(value);
      expect(result).toBe(42);
    });

    it('should handle nested HCValue structure with boolean type', () => {
      const value: HCValue = {
        type: 'object',
        value: {
          type: 'boolean',
          value: true
        }
      };

      const result = toJSValue(value);
      expect(result).toBe(true);
    });

    it('should handle complex object with nested HCValues', () => {
      const complexObject = {
        key1: { type: 'string', value: 'value1' },
        key2: 'simple-value',
        key3: { type: 'number', value: 42 }
      };
      const value: HCValue = {
        type: 'object',
        value: complexObject
      };

      const result = toJSValue(value);
      expect(result).toEqual({
        key1: 'value1',
        key2: 'simple-value',
        key3: 42
      });
    });

    it('should handle closure type', () => {
      const value: HCValue = {
        type: 'closure',
        params: [],
        body: { type: 'nil', value: null },
        env: null
      } as any;

      const result = toJSValue(value);
      expect(result).toBe('<closure>');
    });

    it('should handle default case', () => {
      const value = { type: 'unknown', value: 'test' } as any;

      const result = toJSValue(value);
      expect(result).toBe(value);
    });

    it('should handle case where object value has nested HCValue with unhandled type', () => {
      const value: HCValue = {
        type: 'object',
        value: {
          type: 'keyword',
          value: 'test-keyword'
        }
      };

      const result = toJSValue(value);
      expect(result).toEqual({
        type: 'keyword',
        value: 'test-keyword'
      });
    });

    it('should handle case where object is empty or null', () => {
      const value: HCValue = {
        type: 'object',
        value: null
      };

      const result = toJSValue(value);
      expect(result).toBe(null);
    });

    it('should handle object that is not Buffer-like (non-numeric keys)', () => {
      const objectValue = { 'a': 72, 'b': 101, 'c': 108 };
      const value: HCValue = {
        type: 'object',
        value: objectValue
      };

      const result = toJSValue(value);
      expect(result).toEqual(objectValue);
    });
  });

  describe('jsonToHcValue', () => {
    it('should handle null and undefined', () => {
      expect(jsonToHcValue(null)).toEqual({ type: 'nil', value: null });
      expect(jsonToHcValue(undefined as any)).toEqual({ type: 'nil', value: null });
    });

    it('should handle boolean values', () => {
      expect(jsonToHcValue(true)).toEqual({ type: 'boolean', value: true });
      expect(jsonToHcValue(false)).toEqual({ type: 'boolean', value: false });
    });

    it('should handle number values', () => {
      expect(jsonToHcValue(42)).toEqual({ type: 'number', value: 42 });
      expect(jsonToHcValue(3.14)).toEqual({ type: 'number', value: 3.14 });
    });

    it('should handle string values', () => {
      expect(jsonToHcValue('hello')).toEqual({ type: 'string', value: 'hello' });
    });

    it('should handle array values', () => {
      const array = [1, 'test', true, null];
      const result = jsonToHcValue(array);

      expect(result).toEqual({
        type: 'vector',
        value: [
          { type: 'number', value: 1 },
          { type: 'string', value: 'test' },
          { type: 'boolean', value: true },
          { type: 'nil', value: null }
        ]
      });
    });

    it('should handle object values', () => {
      const obj = { key1: 'value1', key2: 42, key3: true };
      const result = jsonToHcValue(obj);

      expect(result).toEqual({
        type: 'object',
        value: {
          key1: 'value1',
          key2: 42,
          key3: true
        }
      });
    });

    it('should handle unknown types by converting to string', () => {
      const value = Symbol('test') as any;
      const result = jsonToHcValue(value);

      expect(result).toEqual({ type: 'string', value: 'Symbol(test)' });
    });
  });
});
