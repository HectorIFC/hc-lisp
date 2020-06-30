import { categorize } from './Categorize'

export function parenthesize(input: any, list: any): any {
    if (list === undefined) {
        return parenthesize(input, []);
    } else {
        const token = input.shift();
        if (token === undefined) {
            return list.pop();
        } else if (token === "(") {
            list.push(parenthesize(input, []));
            return parenthesize(input, list);
        } else if (token === ")") {
            return list;
        } else {
            return parenthesize(input, list.concat(categorize(token)));
        }
    }
}
