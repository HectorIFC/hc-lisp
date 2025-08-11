import { parenthesize } from './Parenthesize';
import { tokenizer } from './Tokenizer';
import { HCValue } from './Categorize';

export function parse(input: string): HCValue {
  const tokens = tokenizer(input);
  if (tokens.length === 0) {
    return { type: 'nil', value: null };
  }
  return parenthesize(tokens);
}
