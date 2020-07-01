import { Context } from "./Context";
import library from "./Library";
import special from "./Keywords";

export function interpret (input: any, context: Context): any {
    if (context === undefined) {
      return interpret(input, new Context(library, undefined));
    } else if (input instanceof Array) {
      return interpretList(input, context);
    } else if (input.type === "identifier") {
      return context.getScope(input.value);
    } else if (input.type === "number" || input.type === "string") {
      return input.value;
    }
}

function interpretList (input: any, context: any): any {
    if (input.length > 0 && input[0].value in special) {
      return special[input[0].value](input, context);
    } else {
      var list = input.map(function(x: any) { return interpret(x, context); });
      if (list[0] instanceof Function) {
        return list[0].apply(undefined, list.slice(1));
      } else {
        return list;
      }
    }
}