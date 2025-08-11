import HcLisp from './hc-lisp';
import repl from 'repl';

console.log('Welcome to HC-Lisp REPL!');
console.log('A Lisp dialect.');
console.log('Type (exit) or Ctrl+C to quit\n');

repl.start({
  prompt: 'hc-lisp> ',
  eval: (cmd: string, context: any, filename: string, callback: any) => {
    try {
      // Remove trailing newlines and whitespace
      const input = cmd.trim();

      // Skip empty inputs
      if (input === '') {
        callback(null, undefined);
        return;
      }

      // Handle exit command
      if (input === '(exit)' || input === 'exit') {
        process.exit(0);
      }

      const result = HcLisp.eval(input);
      const formatted = HcLisp.formatOutput(result);
      callback(null, formatted);
    } catch (error) {
      callback(null, `Error: ${(error as Error).message}`);
    }
  },
  writer: (output: any) => {
    if (output === undefined) {
      return '';
    }
    return output;
  }
});

