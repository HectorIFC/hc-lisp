import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import HcLisp from './hc-lisp';
import { startRepl } from './repl';

export function getVersion(): string {
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.warn('Warning: Unable to read package.json version:', error instanceof Error ? error.message : String(error));
    return 'unknown';
  }
}

export function showBanner(): void {
  const version = getVersion();
  console.log(chalk.cyan(`
    ╔═════════════════════════════════════════╗
    ║       HC-Lisp ${version.padEnd(20)}     ║
    ║     A Modern Lisp Dialect               ║
    ║   Inspired by Clojure & Lispy           ║
    ╚═════════════════════════════════════════╝
  `));
}

export function showEnhancedHelp(): string {
  const version = getVersion();
  let help = chalk.cyan(`
    ╔═════════════════════════════════════════╗
    ║           HC-Lisp ${version.padEnd(20)} ║
    ║     A Modern Lisp Dialect               ║
    ║   Inspired by Clojure & Lispy           ║
    ╚═════════════════════════════════════════╝
  `);

  help += chalk.yellow('\n\nUsage Examples:\n');
  help += chalk.white('  hc-lisp                    ') + chalk.gray('# Start interactive REPL\n');
  help += chalk.white('  hc-lisp script.hclisp      ') + chalk.gray('# Run a script file\n');
  help += chalk.white('  hc-lisp -e "(+ 1 2 3)"     ') + chalk.gray('# Evaluate expression\n');
  help += chalk.white('  hc-lisp --watch script.hclisp') + chalk.gray('# Watch file for changes\n');
  help += chalk.white('  hc-lisp --version          ') + chalk.gray('# Show version\n');
  help += chalk.white('  hc-lisp --help             ') + chalk.gray('# Show this help\n');
  help += chalk.yellow('\nREPL Commands:\n');
  help += chalk.white('  (exit)                     ') + chalk.gray('# Exit REPL\n');
  help += chalk.white('  (help)                     ') + chalk.gray('# Show help in REPL\n');
  help += chalk.white('  (ns my-ns)                 ') + chalk.gray('# Create namespace\n');
  help += chalk.white('  (doc function-name)        ') + chalk.gray('# Show documentation\n');
  help += chalk.yellow('\nNamespace Examples:\n');
  help += chalk.white('  (ns my-app                 ') + chalk.gray('# Create namespace with imports\n');
  help += chalk.white('    (:import [crypto])       \n');
  help += chalk.white('    (:require [fs path]))    \n');
  help += chalk.white('  (crypto/randomUUID)        ') + chalk.gray('# Use imported module\n');
  help += chalk.yellow('\nConfiguration:\n');
  help += chalk.white('  --config <file>            ') + chalk.gray('# Load configuration file\n');
  help += chalk.white('  --verbose                  ') + chalk.gray('# Enable verbose output\n');
  help += chalk.white('  --debug                    ') + chalk.gray('# Enable debug mode\n');
  return help;
}

export function executeExpression(expression: string, options: any): void {
  try {
    if (options.verbose) {
      console.log(chalk.blue('Evaluating:'), chalk.yellow(expression));
    }

    const result = HcLisp.eval(expression);
    const formatted = HcLisp.formatOutput(result);
    console.log(formatted);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red('Error:'), errorMessage);
    process.exit(1);
  }
}

export function executeFile(filePath: string, options: any): void {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(chalk.red('Error:'), `File not found: ${filePath}`);
      process.exit(1);
    }

    if (options.verbose) {
      console.log(chalk.blue('Executing file:'), chalk.yellow(filePath));
    }

    HcLisp.evalFile(filePath);

    if (options.verbose) {
      console.log(chalk.green('File executed successfully'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red('Error:'), errorMessage);
    process.exit(1);
  }
}

export function watchFile(filePath: string, options: any): void {
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red('Error:'), `File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(chalk.blue('Watching:'), chalk.yellow(filePath));
  console.log(chalk.gray('Press Ctrl+C to stop watching'));

  executeFile(filePath, options);

  fs.watchFile(filePath, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log(chalk.blue('\nFile changed, re-executing...'));
      try {
        executeFile(filePath, options);
        console.log(chalk.green('✓ Execution completed'));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red('✗ Execution failed:'), errorMessage);
      }
    }
  });

  process.stdin.resume();
}

export function loadConfig(configPath: string): any {
  try {
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('Error:'), `Configuration file not found: ${configPath}`);
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(chalk.blue('Loaded configuration:'), chalk.yellow(configPath));
    return config;
  } catch (error) {
    console.error(chalk.red('Error loading configuration:'), (error as Error).message);
    process.exit(1);
  }
}

export function startEnhancedRepl(options: any): void {
  if (options.verbose) {
    showBanner();
  }

  console.log(chalk.green('Starting HC-Lisp REPL...'));
  if (options.debug) {
    console.log(chalk.yellow('Debug mode enabled'));
  }

  startRepl();
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('hc-lisp')
    .description('HC-Lisp - A Modern Lisp Dialect')
    .version(getVersion(), '-v, --version', 'display version number')
    .option('-c, --config <file>', 'load configuration file')
    .option('--verbose', 'enable verbose output')
    .option('--debug', 'enable debug mode')
    .option('-e, --eval <expression>', 'evaluate expression and exit')
    .option('-w, --watch', 'watch file for changes and re-execute')
    .argument('[file]', 'HC-Lisp file to execute')
    .helpOption('-h, --help', 'display help information');

  program.addHelpText('after', () => {
    return '\n' + showEnhancedHelp();
  });

  program.action((file: string, options: any) => {
    executeCliAction(file, options, program);
  });

  return program;
}

export function executeCliAction(file: string, options: any, program?: Command): void {
  if (options.config) {
    const config = loadConfig(options.config);
    Object.assign(options, { ...config, ...options });
  }

  if (options.eval) {
    executeExpression(options.eval, options);
  } else if (file) {
    if (options.watch) {
      watchFile(file, options);
    } else {
      executeFile(file, options);
    }
  } else {
    startEnhancedRepl(options);
  }
}

export function setupErrorHandlers(program?: Command): void {
  process.on('uncaughtException', (error) => {
    handleUncaughtException(error, program);
  });

  process.on('unhandledRejection', (reason) => {
    handleUnhandledRejection(reason);
  });
}

function handleUncaughtException(error: Error, program?: Command): void {
  console.error(chalk.red('Uncaught Exception:'), error.message);
  if (program?.opts().debug) {
    console.error(error.stack);
  }
  process.exit(1);
}

function handleUnhandledRejection(reason: unknown): void {
  console.error(chalk.red('Unhandled Rejection:'), reason);
  process.exit(1);
}

export function main(argv?: string[]): void {
  const program = createProgram();
  setupErrorHandlers(program);

  if (argv) {
    program.parse(argv);
  } else {
    program.parse();
  }
}

if (require.main === module) {
  main();
}
