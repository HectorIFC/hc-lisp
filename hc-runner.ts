import HcLisp from './hc-lisp';

// Simple HC-Lisp file executor
function executeHCFile(filePath: string): void {
  try {
    console.log(`Executing ${filePath}...\n`);
    HcLisp.evalFile(filePath);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: npx ts-node hc-runner.ts <file.hclisp>');
  process.exit(1);
}

executeHCFile(filePath);
