export type HCValue =
    | { type: 'number'; value: number }
    | { type: 'string'; value: string }
    | { type: 'boolean'; value: boolean }
    | { type: 'nil'; value: null }
    | { type: 'symbol'; value: string }
    | { type: 'keyword'; value: string }
    | { type: 'list'; value: HCValue[] }
    | { type: 'vector'; value: HCValue[] }
    | { type: 'function'; value: (...args: any[]) => any; arity?: number }
    | { type: 'closure'; params: string[]; body: HCValue; env: any }
    | { type: 'recur'; values: HCValue[] }
    | { type: 'object'; value: any }
    | { type: 'js-object'; jsRef: any; __direct_js__: boolean };

export function categorize(token: string): HCValue {
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(token)) {
    return { type: 'number', value: parseFloat(token) };
  }

  if (token[0] === '"' && token.slice(-1) === '"') {
    return { type: 'string', value: token.slice(1, -1) };
  }

  if (token === 'true') {
    return { type: 'boolean', value: true };
  }

  if (token === 'false') {
    return { type: 'boolean', value: false };
  }

  if (token === 'nil') {
    return { type: 'nil', value: null };
  }

  if (token[0] === ':') {
    return { type: 'keyword', value: token.slice(1) };
  }

  return { type: 'symbol', value: token };
}
