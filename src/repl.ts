import HcLisp from './hc-lisp';
import repl from 'repl';
import chalk from 'chalk';

const HC_LISP_PROMPT = 'hc-lisp> ';

function showReplHelp(): string {
  return chalk.yellow('HC-Lisp REPL Commands:') + '\n' +
    chalk.white('  (exit)') + chalk.gray('                    - Exit REPL') + '\n' +
    chalk.white('  (help)') + chalk.gray('                    - Show this help') + '\n' +
    chalk.white('  (version)') + chalk.gray('                 - Show version') + '\n' +
    chalk.white('  (clear)') + chalk.gray('                   - Clear screen') + '\n' +
    chalk.white('  (env)') + chalk.gray('                     - Show current environment') + '\n' +
    chalk.white('  (ns my-ns)') + chalk.gray('                - Create namespace') + '\n' +
    chalk.white('  (ns)') + chalk.gray('                      - Show current namespace') + '\n' +
    chalk.white('  (doc function-name)') + chalk.gray('       - Show documentation') + '\n' +
    chalk.white('  (source function-name)') + chalk.gray('     - Show source code') + '\n' +
    chalk.yellow('\nUseful Functions:') + '\n' +
    chalk.white('  (+ 1 2 3)') + chalk.gray('                 - Addition') + '\n' +
    chalk.white('  (def x 42)') + chalk.gray('                - Define variable') + '\n' +
    chalk.white('  (defn square [x] (* x x))') + chalk.gray(' - Define function') + '\n' +
    chalk.white('  (map inc [1 2 3])') + chalk.gray('          - Map function over list') + '\n' +
    chalk.yellow('\nNode.js Integration:') + '\n' +
    chalk.white('  (ns my-app (:import [crypto]))') + chalk.gray(' - Import Node module') + '\n' +
    chalk.white('  (crypto/randomUUID)') + chalk.gray('       - Use imported function');
}

function getVersion(): string {
  try {
    const packageJson = require('../package.json');
    return packageJson.version;
  } catch (error) {
    console.error('Error getting version:', error);
    throw error;
  }
}

export function createReplEvaluator() {
  return (cmd: string, context: any, filename: string, callback: any) => {
    try {
      const input = cmd.trim();
      if (input === '') {
        callback(null, undefined);
        return;
      }

      if (input === '(exit)' || input === 'exit') {
        console.log(chalk.green('Goodbye! 👋'));
        process.exit(0);
      }

      if (input === '(help)' || input === 'help') {
        callback(null, showReplHelp());
        return;
      }

      if (input === '(version)') {
        callback(null, chalk.blue(`HC-Lisp version ${getVersion()}`));
        return;
      }

      if (input === '(clear)') {
        console.clear();
        callback(null, undefined);
        return;
      }

      if (input === '(env)') {
        callback(null, chalk.blue('Current environment: global'));
        return;
      }

      const result = HcLisp.eval(input);
      const formatted = HcLisp.formatOutput(result);
      callback(null, formatted);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      callback(null, chalk.red(`Error: ${errorMessage}`));
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
  const version = getVersion();
  console.log(chalk.cyan('╔════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.white('          Welcome to HC-Lisp REPL!              ') + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.white(`       A Modern Lisp Dialect v${version}             `) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.gray('        Inspired by Clojure & Lispy             ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚════════════════════════════════════════════════╝'));
  console.log(chalk.yellow('Type ') + chalk.white('(help)') +
    chalk.yellow(' for available commands or ') + chalk.white('(exit)') + chalk.yellow(' to quit'));
  console.log('');
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
