import HcLisp from '../hc-lisp';

describe('HC-Lisp Basic Operations', () => {
  beforeEach(() => {
    // Reset the context for each test
    HcLisp.resetContext();
  });

  describe('Arithmetic Operations', () => {
    test('should handle addition correctly', () => {
      const result = HcLisp.eval('(+ 1 2 3)');
      expect(result).toEqual({ type: 'number', value: 6 });
    });

    test('should handle subtraction correctly', () => {
      const result = HcLisp.eval('(- 10 3 2)');
      expect(result).toEqual({ type: 'number', value: 5 });
    });

    test('should handle multiplication correctly', () => {
      const result = HcLisp.eval('(* 2 3 4)');
      expect(result).toEqual({ type: 'number', value: 24 });
    });

    test('should handle division correctly', () => {
      const result = HcLisp.eval('(/ 12 3)');
      expect(result).toEqual({ type: 'number', value: 4 });
    });

    test('should handle square root correctly', () => {
      expect(HcLisp.eval('(sqrt 9)')).toEqual({ type: 'number', value: 3 });
      expect(HcLisp.eval('(sqrt 4)')).toEqual({ type: 'number', value: 2 });
      expect(HcLisp.eval('(sqrt 0)')).toEqual({ type: 'number', value: 0 });

      const result = HcLisp.eval('(sqrt 2)');
      expect(result.type).toBe('number');
      if (result.type === 'number') {
        expect(result.value).toBeCloseTo(Math.sqrt(2), 6);
      }
    });

    test('should throw error for square root of negative number', () => {
      expect(() => HcLisp.eval('(sqrt -1)')).toThrow('sqrt requires a non-negative number');
    });
  });

  describe('Comparison Operations', () => {
    test('should handle less than comparison', () => {
      expect(HcLisp.eval('(< 3 5)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(< 5 3)')).toEqual({ type: 'boolean', value: false });
    });

    test('should handle greater than comparison', () => {
      expect(HcLisp.eval('(> 5 3)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(> 3 5)')).toEqual({ type: 'boolean', value: false });
    });

    test('should handle equality comparison', () => {
      expect(HcLisp.eval('(= 3 3)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(= 3 4)')).toEqual({ type: 'boolean', value: false });
    });

    test('should handle less than or equal', () => {
      expect(HcLisp.eval('(<= 3 5)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(<= 5 5)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(<= 7 5)')).toEqual({ type: 'boolean', value: false });
    });

    test('should handle greater than or equal', () => {
      expect(HcLisp.eval('(>= 5 3)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(>= 5 5)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(>= 3 5)')).toEqual({ type: 'boolean', value: false });
    });
  });

  describe('List Operations', () => {
    test('should get first element of list', () => {
      expect(HcLisp.eval('(first [1 2 3])')).toEqual({ type: 'number', value: 1 });
    });

    test('should return nil for first element of empty list', () => {
      expect(HcLisp.eval('(first [])')).toEqual({ type: 'nil', value: null });
    });

    test('should get rest of list', () => {
      const result = HcLisp.eval('(rest [1 2 3 4])');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
          { type: 'number', value: 4 }
        ]);
      }
    });

    test('should handle cons function', () => {
      const result = HcLisp.eval('(cons 1 [2 3])');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]);
      }
    });

    test('should count elements in list', () => {
      expect(HcLisp.eval('(count [1 2 3 4])')).toEqual({ type: 'number', value: 4 });
      expect(HcLisp.eval('(count [])')).toEqual({ type: 'number', value: 0 });
    });
  });

  describe('Predicates', () => {
    test('should check if number is even', () => {
      expect(HcLisp.eval('(even? 4)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(even? 3)')).toEqual({ type: 'boolean', value: false });
      expect(HcLisp.eval('(even? 0)')).toEqual({ type: 'boolean', value: true });
    });

    test('should check if number is odd', () => {
      expect(HcLisp.eval('(odd? 3)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(odd? 4)')).toEqual({ type: 'boolean', value: false });
    });

    test('should handle nil? predicate', () => {
      expect(HcLisp.eval('(nil? nil)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(nil? 0)')).toEqual({ type: 'boolean', value: false });
      expect(HcLisp.eval('(nil? [])')).toEqual({ type: 'boolean', value: false });
    });

    test('should handle empty? predicate', () => {
      expect(HcLisp.eval('(empty? [])')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(empty? [1])')).toEqual({ type: 'boolean', value: false });
      expect(HcLisp.eval('(empty? nil)')).toEqual({ type: 'boolean', value: true });
    });
  });

  describe('Math Functions', () => {
    test('should handle absolute value', () => {
      expect(HcLisp.eval('(Math/abs -5)')).toEqual({ type: 'number', value: 5 });
      expect(HcLisp.eval('(Math/abs 5)')).toEqual({ type: 'number', value: 5 });
      expect(HcLisp.eval('(Math/abs 0)')).toEqual({ type: 'number', value: 0 });
    });
  });

  describe('Variables and Functions', () => {
    test('should define and use variables', () => {
      HcLisp.eval('(def x 42)');
      expect(HcLisp.eval('x')).toEqual({ type: 'number', value: 42 });
    });

    test('should handle if statements', () => {
      expect(HcLisp.eval('(if true 1 2)')).toEqual({ type: 'number', value: 1 });
      expect(HcLisp.eval('(if false 1 2)')).toEqual({ type: 'number', value: 2 });
    });

    test('should handle let bindings', () => {
      expect(HcLisp.eval('(let [x 10 y 20] (+ x y))')).toEqual({ type: 'number', value: 30 });
    });

    test('should define and call functions', () => {
      HcLisp.eval('(defn square [x] (* x x))');
      expect(HcLisp.eval('(square 5)')).toEqual({ type: 'number', value: 25 });
    });

    test('should handle range function', () => {
      const result = HcLisp.eval('(range 3)');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 0 },
          { type: 'number', value: 1 },
          { type: 'number', value: 2 }
        ]);
      }

      expect(HcLisp.eval('(count (range 5))')).toEqual({ type: 'number', value: 5 });
    });
  });

  describe('I/O Functions', () => {
    test('should handle println function', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const result = HcLisp.eval('(println "Hello, World!")');

      expect(consoleSpy).toHaveBeenCalledWith('Hello, World!');
      expect(result).toEqual({ type: 'nil', value: null });

      consoleSpy.mockRestore();
    });
  });
});
