const world = '🗺️';

export function hello(word: string = world): string {
  return `Hello s${world}! `;
}

console.log(hello('asdasd'));