
import { HCValue } from './Categorize';
import { Environment } from './Context';


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

function toJSValue(value: HCValue): any {
  switch (value.type) {
  case 'number':
  case 'string':
  case 'boolean':
    return value.value;
  case 'nil':
    return null;
  case 'symbol':
  case 'keyword':
    return value.value;
  case 'list':
  case 'vector':
    return value.value.map(toJSValue);
  case 'function':
    return value.value;
  case 'closure':
    return '<closure>';
  default:
    return value;
  }
}

function jsonToHcValue(json: any): HCValue {
  if (json === null) {
    return { type: 'nil', value: null };
  }
  if (typeof json === 'boolean') {
    return { type: 'boolean', value: json };
  }
  if (typeof json === 'number') {
    return { type: 'number', value: json };
  }
  if (typeof json === 'string') {
    return { type: 'string', value: json };
  }
  if (Array.isArray(json)) {
    return { type: 'vector', value: json.map(item => jsonToHcValue(item)) };
  }
  if (typeof json === 'object') {

    const pairs: HCValue[] = [];
    for (const [key, value] of Object.entries(json)) {
      pairs.push({ type: 'keyword', value: key });
      pairs.push(jsonToHcValue(value));
    }
    return { type: 'vector', value: pairs };
  }
  return { type: 'string', value: String(json) };
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
      const parsed = JSON.parse(s.value);
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
  }
};

export function createGlobalEnvironment(): Environment {
  const globalEnv = new Environment();


  Object.entries(coreFunctions).forEach(([name, fn]) => {
    globalEnv.define(name, { type: 'function', value: fn });
  });

  return globalEnv;
}
