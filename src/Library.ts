import { HCValue } from './Categorize';
import { Environment } from './Context';
import { toJSValue, jsonToHcValue, JSValue, JSONValue } from './Utils';


function isNumber(value: HCValue): value is { type: 'number'; value: number } {
  return value.type === 'number';
}

function isList(value: HCValue): value is { type: 'list'; value: HCValue[] } {
  return value.type === 'list';
}

function isVector(value: HCValue): value is { type: 'vector'; value: HCValue[] } {
  return value.type === 'vector';
}

function isSeq(value: HCValue): value is { type: 'list'; value: HCValue[] } | { type: 'vector'; value: HCValue[] } {
  return isList(value) || isVector(value);
}

const coreFunctions = {

  '+': (...args: HCValue[]): HCValue => {
    const sum = args.reduce((acc, val) => {
      if (!isNumber(val)) { throw new Error('+ requires numbers'); }
      return acc + val.value;
    }, 0);
    return { type: 'number', value: sum };
  },

  '-': (...args: HCValue[]): HCValue => {
    if (args.length === 0) { throw new Error('- requires at least one argument'); }
    if (args.length === 1) {
      if (!isNumber(args[0])) { throw new Error('- requires numbers'); }
      return { type: 'number', value: -args[0].value };
    }
    const first = args[0];
    if (!isNumber(first)) { throw new Error('- requires numbers'); }
    const result = args.slice(1).reduce((acc, val) => {
      if (!isNumber(val)) { throw new Error('- requires numbers'); }
      return acc - val.value;
    }, first.value);
    return { type: 'number', value: result };
  },

  '*': (...args: HCValue[]): HCValue => {
    const product = args.reduce((acc, val) => {
      if (!isNumber(val)) { throw new Error('* requires numbers'); }
      return acc * val.value;
    }, 1);
    return { type: 'number', value: product };
  },

  '/': (...args: HCValue[]): HCValue => {
    if (args.length === 0) { throw new Error('/ requires at least one argument'); }
    const first = args[0];
    if (!isNumber(first)) { throw new Error('/ requires numbers'); }
    const result = args.slice(1).reduce((acc, val) => {
      if (!isNumber(val)) { throw new Error('/ requires numbers'); }
      if (val.value === 0) { throw new Error('Division by zero'); }
      return acc / val.value;
    }, first.value);
    return { type: 'number', value: result };
  },


  '=': (a: HCValue, b: HCValue): HCValue => {
    return { type: 'boolean', value: JSON.stringify(a) === JSON.stringify(b) };
  },

  '<': (a: HCValue, b: HCValue): HCValue => {
    if (!isNumber(a) || !isNumber(b)) { throw new Error('< requires numbers'); }
    return { type: 'boolean', value: a.value < b.value };
  },

  '>': (a: HCValue, b: HCValue): HCValue => {
    if (!isNumber(a) || !isNumber(b)) { throw new Error('> requires numbers'); }
    return { type: 'boolean', value: a.value > b.value };
  },

  '<=': (a: HCValue, b: HCValue): HCValue => {
    if (!isNumber(a) || !isNumber(b)) { throw new Error('<= requires numbers'); }
    return { type: 'boolean', value: a.value <= b.value };
  },

  '>=': (a: HCValue, b: HCValue): HCValue => {
    if (!isNumber(a) || !isNumber(b)) { throw new Error('>= requires numbers'); }
    return { type: 'boolean', value: a.value >= b.value };
  },


  'first': (seq: HCValue): HCValue => {
    if (!isSeq(seq)) { throw new Error('first requires a sequence'); }
    const items = seq.value;
    return items.length > 0 ? items[0] : { type: 'nil', value: null };
  },

  'rest': (seq: HCValue): HCValue => {
    if (!isSeq(seq)) { throw new Error('rest requires a sequence'); }
    const items = seq.value;
    return { type: 'list', value: items.slice(1) };
  },

  'cons': (item: HCValue, seq: HCValue): HCValue => {
    if (!isSeq(seq)) { throw new Error('cons requires a sequence as second argument'); }
    const items = seq.value;
    return { type: 'list', value: [item, ...items] };
  },

  'count': (seq: HCValue): HCValue => {
    if (seq.type === 'nil') { return { type: 'number', value: 0 }; }
    if (!isSeq(seq)) { throw new Error('count requires a sequence'); }
    return { type: 'number', value: seq.value.length };
  },

  'list': (...args: HCValue[]): HCValue => {
    return { type: 'list', value: args };
  },


  'nil?': (value: HCValue): HCValue => {
    return { type: 'boolean', value: value.type === 'nil' };
  },

  'empty?': (seq: HCValue): HCValue => {
    if (seq.type === 'nil') { return { type: 'boolean', value: true }; }
    if (!isSeq(seq)) { return { type: 'boolean', value: false }; }
    return { type: 'boolean', value: seq.value.length === 0 };
  },

  'even?': (n: HCValue): HCValue => {
    if (!isNumber(n)) { throw new Error('even? requires a number'); }
    return { type: 'boolean', value: n.value % 2 === 0 };
  },

  'odd?': (n: HCValue): HCValue => {
    if (!isNumber(n)) { throw new Error('odd? requires a number'); }
    return { type: 'boolean', value: n.value % 2 !== 0 };
  },


  'Math/abs': (n: HCValue): HCValue => {
    if (!isNumber(n)) { throw new Error('Math/abs requires a number'); }
    return { type: 'number', value: Math.abs(n.value) };
  },

  'Math/sqrt': (n: HCValue): HCValue => {
    if (!isNumber(n)) { throw new Error('Math/sqrt requires a number'); }
    if (n.value < 0) { throw new Error('Math/sqrt requires a non-negative number'); }
    return { type: 'number', value: Math.sqrt(n.value) };
  },

  'sqrt': (n: HCValue): HCValue => {
    if (!isNumber(n)) { throw new Error('sqrt requires a number'); }
    if (n.value < 0) { throw new Error('sqrt requires a non-negative number'); }
    return { type: 'number', value: Math.sqrt(n.value) };
  },


  'Date/now': (): HCValue => {
    return { type: 'number', value: Date.now() };
  },

  'Date': (...args: HCValue[]): HCValue => {
    const date = new Date();
    return { type: 'string', value: date.toISOString() };
  },


  'process/cwd': (): HCValue => {
    return { type: 'string', value: process.cwd() };
  },

  'process/env': (key: HCValue): HCValue => {
    if (key.type === 'string') {
      const value = process.env[key.value];
      return value ? { type: 'string', value } : { type: 'nil', value: null };
    }
    throw new Error('process/env requires a string key');
  },


  'str/upper-case': (s: HCValue): HCValue => {
    if (s.type !== 'string') { throw new Error('str/upper-case requires a string'); }
    return { type: 'string', value: s.value.toUpperCase() };
  },

  'str/lower-case': (s: HCValue): HCValue => {
    if (s.type !== 'string') { throw new Error('str/lower-case requires a string'); }
    return { type: 'string', value: s.value.toLowerCase() };
  },

  'str/trim': (s: HCValue): HCValue => {
    if (s.type !== 'string') { throw new Error('str/trim requires a string'); }
    return { type: 'string', value: s.value.trim() };
  },


  'json/stringify': (...args: HCValue[]): HCValue => {
    if (args.length !== 1) {
      throw new Error('json/stringify expects one argument');
    }
    try {
      const jsonValue = toJSValue(args[0]);
      return { type: 'string', value: JSON.stringify(jsonValue) };
    } catch (error) {
      throw new Error(`Error generating JSON: ${(error as Error).message}`);
    }
  },

  'json/parse': (s: HCValue): HCValue => {
    if (s.type !== 'string') {
      throw new Error('json/parse expects a string argument');
    }
    try {
      let jsonStr = s.value;
      if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
        try {
          jsonStr = JSON.parse(jsonStr);
        } catch (e) {}
      }
      const parsed = JSON.parse(jsonStr);
      return jsonToHcValue(parsed);
    } catch (error) {
      throw new Error(`Error parsing JSON: ${(error as Error).message}`);
    }
  },


  'str': (...args: HCValue[]): HCValue => {
    const result = args.map(arg => {
      if (arg.type === 'string') { return arg.value; }
      if (arg.type === 'number') { return String(arg.value); }
      if (arg.type === 'boolean') { return String(arg.value); }
      if (arg.type === 'nil') { return ''; }
      if (arg.type === 'keyword') { return `:${arg.value}`; }

      return JSON.stringify(toJSValue(arg));
    }).join('');
    return { type: 'string', value: result };
  },


  'atom': (initialValue: HCValue): HCValue => {
    const atom = {
      __isAtom: true,
      value: initialValue
    };
    return { type: 'object', value: atom };
  },

  'deref': (atomValue: HCValue): HCValue => {
    if (atomValue.type === 'object' && atomValue.value.__isAtom) {
      return atomValue.value.value;
    }
    throw new Error('deref requires an atom');
  },

  'reset!': (atomValue: HCValue, newValue: HCValue): HCValue => {
    if (atomValue.type === 'object' && atomValue.value.__isAtom) {
      atomValue.value.value = newValue;
      return newValue;
    }
    throw new Error('reset! requires an atom');
  },

  'swap!': (atomValue: HCValue, fn: HCValue, ...args: HCValue[]): HCValue => {
    if (atomValue.type !== 'object' || !atomValue.value.__isAtom) {
      throw new Error('swap! requires an atom as first argument');
    }

    if (fn.type !== 'function' && fn.type !== 'closure') {
      throw new Error('swap! requires a function as second argument');
    }

    const currentValue = atomValue.value.value;
    let newValue: HCValue;

    if (fn.type === 'function') {
      newValue = fn.value(currentValue, ...args);
    } else {
      throw new Error('swap! with closures should be handled by the interpreter');
    }

    atomValue.value.value = newValue;
    return newValue;
  },


  'filter': (fn: HCValue, seq: HCValue): HCValue => {
    if (fn.type !== 'function' && fn.type !== 'closure') {
      throw new Error('filter requires a function as first argument');
    }
    if (!isSeq(seq)) { throw new Error('filter requires a sequence as second argument'); }

    throw new Error('filter with closures should be handled by the interpreter');
  },

  'apply': (fn: HCValue, argsSeq: HCValue): HCValue => {
    if (fn.type !== 'function' && fn.type !== 'closure') {
      throw new Error('apply requires a function as first argument');
    }
    if (!isSeq(argsSeq)) { throw new Error('apply requires a sequence as second argument'); }

    const args = argsSeq.value;
    if (fn.type === 'function') {
      return fn.value(...args);
    } else {
      throw new Error('apply with closures should be handled by the interpreter');
    }
  },

  'assoc': (obj: HCValue, ...keyValuePairs: HCValue[]): HCValue => {
    if (keyValuePairs.length % 2 !== 0) {
      throw new Error('assoc requires an even number of key-value arguments');
    }

    const result: any = {};

    if (obj.type === 'object' && obj.value && typeof obj.value === 'object') {
      Object.assign(result, obj.value);
    }

    if (obj.type === 'vector' && obj.value.length > 0) {
      for (let i = 0; i < obj.value.length; i += 2) {
        const key = obj.value[i];
        const val = obj.value[i + 1];
        if (key.type === 'keyword') {
          result[key.value] = toJSValue(val);
        }
      }
    }

    for (let i = 0; i < keyValuePairs.length; i += 2) {
      const key = keyValuePairs[i];
      const val = keyValuePairs[i + 1];
      if (key.type === 'keyword') {
        result[key.value] = toJSValue(val);
      } else if (key.type === 'string') {
        result[key.value] = toJSValue(val);
      }
    }

    return { type: 'object', value: result };
  },

  'conj': (seq: HCValue, ...items: HCValue[]): HCValue => {
    if (!isSeq(seq)) { throw new Error('conj requires a sequence as first argument'); }
    const newItems = [...seq.value, ...items];
    return { type: seq.type as 'list' | 'vector', value: newItems };
  },

  'max': (...args: HCValue[]): HCValue => {
    if (args.length === 0) { throw new Error('max requires at least one argument'); }

    const numbers = args.map(arg => {
      if (!isNumber(arg)) { throw new Error('max requires numbers'); }
      return arg.value;
    });

    return { type: 'number', value: Math.max(...numbers) };
  },

  'js/parseInt': (str: HCValue): HCValue => {
    if (str.type !== 'string') { throw new Error('js/parseInt requires a string'); }
    const result = parseInt(str.value, 10);
    return { type: 'number', value: result };
  },

  'str/startsWith': (str: HCValue, prefix: HCValue): HCValue => {
    if (str.type !== 'string' || prefix.type !== 'string') {
      throw new Error('str/startsWith requires two strings');
    }
    return { type: 'boolean', value: str.value.startsWith(prefix.value) };
  },

  'str/slice': (str: HCValue, start: HCValue, end?: HCValue): HCValue => {
    if (str.type !== 'string' || start.type !== 'number') {
      throw new Error('str/slice requires a string and a number');
    }
    const sliced = end && end.type === 'number'
      ? str.value.slice(start.value, end.value)
      : str.value.slice(start.value);
    return { type: 'string', value: sliced };
  },


  'println': (...args: HCValue[]): HCValue => {
    const output = args.map(arg => {
      if (arg.type === 'string') { return arg.value; }
      if (arg.type === 'nil') { return 'nil'; }
      if (arg.type === 'keyword') { return `:${arg.value}`; }
      return JSON.stringify(toJSValue(arg));
    }).join(' ');
    console.log(output);
    return { type: 'nil', value: null };
  },

  'print': (...args: HCValue[]): HCValue => {
    const output = args.map(arg => {
      if (arg.type === 'string') { return arg.value; }
      if (arg.type === 'nil') { return 'nil'; }
      if (arg.type === 'keyword') { return `:${arg.value}`; }
      return JSON.stringify(toJSValue(arg));
    }).join(' ');
    process.stdout.write(output);
    return { type: 'nil', value: null };
  },

  'principles': (): HCValue => {
    const principlesText = `
The Principles of HC-Lisp, by Hector Cardoso

1. Clarity is better than clever tricks.
2. Less code is better than unnecessary code.
3. Reading should be as easy as writing.
4. The simple should be simple to express.
5. The complex should be possible, but rare.
6. Structure should guide, not limit.
7. Consistency beats chaotic creativity.
8. Code beauty comes from logic, not decoration.
9. Good surprises are better than bad surprises.
10. Rules should be understood before being broken.
11. Small functions tell big stories.
12. Being explicit is better than leaving it to the compiler's imagination.
13. Data should flow like ideas, not like mazes.
14. Naming well is half the work.
15. One clear solution is better than many confusing ones.
16. Comments tell why, not what.
17. The programmer is human — treat them well.
18. Simplicity does not mean lack of power.
19. The language serves the creator, not the other way around.
20. Code should age well, like fine wine.

Now you know the way. 😉
`;
    console.log(principlesText);
    return { type: 'nil', value: null };
  },

  'family': (): HCValue => {
    const familyStory = `
====================================
The HC-Lisp Family Story ❤️
====================================

🌸 Chapter 1:
Brígida brought love and patience.

👨 Chapter 2:
Hector, driven by dreams and dedication.

👦 Chapter 3:
Heitor arrived to multiply the joy.

💖 Chapter 4:
Together, forming a whole greater than the sum of its parts.

The result of (+ Brígida Hector) is: Heitor

=====================================
           The End ❤️
=====================================
`;
    console.log(familyStory);
    return { type: 'nil', value: null };
  },

  'map': (fn: HCValue, seq: HCValue): HCValue => {
    if (fn.type !== 'function' && fn.type !== 'closure') {
      throw new Error('map requires a function as first argument');
    }
    if (!isSeq(seq)) { throw new Error('map requires a sequence as second argument'); }


    throw new Error('map with closures should be handled by the interpreter');
  },

  'reduce': (fn: HCValue, initial: HCValue, seq: HCValue): HCValue => {
    if (fn.type !== 'function' && fn.type !== 'closure') {
      throw new Error('reduce requires a function as first argument');
    }
    if (!isSeq(seq)) { throw new Error('reduce requires a sequence as third argument'); }


    throw new Error('reduce with closures should be handled by the interpreter');
  },

  'range': (...args: HCValue[]): HCValue => {
    if (args.length === 0 || args.length > 3) {
      throw new Error('range takes 1-3 arguments');
    }

    let start = 0, end = 0, step = 1;

    if (args.length === 1) {
      if (!isNumber(args[0])) { throw new Error('range requires numbers'); }
      end = args[0].value;
    } else if (args.length === 2) {
      if (!isNumber(args[0]) || !isNumber(args[1])) { throw new Error('range requires numbers'); }
      start = args[0].value;
      end = args[1].value;
    } else {
      if (!isNumber(args[0]) || !isNumber(args[1]) || !isNumber(args[2])) {
        throw new Error('range requires numbers');
      }
      start = args[0].value;
      end = args[1].value;
      step = args[2].value;
    }

    const result: HCValue[] = [];
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        result.push({ type: 'number', value: i });
      }
    } else {
      for (let i = start; i > end; i += step) {
        result.push({ type: 'number', value: i });
      }
    }

    return { type: 'list', value: result };
  },

  'get': (obj: HCValue, key: HCValue, defaultValue?: HCValue): HCValue => {
    const notFoundValue = defaultValue || { type: 'nil', value: null };

    if (obj.type === 'vector') {
      for (let i = 0; i < obj.value.length; i += 2) {
        const k = obj.value[i];
        const v = obj.value[i + 1];
        if (k && v && k.type === 'keyword' && key.type === 'keyword' && k.value === key.value) {
          return v;
        }
        if (k && v && k.type === 'string' && key.type === 'string' && k.value === key.value) {
          return v;
        }
      }
      return notFoundValue;
    }

    if (obj.type === 'object' && obj.value && typeof obj.value === 'object') {
      if (key.type === 'keyword') {
        const value = obj.value[key.value];
        return value !== undefined ? jsonToHcValue(value) : notFoundValue;
      }
      if (key.type === 'string') {
        const value = obj.value[key.value];
        return value !== undefined ? jsonToHcValue(value) : notFoundValue;
      }
    }

    return notFoundValue;
  },

  'merge': (...args: HCValue[]): HCValue => {
    const result: any = {};

    for (const arg of args) {
      if (arg.type === 'object' && arg.value && typeof arg.value === 'object') {
        Object.assign(result, arg.value);
      }
    }

    return { type: 'object', value: result };
  }
};

export function createGlobalEnvironment(): Environment {
  const globalEnv = new Environment();

  Object.entries(coreFunctions).forEach(([name, fn]) => {
    globalEnv.define(name, { type: 'function', value: fn });
  });

  globalEnv.define('parseInt', {
    type: 'function',
    value: (str: HCValue, radix?: HCValue): HCValue => {
      const jsStr = toJSValue(str);
      const jsRadix = radix ? toJSValue(radix) : undefined;
      const result = parseInt(jsStr as string, jsRadix as number);
      return { type: 'number', value: result };
    }
  });

  globalEnv.define('JSON', {
    type: 'object',
    value: {
      stringify: (obj: any): HCValue => {
        const jsObj = toJSValue(obj);
        const jsResult = JSON.stringify(jsObj);
        return { type: 'string', value: jsResult };
      },
      parse: (str: any): HCValue => {
        const jsStr = toJSValue(str);
        const jsResult = JSON.parse(jsStr as string);
        return jsonToHcValue(jsResult as JSONValue);
      }
    }
  });

  return globalEnv;
}
