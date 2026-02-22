import { specialForms } from '../src/Keywords';
import { Environment } from '../src/Context';
import { NamespaceManager } from '../src/Namespace';
import { HCValue } from '../src/Categorize';

const mockInterpret = jest.fn();

jest.mock('../src/Interpret', () => ({
  callFunction: jest.fn((closure: HCValue, args: HCValue[], env: Environment, nsManager?: NamespaceManager) => {
    return { type: 'number', value: 42 };
  })
}));

describe('Keywords (Special Forms)', () => {
  let env: Environment;
  let nsManager: NamespaceManager;

  beforeEach(() => {
    env = new Environment();
    nsManager = new NamespaceManager(env);
    mockInterpret.mockClear();
  });

  describe('def', () => {
    it('should define a symbol with a value', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'x' },
        { type: 'number', value: 42 }
      ];

      mockInterpret.mockReturnValue({ type: 'number', value: 42 });

      const result = specialForms['def'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'number', value: 42 });
      expect(env.get('x')).toEqual({ type: 'number', value: 42 });
    });

    it('should throw error for wrong number of arguments', () => {
      const args: HCValue[] = [{ type: 'symbol', value: 'x' }];

      expect(() => specialForms['def'](args, env, mockInterpret, nsManager))
        .toThrow('def requires exactly 2 arguments');
    });

    it('should throw error for non-symbol first argument', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 },
        { type: 'number', value: 42 }
      ];

      expect(() => specialForms['def'](args, env, mockInterpret, nsManager))
        .toThrow('def requires a symbol as first argument');
    });
  });

  describe('defn', () => {
    it('should define a function without docstring', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] },
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      const result = specialForms['defn'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x', 'y']);
      expect(env.get('add')).toBe(result);
    });

    it('should define a function with docstring', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'string', value: 'Adds two numbers' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] },
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      const result = specialForms['defn'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x', 'y']);
    });

    it('should handle multiple body expressions', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'multiBody' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'list', value: [{ type: 'symbol', value: 'println' }, { type: 'symbol', value: 'x' }] },
        { type: 'symbol', value: 'x' }
      ];

      const result = specialForms['defn'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).body.type).toBe('list');
      expect(((result as any).body.value as HCValue[])[0]).toEqual({ type: 'symbol', value: 'do' });
    });

    it('should throw error for insufficient arguments', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'vector', value: [] }
      ];

      expect(() => specialForms['defn'](args, env, mockInterpret, nsManager))
        .toThrow('defn requires at least 3 arguments');
    });

    it('should throw error for non-symbol function name', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 },
        { type: 'vector', value: [] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['defn'](args, env, mockInterpret, nsManager))
        .toThrow('defn requires a symbol as first argument');
    });

    it('should throw error for invalid parameter list', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'number', value: 42 },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['defn'](args, env, mockInterpret, nsManager))
        .toThrow('defn requires a parameter list');
    });

    it('should throw error for non-symbol parameters', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'vector', value: [{ type: 'number', value: 42 }] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['defn'](args, env, mockInterpret, nsManager))
        .toThrow('Parameter names must be symbols');
    });
  });

  describe('defun', () => {
    it('should define a function without docstring', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] },
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      const result = specialForms['defun'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x', 'y']);
      expect(env.get('add')).toBe(result);
    });

    it('should define a function with docstring', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'string', value: 'Adds two numbers' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] },
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      const result = specialForms['defun'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x', 'y']);
    });

    it('should handle multiple body expressions', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'multiBody' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'list', value: [{ type: 'symbol', value: 'println' }, { type: 'symbol', value: 'x' }] },
        { type: 'symbol', value: 'x' }
      ];

      const result = specialForms['defun'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).body.type).toBe('list');
      expect(((result as any).body.value as HCValue[])[0]).toEqual({ type: 'symbol', value: 'do' });
    });

    it('should throw error for insufficient arguments', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'vector', value: [] }
      ];

      expect(() => specialForms['defun'](args, env, mockInterpret, nsManager))
        .toThrow('defun requires at least 3 arguments');
    });

    it('should throw error for non-symbol function name', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 },
        { type: 'vector', value: [] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['defun'](args, env, mockInterpret, nsManager))
        .toThrow('defun requires a symbol as first argument');
    });

    it('should throw error for invalid parameter list', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'number', value: 42 },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['defun'](args, env, mockInterpret, nsManager))
        .toThrow('defun requires a parameter list');
    });

    it('should throw error for non-symbol parameters', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'add' },
        { type: 'vector', value: [{ type: 'number', value: 42 }] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['defun'](args, env, mockInterpret, nsManager))
        .toThrow('Parameter names must be symbols');
    });
  });

  describe('define', () => {
    it('should define a function without docstring', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'multiply' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] },
        { type: 'list', value: [{ type: 'symbol', value: '*' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x', 'y']);
      expect(env.get('multiply')).toBe(result);
    });

    it('should define a function with docstring', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'divide' },
        { type: 'string', value: 'Divides two numbers' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] },
        { type: 'list', value: [{ type: 'symbol', value: '/' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x', 'y']);
      expect(env.get('divide')).toBe(result);
    });

    it('should handle multiple body expressions', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'complexFunction' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'list', value: [{ type: 'symbol', value: 'println' }, { type: 'string', value: 'Processing...' }] },
        { type: 'list', value: [{ type: 'symbol', value: '*' }, { type: 'symbol', value: 'x' }, { type: 'number', value: 2 }] }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).body.type).toBe('list');
      expect(((result as any).body.value as HCValue[])[0]).toEqual({ type: 'symbol', value: 'do' });
      expect(((result as any).body.value as HCValue[]).length).toBe(3);
    });

    it('should handle function with no parameters', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'getConstant' },
        { type: 'vector', value: [] },
        { type: 'number', value: 42 }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual([]);
      expect(env.get('getConstant')).toBe(result);
    });

    it('should handle function with single parameter', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'square' },
        { type: 'vector', value: [{ type: 'symbol', value: 'n' }] },
        { type: 'list', value: [{ type: 'symbol', value: '*' }, { type: 'symbol', value: 'n' }, { type: 'symbol', value: 'n' }] }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['n']);
      expect(env.get('square')).toBe(result);
    });

    it('should handle function with list parameter syntax', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'subtract' },
        { type: 'list', value: [{ type: 'symbol', value: 'a' }, { type: 'symbol', value: 'b' }] },
        { type: 'list', value: [{ type: 'symbol', value: '-' }, { type: 'symbol', value: 'a' }, { type: 'symbol', value: 'b' }] }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['a', 'b']);
      expect(env.get('subtract')).toBe(result);
    });

    it('should throw error for insufficient arguments', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'incomplete' },
        { type: 'vector', value: [] }
      ];

      expect(() => specialForms['define'](args, env, mockInterpret, nsManager))
        .toThrow('define requires at least 3 arguments');
    });

    it('should throw error for non-symbol function name', () => {
      const args: HCValue[] = [
        { type: 'number', value: 123 },
        { type: 'vector', value: [] },
        { type: 'symbol', value: 'body' }
      ];

      expect(() => specialForms['define'](args, env, mockInterpret, nsManager))
        .toThrow('define requires a symbol as first argument');
    });

    it('should throw error for invalid parameter list', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'badParams' },
        { type: 'string', value: 'not a param list' },
        { type: 'symbol', value: 'body' }
      ];

      expect(() => specialForms['define'](args, env, mockInterpret, nsManager))
        .toThrow('define requires a parameter list');
    });

    it('should throw error for non-symbol parameters', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'badParamTypes' },
        { type: 'vector', value: [{ type: 'number', value: 1 }, { type: 'string', value: 'param' }] },
        { type: 'symbol', value: 'body' }
      ];

      expect(() => specialForms['define'](args, env, mockInterpret, nsManager))
        .toThrow('Parameter names must be symbols');
    });

    it('should handle docstring with complex function definition', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'factorial' },
        { type: 'string', value: 'Calculates factorial of n' },
        { type: 'vector', value: [{ type: 'symbol', value: 'n' }] },
        { type: 'list', value: [
          { type: 'symbol', value: 'if' },
          { type: 'list', value: [{ type: 'symbol', value: '<=' }, { type: 'symbol', value: 'n' }, { type: 'number', value: 1 }] },
          { type: 'number', value: 1 },
          { type: 'list', value: [
            { type: 'symbol', value: '*' },
            { type: 'symbol', value: 'n' },
            { type: 'list', value: [
              { type: 'symbol', value: 'factorial' },
              { type: 'list', value: [{ type: 'symbol', value: '-' }, { type: 'symbol', value: 'n' }, { type: 'number', value: 1 }] }
            ] }
          ]}
        ]}
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['n']);
      expect(env.get('factorial')).toBe(result);
    });

    it('should correctly wrap single body expression', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'identity' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'symbol', value: 'x' }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).body).toEqual({ type: 'symbol', value: 'x' });
    });

    it('should correctly wrap multiple body expressions in do block', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'multiStep' },
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'list', value: [{ type: 'symbol', value: 'println' }, { type: 'symbol', value: 'x' }] },
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'number', value: 1 }] },
        { type: 'list', value: [{ type: 'symbol', value: '*' }, { type: 'symbol', value: 'x' }, { type: 'number', value: 2 }] }
      ];

      const result = specialForms['define'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).body.type).toBe('list');
      const bodyList = (result as any).body.value as HCValue[];
      expect(bodyList[0]).toEqual({ type: 'symbol', value: 'do' });
      expect(bodyList.length).toBe(4);
    });
  });

  describe('fn', () => {
    it('should create an anonymous function', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'number', value: 1 }] }
      ];

      const result = specialForms['fn'](args, env, mockInterpret, nsManager);

      expect(result.type).toBe('closure');
      expect((result as any).params).toEqual(['x']);
      expect((result as any).env).toBe(env);
    });

    it('should throw error for wrong number of arguments', () => {
      const args: HCValue[] = [{ type: 'vector', value: [] }];

      expect(() => specialForms['fn'](args, env, mockInterpret, nsManager))
        .toThrow('fn requires exactly 2 arguments');
    });

    it('should throw error for invalid parameter list', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['fn'](args, env, mockInterpret, nsManager))
        .toThrow('fn requires a parameter list');
    });

    it('should throw error for non-symbol parameters', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [{ type: 'number', value: 42 }] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['fn'](args, env, mockInterpret, nsManager))
        .toThrow('Parameter names must be symbols');
    });
  });

  describe('let', () => {
    it('should create local bindings', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [
          { type: 'symbol', value: 'x' },
          { type: 'number', value: 10 },
          { type: 'symbol', value: 'y' },
          { type: 'number', value: 20 }
        ]},
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'symbol', value: 'x' }, { type: 'symbol', value: 'y' }] }
      ];

      mockInterpret.mockImplementation((expr: HCValue, env: Environment) => {
        if (expr.type === 'number') {return expr;}
        if (expr.type === 'symbol') {
          if (expr.value === 'x') {return { type: 'number', value: 10 };}
          if (expr.value === 'y') {return { type: 'number', value: 20 };}
        }
        return { type: 'number', value: 30 };
      });

      const result = specialForms['let'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'number', value: 30 });
    });

    it('should throw error for insufficient arguments', () => {
      const args: HCValue[] = [{ type: 'vector', value: [] }];

      expect(() => specialForms['let'](args, env, mockInterpret, nsManager))
        .toThrow('let requires at least 2 arguments');
    });

    it('should throw error for invalid binding list', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['let'](args, env, mockInterpret, nsManager))
        .toThrow('let requires a binding list');
    });

    it('should throw error for odd number of bindings', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['let'](args, env, mockInterpret, nsManager))
        .toThrow('let binding list must have an even number of elements');
    });

    it('should throw error for non-symbol binding names', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [
          { type: 'number', value: 42 },
          { type: 'number', value: 10 }
        ]},
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['let'](args, env, mockInterpret, nsManager))
        .toThrow('let binding names must be symbols');
    });
  });

  describe('loop', () => {
    it('should create a loop with bindings', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [
          { type: 'symbol', value: 'i' },
          { type: 'number', value: 0 }
        ]},
        { type: 'symbol', value: 'i' }
      ];

      mockInterpret.mockImplementation((expr: HCValue, env: Environment) => {
        if (expr.type === 'number') {return expr;}
        if (expr.type === 'symbol' && expr.value === 'i') {return { type: 'number', value: 0 };}
        return expr;
      });

      const result = specialForms['loop'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'number', value: 0 });
    });

    it('should handle recur correctly', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [
          { type: 'symbol', value: 'i' },
          { type: 'number', value: 0 }
        ]},
        { type: 'symbol', value: 'i' }
      ];

      let callCount = 0;
      mockInterpret.mockImplementation((expr: HCValue, env: Environment) => {
        if (expr.type === 'number') {return expr;}
        if (expr.type === 'symbol' && expr.value === 'i') {
          callCount++;
          if (callCount === 1) {

            throw { type: 'recur', values: [{ type: 'number', value: 1 }] };
          } else {

            return { type: 'number', value: 1 };
          }
        }
        return expr;
      });

      const result = specialForms['loop'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'number', value: 1 });
    });

    it('should throw error for wrong number of arguments', () => {
      const args: HCValue[] = [{ type: 'vector', value: [] }];

      expect(() => specialForms['loop'](args, env, mockInterpret, nsManager))
        .toThrow('loop requires exactly 2 arguments');
    });

    it('should throw error for invalid binding list', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['loop'](args, env, mockInterpret, nsManager))
        .toThrow('loop requires a binding list');
    });

    it('should throw error for odd number of bindings', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [{ type: 'symbol', value: 'x' }] },
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['loop'](args, env, mockInterpret, nsManager))
        .toThrow('loop binding list must have an even number of elements');
    });

    it('should throw error for non-symbol binding names', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [
          { type: 'number', value: 42 },
          { type: 'number', value: 10 }
        ]},
        { type: 'symbol', value: 'x' }
      ];

      expect(() => specialForms['loop'](args, env, mockInterpret, nsManager))
        .toThrow('loop binding names must be symbols');
    });

    it('should throw error for recur with wrong number of arguments', () => {
      const args: HCValue[] = [
        { type: 'vector', value: [
          { type: 'symbol', value: 'i' },
          { type: 'number', value: 0 }
        ]},
        { type: 'symbol', value: 'i' }
      ];

      mockInterpret.mockImplementation((expr: HCValue, env: Environment) => {
        if (expr.type === 'number') {
          return expr;
        }
        throw { type: 'recur', values: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }] };
      });

      expect(() => specialForms['loop'](args, env, mockInterpret, nsManager))
        .toThrow('recur requires 1 arguments, got 2');
    });
  });

  describe('recur', () => {
    it('should throw recur with evaluated arguments', () => {
      const args: HCValue[] = [
        { type: 'number', value: 10 },
        { type: 'number', value: 20 }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      expect(() => specialForms['recur'](args, env, mockInterpret, nsManager))
        .toThrow();

      try {
        specialForms['recur'](args, env, mockInterpret, nsManager);
      } catch (error: any) {
        expect(error.type).toBe('recur');
        expect(error.values).toEqual([
          { type: 'number', value: 10 },
          { type: 'number', value: 20 }
        ]);
      }
    });
  });

  describe('if', () => {
    it('should evaluate then branch for truthy condition', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: true },
        { type: 'string', value: 'then' },
        { type: 'string', value: 'else' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['if'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'string', value: 'then' });
    });

    it('should evaluate else branch for falsy condition', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: false },
        { type: 'string', value: 'then' },
        { type: 'string', value: 'else' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['if'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'string', value: 'else' });
    });

    it('should return nil for falsy condition without else branch', () => {
      const args: HCValue[] = [
        { type: 'nil', value: null },
        { type: 'string', value: 'then' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['if'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });

    it('should throw error for wrong number of arguments', () => {
      const args: HCValue[] = [{ type: 'boolean', value: true }];

      expect(() => specialForms['if'](args, env, mockInterpret, nsManager))
        .toThrow('if requires 2 or 3 arguments');
    });
  });

  describe('quote', () => {
    it('should return argument unchanged', () => {
      const args: HCValue[] = [
        { type: 'list', value: [{ type: 'symbol', value: '+' }, { type: 'number', value: 1 }, { type: 'number', value: 2 }] }
      ];

      const result = specialForms['quote'](args, env, mockInterpret, nsManager);

      expect(result).toBe(args[0]);
    });

    it('should throw error for wrong number of arguments', () => {
      const args: HCValue[] = [];

      expect(() => specialForms['quote'](args, env, mockInterpret, nsManager))
        .toThrow('quote requires exactly 1 argument');
    });
  });

  describe('do', () => {
    it('should evaluate all expressions and return last result', () => {
      const args: HCValue[] = [
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
        { type: 'number', value: 3 }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['do'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'number', value: 3 });
      expect(mockInterpret).toHaveBeenCalledTimes(3);
    });

    it('should return nil for empty do', () => {
      const args: HCValue[] = [];

      const result = specialForms['do'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });
  });

  describe('ns', () => {
    it('should create and switch to namespace', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' }
      ];

      const result = specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'keyword', value: 'test.namespace' });
      expect(nsManager.getCurrentNamespace().name).toBe('test.namespace');
    });

    it('should process import clauses', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' },
        { type: 'list', value: [
          { type: 'keyword', value: 'import' },
          { type: 'list', value: [
            { type: 'symbol', value: 'node.fs' },
            { type: 'symbol', value: 'readFileSync' }
          ]}
        ]}
      ];

      const addRequireSpy = jest.spyOn(nsManager, 'addRequire');

      const result = specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'keyword', value: 'test.namespace' });
      expect(addRequireSpy).toHaveBeenCalledWith('node.fs', 'fs');
    });

    it('should process require clauses', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' },
        { type: 'list', value: [
          { type: 'keyword', value: 'require' },
          { type: 'vector', value: [
            { type: 'symbol', value: 'some.namespace' },
            { type: 'keyword', value: 'as' },
            { type: 'symbol', value: 'sn' }
          ]}
        ]}
      ];

      const addRequireSpy = jest.spyOn(nsManager, 'addRequire');

      const result = specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'keyword', value: 'test.namespace' });
      expect(addRequireSpy).toHaveBeenCalledWith('some.namespace', 'sn');
    });

    it('should throw error without namespace manager', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' }
      ];

      expect(() => specialForms['ns'](args, env, mockInterpret))
        .toThrow('Namespace manager not available');
    });

    it('should throw error for insufficient arguments', () => {
      const args: HCValue[] = [];

      expect(() => specialForms['ns'](args, env, mockInterpret, nsManager))
        .toThrow('ns requires at least a namespace name');
    });

    it('should throw error for non-symbol namespace name', () => {
      const args: HCValue[] = [
        { type: 'number', value: 42 }
      ];

      expect(() => specialForms['ns'](args, env, mockInterpret, nsManager))
        .toThrow('ns requires a symbol as namespace name');
    });
  });

  describe('cond', () => {
    it('should evaluate first true condition', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: false },
        { type: 'string', value: 'first' },
        { type: 'boolean', value: true },
        { type: 'string', value: 'second' },
        { type: 'boolean', value: true },
        { type: 'string', value: 'third' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['cond'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'string', value: 'second' });
    });

    it('should handle else clause', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: false },
        { type: 'string', value: 'first' },
        { type: 'keyword', value: 'else' },
        { type: 'string', value: 'default' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['cond'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'string', value: 'default' });
    });

    it('should return nil if no conditions match', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: false },
        { type: 'string', value: 'first' },
        { type: 'nil', value: null },
        { type: 'string', value: 'second' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['cond'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });

    it('should throw error for odd number of arguments', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: true }
      ];

      expect(() => specialForms['cond'](args, env, mockInterpret, nsManager))
        .toThrow('cond requires an even number of arguments');
    });
  });

  describe('and', () => {
    it('should return last value if all are truthy', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: true },
        { type: 'number', value: 42 },
        { type: 'string', value: 'hello' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['and'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'string', value: 'hello' });
    });

    it('should return first falsy value', () => {
      const args: HCValue[] = [
        { type: 'boolean', value: true },
        { type: 'nil', value: null },
        { type: 'string', value: 'hello' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['and'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });

    it('should return true for empty and', () => {
      const args: HCValue[] = [];

      const result = specialForms['and'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'boolean', value: true });
    });
  });

  describe('.', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw error for insufficient arguments', () => {
      const args: HCValue[] = [
        { type: 'object', value: {} }
      ];

      expect(() => specialForms['.'](args, env, mockInterpret, nsManager))
        .toThrow('. requires at least 2 arguments');
    });

    it('should throw error for non-symbol method name', () => {
      const args: HCValue[] = [
        { type: 'object', value: {} },
        { type: 'number', value: 42 }
      ];

      expect(() => specialForms['.'](args, env, mockInterpret, nsManager))
        .toThrow('. requires a symbol as method name');
    });
  });

  describe('.-', () => {
    it('should throw error for wrong number of arguments', () => {
      const args: HCValue[] = [
        { type: 'object', value: {} }
      ];

      expect(() => specialForms['.-'](args, env, mockInterpret, nsManager))
        .toThrow('.- requires exactly 2 arguments');
    });

    it('should throw error for non-symbol property name', () => {
      const args: HCValue[] = [
        { type: 'object', value: {} },
        { type: 'number', value: 42 }
      ];

      expect(() => specialForms['.-'](args, env, mockInterpret, nsManager))
        .toThrow('.- requires a symbol as property name');
    });

    it('should return nil for object without property', () => {
      const args: HCValue[] = [
        { type: 'object', value: {} },
        { type: 'symbol', value: 'nonExistent' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });

    it('should access property from object successfully', () => {
      const testObj = { name: 'test', value: 42 };
      const args: HCValue[] = [
        { type: 'object', value: testObj },
        { type: 'symbol', value: 'name' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'string', value: 'test' });
    });

    it('should access numeric property from object', () => {
      const testObj = { count: 123, active: true };
      const args: HCValue[] = [
        { type: 'object', value: testObj },
        { type: 'symbol', value: 'count' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'number', value: 123 });
    });

    it('should access boolean property from object', () => {
      const testObj = { active: true, disabled: false };
      const args: HCValue[] = [
        { type: 'object', value: testObj },
        { type: 'symbol', value: 'active' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'boolean', value: true });
    });

    it('should return nil when jsObj is null', () => {
      const args: HCValue[] = [
        { type: 'nil', value: null },
        { type: 'symbol', value: 'property' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });

    it('should return nil when jsObj is not an object', () => {
      const args: HCValue[] = [
        { type: 'string', value: 'not an object' },
        { type: 'symbol', value: 'property' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'nil', value: null });
    });

    it('should access nested object property', () => {
      const testObj = { nested: { deep: { value: 'found' } } };
      const args: HCValue[] = [
        { type: 'object', value: testObj },
        { type: 'symbol', value: 'nested' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({ type: 'object', value: { deep: { value: 'found' } } });
    });

    it('should access array property from object', () => {
      const testObj = { items: [1, 2, 3], tags: ['a', 'b'] };
      const args: HCValue[] = [
        { type: 'object', value: testObj },
        { type: 'symbol', value: 'items' }
      ];

      mockInterpret.mockImplementation((expr: HCValue) => expr);

      const result = specialForms['.-'](args, env, mockInterpret, nsManager);

      expect(result).toEqual({
        type: 'vector',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });
  });

  describe('processImport and processRequire functions (via ns)', () => {
    it('should process import with builtin modules', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' },
        { type: 'list', value: [
          { type: 'keyword', value: 'import' },
          { type: 'list', value: [
            { type: 'symbol', value: 'crypto' },
            { type: 'symbol', value: 'randomUUID' }
          ]}
        ]}
      ];

      const addRequireSpy = jest.spyOn(nsManager, 'addRequire');

      specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(addRequireSpy).toHaveBeenCalledWith('node.crypto', 'crypto');
    });

    it('should process import with explicit node prefix', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' },
        { type: 'list', value: [
          { type: 'keyword', value: 'import' },
          { type: 'list', value: [
            { type: 'symbol', value: 'node.fs' },
            { type: 'symbol', value: 'readFileSync' }
          ]}
        ]}
      ];

      const addRequireSpy = jest.spyOn(nsManager, 'addRequire');

      specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(addRequireSpy).toHaveBeenCalledWith('node.fs', 'fs');
    });

    it('should process require without alias', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' },
        { type: 'list', value: [
          { type: 'keyword', value: 'require' },
          { type: 'vector', value: [
            { type: 'symbol', value: 'some.namespace' }
          ]}
        ]}
      ];

      const addRequireSpy = jest.spyOn(nsManager, 'addRequire');

      specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(addRequireSpy).toHaveBeenCalledWith('some.namespace', 'some.namespace');
    });

    it('should handle import with non-builtin modules', () => {
      const args: HCValue[] = [
        { type: 'symbol', value: 'test.namespace' },
        { type: 'list', value: [
          { type: 'keyword', value: 'import' },
          { type: 'list', value: [
            { type: 'symbol', value: 'custom-module' },
            { type: 'symbol', value: 'someFunction' }
          ]}
        ]}
      ];

      const addRequireSpy = jest.spyOn(nsManager, 'addRequire');

      specialForms['ns'](args, env, mockInterpret, nsManager);

      expect(addRequireSpy).toHaveBeenCalledWith('custom-module', 'custom-module');
    });
  });
});
