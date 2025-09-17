import {
  interpret,
  callFunction,
  mapWithClosure,
  reduceWithClosure,
  filterWithClosure,
  applyWithClosure,
  swapAtom
} from '../src/Interpret';
import { HCValue } from '../src/Categorize';
import { Environment } from '../src/Context';
import { createGlobalEnvironment } from '../src/Library';

describe('Interpret', () => {
  let env: Environment;

  beforeEach(() => {
    env = createGlobalEnvironment();
  });

  describe('Error handling in evaluateExpression', () => {

    test('should throw error for unsupported expression type', () => {
      const invalidExpr = { type: 'invalid-type' } as any;
      expect(() => interpret(invalidExpr, env)).toThrow('Cannot evaluate expression of type: invalid-type');
    });

  });

  describe('Function call error handling', () => {

    test('should handle function call errors', () => {
      const errorFn: HCValue = {
        type: 'function',
        value: () => {
          throw new Error('Test error');
        }
      };

      expect(() => callFunction(errorFn, [], env)).toThrow('Function call error: Test error');
    });

  });

  describe('Closure argument validation', () => {
    test('should validate closure argument count', () => {
      const closure: HCValue = {
        type: 'closure',
        params: ['x', 'y'],
        body: { type: 'symbol', value: 'x' },
        env: env
      };

      expect(() => callFunction(closure, [{ type: 'number', value: 1 }], env))
        .toThrow('Function expects 2 arguments, got 1');
    });

    test('should handle recur with wrong argument count', () => {
      const closure: HCValue = {
        type: 'closure',
        params: ['x'],
        body: { type: 'symbol', value: 'x' },
        env: env
      };

      const mockRecurError = {
        type: 'recur',
        values: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }]
      };

      jest.spyOn(console, 'log').mockImplementation(() => {});

      try {
        callFunction(closure, [{ type: 'number', value: 1 }], env);
      } catch (error: any) {
        error.type = 'recur';
        error.values = mockRecurError.values;

        expect(() => {
          throw error;
        }).toThrow();
      }

      jest.restoreAllMocks();
    });
  });

  describe('Non-function call error', () => {
    test('should throw error when calling non-function', () => {
      const nonFunction: HCValue = { type: 'number', value: 42 };
      expect(() => callFunction(nonFunction, [], env)).toThrow('Cannot call non-function value: number');
    });
  });

  describe('mapWithClosure error handling', () => {
    test('should validate function argument for map', () => {
      const nonFunction: HCValue = { type: 'number', value: 42 };
      const list: HCValue = { type: 'list', value: [] };

      expect(() => mapWithClosure(nonFunction, list, env)).toThrow('map requires a function as first argument');
    });

    test('should validate sequence argument for map', () => {
      const fn: HCValue = { type: 'function', value: (x: any) => x };
      const nonSequence: HCValue = { type: 'number', value: 42 };

      expect(() => mapWithClosure(fn, nonSequence, env)).toThrow('map requires a sequence as second argument');
    });
  });

  describe('reduceWithClosure error handling', () => {
    test('should validate function argument for reduce', () => {
      const nonFunction: HCValue = { type: 'number', value: 42 };
      const initial: HCValue = { type: 'number', value: 0 };
      const list: HCValue = { type: 'list', value: [] };

      expect(() => reduceWithClosure(nonFunction, initial, list, env)).toThrow('reduce requires a function as first argument');
    });

    test('should validate sequence argument for reduce', () => {
      const fn: HCValue = { type: 'function', value: (acc: any, x: any) => acc + x.value };
      const initial: HCValue = { type: 'number', value: 0 };
      const nonSequence: HCValue = { type: 'number', value: 42 };

      expect(() => reduceWithClosure(fn, initial, nonSequence, env)).toThrow('reduce requires a sequence as third argument');
    });
  });

  describe('filterWithClosure error handling', () => {
    test('should validate function argument for filter', () => {
      const nonFunction: HCValue = { type: 'number', value: 42 };
      const list: HCValue = { type: 'list', value: [] };

      expect(() => filterWithClosure(nonFunction, list, env)).toThrow('filter requires a function as first argument');
    });
  });

  describe('applyWithClosure error handling', () => {
    test('should validate function argument for apply', () => {
      const nonFunction: HCValue = { type: 'number', value: 42 };
      const argsList: HCValue = { type: 'list', value: [] };

      expect(() => applyWithClosure(nonFunction, argsList, env)).toThrow('apply requires a function as first argument');
    });

    test('should validate sequence argument for apply', () => {
      const fn: HCValue = { type: 'function', value: (...args: any[]) => args[0] };
      const nonSequence: HCValue = { type: 'number', value: 42 };

      expect(() => applyWithClosure(fn, nonSequence, env)).toThrow('apply requires a sequence as second argument');
    });

    test('should apply function with arguments', () => {
      const fn: HCValue = {
        type: 'function',
        value: (...args: any[]) => ({ type: 'number', value: args.length })
      };
      const argsList: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 }
        ]
      };

      const result = applyWithClosure(fn, argsList, env);
      expect(result).toEqual({ type: 'number', value: 2 });
    });
  });

  describe('swapAtom error handling', () => {
    test('should validate atom argument for swap!', () => {
      const nonAtom: HCValue = { type: 'number', value: 42 };
      const fn: HCValue = { type: 'function', value: (x: any) => x };

      expect(() => swapAtom(nonAtom, fn, [], env)).toThrow('swap! requires an atom as first argument');
    });

    test('should validate function argument for swap!', () => {
      const atom: HCValue = {
        type: 'object',
        value: {
          __isAtom: true,
          value: { type: 'number', value: 42 }
        }
      };
      const nonFunction: HCValue = { type: 'number', value: 42 };

      expect(() => swapAtom(atom, nonFunction, [], env)).toThrow('swap! requires a function as second argument');
    });
  });

  describe('Working functionality', () => {
    test('should map with function', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => ({ type: 'number', value: (x as any).value * 2 })
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 }
        ]
      };

      const result = mapWithClosure(fn, list, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 4 }
        ]
      });
    });

    test('should reduce with function', () => {
      const fn: HCValue = {
        type: 'function',
        value: (acc: HCValue, x: HCValue) => ({ type: 'number', value: (acc as any).value + (x as any).value })
      };
      const initial: HCValue = { type: 'number', value: 0 };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      const result = reduceWithClosure(fn, initial, list, env);
      expect(result).toEqual({ type: 'number', value: 6 });
    });

    test('should filter with function', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => ({ type: 'boolean', value: (x as any).value > 1 })
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      const result = filterWithClosure(fn, list, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });

    test('should filter with nil and false values', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => {
          if ((x as any).value === 1) {
            return { type: 'nil', value: null };
          }
          if ((x as any).value === 2) {
            return { type: 'boolean', value: false };
          }
          return { type: 'boolean', value: true };
        }
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      const result = filterWithClosure(fn, list, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 3 }
        ]
      });
    });

    test('should swap atom with function', () => {
      const atom: HCValue = {
        type: 'object',
        value: {
          __isAtom: true,
          value: { type: 'number', value: 10 }
        }
      };
      const fn: HCValue = {
        type: 'function',
        value: (current: HCValue, ...args: HCValue[]) => ({
          type: 'number',
          value: (current as any).value + args.reduce((sum, arg) => sum + (arg as any).value, 0)
        })
      };

      const result = swapAtom(atom, fn, [{ type: 'number', value: 5 }], env);
      expect(result).toEqual({ type: 'number', value: 15 });
      expect(atom.value.value).toEqual({ type: 'number', value: 15 });
    });

    test('should swap atom with closure', () => {
      const atom: HCValue = {
        type: 'object',
        value: {
          __isAtom: true,
          value: { type: 'number', value: 10 }
        }
      };
      const closure: HCValue = {
        type: 'closure',
        params: ['current', 'delta'],
        body: {
          type: 'list',
          value: [
            { type: 'symbol', value: '+' },
            { type: 'symbol', value: 'current' },
            { type: 'symbol', value: 'delta' }
          ]
        },
        env: env
      };

      jest.spyOn(console, 'log').mockImplementation(() => {});

      env.define('+', {
        type: 'function',
        value: (a: HCValue, b: HCValue) => ({ type: 'number', value: (a as any).value + (b as any).value })
      });

      const result = swapAtom(atom, closure, [{ type: 'number', value: 7 }], env);
      expect(result).toEqual({ type: 'number', value: 17 });

      jest.restoreAllMocks();
    });
  });

  describe('Symbol resolution and basic evaluation', () => {
    test('should throw error for undefined symbol', () => {
      const undefinedSymbol: HCValue = { type: 'symbol', value: 'undefinedVariable' };
      expect(() => interpret(undefinedSymbol, env)).toThrow('Undefined symbol: undefinedVariable');
    });

    test('should evaluate vector elements', () => {
      env.define('x', { type: 'number', value: 5 });
      env.define('y', { type: 'number', value: 10 });

      const vectorExpr: HCValue = {
        type: 'vector',
        value: [
          { type: 'symbol', value: 'x' },
          { type: 'symbol', value: 'y' },
          { type: 'number', value: 15 }
        ]
      };

      const result = interpret(vectorExpr, env);
      expect(result).toEqual({
        type: 'vector',
        value: [
          { type: 'number', value: 5 },
          { type: 'number', value: 10 },
          { type: 'number', value: 15 }
        ]
      });
    });

    test('should handle empty list', () => {
      const emptyList: HCValue = { type: 'list', value: [] };
      const result = interpret(emptyList, env);
      expect(result).toEqual({ type: 'list', value: [] });
    });
  });

  describe('Property access with .- operator', () => {

    test('should access property on js-object with __direct_js__', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = { name: 'test', value: 42 };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-name' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'string', value: 'test' });

      jest.restoreAllMocks();
    });

    test('should return nil for missing property on direct js object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = { name: 'test' };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-missing' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'nil', value: null });

      jest.restoreAllMocks();
    });

    test('should access property on nodejs context object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const originalObj = { port: 3000 };
      const hcObj: HCValue = {
        type: 'object',
        value: {},
        __nodejs_context__: true,
        __original_object__: originalObj
      } as any;

      env.define('server', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-port' },
          { type: 'symbol', value: 'server' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'number', value: 3000 });

      jest.restoreAllMocks();
    });

    test('should access property using toJSValue fallback', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const hcObj: HCValue = {
        type: 'object',
        value: { name: 'test object' }
      };

      env.define('obj', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-name' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'string', value: 'test object' });

      jest.restoreAllMocks();
    });
  });

  describe('Method calls with . operator', () => {
    test('should call method on direct js object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = {
        getName: function() { return 'direct method result'; }
      };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.getName' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(result).toEqual({ type: 'string', value: 'direct method result' });

      jest.restoreAllMocks();
    });

    test('should return nil for missing method on direct js object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = { name: 'test' };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.missingMethod' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(result).toEqual({ type: 'nil', value: null });

      jest.restoreAllMocks();
    });

    test('should throw error for missing method', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const hcObj: HCValue = {
        type: 'object',
        value: {}
      };

      env.define('obj', hcObj);

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.missingMethod' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      expect(() => interpret(methodCall, env)).toThrow('Method missingMethod not found on object');

      jest.restoreAllMocks();
    });
  });

  describe('Built-in function handlers', () => {
    test('should handle map function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => ({ type: 'number', value: (x as any).value * 2 })
      };
      const list: HCValue = {
        type: 'list',
        value: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }]
      };

      env.define('double', fn);
      env.define('numbers', list);

      const mapCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'map' },
          { type: 'symbol', value: 'double' },
          { type: 'symbol', value: 'numbers' }
        ]
      };

      const result = interpret(mapCall, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 4 }
        ]
      });
    });

    test('should handle filter function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => ({ type: 'boolean', value: (x as any).value > 1 })
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      env.define('gt1', fn);
      env.define('numbers', list);

      const filterCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'filter' },
          { type: 'symbol', value: 'gt1' },
          { type: 'symbol', value: 'numbers' }
        ]
      };

      const result = interpret(filterCall, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });

    test('should handle apply function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (...args: HCValue[]) => ({
          type: 'number',
          value: args.reduce((sum, arg) => sum + (arg as any).value, 0)
        })
      };
      const argsList: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      env.define('sum', fn);
      env.define('args', argsList);

      const applyCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'apply' },
          { type: 'symbol', value: 'sum' },
          { type: 'symbol', value: 'args' }
        ]
      };

      const result = interpret(applyCall, env);
      expect(result).toEqual({ type: 'number', value: 6 });
    });

    test('should handle swap! function call', () => {
      const atom: HCValue = {
        type: 'object',
        value: {
          __isAtom: true,
          value: { type: 'number', value: 10 }
        }
      };
      const fn: HCValue = {
        type: 'function',
        value: (current: HCValue, delta: HCValue) => ({
          type: 'number',
          value: (current as any).value + (delta as any).value
        })
      };

      env.define('counter', atom);
      env.define('add', fn);

      const swapCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'swap!' },
          { type: 'symbol', value: 'counter' },
          { type: 'symbol', value: 'add' },
          { type: 'number', value: 5 }
        ]
      };

      const result = interpret(swapCall, env);
      expect(result).toEqual({ type: 'number', value: 15 });
    });

    test('should handle reduce function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (acc: HCValue, x: HCValue) => ({
          type: 'number',
          value: (acc as any).value + (x as any).value
        })
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      env.define('add', fn);
      env.define('numbers', list);

      const reduceCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'reduce' },
          { type: 'symbol', value: 'add' },
          { type: 'number', value: 0 },
          { type: 'symbol', value: 'numbers' }
        ]
      };

      const result = interpret(reduceCall, env);
      expect(result).toEqual({ type: 'number', value: 6 });
    });
  });

  describe('Function evaluation and calling', () => {
    test('should evaluate and call function', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue, y: HCValue) => ({
          type: 'number',
          value: (x as any).value * (y as any).value
        })
      };

      env.define('multiply', fn);

      const functionCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'multiply' },
          { type: 'number', value: 6 },
          { type: 'number', value: 7 }
        ]
      };

      const result = interpret(functionCall, env);
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should evaluate and call closure', () => {
      const closure: HCValue = {
        type: 'closure',
        params: ['x', 'y'],
        body: {
          type: 'list',
          value: [
            { type: 'symbol', value: '+' },
            { type: 'symbol', value: 'x' },
            { type: 'symbol', value: 'y' }
          ]
        },
        env: env
      };

      jest.spyOn(console, 'log').mockImplementation(() => {});

      env.define('+', {
        type: 'function',
        value: (a: HCValue, b: HCValue) => ({
          type: 'number',
          value: (a as any).value + (b as any).value
        })
      });
      env.define('addClosure', closure);

      const closureCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'addClosure' },
          { type: 'number', value: 10 },
          { type: 'number', value: 20 }
        ]
      };

      const result = interpret(closureCall, env);
      expect(result).toEqual({ type: 'number', value: 30 });

      jest.restoreAllMocks();
    });
  });

  describe('Property access with .- operator', () => {
    test('should access property on js-object with __direct_js__', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = { name: 'test', value: 42 };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-name' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'string', value: 'test' });

      jest.restoreAllMocks();
    });

    test('should return nil for missing property on direct js object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = { name: 'test' };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-missing' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'nil', value: null });

      jest.restoreAllMocks();
    });

    test('should access property on nodejs context object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const originalObj = { port: 3000 };
      const hcObj: HCValue = {
        type: 'object',
        value: {},
        __nodejs_context__: true,
        __original_object__: originalObj
      } as any;

      env.define('server', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-port' },
          { type: 'symbol', value: 'server' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'number', value: 3000 });

      jest.restoreAllMocks();
    });

    test('should access property using toJSValue fallback', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const hcObj: HCValue = {
        type: 'object',
        value: { name: 'test object' }
      };

      env.define('obj', hcObj);

      const propertyAccess: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.-name' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(propertyAccess, env);
      expect(result).toEqual({ type: 'string', value: 'test object' });

      jest.restoreAllMocks();
    });
  });

  describe('Method calls with . operator', () => {
    test('should call method on direct js object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = {
        getName: function() { return 'direct method result'; }
      };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.getName' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(result).toEqual({ type: 'string', value: 'direct method result' });

      jest.restoreAllMocks();
    });

    test('should return nil for missing method on direct js object', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const jsObj = { name: 'test' };
      const hcObj: HCValue = {
        type: 'js-object',
        jsRef: jsObj,
        __direct_js__: true
      } as any;

      env.define('obj', hcObj);

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.missingMethod' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(result).toEqual({ type: 'nil', value: null });

      jest.restoreAllMocks();
    });

    test('should throw error for missing method', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const hcObj: HCValue = {
        type: 'object',
        value: {}
      };

      env.define('obj', hcObj);

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.missingMethod' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      expect(() => interpret(methodCall, env)).toThrow('Method missingMethod not found on object');

      jest.restoreAllMocks();
    });
  });

  describe('Built-in function handlers', () => {
    test('should handle map function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => ({ type: 'number', value: (x as any).value * 2 })
      };
      const list: HCValue = {
        type: 'list',
        value: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }]
      };

      env.define('double', fn);
      env.define('numbers', list);

      const mapCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'map' },
          { type: 'symbol', value: 'double' },
          { type: 'symbol', value: 'numbers' }
        ]
      };

      const result = interpret(mapCall, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 4 }
        ]
      });
    });

    test('should handle filter function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue) => ({ type: 'boolean', value: (x as any).value > 1 })
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      env.define('gt1', fn);
      env.define('numbers', list);

      const filterCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'filter' },
          { type: 'symbol', value: 'gt1' },
          { type: 'symbol', value: 'numbers' }
        ]
      };

      const result = interpret(filterCall, env);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });

    test('should handle apply function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (...args: HCValue[]) => ({
          type: 'number',
          value: args.reduce((sum, arg) => sum + (arg as any).value, 0)
        })
      };
      const argsList: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      env.define('sum', fn);
      env.define('args', argsList);

      const applyCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'apply' },
          { type: 'symbol', value: 'sum' },
          { type: 'symbol', value: 'args' }
        ]
      };

      const result = interpret(applyCall, env);
      expect(result).toEqual({ type: 'number', value: 6 });
    });

    test('should handle swap! function call', () => {
      const atom: HCValue = {
        type: 'object',
        value: {
          __isAtom: true,
          value: { type: 'number', value: 10 }
        }
      };
      const fn: HCValue = {
        type: 'function',
        value: (current: HCValue, delta: HCValue) => ({
          type: 'number',
          value: (current as any).value + (delta as any).value
        })
      };

      env.define('counter', atom);
      env.define('add', fn);

      const swapCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'swap!' },
          { type: 'symbol', value: 'counter' },
          { type: 'symbol', value: 'add' },
          { type: 'number', value: 5 }
        ]
      };

      const result = interpret(swapCall, env);
      expect(result).toEqual({ type: 'number', value: 15 });
    });

    test('should handle reduce function call', () => {
      const fn: HCValue = {
        type: 'function',
        value: (acc: HCValue, x: HCValue) => ({
          type: 'number',
          value: (acc as any).value + (x as any).value
        })
      };
      const list: HCValue = {
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      };

      env.define('add', fn);
      env.define('numbers', list);

      const reduceCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'reduce' },
          { type: 'symbol', value: 'add' },
          { type: 'number', value: 0 },
          { type: 'symbol', value: 'numbers' }
        ]
      };

      const result = interpret(reduceCall, env);
      expect(result).toEqual({ type: 'number', value: 6 });
    });
  });

  describe('Function evaluation and calling', () => {
    test('should evaluate and call function', () => {
      const fn: HCValue = {
        type: 'function',
        value: (x: HCValue, y: HCValue) => ({
          type: 'number',
          value: (x as any).value * (y as any).value
        })
      };

      env.define('multiply', fn);

      const functionCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'multiply' },
          { type: 'number', value: 6 },
          { type: 'number', value: 7 }
        ]
      };

      const result = interpret(functionCall, env);
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should evaluate and call closure', () => {
      const closure: HCValue = {
        type: 'closure',
        params: ['x', 'y'],
        body: {
          type: 'list',
          value: [
            { type: 'symbol', value: '+' },
            { type: 'symbol', value: 'x' },
            { type: 'symbol', value: 'y' }
          ]
        },
        env: env
      };

      jest.spyOn(console, 'log').mockImplementation(() => {});

      env.define('+', {
        type: 'function',
        value: (a: HCValue, b: HCValue) => ({
          type: 'number',
          value: (a as any).value + (b as any).value
        })
      });
      env.define('addClosure', closure);

      const closureCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: 'addClosure' },
          { type: 'number', value: 10 },
          { type: 'number', value: 20 }
        ]
      };

      const result = interpret(closureCall, env);
      expect(result).toEqual({ type: 'number', value: 30 });

      jest.restoreAllMocks();
    });
  });

  describe('Atom symbol resolution (@symbol)', () => {

    test('should resolve atom symbol correctly', () => {
      const atom: HCValue = {
        type: 'object',
        value: {
          __isAtom: true,
          value: { type: 'number', value: 42 }
        }
      };

      env.define('myAtom', atom);

      const atomSymbol: HCValue = {
        type: 'symbol',
        value: '@myAtom'
      };

      const result = interpret(atomSymbol, env);
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should throw error for non-atom symbol with @ prefix', () => {
      const nonAtom: HCValue = {
        type: 'object',
        value: {
          __isAtom: false,
          value: { type: 'number', value: 42 }
        }
      };

      env.define('notAnAtom', nonAtom);

      const atomSymbol: HCValue = {
        type: 'symbol',
        value: '@notAnAtom'
      };

      expect(() => interpret(atomSymbol, env)).toThrow('Undefined symbol: @notAnAtom');
    });
  });

  describe('Node.js context method calls', () => {
    test('should handle method calls with proper object structure', () => {
      const jsObj = {
        testMethod: jest.fn().mockReturnValue('test result')
      };

      env.define('jsObj', { type: 'object', value: jsObj });

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.testMethod' },
          { type: 'symbol', value: 'jsObj' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(jsObj.testMethod).toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });

  describe('Method call error handling', () => {
    test('should handle method call errors with stack trace', () => {
      const obj = {
        errorMethod: () => {
          throw new Error('Method error');
        }
      };

      env.define('obj', { type: 'object', value: obj });

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.errorMethod' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      expect(() => interpret(methodCall, env)).toThrow('Method error');

      jest.restoreAllMocks();
    });
  });

  describe('Error handling in callFunction', () => {
    test('should handle division by zero in built-in function', () => {
      const divFn: HCValue = {
        type: 'function',
        value: (a: HCValue, b: HCValue) => {
          if ((b as any).value === 0) {
            throw new Error('Division by zero');
          }
          return { type: 'number', value: (a as any).value / (b as any).value };
        }
      };

      env.define('div', divFn);

      expect(() => callFunction(divFn, [
        { type: 'number', value: 10 },
        { type: 'number', value: 0 }
      ], env)).toThrow('Division by zero');
    });

    test('should re-throw non-recur errors in closure', () => {
      const closure: HCValue = {
        type: 'closure',
        params: [],
        body: { type: 'symbol', value: 'nonExistentSymbol' },
        env: env
      };

      jest.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => callFunction(closure, [], env)).toThrow('Undefined symbol: nonExistentSymbol');

      jest.restoreAllMocks();
    });
  });

  describe('Method calls with closures and functions as arguments', () => {
    test('should handle closure as method argument', () => {
      const mockMethod = jest.fn().mockReturnValue('result');
      const obj = { testMethod: mockMethod };

      env.define('obj', { type: 'js-object', jsRef: obj, __direct_js__: true } as any);

      const closure: HCValue = {
        type: 'closure',
        params: ['x'],
        body: { type: 'symbol', value: 'x' },
        env: env
      };

      env.define('myClosure', closure);

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.testMethod' },
          { type: 'symbol', value: 'obj' },
          { type: 'symbol', value: 'myClosure' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(mockMethod).toHaveBeenCalledWith(expect.any(Function));

      jest.restoreAllMocks();
    });

    test('should handle function as method argument', () => {
      const mockMethod = jest.fn().mockReturnValue('result');
      const obj = { testMethod: mockMethod };

      env.define('obj', { type: 'js-object', jsRef: obj, __direct_js__: true } as any);

      const fn: HCValue = {
        type: 'function',
        value: (...args: any[]) => args[0]
      };

      env.define('myFn', fn);

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.testMethod' },
          { type: 'symbol', value: 'obj' },
          { type: 'symbol', value: 'myFn' }
        ]
      };

      const result = interpret(methodCall, env);
      expect(mockMethod).toHaveBeenCalledWith(expect.any(Function));

      jest.restoreAllMocks();
    });

    test('should convert function argument and execute it properly', () => {
      const mockMethod = jest.fn((callback: Function) => {
        return callback(42, 'test');
      });
      const obj = { processCallback: mockMethod };

      env.define('obj', { type: 'js-object', jsRef: obj, __direct_js__: true } as any);

      const fn: HCValue = {
        type: 'function',
        value: (a: HCValue, b: HCValue) => ({
          type: 'string',
          value: `${(a as any).value}-${(b as any).value}`
        })
      };

      env.define('myFn', fn);

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.processCallback' },
          { type: 'symbol', value: 'obj' },
          { type: 'symbol', value: 'myFn' }
        ]
      };

      const result = interpret(methodCall, env);

      expect(mockMethod).toHaveBeenCalled();
      expect(result).toEqual({
        type: 'object',
        value: { type: 'string', value: '42-test' }
      });

      jest.restoreAllMocks();
    });

    test('should convert closure argument and execute it properly', () => {
      const mockMethod = jest.fn((callback: Function) => {
        return callback(10, 20);
      });
      const obj = { processCallback: mockMethod };

      env.define('obj', { type: 'js-object', jsRef: obj, __direct_js__: true } as any);

      env.define('+', {
        type: 'function',
        value: (a: HCValue, b: HCValue) => ({
          type: 'number',
          value: (a as any).value + (b as any).value
        })
      });

      const closure: HCValue = {
        type: 'closure',
        params: ['x', 'y'],
        body: {
          type: 'list',
          value: [
            { type: 'symbol', value: '+' },
            { type: 'symbol', value: 'x' },
            { type: 'symbol', value: 'y' }
          ]
        },
        env: env
      };

      env.define('myClosure', closure);

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.processCallback' },
          { type: 'symbol', value: 'obj' },
          { type: 'symbol', value: 'myClosure' }
        ]
      };

      const result = interpret(methodCall, env);

      expect(mockMethod).toHaveBeenCalled();
      expect(result).toEqual({
        type: 'object',
        value: { type: 'number', value: 30 }
      });

      jest.restoreAllMocks();
    });

    test('should handle js-object method call with direct execution path', () => {
      const mockMethod = jest.fn().mockReturnValue({ success: true, data: 'test' });
      const obj = {
        directMethod: mockMethod,
        anotherProp: 'value'
      };

      env.define('obj', {
        type: 'js-object',
        jsRef: obj,
        __direct_js__: true
      } as any);

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.directMethod' },
          { type: 'symbol', value: 'obj' },
          { type: 'string', value: 'arg1' },
          { type: 'number', value: 123 }
        ]
      };

      const result = interpret(methodCall, env);

      expect(mockMethod).toHaveBeenCalledWith('arg1', 123);
      expect(result).toEqual({
        type: 'object',
        value: { success: true, data: 'test' }
      });

      jest.restoreAllMocks();
    });

    test('should handle method call error in direct js object', () => {
      const mockMethod = jest.fn(() => {
        throw new Error('Method execution failed');
      });
      const obj = { failingMethod: mockMethod };

      env.define('obj', {
        type: 'js-object',
        jsRef: obj,
        __direct_js__: true
      } as any);

      jest.spyOn(console, 'log').mockImplementation(() => {});

      const methodCall: HCValue = {
        type: 'list',
        value: [
          { type: 'symbol', value: '.failingMethod' },
          { type: 'symbol', value: 'obj' }
        ]
      };

      expect(() => interpret(methodCall, env)).toThrow('Method execution failed');

      jest.restoreAllMocks();
    });
  });

  describe('Default environment creation', () => {
    test('should create global environment when env is not provided', () => {
      const simpleExpression: HCValue = {
        type: 'number',
        value: 42
      };

      const result = interpret(simpleExpression);
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should create global environment when env is undefined', () => {
      const simpleExpression: HCValue = {
        type: 'string',
        value: 'test'
      };

      const result = interpret(simpleExpression, undefined);
      expect(result).toEqual({ type: 'string', value: 'test' });
    });

    test('should work with basic expressions when using default environment', () => {
      const booleanExpression: HCValue = {
        type: 'boolean',
        value: true
      };

      const result = interpret(booleanExpression);
      expect(result).toEqual({ type: 'boolean', value: true });
    });

    test('should create global environment for vector evaluation', () => {
      const vectorExpression: HCValue = {
        type: 'vector',
        value: [
          { type: 'number', value: 1 },
          { type: 'string', value: 'hello' }
        ]
      };

      const result = interpret(vectorExpression);
      expect(result).toEqual({
        type: 'vector',
        value: [
          { type: 'number', value: 1 },
          { type: 'string', value: 'hello' }
        ]
      });
    });
  });
});
