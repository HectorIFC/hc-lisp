import { createGlobalEnvironment } from '../src/Library';
import { HCValue } from '../src/Categorize';
import { Environment } from '../src/Context';

describe('Library Functions', () => {
  let env: Environment;

  beforeEach(() => {
    env = createGlobalEnvironment();
  });

  describe('Process functions', () => {
    test('should get process cwd', () => {
      const cwdFn = env.get('process/cwd');
      expect(cwdFn).toBeDefined();
      expect(cwdFn.type).toBe('function');

      const result = (cwdFn as any).value();
      expect(result.type).toBe('string');
      expect(typeof result.value).toBe('string');
      expect(result.value.length).toBeGreaterThan(0);
    });

    test('should get process environment variable', () => {
      const envFn = env.get('process/env');
      expect(envFn).toBeDefined();
      expect(envFn.type).toBe('function');


      const result = (envFn as any).value({ type: 'string', value: 'PATH' });
      expect(result.type).toBe('string');
      expect(typeof result.value).toBe('string');
    });

    test('should return nil for non-existent environment variable', () => {
      const envFn = env.get('process/env');
      const result = (envFn as any).value({ type: 'string', value: 'NON_EXISTENT_VAR_12345' });
      expect(result.type).toBe('nil');
      expect(result.value).toBe(null);
    });

    test('should throw error for non-string key in process/env', () => {
      const envFn = env.get('process/env');
      expect(() => (envFn as any).value({ type: 'number', value: 123 }))
        .toThrow('process/env requires a string key');
    });
  });

  describe('Date functions', () => {
    test('should get current timestamp with Date/now', () => {
      const dateFn = env.get('Date/now');
      expect(dateFn).toBeDefined();
      expect(dateFn.type).toBe('function');

      const result = (dateFn as any).value();
      expect(result.type).toBe('number');
      expect(typeof result.value).toBe('number');
      expect(result.value).toBeGreaterThan(0);
    });

    test('should create Date string', () => {
      const dateFn = env.get('Date');
      expect(dateFn).toBeDefined();
      expect(dateFn.type).toBe('function');

      const result = (dateFn as any).value();
      expect(result.type).toBe('string');
      expect(typeof result.value).toBe('string');
      expect(result.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('JSON functions', () => {
    test('should stringify object to JSON', () => {
      const jsonStringifyFn = env.get('json/stringify');
      expect(jsonStringifyFn).toBeDefined();
      expect(jsonStringifyFn.type).toBe('function');

      const input: HCValue = {
        type: 'object',
        value: { name: 'test', value: 42 }
      };

      const result = (jsonStringifyFn as any).value(input);
      expect(result.type).toBe('string');
      expect(result.value).toBe('{"name":"test","value":42}');
    });

    test('should throw error for wrong number of arguments in json/stringify', () => {
      const jsonStringifyFn = env.get('json/stringify');
      expect(() => (jsonStringifyFn as any).value())
        .toThrow('json/stringify expects one argument');
      expect(() => (jsonStringifyFn as any).value({type: 'string', value: 'a'}, {type: 'string', value: 'b'}))
        .toThrow('json/stringify expects one argument');
    });

    test('should parse JSON string', () => {
      const jsonParseFn = env.get('json/parse');
      expect(jsonParseFn).toBeDefined();
      expect(jsonParseFn.type).toBe('function');

      const input: HCValue = {
        type: 'string',
        value: '{"name":"test","value":42}'
      };

      const result = (jsonParseFn as any).value(input);
      expect(result.type).toBe('object');
      expect(result.value).toEqual({
        name: 'test',
        value: 42
      });
    });

    test('should parse JSON string with quoted input', () => {
      const jsonParseFn = env.get('json/parse');
      const input: HCValue = {
        type: 'string',
        value: '"{\\"test\\": true}"'
      };

      const result = (jsonParseFn as any).value(input);
      expect(result.type).toBe('object');
      expect(result.value).toEqual({
        test: true
      });
    });

    test('should throw error for non-string input in json/parse', () => {
      const jsonParseFn = env.get('json/parse');
      expect(() => (jsonParseFn as any).value({ type: 'number', value: 123 }))
        .toThrow('json/parse expects a string argument');
    });

    test('should throw error for invalid JSON in json/parse', () => {
      const jsonParseFn = env.get('json/parse');
      expect(() => (jsonParseFn as any).value({ type: 'string', value: '{invalid json}' }))
        .toThrow('Error parsing JSON:');
    });
  });

  describe('String functions', () => {
    test('should convert values to string with str', () => {
      const strFn = env.get('str');
      expect(strFn).toBeDefined();
      expect(strFn.type).toBe('function');

      const result = (strFn as any).value(
        { type: 'string', value: 'hello' },
        { type: 'number', value: 42 },
        { type: 'boolean', value: true },
        { type: 'nil', value: null },
        { type: 'keyword', value: 'test' }
      );

      expect(result.type).toBe('string');
      expect(result.value).toBe('hello42true:test');
    });

    test('should handle complex objects in str', () => {
      const strFn = env.get('str');
      const result = (strFn as any).value({
        type: 'object',
        value: { name: 'test' }
      });

      expect(result.type).toBe('string');
      expect(result.value).toBe('{"name":"test"}');
    });

    test('should uppercase string', () => {
      const upperFn = env.get('str/upper-case');
      expect(upperFn).toBeDefined();
      expect(upperFn.type).toBe('function');

      const result = (upperFn as any).value({ type: 'string', value: 'hello world' });
      expect(result.type).toBe('string');
      expect(result.value).toBe('HELLO WORLD');
    });

    test('should throw error for non-string in str/upper-case', () => {
      const upperFn = env.get('str/upper-case');
      expect(() => (upperFn as any).value({ type: 'number', value: 123 }))
        .toThrow('str/upper-case requires a string');
    });

    test('should lowercase string', () => {
      const lowerFn = env.get('str/lower-case');
      expect(lowerFn).toBeDefined();
      expect(lowerFn.type).toBe('function');

      const result = (lowerFn as any).value({ type: 'string', value: 'HELLO WORLD' });
      expect(result.type).toBe('string');
      expect(result.value).toBe('hello world');
    });

    test('should throw error for non-string in str/lower-case', () => {
      const lowerFn = env.get('str/lower-case');
      expect(() => (lowerFn as any).value({ type: 'number', value: 123 }))
        .toThrow('str/lower-case requires a string');
    });

    test('should trim string', () => {
      const trimFn = env.get('str/trim');
      expect(trimFn).toBeDefined();
      expect(trimFn.type).toBe('function');

      const result = (trimFn as any).value({ type: 'string', value: '  hello world  ' });
      expect(result.type).toBe('string');
      expect(result.value).toBe('hello world');
    });

    test('should throw error for non-string in str/trim', () => {
      const trimFn = env.get('str/trim');
      expect(() => (trimFn as any).value({ type: 'number', value: 123 }))
        .toThrow('str/trim requires a string');
    });

    test('should check if string starts with prefix', () => {
      const startsWithFn = env.get('str/startsWith');
      expect(startsWithFn).toBeDefined();
      expect(startsWithFn.type).toBe('function');

      const result1 = (startsWithFn as any).value(
        { type: 'string', value: 'hello world' },
        { type: 'string', value: 'hello' }
      );
      expect(result1.type).toBe('boolean');
      expect(result1.value).toBe(true);

      const result2 = (startsWithFn as any).value(
        { type: 'string', value: 'hello world' },
        { type: 'string', value: 'world' }
      );
      expect(result2.type).toBe('boolean');
      expect(result2.value).toBe(false);
    });

    test('should throw error for non-strings in str/startsWith', () => {
      const startsWithFn = env.get('str/startsWith');
      expect(() => (startsWithFn as any).value(
        { type: 'number', value: 123 },
        { type: 'string', value: 'test' }
      )).toThrow('str/startsWith requires two strings');

      expect(() => (startsWithFn as any).value(
        { type: 'string', value: 'test' },
        { type: 'number', value: 123 }
      )).toThrow('str/startsWith requires two strings');
    });

    test('should slice string with start index', () => {
      const sliceFn = env.get('str/slice');
      expect(sliceFn).toBeDefined();
      expect(sliceFn.type).toBe('function');

      const result = (sliceFn as any).value(
        { type: 'string', value: 'hello world' },
        { type: 'number', value: 6 }
      );
      expect(result.type).toBe('string');
      expect(result.value).toBe('world');
    });

    test('should slice string with start and end index', () => {
      const sliceFn = env.get('str/slice');
      const result = (sliceFn as any).value(
        { type: 'string', value: 'hello world' },
        { type: 'number', value: 0 },
        { type: 'number', value: 5 }
      );
      expect(result.type).toBe('string');
      expect(result.value).toBe('hello');
    });

    test('should throw error for invalid arguments in str/slice', () => {
      const sliceFn = env.get('str/slice');
      expect(() => (sliceFn as any).value(
        { type: 'number', value: 123 },
        { type: 'number', value: 0 }
      )).toThrow('str/slice requires a string and a number');

      expect(() => (sliceFn as any).value(
        { type: 'string', value: 'test' },
        { type: 'string', value: 'invalid' }
      )).toThrow('str/slice requires a string and a number');
    });
  });

  describe('Utility functions', () => {
    test('should parse integer with js/parseInt', () => {
      const parseIntFn = env.get('js/parseInt');
      expect(parseIntFn).toBeDefined();
      expect(parseIntFn.type).toBe('function');

      const result = (parseIntFn as any).value({ type: 'string', value: '42' });
      expect(result.type).toBe('number');
      expect(result.value).toBe(42);
    });

    test('should parse integer with invalid string', () => {
      const parseIntFn = env.get('js/parseInt');
      const result = (parseIntFn as any).value({ type: 'string', value: 'not a number' });
      expect(result.type).toBe('number');
      expect(isNaN(result.value)).toBe(true);
    });

    test('should throw error for non-string in js/parseInt', () => {
      const parseIntFn = env.get('js/parseInt');
      expect(() => (parseIntFn as any).value({ type: 'number', value: 123 }))
        .toThrow('js/parseInt requires a string');
    });

    test('should find maximum of numbers', () => {
      const maxFn = env.get('max');
      expect(maxFn).toBeDefined();
      expect(maxFn.type).toBe('function');

      const result = (maxFn as any).value(
        { type: 'number', value: 5 },
        { type: 'number', value: 10 },
        { type: 'number', value: 3 },
        { type: 'number', value: 8 }
      );
      expect(result.type).toBe('number');
      expect(result.value).toBe(10);
    });

    test('should throw error for no arguments in max', () => {
      const maxFn = env.get('max');
      expect(() => (maxFn as any).value())
        .toThrow('max requires at least one argument');
    });

    test('should throw error for non-numbers in max', () => {
      const maxFn = env.get('max');
      expect(() => (maxFn as any).value(
        { type: 'number', value: 5 },
        { type: 'string', value: 'not a number' }
      )).toThrow('max requires numbers');
    });
  });

  describe('Object manipulation functions', () => {
    test('should merge objects', () => {
      const mergeFn = env.get('merge');
      expect(mergeFn).toBeDefined();
      expect(mergeFn.type).toBe('function');

      const result = (mergeFn as any).value(
        { type: 'object', value: { a: 1, b: 2 } },
        { type: 'object', value: { b: 3, c: 4 } },
        { type: 'object', value: { d: 5 } }
      );

      expect(result.type).toBe('object');
      expect(result.value).toEqual({ a: 1, b: 3, c: 4, d: 5 });
    });

    test('should handle non-object values in merge', () => {
      const mergeFn = env.get('merge');
      const result = (mergeFn as any).value(
        { type: 'object', value: { a: 1 } },
        { type: 'string', value: 'not an object' },
        { type: 'object', value: { b: 2 } }
      );

      expect(result.type).toBe('object');
      expect(result.value).toEqual({ a: 1, b: 2 });
    });

    test('should get value from object with keyword key', () => {
      const getFn = env.get('get');
      expect(getFn).toBeDefined();
      expect(getFn.type).toBe('function');

      const result = (getFn as any).value(
        { type: 'object', value: { name: 'test' } },
        { type: 'keyword', value: 'name' }
      );

      expect(result.type).toBe('string');
      expect(result.value).toBe('test');
    });

    test('should get value from object with string key', () => {
      const getFn = env.get('get');
      const result = (getFn as any).value(
        { type: 'object', value: { name: 'test' } },
        { type: 'string', value: 'name' }
      );

      expect(result.type).toBe('string');
      expect(result.value).toBe('test');
    });

    test('should return default value when key not found', () => {
      const getFn = env.get('get');
      const result = (getFn as any).value(
        { type: 'object', value: {} },
        { type: 'keyword', value: 'nonexistent' },
        { type: 'string', value: 'default' }
      );

      expect(result.type).toBe('string');
      expect(result.value).toBe('default');
    });

    test('should return nil when key not found and no default', () => {
      const getFn = env.get('get');
      const result = (getFn as any).value(
        { type: 'object', value: {} },
        { type: 'keyword', value: 'nonexistent' }
      );

      expect(result.type).toBe('nil');
      expect(result.value).toBe(null);
    });

    test('should get value from vector with keyword key', () => {
      const getFn = env.get('get');
      const result = (getFn as any).value(
        { type: 'vector', value: [
          { type: 'keyword', value: 'name' },
          { type: 'string', value: 'test' },
          { type: 'keyword', value: 'age' },
          { type: 'number', value: 25 }
        ]},
        { type: 'keyword', value: 'name' }
      );

      expect(result.type).toBe('string');
      expect(result.value).toBe('test');
    });

    test('should get value from vector with string key', () => {
      const getFn = env.get('get');
      const result = (getFn as any).value(
        { type: 'vector', value: [
          { type: 'string', value: 'name' },
          { type: 'string', value: 'test' }
        ]},
        { type: 'string', value: 'name' }
      );

      expect(result.type).toBe('string');
      expect(result.value).toBe('test');
    });
  });

  describe('Output functions', () => {
    test('should print values with println', () => {
      const printlnFn = env.get('println');
      expect(printlnFn).toBeDefined();
      expect(printlnFn.type).toBe('function');


      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = (printlnFn as any).value(
        { type: 'string', value: 'Hello' },
        { type: 'number', value: 42 },
        { type: 'nil', value: null },
        { type: 'keyword', value: 'test' }
      );

      expect(result.type).toBe('nil');
      expect(result.value).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith('Hello 42 nil :test');

      consoleSpy.mockRestore();
    });

    test('should print values with print', () => {
      const printFn = env.get('print');
      expect(printFn).toBeDefined();
      expect(printFn.type).toBe('function');


      const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

      const result = (printFn as any).value(
        { type: 'string', value: 'Hello' },
        { type: 'number', value: 42 }
      );

      expect(result.type).toBe('nil');
      expect(result.value).toBe(null);
      expect(stdoutSpy).toHaveBeenCalledWith('Hello 42');

      stdoutSpy.mockRestore();
    });

    test('should print principles', () => {
      const principlesFn = env.get('principles');
      expect(principlesFn).toBeDefined();
      expect(principlesFn.type).toBe('function');


      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = (principlesFn as any).value();

      expect(result.type).toBe('nil');
      expect(result.value).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('The Principles of HC-Lisp'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('1. Clarity is better than clever tricks'));

      consoleSpy.mockRestore();
    });

    test('should print family story', () => {
      const familyFn = env.get('family');
      expect(familyFn).toBeDefined();
      expect(familyFn.type).toBe('function');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = (familyFn as any).value();

      expect(result.type).toBe('nil');
      expect(result.value).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('The HC-Lisp Family Story'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Brígida brought love and patience'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Heitor arrived to multiply the joy'));

      consoleSpy.mockRestore();
    });
  });

  describe('Global environment additional functions', () => {
    test('should have parseInt function', () => {
      const parseIntFn = env.get('parseInt');
      expect(parseIntFn).toBeDefined();
      expect(parseIntFn.type).toBe('function');

      const result = (parseIntFn as any).value(
        { type: 'string', value: '42' },
        { type: 'number', value: 10 }
      );
      expect(result.type).toBe('number');
      expect(result.value).toBe(42);
    });

    test('should have JSON object with stringify and parse methods', () => {
      const jsonObj = env.get('JSON');
      expect(jsonObj).toBeDefined();
      expect(jsonObj.type).toBe('object');
      expect((jsonObj as any).value).toHaveProperty('stringify');
      expect((jsonObj as any).value).toHaveProperty('parse');


      const stringifyResult = (jsonObj as any).value.stringify({ type: 'string', value: 'test' });
      expect(stringifyResult.type).toBe('string');
      expect(stringifyResult.value).toBe('"test"');


      const parseResult = (jsonObj as any).value.parse({ type: 'string', value: '"test"' });
      expect(parseResult.type).toBe('string');
      expect(parseResult.value).toBe('test');
    });
  });

  describe('Atom functions', () => {
    test('should create an atom', () => {
      const atomFn = env.get('atom');
      expect(atomFn).toBeDefined();
      expect(atomFn.type).toBe('function');

      const initialValue = { type: 'number', value: 42 };
      const atomValue = (atomFn as any).value(initialValue);

      expect(atomValue.type).toBe('object');
      expect(atomValue.value.__isAtom).toBe(true);
      expect(atomValue.value.value).toEqual(initialValue);
    });

    test('should dereference an atom', () => {
      const atomFn = env.get('atom');
      const derefFn = env.get('deref');
      expect(derefFn).toBeDefined();
      expect(derefFn.type).toBe('function');

      const initialValue = { type: 'string', value: 'test' };
      const atomValue = (atomFn as any).value(initialValue);
      const derefValue = (derefFn as any).value(atomValue);

      expect(derefValue).toEqual(initialValue);
    });

    test('should throw error when dereferencing non-atom', () => {
      const derefFn = env.get('deref');
      expect(() => (derefFn as any).value({ type: 'number', value: 42 }))
        .toThrow('deref requires an atom');
    });

    test('should reset atom value', () => {
      const atomFn = env.get('atom');
      const resetFn = env.get('reset!');
      expect(resetFn).toBeDefined();
      expect(resetFn.type).toBe('function');

      const initialValue = { type: 'number', value: 42 };
      const atomValue = (atomFn as any).value(initialValue);
      const newValue = { type: 'string', value: 'new' };

      const result = (resetFn as any).value(atomValue, newValue);
      expect(result).toEqual(newValue);
      expect(atomValue.value.value).toEqual(newValue);
    });

    test('should throw error when resetting non-atom', () => {
      const resetFn = env.get('reset!');
      expect(() => (resetFn as any).value({ type: 'number', value: 42 }, { type: 'string', value: 'test' }))
        .toThrow('reset! requires an atom');
    });

    test('should swap atom value with function', () => {
      const atomFn = env.get('atom');
      const swapFn = env.get('swap!');
      expect(swapFn).toBeDefined();
      expect(swapFn.type).toBe('function');

      const initialValue = { type: 'number', value: 5 };
      const atomValue = (atomFn as any).value(initialValue);

      const incrementFn = {
        type: 'function' as const,
        value: (x: HCValue) => ({ type: 'number' as const, value: (x as any).value + 1 })
      };

      const result = (swapFn as any).value(atomValue, incrementFn);
      expect(result.type).toBe('number');
      expect(result.value).toBe(6);
      expect(atomValue.value.value.value).toBe(6);
    });

    test('should throw error when swapping non-atom', () => {
      const swapFn = env.get('swap!');
      const fn = { type: 'function' as const, value: (x: HCValue) => x };
      expect(() => (swapFn as any).value({ type: 'number', value: 42 }, fn))
        .toThrow('swap! requires an atom as first argument');
    });

    test('should throw error when swapping with non-function', () => {
      const atomFn = env.get('atom');
      const swapFn = env.get('swap!');
      const atomValue = (atomFn as any).value({ type: 'number', value: 42 });
      expect(() => (swapFn as any).value(atomValue, { type: 'number', value: 42 }))
        .toThrow('swap! requires a function as second argument');
    });

    test('should throw error for closures in swap!', () => {
      const atomFn = env.get('atom');
      const swapFn = env.get('swap!');
      const atomValue = (atomFn as any).value({ type: 'number', value: 42 });
      const closureFn = { type: 'closure' as const, value: {} };
      expect(() => (swapFn as any).value(atomValue, closureFn))
        .toThrow('swap! with closures should be handled by the interpreter');
    });
  });

  describe('Collection functions', () => {
    test('should create list from arguments', () => {
      const listFn = env.get('list');
      expect(listFn).toBeDefined();
      expect(listFn.type).toBe('function');

      const emptyResult = (listFn as any).value();
      expect(emptyResult.type).toBe('list');
      expect(emptyResult.value).toEqual([]);

      const singleResult = (listFn as any).value({ type: 'number', value: 42 });
      expect(singleResult.type).toBe('list');
      expect(singleResult.value).toEqual([{ type: 'number', value: 42 }]);

      const multiResult = (listFn as any).value(
        { type: 'number', value: 1 },
        { type: 'string', value: 'hello' },
        { type: 'boolean', value: true }
      );
      expect(multiResult.type).toBe('list');
      expect(multiResult.value).toEqual([
        { type: 'number', value: 1 },
        { type: 'string', value: 'hello' },
        { type: 'boolean', value: true }
      ]);
    });

    test('should conjoin items to sequence', () => {
      const conjFn = env.get('conj');
      expect(conjFn).toBeDefined();
      expect(conjFn.type).toBe('function');

      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      const newItem = { type: 'number', value: 2 };

      const result = (conjFn as any).value(seq, newItem);
      expect(result.type).toBe('vector');
      expect(result.value).toHaveLength(2);
      expect(result.value[1]).toEqual(newItem);
    });

    test('should throw error for non-sequence in conj', () => {
      const conjFn = env.get('conj');
      expect(() => (conjFn as any).value({ type: 'number', value: 42 }, { type: 'number', value: 1 }))
        .toThrow('conj requires a sequence as first argument');
    });

    test('should associate key-value pairs', () => {
      const assocFn = env.get('assoc');
      expect(assocFn).toBeDefined();
      expect(assocFn.type).toBe('function');

      const obj = { type: 'object' as const, value: { existing: 'value' } };
      const key = { type: 'keyword' as const, value: 'newKey' };
      const value = { type: 'string' as const, value: 'newValue' };

      const result = (assocFn as any).value(obj, key, value);
      expect(result.type).toBe('object');
      expect(result.value.existing).toBe('value');
      expect(result.value.newKey).toBe('newValue');
    });

    test('should throw error for odd number of key-value arguments in assoc', () => {
      const assocFn = env.get('assoc');
      const obj = { type: 'object' as const, value: {} };
      const key = { type: 'keyword' as const, value: 'key' };
      expect(() => (assocFn as any).value(obj, key))
        .toThrow('assoc requires an even number of key-value arguments');
    });

    test('should handle vector input in assoc', () => {
      const assocFn = env.get('assoc');
      const vector = {
        type: 'vector' as const,
        value: [
          { type: 'keyword' as const, value: 'name' },
          { type: 'string' as const, value: 'test' }
        ]
      };
      const newKey = { type: 'keyword' as const, value: 'age' };
      const newValue = { type: 'number' as const, value: 25 };

      const result = (assocFn as any).value(vector, newKey, newValue);
      expect(result.type).toBe('object');
      expect(result.value.name).toBe('test');
      expect(result.value.age).toBe(25);
    });
  });

  describe('Higher-order function error handling', () => {
    test('should throw error for filter with closures', () => {
      const filterFn = env.get('filter');
      expect(filterFn).toBeDefined();
      expect(filterFn.type).toBe('function');

      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      const fn = { type: 'closure' as const, value: {} };
      expect(() => (filterFn as any).value(fn, seq))
        .toThrow('filter with closures should be handled by the interpreter');
    });

    test('should throw error for non-function in filter', () => {
      const filterFn = env.get('filter');
      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      expect(() => (filterFn as any).value({ type: 'number', value: 42 }, seq))
        .toThrow('filter requires a function as first argument');
    });

    test('should throw error for non-sequence in filter', () => {
      const filterFn = env.get('filter');
      const fn = { type: 'function' as const, value: () => ({ type: 'boolean', value: true }) };
      expect(() => (filterFn as any).value(fn, { type: 'number', value: 42 }))
        .toThrow('filter requires a sequence as second argument');
    });

    test('should apply function with arguments', () => {
      const applyFn = env.get('apply');
      expect(applyFn).toBeDefined();
      expect(applyFn.type).toBe('function');

      const addFn = {
        type: 'function' as const,
        value: (a: HCValue, b: HCValue) => ({ type: 'number' as const, value: (a as any).value + (b as any).value })
      };
      const args = {
        type: 'vector' as const,
        value: [{ type: 'number', value: 2 }, { type: 'number', value: 3 }]
      };

      const result = (applyFn as any).value(addFn, args);
      expect(result.type).toBe('number');
      expect(result.value).toBe(5);
    });

    test('should throw error for closures in apply', () => {
      const applyFn = env.get('apply');
      const fn = { type: 'closure' as const, value: {} };
      const args = { type: 'vector' as const, value: [] };
      expect(() => (applyFn as any).value(fn, args))
        .toThrow('apply with closures should be handled by the interpreter');
    });

    test('should throw error for non-function in apply', () => {
      const applyFn = env.get('apply');
      const args = { type: 'vector' as const, value: [] };
      expect(() => (applyFn as any).value({ type: 'number', value: 42 }, args))
        .toThrow('apply requires a function as first argument');
    });

    test('should throw error for non-sequence in apply', () => {
      const applyFn = env.get('apply');
      const fn = { type: 'function' as const, value: () => ({ type: 'nil', value: null }) };
      expect(() => (applyFn as any).value(fn, { type: 'number', value: 42 }))
        .toThrow('apply requires a sequence as second argument');
    });

    test('should throw error for map with closures', () => {
      const mapFn = env.get('map');
      expect(mapFn).toBeDefined();
      expect(mapFn.type).toBe('function');

      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      const fn = { type: 'closure' as const, value: {} };
      expect(() => (mapFn as any).value(fn, seq))
        .toThrow('map with closures should be handled by the interpreter');
    });

    test('should throw error for non-function in map', () => {
      const mapFn = env.get('map');
      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      expect(() => (mapFn as any).value({ type: 'number', value: 42 }, seq))
        .toThrow('map requires a function as first argument');
    });

    test('should throw error for non-sequence in map', () => {
      const mapFn = env.get('map');
      const fn = { type: 'function' as const, value: () => ({ type: 'boolean', value: true }) };
      expect(() => (mapFn as any).value(fn, { type: 'number', value: 42 }))
        .toThrow('map requires a sequence as second argument');
    });

    test('should throw error for reduce with closures', () => {
      const reduceFn = env.get('reduce');
      expect(reduceFn).toBeDefined();
      expect(reduceFn.type).toBe('function');

      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      const initial = { type: 'number' as const, value: 0 };
      const fn = { type: 'closure' as const, value: {} };
      expect(() => (reduceFn as any).value(fn, initial, seq))
        .toThrow('reduce with closures should be handled by the interpreter');
    });

    test('should throw error for non-function in reduce', () => {
      const reduceFn = env.get('reduce');
      const seq = { type: 'vector' as const, value: [{ type: 'number', value: 1 }] };
      const initial = { type: 'number' as const, value: 0 };
      expect(() => (reduceFn as any).value({ type: 'number', value: 42 }, initial, seq))
        .toThrow('reduce requires a function as first argument');
    });

    test('should throw error for non-sequence in reduce', () => {
      const reduceFn = env.get('reduce');
      const fn = { type: 'function' as const, value: () => ({ type: 'boolean', value: true }) };
      const initial = { type: 'number' as const, value: 0 };
      expect(() => (reduceFn as any).value(fn, initial, { type: 'number', value: 42 }))
        .toThrow('reduce requires a sequence as third argument');
    });
  });

  describe('Range function edge cases', () => {
    test('should throw error for invalid number of arguments in range', () => {
      const rangeFn = env.get('range');
      expect(() => (rangeFn as any).value())
        .toThrow('range takes 1-3 arguments');
      expect(() => (rangeFn as any).value(
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
        { type: 'number', value: 3 },
        { type: 'number', value: 4 }
      )).toThrow('range takes 1-3 arguments');
    });

    test('should throw error for non-number arguments in range', () => {
      const rangeFn = env.get('range');
      expect(() => (rangeFn as any).value({ type: 'string', value: 'test' }))
        .toThrow('range requires numbers');
      expect(() => (rangeFn as any).value({ type: 'number', value: 1 }, { type: 'string', value: 'test' }))
        .toThrow('range requires numbers');
      expect(() => (rangeFn as any).value({ type: 'number', value: 1 }, { type: 'number', value: 2 }, { type: 'string', value: 'test' }))
        .toThrow('range requires numbers');
    });

    test('should handle negative step in range', () => {
      const rangeFn = env.get('range');
      const result = (rangeFn as any).value(
        { type: 'number', value: 5 },
        { type: 'number', value: 0 },
        { type: 'number', value: -1 }
      );
      expect(result.type).toBe('list');
      expect(result.value).toHaveLength(5);
      expect(result.value[0].value).toBe(5);
      expect(result.value[4].value).toBe(1);
    });
  });
});
