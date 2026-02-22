
export function tokenizer(input: string): string[] {

  const lines = input.split('\n').map(line => {
    const commentIndex = line.indexOf(';');
    return commentIndex !== -1 ? line.substring(0, commentIndex) : line;
  }).join(' ');

  return lines
    .split('"')
    .map((x, i) => {
      if (i % 2 === 0) {
        return x
          .replace(/\(/g, ' ( ')
          .replace(/\)/g, ' ) ')
          .replace(/\[/g, ' [ ')
          .replace(/\]/g, ' ] ')
          .replace(/\{/g, ' { ')
          .replace(/\}/g, ' } ')
          .replace(/'/g, ' \' ');
      } else {
        return x.replace(/ /g, '!whitespace!');
      }
    })
    .join('"')
    .trim()
    .split(/\s+/)
    .filter(x => x.length > 0)
    .map(x => x.replace(/!whitespace!/g, ' '));
}
