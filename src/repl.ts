import HcLisp from './hc-lisp';
import repl from 'repl';

const HC_LISP_PROMPT = 'hc-lisp> ';

export function createReplEvaluator() {
  return (cmd: string, context: any, filename: string, callback: any) => {
    try {
      const input = cmd.trim();
      if (input === '') {
        callback(null, undefined);
        return;
      }

      if (input === '(exit)' || input === 'exit') {
        process.exit(0);
      }

      const result = HcLisp.eval(input);
      const formatted = HcLisp.formatOutput(result);
      callback(null, formatted);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      callback(null, `Error: ${errorMessage}`);
    }
  };
}

export function createReplWriter() {
  return (output: any) => {
    if (output === undefined) {
      return '';
    }
    return output;
  };
}

export function showWelcomeMessage(): void {
  console.log('Welcome to HC-Lisp REPL!');
  console.log('A Lisp dialect.');
  console.log('Type (exit) or Ctrl+C to quit\n');
}

export function startRepl(): void {
  showWelcomeMessage();
  repl.start({
    prompt: HC_LISP_PROMPT,
    eval: createReplEvaluator(),
    writer: createReplWriter()
  });
}

if (require.main === module) {
  startRepl();
}
