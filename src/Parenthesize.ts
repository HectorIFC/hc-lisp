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

  if (token === '{') {
    const mapEntries: [string, HCValue][] = [];
    while (tokens.length > 0 && tokens[0] !== '}') {
      const keyToken = tokens.shift();
      if (typeof keyToken === 'undefined' || tokens.length === 0) { break; }
      const valueToken = tokens.shift();
      if (typeof valueToken === 'undefined') { break; }
      const key = (keyToken.startsWith(':')) ? keyToken.slice(1) : keyToken;
      let value: HCValue;
      if (valueToken === '(' || valueToken === '[' || valueToken === '{') {
        const nestedTokens = [valueToken];
        let depth = 1;
        let idx = 0;
        const closingToken = valueToken === '(' ? ')' : valueToken === '[' ? ']' : '}';

        while (depth > 0 && idx < tokens.length) {
          const currentToken = tokens[idx];
          nestedTokens.push(currentToken);
          if (currentToken === valueToken) { depth++; }
          if (currentToken === closingToken) { depth--; }
          idx++;
        }

        tokens.splice(0, idx);

        value = parenthesize(nestedTokens, []);
      } else {
        value = categorize(valueToken);
      }
      mapEntries.push([key, value]);
    }
    if (tokens.length > 0 && tokens[0] === '}') { tokens.shift(); }
    const obj: Record<string, HCValue> = {};
    for (const [k, v] of mapEntries) {
      obj[k] = v;
    }
    if (typeof list !== 'undefined') {
      list.push({ type: 'object', value: obj });
    }
    return parenthesize(tokens, list);
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
