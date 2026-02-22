import { Environment } from '../src/Context';
import { HCValue } from '../src/Categorize';

describe('Environment Class Coverage Tests', () => {
  let env: Environment;
  let parentEnv: Environment;

  beforeEach(() => {
    parentEnv = new Environment(null);
    env = new Environment(parentEnv);
  });

  describe('set method coverage', () => {
    test('should throw error when setting undefined symbol in environment without parent', () => {
      const rootEnv = new Environment(null);

      expect(() => {
        rootEnv.set('undefined-var', { type: 'number', value: 42 });
      }).toThrow('Undefined symbol: undefined-var');
    });

    test('should successfully set variable in parent when not found locally', () => {

      parentEnv.define('parent-var', { type: 'number', value: 10 });


      env.set('parent-var', { type: 'number', value: 20 });


      expect(parentEnv.get('parent-var')).toEqual({ type: 'number', value: 20 });
    });

    test('should set variable locally when it exists locally', () => {

      env.define('local-var', { type: 'number', value: 5 });


      env.set('local-var', { type: 'number', value: 15 });


      expect(env.get('local-var')).toEqual({ type: 'number', value: 15 });
    });
  });

  describe('get method coverage', () => {
    test('should throw error when getting undefined symbol from environment without parent', () => {
      const rootEnv = new Environment(null);

      expect(() => {
        rootEnv.get('undefined-var');
      }).toThrow('Undefined symbol: undefined-var');
    });

    test('should get variable from parent when not found locally', () => {
      parentEnv.define('parent-var', { type: 'string', value: 'hello' });

      expect(env.get('parent-var')).toEqual({ type: 'string', value: 'hello' });
    });

    test('should get variable locally when it exists locally', () => {
      env.define('local-var', { type: 'boolean', value: true });

      expect(env.get('local-var')).toEqual({ type: 'boolean', value: true });
    });
  });

  describe('extend method coverage', () => {
    test('should handle missing arguments by using nil', () => {
      const params = ['a', 'b', 'c'];
      const args: HCValue[] = [
        { type: 'number', value: 1 },
        { type: 'number', value: 2 }

      ];

      const newEnv = env.extend(params, args);

      expect(newEnv.get('a')).toEqual({ type: 'number', value: 1 });
      expect(newEnv.get('b')).toEqual({ type: 'number', value: 2 });
      expect(newEnv.get('c')).toEqual({ type: 'nil', value: null });
    });

    test('should handle completely empty args array', () => {
      const params = ['x', 'y'];
      const args: HCValue[] = [];

      const newEnv = env.extend(params, args);

      expect(newEnv.get('x')).toEqual({ type: 'nil', value: null });
      expect(newEnv.get('y')).toEqual({ type: 'nil', value: null });
    });

    test('should handle falsy but defined values', () => {
      const params = ['zero', 'false-val', 'empty-str'];
      const args: HCValue[] = [
        { type: 'number', value: 0 },
        { type: 'boolean', value: false },
        { type: 'string', value: '' }
      ];

      const newEnv = env.extend(params, args);


      expect(newEnv.get('zero')).toEqual({ type: 'number', value: 0 });
      expect(newEnv.get('false-val')).toEqual({ type: 'boolean', value: false });
      expect(newEnv.get('empty-str')).toEqual({ type: 'string', value: '' });
    });

    test('should create new environment with correct parent chain', () => {
      parentEnv.define('grandparent-var', { type: 'string', value: 'inherited' });

      const newEnv = env.extend(['param'], [{ type: 'number', value: 42 }]);


      expect(newEnv.get('grandparent-var')).toEqual({ type: 'string', value: 'inherited' });
      expect(newEnv.get('param')).toEqual({ type: 'number', value: 42 });
    });
  });

  describe('constructor coverage', () => {
    test('should create environment with null parent', () => {
      const rootEnv = new Environment(null);

      rootEnv.define('test', { type: 'number', value: 123 });
      expect(rootEnv.get('test')).toEqual({ type: 'number', value: 123 });


      expect(() => rootEnv.get('undefined')).toThrow('Undefined symbol: undefined');
    });

    test('should create environment with parent', () => {
      const childEnv = new Environment(parentEnv);

      parentEnv.define('inherited', { type: 'string', value: 'from-parent' });

      expect(childEnv.get('inherited')).toEqual({ type: 'string', value: 'from-parent' });
    });
  });

  describe('define method coverage', () => {
    test('should define variables in local environment', () => {
      env.define('new-var', { type: 'list', value: [{ type: 'number', value: 1 }] });

      expect(env.get('new-var')).toEqual({
        type: 'list',
        value: [{ type: 'number', value: 1 }]
      });
    });

    test('should override parent variable when defined locally', () => {
      parentEnv.define('same-name', { type: 'string', value: 'parent' });
      env.define('same-name', { type: 'string', value: 'child' });

      expect(env.get('same-name')).toEqual({ type: 'string', value: 'child' });
      expect(parentEnv.get('same-name')).toEqual({ type: 'string', value: 'parent' });
    });
  });
});
