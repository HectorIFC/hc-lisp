import HcLisp from './hc-lisp';

function executeHCFile(filePath: string): void {
  try {
    HcLisp.evalFile(filePath);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: npm run hclisp <file.hclisp>');
  process.exit(1);
}

executeHCFile(filePath);
