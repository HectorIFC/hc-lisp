
export function tokenizer(input: string): string[] {
    return input.split('"').map((x, i) => {
       if (i % 2 === 0) { // not in string
         return x.replace(/\(/g, " ( ").replace(/\)/g, " ) ");
       } else { // in string
         return x.replace(/ /g, "!whitespace!");
       }
     })
    .join('"')
    .trim()
    .split(/\s+/)
    .map((x) => {
      return x.replace(/!whitespace!/g, " ");
    });
}
