import HcLisp from './hc-lisp';

export function executeHCFile(filePath: string): void {
  try {
    HcLisp.evalFile(filePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}

export function showUsage(): void {
  console.log('Usage: npm run hclisp <file.hclisp>');
  process.exit(1);
}

export function main(argv: string[] = process.argv): void {
  const filePath = argv[2];

  if (!filePath) {
    showUsage();
    return;
  }

  executeHCFile(filePath);
}

if (require.main === module) {
  main();
}
