import { parenthesize } from "./Parenthesize";
import { tokenizer } from "./Tokenizer";

export function parse(input: string): any {
    return parenthesize(tokenizer(input), undefined);
}
