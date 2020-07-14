import { Context } from "./Context";
import library from "./Library";
import { interpretList } from "./InterpretList";

export function interpret (input: any, context: Context | undefined): any {
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
