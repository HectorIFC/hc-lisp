import { categorize, HCValue } from './Categorize';

export function parenthesize(tokens: string[], list?: HCValue[]): HCValue {
  if (list === undefined) {
    return parenthesize(tokens, []);
  }

  const token = tokens.shift();

  if (token === undefined) {
    if (list.length === 1) {
      return list[0];
    }
    return { type: 'list', value: list };
  }

  if (token === '(') {
    const subList = parenthesize(tokens, []);
    list.push(subList);
    return parenthesize(tokens, list);
  }

  if (token === ')') {
    return { type: 'list', value: list };
  }

  if (token === '[') {
    const subVector = parenthesize(tokens, []);
    list.push({ type: 'vector', value: (subVector as any).value || [subVector] });
    return parenthesize(tokens, list);
  }

  if (token === ']') {
    return { type: 'vector', value: list };
  }

  if (token === '\'') {
    const quoted = parenthesize(tokens, []);
    list.push({
      type: 'list',
      value: [
        { type: 'symbol', value: 'quote' },
        quoted
      ]
    });
    return parenthesize(tokens, list);
  }

  list.push(categorize(token));
  return parenthesize(tokens, list);
}
