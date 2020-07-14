import { interpret } from "./Interpret";
import { keywords } from "./Keywords";
import { ICategorize } from "./Categorize";

export function interpretList (input: ICategorize[], context: any): any {
    if (input.length > 0 && input[0].value in keywords) {
        const command: string = input[0].value.toString();
        return keywords[command](input, context);
    } else {
      var list = input.map(function(x: any) { return interpret(x, context); });
      if (list[0] instanceof Function) {
        return list[0].apply(undefined, list.slice(1));
      } else {
        return list;
      }
    }
}
