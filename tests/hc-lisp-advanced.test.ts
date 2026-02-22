import HcLisp from '../src/hc-lisp';

describe('HC-Lisp Advanced Features', () => {
  beforeEach(() => {
    HcLisp.resetContext();
  });

  describe('Mathematical Functions', () => {
    test('should calculate pi using Leibniz series', () => {
      const piFunction = `
        (defn leibniz-pi [n]
          (let [series-sum (reduce + 0
                             (map (fn [i]
                                    (let [term (/ 1 (+ 1 (* 2 i)))]
                                      (if (even? i) term (- term))))
                                  (range n)))]
            (* 4 series-sum)))
      `;

      HcLisp.eval(piFunction);

      const pi100 = HcLisp.eval('(leibniz-pi 100)');
      const pi1000 = HcLisp.eval('(leibniz-pi 1000)');

      expect(pi100.type).toBe('number');
      expect(pi1000.type).toBe('number');

      if (pi100.type === 'number' && pi1000.type === 'number') {
        expect(pi100.value).toBeCloseTo(Math.PI, 1);
        expect(pi1000.value).toBeCloseTo(Math.PI, 2);
      }
    });
  });

  describe('Higher-Order Functions', () => {
    test('should work with map function', () => {
      const result = HcLisp.eval('(map (fn [x] (* x x)) [1 2 3 4])');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 1 },
          { type: 'number', value: 4 },
          { type: 'number', value: 9 },
          { type: 'number', value: 16 }
        ]);
      }
    });

    test('should work with reduce function', () => {
      const sum = HcLisp.eval('(reduce + 0 [1 2 3 4 5])');
      expect(sum).toEqual({ type: 'number', value: 15 });

      const product = HcLisp.eval('(reduce * 1 [1 2 3 4])');
      expect(product).toEqual({ type: 'number', value: 24 });
    });
  });

  describe('Complex Data Structures', () => {
    test('should handle nested vectors', () => {
      const matrix = HcLisp.eval('[[1 2] [3 4]]');
      expect(matrix.type).toBe('vector');
      if (matrix.type === 'vector') {
        expect(matrix.value).toHaveLength(2);
        expect(matrix.value[0].type).toBe('vector');
        expect(matrix.value[1].type).toBe('vector');
      }
    });

    test('should access nested data', () => {
      HcLisp.eval('(def data [[1 2 3] [4 5 6]])');
      const firstRow = HcLisp.eval('(first data)');
      const firstElement = HcLisp.eval('(first (first data))');

      expect(firstElement).toEqual({ type: 'number', value: 1 });
    });
  });

  describe('Error Handling', () => {
    test('should handle division by zero', () => {
      expect(() => HcLisp.eval('(/ 1 0)')).toThrow('Division by zero');
    });

    test('should handle undefined symbols', () => {
      expect(() => HcLisp.eval('undefined-symbol')).toThrow('Undefined symbol');
    });

    test('should handle invalid function calls', () => {
      expect(() => HcLisp.eval('(+ 1 "string")')).toThrow();
    });
  });

  describe('Recursion', () => {
    test('should handle factorial function', () => {
      const factorial = `
        (defn factorial [n]
          (if (<= n 1)
              1
              (* n (factorial (- n 1)))))
      `;

      HcLisp.eval(factorial);

      expect(HcLisp.eval('(factorial 5)')).toEqual({ type: 'number', value: 120 });
      expect(HcLisp.eval('(factorial 0)')).toEqual({ type: 'number', value: 1 });
    });

    test('should handle Fibonacci sequence', () => {
      const fibonacci = `
        (defn fib [n]
          (if (<= n 1)
              n
              (+ (fib (- n 1)) (fib (- n 2)))))
      `;

      HcLisp.eval(fibonacci);

      expect(HcLisp.eval('(fib 6)')).toEqual({ type: 'number', value: 8 });
      expect(HcLisp.eval('(fib 10)')).toEqual({ type: 'number', value: 55 });
    });
  });

  describe('Range Function', () => {
    test('should handle range with single argument', () => {
      const result = HcLisp.eval('(range 5)');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 0 },
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
          { type: 'number', value: 4 }
        ]);
      }
    });

    test('should handle range with start and end', () => {
      const result = HcLisp.eval('(range 2 5)');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
          { type: 'number', value: 4 }
        ]);
      }
    });

    test('should handle range with start, end, and step', () => {
      const result = HcLisp.eval('(range 0 10 2)');
      expect(result.type).toBe('list');
      if (result.type === 'list') {
        expect(result.value).toEqual([
          { type: 'number', value: 0 },
          { type: 'number', value: 2 },
          { type: 'number', value: 4 },
          { type: 'number', value: 6 },
          { type: 'number', value: 8 }
        ]);
      }
    });
  });
});
