import HcLisp from '../src/hc-lisp';

describe('HC-Lisp Coverage Tests', () => {
  beforeEach(() => {
    HcLisp.resetContext();
  });

  describe('Special Forms Coverage', () => {
    test('should handle quote special form', () => {
      expect(HcLisp.eval('(quote x)')).toEqual({ type: 'symbol', value: 'x' });
    });

    test('should handle do special form', () => {
      const result = HcLisp.eval('(do (def temp 10) (+ temp 5))');
      expect(result).toEqual({ type: 'number', value: 15 });
    });

    test('should handle defn with simple body', () => {
      expect(() => HcLisp.eval('(defn test [] 42)')).not.toThrow();
      const result = HcLisp.eval('(test)');
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should handle fn (anonymous function)', () => {
      const result = HcLisp.eval('((fn [x] (* x 2)) 5)');
      expect(result).toEqual({ type: 'number', value: 10 });
    });

    test('should handle loop and recur', () => {
      const result = HcLisp.eval(`
                (loop [x 3 acc 1]
                  (if (= x 0)
                    acc
                    (recur (- x 1) (* acc 2))))
            `);
      expect(result).toEqual({ type: 'number', value: 8 });
    });
  });

  describe('Built-in Functions Coverage', () => {
    test('should handle I/O functions', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

      HcLisp.eval('(println "test")');
      expect(consoleSpy).toHaveBeenCalledWith('test');

      HcLisp.eval('(print "test")');
      expect(stdoutSpy).toHaveBeenCalledWith('test');

      consoleSpy.mockRestore();
      stdoutSpy.mockRestore();
    });

    test('should handle string namespace functions', () => {
      expect(HcLisp.eval('(str/upper-case "hello")')).toEqual({
        type: 'string', value: 'HELLO'
      });
      expect(HcLisp.eval('(str/lower-case "HELLO")')).toEqual({
        type: 'string', value: 'hello'
      });
      expect(HcLisp.eval('(str/trim "  hello  ")')).toEqual({
        type: 'string', value: 'hello'
      });
    });

    test('should handle JSON functions', () => {
      expect(HcLisp.eval('(json/stringify [1 2 3])')).toEqual({
        type: 'string', value: '[1,2,3]'
      });
      expect(HcLisp.eval('(json/parse "[1,2,3]")')).toEqual({
        type: 'vector',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });

    test('should handle Date functions', () => {
      const dateNowResult = HcLisp.eval('(Date/now)');
      expect(dateNowResult.type).toBe('number');
      expect(typeof (dateNowResult as any).value).toBe('number');

      const dateResult = HcLisp.eval('(Date)');
      expect(dateResult.type).toBe('string');
      expect(typeof (dateResult as any).value).toBe('string');
    });

    test('should handle process functions', () => {
      const cwdResult = HcLisp.eval('(process/cwd)');
      expect(cwdResult.type).toBe('string');
      expect(typeof (cwdResult as any).value).toBe('string');
    });

    test('should handle Math functions', () => {
      expect(HcLisp.eval('(Math/abs -5)')).toEqual({ type: 'number', value: 5 });
      expect(HcLisp.eval('(Math/sqrt 16)')).toEqual({ type: 'number', value: 4 });
      expect(HcLisp.eval('(sqrt 9)')).toEqual({ type: 'number', value: 3 });
    });
  });

  describe('Error Handling Coverage', () => {
    test('should handle def errors', () => {
      expect(() => HcLisp.eval('(def)')).toThrow('def requires exactly 2 arguments');
      expect(() => HcLisp.eval('(def "not-symbol" 1)')).toThrow('def requires a symbol as first argument');
    });

    test('should handle defn errors', () => {
      expect(() => HcLisp.eval('(defn)')).toThrow('defn requires at least 3 arguments');
      expect(() => HcLisp.eval('(defn "not-symbol" [] 1)')).toThrow('defn requires a symbol as first argument');
      expect(() => HcLisp.eval('(defn test "not-vector" 1)')).toThrow('defn requires a parameter list');
    });

    test('should handle fn errors', () => {
      expect(() => HcLisp.eval('(fn)')).toThrow('fn requires exactly 2 arguments');
      expect(() => HcLisp.eval('(fn "not-vector" 1)')).toThrow('fn requires a parameter list');
    });

    test('should handle let errors', () => {
      expect(() => HcLisp.eval('(let)')).toThrow('let requires at least 2 arguments');
      expect(() => HcLisp.eval('(let "not-vector" 1)')).toThrow('let requires a binding list');
      expect(() => HcLisp.eval('(let [x] x)')).toThrow('let binding list must have an even number of elements');
    });

    test('should handle loop errors', () => {
      expect(() => HcLisp.eval('(loop)')).toThrow('loop requires exactly 2 arguments');
      expect(() => HcLisp.eval('(loop "not-vector" 1)')).toThrow('loop requires a binding list');
      expect(() => HcLisp.eval('(loop [x] x)')).toThrow('loop binding list must have an even number of elements');
    });

    test('should handle if errors', () => {
      expect(() => HcLisp.eval('(if)')).toThrow('if requires 2 or 3 arguments');
      expect(() => HcLisp.eval('(if true 1 2 3)')).toThrow('if requires 2 or 3 arguments');
    });

    test('should handle quote errors', () => {
      expect(() => HcLisp.eval('(quote)')).toThrow('quote requires exactly 1 argument');
      expect(() => HcLisp.eval('(quote 1 2)')).toThrow('quote requires exactly 1 argument');
    });

    test('should handle Math errors', () => {
      expect(() => HcLisp.eval('(Math/sqrt -1)')).toThrow('Math/sqrt requires a non-negative number');
      expect(() => HcLisp.eval('(sqrt -4)')).toThrow('sqrt requires a non-negative number');
    });
  });

  describe('Context and Environment Coverage', () => {
    test('should handle nested environments', () => {
      HcLisp.eval('(def x 10)');
      const result = HcLisp.eval('(let [x 5] (let [y x] y))');
      expect(result).toEqual({ type: 'number', value: 5 });
    });

    test('should handle variable shadowing', () => {
      HcLisp.eval('(def x 10)');
      const result = HcLisp.eval('(let [x 20] x)');
      expect(result).toEqual({ type: 'number', value: 20 });

      const original = HcLisp.eval('x');
      expect(original).toEqual({ type: 'number', value: 10 });
    });

    test('should handle function closures', () => {
      HcLisp.eval(`
                (def make-adder
                  (fn [x]
                    (fn [y] (+ x y))))
            `);

      HcLisp.eval('(def add5 (make-adder 5))');
      const result = HcLisp.eval('(add5 3)');
      expect(result).toEqual({ type: 'number', value: 8 });
    });
  });

  describe('Data Structure Coverage', () => {
    test('should handle empty collections', () => {
      expect(HcLisp.eval('(first [])')).toEqual({ type: 'nil', value: null });
      expect(HcLisp.eval('(rest [])')).toEqual({ type: 'list', value: [] });
      expect(HcLisp.eval('(count [])')).toEqual({ type: 'number', value: 0 });
    });

    test('should handle vector operations', () => {
      const result = HcLisp.eval('(cons 0 [1 2 3])');
      expect(result.type).toBe('list');
      expect((result as any).value).toHaveLength(4);
    });

    test('should handle range function', () => {
      const result1 = HcLisp.eval('(range 3)');
      expect(result1).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 0 },
          { type: 'number', value: 1 },
          { type: 'number', value: 2 }
        ]
      });

      const result2 = HcLisp.eval('(range 2 5)');
      expect(result2).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
          { type: 'number', value: 4 }
        ]
      });

      const result3 = HcLisp.eval('(range 0 10 2)');
      expect(result3).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 0 },
          { type: 'number', value: 2 },
          { type: 'number', value: 4 },
          { type: 'number', value: 6 },
          { type: 'number', value: 8 }
        ]
      });
    });

    test('should handle sequence predicates', () => {
      expect(HcLisp.eval('(nil? nil)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(nil? 5)')).toEqual({ type: 'boolean', value: false });

      expect(HcLisp.eval('(empty? [])')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(empty? [1])')).toEqual({ type: 'boolean', value: false });

      expect(HcLisp.eval('(even? 4)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(even? 3)')).toEqual({ type: 'boolean', value: false });

      expect(HcLisp.eval('(odd? 3)')).toEqual({ type: 'boolean', value: true });
      expect(HcLisp.eval('(odd? 4)')).toEqual({ type: 'boolean', value: false });
    });
  });

  describe('Higher-order functions', () => {
    test('should handle map', () => {
      HcLisp.eval('(defn double [x] (* x 2))');
      const result = HcLisp.eval('(map double [1 2 3])');
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 2 },
          { type: 'number', value: 4 },
          { type: 'number', value: 6 }
        ]
      });
    });

    test('should handle reduce', () => {
      const result = HcLisp.eval('(reduce + 0 [1 2 3 4])');
      expect(result).toEqual({ type: 'number', value: 10 });
    });
  });
});
